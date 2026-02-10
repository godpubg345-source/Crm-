from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from .models import User, EmployeeDossier, EmployeeAuditLog
import logging

logger = logging.getLogger(__name__)

def log_change(target_user, field_name, old_value, new_value, actor=None, event_type='UPDATE'):
    """Helper to create audit log entry."""
    if str(old_value) != str(new_value):
        EmployeeAuditLog.objects.create(
            actor=actor,
            target_user=target_user,
            field_name=field_name,
            old_value=str(old_value) if old_value is not None else None,
            new_value=str(new_value) if new_value is not None else None,
            event_type=event_type
        )

@receiver(pre_save, sender=User)
def audit_user_changes(sender, instance, **kwargs):
    if instance.pk:
        try:
            old_instance = User.objects.get(pk=instance.pk)
            # Fields to audit
            fields_to_audit = ['role', 'branch', 'is_active', 'email']
            for field in fields_to_audit:
                old_val = getattr(old_instance, field)
                new_val = getattr(instance, field)
                if old_val != new_val:
                    # In a real app, actor would come from thread-local middleware
                    # For now, we log it with actor=None (SYSTEM)
                    log_change(instance, field, old_val, new_val)
        except User.DoesNotExist:
            pass

@receiver(pre_save, sender=EmployeeDossier)
def audit_dossier_changes(sender, instance, **kwargs):
    if instance.pk:
        try:
            old_instance = EmployeeDossier.objects.get(pk=instance.pk)
            fields_to_audit = ['base_salary', 'contract_type', 'probation_end_date']
            for field in fields_to_audit:
                old_val = getattr(old_instance, field)
                new_val = getattr(instance, field)
                if old_val != new_val:
                    log_change(instance.user, f"dossier.{field}", old_val, new_val)
        except EmployeeDossier.DoesNotExist:
            pass

@receiver(post_save, sender=User)
def ensure_performance_and_dossier(sender, instance, created, **kwargs):
    """Ensure every user has a performance and dossier record."""
    if created:
        from .models import EmployeePerformance, EmployeeDossier
        EmployeePerformance.objects.get_or_create(user=instance)
        EmployeeDossier.objects.get_or_create(user=instance)
        logger.info(f"Initialized Performance and Dossier for {instance.email}")
