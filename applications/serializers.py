from rest_framework import serializers
from accounts.serializers import UserListSerializer
from students.serializers import StudentListSerializer, DocumentListSerializer
from universities.serializers import UniversityListSerializer, CourseListSerializer
from .models import (
    Application,
    ApplicationStatusLog,
    ApplicationSubmission,
    ApplicationChecklistTemplate,
    ApplicationChecklistItem,
    ApplicationNote
)
from django.utils import timezone

class ApplicationStatusLogSerializer(serializers.ModelSerializer):
    """Serializer for Application Status History."""
    changed_by_details = UserListSerializer(source='changed_by', read_only=True)
    from_status_display = serializers.CharField(source='get_from_status_display', read_only=True)
    to_status_display = serializers.CharField(source='get_to_status_display', read_only=True)
    
    class Meta:
        model = ApplicationStatusLog
        fields = '__all__'


class ApplicationChecklistTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicationChecklistTemplate
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'branch']


class ApplicationChecklistItemSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    document_details = DocumentListSerializer(source='document', read_only=True)

    class Meta:
        model = ApplicationChecklistItem
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'branch', 'submitted_at', 'verified_at']


class ApplicationNoteSerializer(serializers.ModelSerializer):
    created_by_details = UserListSerializer(source='created_by', read_only=True)

    class Meta:
        model = ApplicationNote
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'branch', 'created_by']


class ApplicationSubmissionDetailSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = ApplicationSubmission
        fields = [
            'id', 'portal_url', 'portal_username', 'portal_notes',
            'submitted_at', 'submission_reference', 'artifact',
            'status', 'status_display', 'created_at', 'updated_at'
        ]


