from celery import shared_task
from django.utils import timezone

from .models import Appointment, AppointmentReminder


@shared_task
def create_appointment_reminders():
    now = timezone.now()
    created = 0

    appointments = Appointment.objects.filter(
        status=Appointment.Status.SCHEDULED,
        scheduled_start__gte=now,
        scheduled_start__lte=now + timezone.timedelta(hours=24),
    )

    for appointment in appointments:
        reminder_time = appointment.scheduled_start - timezone.timedelta(minutes=appointment.reminder_minutes)
        if reminder_time > now:
            continue
        if AppointmentReminder.objects.filter(appointment=appointment).exists():
            continue
        AppointmentReminder.objects.create(
            appointment=appointment,
            channel=AppointmentReminder.Channel.IN_APP,
            status=AppointmentReminder.Status.SENT,
            branch=appointment.branch,
        )
        created += 1

    return created
