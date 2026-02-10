from django.contrib import admin
from .models import Campaign, CampaignStep, CampaignEnrollment, CampaignActivity


@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display = ('name', 'status', 'channel', 'start_at', 'end_at', 'branch')
    list_filter = ('status', 'channel')
    search_fields = ('name',)


@admin.register(CampaignStep)
class CampaignStepAdmin(admin.ModelAdmin):
    list_display = ('campaign', 'order', 'delay_days', 'is_active')
    list_filter = ('campaign', 'is_active')


@admin.register(CampaignEnrollment)
class CampaignEnrollmentAdmin(admin.ModelAdmin):
    list_display = ('campaign', 'status', 'started_at', 'branch')
    list_filter = ('status',)


@admin.register(CampaignActivity)
class CampaignActivityAdmin(admin.ModelAdmin):
    list_display = ('enrollment', 'status', 'sent_at')
    list_filter = ('status',)
