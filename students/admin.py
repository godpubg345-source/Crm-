from django.contrib import admin
from .models import Student, Lead, Document

# Note: Education and TestScore are JSON fields on Student, not separate models, so we don't register them here.

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'email', 'phone', 'branch', 'counselor', 'created_at')
    list_filter = ('branch', 'created_at')
    search_fields = ('first_name', 'last_name', 'email', 'student_code', 'passport_number')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)

@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'email', 'phone', 'status', 'branch', 'created_at')
    list_filter = ('status', 'branch', 'source')
    search_fields = ('first_name', 'last_name', 'email', 'phone')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    # Adjusted fields to match model: file_name, document_type, verification_status
    list_display = ('file_name', 'student', 'document_type', 'verification_status', 'created_at') 
    list_filter = ('verification_status', 'category', 'created_at')
    search_fields = ('file_name', 'student__first_name', 'student__email')
    readonly_fields = ('created_at', 'updated_at')
