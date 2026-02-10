from django.contrib import admin
from .models import Application, ApplicationSubmission


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    """Application Admin with status and student filtering."""
    
    list_display = ('student', 'university_name', 'course_name', 'intake', 'status', 'cas_number', 'created_at')
    list_filter = ('status', 'application_type', 'intake')
    search_fields = ('student__student_code', 'university_name', 'course_name', 'cas_number')
    ordering = ('-created_at',)
    
    readonly_fields = ('id', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Student & University', {
            'fields': ('student', 'university_name', 'course_name', 'intake')
        }),
        ('Application Details', {
            'fields': ('application_type', 'status', 'submission_date')
        }),
        ('Offer', {
            'fields': ('offer_type', 'offer_conditions', 'conditions_met')
        }),
        ('CAS', {
            'fields': ('cas_number', 'cas_issue_date')
        }),
        ('Financial', {
            'fields': ('tuition_fee', 'deposit_paid'),
            'classes': ('collapse',)
        }),
        ('Notes', {
            'fields': ('rejection_reason', 'notes'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ApplicationSubmission)
class ApplicationSubmissionAdmin(admin.ModelAdmin):
    list_display = ('application', 'status', 'submitted_at', 'created_at')
    list_filter = ('status',)
    search_fields = ('application__student__student_code', 'submission_reference')
