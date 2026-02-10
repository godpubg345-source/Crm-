from django.db import models
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Branch, TransferRequest, BranchTarget, FixedAsset, BranchComplaint
from .serializers import (
    BranchSerializer, 
    BranchListSerializer, 
    BranchAnalyticsSerializer,
    TransferRequestSerializer,
    BranchTargetSerializer,
    FixedAssetSerializer,
    BranchComplaintSerializer
)
from accounts.permissions import BranchPermission
from visa_crm_backend.mixins import BranchIsolationMixin
from audit.mixins import AuditLogMixin


class BranchViewSet(AuditLogMixin, BranchIsolationMixin, viewsets.ModelViewSet):
    """
    ViewSet for Branch CRUD operations.
    
    GET /api/branches/ - List all branches
    POST /api/branches/ - Create a branch
    GET /api/branches/{id}/ - Retrieve a branch
    PUT /api/branches/{id}/ - Update a branch
    DELETE /api/branches/{id}/ - Delete a branch
    """
    queryset = Branch.objects.all()
    branch_field = 'id'
    permission_classes = [IsAuthenticated, BranchPermission]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return BranchListSerializer
        if self.action == 'analytics':
            return BranchAnalyticsSerializer
        return BranchSerializer

    @action(detail=True, methods=['get'])
    def staff(self, request, pk=None):
        branch = self.get_object()
        from accounts.serializers import UserListSerializer
        staff_members = branch.users.all()
        serializer = UserListSerializer(staff_members, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='assign-staff')
    def assign_staff(self, request, pk=None):
        branch = self.get_object()
        user_ids = request.data.get('user_ids', [])
        from django.contrib.auth import get_user_model
        User = get_user_model()
        User.objects.filter(id__in=user_ids).update(branch=branch)
        return Response({'message': f'Successfully assigned {len(user_ids)} staff members to {branch.name}'})

    @action(detail=True, methods=['get'])
    def analytics(self, request, pk=None):
        branch = self.get_object()
        from students.models import Lead, Student
        from finance.models import Transaction
        from django.db.models import Count, Sum, Avg
        from django.db.models.functions import TruncMonth
        from django.utils import timezone
        from datetime import timedelta
        
        # Core Metrics
        total_leads = Lead.objects.filter(branch=branch).count()
        converted_leads = Lead.objects.filter(branch=branch, status='CONVERTED').count()
        conversion_rate = (converted_leads / total_leads * 100) if total_leads > 0 else 0
        active_students = Student.objects.filter(branch=branch).count()
        
        # Monthly Lead Trends (Last 6 months)
        six_months_ago = timezone.now() - timedelta(days=180)
        lead_trends = Lead.objects.filter(branch=branch, created_at__gte=six_months_ago)\
            .annotate(month=TruncMonth('created_at'))\
            .values('month')\
            .annotate(count=Count('id'))\
            .order_by('month')

        # Revenue Breakdown
        revenue_data = Transaction.objects.filter(branch=branch, status='PAID')\
            .values('transaction_type')\
            .annotate(total=Sum('amount'))

        data = {
            'total_leads': total_leads,
            'converted_leads': converted_leads,
            'conversion_rate': round(conversion_rate, 2),
            'active_students': active_students,
            'revenue_estimate': active_students * 500,
            'lead_trends': [
                {'month': item['month'].strftime('%b'), 'count': item['count']} 
                for item in lead_trends
            ],
            'revenue_breakdown': [
                {'type': item['transaction_type'], 'total': float(item['total'])} 
                for item in revenue_data
            ]
        }
        return Response(data)

    @action(detail=True, methods=['get'], url_path='export-analytics')
    def export_analytics(self, request, pk=None):
        """Exports branch analytics as a CSV file."""
        import csv
        from django.http import HttpResponse
        branch = self.get_object()
        
        analytics_response = self.analytics(request, pk=pk)
        data = analytics_response.data

        # Also include pipeline and finance data in export if available
        pipeline_response = self.pipeline_analysis(request, pk=pk)
        pipeline_data = pipeline_response.data
        
        finance_response = self.finance_summary(request, pk=pk)
        finance_data = finance_response.data

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="branch_{branch.id}_full_report.csv"'

        writer = csv.writer(response)
        writer.writerow(['--- BRANCH BI REPORT ---'])
        writer.writerow(['Metric', 'Value'])
        writer.writerow(['Branch Name', branch.name])
        writer.writerow(['Total Leads', data['total_leads']])
        writer.writerow(['Converted Leads', data['converted_leads']])
        writer.writerow(['Conversion Rate (%)', data['conversion_rate']])
        writer.writerow(['Active Students', data['active_students']])
        
        writer.writerow([])
        writer.writerow(['--- PIPELINE BREAKDOWN ---'])
        for stage, count in pipeline_data['leads_by_status'].items():
            writer.writerow([f'Leads ({stage})', count])
        for stage, count in pipeline_data['applications_by_status'].items():
            writer.writerow([f'Apps ({stage})', count])

        writer.writerow([])
        writer.writerow(['--- FINANCIAL SUMMARY ---'])
        writer.writerow(['Monthly Payroll', finance_data['total_payroll_monthly']])
        writer.writerow(['Pending Commissions', finance_data['commissions']['pending']['total']])
        writer.writerow(['Received Commissions', finance_data['commissions']['received']['total']])
        writer.writerow(['Est. Total Revenue', finance_data['total_revenue_estimate']])

        return response

    @action(detail=True, methods=['get'], url_path='pipeline-analysis')
    def pipeline_analysis(self, request, pk=None):
        """Deeper pipeline analysis for leads and applications."""
        branch = self.get_object()
        from students.models import Lead, Student
        from applications.models import Application
        from django.db.models import Count
        
        leads_by_status = Lead.objects.filter(branch=branch).values('status').annotate(count=Count('id'))
        leads_by_priority = Lead.objects.filter(branch=branch).values('priority').annotate(count=Count('id'))
        apps_by_status = Application.objects.filter(branch=branch).values('status').annotate(count=Count('id'))
        
        # Bottleneck analysis (simplified)
        # In a real system, we'd use ApplicationStatusLog to calculate avg time in status
        
        return Response({
            'leads_by_status': {item['status']: item['count'] for item in leads_by_status},
            'leads_by_priority': {item['priority']: item['count'] for item in leads_by_priority},
            'applications_by_status': {item['status']: item['count'] for item in apps_by_status},
        })

    @action(detail=True, methods=['get'], url_path='staff-performance')
    def staff_performance(self, request, pk=None):
        """Aggregate performance metrics for all staff in the branch."""
        branch = self.get_object()
        from accounts.models import User, EmployeePerformance
        from django.db.models import Avg, Sum
        
        staff = User.objects.filter(branch=branch, role='COUNSELOR')
        performance_data = []
        
        for member in staff:
            perf = getattr(member, 'performance', None)
            if perf:
                performance_data.append({
                    'name': member.get_full_name(),
                    'conversions': perf.total_conversions,
                    'revenue': float(perf.revenue_generated),
                    'points': perf.points,
                    'xp': perf.xp,
                    'avg_response_time': str(perf.average_response_time) if perf.average_response_time else 'N/A'
                })
        
        branch_averages = {
            'avg_conversions': staff.aggregate(avg=Avg('performance__total_conversions'))['avg'] or 0,
            'total_revenue': staff.aggregate(total=Sum('performance__revenue_generated'))['total'] or 0
        }
        
        return Response({
            'staff': performance_data,
            'branch_averages': branch_averages
        })

    @action(detail=False, methods=['get'])
    def leaderboard(self, request):
        from students.models import Lead, Student
        branches = self.get_queryset()
        leaderboard_data = []
        
        for branch in branches:
            total_leads = Lead.objects.filter(branch=branch).count()
            converted_leads = Lead.objects.filter(branch=branch, status='CONVERTED').count()
            conversion_rate = (converted_leads / total_leads * 100) if total_leads > 0 else 0
            active_students = Student.objects.filter(branch=branch).count()
            
            leaderboard_data.append({
                'id': branch.id,
                'name': branch.name,
                'code': branch.code,
                'total_leads': total_leads,
                'conversion_rate': round(conversion_rate, 2),
                'active_students': active_students,
                'rank_emoji': '🔥' if conversion_rate > 50 else '⚡' if conversion_rate > 20 else '❄️'
            })
            
        # Sort by conversion rate descending
        leaderboard_data.sort(key=lambda x: x['conversion_rate'], reverse=True)
        return Response(leaderboard_data)

    @action(detail=False, methods=['get'])
    def status(self, request):
        """Returns the current operational status (Open/Closed) for all branches."""
        branches = self.get_queryset()
        data = []
        for branch in branches:
            data.append({
                'id': branch.id,
                'code': branch.code,
                'name': branch.name,
                'timezone': branch.timezone,
                'local_time': branch.local_time,
                'is_open': branch.is_currently_open,
                'opening_time': branch.opening_time.strftime('%H:%M'),
                'closing_time': branch.closing_time.strftime('%H:%M')
            })
        return Response(data)

    @action(detail=True, methods=['get'], url_path='handoff-suggestions')
    def handoff_suggestions(self, request, pk=None):
        """Returns handoff suggestions for all leads in this branch."""
        branch = self.get_object()
        from students.models import Lead
        from .services.handoff import HandoffService
        
        leads = Lead.objects.filter(branch=branch).exclude(status='CONVERTED')
        suggestions = []
        for lead in leads:
            suggestion = HandoffService.suggest_handoff(lead)
            if suggestion:
                suggestions.append(suggestion)
                
        return Response(suggestions)

    @action(detail=True, methods=['post'], url_path='execute-handoff')
    def execute_handoff(self, request, pk=None):
        """Executes a handoff for a specific lead in this branch."""
        branch = self.get_object()
        lead_id = request.data.get('lead_id')
        from students.models import Lead
        from .services.handoff import HandoffService
        
        try:
            lead = Lead.objects.get(id=lead_id, branch=branch)
            success = HandoffService.execute_auto_handoff(lead, request.user)
            if success:
                return Response({'status': 'success', 'message': f'Lead {lead.id} handed off successfully.'})
            return Response({'status': 'error', 'message': 'Handoff conditions not met or no available branches.'}, status=400)
        except Lead.DoesNotExist:
            return Response({'error': 'Lead not found in this branch'}, status=404)

    @action(detail=True, methods=['get'], url_path='regional-comparison')
    def regional_comparison(self, request, pk=None):
        """Compares this branch's performance against the national average."""
        branch = self.get_object()
        from students.models import Lead, Student
        from django.db.models import Avg, Count
        
        # Branch Metrics
        branch_leads = Lead.objects.filter(branch=branch).count()
        branch_students = Student.objects.filter(branch=branch).count()
        branch_converted = Lead.objects.filter(branch=branch, status='CONVERTED').count()
        branch_conv_rate = (branch_converted / branch_leads * 100) if branch_leads > 0 else 0
        
        # National Averages
        all_branches = Branch.objects.filter(is_active=True)
        branch_count = all_branches.count() or 1
        
        total_leads = Lead.objects.all().count()
        total_students = Student.objects.all().count()
        avg_leads = total_leads / branch_count
        avg_students = total_students / branch_count
        
        all_converted = Lead.objects.filter(status='CONVERTED').count()
        national_conv_rate = (all_converted / total_leads * 100) if total_leads > 0 else 0
        
        return Response({
            'branch': {
                'leads': branch_leads,
                'students': branch_students,
                'conversion_rate': round(branch_conv_rate, 2)
            },
            'national_average': {
                'leads': round(avg_leads, 2),
                'students': round(avg_students, 2),
                'conversion_rate': round(national_conv_rate, 2)
            },
            'performance_delta': {
                'leads': round(branch_leads - avg_leads, 2),
                'conversion_rate': round(branch_conv_rate - national_conv_rate, 2)
            }
        })

    @action(detail=True, methods=['get'], url_path='predictive-staffing')
    def predictive_staffing(self, request, pk=None):
        """Analyzes lead velocity vs current staff capacity to predict hiring needs."""
        branch = self.get_object()
        from django.utils import timezone
        from datetime import timedelta
        from students.models import Lead
        
        # Analyze last 30 days lead velocity
        thirty_days_ago = timezone.now() - timedelta(days=30)
        recent_leads_count = Lead.objects.filter(branch=branch, created_at__gte=thirty_days_ago).count()
        daily_velocity = recent_leads_count / 30
        
        # Get current staff count
        staff_count = branch.users.count()
        if staff_count == 0: staff_count = 1 # Avoid division by zero
        
        leads_per_staff = recent_leads_count / staff_count
        
        # Prediction logic
        status = 'STABLE'
        recommendation = "Maintain current staffing level."
        if leads_per_staff > 50:
            status = 'CRITICAL'
            recommendation = f"Warning: High lead volume detected ({leads_per_staff:.1f} leads/staff). Hire 2-3 additional counselors to avoid burnout."
        elif leads_per_staff > 30:
            status = 'WARNING'
            recommendation = f"Lead volume is increasing ({leads_per_staff:.1f} leads/staff). Consider hiring 1 counselor soon."
            
        return Response({
            'daily_velocity': round(daily_velocity, 2),
            'leads_per_staff_monthly': round(leads_per_staff, 2),
            'staff_count': staff_count,
            'status': status,
            'recommendation': recommendation,
            'projected_load_14d': round(recent_leads_count + (daily_velocity * 14))
        })

    @action(detail=True, methods=['get'], url_path='finance-summary')
    def finance_summary(self, request, pk=None):
        """Returns comprehensive financial summary for a branch."""
        branch = self.get_object()
        from django.db.models import Sum, Count
        from finance.models import CommissionClaim
        from accounts.models import EmployeeDossier
        
        # Payroll data from staff dossiers
        dossiers = EmployeeDossier.objects.filter(user__branch=branch)
        total_payroll = dossiers.aggregate(total=Sum('base_salary'))['total'] or 0
        
        # Commission claims for this branch
        commissions = CommissionClaim.objects.filter(branch=branch, is_deleted=False)
        
        pending_commissions = commissions.filter(status='PENDING').aggregate(
            total=Sum('expected_amount'),
            count=Count('id')
        )
        
        invoiced_commissions = commissions.filter(status='INVOICED').aggregate(
            total=Sum('expected_amount'),
            count=Count('id')
        )
        
        received_commissions = commissions.filter(status='RECEIVED').aggregate(
            total=Sum('actual_amount_received'),
            count=Count('id')
        )
        
        # Get recent commission claims  
        recent_claims = commissions.select_related('application', 'university').order_by('-created_at')[:5]
        claims_list = [{
            'id': str(c.id),
            'university': c.university.name if c.university else 'Unknown',
            'expected_amount': float(c.expected_amount),
            'status': c.status,
            'status_display': c.get_status_display(),
            'created_at': c.created_at.isoformat()
        } for c in recent_claims]
        
        from decimal import Decimal
        
        # Total estimated revenue (received commissions + projected)
        total_revenue = (received_commissions['total'] or Decimal(0)) + (pending_commissions['total'] or Decimal(0)) * Decimal('0.7')
        
        return Response({
            'total_payroll_monthly': float(total_payroll),
            'currency': branch.currency,
            'commissions': {
                'pending': {
                    'total': float(pending_commissions['total'] or 0),
                    'count': pending_commissions['count'] or 0
                },
                'invoiced': {
                    'total': float(invoiced_commissions['total'] or 0),
                    'count': invoiced_commissions['count'] or 0
                },
                'received': {
                    'total': float(received_commissions['total'] or 0),
                    'count': received_commissions['count'] or 0
                }
            },
            'recent_claims': claims_list,
            'total_revenue_estimate': float(total_revenue)
        })


