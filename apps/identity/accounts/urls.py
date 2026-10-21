from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenVerifyView
from .views import (
    UserViewSet, CustomTokenObtainPairView, CustomTokenRefreshView, LogoutView,
    AttendanceLogViewSet, LeaveRequestViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'attendance', AttendanceLogViewSet, basename='attendance')
router.register(r'leave-requests', LeaveRequestViewSet, basename='leave-request')

# Auth-specific paths
auth_urlpatterns = [
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('logout/', LogoutView.as_view(), name='token_logout'),
]

urlpatterns = [
    path('auth/', include((auth_urlpatterns, 'auth'))),
    path('', include(router.urls)),
]
