from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
import datetime
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models.functions import TruncMonth
from visa_crm_backend.mixins import BranchIsolationMixin, BranchIsolationCreateMixin
from audit.mixins import AuditLogMixin
from core.utils.branch_context import assert_branch_access
from core.utils.upload_validation import validate_upload
from accounts.models import User
from accounts.permissions import LeadPermission, StudentPermission, DocumentPermission, CommunicationPermission
from .models import Lead, Student, Document, DocumentAlert, LeadInteraction, WhatsAppTemplate, CounselorAvailability
from .services import StudentService
from .serializers import (
    LeadSerializer, LeadListSerializer, StudentSerializer, StudentListSerializer,
    DocumentSerializer, DocumentListSerializer, DocumentAlertSerializer,
    LeadInteractionSerializer, WhatsAppTemplateSerializer,
    CounselorAvailabilitySerializer, BulkLeadActionSerializer
)


class LeadViewSet(AuditLogMixin, BranchIsolationMixin, BranchIsolationCreateMixin, viewsets.ModelViewSet):
    """
    ViewSet for Lead CRUD operations.
    Branch isolation is enforced via BranchIsolationMixin.
    """
    queryset = Lead.objects.select_related('branch', 'assigned_to').all()
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'source', 'priority', 'target_country', 'is_sla_violated']
    permission_classes = [IsAuthenticated, LeadPermission]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return LeadListSerializer
        return LeadSerializer

    def get_queryset(self):
        """
        Use custom manager for role-based filtering.
        """
        queryset = super().get_queryset()
        user = self.request.user
        if not user.is_superuser and getattr(user, 'role', None) == User.Role.COUNSELOR:
            return queryset.filter(assigned_to=user)
        return queryset.for_user(user)

    def perform_create(self, serializer):
        super().perform_create(serializer)
        user = self.request.user
        if not user.is_superuser and getattr(user, 'role', None) == User.Role.COUNSELOR and serializer.instance:
            if serializer.instance.assigned_to_id is None:
                serializer.instance.assigned_to = user
                serializer.instance.save(update_fields=['assigned_to'])

    @action(detail=True, methods=['post'])
    def convert(self, request, pk=None):
        """
        Convert a Lead into a Student via StudentService.
        """
        lead = self.get_object()
        
        try:
            student = StudentService.convert_lead(lead, request.user)
            
            return Response(
                {
                    'message': 'Lead converted successfully',
                    'student_id': student.id,
                    'student_code': student.student_code
                },
                status=status.HTTP_201_CREATED
            )
        except ValidationError as e:
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
             return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def interactions(self, request, pk=None):
        """Get interaction timeline for this lead."""
        lead = self.get_object()
        from .models import LeadInteraction
        from .serializers import LeadInteractionSerializer
        
        interactions = LeadInteraction.objects.filter(lead=lead).select_related('staff')
        serializer = LeadInteractionSerializer(interactions, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def leaderboard(self, request):
        """Gamified leaderboard showing top performing counselors."""
        from django.db.models import Count, Q
        from accounts.models import User
        
        # Get stats for last 30 days
        thirty_days_ago = timezone.now() - timezone.timedelta(days=30)
        
        counselors = User.objects.filter(role=User.Role.COUNSELOR)
        if resolve_branch_from_request(request):
            counselors = counselors.filter(branch=resolve_branch_from_request(request))
            
        stats = counselors.annotate(
            total_leads=Count('assigned_leads'),
            hot_leads=Count('assigned_leads', filter=Q(assigned_leads__priority='HOT')),
            conversions=Count('assigned_leads', filter=Q(assigned_leads__status='CONVERTED')),
        ).order_by('-conversions', '-hot_leads')[:10]
        
        leaderboard_data = []
        for counselor in stats:
            leaderboard_data.append({
                'id': counselor.id,
                'name': f"{counselor.first_name} {counselor.last_name}",
                'conversions': counselor.conversions,
                'hot_leads': counselor.hot_leads,
                'total_leads': counselor.total_leads,
                'rank_emoji': '👑' if len(leaderboard_data) == 0 else '🔥' if len(leaderboard_data) < 3 else '⭐️'
            })
            
        return Response(leaderboard_data)

    @action(detail=False, methods=['post'], url_path='bulk-action')
    def bulk_action(self, request):
        """Perform bulk actions like assign, status update, or WhatsApp."""
        serializer = BulkLeadActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        lead_ids = serializer.validated_data['lead_ids']
        action = serializer.validated_data['action']
        leads = Lead.objects.filter(id__in=lead_ids)
        
        if resolve_branch_from_request(request):
            leads = leads.filter(branch=resolve_branch_from_request(request))
            
        count = 0
        if action == 'ASSIGN':
            assigned_to_id = serializer.validated_data.get('assigned_to')
            from accounts.models import User
            try:
                user = User.objects.get(id=assigned_to_id)
                leads.update(assigned_to=user)
                count = leads.count()
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=404)
                
        elif action == 'STATUS_UPDATE':
            status = serializer.validated_data.get('status')
            leads.update(status=status)
            count = leads.count()
            
        elif action == 'WHATSAPP_TEMPLATE':
            template_id = serializer.validated_data.get('template_id')
            try:
                template = WhatsAppTemplate.objects.get(id=template_id)
                # Log interaction for each lead
                for lead in leads:
                    LeadInteraction.objects.create(
                        lead=lead,
                        type=LeadInteraction.Type.WHATSAPP,
                        content=template.format_message(lead),
                        staff=request.user,
                        branch=lead.branch
                    )
                count = leads.count()
            except WhatsAppTemplate.DoesNotExist:
                return Response({'error': 'Template not found'}, status=404)
                
        return Response({'message': f'Successfully processed {count} leads.'})

    @action(detail=False, methods=['get'])
    def check_duplicate(self, request):
        """Real-time duplicate check for email or phone."""
        email = request.query_params.get('email')
        phone = request.query_params.get('phone')
        
        if not email and not phone:
            return Response({'error': 'Email or phone required'}, status=400)
            
        from django.db.models import Q
        query = Q()
        if email:
            query |= Q(email=email)
        if phone:
            query |= Q(phone=phone)
            
        duplicates = Lead.objects.filter(query)
        from core.utils.branch_context import resolve_branch_from_request
        if resolve_branch_from_request(request):
            duplicates = duplicates.filter(branch=resolve_branch_from_request(request))
            
        if duplicates.exists():
            duplicate = duplicates.first()
            return Response({
                'exists': True,
                'lead': {
                    'id': duplicate.id,
                    'full_name': duplicate.full_name,
                    'status': duplicate.get_status_display(),
                    'staff': f"{duplicate.assigned_to.get_full_name()}" if duplicate.assigned_to else "Unassigned"
                }
            })
            
        return Response({'exists': False})

    @action(detail=True, methods=['get'])
    def whatsapp_templates(self, request, pk=None):
        """Get available WhatsApp templates with lead data applied."""
        lead = self.get_object()
        from .models import WhatsAppTemplate
        templates = WhatsAppTemplate.objects.all()
        
        data = []
        for t in templates:
            data.append({
                'id': t.id,
                'title': t.title,
                'category': t.category,
                'formatted_message': t.format_message(lead)
            })
        return Response(data)


