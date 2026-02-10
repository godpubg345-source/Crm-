from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from django_filters.rest_framework import DjangoFilterBackend

from accounts.models import User
from accounts.permissions import CommunicationPermission
from audit.mixins import AuditLogMixin
from core.utils.branch_context import assert_branch_access
from visa_crm_backend.mixins import BranchIsolationMixin
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import CommunicationLog
from .serializers import CommunicationLogSerializer
from .services import WhatsAppService
from students.models import Student


class CommunicationLogViewSet(AuditLogMixin, BranchIsolationMixin, viewsets.ModelViewSet):
    queryset = CommunicationLog.objects.select_related('student', 'student__branch', 'logged_by').all()
    serializer_class = CommunicationLogSerializer
    permission_classes = [IsAuthenticated, CommunicationPermission]
    branch_field = 'student__branch'

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['communication_type', 'direction', 'student', 'logged_by']
    search_fields = ['summary', 'subject', 'next_action']
    ordering_fields = ['created_at', 'communication_type', 'direction']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if getattr(user, 'role', None) == User.Role.COUNSELOR:
            return queryset.filter(student__counselor=user)
        return queryset

    def perform_create(self, serializer):
        student = serializer.validated_data.get('student')
        if student:
            assert_branch_access(
                self.request,
                student.branch,
                message='Cannot log communications for another branch.'
            )
            user = self.request.user
            if getattr(user, 'role', None) == User.Role.COUNSELOR and student.counselor_id != user.id:
                raise ValidationError({'student': 'You can only log communications for your own students.'})
        serializer.save(logged_by=self.request.user)

    def perform_update(self, serializer):
        instance = self.get_object()
        user = self.request.user
        if getattr(user, 'role', None) == User.Role.COUNSELOR and instance.student.counselor_id != user.id:
            raise ValidationError({'student': 'You can only update communications for your own students.'})
        serializer.save()

    @action(detail=False, methods=['post'])
    def send_whatsapp(self, request):
        """
        Manually trigger a WhatsApp message and log it.
        """
        student_id = request.data.get('student')
        message = request.data.get('message')
        
        if not student_id or not message:
            return Response({'error': 'Student ID and message are required.'}, status=400)
            
        try:
            student = Student.objects.get(id=student_id)
            assert_branch_access(request, student.branch)
            
            log = WhatsAppService.send_message(
                student=student,
                message=message,
                logged_by=request.user
            )
            
            return Response(CommunicationLogSerializer(log).data)
        except Student.DoesNotExist:
            return Response({'error': 'Student not found.'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=400)
