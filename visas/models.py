import uuid
from django.db import models
from core.models import TenantAwareModel
from django.utils import timezone


class VisaCase(TenantAwareModel):
    """
    Represents a UK Student Visa application.
    Linked to a specific university application with CAS.
    """
    
    class Status(models.TextChoices):
        CAS_RECEIVED = 'CAS_RECEIVED', 'CAS Received'
        DOCS_PREPARED = 'DOCS_PREPARED', 'Documents Prepared'
        IHS_PAID = 'IHS_PAID', 'IHS Paid'
        VFS_SCHEDULED = 'VFS_SCHEDULED', 'VFS Appointment Scheduled'
        BIOMETRICS_DONE = 'BIOMETRICS_DONE', 'Biometrics Done'
        VISA_SUBMITTED = 'VISA_SUBMITTED', 'Visa Submitted'
        ADDITIONAL_DOCS = 'ADDITIONAL_DOCS', 'Additional Documents Requested'
        VISA_APPROVED = 'VISA_APPROVED', 'Visa Approved'
        VISA_REJECTED = 'VISA_REJECTED', 'Visa Rejected'
        PASSPORT_COLLECTED = 'PASSPORT_COLLECTED', 'Passport Collected'
        APPEAL = 'APPEAL', 'Under Appeal'
    
    class DecisionStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'
    
    # Fields handled by TenantAwareModel: id, branch, is_deleted, created_at, updated_at
    
    
    # Student & Application link
    student = models.ForeignKey(
        'students.Student',
        on_delete=models.CASCADE,
        related_name='visa_cases'
    )
    application = models.OneToOneField(
        'applications.Application',
        on_delete=models.CASCADE,
        related_name='visa_case'
    )
    
    # Status tracking
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.CAS_RECEIVED)
    decision_status = models.CharField(
        max_length=20,
        choices=DecisionStatus.choices,
        default=DecisionStatus.PENDING
    )
    
    # VFS & Biometrics
    vfs_date = models.DateTimeField(null=True, blank=True, help_text="VFS appointment date and time")
    vfs_location = models.CharField(max_length=200, blank=True, null=True)
    biometric_done = models.BooleanField(default=False)
    
    # TB Test (required for some countries)
    tb_test_done = models.BooleanField(default=False)
    tb_test_date = models.DateField(null=True, blank=True)
    
    # Payments
    ihs_reference = models.CharField(max_length=50, blank=True, null=True, help_text="Immigration Health Surcharge reference")
    ihs_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    visa_fee_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Visa decision
    submission_date = models.DateField(null=True, blank=True)
    decision_date = models.DateField(null=True, blank=True)
    visa_start_date = models.DateField(null=True, blank=True)
    visa_end_date = models.DateField(null=True, blank=True)
    
    # Refusal handling
    refusal_reason = models.TextField(blank=True, null=True)
    appeal_submitted = models.BooleanField(default=False)
    appeal_date = models.DateField(null=True, blank=True)
    
    # Notes
    notes = models.TextField(blank=True, null=True)
    
    # Timestamps
    
    # Timestamps (Handled by TenantAwareModel)
    
    class Meta:
        verbose_name = "Visa Case"
        verbose_name_plural = "Visa Cases"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Visa: {self.student.student_code} ({self.get_status_display()})"


class VisaMilestone(TenantAwareModel):
    """
    Timeline milestones for CAS/Visa tracking.
    """

    class Category(models.TextChoices):
        CAS = 'CAS', 'CAS'
        VISA = 'VISA', 'Visa'
        IHS = 'IHS', 'IHS'
        VFS = 'VFS', 'VFS'
        BIOMETRICS = 'BIOMETRICS', 'Biometrics'
        OTHER = 'OTHER', 'Other'

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        COMPLETED = 'COMPLETED', 'Completed'
        OVERDUE = 'OVERDUE', 'Overdue'
        SKIPPED = 'SKIPPED', 'Skipped'

    visa_case = models.ForeignKey(VisaCase, on_delete=models.CASCADE, related_name='milestones')
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.OTHER)
    due_date = models.DateField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    notes = models.TextField(blank=True, null=True)
    alerted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['due_date']
        indexes = [
            models.Index(fields=['status'], name='idx_visa_milestone_status'),
        ]

    def save(self, *args, **kwargs):
        if self.visa_case and not self.branch:
            self.branch = self.visa_case.student.branch
        if self.completed_at:
            self.status = self.Status.COMPLETED
        elif self.due_date and self.status == self.Status.PENDING:
            if timezone.now().date() > self.due_date:
                self.status = self.Status.OVERDUE
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.visa_case.student.student_code} - {self.title}"
