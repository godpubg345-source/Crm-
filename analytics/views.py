from datetime import datetime, timedelta

from django.db.models import Count, Sum, F
from django.db.models.functions import TruncMonth
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from accounts.permissions import AnalyticsPermission
from rest_framework.response import Response

from audit.mixins import AuditLogMixin
from visa_crm_backend.mixins import BranchIsolationMixin, BranchIsolationCreateMixin
from core.utils.branch_context import resolve_branch_from_request, is_hq_user, is_country_manager, get_user_country
from branches.models import Branch
from students.models import Lead, Student
from finance.models import Transaction
from tasks.models import Task
from accounts.models import User
from .models import BranchKpiInput, MetricSnapshot
from .serializers import BranchKpiInputSerializer, MetricSnapshotSerializer


class BranchKpiInputViewSet(AuditLogMixin, BranchIsolationMixin, BranchIsolationCreateMixin, viewsets.ModelViewSet):
    queryset = BranchKpiInput.objects.all()
    serializer_class = BranchKpiInputSerializer
    permission_classes = [AnalyticsPermission]

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(created_by=user)


class MetricSnapshotViewSet(AuditLogMixin, BranchIsolationMixin, viewsets.ReadOnlyModelViewSet):
    queryset = MetricSnapshot.objects.all()
    serializer_class = MetricSnapshotSerializer
    permission_classes = [AnalyticsPermission]