class CounselorAvailabilityViewSet(viewsets.ModelViewSet):
    """ViewSet for managing counselor availability slots."""
    queryset = CounselorAvailability.objects.all()
    serializer_class = CounselorAvailabilitySerializer
    permission_classes = [IsAuthenticated, LeadPermission]
    
    def get_queryset(self):
        branch = resolve_branch_from_request(self.request)
        if branch:
            return self.queryset.filter(branch=branch)
        return self.queryset

    def perform_create(self, serializer):
        branch = resolve_branch_from_request(self.request)
        serializer.save(branch=branch)



class StudentViewSet(AuditLogMixin, BranchIsolationMixin, BranchIsolationCreateMixin, viewsets.ModelViewSet):
    """
    ViewSet for Student CRUD operations.
    Branch isolation is enforced via BranchIsolationMixin.
    """
    queryset = Student.objects.select_related('branch', 'counselor', 'lead').all()
    permission_classes = [IsAuthenticated, StudentPermission]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return StudentListSerializer
        return StudentSerializer

    def get_queryset(self):
        """Use custom manager for role-based filtering."""
        queryset = super().get_queryset()
        user = self.request.user
        if not user.is_superuser and getattr(user, 'role', None) == User.Role.COUNSELOR:
            return queryset.filter(counselor=user)
        return queryset.for_user(user)
    
    def perform_create(self, serializer):
        """Calculate profile completeness on create."""
        # Call parent's perform_create for branch assignment
        super().perform_create(serializer)
        # Calculate completeness if instance was created
        if serializer.instance:
            user = self.request.user
            if not user.is_superuser and getattr(user, 'role', None) == User.Role.COUNSELOR and serializer.instance.counselor_id is None:
                serializer.instance.counselor = user
            serializer.instance.calculate_profile_completeness()
            serializer.instance.save()
    
    def perform_update(self, serializer):
        """Recalculate profile completeness on update."""
        instance = serializer.save()
        instance.calculate_profile_completeness()
        instance.save()

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated, CommunicationPermission])
    def communications(self, request, pk=None):
        student = self.get_object()
        from communications.models import CommunicationLog
        from communications.serializers import CommunicationLogSerializer

        queryset = CommunicationLog.objects.filter(student=student).select_related('student', 'logged_by')
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = CommunicationLogSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        serializer = CommunicationLogSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)


