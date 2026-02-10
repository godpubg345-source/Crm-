from django.db import transaction
from django.utils import timezone
from django.db.models import Q
from rest_framework.exceptions import ValidationError
from tasks.models import Task, TaskTemplate
from .models import (
    Application,
    ApplicationStatusLog,
    ApplicationChecklistTemplate,
    ApplicationChecklistItem
)

class ApplicationService:
    """
    Service layer for Application business logic.
    Decouples complex operations from ViewSets.
    """

    @staticmethod
    @transaction.atomic
    def perform_transition(application: Application, user, data: dict):
        """
        Handle atomic state transition with audit logging.
        """
        to_status = data.get('to_status')
        note = data.get('note', '')
        
        if not to_status:
            raise ValidationError({'to_status': 'This field is required.'})
        
        if to_status not in Application.Status.values:
            raise ValidationError({'to_status': 'Invalid status.'})
        
        # Capture old status
        from_status = application.status
        
        # Validation: Check if status is actually changing
        if from_status == to_status:
             # Depending on requirements, we might want to allow updates without status change here?
             # For now, let's assuming "transition" implies a change, or at least a significant update.
             # But the view logic returned 400. Let's keep it consistent but maybe cleaner.
             raise ValidationError({'warning': 'Status is same as current status.'})

        # Update fields dynamically based on payload
        # In a real service, we might have strict type checking or DTOs.
        if 'submission_date' in data:
            application.submission_date = data['submission_date']
        if 'offer_type' in data:
            application.offer_type = data['offer_type']
        if 'offer_conditions' in data:
            application.offer_conditions = data['offer_conditions']
        if 'cas_number' in data:
            application.cas_number = data['cas_number']
        
        # Apply Status Change
        application.status = to_status
        application.last_activity_at = timezone.now()
        application.save()
        
        # automation: Create VisaCase on CAS_RECEIVED
        if to_status == Application.Status.CAS_RECEIVED:
            from visas.models import VisaCase
            if not VisaCase.objects.filter(application=application).exists():
                VisaCase.objects.create(
                    student=application.student,
                    application=application,
                    branch=application.branch,
                    status=VisaCase.Status.CAS_RECEIVED
                )

        # automation: Create tasks based on TaskTemplate
        ApplicationService._generate_tasks_for_status(application, user, to_status)

        # Create Log
        ApplicationStatusLog.objects.create(
            application=application,
            from_status=from_status,
            to_status=to_status,
            changed_by=user,
            note=note,
            metadata=data  # Log full payload for audit
        )
        
        return application

    @staticmethod
    def initialize_checklist(application: Application):
        """
        Generate checklist items from templates based on university/country/level.
        """
        templates = ApplicationChecklistTemplate.objects.filter(is_active=True)
        templates = templates.filter(Q(branch=application.branch) | Q(branch__isnull=True))

        if application.university:
            templates = templates.filter(
                Q(university=application.university) | Q(university__isnull=True)
            )
            templates = templates.filter(
                Q(country=application.university.country) | Q(country__isnull=True) | Q(country='')
            )
        else:
            templates = templates.filter(Q(university__isnull=True))

        if application.course and application.course.level:
            templates = templates.filter(
                Q(level=application.course.level) | Q(level__isnull=True) | Q(level='')
            )

        items = []
        for template in templates.order_by('sort_order', 'title'):
            due_date = None
            if template.due_days_offset is not None:
                due_date = (timezone.now() + timezone.timedelta(days=template.due_days_offset)).date()
            items.append(ApplicationChecklistItem(
                application=application,
                branch=application.branch,
                template=template,
                title=template.title,
                category=template.category,
                is_required=template.is_required,
                due_date=due_date
            ))

        if items:
            ApplicationChecklistItem.objects.bulk_create(items)

    @staticmethod
    def _generate_tasks_for_status(application: Application, user, to_status: str):
        """
        Create tasks based on TaskTemplate rules.
        """
        templates = TaskTemplate.objects.filter(is_active=True, trigger_status=to_status)
        if not templates.exists():
            return

        assignee = application.assigned_to or application.student.counselor or user
        for template in templates:
            due_date = timezone.now() + timezone.timedelta(days=template.due_days_offset or 7)
            Task.objects.get_or_create(
                title=template.title,
                application=application,
                defaults={
                    'description': template.description,
                    'assigned_to': assignee,
                    'created_by': user,
                    'student': application.student,
                    'branch': application.branch,
                    'due_date': due_date,
                    'priority': Task.Priority.MEDIUM,
                    'category': template.category or Task.Category.ADMISSION,
                    'status': Task.Status.PENDING,
                }
            )
