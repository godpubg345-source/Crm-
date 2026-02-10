from django.db.models.signals import post_save
from django.dispatch import receiver
from applications.models import Application
from .models import CommissionClaim
from decimal import Decimal

@receiver(post_save, sender=Application)
def create_commission_claim(sender, instance, created, **kwargs):
    """
    Auto-create Commission Claim when Application is ENROLLED.
    """
    if instance.status == Application.Status.ENROLLED:
        # Check if already exists to avoid duplicates
        if CommissionClaim.objects.filter(application=instance).exists():
            return
            
        university = instance.university
        course = instance.course
        
        # Only proceed if we have necessary data
        if not university or not course:
            return
            
        # Calculate Expected Commission
        # Example: Fee 15000 * (10.00 / 100) = 1500.00
        rate = university.commission_rate or Decimal('0.00')
        fee = course.tuition_fee or Decimal('0.00')
        
        if rate > 0:
            expected_amount = fee * (rate / Decimal('100.00'))
        else:
            expected_amount = Decimal('0.00')
            
        CommissionClaim.objects.create(
            application=instance,
            university=university,
            expected_amount=expected_amount,
            currency=course.currency, # Match course currency
            status=CommissionClaim.Status.PENDING,
            notes=f"Auto-generated from enrollment. Rate: {rate}%"
        )
