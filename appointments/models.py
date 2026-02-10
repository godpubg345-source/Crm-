from django.conf import settings
from django.db import models

from core.models import TenantAwareModel


class Appointment(TenantAwareModel):
    class Status(models.TextChoices):
        SCHEDULED = 'SCHEDULED', 'Scheduled'
        COMPLETED = 'COMPLETED', 'Completed'
        CANCELLED = 'CANCELLED', 'Cancelled'
        NO_SHOW = 'NO_SHOW', 'No Show'

    class Method(models.TextChoices):
        IN_PERSON = 'IN_PERSON', 'In Person'
        PHONE = 'PHONE', 'Phone'
        VIDEO = 'VIDEO', 'Video'

    student = models.ForeignKey('students.Student', on_delete=models.CASCADE, related_name='appointments')
    counselor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='appointments')
    scheduled_start = models.DateTimeField()
    scheduled_end = models.DateTimeField()
    method = models.CharField(max_length=20, choices=Method.choices, default=Method.IN_PERSON)
    location = models.CharField(max_length=200, blank=True, null=True)
    meeting_link = models.URLField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SCHEDULED)
    notes = models.TextField(blank=True, null=True)
    reminder_minutes = models.PositiveIntegerField(default=30)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='appointments_created'
    )
    cancelled_reason = models.TextField(blank=True, null=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-scheduled_start']
        indexes = [
            models.Index(fields=['scheduled_start'], name='idx_appointment_start'),
        ]

    def __str__(self):
        return f"{self.student.student_code} - {self.scheduled_start}"

    def save(self, *args, **kwargs):
        if self.student and not self.branch:
            self.branch = self.student.branch
        super().save(*args, **kwargs)


class AppointmentReminder(TenantAwareModel):
    class Channel(models.TextChoices):
        EMAIL = 'EMAIL', 'Email'
        SMS = 'SMS', 'SMS'
        WHATSAPP = 'WHATSAPP', 'WhatsApp'
        IN_APP = 'IN_APP', 'In-App'

    class Status(models.TextChoices):
        SENT = 'SENT', 'Sent'
        FAILED = 'FAILED', 'Failed'

    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, related_name='reminders')
    channel = models.CharField(max_length=20, choices=Channel.choices, default=Channel.IN_APP)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SENT)
    sent_at = models.DateTimeField(auto_now_add=True)
    error_message = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-sent_at']

    def __str__(self):
        return f"Reminder {self.appointment_id} - {self.channel}"

    def save(self, *args, **kwargs):
        if self.appointment and not self.branch:
            self.branch = self.appointment.branch
        super().save(*args, **kwargs)
