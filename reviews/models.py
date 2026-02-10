from django.conf import settings
from django.db import models
from django.utils import timezone

from core.models import TenantAwareModel
from students.models import Document


class ReviewSLA(TenantAwareModel):
    """SLA targets per document category."""

    category = models.CharField(max_length=20, choices=Document.Category.choices)
    target_hours = models.PositiveIntegerField(default=48)
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = "Review SLA"
        verbose_name_plural = "Review SLAs"
        ordering = ['category']
        indexes = [
            models.Index(fields=['category'], name='idx_review_sla_category'),
        ]

    def __str__(self):
        return f"{self.get_category_display()} - {self.target_hours}h"


class DocumentReview(TenantAwareModel):
    """Review workflow for uploaded documents and SOPs."""

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        ASSIGNED = 'ASSIGNED', 'Assigned'
        IN_REVIEW = 'IN_REVIEW', 'In Review'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'

    class SLAStatus(models.TextChoices):
        ON_TIME = 'ON_TIME', 'On Time'
        LATE = 'LATE', 'Late'
        UNKNOWN = 'UNKNOWN', 'Unknown'

    document = models.ForeignKey(
        Document,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='document_reviews'
    )

    assigned_at = models.DateTimeField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    due_at = models.DateTimeField(null=True, blank=True)

    sla_minutes = models.PositiveIntegerField(null=True, blank=True)
    sla_status = models.CharField(max_length=10, choices=SLAStatus.choices, default=SLAStatus.UNKNOWN)

    notes = models.TextField(blank=True, null=True)
    rejection_reason = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = "Document Review"
        verbose_name_plural = "Document Reviews"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status'], name='idx_doc_review_status'),
            models.Index(fields=['reviewer'], name='idx_doc_review_reviewer'),
        ]

    def save(self, *args, **kwargs):
        if self.document and not self.branch:
            self.branch = self.document.branch
        if self.reviewer and not self.assigned_at:
            self.assigned_at = timezone.now()
        if self.completed_at and self.assigned_at:
            duration = self.completed_at - self.assigned_at
            self.sla_minutes = max(int(duration.total_seconds() / 60), 0)
        if self.completed_at and self.due_at:
            self.sla_status = self.SLAStatus.ON_TIME if self.completed_at <= self.due_at else self.SLAStatus.LATE
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.document.file_name} - {self.get_status_display()}"
