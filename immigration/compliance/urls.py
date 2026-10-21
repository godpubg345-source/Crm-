from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ComplianceRuleViewSet, ComplianceRuleChangeViewSet

router = DefaultRouter()
router.register(r'compliance/rules', ComplianceRuleViewSet, basename='compliance-rule')
router.register(r'compliance/changes', ComplianceRuleChangeViewSet, basename='compliance-change')

urlpatterns = [
    path('', include(router.urls)),
]
