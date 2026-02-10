from django.db.models import Sum, Count
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from core.utils.pdf import render_to_pdf
from core.utils.branch_context import assert_branch_access
from visa_crm_backend.mixins import BranchIsolationMixin, BranchIsolationCreateMixin
from audit.mixins import AuditLogMixin
from .models import FeeType, Transaction, CommissionClaim
from .serializers import FeeTypeSerializer, TransactionSerializer, CommissionClaimSerializer
from .services import InvoiceService
from accounts.permissions import FinancePermission

class FeeTypeViewSet(AuditLogMixin, BranchIsolationMixin, BranchIsolationCreateMixin, viewsets.ModelViewSet):
    """
    Manage Fee Types.
    Isolated by branch.
    """
    queryset = FeeType.objects.all()
    serializer_class = FeeTypeSerializer
    permission_classes = [permissions.IsAuthenticated, FinancePermission]

class TransactionViewSet(AuditLogMixin, BranchIsolationMixin, viewsets.ModelViewSet):
    """
    Manage Student Transactions (Payments/Refunds).
    Isolated by student's branch.
    """
    queryset = Transaction.objects.select_related('student', 'fee_type', 'student__branch').all()
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated, FinancePermission]
    branch_field = 'student__branch' # Filter through related student's branch

    def perform_create(self, serializer):
        student = serializer.validated_data.get('student')
        if student:
            assert_branch_access(
                self.request,
                student.branch,
                message="Cannot record transactions for another branch."
            )
        # Auto-assign recorded_by
        serializer.save(
            recorded_by=self.request.user,
            branch=student.branch if student else None
        )


class CommissionViewSet(AuditLogMixin, BranchIsolationMixin, viewsets.ModelViewSet):
    """
    Manage Commissions from Universities.
    Isolated by application's student's branch.
    """
    queryset = CommissionClaim.objects.select_related(
        'application', 'application__student', 
        'application__student__branch', 'university'
    ).all()
    serializer_class = CommissionClaimSerializer
    permission_classes = [permissions.IsAuthenticated, FinancePermission]
    branch_field = 'application__student__branch'

    def perform_create(self, serializer):
        application = serializer.validated_data.get('application')
        if application and application.student:
            assert_branch_access(
                self.request,
                application.student.branch,
                message="Cannot create commission claims for another branch."
            )
        serializer.save(branch=application.student.branch if application and application.student else None)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get aggregated commission stats for the dashboard.
        """
        # queryset = self.filter_queryset(self.get_queryset()) # This would apply pagination if enabled at view level
        # Better use self.get_queryset() and filter manually if branch isolation is needed (BranchIsolationMixin handles it)
        queryset = self.get_queryset()
        
        # Calculate stats
        projected = queryset.filter(status=CommissionClaim.Status.PENDING, is_deleted=False).aggregate(
            total=Sum('expected_amount')
        )['total'] or 0
        
        realized = queryset.filter(status=CommissionClaim.Status.RECEIVED, is_deleted=False).aggregate(
            total=Sum('actual_amount_received')
        )['total'] or 0
        
        pending_invoices = queryset.filter(status=CommissionClaim.Status.INVOICED, is_deleted=False).count()
        
        return Response({
            'projected_revenue': float(projected),
            'realized_revenue': float(realized),
            'pending_invoices': pending_invoices,
        })

    @action(detail=True, methods=['get'])
    def download_invoice(self, request, pk=None):
        """
        Generate and download PDF invoice for the commission claim via Service Layer.
        """
        claim = self.get_object()
        
        pdf_response = InvoiceService.generate_commission_invoice(claim)
        
        if pdf_response:
            return pdf_response
            
        return Response(
            {'error': 'PDF Generation Error or Missing University Details'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
