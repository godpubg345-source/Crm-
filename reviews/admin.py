from django.contrib import admin
from .models import ReviewSLA, DocumentReview


@admin.register(ReviewSLA)
class ReviewSLAAdmin(admin.ModelAdmin):
    list_display = ('category', 'target_hours', 'branch', 'is_active')
    list_filter = ('category', 'is_active', 'branch')
    search_fields = ('category',)


@admin.register(DocumentReview)
class DocumentReviewAdmin(admin.ModelAdmin):
    list_display = ('document', 'status', 'reviewer', 'due_at', 'completed_at', 'sla_status')
    list_filter = ('status', 'sla_status', 'branch')
    search_fields = ('document__file_name',)
