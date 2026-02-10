from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from django.db.models import Q
from datetime import timedelta
from applications.models import Application
from .models import Task, TaskTemplate
from accounts.models import User

@receiver(post_save, sender=Application)
def auto_generate_tasks(sender, instance, created, **kwargs):
    """
    Automatically generate tasks based on Application status and country.
    """
    # Determine the trigger status
    # If the application was just created, we might want to trigger 'NEW' or 'DRAFT' tasks.
    # Otherwise, we check if the status changed (though post_save doesn't directly tell us the old status
    # without some tricks, but for this CRM, we can trigger based on current status if no task exists yet).
    
    current_status = instance.status
    country = instance.university.country if instance.university else None
    
    # Find active templates matching country and current status
    templates = TaskTemplate.objects.filter(is_active=True).filter(
        Q(country=country) | Q(country__isnull=True) | Q(country='')
    ).filter(trigger_status=current_status)
    
    # We also want to trigger 'Global' templates with no specific status on creation
    if created:
        initial_templates = TaskTemplate.objects.filter(is_active=True).filter(
            Q(country=country) | Q(country__isnull=True) | Q(country='')
        ).filter(Q(trigger_status__isnull=True) | Q(trigger_status=''))
        templates = templates | initial_templates

    for template in templates:
        # Check if this task already exists for this student to avoid duplicates
        if not Task.objects.filter(student=instance.student, title=template.title).exists():
            # Determine assignee: Counselor or Manager
            assignee = instance.student.counselor
            if not assignee and instance.branch:
                # Fallback to any branch manager
                assignee = User.objects.filter(branch=instance.branch, role=User.Role.BRANCH_MANAGER).first()
            
            if not assignee:
                # Final fallback to whoever created the app if they have a role
                assignee = getattr(instance, 'created_by', None)

            if assignee:
                Task.objects.create(
                    title=template.title,
                    description=template.description,
                    category=template.category,
                    assigned_to=assignee,
                    created_by=assignee, # Can be system user later if needed
                    student=instance.student,
                    due_date=timezone.now() + timedelta(days=template.due_days_offset),
                    branch=instance.branch,
                    priority=Task.Priority.MEDIUM
                )
