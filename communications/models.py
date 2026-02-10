import uuid

from django.conf import settings
from django.db import models

from core.models import TenantAwareModel
from students.models import Student


class CommunicationLog(TenantAwareModel):
    class Type(models.TextChoices):
        CALL = 'CALL', 'Call'
        EMAIL = 'EMAIL', 'Email'
        SMS = 'SMS', 'SMS'
        MEETING = 'MEETING', 'Meeting'
        WHATSAPP = 'WHATSAPP', 'WhatsApp'
        OTHER = 'OTHER', 'Other'

    class Direction(models.TextChoices):
        INBOUND = 'INBOUND', 'Inbound'
        OUTBOUND = 'OUTBOUND', 'Outbound'

    # Fields handled by TenantAwareModel: id, branch, is_deleted, created_at, updated_at

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='communications')

    communication_type = models.CharField(max_length=20, choices=Type.choices)
    direction = models.CharField(max_length=10, choices=Direction.choices)

    subject = models.CharField(max_length=200, blank=True, null=True)
    summary = models.TextField()
    next_action = models.TextField(blank=True, null=True)
    follow_up_at = models.DateTimeField(null=True, blank=True)

    logged_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='communication_logs'
    )

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Communication Log'
        verbose_name_plural = 'Communication Logs'

    def __str__(self):
        return f"{self.student.student_code} - {self.get_communication_type_display()}"


class EmailTemplate(TenantAwareModel):
    """
    Reusable email templates for partner communications.
    Supports placeholder tokens like {{university_name}}, {{contact_name}}.
    """
    class Category(models.TextChoices):
        ONBOARDING = 'ONBOARDING', 'Partner Onboarding'
        INTAKE = 'INTAKE', 'Intake Reminder'
        DOCUMENT = 'DOCUMENT', 'Document Request'
        FOLLOW_UP = 'FOLLOW_UP', 'Application Follow-up'
        MARKETING = 'MARKETING', 'Marketing Outreach'
        CUSTOM = 'CUSTOM', 'Custom Template'

    name = models.CharField(max_length=200)
    subject = models.CharField(max_length=300, help_text="Email subject line with optional placeholders")
    body = models.TextField(help_text="Email body with placeholders like {{university_name}}")
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.CUSTOM)

    # Available placeholders for reference
    placeholders = models.JSONField(
        default=list,
        blank=True,
        help_text="List of placeholder tokens available in this template"
    )

    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['category', 'name']
        verbose_name = 'Email Template'
        verbose_name_plural = 'Email Templates'

    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"

    def render(self, context: dict) -> dict:
        """
        Render template with provided context.
        context: {'university_name': 'Oxford', 'contact_name': 'John'}
        """
        subject = self.subject
        body = self.body

        for key, value in context.items():
            placeholder = '{{' + key + '}}'
            subject = subject.replace(placeholder, str(value))
            body = body.replace(placeholder, str(value))

        return {'subject': subject, 'body': body}