class DocumentViewSet(AuditLogMixin, BranchIsolationMixin, viewsets.ModelViewSet):
    """
    ViewSet for Document CRUD operations.
    Documents are filtered by student's branch.
    Supports file uploads via MultiPartParser.
    """
    from rest_framework.parsers import MultiPartParser, FormParser
    
    queryset = Document.objects.select_related('student', 'student__branch', 'verified_by', 'uploaded_by').all()
    branch_field = 'student__branch'  # Filter through student's branch
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated, DocumentPermission]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['student', 'application', 'category', 'verification_status']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return DocumentListSerializer
        return DocumentSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if not user.is_superuser and getattr(user, 'role', None) == User.Role.COUNSELOR:
            return queryset.filter(student__counselor=user)
        return queryset
    
    def perform_create(self, serializer):
        """Auto-assign uploaded_by and calculate file size."""
        student = serializer.validated_data.get('student')
        if student:
            assert_branch_access(
                self.request,
                student.branch,
                message="Cannot upload documents for another branch."
            )
            user = self.request.user
            if not user.is_superuser and getattr(user, 'role', None) == User.Role.COUNSELOR and student.counselor_id != user.id:
                raise ValidationError({'student': 'You can only upload documents for your own students.'})
        file = self.request.FILES.get('file')
        validate_upload(file)
        file_size = file.size if file else None
        file_name = file.name if file else ''
        serializer.save(
            branch=student.branch if student else None,
            uploaded_by=self.request.user,
            file_size=file_size,
            file_name=file_name
        )

class DocumentAlertViewSet(AuditLogMixin, BranchIsolationMixin, viewsets.ModelViewSet):
    """
    ViewSet for Document Expiry Alerts.
    Allows staff to view and acknowledge alerts for documents approaching expiry.
    """
    queryset = DocumentAlert.objects.select_related('document', 'document__student', 'document__student__branch').all()
    serializer_class = DocumentAlertSerializer
    permission_classes = [IsAuthenticated, DocumentPermission]
    branch_field = 'document__student__branch'
    
    def get_queryset(self):
        """
        Filter alerts by counselor if applicable, and only show unacknowledged by default.
        """
        queryset = super().get_queryset()
        
        # Only unacknowledged by default
        if self.request.query_params.get('all') != 'true':
            queryset = queryset.filter(is_acknowledged=False)
            
        user = self.request.user
        if not user.is_superuser and getattr(user, 'role', None) == User.Role.COUNSELOR:
            return queryset.filter(document__student__counselor=user)
        return queryset

    @action(detail=True, methods=['post'])
    def acknowledge(self, request, pk=None):
        """
        Mark an alert as acknowledged.
        """
        alert = self.get_object()
        alert.is_acknowledged = True
        alert.save(update_fields=['is_acknowledged'])
        return Response({'status': 'alert acknowledged'})


