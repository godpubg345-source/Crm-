from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from django.core.cache import cache
from django.conf import settings
from django_filters.rest_framework import DjangoFilterBackend
from .serializers import (
    EmployeeLeaderboardSerializer, EmployeePerformanceSerializer,
    EmployeePayrollSerializer, AttendanceLogSerializer,
    LeaveRequestSerializer,
    UserSerializer, UserListSerializer, UserCreateSerializer
)
from datetime import datetime
from django.utils import timezone
from django.http import HttpResponse
from decimal import Decimal
from accounts.permissions import UserManagementPermission
from accounts.throttles import LoginThrottle
from visa_crm_backend.mixins import BranchIsolationMixin, BranchIsolationCreateMixin
from audit.mixins import AuditLogMixin
from branches.models import Branch
from core.utils.branch_context import resolve_branch_from_request, assert_branch_access

from .models import AttendanceLog, LeaveRequest
User = get_user_model()


class UserViewSet(AuditLogMixin, BranchIsolationMixin, BranchIsolationCreateMixin, viewsets.ModelViewSet):
    """
    ViewSet for User CRUD operations.
    
    GET /api/users/ - List all users
    POST /api/users/ - Create a user
    GET /api/users/{id}/ - Retrieve a user
    PUT /api/users/{id}/ - Update a user
    DELETE /api/users/{id}/ - Delete a user
    """
    queryset = User.objects.all()
    branch_field = 'branch'
    permission_classes = [IsAuthenticated, UserManagementPermission]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['role', 'branch', 'is_active']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return UserListSerializer
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        serializer = UserSerializer(request.user, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def performance(self, request):
        """Get the current user's performance scorecard."""
        from .models import EmployeePerformance
        perf, _ = EmployeePerformance.objects.get_or_create(user=request.user)
        serializer = EmployeePerformanceSerializer(perf)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def leaderboard(self, request):
        """Get the ranked leaderboard of employees."""
        # Optional: Filter by branch from query params
        branch_id = request.query_params.get('branch')
        
        users = User.objects.filter(is_active=True).exclude(role=User.Role.SUPER_ADMIN)
        
        if branch_id:
            users = users.filter(branch_id=branch_id)
            
        # Select related performance join to avoid N+1
        users = users.select_related('performance').order_by('-performance__points')
        
        serializer = EmployeeLeaderboardSerializer(users, many=True)
        return Response(serializer.data)
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def stats(self, request, pk=None):
        """Get detailed forensic performance stats for a specific employee."""
        user = self.get_object()
        from .models import EmployeePerformance
        from leads.models import Lead
        
        perf, _ = EmployeePerformance.objects.get_or_create(user=user)
        
        # Calculate conversion rate: Enrolled / Total Assigned Leads
        # This requires the leads module to be linked
        total_leads = Lead.objects.filter(assigned_to=user).count()
        enrolled_leads = Lead.objects.filter(assigned_to=user, status='ENROLLED').count()
        
        conversion_rate = (enrolled_leads / total_leads * 100) if total_leads > 0 else 0
        
        return Response({
            'user_id': user.id,
            'full_name': user.get_full_name(),
            'conversion_rate': round(conversion_rate, 2),
            'total_leads': total_leads,
            'enrolled_leads': enrolled_leads,
            'points': perf.points,
            'xp': perf.xp,
            'level': perf.level,
            'wallet_balance': perf.wallet_balance,
            'revenue_generated': str(perf.revenue_generated),
        })

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def generate_payroll(self, request, pk=None):
        """Manually trigger payroll generation for a specific month."""
        user = self.get_object()
        month_str = request.data.get('month') # expected YYYY-MM-DD (first of month)
        if not month_str:
            return Response({'error': 'Month is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            month = datetime.strptime(month_str, '%Y-%m-%d').date().replace(day=1)
        except ValueError:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)
        
        from .models import EmployeeIncentive, EmployeePayroll
        from .utils.payroll_utils import generate_payslip_pdf
        
        dossier = getattr(user, 'dossier', None)
        if not dossier:
            return Response({'error': 'User has no dossier.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if already exists
        if EmployeePayroll.objects.filter(user=user, month=month).exists():
            return Response({'error': 'Payroll record already exists for this month.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Aggregate data
        base_salary = (dossier.base_salary / 12) if dossier.base_salary else Decimal('0')
        incentive = EmployeeIncentive.objects.filter(user=user, month=month, status='APPROVED').first()
        incentive_total = incentive.total_incentive if incentive else Decimal('0')
        
        # Tax calculation (configurable via settings.PAYROLL_TAX_RATE)
        tax_rate = Decimal(str(getattr(settings, 'PAYROLL_TAX_RATE', Decimal('0.20'))))
        tax_deductions = (base_salary + incentive_total) * tax_rate
        
        record = EmployeePayroll.objects.create(
            user=user,
            month=month,
            base_salary_snapshot=base_salary,
            incentive_total=incentive_total,
            tax_deductions=tax_deductions,
            gross_payout=base_salary + incentive_total,
            net_payout=base_salary + incentive_total - tax_deductions,
            status='PENDING'
        )
        
        # Auto-generate PDF
        record.payslip_pdf = generate_payslip_pdf(record)
        record.save()
        
        return Response(EmployeePayrollSerializer(record).data)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def payroll_report(self, request, pk=None):
        """Get the 6-month or 1-year financial report."""
        user = self.get_object()
        months = int(request.query_params.get('months', 6))
        
        from .utils.payroll_utils import calculate_payroll_report
        report = calculate_payroll_report(user, months=months)
        
        return Response({
            'period': report['period'],
            'total_gross': report['aggregates']['total_gross'],
            'total_net': report['aggregates']['total_net'],
            'avg_monthly': report['aggregates']['avg_monthly'],
            'records': EmployeePayrollSerializer(report['records'], many=True).data
        })


def _set_refresh_cookie(response, refresh_token: str) -> None:
    response.set_cookie(
        key=getattr(settings, 'JWT_COOKIE_NAME', 'refresh_token'),
        value=refresh_token,
        httponly=getattr(settings, 'JWT_COOKIE_HTTPONLY', True),
        secure=getattr(settings, 'JWT_COOKIE_SECURE', not settings.DEBUG),
        samesite=getattr(settings, 'JWT_COOKIE_SAMESITE', 'Lax'),
        path=getattr(settings, 'JWT_COOKIE_PATH', '/'),
        domain=getattr(settings, 'JWT_COOKIE_DOMAIN', None),
    )


def _clear_refresh_cookie(response) -> None:
    response.delete_cookie(
        key=getattr(settings, 'JWT_COOKIE_NAME', 'refresh_token'),
        path=getattr(settings, 'JWT_COOKIE_PATH', '/'),
        domain=getattr(settings, 'JWT_COOKIE_DOMAIN', None),
    )


class CustomTokenObtainPairView(TokenObtainPairView):
    permission_classes = [AllowAny]
    throttle_classes = [LoginThrottle]

    def _get_client_ip(self, request):
        xff = request.META.get('HTTP_X_FORWARDED_FOR')
        if xff:
            return xff.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR')

    def _get_identifier(self, request):
        return request.data.get('email') or request.data.get('username') or 'unknown'

    def post(self, request, *args, **kwargs):
        max_attempts = getattr(settings, 'LOGIN_MAX_ATTEMPTS', 5)
        lockout_seconds = getattr(settings, 'LOGIN_LOCKOUT_SECONDS', 900)

        ip = self._get_client_ip(request)
        identifier = self._get_identifier(request)

        lockout_key = f"login_lockout:{ip}:{identifier}"
        fail_key = f"login_fail:{ip}:{identifier}"

        if cache.get(lockout_key):
            return Response(
                {'error': 'Too many failed attempts. Try again later.'},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )

        response = super().post(request, *args, **kwargs)

        if response.status_code == status.HTTP_200_OK:
            cache.delete(fail_key)
            cache.delete(lockout_key)
            refresh_token = response.data.get('refresh') if isinstance(response.data, dict) else None
            if refresh_token:
                _set_refresh_cookie(response, refresh_token)
                response.data.pop('refresh', None)
            return response

        # Increment failures
        fails = cache.get(fail_key, 0) + 1
        cache.set(fail_key, fails, timeout=lockout_seconds)
        if fails >= max_attempts:
            cache.set(lockout_key, True, timeout=lockout_seconds)
            return Response(
                {'error': 'Too many failed attempts. Try again later.'},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )

        return response


class CustomTokenRefreshView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            refresh_token = request.COOKIES.get(getattr(settings, 'JWT_COOKIE_NAME', 'refresh_token'))

        serializer = TokenRefreshSerializer(data={'refresh': refresh_token})
        try:
            serializer.is_valid(raise_exception=True)
        except Exception:
            return Response({'detail': 'Invalid refresh token'}, status=status.HTTP_401_UNAUTHORIZED)

        response = Response(serializer.validated_data, status=status.HTTP_200_OK)
        if 'refresh' in serializer.validated_data:
            _set_refresh_cookie(response, serializer.validated_data['refresh'])
            response.data.pop('refresh', None)
        return response


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh = request.data.get('refresh') or request.COOKIES.get(getattr(settings, 'JWT_COOKIE_NAME', 'refresh_token'))
        if not refresh:
            response = Response({'error': 'Refresh token is required.'}, status=status.HTTP_400_BAD_REQUEST)
            _clear_refresh_cookie(response)
            return response

        try:
            token = RefreshToken(refresh)
            token.blacklist()
        except TokenError:
            response = Response({'error': 'Invalid refresh token.'}, status=status.HTTP_400_BAD_REQUEST)
            _clear_refresh_cookie(response)
            return response

        response = Response({'status': 'logged_out'}, status=status.HTTP_200_OK)
        _clear_refresh_cookie(response)
        return response


class AttendanceLogViewSet(AuditLogMixin, BranchIsolationMixin, viewsets.ModelViewSet):
    """
    ViewSet for branch-specific attendance tracking.
    """
    queryset = AttendanceLog.objects.all()
    serializer_class = AttendanceLogSerializer
    branch_field = 'branch'
    permission_classes = [IsAuthenticated]

    def _resolve_target_branch(self, request):
        """
        Resolve a branch for actions that must be scoped.
        Priority: explicit branch param -> branch context header -> None.
        """
        branch_id = request.data.get('branch') or request.query_params.get('branch')
        if branch_id:
            try:
                branch = Branch.objects.get(id=branch_id)
            except Branch.DoesNotExist:
                raise ValidationError({'branch': 'Invalid branch id.'})
            assert_branch_access(request, branch)
            return branch
        return resolve_branch_from_request(request)

    @action(detail=False, methods=['post'], url_path='clock-out-all')
    def clock_out_all(self, request):
        """
        Clock out all staff with open attendance logs for today in a branch.
        """
        branch = self._resolve_target_branch(request)
        if branch is None:
            return Response({'error': 'Branch is required.'}, status=status.HTTP_400_BAD_REQUEST)

        today = timezone.localdate()
        now = timezone.now()
        logs = AttendanceLog.objects.filter(
            branch=branch,
            date=today,
            clock_in__isnull=False,
            clock_out__isnull=True,
            is_on_leave=False
        )

        updated = 0
        for log in logs:
            log.clock_out = now
            if log.clock_in:
                hours = (now - log.clock_in).total_seconds() / 3600
                log.total_hours = round(hours, 2)
            log.save(update_fields=['clock_out', 'total_hours', 'updated_at'])
            updated += 1

        return Response({'status': 'ok', 'updated': updated})

    @action(detail=False, methods=['get'], url_path='export')
    def export(self, request):
        """
        Export attendance logs for a branch as CSV.
        Optional query params: start=YYYY-MM-DD, end=YYYY-MM-DD, branch=<id>
        """
        branch = self._resolve_target_branch(request)
        if branch is None:
            return Response({'error': 'Branch is required.'}, status=status.HTTP_400_BAD_REQUEST)

        qs = AttendanceLog.objects.filter(branch=branch).select_related('user')

        start = request.query_params.get('start')
        end = request.query_params.get('end')
        if start:
            try:
                start_date = datetime.fromisoformat(start).date()
            except ValueError:
                return Response({'error': 'Invalid start date.'}, status=status.HTTP_400_BAD_REQUEST)
            qs = qs.filter(date__gte=start_date)
        if end:
            try:
                end_date = datetime.fromisoformat(end).date()
            except ValueError:
                return Response({'error': 'Invalid end date.'}, status=status.HTTP_400_BAD_REQUEST)
            qs = qs.filter(date__lte=end_date)

        qs = qs.order_by('-date', 'user__first_name', 'user__last_name')

        import csv
        response = HttpResponse(content_type='text/csv')
        filename = f"attendance_{branch.code}_{timezone.localdate().isoformat()}.csv"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'

        writer = csv.writer(response)
        writer.writerow([
            'date',
            'user',
            'email',
            'clock_in',
            'clock_out',
            'total_hours',
            'is_on_leave',
            'notes'
        ])
        for log in qs:
            writer.writerow([
                log.date.isoformat(),
                log.user.get_full_name(),
                log.user.email,
                log.clock_in.isoformat() if log.clock_in else '',
                log.clock_out.isoformat() if log.clock_out else '',
                str(log.total_hours),
                'yes' if log.is_on_leave else 'no',
                log.notes or ''
            ])

        return response


class LeaveRequestViewSet(AuditLogMixin, BranchIsolationMixin, viewsets.ModelViewSet):
    """
    ViewSet for branch-specific leave requests.
    """
    queryset = LeaveRequest.objects.all()
    serializer_class = LeaveRequestSerializer
    branch_field = 'branch'
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        leave = self.get_object()
        leave.status = LeaveRequest.Status.APPROVED
        leave.approved_by = request.user
        leave.approval_notes = request.data.get('notes', '')
        leave.save()
        return Response({'status': 'Leave request approved'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        leave = self.get_object()
        leave.status = LeaveRequest.Status.REJECTED
        leave.approved_by = request.user
        leave.approval_notes = request.data.get('notes', '')
        leave.save()
        return Response({'status': 'Leave request rejected'})
