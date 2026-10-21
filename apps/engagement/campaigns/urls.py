from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CampaignViewSet, CampaignStepViewSet,
    CampaignEnrollmentViewSet, CampaignActivityViewSet
)

router = DefaultRouter()
router.register(r'campaigns', CampaignViewSet, basename='campaign')
router.register(r'campaign-steps', CampaignStepViewSet, basename='campaign-step')
router.register(r'campaign-enrollments', CampaignEnrollmentViewSet, basename='campaign-enrollment')
router.register(r'campaign-activities', CampaignActivityViewSet, basename='campaign-activity')

urlpatterns = [
    path('', include(router.urls)),
]