class TransferRequestViewSet(AuditLogMixin, viewsets.ModelViewSet):
    """
    ViewSet for inter-branch transfer requests.
    Enables approval workflow for moving leads/students.
    """
    queryset = TransferRequest.objects.all()
    serializer_class = TransferRequestSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(requested_by=self.request.user)

    def get_queryset(self):
        user = self.request.user
        # HQ can see all, others see what affects their branch
        if user.is_superuser or getattr(user, 'branch', None) and user.branch.is_hq:
            return TransferRequest.objects.all()
        return TransferRequest.objects.filter(
            models.Q(from_branch=user.branch) | models.Q(to_branch=user.branch)
        )

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        transfer = self.get_object()
        if transfer.status != TransferRequest.Status.PENDING:
            return Response({'error': 'Only pending transfers can be approved'}, status=400)
            
        transfer.status = TransferRequest.Status.APPROVED
        transfer.approved_by = request.user
        transfer.approval_notes = request.data.get('notes', '')
        
        # Execute the transfer
        if transfer.lead:
            transfer.lead.branch = transfer.to_branch
            transfer.lead.save()
        elif transfer.student:
            transfer.student.branch = transfer.to_branch
            transfer.student.save()
            
        transfer.save()
        return Response({'status': 'Transfer approved and executed'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        transfer = self.get_object()
        if transfer.status != TransferRequest.Status.PENDING:
            return Response({'error': 'Only pending transfers can be rejected'}, status=400)
            
        transfer.status = TransferRequest.Status.REJECTED
        transfer.approved_by = request.user
        transfer.approval_notes = request.data.get('notes', '')
        transfer.save()
        return Response({'status': 'Transfer rejected'})


class BranchTargetViewSet(AuditLogMixin, viewsets.ModelViewSet):
    """
    ViewSet for managing branch performance targets.
    """
    queryset = BranchTarget.objects.all()
    serializer_class = BranchTargetSerializer
    permission_classes = [IsAuthenticated, BranchPermission]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or getattr(user, 'branch', None) and user.branch.is_hq:
            return BranchTarget.objects.all()
        return BranchTarget.objects.filter(branch=user.branch)


class FixedAssetViewSet(AuditLogMixin, BranchIsolationMixin, viewsets.ModelViewSet):
    """
    ViewSet for branch-specific fixed assets.
    """
    queryset = FixedAsset.objects.all()
    serializer_class = FixedAssetSerializer
    branch_field = 'branch'
    permission_classes = [IsAuthenticated]


class BranchComplaintViewSet(AuditLogMixin, BranchIsolationMixin, viewsets.ModelViewSet):
    """
    ViewSet for branch-specific complaints.
    """
    queryset = BranchComplaint.objects.all()
    serializer_class = BranchComplaintSerializer
    branch_field = 'branch'
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
