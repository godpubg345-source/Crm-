from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AppointmentViewSet, AppointmentReminderViewSet

router = DefaultRouter()
router.register(r'appointments', AppointmentViewSet, basename='appointment')
router.register(r'appointment-reminders', AppointmentReminderViewSet, basename='appointment-reminder')

urlpatterns = [
    path('', include(router.urls)),
]
