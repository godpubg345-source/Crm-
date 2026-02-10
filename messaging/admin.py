from django.contrib import admin
from .models import MessageTemplate, MessageLog


@admin.register(MessageTemplate)
class MessageTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'channel', 'is_active', 'branch')
    list_filter = ('channel', 'is_active')
    search_fields = ('name',)


@admin.register(MessageLog)
class MessageLogAdmin(admin.ModelAdmin):
    list_display = ('channel', 'recipient', 'status', 'sent_at', 'branch')
    list_filter = ('channel', 'status')
    search_fields = ('recipient',)
