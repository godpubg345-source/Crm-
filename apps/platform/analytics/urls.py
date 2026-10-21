from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AnalyticsViewSet, BranchKpiInputViewSet, MetricSnapshotViewSet

router = DefaultRouter()
router.register(r'analytics/reports', AnalyticsViewSet, basename='analytics')
router.register(r'analytics/inputs', BranchKpiInputViewSet, basename='analytics-input')
router.register(r'analytics/snapshots', MetricSnapshotViewSet, basename='analytics-snapshot')

urlpatterns = [
    path('', include(router.urls)),
]
