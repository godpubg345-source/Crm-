from django.contrib import admin

from .models import CommunicationLog


@admin.register(CommunicationLog)
class CommunicationLogAdmin(admin.ModelAdmin):
    list_display = ('student', 'communication_type', 'direction', 'logged_by', 'created_at')
    list_filter = ('communication_type', 'direction', 'created_at')
    search_fields = ('student__student_code', 'student__first_name', 'student__last_name', 'summary')
