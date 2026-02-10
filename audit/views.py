from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend

from accounts.permissions import AuditLogPermission
from visa_crm_backend.mixins import BranchIsolationMixin
from .models import AuditLog
from .serializers import AuditLogSerializer


class AuditLogViewSet(BranchIsolationMixin, viewsets.ReadOnlyModelViewSet):
    """
    Read-only access to audit logs for Super Admins and Auditors.
    """
    queryset = AuditLog.objects.select_related('actor', 'branch').all()
    serializer_class = AuditLogSerializer
    permission_classes = [AuditLogPermission]
    branch_field = 'branch'

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['action', 'model', 'actor', 'branch', 'method', 'status_code']
    search_fields = ['model', 'object_id', 'object_repr', 'path', 'actor__email']
    ordering_fields = ['created_at', 'model', 'action']
    ordering = ['-created_at']
