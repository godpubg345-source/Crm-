from rest_framework import viewsets
from accounts.permissions import CommunicationPermission

from audit.mixins import AuditLogMixin
from visa_crm_backend.mixins import BranchIsolationMixin, BranchIsolationCreateMixin
from .models import Campaign, CampaignStep, CampaignEnrollment, CampaignActivity
from .serializers import (
    CampaignSerializer,
    CampaignStepSerializer,
    CampaignEnrollmentSerializer,
    CampaignActivitySerializer,
)


class CampaignViewSet(AuditLogMixin, BranchIsolationMixin, BranchIsolationCreateMixin, viewsets.ModelViewSet):
    queryset = Campaign.objects.all()
    serializer_class = CampaignSerializer
    permission_classes = [CommunicationPermission]

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(created_by=user)


class CampaignStepViewSet(AuditLogMixin, BranchIsolationMixin, BranchIsolationCreateMixin, viewsets.ModelViewSet):
    queryset = CampaignStep.objects.select_related('campaign', 'template').all()
    serializer_class = CampaignStepSerializer
    permission_classes = [CommunicationPermission]

    def perform_create(self, serializer):
        campaign = serializer.validated_data.get('campaign')
        serializer.save(branch=campaign.branch if campaign else None)


class CampaignEnrollmentViewSet(AuditLogMixin, BranchIsolationMixin, BranchIsolationCreateMixin, viewsets.ModelViewSet):
    queryset = CampaignEnrollment.objects.select_related('campaign', 'lead', 'student').all()
    serializer_class = CampaignEnrollmentSerializer
    permission_classes = [CommunicationPermission]

    def perform_create(self, serializer):
        campaign = serializer.validated_data.get('campaign')
        serializer.save(branch=campaign.branch if campaign else None)


class CampaignActivityViewSet(AuditLogMixin, BranchIsolationMixin, BranchIsolationCreateMixin, viewsets.ModelViewSet):
    queryset = CampaignActivity.objects.select_related('enrollment', 'step').all()
    serializer_class = CampaignActivitySerializer
    permission_classes = [CommunicationPermission]

    def perform_create(self, serializer):
        enrollment = serializer.validated_data.get('enrollment')
        serializer.save(branch=enrollment.branch if enrollment else None)
