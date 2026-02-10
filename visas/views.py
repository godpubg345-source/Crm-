from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from visa_crm_backend.mixins import BranchIsolationMixin
from audit.mixins import AuditLogMixin
from core.utils.branch_context import assert_branch_access
from accounts.models import User
from accounts.permissions import VisaPermission
from .models import VisaCase, VisaMilestone
from .serializers import VisaCaseSerializer, VisaCaseListSerializer, VisaMilestoneSerializer


class VisaCaseViewSet(AuditLogMixin, BranchIsolationMixin, viewsets.ModelViewSet):
    """
    ViewSet for VisaCase CRUD operations.
    Visa cases are filtered by student's branch.
    """
    queryset = VisaCase.objects.select_related('student', 'student__branch', 'application').all()
    branch_field = 'student__branch'  # Filter through student's branch
    permission_classes = [IsAuthenticated, VisaPermission]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return VisaCaseListSerializer
        return VisaCaseSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if not user.is_superuser and getattr(user, 'role', None) == User.Role.COUNSELOR:
            return queryset.filter(student__counselor=user)
        return queryset

    def perform_create(self, serializer):
        student = serializer.validated_data.get('student')
        application = serializer.validated_data.get('application')

        if student:
            assert_branch_access(
                self.request,
                student.branch,
                message="Cannot create visa cases for another branch."
            )
            user = self.request.user
            if not user.is_superuser and getattr(user, 'role', None) == User.Role.COUNSELOR and student.counselor_id != user.id:
                raise ValidationError({'student': 'You can only create visa cases for your own students.'})
            
            # Auto-assign application if not provided
            if not application:
                from applications.models import Application
                # Try to find a suitable application (Status: CAS_RECEIVED, or at least OFFER_ACCEPTED)
                # First priority: CAS_RECEIVED
                app = Application.objects.filter(student=student, status='CAS_RECEIVED').first()
                if not app:
                    # Second priority: Any positive offer stats
                    app = Application.objects.filter(
                        student=student, 
                        status__in=['OFFER_ACCEPTED', 'UNCONDITIONAL_OFFER', 'CONDITIONAL_OFFER']
                    ).order_by('-updated_at').first()
                
                if not app:
                    # If strictly no application, we can't create a visa case.
                    # But if the user just wants to start manually, maybe we should allow creating a dummy application?
                    # No, better to fail and tell them to create an application first.
                    raise ValidationError({'application': 'No eligible application found for this student. Please ensure an application exists with at least an Offer.'})
                
                serializer.save(application=app)
                return

        serializer.save()


class VisaMilestoneViewSet(AuditLogMixin, BranchIsolationMixin, viewsets.ModelViewSet):
    queryset = VisaMilestone.objects.select_related('visa_case', 'visa_case__student').all()
    serializer_class = VisaMilestoneSerializer
    permission_classes = [IsAuthenticated, VisaPermission]

    def perform_create(self, serializer):
        visa_case = serializer.validated_data.get('visa_case')
        if visa_case:
            assert_branch_access(
                self.request,
                visa_case.student.branch,
                message="Cannot create milestones for another branch."
            )
            serializer.save(branch=visa_case.student.branch)
            return
        serializer.save()
