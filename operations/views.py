from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from accounts.permissions import OperationsPermission

from audit.mixins import AuditLogMixin
from visa_crm_backend.mixins import BranchIsolationMixin, BranchIsolationCreateMixin
from core.utils.branch_context import resolve_branch_from_request
from .models import PartnerContract, Agent, AgentAssignment, OCRJob
from .serializers import (
    PartnerContractSerializer,
    AgentSerializer,
    AgentAssignmentSerializer,
    OCRJobSerializer,
)


class PartnerContractViewSet(AuditLogMixin, BranchIsolationMixin, BranchIsolationCreateMixin, viewsets.ModelViewSet):
    queryset = PartnerContract.objects.select_related('university').all()
    serializer_class = PartnerContractSerializer
    permission_classes = [OperationsPermission]


class AgentViewSet(AuditLogMixin, BranchIsolationMixin, BranchIsolationCreateMixin, viewsets.ModelViewSet):
    queryset = Agent.objects.select_related('parent_agent').all()
    serializer_class = AgentSerializer
    permission_classes = [OperationsPermission]

    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        agent = self.get_object()
        assignments = agent.assignments.all()
        return Response({
            'total_assignments': assignments.count(),
            'primary_roles': assignments.filter(role='PRIMARY').count(),
            'secondary_roles': assignments.filter(role='SECONDARY').count(),
            'student_count': assignments.filter(student__isnull=False).count(),
            'lead_count': assignments.filter(lead__isnull=False).count(),
        })


class AgentAssignmentViewSet(AuditLogMixin, BranchIsolationMixin, BranchIsolationCreateMixin, viewsets.ModelViewSet):
    queryset = AgentAssignment.objects.select_related('agent', 'lead', 'student').all()
    serializer_class = AgentAssignmentSerializer
    permission_classes = [OperationsPermission]

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


class OCRJobViewSet(AuditLogMixin, BranchIsolationMixin, BranchIsolationCreateMixin, viewsets.ModelViewSet):
    queryset = OCRJob.objects.select_related('document', 'requested_by').all()
    serializer_class = OCRJobSerializer
    permission_classes = [OperationsPermission]

    def perform_create(self, serializer):
        document = serializer.validated_data.get('document')
        branch = document.branch if document else resolve_branch_from_request(self.request)
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(branch=branch, requested_by=user)

    @action(detail=True, methods=['post'])
    def trigger_ocr(self, request, pk=None):
        import time
        from django.utils import timezone
        job = self.get_object()
        job.status = OCRJob.Status.PROCESSING
        job.save()
        
        # Mocking an asynchronous process
        # In a real app, this would be a Celery task
        job.status = OCRJob.Status.COMPLETED
        job.processed_at = timezone.now()
        job.confidence = 95.5
        job.raw_text = "Extracted data from BWBS Scan Node."
        job.save()
        
        return Response({'status': 'OCR process completed successfully.'})

