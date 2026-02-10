from django.urls import path

from .views import PortalAuthView, PortalLogoutView, PortalMeView, PortalUploadDocumentView

urlpatterns = [
    path('auth/login/', PortalAuthView.as_view(), name='portal_auth_login'),
    path('auth/logout/', PortalLogoutView.as_view(), name='portal_auth_logout'),
    path('me/', PortalMeView.as_view(), name='portal_me'),
    path('me/upload-document/', PortalUploadDocumentView.as_view(), name='portal_upload_document'),
]
