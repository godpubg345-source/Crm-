from rest_framework import viewsets
from accounts.permissions import AutomationPermission

from audit.mixins import AuditLogMixin
from visa_crm_backend.mixins import BranchIsolationMixin, BranchIsolationCreateMixin
from .models import AutomationRule, AutomationRun, TaskEscalationPolicy
from .serializers import AutomationRuleSerializer, AutomationRunSerializer, TaskEscalationPolicySerializer


class AutomationRuleViewSet(AuditLogMixin, BranchIsolationMixin, BranchIsolationCreateMixin, viewsets.ModelViewSet):
    queryset = AutomationRule.objects.all()
    serializer_class = AutomationRuleSerializer
    permission_classes = [AutomationPermission]

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(created_by=user)


class AutomationRunViewSet(AuditLogMixin, BranchIsolationMixin, viewsets.ReadOnlyModelViewSet):
    queryset = AutomationRun.objects.select_related('rule').all()
    serializer_class = AutomationRunSerializer
    permission_classes = [AutomationPermission]


class TaskEscalationPolicyViewSet(AuditLogMixin, BranchIsolationMixin, BranchIsolationCreateMixin, viewsets.ModelViewSet):
    queryset = TaskEscalationPolicy.objects.all()
    serializer_class = TaskEscalationPolicySerializer
    permission_classes = [AutomationPermission]
