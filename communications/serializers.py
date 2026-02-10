from rest_framework import serializers

from accounts.serializers import UserListSerializer
from students.serializers import StudentListSerializer
from .models import CommunicationLog


class CommunicationLogSerializer(serializers.ModelSerializer):
    student_details = StudentListSerializer(source='student', read_only=True)
    logged_by_details = UserListSerializer(source='logged_by', read_only=True)
    communication_type_display = serializers.CharField(source='get_communication_type_display', read_only=True)
    direction_display = serializers.CharField(source='get_direction_display', read_only=True)

    class Meta:
        model = CommunicationLog
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'logged_by']

    def validate(self, attrs):
        request = self.context.get('request')
        if not request:
            return attrs

        from core.utils.branch_context import (
            resolve_branch_from_request,
            is_hq_user,
            is_country_manager,
            get_user_country,
        )

        user = request.user
        if not user or not user.is_authenticated:
            return attrs

        student = attrs.get('student') or getattr(self.instance, 'student', None)
        if student and not is_hq_user(user):
            if is_country_manager(user):
                user_country = get_user_country(user)
                if not user_country or student.branch.country != user_country:
                    raise serializers.ValidationError({'student': 'Student is outside your country scope.'})
            else:
                branch = resolve_branch_from_request(request)
                if branch is None or student.branch != branch:
                    raise serializers.ValidationError({'student': 'Student is outside your branch.'})

        return attrs