class LeadInteractionViewSet(AuditLogMixin, BranchIsolationMixin, BranchIsolationCreateMixin, viewsets.ModelViewSet):
    """
    ViewSet for logging Lead Interactions (Calls, WhatsApp, etc).
    """
    queryset = LeadInteraction.objects.select_related('lead', 'staff', 'branch').all()
    serializer_class = LeadInteractionSerializer
    permission_classes = [IsAuthenticated, LeadPermission]
    
    def perform_create(self, serializer):
        lead = serializer.validated_data.get('lead')
        # Update lead's last interaction tracking
        lead.last_interaction_at = timezone.now()
        lead.is_sla_violated = False  # Reset SLA violation on new interaction
        lead.save(update_fields=['last_interaction_at', 'is_sla_violated'])
        
        # Save interaction with branch context
        serializer.save(
            staff=self.request.user,
            branch=lead.branch if lead else None
        )


class WhatsAppTemplateViewSet(AuditLogMixin, BranchIsolationMixin, BranchIsolationCreateMixin, viewsets.ModelViewSet):
    """
    ViewSet for managing WhatsApp Message Templates.
    """
    queryset = WhatsAppTemplate.objects.all()
    serializer_class = WhatsAppTemplateSerializer
    permission_classes = [IsAuthenticated, LeadPermission]


# Dashboard Statistics API
from rest_framework.views import APIView
from rest_framework.response import Response
from applications.models import Application
from visas.models import VisaCase
from core.utils.branch_context import resolve_branch_from_request, is_hq_user



