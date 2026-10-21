from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MessageTemplateViewSet, MessageLogViewSet

router = DefaultRouter()
router.register(r'messaging/templates', MessageTemplateViewSet, basename='message-template')
router.register(r'messaging/logs', MessageLogViewSet, basename='message-log')

urlpatterns = [
    path('', include(router.urls)),
]
