from django.conf import settings
from django.db import models

from core.models import TenantAwareModel
from accounts.models import User
from tasks.models import Task


class AutomationRule(TenantAwareModel):
    """Rule-based automation for tasks and alerts."""

    class Trigger(models.TextChoices):
        LEAD_CREATED = 'LEAD_CREATED', 'Lead Created'
        STUDENT_CREATED = 'STUDENT_CREATED', 'Student Created'
        APPLICATION_STATUS_CHANGED = 'APPLICATION_STATUS_CHANGED', 'Application Status Changed'
        VISA_STATUS_CHANGED = 'VISA_STATUS_CHANGED', 'Visa Status Changed'
        TASK_OVERDUE = 'TASK_OVERDUE', 'Task Overdue'
        DOCUMENT_UPLOADED = 'DOCUMENT_UPLOADED', 'Document Uploaded'

    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    trigger = models.CharField(max_length=40, choices=Trigger.choices)
    conditions = models.JSONField(default=dict, blank=True, help_text="Conditions JSON for evaluation")
    actions = models.JSONField(default=list, blank=True, help_text="Actions JSON (e.g. create task, send message)")
    priority = models.PositiveIntegerField(default=100)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='automation_rules_created'
    )

    class Meta:
        ordering = ['priority', '-created_at']

    def __str__(self):
        return f"{self.name} ({self.trigger})"


class AutomationRun(TenantAwareModel):
    """Execution log for automation rules."""

    class Status(models.TextChoices):
        SUCCESS = 'SUCCESS', 'Success'
        FAILED = 'FAILED', 'Failed'
        SKIPPED = 'SKIPPED', 'Skipped'

    rule = models.ForeignKey(AutomationRule, on_delete=models.CASCADE, related_name='runs')
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.SUCCESS)
    context = models.JSONField(default=dict, blank=True)
    error_message = models.TextField(blank=True, null=True)
    ran_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-ran_at']

    def __str__(self):
        return f"{self.rule.name} - {self.status}"

    def save(self, *args, **kwargs):
        if self.rule and not self.branch:
            self.branch = self.rule.branch
        super().save(*args, **kwargs)


class TaskEscalationPolicy(TenantAwareModel):
    """Escalation policies for overdue tasks."""

    class Channel(models.TextChoices):
        EMAIL = 'EMAIL', 'Email'
        SMS = 'SMS', 'SMS'
        WHATSAPP = 'WHATSAPP', 'WhatsApp'
        IN_APP = 'IN_APP', 'In-App'

    name = models.CharField(max_length=200)
    priority = models.CharField(max_length=10, choices=Task.Priority.choices, default=Task.Priority.HIGH)
    escalate_after_hours = models.PositiveIntegerField(default=24)
    escalate_to_role = models.CharField(max_length=20, choices=User.Role.choices, default=User.Role.BRANCH_MANAGER)
    notify_channel = models.CharField(max_length=20, choices=Channel.choices, default=Channel.IN_APP)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['priority', 'escalate_after_hours']

    def __str__(self):
        return f"{self.name} ({self.priority})"
