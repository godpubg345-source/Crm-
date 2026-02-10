from rest_framework import serializers
from .models import FeeType, Transaction, CommissionClaim
from students.serializers import StudentListSerializer
from applications.serializers import ApplicationListSerializer
from universities.serializers import UniversityListSerializer


class FeeTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeeType
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'branch']


class TransactionSerializer(serializers.ModelSerializer):
    student_details = StudentListSerializer(source='student', read_only=True)
    fee_type_name = serializers.CharField(source='fee_type.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Transaction
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'date', 'recorded_by', 'branch']

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
        fee_type = attrs.get('fee_type') or getattr(self.instance, 'fee_type', None)

        if not is_hq_user(user):
            if is_country_manager(user):
                user_country = get_user_country(user)
                if student and (not user_country or student.branch.country != user_country):
                    raise serializers.ValidationError({'student': 'Student is outside your country scope.'})
            else:
                branch = resolve_branch_from_request(request)
                if student and (branch is None or student.branch != branch):
                    raise serializers.ValidationError({'student': 'Student is outside your branch.'})
            if fee_type and student and fee_type.branch != student.branch:
                raise serializers.ValidationError({'fee_type': 'Fee type does not match student branch.'})

        return attrs


class CommissionClaimSerializer(serializers.ModelSerializer):
    """Serializer for Commission Claims."""
    application_details = ApplicationListSerializer(source='application', read_only=True)
    university_details = UniversityListSerializer(source='university', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = CommissionClaim
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'branch']

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

        application = attrs.get('application') or getattr(self.instance, 'application', None)
        if application and not is_hq_user(user):
            if is_country_manager(user):
                user_country = get_user_country(user)
                if not user_country or application.student.branch.country != user_country:
                    raise serializers.ValidationError({'application': 'Application is outside your country scope.'})
            else:
                branch = resolve_branch_from_request(request)
                if branch is None or application.student.branch != branch:
                    raise serializers.ValidationError({'application': 'Application is outside your branch.'})

        return attrs
