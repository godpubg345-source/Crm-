from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LeadViewSet, StudentViewSet, DocumentViewSet, DocumentAlertViewSet,
    DashboardStatsView, LeadInteractionViewSet, WhatsAppTemplateViewSet,
    CounselorAvailabilityViewSet
)

router = DefaultRouter()
router.register(r'leads', LeadViewSet, basename='lead')
router.register(r'lead-interactions', LeadInteractionViewSet, basename='lead-interaction')
router.register(r'lead-whatsapp-templates', WhatsAppTemplateViewSet, basename='whatsapp-template')
router.register(r'counselor-availability', CounselorAvailabilityViewSet, basename='counselor-availability')
router.register(r'students', StudentViewSet, basename='student')
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'document-alerts', DocumentAlertViewSet, basename='document-alert')

urlpatterns = [
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard_stats'),
    path('', include(router.urls)),
]
