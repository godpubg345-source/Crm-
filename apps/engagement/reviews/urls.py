from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReviewSLAViewSet, DocumentReviewViewSet

router = DefaultRouter()
router.register(r'review-slas', ReviewSLAViewSet, basename='review-sla')
router.register(r'document-reviews', DocumentReviewViewSet, basename='document-review')

urlpatterns = [
    path('', include(router.urls)),
]
