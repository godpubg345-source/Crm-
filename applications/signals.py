from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Application
from finance.services import CommissionService

@receiver(post_save, sender=Application)
def handle_application_commission(sender, instance, created, **kwargs):
    """
    Triggers commission calculation when an application status changes to ENROLLED.
    This ensures that revenue is recognized as soon as a student is confirmed.
    """
    if instance.status == Application.Status.ENROLLED:
        # Trigger the automated calculation service
        CommissionService.calculate_commission(instance)
