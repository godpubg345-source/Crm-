from django.conf import settings
from django.db import models
from django.utils import timezone

from core.models import TenantAwareModel


class Campaign(TenantAwareModel):
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        ACTIVE = 'ACTIVE', 'Active'
        PAUSED = 'PAUSED', 'Paused'
        ARCHIVED = 'ARCHIVED', 'Archived'

    class Channel(models.TextChoices):
        EMAIL = 'EMAIL', 'Email'
        SMS = 'SMS', 'SMS'
        WHATSAPP = 'WHATSAPP', 'WhatsApp'
        MULTI = 'MULTI', 'Multi-channel'

    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    channel = models.CharField(max_length=20, choices=Channel.choices, default=Channel.EMAIL)
    start_at = models.DateTimeField(null=True, blank=True)
    end_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='campaigns_created'
    )

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.get_status_display()})"


class CampaignStep(TenantAwareModel):
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='steps')
    order = models.PositiveIntegerField(default=1)
    delay_days = models.PositiveIntegerField(default=0)
    template = models.ForeignKey(
        'messaging.MessageTemplate',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='campaign_steps'
    )
    subject_override = models.CharField(max_length=200, blank=True, null=True)
    body_override = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order']
        indexes = [
            models.Index(fields=['campaign', 'order'], name='idx_campaign_step_order'),
        ]

    def __str__(self):
        return f"{self.campaign.name} - Step {self.order}"

    def save(self, *args, **kwargs):
        if not self.branch and self.campaign:
            self.branch = self.campaign.branch
        super().save(*args, **kwargs)


class CampaignEnrollment(TenantAwareModel):
    class Status(models.TextChoices):
        ENROLLED = 'ENROLLED', 'Enrolled'
        COMPLETED = 'COMPLETED', 'Completed'
        STOPPED = 'STOPPED', 'Stopped'

    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='enrollments')
    lead = models.ForeignKey(
        'students.Lead',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='campaign_enrollments'
    )
    student = models.ForeignKey(
        'students.Student',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='campaign_enrollments'
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ENROLLED)
    started_at = models.DateTimeField(default=timezone.now)
    completed_at = models.DateTimeField(null=True, blank=True)
    last_step_sent_at = models.DateTimeField(null=True, blank=True)
    next_step_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-started_at']

    def __str__(self):
        target = self.lead or self.student
        return f"{self.campaign.name} -> {target}"

    def save(self, *args, **kwargs):
        if not self.branch and self.campaign:
            self.branch = self.campaign.branch
        super().save(*args, **kwargs)


class CampaignActivity(TenantAwareModel):
    class Status(models.TextChoices):
        QUEUED = 'QUEUED', 'Queued'
        SENT = 'SENT', 'Sent'
        FAILED = 'FAILED', 'Failed'
        SKIPPED = 'SKIPPED', 'Skipped'

    enrollment = models.ForeignKey(CampaignEnrollment, on_delete=models.CASCADE, related_name='activities')
    step = models.ForeignKey(CampaignStep, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.QUEUED)
    sent_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.enrollment.campaign.name} - {self.get_status_display()}"

    def save(self, *args, **kwargs):
        if not self.branch and self.enrollment:
            self.branch = self.enrollment.branch
        super().save(*args, **kwargs)
