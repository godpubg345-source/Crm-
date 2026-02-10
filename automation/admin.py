from django.contrib import admin
from .models import AutomationRule, AutomationRun, TaskEscalationPolicy


@admin.register(AutomationRule)
class AutomationRuleAdmin(admin.ModelAdmin):
    list_display = ('name', 'trigger', 'priority', 'is_active', 'branch')
    list_filter = ('trigger', 'is_active')
    search_fields = ('name',)


@admin.register(AutomationRun)
class AutomationRunAdmin(admin.ModelAdmin):
    list_display = ('rule', 'status', 'ran_at', 'branch')
    list_filter = ('status',)


@admin.register(TaskEscalationPolicy)
class TaskEscalationPolicyAdmin(admin.ModelAdmin):
    list_display = ('name', 'priority', 'escalate_after_hours', 'escalate_to_role', 'is_active')
    list_filter = ('priority', 'is_active')
