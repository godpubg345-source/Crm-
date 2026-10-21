from django.contrib import admin
from .models import VisaType, RequiredDocument, RequirementRule

@admin.register(VisaType)
class VisaTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active')

@admin.register(RequiredDocument)
class RequiredDocumentAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_uploadable')
    search_fields = ('name',)

@admin.register(RequirementRule)
class RequirementRuleAdmin(admin.ModelAdmin):
    list_display = ('visa_type', 'destination_country', 'origin_country', 'is_mandatory')
    list_filter = ('destination_country', 'origin_country', 'visa_type')
    filter_horizontal = ('required_documents',)
