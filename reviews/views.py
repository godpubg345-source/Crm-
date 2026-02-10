from rest_framework import viewsets
from accounts.permissions import DocumentPermission

from audit.mixins import AuditLogMixin
from visa_crm_backend.mixins import BranchIsolationMixin, BranchIsolationCreateMixin
from core.utils.branch_context import resolve_branch_from_request
from .models import ReviewSLA, DocumentReview
from .serializers import ReviewSLASerializer, DocumentReviewSerializer


class ReviewSLAViewSet(AuditLogMixin, BranchIsolationMixin, BranchIsolationCreateMixin, viewsets.ModelViewSet):
    queryset = ReviewSLA.objects.all()
    serializer_class = ReviewSLASerializer
    permission_classes = [DocumentPermission]


class DocumentReviewViewSet(AuditLogMixin, BranchIsolationMixin, BranchIsolationCreateMixin, viewsets.ModelViewSet):
    queryset = DocumentReview.objects.select_related('document', 'reviewer').all()
    serializer_class = DocumentReviewSerializer
    permission_classes = [DocumentPermission]

    def perform_create(self, serializer):
        document = serializer.validated_data.get('document')
        branch = document.branch if document else resolve_branch_from_request(self.request)
        serializer.save(branch=branch)
