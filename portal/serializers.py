from rest_framework import serializers

from core.serializers import MaskedPIISerializerMixin
from students.models import Student
from accounts.serializers import UserListSerializer
from .models import PortalAccess, PortalNotification, PortalSession


class PortalStudentSerializer(MaskedPIISerializerMixin, serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    mask_fields = ['email', 'phone', 'passport_number']

    class Meta:
        model = Student
        fields = ['id', 'student_code', 'full_name', 'email', 'phone', 'status', 'status_display']


class PortalAccessSerializer(serializers.ModelSerializer):
    student_details = PortalStudentSerializer(source='student', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    created_by_details = UserListSerializer(source='created_by', read_only=True)

    class Meta:
        model = PortalAccess
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'branch', 'invite_token', 'created_by']


class PortalNotificationSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    created_by_details = UserListSerializer(source='created_by', read_only=True)

    class Meta:
        model = PortalNotification
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'branch', 'read_at']


class PortalSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PortalSession
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'branch', 'revoked_at', 'last_seen_at']
