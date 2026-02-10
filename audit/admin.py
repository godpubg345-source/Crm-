from django.contrib import admin

from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('created_at', 'action', 'model', 'object_id', 'actor', 'ip_address', 'status_code')
    list_filter = ('action', 'model', 'status_code')
    search_fields = ('object_id', 'object_repr', 'path', 'actor__email')
    readonly_fields = (
        'created_at', 'action', 'model', 'object_id', 'object_repr',
        'actor', 'branch', 'ip_address', 'path', 'method', 'status_code', 'changes'
    )
