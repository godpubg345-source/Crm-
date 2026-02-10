from django.conf import settings
from django.db import models
from django.utils import timezone

from core.models import TenantAwareModel


class RetentionPolicy(TenantAwareModel):
    class EntityType(models.TextChoices):
        LEAD = 'LEAD', 'Lead'
        STUDENT = 'STUDENT', 'Student'
        DOCUMENT = 'DOCUMENT', 'Document'

    class Action(models.TextChoices):
        ANONYMIZE = 'ANONYMIZE', 'Anonymize'
        DELETE = 'DELETE', 'Delete'

    entity_type = models.CharField(max_length=20, choices=EntityType.choices)
    retention_days = models.PositiveIntegerField(default=365)
    action = models.CharField(max_length=20, choices=Action.choices, default=Action.ANONYMIZE)
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['entity_type']

    def __str__(self):
        return f"{self.entity_type} - {self.retention_days} days"


class DataDeletionRequest(TenantAwareModel):
    class RequestType(models.TextChoices):
        ANONYMIZE = 'ANONYMIZE', 'Anonymize'
        DELETE = 'DELETE', 'Delete'

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'
        COMPLETED = 'COMPLETED', 'Completed'

    request_type = models.CharField(max_length=20, choices=RequestType.choices)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)

    lead = models.ForeignKey('students.Lead', on_delete=models.SET_NULL, null=True, blank=True)
    student = models.ForeignKey('students.Student', on_delete=models.SET_NULL, null=True, blank=True)
    document = models.ForeignKey('students.Document', on_delete=models.SET_NULL, null=True, blank=True)

    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='data_deletion_requests'
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='data_deletion_approvals'
    )
    completed_at = models.DateTimeField(null=True, blank=True)
    reason = models.TextField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.request_type} - {self.status}"

    def target(self):
        return self.lead or self.student or self.document


class AccessReviewCycle(TenantAwareModel):
    class Status(models.TextChoices):
        PLANNED = 'PLANNED', 'Planned'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        COMPLETED = 'COMPLETED', 'Completed'

    name = models.CharField(max_length=200)
    period_start = models.DateField()
    period_end = models.DateField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PLANNED)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='access_review_cycles'
    )

    class Meta:
        ordering = ['-period_start']

    def __str__(self):
        return self.name


class AccessReviewItem(TenantAwareModel):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        APPROVED = 'APPROVED', 'Approved'
        REVOKE = 'REVOKE', 'Revoke Access'
        REMEDIATED = 'REMEDIATED', 'Remediated'

    cycle = models.ForeignKey(AccessReviewCycle, on_delete=models.CASCADE, related_name='items')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    findings = models.JSONField(default=dict, blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='access_review_items_reviewed'
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['cycle', 'status'], name='idx_access_cycle_status'),
        ]

    def __str__(self):
        return f"{self.cycle.name} - {self.user.email}"

    def mark_reviewed(self, status, reviewer):
        self.status = status
        self.reviewed_by = reviewer
        self.reviewed_at = timezone.now()
        self.save(update_fields=['status', 'reviewed_by', 'reviewed_at', 'updated_at'])