class AnalyticsViewSet(viewsets.ViewSet):
    permission_classes = [AnalyticsPermission]

    def list(self, request):
        return Response({
            'endpoints': [
                'analytics/reports/branch-performance/',
                'analytics/reports/counselor-kpis/',
                'analytics/reports/forecast/'
            ]
        })

    def _parse_period(self, request):
        start_param = request.query_params.get('start')
        end_param = request.query_params.get('end')
        try:
            period_days = int(request.query_params.get('period_days', 30))
        except ValueError as exc:
            raise ValidationError('period_days must be an integer.') from exc

        if start_param and end_param:
            try:
                start = datetime.strptime(start_param, '%Y-%m-%d').date()
                end = datetime.strptime(end_param, '%Y-%m-%d').date()
            except ValueError as exc:
                raise ValidationError('Invalid date format. Use YYYY-MM-DD.') from exc
        else:
            end = timezone.now().date()
            start = end - timedelta(days=period_days)

        start_dt = timezone.make_aware(datetime.combine(start, datetime.min.time()))
        end_dt = timezone.make_aware(datetime.combine(end, datetime.max.time()))
        return start, end, start_dt, end_dt

    def _resolve_branches(self, request):
        user = request.user
        branch_id = request.query_params.get('branch_id')
        if branch_id and (is_hq_user(user) or is_country_manager(user)):
            branch = Branch.objects.filter(id=branch_id).first()
            if branch:
                if is_country_manager(user):
                    user_country = get_user_country(user)
                    if not user_country or branch.country != user_country:
                        return Branch.objects.none()
                return Branch.objects.filter(id=branch.id)

        branch = resolve_branch_from_request(request)
        if branch:
            return Branch.objects.filter(id=branch.id)

        if is_hq_user(user):
            return Branch.objects.all()

        if is_country_manager(user):
            user_country = get_user_country(user)
            if not user_country:
                return Branch.objects.none()
            return Branch.objects.filter(country=user_country)

        return Branch.objects.none()

    @action(detail=False, methods=['get'])
    def branch_performance(self, request):
        start, end, start_dt, end_dt = self._parse_period(request)
        branches = self._resolve_branches(request)

        results = []
        for branch in branches:
            leads_qs = Lead.objects.filter(branch=branch, created_at__range=(start_dt, end_dt))
            students_qs = Student.objects.filter(branch=branch, created_at__range=(start_dt, end_dt))
            transactions_qs = Transaction.objects.filter(
                branch=branch,
                status=Transaction.Status.PAID,
                transaction_type=Transaction.TransactionType.CREDIT,
                date__range=(start, end)
            )

            leads_total = leads_qs.count()
            conversions = leads_qs.filter(status=Lead.Status.CONVERTED).count()
            students_total = students_qs.count()
            revenue = transactions_qs.aggregate(total=Sum('amount'))['total'] or 0

            spend_entry = BranchKpiInput.objects.filter(
                branch=branch,
                period_start__lte=end,
                period_end__gte=start
            ).order_by('-period_end').first()
            marketing_spend = spend_entry.marketing_spend if spend_entry else 0
            cac = float(marketing_spend) / students_total if students_total else None

            results.append({
                'branch_id': str(branch.id),
                'branch_name': branch.name,
                'period_start': str(start),
                'period_end': str(end),
                'leads_total': leads_total,
                'conversions': conversions,
                'conversion_rate': float(conversions) / leads_total if leads_total else 0,
                'students_total': students_total,
                'revenue': float(revenue),
                'marketing_spend': float(marketing_spend),
                'cac': cac,
            })

        return Response({'results': results})

    @action(detail=False, methods=['get'])
    def counselor_kpis(self, request):
        start, end, start_dt, end_dt = self._parse_period(request)
        branches = self._resolve_branches(request)

        results = []
        for branch in branches:
            counselors = User.objects.filter(branch=branch, role=User.Role.COUNSELOR, is_active=True)
            for counselor in counselors:
                leads = Lead.objects.filter(assigned_to=counselor, created_at__range=(start_dt, end_dt))
                students = Student.objects.filter(counselor=counselor, created_at__range=(start_dt, end_dt))
                tasks = Task.objects.filter(
                    assigned_to=counselor,
                    completed_at__isnull=False,
                    completed_at__range=(start_dt, end_dt)
                )
                on_time = tasks.filter(due_date__isnull=False, completed_at__lte=F('due_date')).count()
                tasks_total = tasks.count()

                results.append({
                    'branch_id': str(branch.id),
                    'branch_name': branch.name,
                    'counselor_id': str(counselor.id),
                    'counselor_name': counselor.get_full_name() or counselor.email,
                    'period_start': str(start),
                    'period_end': str(end),
                    'leads_assigned': leads.count(),
                    'students_converted': students.count(),
                    'tasks_completed': tasks_total,
                    'sla_compliance_rate': float(on_time) / tasks_total if tasks_total else None,
                })

        return Response({'results': results})

    @action(detail=False, methods=['get'])
    def forecast(self, request):
        try:
            months = int(request.query_params.get('months', 3))
        except ValueError as exc:
            raise ValidationError('months must be an integer.') from exc
        branches = self._resolve_branches(request)
        now = timezone.now()
        start_dt = now - timedelta(days=30 * months)

        results = []
        for branch in branches:
            lead_months = (
                Lead.objects.filter(branch=branch, created_at__gte=start_dt)
                .annotate(month=TruncMonth('created_at'))
                .values('month')
                .annotate(total=Count('id'))
                .order_by('month')
            )
            revenue_months = (
                Transaction.objects.filter(
                    branch=branch,
                    status=Transaction.Status.PAID,
                    transaction_type=Transaction.TransactionType.CREDIT,
                    date__gte=start_dt.date()
                )
                .annotate(month=TruncMonth('date'))
                .values('month')
                .annotate(total=Sum('amount'))
                .order_by('month')
            )

            lead_values = [row['total'] for row in lead_months]
            revenue_values = [row['total'] or 0 for row in revenue_months]
            lead_avg = sum(lead_values) / len(lead_values) if lead_values else 0
            revenue_avg = float(sum(revenue_values) / len(revenue_values)) if revenue_values else 0

            forecast_points = []
            for i in range(1, months + 1):
                forecast_month = (now + timedelta(days=30 * i)).date()
                forecast_points.append({
                    'month': forecast_month.strftime('%Y-%m'),
                    'projected_leads': round(lead_avg, 2),
                    'projected_revenue': round(revenue_avg, 2),
                })

            results.append({
                'branch_id': str(branch.id),
                'branch_name': branch.name,
                'months_observed': months,
                'lead_average': round(lead_avg, 2),
                'revenue_average': round(revenue_avg, 2),
                'forecast': forecast_points,
            })

        return Response({'results': results})
