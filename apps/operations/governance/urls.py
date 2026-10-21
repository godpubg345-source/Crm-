from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RetentionPolicyViewSet, DataDeletionRequestViewSet,
    AccessReviewCycleViewSet, AccessReviewItemViewSet
)

router = DefaultRouter()
router.register(r'governance/retention-policies', RetentionPolicyViewSet, basename='retention-policy')
router.register(r'governance/data-deletions', DataDeletionRequestViewSet, basename='data-deletion')
router.register(r'governance/access-reviews', AccessReviewCycleViewSet, basename='access-review')
router.register(r'governance/access-review-items', AccessReviewItemViewSet, basename='access-review-item')

urlpatterns = [
    path('', include(router.urls)),
]
