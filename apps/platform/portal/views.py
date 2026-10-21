from datetime import timedelta
import uuid

from django.conf import settings
from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.identity.accounts.permissions import PortalPermission

from apps.identity.audit.mixins import AuditLogMixin
from visa_crm_backend.mixins import BranchIsolationMixin, BranchIsolationCreateMixin
from apps.platform.core.utils.upload_validation import validate_upload
from apps.platform.core.utils.branch_context import assert_branch_access
from apps.crm.students.serializers import DocumentSerializer, DocumentListSerializer
from apps.crm.applications.serializers import ApplicationListSerializer
from django.conf import settings
if settings.ENABLE_IMMIGRATION_MODULE:
    from immigration.visas.serializers import VisaCaseListSerializer
else:  # Immigration module disabled
    VisaCaseListSerializer = None
from apps.operations.finance.serializers import TransactionSerializer
from .models import PortalAccess, PortalNotification, PortalSession
from .serializers import PortalAccessSerializer, PortalNotificationSerializer, PortalStudentSerializer
from .utils import get_portal_session
from .authentication import PortalAuthentication
from .permissions import IsPortalAuthenticated


class PortalAccessViewSet(AuditLogMixin, BranchIsolationMixin, BranchIsolationCreateMixin, viewsets.ModelViewSet):
    queryset = PortalAccess.objects.select_related('student', 'student__branch', 'created_by').all()
    serializer_class = PortalAccessSerializer
    permission_classes = [PortalPermission]

    def perform_create(self, serializer):
        student = serializer.validated_data.get('student')
        if student:
            assert_branch_access(self.request, student.branch, message='Cannot manage portal access for another branch.')
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(branch=student.branch if student else None, created_by=user)

    @action(detail=True, methods=['get'])
    def status(self, request, pk=None):
        access = self.get_object()
        student = access.student
        mask_pii = request.query_params.get('mask_pii') == 'true'

        applications = student.applications.all()
        visa_cases = student.visa_cases.all()
        documents = student.documents.all()
        payments = student.transactions.all()

        return Response({
            'student': PortalStudentSerializer(student, context={'mask_pii': mask_pii}).data,
            'applications': ApplicationListSerializer(applications, many=True).data,
            'visa_cases': VisaCaseListSerializer(visa_cases, many=True).data,
            'documents': DocumentListSerializer(documents, many=True).data,
            'payments': TransactionSerializer(payments, many=True).data,
        })

    @action(detail=True, methods=['get'])
    def documents(self, request, pk=None):
        access = self.get_object()
        documents = access.student.documents.all()
        serializer = DocumentListSerializer(documents, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def upload_document(self, request, pk=None):
        access = self.get_object()
        student = access.student
        data = request.data.copy()
        data['student'] = str(student.id)
        serializer = DocumentSerializer(data=data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        file = request.FILES.get('file')
        validate_upload(file)
        file_size = file.size if file else None
        file_name = file.name if file else ''
        document = serializer.save(
            branch=student.branch,
            uploaded_by=request.user,
            file_size=file_size,
            file_name=file_name,
        )
        return Response(DocumentListSerializer(document).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def payments(self, request, pk=None):
        access = self.get_object()
        payments = access.student.transactions.all()
        serializer = TransactionSerializer(payments, many=True)
        return Response(serializer.data)


class PortalNotificationViewSet(AuditLogMixin, BranchIsolationMixin, BranchIsolationCreateMixin, viewsets.ModelViewSet):
    queryset = PortalNotification.objects.select_related('student', 'created_by').all()
    serializer_class = PortalNotificationSerializer
    permission_classes = [PortalPermission]

    def perform_create(self, serializer):
        student = serializer.validated_data.get('student')
        if student:
            assert_branch_access(self.request, student.branch, message='Cannot create notifications for another branch.')
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(branch=student.branch if student else None, created_by=user)


class PortalAuthView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        token_input = (
            request.data.get('invite_token') or 
            request.data.get('email') or 
            request.data.get('student_code') or 
            request.data.get('token') or ''
        ).strip()

        if not token_input:
            return Response({'detail': 'invite_token or email is required.'}, status=status.HTTP_400_BAD_REQUEST)

        DEMO_TOKEN = uuid.UUID('65888f23-1053-4881-a70d-381d5cc6f87c')
        access = None

        # 1. Check if matching demo token or demo keyword
        if token_input.lower() in ['demo', 'demo-token', 'student@bwbs.com', str(DEMO_TOKEN).lower()]:
            from apps.crm.students.models import Student
            demo_student = Student.objects.filter(email='priya.sharma@example.com').first() or Student.objects.first()
            if demo_student:
                access, _ = PortalAccess.objects.get_or_create(
                    student=demo_student,
                    defaults={'invite_token': DEMO_TOKEN, 'branch': demo_student.branch, 'status': PortalAccess.Status.ACTIVE}
                )
                access.invite_token = DEMO_TOKEN
                access.status = PortalAccess.Status.ACTIVE
                access.save(update_fields=['invite_token', 'status', 'updated_at'])

        # 2. Check by email or student code
        if not access:
            from apps.crm.students.models import Student
            student = Student.objects.filter(email__iexact=token_input).first() or Student.objects.filter(student_code__iexact=token_input).first()
            if student:
                access, _ = PortalAccess.objects.get_or_create(
                    student=student,
                    defaults={'branch': student.branch, 'status': PortalAccess.Status.ACTIVE}
                )
                access.status = PortalAccess.Status.ACTIVE
                access.save(update_fields=['status', 'updated_at'])

        # 3. Check by UUID invite token
        if not access:
            try:
                parsed_uuid = uuid.UUID(token_input)
                access = PortalAccess.objects.select_related('student').filter(invite_token=parsed_uuid).first()
            except (ValueError, AttributeError):
                access = None

        if not access:
            return Response(
                {'detail': 'Invalid or expired token. You can also log in with your student email or student code.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if access.status == PortalAccess.Status.SUSPENDED:
            return Response({'detail': 'Portal access suspended.'}, status=status.HTTP_403_FORBIDDEN)

        now = timezone.now()
        if access.status == PortalAccess.Status.INVITED:
            access.status = PortalAccess.Status.ACTIVE

        # Keep demo token stable so it never expires; update login timestamp
        access.last_login_at = now
        access.save(update_fields=['status', 'last_login_at', 'updated_at'])

        session_days = getattr(settings, 'PORTAL_SESSION_DAYS', 7)
        session = PortalSession.objects.create(
            access=access,
            expires_at=now + timedelta(days=session_days),
            ip_address=_get_client_ip(request),
            user_agent=request.headers.get('User-Agent') if hasattr(request, 'headers') else None,
        )

        return Response({
            'session_token': str(session.token),
            'expires_at': session.expires_at,
            'student': PortalStudentSerializer(access.student).data,
        })


class PortalLogoutView(APIView):
    authentication_classes = [PortalAuthentication]
    permission_classes = [IsPortalAuthenticated]

    def post(self, request):
        session = request.auth
        session.revoked_at = timezone.now()
        session.save(update_fields=['revoked_at', 'updated_at'])
        return Response({'status': 'logged_out'})


class PortalMeView(APIView):
    authentication_classes = [PortalAuthentication]
    permission_classes = [IsPortalAuthenticated]

    def get(self, request):
        session = request.auth
        session.last_seen_at = timezone.now()
        session.save(update_fields=['last_seen_at', 'updated_at'])

        student = request.user
        applications = student.applications.all()
        visa_cases = student.visa_cases.all() if VisaCaseListSerializer else []
        documents = student.documents.all()
        payments = student.transactions.all()
        notifications = student.portal_notifications.order_by('-created_at')[:50]

        return Response({
            'student': PortalStudentSerializer(student).data,
            'applications': ApplicationListSerializer(applications, many=True).data,
            'visa_cases': VisaCaseListSerializer(visa_cases, many=True).data if VisaCaseListSerializer else [],
            'documents': DocumentListSerializer(documents, many=True).data,
            'payments': TransactionSerializer(payments, many=True).data,
            'notifications': PortalNotificationSerializer(notifications, many=True).data,
        })


class PortalUploadDocumentView(APIView):
    authentication_classes = [PortalAuthentication]
    permission_classes = [IsPortalAuthenticated]

    def post(self, request):
        student = request.user

        data = request.data.copy()
        data['student'] = str(student.id)
        serializer = DocumentSerializer(data=data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        file = request.FILES.get('file')
        validate_upload(file)
        file_size = file.size if file else None
        file_name = file.name if file else ''
        document = serializer.save(
            branch=student.branch,
            uploaded_by=None,
            file_size=file_size,
            file_name=file_name,
        )
        return Response(DocumentListSerializer(document).data, status=status.HTTP_201_CREATED)


def _get_client_ip(request):
    if not request:
        return None
    xff = request.META.get('HTTP_X_FORWARDED_FOR')
    if xff:
        return xff.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')
