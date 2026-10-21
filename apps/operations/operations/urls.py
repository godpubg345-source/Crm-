from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PartnerContractViewSet, AgentViewSet, AgentAssignmentViewSet, OCRJobViewSet

router = DefaultRouter()
router.register(r'operations/contracts', PartnerContractViewSet, basename='partner-contract')
router.register(r'operations/agents', AgentViewSet, basename='agent')
router.register(r'operations/agent-assignments', AgentAssignmentViewSet, basename='agent-assignment')
router.register(r'operations/ocr-jobs', OCRJobViewSet, basename='ocr-job')

urlpatterns = [
    path('', include(router.urls)),
]
