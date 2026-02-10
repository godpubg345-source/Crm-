from django.forms.models import model_to_dict
from rest_framework import viewsets
from accounts.permissions import CompliancePermission

from audit.mixins import AuditLogMixin
from visa_crm_backend.mixins import BranchIsolationMixin, BranchIsolationCreateMixin
from .models import ComplianceRule, ComplianceRuleChange
from .serializers import ComplianceRuleSerializer, ComplianceRuleChangeSerializer


class ComplianceRuleViewSet(AuditLogMixin, BranchIsolationMixin, BranchIsolationCreateMixin, viewsets.ModelViewSet):
    queryset = ComplianceRule.objects.all()
    serializer_class = ComplianceRuleSerializer
    permission_classes = [CompliancePermission]

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        instance = serializer.save(created_by=user, updated_by=user)
        ComplianceRuleChange.objects.create(
            rule=instance,
            action=ComplianceRuleChange.Action.CREATE,
            changed_by=user,
            new_data=model_to_dict(instance),
            branch=instance.branch,
        )

    def perform_update(self, serializer):
        instance = self.get_object()
        previous = model_to_dict(instance)
        user = self.request.user if self.request.user.is_authenticated else None
        instance = serializer.save(updated_by=user)
        action = ComplianceRuleChange.Action.ARCHIVE if instance.status == ComplianceRule.Status.ARCHIVED else ComplianceRuleChange.Action.UPDATE
        ComplianceRuleChange.objects.create(
            rule=instance,
            action=action,
            changed_by=user,
            previous_data=previous,
            new_data=model_to_dict(instance),
            branch=instance.branch,
        )


class ComplianceRuleChangeViewSet(AuditLogMixin, BranchIsolationMixin, viewsets.ReadOnlyModelViewSet):
    queryset = ComplianceRuleChange.objects.select_related('rule', 'changed_by').all()
    serializer_class = ComplianceRuleChangeSerializer
    permission_classes = [CompliancePermission]
