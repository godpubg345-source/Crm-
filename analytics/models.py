from django.conf import settings
from django.db import models

from core.models import TenantAwareModel


class BranchKpiInput(TenantAwareModel):
    """Manual KPI inputs like marketing spend for CAC calculations."""

    period_start = models.DateField()
    period_end = models.DateField()
    marketing_spend = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    notes = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='branch_kpi_inputs'
    )

    class Meta:
        ordering = ['-period_start']
        indexes = [
            models.Index(fields=['period_start', 'period_end'], name='idx_kpi_period'),
        ]

    def __str__(self):
        return f"{self.branch} {self.period_start} - {self.period_end}"


class MetricSnapshot(TenantAwareModel):
    """Stored analytics snapshots for reporting."""

    class MetricType(models.TextChoices):
        BRANCH_PERFORMANCE = 'BRANCH_PERFORMANCE', 'Branch Performance'
        COUNSELOR_KPI = 'COUNSELOR_KPI', 'Counselor KPI'
        FORECAST = 'FORECAST', 'Forecast'

    metric_type = models.CharField(max_length=40, choices=MetricType.choices)
    period_start = models.DateField(null=True, blank=True)
    period_end = models.DateField(null=True, blank=True)
    data = models.JSONField(default=dict, blank=True)
    generated_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='metric_snapshots'
    )

    class Meta:
        ordering = ['-generated_at']

    def __str__(self):
        return f"{self.get_metric_type_display()} ({self.generated_at.date()})"
