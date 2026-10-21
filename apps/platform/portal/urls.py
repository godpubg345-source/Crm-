from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    PortalAccessViewSet, PortalNotificationViewSet,
    PortalAuthView, PortalLogoutView, PortalMeView, PortalUploadDocumentView
)

router = DefaultRouter()
router.register(r'access', PortalAccessViewSet, basename='portal-access')
router.register(r'notifications', PortalNotificationViewSet, basename='portal-notification')

urlpatterns = [
    path('auth/login/', PortalAuthView.as_view(), name='portal_auth_login'),
    path('auth/logout/', PortalLogoutView.as_view(), name='portal_auth_logout'),
    path('me/', PortalMeView.as_view(), name='portal_me'),
    path('me/upload-document/', PortalUploadDocumentView.as_view(), name='portal_upload_document'),
    path('', include(router.urls)),
]