class DashboardStatsView(APIView):
    """
    Dashboard Statistics Endpoint.
    Returns key metrics filtered by user's branch + user context for RBAC.
    
    GET /api/v1/dashboard/stats/
    """
    permission_classes = [IsAuthenticated]
    
    def get_branch_filter(self, request, user):
        """
        Returns the branch to filter by, or None for full access.
        """
        branch = resolve_branch_from_request(request)
        if branch is not None:
            return branch
        if is_hq_user(user):
            return None
        return 'NONE'  # Marker for no access
    
    def get(self, request):
        user = request.user
        branch = self.get_branch_filter(request, user)
        
        # Build user context for frontend
        user_context = {
            'id': str(user.id),
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'full_name': f"{user.first_name} {user.last_name}".strip() or user.email,
            'role': user.role,
            'role_display': user.get_role_display() if hasattr(user, 'get_role_display') else user.role,
            'is_superuser': user.is_superuser,
            'branch': None,
            'permissions': self._get_user_permissions(user),
        }
        
        # Add branch info if user has a branch
        if user.branch:
            user_context['branch'] = {
                'id': str(user.branch.id),
                'code': user.branch.code,
                'name': user.branch.name,
                'country': user.branch.country,
                'is_hq': user.branch.is_hq,
            }
        
        # No access case
        if branch == 'NONE':
            return Response({
                'user': user_context,
                'stats': {
                    'total_students': 0,
                    'total_leads': 0,
                    'active_applications': 0,
                    'pending_visas': 0,
                    'visa_success_rate': 0.0,
                    'new_leads_today': 0,
                    'pending_tasks': 0,
                },
                'quick_stats': [],
                'recent_tasks': [],
                'recent_activities': [],
                'pipeline_stats': [],
                'visa_alerts': []
            })
        
        # Build querysets with branch filter
        if branch is None:
            # Full access
            students_qs = Student.objects.all()
            leads_qs = Lead.objects.all()
            applications_qs = Application.objects.all()
            visas_qs = VisaCase.objects.all()
        else:
            # Branch filtered
            students_qs = Student.objects.filter(branch=branch)
            leads_qs = Lead.objects.filter(branch=branch)
            applications_qs = Application.objects.filter(student__branch=branch)
            visas_qs = VisaCase.objects.filter(student__branch=branch)

        # Counselor scope: only own students/leads
        if not user.is_superuser and getattr(user, 'role', None) == User.Role.COUNSELOR:
            students_qs = students_qs.filter(counselor=user)
            leads_qs = leads_qs.filter(assigned_to=user)
            applications_qs = applications_qs.filter(student__counselor=user)
            visas_qs = visas_qs.filter(student__counselor=user)
        
        # Calculate statistics
        total_students = students_qs.count()
        total_leads = leads_qs.count()
        
        # New leads today
        today = datetime.datetime.now().date()
        new_leads_today = leads_qs.filter(created_at__date=today).count()
        
        # Active applications (not rejected or draft)
        active_applications = applications_qs.exclude(
            status__in=[
                Application.Status.REJECTED,
                Application.Status.DOCUMENTS_READY,  # Treating as "draft"
            ]
        ).count()
        
        # Pending visas
        pending_visas = visas_qs.filter(
            decision_status=VisaCase.DecisionStatus.PENDING
        ).count()
        
        # Visa success rate
        total_decided = visas_qs.exclude(
            decision_status=VisaCase.DecisionStatus.PENDING
        ).count()
        
        granted_visas = visas_qs.filter(
            decision_status=VisaCase.DecisionStatus.APPROVED
        ).count()
        
        if total_decided > 0:
            visa_success_rate = round((granted_visas / total_decided) * 100, 1)
        else:
            visa_success_rate = 0.0
        
        # --------------------------------------------------------
        # NEW: Tasks List
        # --------------------------------------------------------
        pending_tasks_count = 0
        recent_tasks_data = []
        try:
            from tasks.models import Task
            
            # Base task query
            tasks_qs = Task.objects.filter(status='PENDING')
            
            # Filter by branch if needed
            if branch:
                # If tasks have branch field via TenantAwareModel logic or student connection
                # For now assume tasks are filtered by assigned_to or student branch if possible
                # But safer to filter by assigned_to for now
                pass

            # Filter by user (everyone sees their own tasks)
            # If manager/admin want to see team tasks, we can adjust logic later
            # For now: Only show tasks assigned TO the user
            my_tasks_qs = tasks_qs.filter(assigned_to=user).order_by('due_date')
            
            pending_tasks_count = my_tasks_qs.count()
            
            # Get top 5 urgent/upcoming
            recent_tasks = my_tasks_qs[:5]
            for t in recent_tasks:
                recent_tasks_data.append({
                    'id': str(t.id),
                    'title': t.title,
                    'due_date': t.due_date,
                    'priority': t.priority,
                    'status': t.status,
                    'student_name': str(t.student) if t.student else None
                })
        except Exception:
            pass
        
        # --------------------------------------------------------
        # NEW: Pipeline Statistics (Funnel)
        # --------------------------------------------------------
        from django.db.models import Count
        p_stats = applications_qs.values('status').annotate(count=Count('id')).order_by('count')
        pipeline_data = []
        # Mapping status to readable label if needed, or just use status code
        for item in p_stats:
            pipeline_data.append({
                'stage': item['status'],
                'count': item['count']
            })

        # --------------------------------------------------------
        # NEW: Recent Activity Feed
        # --------------------------------------------------------
        recent_activities_data = []
        try:
            from audit.models import AuditLog
            # Filter logs relevant to this branch or user
            audit_qs = AuditLog.objects.all()
            if branch:
                audit_qs = audit_qs.filter(branch=branch)
            
            # Order by newest
            audit_qs = audit_qs.order_by('-created_at')[:10]
            
            for log in audit_qs:
                recent_activities_data.append({
                    'id': str(log.id),
                    'action': log.action,
                    'model': log.model,
                    'description': f"{log.get_action_display()} {log.model} - {log.object_repr or ''}",
                    'actor': str(log.actor) if log.actor else 'System',
                    'timestamp': log.created_at
                })
        except Exception:
            pass

        # --------------------------------------------------------
        # NEW: Visa Alerts (Urgent Cases)
        # --------------------------------------------------------
        visa_alerts_data = []
        # Simple logic: Pending visas created > 14 days ago (stalled)
        fourteen_days_ago = timezone.now() - timezone.timedelta(days=14)
        stalled_visas = visas_qs.filter(
            decision_status=VisaCase.DecisionStatus.PENDING,
            created_at__lte=fourteen_days_ago
        ).order_by('created_at')[:5]
        
        for v in stalled_visas:
            visa_alerts_data.append({
                'id': str(v.id),
                'student_name': str(v.student),
                'country': v.student.target_country if v.student else 'Unknown',
                'days_pending': (timezone.now().date() - v.created_at.date()).days
            })

        # --------------------------------------------------------
        # NEW: Analytics & Revenue
        # --------------------------------------------------------
        from django.db.models import Sum, Count
        from finance.models import Transaction
        
        # Revenue calculation (Sum of PAID CREDIT transactions)
        if branch is None:
            revenue_qs = Transaction.objects.filter(status='PAID', transaction_type='CREDIT')
        else:
            revenue_qs = Transaction.objects.filter(student__branch=branch, status='PAID', transaction_type='CREDIT')
            
        total_revenue = revenue_qs.aggregate(total=Sum('amount'))['total'] or 0.0
        
        # Monthly Revenue Trend (Last 6 months)
        six_months_ago = timezone.now() - timezone.timedelta(days=180)
        revenue_trend = (
            revenue_qs.filter(created_at__gte=six_months_ago)
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(amount=Sum('amount'))
            .order_by('month')
        )
            
        # Lead Source Breakdown
        source_stats = leads_qs.values('source').annotate(count=Count('id')).order_by('-count')
        
        # Build quick stats for dashboard cards
        quick_stats = [
            {'label': 'Total Students', 'value': total_students, 'icon': 'users', 'color': 'blue'},
            {'label': 'Total Leads', 'value': total_leads, 'icon': 'user-plus', 'color': 'green'},
            {'label': 'Active Applications', 'value': active_applications, 'icon': 'file-text', 'color': 'purple'},
            {'label': 'Total Revenue', 'value': f"£{total_revenue:,.0f}", 'icon': 'credit-card', 'color': 'amber'},
        ]
        
        return Response({
            'user': user_context,
            'stats': {
                'total_students': total_students,
                'total_leads': total_leads,
                'active_applications': active_applications,
                'pending_visas': pending_visas,
                'visa_success_rate': visa_success_rate,
                'new_leads_today': new_leads_today,
                'pending_tasks': pending_tasks_count,
                'total_revenue': float(total_revenue),
            },
            'analytics': {
                'revenue_trend': list(revenue_trend),
                'lead_sources': list(source_stats),
            },
            'quick_stats': quick_stats,
            'recent_tasks': recent_tasks_data,
            'recent_activities': recent_activities_data,
            'pipeline_stats': pipeline_data,
            'visa_alerts': visa_alerts_data
        })
    
    def _get_user_permissions(self, user):
        """
        Return a simplified permissions object for frontend RBAC.
        """
        role = getattr(user, 'role', None)
        is_admin = user.is_superuser or role == User.Role.SUPER_ADMIN
        
        return {
            # Module access
            'can_view_all_branches': is_admin or role == User.Role.AUDITOR,
            'can_manage_users': is_admin or role in [User.Role.COUNTRY_MANAGER, User.Role.BRANCH_MANAGER],
            'can_manage_finance': is_admin or role == User.Role.FINANCE_OFFICER,
            'can_manage_leads': role in [User.Role.SUPER_ADMIN, User.Role.COUNTRY_MANAGER, User.Role.BRANCH_MANAGER, User.Role.COUNSELOR],
            'can_manage_students': role in [User.Role.SUPER_ADMIN, User.Role.COUNTRY_MANAGER, User.Role.BRANCH_MANAGER, User.Role.COUNSELOR],
            'can_manage_documents': role in [User.Role.SUPER_ADMIN, User.Role.COUNTRY_MANAGER, User.Role.BRANCH_MANAGER, User.Role.COUNSELOR, User.Role.DOC_PROCESSOR],
            'can_view_reports': is_admin or role in [User.Role.AUDITOR, User.Role.COUNTRY_MANAGER, User.Role.BRANCH_MANAGER],
            'can_manage_universities': is_admin,
            # Actions
            'is_read_only': role == User.Role.AUDITOR,
            'is_admin': is_admin,
        }

