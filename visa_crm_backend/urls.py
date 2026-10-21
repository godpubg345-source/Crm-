"""
URL configuration for visa_crm_backend project.
API endpoints are organized per-app using include().
Swagger/OpenAPI docs available at /api/docs/.
"""
from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

from apps.platform.requirements.views import RequirementsCheckView

urlpatterns = [
    # Admin panel
    path('admin/', admin.site.urls),

    # =========================================================================
    # API v1 Endpoints — organized by app
    # =========================================================================

    # Identity & Access (auth, users, attendance, leave, audit)
    path('api/v1/', include('apps.identity.accounts.urls')),
    path('api/v1/', include('apps.identity.audit.urls')),

    # CRM (students, leads, applications) — visas live in /immigration/
    path('api/v1/', include('apps.crm.students.urls')),
    path('api/v1/', include('apps.crm.applications.urls')),

    # Operations (branches, finance, tasks, governance, operations) — compliance lives in /immigration/
    path('api/v1/', include('apps.operations.branches.urls')),
    path('api/v1/', include('apps.operations.finance.urls')),
    path('api/v1/tasks/', include('apps.operations.tasks.urls')),
    path('api/v1/', include('apps.operations.governance.urls')),
    path('api/v1/', include('apps.operations.operations.urls')),

    # Engagement (communications, reviews, messaging, campaigns, appointments)
    path('api/v1/', include('apps.engagement.communications.urls')),
    path('api/v1/', include('apps.engagement.reviews.urls')),
    path('api/v1/', include('apps.engagement.messaging.urls')),
    path('api/v1/', include('apps.engagement.campaigns.urls')),
    path('api/v1/', include('apps.engagement.appointments.urls')),

    # Partners
    path('api/v1/', include('apps.partners.universities.urls')),

    # Platform (automation, analytics, portal, resources, magic-links)
    path('api/v1/', include('apps.platform.automation.urls')),
    path('api/v1/', include('apps.platform.analytics.urls')),
    path('api/v1/portal/', include('apps.platform.portal.urls')),
    path('api/v1/resources/', include('apps.platform.resources.urls')),
    path('api/v1/magic-links/', include('apps.platform.magic_links.urls')),

    # Visa Requirements (standalone view)
    path('api/v1/requirements/check/', RequirementsCheckView.as_view(), name='requirements_check'),

    # =========================================================================
    # API Documentation (Swagger / ReDoc)
    # =========================================================================
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # DRF browsable API login (for testing)
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
]

# Serve media files in DEBUG mode
from django.conf import settings
from django.conf.urls.static import static

# ---------------------------------------------------------------------------
# Immigration Suite (separate product, /immigration/) — mounted only when
# ENABLE_IMMIGRATION_MODULE=True. Endpoints: /api/v1/visas/*, /api/v1/compliance/*
# ---------------------------------------------------------------------------
if settings.ENABLE_IMMIGRATION_MODULE:
    urlpatterns += [
        path('api/v1/visas/', include('immigration.visas.urls')),
        path('api/v1/', include('immigration.compliance.urls')),
    ]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
