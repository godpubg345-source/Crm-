from rest_framework import viewsets
from accounts.permissions import CommunicationPermission

from audit.mixins import AuditLogMixin
from visa_crm_backend.mixins import BranchIsolationMixin, BranchIsolationCreateMixin
from core.utils.branch_context import resolve_branch_from_request
from .models import MessageTemplate, MessageLog
from .serializers import MessageTemplateSerializer, MessageLogSerializer


class MessageTemplateViewSet(AuditLogMixin, BranchIsolationMixin, BranchIsolationCreateMixin, viewsets.ModelViewSet):
    queryset = MessageTemplate.objects.all()
    serializer_class = MessageTemplateSerializer
    permission_classes = [CommunicationPermission]

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(created_by=user, updated_by=user)

    def perform_update(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(updated_by=user)


class MessageLogViewSet(AuditLogMixin, BranchIsolationMixin, BranchIsolationCreateMixin, viewsets.ModelViewSet):
    queryset = MessageLog.objects.select_related('template', 'lead', 'student').all()
    serializer_class = MessageLogSerializer
    permission_classes = [CommunicationPermission]

    def perform_create(self, serializer):
        lead = serializer.validated_data.get('lead')
        student = serializer.validated_data.get('student')
        branch = None
        if student and student.branch:
            branch = student.branch
        elif lead and lead.branch:
            branch = lead.branch
        else:
            branch = resolve_branch_from_request(self.request)
        serializer.save(branch=branch)
