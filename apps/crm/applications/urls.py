from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ApplicationViewSet,
    ApplicationSubmissionViewSet,
    ApplicationChecklistTemplateViewSet,
    ApplicationChecklistItemViewSet,
    ApplicationNoteViewSet
)

router = DefaultRouter()
router.register(r'applications', ApplicationViewSet, basename='application')
router.register(r'application-submissions', ApplicationSubmissionViewSet, basename='application-submission')
router.register(r'application-checklist-templates', ApplicationChecklistTemplateViewSet, basename='application-checklist-template')
router.register(r'application-checklist-items', ApplicationChecklistItemViewSet, basename='application-checklist-item')
router.register(r'application-notes', ApplicationNoteViewSet, basename='application-note')

urlpatterns = [
    path('', include(router.urls)),
]
