from django.contrib import admin
from .models import ComplianceRule, ComplianceRuleChange


@admin.register(ComplianceRule)
class ComplianceRuleAdmin(admin.ModelAdmin):
    list_display = ('name', 'country', 'visa_type', 'status', 'severity', 'effective_from', 'effective_to')
    list_filter = ('country', 'status', 'severity')
    search_fields = ('name', 'country', 'visa_type')


@admin.register(ComplianceRuleChange)
class ComplianceRuleChangeAdmin(admin.ModelAdmin):
    list_display = ('rule', 'action', 'changed_by', 'changed_at')
    list_filter = ('action',)
    search_fields = ('rule__name',)
