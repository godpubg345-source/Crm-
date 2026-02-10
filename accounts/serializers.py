from rest_framework import serializers
from django.contrib.auth import get_user_model
from branches.serializers import BranchListSerializer
from .models import (
    EmployeePerformance, EmployeeDossier, EmployeeAuditLog, 
    EmployeeIncentive, EmployeePayroll, AttendanceLog, LeaveRequest
)

User = get_user_model()


class EmployeeDossierSerializer(serializers.ModelSerializer):
    """Serializer for sensitive HR data."""
    contract_type_display = serializers.CharField(source='get_contract_type_display', read_only=True)
    
    class Meta:
        model = EmployeeDossier
        fields = [
            'base_salary', 'currency', 'joined_date', 
            'probation_end_date', 'contract_type', 
            'contract_type_display', 'contract_progress',
            'last_review_date', 'next_review_date'
        ]


class EmployeePerformanceSerializer(serializers.ModelSerializer):
    """Serializer for employee performance metrics."""
    class Meta:
        model = EmployeePerformance
        fields = [
            'points', 'xp', 'level', 'total_conversions', 
            'revenue_generated', 'wallet_balance', 'last_active'
        ]


class EmployeeAuditLogSerializer(serializers.ModelSerializer):
    """Serializer for forensic auditing logs."""
    actor_name = serializers.CharField(source='actor.get_full_name', read_only=True)
    
    class Meta:
        model = EmployeeAuditLog
        fields = [
            'id', 'actor_name', 'event_type', 
            'field_name', 'old_value', 'new_value', 
            'timestamp', 'ip_address'
        ]


class EmployeeIncentiveSerializer(serializers.ModelSerializer):
    """Serializer for monthly incentive performance."""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    month_display = serializers.SerializerMethodField()
    
    class Meta:
        model = EmployeeIncentive
        fields = [
            'id', 'month', 'month_display', 'points_earned', 
            'conversions', 'revenue_generated', 'base_incentive',
            'performance_multiplier', 'total_incentive', 
            'status', 'status_display', 'remarks'
        ]
        
    def get_month_display(self, obj):
        return obj.month.strftime('%B %Y')


class EmployeePayrollSerializer(serializers.ModelSerializer):
    """Serializer for monthly payroll records."""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    month_display = serializers.SerializerMethodField()
    
    class Meta:
        model = EmployeePayroll
        fields = [
            'id', 'month', 'month_display', 'base_salary_snapshot', 
            'incentive_total', 'gross_payout', 'tax_deductions', 
            'other_deductions', 'net_payout', 'status', 
            'status_display', 'payout_date', 'payslip_pdf'
        ]
        
    def get_month_display(self, obj):
        return obj.month.strftime('%B %Y')


class AttendanceLogSerializer(serializers.ModelSerializer):
    """Serializer for digital attendance logs."""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = AttendanceLog
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class LeaveRequestSerializer(serializers.ModelSerializer):
    """Serializer for leave management workflow."""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    leave_type_display = serializers.CharField(source='get_leave_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    
    class Meta:
        model = LeaveRequest
        fields = '__all__'
        read_only_fields = ['id', 'status', 'approved_by', 'created_at', 'updated_at']


class EmployeeLeaderboardSerializer(serializers.ModelSerializer):
    """Serializer for competitive employee rankings."""
    performance = EmployeePerformanceSerializer(read_only=True)
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'full_name', 'email', 'role', 'performance']



class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""
    branch_details = BranchListSerializer(source='branch', read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    performance = EmployeePerformanceSerializer(read_only=True)
    dossier = EmployeeDossierSerializer(required=False)
    audit_records = EmployeeAuditLogSerializer(many=True, read_only=True)
    performance_incentives = EmployeeIncentiveSerializer(many=True, read_only=True)
    payroll_records = EmployeePayrollSerializer(many=True, read_only=True)
    attendance_logs = AttendanceLogSerializer(many=True, read_only=True)
    leave_requests = LeaveRequestSerializer(many=True, read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name',
            'role', 'role_display', 'branch', 'branch_details',
            'phone', 'is_active', 'is_staff', 'is_superuser', 'last_login',
            'date_joined', 'performance', 'dossier', 
            'audit_records', 'performance_incentives', 'payroll_records',
            'attendance_logs', 'leave_requests'
        ]
        read_only_fields = ['id', 'last_login', 'is_staff', 'performance', 'payroll_records']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False}
        }

    def update(self, instance, validated_data):
        dossier_data = validated_data.pop('dossier', None)
        instance = super().update(instance, validated_data)
        
        if dossier_data:
            dossier, _ = EmployeeDossier.objects.get_or_create(user=instance)
            for attr, value in dossier_data.items():
                setattr(dossier, attr, value)
            dossier.save()
            
        return instance

    def validate(self, attrs):
        request = self.context.get('request')
        if not request:
            return attrs

        from core.utils.branch_context import resolve_branch_from_request, is_hq_user, is_country_manager, get_user_country

        user = request.user
        if not user or not user.is_authenticated:
            return attrs

        if not is_hq_user(user):
            # Restrict HQ-level role assignment
            role = attrs.get('role')
            if role in [User.Role.SUPER_ADMIN, User.Role.AUDITOR]:
                raise serializers.ValidationError({'role': 'Only Super Admin can assign HQ roles.'})

            # Restrict cross-branch updates
            branch = resolve_branch_from_request(request)
            requested_branch = attrs.get('branch')

            if is_country_manager(user):
                user_country = get_user_country(user)
                target_branch = requested_branch or branch or user.branch
                if target_branch is None:
                    raise serializers.ValidationError({'branch': 'Branch is required.'})
                if not user_country or target_branch.country != user_country:
                    raise serializers.ValidationError({'branch': 'You cannot assign a different country branch.'})
                attrs['branch'] = target_branch
            else:
                if branch is None:
                    raise serializers.ValidationError({'branch': 'Branch is required.'})
                if requested_branch and requested_branch != branch:
                    raise serializers.ValidationError({'branch': 'You cannot assign a different branch.'})
                attrs['branch'] = branch

        return attrs


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new users."""
    password = serializers.CharField(write_only=True, min_length=10)
    
    class Meta:
        model = User
        fields = [
            'email', 'username', 'first_name', 'last_name',
            'role', 'branch', 'phone', 'password'
        ]

    def validate(self, attrs):
        request = self.context.get('request')
        if not request:
            return attrs

        from core.utils.branch_context import resolve_branch_from_request, is_hq_user, is_country_manager, get_user_country

        user = request.user
        if not user or not user.is_authenticated:
            return attrs

        if not is_hq_user(user):
            branch = resolve_branch_from_request(request)
            requested_branch = attrs.get('branch')
            if is_country_manager(user):
                user_country = get_user_country(user)
                target_branch = requested_branch or branch or user.branch
                if target_branch is None:
                    raise serializers.ValidationError({'branch': 'Branch is required.'})
                if not user_country or target_branch.country != user_country:
                    raise serializers.ValidationError({'branch': 'You cannot assign a different country branch.'})
                attrs['branch'] = target_branch
            else:
                if branch is None:
                    raise serializers.ValidationError({'branch': 'Branch is required.'})
                if requested_branch and requested_branch != branch:
                    raise serializers.ValidationError({'branch': 'You cannot assign a different branch.'})
                attrs['branch'] = branch

            role = attrs.get('role')
            if role in [User.Role.SUPER_ADMIN, User.Role.AUDITOR]:
                raise serializers.ValidationError({'role': 'Only Super Admin can assign HQ roles.'})

        return attrs
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for User listings."""
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'role_display', 'branch', 'is_active']
