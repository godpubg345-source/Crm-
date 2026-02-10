"""
URL configuration for visa_crm_backend project.
API endpoints are registered using DRF's DefaultRouter.
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenVerifyView

# Import ViewSets from all apps
from accounts.views import (
    UserViewSet, CustomTokenObtainPairView, CustomTokenRefreshView, LogoutView,
    AttendanceLogViewSet, LeaveRequestViewSet
)
from branches.views import (
    BranchViewSet, TransferRequestViewSet, BranchTargetViewSet,
    FixedAssetViewSet, BranchComplaintViewSet
)
from students.views import (
    LeadViewSet, StudentViewSet, DocumentViewSet, DocumentAlertViewSet, 
    DashboardStatsView, LeadInteractionViewSet, WhatsAppTemplateViewSet,
    CounselorAvailabilityViewSet
)
from applications.views import (
    ApplicationViewSet,
    ApplicationSubmissionViewSet,
    ApplicationChecklistTemplateViewSet,
    ApplicationChecklistItemViewSet,
    ApplicationNoteViewSet
)
from visas.views import VisaCaseViewSet, VisaMilestoneViewSet
from finance.views import FeeTypeViewSet, TransactionViewSet, CommissionViewSet
from tasks.views import TaskViewSet
from universities.views import (
    UniversityViewSet, CourseViewSet, CourseWishlistViewSet, LivingCostViewSet,
    CourseReviewViewSet, CareerPathViewSet, CourseQuickApplyViewSet
)
from requirements.views import RequirementsCheckView
from audit.views import AuditLogViewSet
from communications.views import CommunicationLogViewSet
from reviews.views import ReviewSLAViewSet, DocumentReviewViewSet
from compliance.views import ComplianceRuleViewSet, ComplianceRuleChangeViewSet
from messaging.views import MessageTemplateViewSet, MessageLogViewSet
from campaigns.views import CampaignViewSet, CampaignStepViewSet, CampaignEnrollmentViewSet, CampaignActivityViewSet
from automation.views import AutomationRuleViewSet, AutomationRunViewSet, TaskEscalationPolicyViewSet
from analytics.views import AnalyticsViewSet, BranchKpiInputViewSet, MetricSnapshotViewSet
from governance.views import RetentionPolicyViewSet, DataDeletionRequestViewSet, AccessReviewCycleViewSet, AccessReviewItemViewSet
from operations.views import PartnerContractViewSet, AgentViewSet, AgentAssignmentViewSet, OCRJobViewSet
from portal.views import PortalAccessViewSet, PortalNotificationViewSet
from appointments.views import AppointmentViewSet, AppointmentReminderViewSet
from resources.views import ResourceViewSet

# Create API router
router = DefaultRouter()

# Register ViewSets
router.register(r'users', UserViewSet, basename='user')
router.register(r'branches', BranchViewSet, basename='branch')
router.register(r'branch-transfers', TransferRequestViewSet, basename='branch-transfer')
router.register(r'branch-targets', BranchTargetViewSet, basename='branch-target')
router.register(r'fixed-assets', FixedAssetViewSet, basename='fixed-asset')
router.register(r'branch-complaints', BranchComplaintViewSet, basename='branch-complaint')
router.register(r'attendance', AttendanceLogViewSet, basename='attendance')
router.register(r'leave-requests', LeaveRequestViewSet, basename='leave-request')
router.register(r'leads', LeadViewSet, basename='lead')
router.register(r'lead-interactions', LeadInteractionViewSet, basename='lead-interaction')
router.register(r'lead-whatsapp-templates', WhatsAppTemplateViewSet, basename='whatsapp-template')
router.register(r'counselor-availability', CounselorAvailabilityViewSet, basename='counselor-availability')
router.register(r'students', StudentViewSet, basename='student')
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'document-alerts', DocumentAlertViewSet, basename='document-alert')
router.register(r'applications', ApplicationViewSet, basename='application')
router.register(r'application-submissions', ApplicationSubmissionViewSet, basename='application-submission')
router.register(r'application-checklist-templates', ApplicationChecklistTemplateViewSet, basename='application-checklist-template')
router.register(r'application-checklist-items', ApplicationChecklistItemViewSet, basename='application-checklist-item')
router.register(r'application-notes', ApplicationNoteViewSet, basename='application-note')
router.register(r'visa-cases', VisaCaseViewSet, basename='visa-case')
router.register(r'visa-milestones', VisaMilestoneViewSet, basename='visa-milestone')
router.register(r'finance/fees', FeeTypeViewSet, basename='fee-type')
router.register(r'finance/transactions', TransactionViewSet, basename='transaction')
router.register(r'finance/commissions', CommissionViewSet, basename='commission')
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'universities', UniversityViewSet, basename='university')
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'wishlists', CourseWishlistViewSet, basename='wishlist')
router.register(r'living-costs', LivingCostViewSet, basename='living-cost')
# Phase 3-4: Reviews, Careers, Quick Apply
router.register(r'course-reviews', CourseReviewViewSet, basename='course-review')
router.register(r'career-paths', CareerPathViewSet, basename='career-path')
router.register(r'quick-applies', CourseQuickApplyViewSet, basename='quick-apply')
router.register(r'audit-logs', AuditLogViewSet, basename='audit-log')
router.register(r'communications', CommunicationLogViewSet, basename='communication-log')
router.register(r'review-slas', ReviewSLAViewSet, basename='review-sla')
router.register(r'document-reviews', DocumentReviewViewSet, basename='document-review')
router.register(r'compliance/rules', ComplianceRuleViewSet, basename='compliance-rule')
router.register(r'compliance/changes', ComplianceRuleChangeViewSet, basename='compliance-change')
router.register(r'messaging/templates', MessageTemplateViewSet, basename='message-template')
router.register(r'messaging/logs', MessageLogViewSet, basename='message-log')
router.register(r'campaigns', CampaignViewSet, basename='campaign')
router.register(r'campaign-steps', CampaignStepViewSet, basename='campaign-step')
router.register(r'campaign-enrollments', CampaignEnrollmentViewSet, basename='campaign-enrollment')
router.register(r'campaign-activities', CampaignActivityViewSet, basename='campaign-activity')
router.register(r'automation/rules', AutomationRuleViewSet, basename='automation-rule')
router.register(r'automation/runs', AutomationRunViewSet, basename='automation-run')
router.register(r'automation/escalations', TaskEscalationPolicyViewSet, basename='automation-escalation')
router.register(r'analytics/reports', AnalyticsViewSet, basename='analytics')
router.register(r'analytics/inputs', BranchKpiInputViewSet, basename='analytics-input')
router.register(r'analytics/snapshots', MetricSnapshotViewSet, basename='analytics-snapshot')
router.register(r'governance/retention-policies', RetentionPolicyViewSet, basename='retention-policy')
router.register(r'governance/data-deletions', DataDeletionRequestViewSet, basename='data-deletion')
router.register(r'governance/access-reviews', AccessReviewCycleViewSet, basename='access-review')
router.register(r'governance/access-review-items', AccessReviewItemViewSet, basename='access-review-item')
router.register(r'operations/contracts', PartnerContractViewSet, basename='partner-contract')
router.register(r'operations/agents', AgentViewSet, basename='agent')
router.register(r'operations/agent-assignments', AgentAssignmentViewSet, basename='agent-assignment')
router.register(r'operations/ocr-jobs', OCRJobViewSet, basename='ocr-job')
router.register(r'portal/access', PortalAccessViewSet, basename='portal-access')
router.register(r'portal/notifications', PortalNotificationViewSet, basename='portal-notification')
router.register(r'appointments', AppointmentViewSet, basename='appointment')
router.register(r'appointment-reminders', AppointmentReminderViewSet, basename='appointment-reminder')
router.register(r'resources', ResourceViewSet, basename='resource') # Direct register or include?
# Actually, ResourceViewSet is in resources/views.py. 
# Better to import it here OR use include in urlpatterns.
# The existing pattern uses router.register for everything in this file.
# Let's import ResourceViewSet and register it here to match the pattern.



urlpatterns = [
    # Admin panel
    path('admin/', admin.site.urls),
    
    # JWT Authentication endpoints
    path('api/v1/auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v1/auth/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('api/v1/auth/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('api/v1/auth/logout/', LogoutView.as_view(), name='token_logout'),
    
    # Dashboard Statistics
    path('api/v1/dashboard/stats/', DashboardStatsView.as_view(), name='dashboard_stats'),
    
    # Visa Requirements Logic
    path('api/v1/requirements/check/', RequirementsCheckView.as_view(), name='requirements_check'),
    
    # Magic Link System
    path('api/v1/magic-links/', include('magic_links.urls')),

    # Portal public endpoints (student/parent)
    path('api/v1/portal/', include('portal.urls')),
    
    # API endpoints (v1)
    path('api/v1/resources/', include('resources.urls')),
    path('api/v1/visas/', include('visas.urls')),
    path('api/v1/tasks/', include('tasks.urls')),
    path('api/v1/', include(router.urls)),
    
    # DRF browsable API login (for testing)
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
]

# Serve media files in DEBUG mode
from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
