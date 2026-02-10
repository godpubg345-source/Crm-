from django.contrib import admin
from .models import Appointment, AppointmentReminder


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('student', 'counselor', 'scheduled_start', 'status', 'method')
    list_filter = ('status', 'method')


@admin.register(AppointmentReminder)
class AppointmentReminderAdmin(admin.ModelAdmin):
    list_display = ('appointment', 'channel', 'status', 'sent_at')
    list_filter = ('channel', 'status')
