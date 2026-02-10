from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VisaCaseViewSet, VisaMilestoneViewSet

router = DefaultRouter()
router.register(r'cases', VisaCaseViewSet, basename='visa-case')
router.register(r'milestones', VisaMilestoneViewSet, basename='visa-milestone')

urlpatterns = [
    path('', include(router.urls)),
]
