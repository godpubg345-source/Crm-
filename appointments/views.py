from rest_framework import viewsets
from accounts.permissions import TaskPermission

from audit.mixins import AuditLogMixin
from visa_crm_backend.mixins import BranchIsolationMixin, BranchIsolationCreateMixin
from core.utils.branch_context import assert_branch_access
from .models import Appointment, AppointmentReminder
from .serializers import AppointmentSerializer, AppointmentReminderSerializer


class AppointmentViewSet(AuditLogMixin, BranchIsolationMixin, BranchIsolationCreateMixin, viewsets.ModelViewSet):
    queryset = Appointment.objects.select_related('student', 'counselor').all()
    serializer_class = AppointmentSerializer
    permission_classes = [TaskPermission]

    def perform_create(self, serializer):
        student = serializer.validated_data.get('student')
        if student:
            assert_branch_access(self.request, student.branch, message='Cannot create appointments for another branch.')
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(branch=student.branch if student else None, created_by=user)


class AppointmentReminderViewSet(AuditLogMixin, BranchIsolationMixin, BranchIsolationCreateMixin, viewsets.ModelViewSet):
    queryset = AppointmentReminder.objects.select_related('appointment').all()
    serializer_class = AppointmentReminderSerializer
    permission_classes = [TaskPermission]

    def perform_create(self, serializer):
        appointment = serializer.validated_data.get('appointment')
        serializer.save(branch=appointment.branch if appointment else None)