class ApplicationDetailSerializer(serializers.ModelSerializer):
    """Serializer for Application model."""
    student_details = StudentListSerializer(source='student', read_only=True)
    student_id = serializers.CharField(source='student.id', read_only=True)
    university_details = UniversityListSerializer(source='university', read_only=True)
    course_details = CourseListSerializer(source='course', read_only=True)
    assigned_to_details = UserListSerializer(source='assigned_to', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    application_type_display = serializers.CharField(source='get_application_type_display', read_only=True)
    intake_date = serializers.CharField(source='intake', required=False)
    checklist_items = ApplicationChecklistItemSerializer(many=True, read_only=True)
    collab_notes = ApplicationNoteSerializer(source='application_notes', many=True, read_only=True)
    submission_details = ApplicationSubmissionDetailSerializer(source='submission', read_only=True)
    risk_flags = serializers.SerializerMethodField()
    checklist_progress = serializers.SerializerMethodField()
    
    class Meta:
        model = Application
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_risk_flags(self, obj):
        flags = []
        days = (timezone.now() - obj.updated_at).days if obj.updated_at else 0
        if days > 14 and obj.status not in [Application.Status.OFFER_ACCEPTED, Application.Status.CAS_RECEIVED]:
            flags.append('stuck')
        if obj.status == Application.Status.CAS_REQUESTED and days > 7:
            flags.append('cas_pending_delayed')
        if obj.status == Application.Status.CONDITIONAL_OFFER and not obj.offer_conditions:
            flags.append('missing_conditions')
        if obj.checklist_items.filter(is_required=True).exists():
            missing_required = obj.checklist_items.filter(
                is_required=True,
                status__in=[ApplicationChecklistItem.Status.MISSING, ApplicationChecklistItem.Status.REJECTED]
            ).exists()
            if missing_required:
                flags.append('docs_missing')
        return flags

    def get_checklist_progress(self, obj):
        total = obj.checklist_items.count()
        if total == 0:
            return {'total': 0, 'completed': 0, 'percent': 0}
        completed = obj.checklist_items.filter(status=ApplicationChecklistItem.Status.VERIFIED).count()
        percent = int((completed / total) * 100)
        return {'total': total, 'completed': completed, 'percent': percent}

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
        assigned_to = attrs.get('assigned_to') or getattr(self.instance, 'assigned_to', None)
        if student:
            # Always align application.branch to student's branch
            attrs['branch'] = student.branch

            if not is_hq_user(user):
                if is_country_manager(user):
                    user_country = get_user_country(user)
                    if not user_country or student.branch.country != user_country:
                        raise serializers.ValidationError({'student': 'Student is outside your country scope.'})
                else:
                    branch = resolve_branch_from_request(request)
                    if branch is None or student.branch != branch:
                        raise serializers.ValidationError({'student': 'Student is outside your branch.'})

        if assigned_to:
            from accounts.models import User
            if getattr(assigned_to, 'role', None) != User.Role.COUNSELOR:
                raise serializers.ValidationError({'assigned_to': 'Only counselors can be assigned to applications.'})

            if not is_hq_user(user):
                if is_country_manager(user):
                    user_country = get_user_country(user)
                    if not user_country or not assigned_to.branch or assigned_to.branch.country != user_country:
                        raise serializers.ValidationError({'assigned_to': 'Counselor is outside your country scope.'})
                else:
                    branch = resolve_branch_from_request(request)
                    if branch is None or assigned_to.branch != branch:
                        raise serializers.ValidationError({'assigned_to': 'Counselor is outside your branch.'})

                if student and assigned_to.branch and student.branch != assigned_to.branch:
                    raise serializers.ValidationError({'assigned_to': 'Assigned counselor must match student branch.'})

        return attrs


class ApplicationListSerializer(serializers.ModelSerializer):
    """
    Enhanced Serializer for Application Control Center.
    Includes flattened student/university data and computed risk fields.
    """
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    # Flattened Student Data
    student_code = serializers.CharField(source='student.student_code', read_only=True)
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    counselor_name = serializers.CharField(source='student.counselor.get_full_name', read_only=True)
    student_id = serializers.CharField(source='student.id', read_only=True)
    assigned_to_details = UserListSerializer(source='assigned_to', read_only=True)
    
    # Flattened University Data
    university_name_display = serializers.SerializerMethodField()
    course_name_display = serializers.SerializerMethodField()
    country = serializers.SerializerMethodField()
    
    # Computed Fields
    days_in_current_status = serializers.SerializerMethodField()
    risk_flags = serializers.SerializerMethodField()
    checklist_progress = serializers.SerializerMethodField()
    intake_date = serializers.CharField(source='intake', read_only=True)

    class Meta:
        model = Application
        fields = [
            'id', 'student', 'student_id', 'student_code', 'student_name', 'counselor_name',
            'assigned_to', 'assigned_to_details', 'university', 'course',
            'university_name_display', 'course_name_display', 'country',
            'intake_date', 'status', 'status_display', 'cas_number', 
            'application_ref', 'priority', 'fit_score', 'risk_score',
            'target_offer_date', 'target_cas_date', 'next_action_at', 'last_activity_at',
            'updated_at', 'days_in_current_status', 'risk_flags', 'checklist_progress'
        ]
    
    def get_university_name_display(self, obj):
        if obj.university:
            return obj.university.name
        return obj.university_name or 'Unknown'
    def get_course_name_display(self, obj):
        if obj.course:
            return obj.course.name
        return obj.course_name or 'Unknown'
    
    def get_country(self, obj):
        if obj.university:
            return obj.university.get_country_display()
        return None

    def get_days_in_current_status(self, obj):
        if not obj.updated_at:
            return 0
        return (timezone.now() - obj.updated_at).days

    def get_risk_flags(self, obj):
        flags = []
        
        # Risk 1: Stuck in status for too long (e.g., > 14 days)
        # Note: days_in_current_status is annotated in ViewSet
        days = self.get_days_in_current_status(obj) or 0
        if days > 14 and obj.status not in [Application.Status.OFFER_ACCEPTED, Application.Status.CAS_RECEIVED]:
            flags.append('stuck')
            
        # Risk 2: CAS Requested but not received > 7 days
        if obj.status == Application.Status.CAS_REQUESTED and days > 7:
            flags.append('cas_pending_delayed')
            
        # Risk 3: Conditional Offer but no conditions logged
        if obj.status == Application.Status.CONDITIONAL_OFFER and not obj.offer_conditions:
            flags.append('missing_conditions')
            
        return flags

    def get_checklist_progress(self, obj):
        total = getattr(obj, 'checklist_items', None)
        if not total:
            return {'total': 0, 'completed': 0, 'percent': 0}
        total_count = total.count()
        if total_count == 0:
            return {'total': 0, 'completed': 0, 'percent': 0}
        completed = total.filter(status=ApplicationChecklistItem.Status.VERIFIED).count()
        percent = int((completed / total_count) * 100)
        return {'total': total_count, 'completed': completed, 'percent': percent}


class ApplicationSubmissionSerializer(serializers.ModelSerializer):
    application_details = ApplicationListSerializer(source='application', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = ApplicationSubmission
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'branch', 'created_by']

    def validate(self, attrs):
        application = attrs.get('application') or getattr(self.instance, 'application', None)
        if application and attrs.get('branch') and attrs['branch'] != application.student.branch:
            raise serializers.ValidationError({'branch': 'Branch must match application student branch.'})
        return attrs
