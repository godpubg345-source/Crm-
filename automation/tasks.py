from celery import shared_task
from django.utils import timezone

from accounts.models import User
from messaging.models import MessageLog, MessageTemplate
from tasks.models import Task
from .models import AutomationRule, AutomationRun, TaskEscalationPolicy


def _matches_conditions(conditions, context):
    if not conditions:
        return True
    context = context or {}
    for key, expected in conditions.items():
        if context.get(key) != expected:
            return False
    return True


def _resolve_assignee(action, branch):
    user_id = action.get('assign_user_id')
    if user_id:
        return User.objects.filter(id=user_id, is_active=True).first()

    role = action.get('assign_role')
    if role and branch:
        user = User.objects.filter(role=role, branch=branch, is_active=True).first()
        if user:
            return user

    if branch:
        return User.objects.filter(role=User.Role.BRANCH_MANAGER, branch=branch, is_active=True).first()
    return None


def _create_task(action, context, branch):
    title = action.get('title') or 'Automated Task'
    description = action.get('description') or ''
    due_hours = int(action.get('due_hours', 24))
    priority = action.get('priority', Task.Priority.MEDIUM)
    student_id = context.get('student_id')

    assignee = _resolve_assignee(action, branch)
    if not assignee:
        return None

    task = Task.objects.create(
        title=title,
        description=description,
        assigned_to=assignee,
        created_by=None,
        student_id=student_id,
        due_date=timezone.now() + timezone.timedelta(hours=due_hours),
        priority=priority,
        status=Task.Status.PENDING,
        branch=branch,
    )
    return task


def _send_message(action, context, branch):
    channel = action.get('channel') or MessageTemplate.Channel.EMAIL
    recipient = action.get('recipient') or context.get('recipient')
    if not recipient:
        return None

    template_id = action.get('template_id')
    subject = action.get('subject')
    body = action.get('body')
    template = None
    if template_id:
        template = MessageTemplate.objects.filter(id=template_id).first()
        if template:
            subject = subject or template.subject
            body = body or template.body

    return MessageLog.objects.create(
        template=template,
        channel=channel,
        recipient=recipient,
        subject=subject,
        body=body,
        status=MessageLog.Status.QUEUED,
        lead_id=context.get('lead_id'),
        student_id=context.get('student_id'),
        triggered_by=None,
        branch=branch,
    )


@shared_task
def run_automation_rules(trigger, context=None, rule_id=None):
    context = context or {}
    rules = AutomationRule.objects.filter(is_active=True, trigger=trigger)
    if rule_id:
        rules = rules.filter(id=rule_id)

    runs = []
    for rule in rules.order_by('priority'):
        if not _matches_conditions(rule.conditions, context):
            runs.append(AutomationRun.objects.create(rule=rule, status=AutomationRun.Status.SKIPPED, context=context, branch=rule.branch))
            continue

        try:
            for action in rule.actions or []:
                action_type = action.get('type')
                if action_type == 'create_task':
                    _create_task(action, context, rule.branch)
                elif action_type == 'send_message':
                    _send_message(action, context, rule.branch)
            runs.append(AutomationRun.objects.create(rule=rule, status=AutomationRun.Status.SUCCESS, context=context, branch=rule.branch))
        except Exception as exc:
            runs.append(AutomationRun.objects.create(rule=rule, status=AutomationRun.Status.FAILED, context=context, error_message=str(exc), branch=rule.branch))

    return [str(run.id) for run in runs]


@shared_task
def escalate_overdue_tasks():
    now = timezone.now()
    policies = TaskEscalationPolicy.objects.filter(is_active=True)
    created = 0

    for policy in policies:
        overdue_since = now - timezone.timedelta(hours=policy.escalate_after_hours)
        tasks = Task.objects.filter(
            status__in=[Task.Status.PENDING, Task.Status.IN_PROGRESS],
            due_date__lte=overdue_since,
            priority=policy.priority,
        )
        if policy.branch:
            tasks = tasks.filter(branch=policy.branch)

        for task in tasks:
            if Task.objects.filter(
                branch=task.branch,
                title__startswith='Escalation:',
                description__icontains=str(task.id)
            ).exists():
                continue

            assignee = User.objects.filter(
                role=policy.escalate_to_role,
                branch=task.branch,
                is_active=True
            ).first()
            if not assignee:
                continue

            Task.objects.create(
                title=f"Escalation: {task.title}",
                description=f"Escalation of task {task.id}. Original due {task.due_date}.",
                assigned_to=assignee,
                created_by=None,
                student=task.student,
                due_date=now + timezone.timedelta(hours=24),
                priority=Task.Priority.URGENT,
                status=Task.Status.PENDING,
                branch=task.branch,
            )
            created += 1

    return created
