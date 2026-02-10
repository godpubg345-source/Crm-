from rest_framework import serializers
from .models import Lead, Student, Document, DocumentAlert, LeadInteraction, WhatsAppTemplate, CounselorAvailability
from branches.serializers import BranchListSerializer
from accounts.serializers import UserListSerializer


class LeadSerializer(serializers.ModelSerializer):
    """Serializer for Lead model."""
    branch_details = BranchListSerializer(source='branch', read_only=True)
    assigned_to_details = UserListSerializer(source='assigned_to', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    source_display = serializers.CharField(source='get_source_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    
    class Meta:
        model = Lead
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'branch', 'win_probability']

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
        from accounts.models import User

        user = request.user
        if not user or not user.is_authenticated:
            return attrs

        import logging
        logger = logging.getLogger(__name__)

        if 'assigned_to' in attrs:
            assigned_to = attrs['assigned_to']
            logger.info(f"Validating new assignment: {assigned_to}")
        elif self.instance:
            assigned_to = getattr(self.instance, 'assigned_to', None)
            logger.info(f"Validating existing assignment: {assigned_to}")
        else:
            assigned_to = None

        if assigned_to:
            logger.info(f"Assigned to role: {getattr(assigned_to, 'role', None)}")
            if getattr(assigned_to, 'role', None) != User.Role.COUNSELOR:
                raise serializers.ValidationError({'assigned_to': 'Only counselors can be assigned to leads.'})

            # HQ users (Super Admin, etc.) can assign anyone to any lead
            if is_hq_user(user):
                return attrs

            # Country Managers check country scope
            if is_country_manager(user):
                user_country = get_user_country(user)
                if not user_country or not assigned_to.branch or assigned_to.branch.country != user_country:
                    raise serializers.ValidationError({'assigned_to': 'Counselor is outside your country scope.'})
                return attrs

            # Branch Managers/others check branch scope
            branch = resolve_branch_from_request(request)
            if branch is None or assigned_to.branch != branch:
                raise serializers.ValidationError({'assigned_to': 'Counselor is outside your branch.'})

            lead_branch = attrs.get('branch') or (getattr(self.instance, 'branch', None) if self.instance else None)
            if lead_branch and assigned_to.branch and assigned_to.branch != lead_branch:
                raise serializers.ValidationError({'assigned_to': 'Assigned counselor must be in the same branch as the lead.'})

        return attrs


class LeadListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for Lead listings."""
    full_name = serializers.CharField(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    assigned_to_details = UserListSerializer(source='assigned_to', read_only=True)
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    
    class Meta:
        model = Lead
        fields = [
            'id', 'first_name', 'last_name', 'full_name', 'email', 'phone', 'source',
            'status', 'status_display', 'priority', 'priority_display', 'score',
            'target_country', 'branch', 'branch_name', 'assigned_to',
            'assigned_to_details', 'created_at', 'last_interaction_at', 
            'is_sla_violated', 'win_probability'
        ]


class StudentSerializer(serializers.ModelSerializer):
    """Serializer for Student model."""
    branch_details = BranchListSerializer(source='branch', read_only=True)
    counselor_details = UserListSerializer(source='counselor', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    full_name = serializers.CharField(read_only=True)
    profile_completeness = serializers.SerializerMethodField()
    
    class Meta:
        model = Student
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'profile_completeness', 'branch', 'counselor']

    def get_profile_completeness(self, obj):
        try:
            return obj.calculate_profile_completeness()
        except Exception:
            return obj.profile_completeness


class StudentListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for Student listings."""
    full_name = serializers.CharField(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    branch_details = BranchListSerializer(source='branch', read_only=True)
    counselor_details = UserListSerializer(source='counselor', read_only=True)
    profile_completeness = serializers.SerializerMethodField()
    
    class Meta:
        model = Student
        fields = [
            'id', 'student_code', 'full_name', 'email',
            'branch', 'branch_details', 'counselor', 'counselor_details',
            'profile_completeness', 'status', 'status_display', 'created_at'
        ]

    def get_profile_completeness(self, obj):
        try:
            return obj.calculate_profile_completeness()
        except Exception:
            return obj.profile_completeness


class DocumentSerializer(serializers.ModelSerializer):
    """Serializer for Document model."""
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    verification_status_display = serializers.CharField(source='get_verification_status_display', read_only=True)
    
    class Meta:
        model = Document
        fields = '__all__'
        read_only_fields = [
            'id', 'created_at', 'updated_at', 
            'branch',
            'file_name',       # Auto-set in perform_create
            'file_size',       # Auto-set in perform_create
            'uploaded_by',     # Auto-set in perform_create
            'verified_by',     # Set during verification
            'verified_at',     # Set during verification
        ]

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
        application = attrs.get('application') or getattr(self.instance, 'application', None)

        if application and student and application.student_id != student.id:
            raise serializers.ValidationError({'application': 'Application student must match document student.'})
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


class DocumentListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for Document listings."""
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = Document
        fields = ['id', 'student', 'application', 'category', 'category_display', 'document_type', 'file_name', 'file', 'is_verified', 'verification_status', 'created_at']

class DocumentAlertSerializer(serializers.ModelSerializer):
    """Serializer for document expiry alerts."""
    student_name = serializers.CharField(source='document.student.full_name', read_only=True)
    document_type = serializers.CharField(source='document.document_type', read_only=True)
    expiry_date = serializers.DateField(source='document.expiry_date', read_only=True)
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    
    class Meta:
        model = DocumentAlert
        fields = [
            'id', 'document', 'student_name', 'document_type', 
            'expiry_date', 'alert_date', 'severity', 'severity_display',
            'is_acknowledged', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'alert_date']


class LeadInteractionSerializer(serializers.ModelSerializer):
    """Serializer for Lead Interaction Timeline."""
    staff_details = UserListSerializer(source='staff', read_only=True)
    type_display = serializers.CharField(source='get_type_display', read_only=True)

    class Meta:
        model = LeadInteraction
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'timestamp', 'branch', 'staff']


class CounselorAvailabilitySerializer(serializers.ModelSerializer):
    """Serializer for counselor availability slots."""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    day_name = serializers.CharField(source='get_day_of_week_display', read_only=True)

    class Meta:
        model = CounselorAvailability
        fields = '__all__'
        read_only_fields = ['id', 'branch']


class BulkLeadActionSerializer(serializers.Serializer):
    """Serializer for bulk operations on leads."""
    lead_ids = serializers.ListField(child=serializers.UUIDField())
    action = serializers.ChoiceField(choices=['ASSIGN', 'STATUS_UPDATE', 'WHATSAPP_TEMPLATE'])
    
    # Optional fields based on action
    assigned_to = serializers.UUIDField(required=False)
    status = serializers.ChoiceField(choices=Lead.Status.choices, required=False)
    template_id = serializers.IntegerField(required=False)


class WhatsAppTemplateSerializer(serializers.ModelSerializer):
    """Serializer for WhatsApp Automation Templates."""
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = WhatsAppTemplate
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'branch']
