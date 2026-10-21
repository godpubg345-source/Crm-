from rest_framework import serializers
from .models import VisaCase, VisaMilestone
from apps.crm.students.serializers import StudentListSerializer
from apps.crm.applications.serializers import ApplicationListSerializer


class VisaCaseSerializer(serializers.ModelSerializer):
    """Serializer for VisaCase model."""
    student_details = StudentListSerializer(source='student', read_only=True)
    application_details = ApplicationListSerializer(source='application', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    decision_status_display = serializers.CharField(source='get_decision_status_display', read_only=True)
    student_nationality = serializers.CharField(source='student.nationality', read_only=True)
    destination_country = serializers.CharField(source='application.university.country.name', read_only=True)
    
    class Meta:
        model = VisaCase
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'application': {'required': False}
        }

    def validate(self, attrs):
        request = self.context.get('request')
        if not request:
            return attrs

        from apps.platform.core.utils.branch_context import (
            resolve_branch_from_request,
            is_hq_user,
            is_country_manager,
            get_user_country,
        )

        user = request.user
        if not user or not user.is_authenticated:
            return attrs

        student = attrs.get('student') or getattr(self.instance, 'student', None)
        application = attrs.get('application') or getattr(self.instance, 'application', None)

        if student and application and application.student_id != student.id:
            raise serializers.ValidationError({'application': 'Application does not belong to this student.'})

        if not is_hq_user(user):
            if is_country_manager(user):
                user_country = get_user_country(user)
                if student and (not user_country or student.branch.country != user_country):
                    raise serializers.ValidationError({'student': 'Student is outside your country scope.'})
                if application and (not user_country or application.student.branch.country != user_country):
                    raise serializers.ValidationError({'application': 'Application is outside your country scope.'})
            else:
                branch = resolve_branch_from_request(request)
                if student and (branch is None or student.branch != branch):
                    raise serializers.ValidationError({'student': 'Student is outside your branch.'})
                if application and (branch is None or application.student.branch != branch):
                    raise serializers.ValidationError({'application': 'Application is outside your branch.'})

        return attrs


class VisaCaseListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for VisaCase listings."""
    student_details = StudentListSerializer(source='student', read_only=True)
    application_details = ApplicationListSerializer(source='application', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    decision_status_display = serializers.CharField(source='get_decision_status_display', read_only=True)
    milestone_stats = serializers.SerializerMethodField()
    
    class Meta:
        model = VisaCase
        fields = [
            'id', 'student', 'student_details', 'application', 'application_details',
            'status', 'status_display', 'decision_status', 'decision_status_display',
            'vfs_date', 'biometric_done', 'milestone_stats',
            'ihs_amount', 'visa_fee_amount', 'created_at'
        ]

    def get_milestone_stats(self, obj):
        milestones = obj.milestones.all()
        return {
            'total': milestones.count(),
            'completed': milestones.filter(status='COMPLETED').count()
        }


class VisaMilestoneSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = VisaMilestone
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'branch']
