from rest_framework import serializers
from .models import MagicLink
from requirements.models import RequiredDocument
from requirements.serializers import RequiredDocumentSerializer

from students.models import Student

class CreateMagicLinkSerializer(serializers.ModelSerializer):
    expiry_hours = serializers.IntegerField(write_only=True, required=False, default=48)
    
    # Explicitly defined as PrimaryKeyRelatedField (Handles UUIDs automatically)
    requirements = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=RequiredDocument.objects.all()
    )
    
    student = serializers.PrimaryKeyRelatedField(
        queryset=Student.objects.all()
    )
    
    class Meta:
        model = MagicLink
        fields = ['student', 'requirements', 'expiry_hours']

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

        student = attrs.get('student')
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

class MagicLinkDetailSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    requirements = RequiredDocumentSerializer(many=True, read_only=True)
    
    class Meta:
        model = MagicLink
        fields = ['token', 'student_name', 'requirements', 'expires_at', 'is_used']
