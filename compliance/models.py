from django.conf import settings
from django.db import models

from core.models import TenantAwareModel


class ComplianceRule(TenantAwareModel):
    """Country/visa compliance rules with audit trail."""

    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        ACTIVE = 'ACTIVE', 'Active'
        ARCHIVED = 'ARCHIVED', 'Archived'

    class Severity(models.TextChoices):
        LOW = 'LOW', 'Low'
        MEDIUM = 'MEDIUM', 'Medium'
        HIGH = 'HIGH', 'High'
        CRITICAL = 'CRITICAL', 'Critical'

    name = models.CharField(max_length=200)
    country = models.CharField(max_length=100)
    visa_type = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    requirements = models.JSONField(default=dict, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    severity = models.CharField(max_length=10, choices=Severity.choices, default=Severity.MEDIUM)
    effective_from = models.DateField(null=True, blank=True)
    effective_to = models.DateField(null=True, blank=True)
    source_url = models.URLField(blank=True, null=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='compliance_rules_created'
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='compliance_rules_updated'
    )

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['country'], name='idx_compliance_country'),
            models.Index(fields=['status'], name='idx_compliance_status'),
        ]

    def __str__(self):
        return f"{self.name} ({self.country})"


class ComplianceRuleChange(TenantAwareModel):
    """Audit trail for compliance rule changes."""

    class Action(models.TextChoices):
        CREATE = 'CREATE', 'Create'
        UPDATE = 'UPDATE', 'Update'
        ARCHIVE = 'ARCHIVE', 'Archive'

    rule = models.ForeignKey(ComplianceRule, on_delete=models.CASCADE, related_name='changes')
    action = models.CharField(max_length=10, choices=Action.choices)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='compliance_rule_changes'
    )
    change_summary = models.TextField(blank=True, null=True)
    previous_data = models.JSONField(default=dict, blank=True)
    new_data = models.JSONField(default=dict, blank=True)
    changed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-changed_at']

    def __str__(self):
        return f"{self.rule.name} - {self.get_action_display()}"
