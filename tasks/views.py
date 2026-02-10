from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Task
from .serializers import TaskSerializer
from visa_crm_backend.mixins import BranchIsolationMixin
from audit.mixins import AuditLogMixin

class TaskViewSet(AuditLogMixin, BranchIsolationMixin, viewsets.ModelViewSet):
    queryset = Task.objects.select_related('assigned_to', 'created_by', 'student').all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'priority', 'assigned_to', 'student', 'application']

    def get_queryset(self):
        """
        Custom filtering for tasks:
        1. Branch isolation is handled by BranchIsolationMixin.
        2. Non-admins see tasks assigned to them OR created by them.
        """
        queryset = super().get_queryset()
        user = self.request.user
        
        # Superusers and HQ/Country Managers see everything in their branch context
        from core.utils.branch_context import is_hq_user, is_country_manager
        if user.is_superuser or is_hq_user(user) or is_country_manager(user):
            return queryset
            
        # Regular users (Counselors, etc.) see only their own tasks
        from django.db.models import Q
        return queryset.filter(Q(assigned_to=user) | Q(created_by=user))
