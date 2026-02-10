from django.contrib import admin
from .models import BranchKpiInput, MetricSnapshot


@admin.register(BranchKpiInput)
class BranchKpiInputAdmin(admin.ModelAdmin):
    list_display = ('branch', 'period_start', 'period_end', 'marketing_spend')
    list_filter = ('branch',)


@admin.register(MetricSnapshot)
class MetricSnapshotAdmin(admin.ModelAdmin):
    list_display = ('metric_type', 'branch', 'generated_at')
    list_filter = ('metric_type',)
