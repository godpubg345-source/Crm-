from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from visa_crm_backend.mixins import BranchIsolationMixin
from audit.mixins import AuditLogMixin
from accounts.models import User
from accounts.permissions import ApplicationPermission
from .models import (
    Application,
    ApplicationStatusLog,
    ApplicationSubmission,
    ApplicationChecklistTemplate,
    ApplicationChecklistItem,
    ApplicationNote
)
from .services import ApplicationService
from .serializers import (
    ApplicationDetailSerializer, 
    ApplicationListSerializer, 
    ApplicationStatusLogSerializer,
    ApplicationSubmissionSerializer,
    ApplicationChecklistTemplateSerializer,
    ApplicationChecklistItemSerializer,
    ApplicationNoteSerializer
)


class ApplicationViewSet(AuditLogMixin, BranchIsolationMixin, viewsets.ModelViewSet):
    """
    ViewSet for Application CRUD operations type.
    Applications are filtered by student's branch.
    Includes Control Center logic: State Transitions, Logs, Risk Analysis.
    """
    queryset = Application.objects.select_related(
        'student', 'student__branch', 'student__counselor', 'university', 'course', 'assigned_to'
    ).prefetch_related('checklist_items', 'application_notes').all()
    branch_field = 'student__branch'  # Filter through student's branch
    permission_classes = [IsAuthenticated, ApplicationPermission]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'priority', 'assigned_to', 'student', 'university', 'course', 'intake']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ApplicationListSerializer
        return ApplicationDetailSerializer

    def get_queryset(self):
        """
        Use custom manager method for cleaner filtering.
        Branch isolation is applied by BranchIsolationMixin via filter_queryset usually,
        but we can chain it if needed or rely on the mixin.
        """
        queryset = super().get_queryset()
        return queryset.for_user(self.request.user)

    def _handle_status_transition(self, request, application):
        if 'status' not in request.data:
            return None
        to_status = request.data.get('status')
        if not to_status or to_status == application.status:
            return None

        payload = request.data.copy()
        payload['to_status'] = to_status
        ApplicationService.perform_transition(
            application=application,
            user=request.user,
            data=payload
        )
        serializer = self.get_serializer(application)
        return Response(serializer.data)

    def partial_update(self, request, *args, **kwargs):
        application = self.get_object()
        transition_response = self._handle_status_transition(request, application)
        if transition_response:
            return transition_response

        response = super().partial_update(request, *args, **kwargs)
        Application.objects.filter(id=application.id).update(last_activity_at=timezone.now())
        return response

    def update(self, request, *args, **kwargs):
        application = self.get_object()
        transition_response = self._handle_status_transition(request, application)
        if transition_response:
            return transition_response

        response = super().update(request, *args, **kwargs)
        Application.objects.filter(id=application.id).update(last_activity_at=timezone.now())
        return response

    def perform_create(self, serializer):
        """Align application.branch with student's branch and enforce branch access."""
        from core.utils.branch_context import assert_branch_access

        student = serializer.validated_data.get('student')
        if student:
            assert_branch_access(
                self.request,
                student.branch,
                message="Cannot create application for another branch."
            )
            user = self.request.user
            if not user.is_superuser and getattr(user, 'role', None) == User.Role.COUNSELOR and student.counselor_id != user.id:
                raise ValidationError({'student': 'You can only create applications for your own students.'})
            assigned_to = serializer.validated_data.get('assigned_to') or student.counselor
            application = serializer.save(
                branch=student.branch,
                assigned_to=assigned_to,
                last_activity_at=timezone.now()
            )
            ApplicationService.initialize_checklist(application)
            return

        application = serializer.save(last_activity_at=timezone.now())
        ApplicationService.initialize_checklist(application)

    @action(detail=True, methods=['post'])
    def transition(self, request, pk=None):
        """
        Handle atomic state transition via Service Layer.
        """
        application = self.get_object()
        
        try:
            ApplicationService.perform_transition(
                application=application,
                user=request.user,
                data=request.data
            )
            return Response({
                'status': 'Transition successful', 
                'new_status': application.status
            })
        except ValidationError as e:
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def timeline(self, request, pk=None):
        """Return audit log history."""
        application = self.get_object()
        logs = ApplicationStatusLog.objects.filter(application=application).select_related('changed_by')
        serializer = ApplicationStatusLogSerializer(logs, many=True)
        return Response(serializer.data)


class ApplicationSubmissionViewSet(AuditLogMixin, BranchIsolationMixin, viewsets.ModelViewSet):
    queryset = ApplicationSubmission.objects.select_related('application', 'application__student').all()
    serializer_class = ApplicationSubmissionSerializer
    permission_classes = [IsAuthenticated, ApplicationPermission]

    def perform_create(self, serializer):
        application = serializer.validated_data.get('application')
        if application:
            from core.utils.branch_context import assert_branch_access
            assert_branch_access(
                self.request,
                application.student.branch,
                message="Cannot create submission for another branch."
            )
            serializer.save(branch=application.student.branch, created_by=self.request.user)
            return
        serializer.save(created_by=self.request.user)


class ApplicationChecklistTemplateViewSet(AuditLogMixin, BranchIsolationMixin, viewsets.ModelViewSet):
    queryset = ApplicationChecklistTemplate.objects.all()
    serializer_class = ApplicationChecklistTemplateSerializer
    permission_classes = [IsAuthenticated, ApplicationPermission]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['university', 'country', 'level', 'is_active']


class ApplicationChecklistItemViewSet(AuditLogMixin, BranchIsolationMixin, viewsets.ModelViewSet):
    queryset = ApplicationChecklistItem.objects.select_related('application', 'document').all()
    serializer_class = ApplicationChecklistItemSerializer
    permission_classes = [IsAuthenticated, ApplicationPermission]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['application', 'status', 'is_required', 'category']

    def perform_create(self, serializer):
        application = serializer.validated_data.get('application')
        if not application:
            raise ValidationError({'application': 'Application is required.'})
        item = serializer.save(branch=application.branch)
        Application.objects.filter(id=application.id).update(last_activity_at=timezone.now())
        return item

    def perform_update(self, serializer):
        instance = serializer.instance
        updated = serializer.save()
        if updated.status == ApplicationChecklistItem.Status.UPLOADED and not updated.submitted_at:
            updated.submitted_at = timezone.now()
        if updated.status == ApplicationChecklistItem.Status.VERIFIED and not updated.verified_at:
            updated.verified_at = timezone.now()
        if updated.status == ApplicationChecklistItem.Status.REJECTED and not updated.verified_at:
            updated.verified_at = timezone.now()
        if updated.document and updated.status == ApplicationChecklistItem.Status.MISSING:
            updated.status = ApplicationChecklistItem.Status.UPLOADED
            updated.submitted_at = timezone.now()
        updated.save(update_fields=['status', 'submitted_at', 'verified_at'])
        Application.objects.filter(id=instance.application_id).update(last_activity_at=timezone.now())
        return updated


class ApplicationNoteViewSet(AuditLogMixin, BranchIsolationMixin, viewsets.ModelViewSet):
    queryset = ApplicationNote.objects.select_related('application', 'created_by').all()
    serializer_class = ApplicationNoteSerializer
    permission_classes = [IsAuthenticated, ApplicationPermission]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['application', 'visibility', 'is_pinned']

    def perform_create(self, serializer):
        application = serializer.validated_data.get('application')
        if not application:
            raise ValidationError({'application': 'Application is required.'})
        note = serializer.save(branch=application.branch, created_by=self.request.user)
        Application.objects.filter(id=application.id).update(last_activity_at=timezone.now())
        return note
