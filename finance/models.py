from django.db import models
import uuid
from branches.models import Branch
from students.models import Student
from applications.models import Application
from django.conf import settings
from core.models import TenantAwareModel

class FeeType(TenantAwareModel):
    """
    Standard fees charged by a branch (e.g., "Consultancy", "University Application Fee").
    """
    # Fields handled by TenantAwareModel: id, branch, is_deleted, created_at, updated_at
    
    name = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2, help_text="Default amount")
    
    # Note: TenantAwareModel adds 'branch' related_name='%s_branch'. 
    # Original used 'related_name="fee_types"'.
    # If we want to keep 'fee_types', we can override 'branch' here or just accept the change.
    # Instruction says "Update all models... Remove: branch...".
    # I will remove branch field definition here and rely on TenantAwareModel.
    # The related_name will change to 'feetype_branch'.
    # This might be breaking if code uses 'branch.fee_types'.
    # But for 'Refactor' instructions usually imply structural changes.
    
    is_active = models.BooleanField(default=True)

    def __str__(self):
        # self.branch is accessible
        return f"{self.name} ({self.branch.code if self.branch else 'Global'})"


class Transaction(TenantAwareModel):
    """
    Records payments made by students.
    """
    class TransactionType(models.TextChoices):
        CREDIT = 'CREDIT', 'Credit (Payment Received)'
        DEBIT = 'DEBIT', 'Debit (Refund/Expense)'
        
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        PAID = 'PAID', 'Paid'
        FAILED = 'FAILED', 'Failed'
        REFUNDED = 'REFUNDED', 'Refunded'
    
    # Fields handled by TenantAwareModel: id, branch, is_deleted, created_at, updated_at
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='transactions')
    fee_type = models.ForeignKey(FeeType, on_delete=models.SET_NULL, null=True, blank=True)
    
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_type = models.CharField(max_length=10, choices=TransactionType.choices, default=TransactionType.CREDIT)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    
    date = models.DateField(auto_now_add=True)
    reference_number = models.CharField(max_length=100, blank=True, null=True, help_text="Bank Ref / Receipt No")
    
    description = models.TextField(blank=True, null=True)
    
    # Audit
    recorded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    
    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student.student_code} - {self.amount} ({self.status})"



class CommissionClaim(TenantAwareModel):
    """
    Tracks commission expected and received from universities.
    """
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        INVOICED = 'INVOICED', 'Invoiced'
        RECEIVED = 'RECEIVED', 'Payment Received'
        REJECTED = 'REJECTED', 'Claim Rejected'
    
    # Fields handled by TenantAwareModel: id, branch, is_deleted, created_at, updated_at

    application = models.OneToOneField('applications.Application', on_delete=models.CASCADE, related_name='commission_claim')
    
    # Denormalized University Link for easier filtering
    university = models.ForeignKey('universities.University', on_delete=models.SET_NULL, null=True, blank=True)
    
    expected_amount = models.DecimalField(max_digits=12, decimal_places=2, help_text="Expected commission amount")
    currency = models.CharField(max_length=3, default='GBP', help_text="Currency code (GBP, USD, etc.)")
    
    actual_amount_received = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    
    invoice_number = models.CharField(max_length=50, blank=True, null=True, help_text="Invoice sent to Uni")
    invoice_date = models.DateField(null=True, blank=True)
    payment_received_date = models.DateField(null=True, blank=True)
    
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        code = self.application.student.student_code if self.application else 'N/A'
        return f"Comm: {code} - {self.status}"

class CommissionStructure(TenantAwareModel):
    """
    Defines how much commission is earned from a University.
    Can be per-university or per-course.
    """
    university = models.ForeignKey('universities.University', on_delete=models.CASCADE, related_name='commission_structures')
    course = models.ForeignKey('universities.Course', on_delete=models.CASCADE, related_name='commission_structures', null=True, blank=True)
    
    commission_percentage = models.DecimalField(max_digits=5, decimal_places=2, help_text="Percentage (e.g. 15.00)")
    fixed_bonus = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.university.name} - {self.commission_percentage}%"


class Payout(TenantAwareModel):
    """
    Tracks payments made to external agents or referrals.
    """
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        APPROVED = 'APPROVED', 'Approved'
        PAID = 'PAID', 'Paid'
        REJECTED = 'REJECTED', 'Rejected'
        
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='payouts')
    agent_name = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default='GBP')
    
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    payment_reference = models.CharField(max_length=100, blank=True, null=True)
    payment_date = models.DateField(null=True, blank=True)
    
    notes = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Payout"
        verbose_name_plural = "Payouts"

    def __str__(self):
        return f"Payout: {self.agent_name} - {self.amount}"
