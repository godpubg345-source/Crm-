from django.contrib import admin
from .models import PartnerContract, Agent, AgentAssignment, OCRJob


@admin.register(PartnerContract)
class PartnerContractAdmin(admin.ModelAdmin):
    list_display = ('university', 'status', 'start_date', 'end_date', 'branch')
    list_filter = ('status',)


@admin.register(Agent)
class AgentAdmin(admin.ModelAdmin):
    list_display = ('name', 'status', 'commission_rate', 'branch')
    list_filter = ('status',)
    search_fields = ('name',)


@admin.register(AgentAssignment)
class AgentAssignmentAdmin(admin.ModelAdmin):
    list_display = ('agent', 'role', 'lead', 'student', 'branch')
    list_filter = ('role',)


@admin.register(OCRJob)
class OCRJobAdmin(admin.ModelAdmin):
    list_display = ('document', 'status', 'provider', 'processed_at', 'branch')
    list_filter = ('status',)
