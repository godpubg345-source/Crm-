from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AutomationRuleViewSet, AutomationRunViewSet, TaskEscalationPolicyViewSet

router = DefaultRouter()
router.register(r'automation/rules', AutomationRuleViewSet, basename='automation-rule')
router.register(r'automation/runs', AutomationRunViewSet, basename='automation-run')
router.register(r'automation/escalations', TaskEscalationPolicyViewSet, basename='automation-escalation')

urlpatterns = [
    path('', include(router.urls)),
]
