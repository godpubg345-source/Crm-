from django.contrib import admin
from .models import VisaCase, VisaMilestone


@admin.register(VisaCase)
class VisaCaseAdmin(admin.ModelAdmin):
    """VisaCase Admin with decision status filtering."""
    
    list_display = ('student', 'status', 'decision_status', 'vfs_date', 'biometric_done', 'created_at')
    list_filter = ('status', 'decision_status', 'biometric_done', 'tb_test_done')
    search_fields = ('student__student_code', 'ihs_reference')
    ordering = ('-created_at',)
    
    readonly_fields = ('id', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Student & Application', {
            'fields': ('student', 'application')
        }),
        ('Status', {
            'fields': ('status', 'decision_status')
        }),
        ('VFS & Biometrics', {
            'fields': ('vfs_date', 'vfs_location', 'biometric_done')
        }),
        ('TB Test', {
            'fields': ('tb_test_done', 'tb_test_date')
        }),
        ('Payments', {
            'fields': ('ihs_reference', 'ihs_amount', 'visa_fee_amount')
        }),
        ('Decision', {
            'fields': ('submission_date', 'decision_date', 'visa_start_date', 'visa_end_date')
        }),
        ('Refusal', {
            'fields': ('refusal_reason', 'appeal_submitted', 'appeal_date'),
            'classes': ('collapse',)
        }),
        ('Notes', {
            'fields': ('notes',),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(VisaMilestone)
class VisaMilestoneAdmin(admin.ModelAdmin):
    list_display = ('visa_case', 'title', 'category', 'status', 'due_date', 'completed_at')
    list_filter = ('category', 'status')
    search_fields = ('visa_case__student__student_code', 'title')
