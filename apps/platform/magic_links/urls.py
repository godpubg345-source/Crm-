from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ManageMagicLinkViewSet, PublicMagicLinkView, MagicLinkUploadView

# Router for ViewSets
router = DefaultRouter()
router.register(r'', ManageMagicLinkViewSet, basename='magic-link')

urlpatterns = [
    # Staff: Generate Link (via ViewSet)
    # The router keys it to '' (so /api/v1/magic-links/), handling POST/GET
    path('', include(router.urls)),
    
    # Public: Validation & Upload
    path('public/<uuid:token>/', PublicMagicLinkView.as_view(), name='public_magic_link'),
    path('public/<uuid:token>/upload/', MagicLinkUploadView.as_view(), name='public_magic_link_upload'),
]
