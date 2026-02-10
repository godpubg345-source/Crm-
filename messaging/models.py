from django.conf import settings
from django.db import models

from core.models import TenantAwareModel


class MessageTemplate(TenantAwareModel):
    """Reusable templates for email/SMS/WhatsApp."""

    class Channel(models.TextChoices):
        EMAIL = 'EMAIL', 'Email'
        SMS = 'SMS', 'SMS'
        WHATSAPP = 'WHATSAPP', 'WhatsApp'

    name = models.CharField(max_length=200)
    channel = models.CharField(max_length=20, choices=Channel.choices)
    subject = models.CharField(max_length=200, blank=True, null=True)
    body = models.TextField()
    variables = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='message_templates_created'
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='message_templates_updated'
    )

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.get_channel_display()})"


class MessageLog(TenantAwareModel):
    """Omnichannel message delivery log."""

    class Status(models.TextChoices):
        QUEUED = 'QUEUED', 'Queued'
        SENT = 'SENT', 'Sent'
        FAILED = 'FAILED', 'Failed'
        DELIVERED = 'DELIVERED', 'Delivered'

    template = models.ForeignKey(
        MessageTemplate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='logs'
    )
    channel = models.CharField(max_length=20, choices=MessageTemplate.Channel.choices)
    recipient = models.CharField(max_length=255)
    subject = models.CharField(max_length=200, blank=True, null=True)
    body = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.QUEUED)

    lead = models.ForeignKey(
        'students.Lead',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='message_logs'
    )
    student = models.ForeignKey(
        'students.Student',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='message_logs'
    )

    provider_name = models.CharField(max_length=100, blank=True, null=True)
    provider_message_id = models.CharField(max_length=200, blank=True, null=True)
    error_message = models.TextField(blank=True, null=True)

    triggered_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='message_logs'
    )
    sent_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['channel'], name='idx_message_channel'),
            models.Index(fields=['status'], name='idx_message_status'),
        ]

    def __str__(self):
        return f"{self.channel} -> {self.recipient} ({self.status})"

    def save(self, *args, **kwargs):
        if not self.branch:
            if self.student and self.student.branch:
                self.branch = self.student.branch
            elif self.lead and self.lead.branch:
                self.branch = self.lead.branch
        super().save(*args, **kwargs)
