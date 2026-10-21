from django.contrib import admin
from .models import PortalAccess, PortalNotification, PortalSession


@admin.register(PortalAccess)
class PortalAccessAdmin(admin.ModelAdmin):
    list_display = ('student', 'status', 'parent_email', 'invited_at', 'last_login_at')
    list_filter = ('status',)
    search_fields = ('student__student_code', 'parent_email')


@admin.register(PortalNotification)
class PortalNotificationAdmin(admin.ModelAdmin):
    list_display = ('student', 'title', 'category', 'read_at')
    list_filter = ('category',)


@admin.register(PortalSession)
class PortalSessionAdmin(admin.ModelAdmin):
    list_display = ('access', 'token', 'expires_at', 'revoked_at', 'last_seen_at')
    list_filter = ('revoked_at',)
