from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from accounts.permissions import GovernancePermission
from rest_framework.response import Response

from audit.mixins import AuditLogMixin
from visa_crm_backend.mixins import BranchIsolationMixin, BranchIsolationCreateMixin
from core.utils.branch_context import resolve_branch_from_request
from accounts.models import User
from .models import RetentionPolicy, DataDeletionRequest, AccessReviewCycle, AccessReviewItem
from .serializers import (
    RetentionPolicySerializer,
    DataDeletionRequestSerializer,
    AccessReviewCycleSerializer,
    AccessReviewItemSerializer,
)


class RetentionPolicyViewSet(AuditLogMixin, BranchIsolationMixin, BranchIsolationCreateMixin, viewsets.ModelViewSet):
    queryset = RetentionPolicy.objects.all()
    serializer_class = RetentionPolicySerializer
    permission_classes = [GovernancePermission]


class DataDeletionRequestViewSet(AuditLogMixin, BranchIsolationMixin, BranchIsolationCreateMixin, viewsets.ModelViewSet):
    queryset = DataDeletionRequest.objects.select_related('lead', 'student', 'document').all()
    serializer_class = DataDeletionRequestSerializer
    permission_classes = [GovernancePermission]

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        lead = serializer.validated_data.get('lead')
        student = serializer.validated_data.get('student')
        document = serializer.validated_data.get('document')
        target = lead or student or document
        branch = target.branch if target else resolve_branch_from_request(self.request)
        serializer.save(requested_by=user, branch=branch)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        deletion_request = self.get_object()
        deletion_request.status = DataDeletionRequest.Status.APPROVED
        deletion_request.approved_by = request.user
        deletion_request.save(update_fields=['status', 'approved_by', 'updated_at'])
        return Response({'status': 'approved'})

    @action(detail=True, methods=['post'])
    def execute(self, request, pk=None):
        deletion_request = self.get_object()
        if deletion_request.status != DataDeletionRequest.Status.APPROVED:
            return Response({'detail': 'Request must be approved before execution.'}, status=status.HTTP_400_BAD_REQUEST)

        target = deletion_request.target()
        if not target:
            return Response({'detail': 'Target not found.'}, status=status.HTTP_404_NOT_FOUND)

        if deletion_request.request_type == DataDeletionRequest.RequestType.ANONYMIZE:
            if hasattr(target, 'anonymize'):
                target.anonymize()
            else:
                return Response({'detail': 'Target does not support anonymization.'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            target.delete()

        deletion_request.status = DataDeletionRequest.Status.COMPLETED
        deletion_request.completed_at = timezone.now()
        deletion_request.save(update_fields=['status', 'completed_at', 'updated_at'])
        return Response({'status': 'completed'})


class AccessReviewCycleViewSet(AuditLogMixin, BranchIsolationMixin, BranchIsolationCreateMixin, viewsets.ModelViewSet):
    queryset = AccessReviewCycle.objects.all()
    serializer_class = AccessReviewCycleSerializer
    permission_classes = [GovernancePermission]

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(created_by=user)

    @action(detail=True, methods=['post'])
    def generate_items(self, request, pk=None):
        cycle = self.get_object()
        branch = resolve_branch_from_request(request)
        users = User.objects.filter(is_active=True)
        if branch:
            users = users.filter(branch=branch)
        created = 0
        for user in users:
            _, was_created = AccessReviewItem.objects.get_or_create(
                cycle=cycle,
                user=user,
                defaults={'branch': user.branch}
            )
            if was_created:
                created += 1
        return Response({'created': created})


class AccessReviewItemViewSet(AuditLogMixin, BranchIsolationMixin, BranchIsolationCreateMixin, viewsets.ModelViewSet):
    queryset = AccessReviewItem.objects.select_related('cycle', 'user').all()
    serializer_class = AccessReviewItemSerializer
    permission_classes = [GovernancePermission]

    @action(detail=True, methods=['post'])
    def mark_reviewed(self, request, pk=None):
        item = self.get_object()
        status_value = request.data.get('status')
        if status_value not in AccessReviewItem.Status.values:
            return Response({'detail': 'Invalid status.'}, status=status.HTTP_400_BAD_REQUEST)
        item.mark_reviewed(status_value, request.user)
        return Response({'status': item.status})
