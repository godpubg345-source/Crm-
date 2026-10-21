from django.contrib import admin
from .models import RetentionPolicy, DataDeletionRequest, AccessReviewCycle, AccessReviewItem


@admin.register(RetentionPolicy)
class RetentionPolicyAdmin(admin.ModelAdmin):
    list_display = ('entity_type', 'retention_days', 'action', 'is_active')
    list_filter = ('entity_type', 'action', 'is_active')


@admin.register(DataDeletionRequest)
class DataDeletionRequestAdmin(admin.ModelAdmin):
    list_display = ('request_type', 'status', 'requested_by', 'approved_by', 'completed_at')
    list_filter = ('status', 'request_type')


@admin.register(AccessReviewCycle)
class AccessReviewCycleAdmin(admin.ModelAdmin):
    list_display = ('name', 'period_start', 'period_end', 'status')
    list_filter = ('status',)


@admin.register(AccessReviewItem)
class AccessReviewItemAdmin(admin.ModelAdmin):
    list_display = ('cycle', 'user', 'status', 'reviewed_at')
    list_filter = ('status',)
