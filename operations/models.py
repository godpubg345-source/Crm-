from django.conf import settings
from django.db import models

from core.models import TenantAwareModel
from students.models import Document


class PartnerContract(TenantAwareModel):
    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        EXPIRED = 'EXPIRED', 'Expired'
        TERMINATED = 'TERMINATED', 'Terminated'

    university = models.ForeignKey(
        'universities.University',
        on_delete=models.CASCADE,
        related_name='partner_contracts'
    )
    contract_number = models.CharField(max_length=100, blank=True, null=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    commission_terms = models.JSONField(default=dict, blank=True)
    notes = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)

    class Meta:
        ordering = ['-start_date']
        indexes = [
            models.Index(fields=['status'], name='idx_contract_status'),
        ]

    def __str__(self):
        return f"{self.university.name} - {self.status}"


class Agent(TenantAwareModel):
    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        INACTIVE = 'INACTIVE', 'Inactive'

    name = models.CharField(max_length=200)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=30, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    parent_agent = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sub_agents'
    )
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class AgentAssignment(TenantAwareModel):
    class Role(models.TextChoices):
        PRIMARY = 'PRIMARY', 'Primary'
        SECONDARY = 'SECONDARY', 'Secondary'

    agent = models.ForeignKey(Agent, on_delete=models.CASCADE, related_name='assignments')
    lead = models.ForeignKey('students.Lead', on_delete=models.SET_NULL, null=True, blank=True)
    student = models.ForeignKey('students.Student', on_delete=models.SET_NULL, null=True, blank=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.PRIMARY)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        target = self.lead or self.student
        return f"{self.agent.name} -> {target}"

    def save(self, *args, **kwargs):
        if not self.branch:
            target = self.lead or self.student
            if target and target.branch:
                self.branch = target.branch
        super().save(*args, **kwargs)


class OCRJob(TenantAwareModel):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        PROCESSING = 'PROCESSING', 'Processing'
        COMPLETED = 'COMPLETED', 'Completed'
        FAILED = 'FAILED', 'Failed'

    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='ocr_jobs')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    provider = models.CharField(max_length=100, blank=True, null=True)
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='ocr_jobs_requested'
    )
    processed_at = models.DateTimeField(null=True, blank=True)
    raw_text = models.TextField(blank=True, null=True)
    extracted_data = models.JSONField(default=dict, blank=True)
    classification_label = models.CharField(max_length=100, blank=True, null=True)
    confidence = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    error_message = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"OCR {self.document.file_name} - {self.status}"

    def save(self, *args, **kwargs):
        if self.document and not self.branch:
            self.branch = self.document.branch
        super().save(*args, **kwargs)
