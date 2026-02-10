from rest_framework import viewsets, status, views, permissions
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from django.conf import settings
import logging
from .models import MagicLink
from .serializers import CreateMagicLinkSerializer, MagicLinkDetailSerializer
from students.models import Document
from requirements.models import RequiredDocument
from django.db.models import Q
from visa_crm_backend.mixins import BranchIsolationMixin
from accounts.models import User
from accounts.permissions import MagicLinkPermission
from audit.mixins import AuditLogMixin
from core.utils.branch_context import assert_branch_access
from core.utils.upload_validation import validate_upload
from .throttles import MagicLinkPublicThrottle

logger = logging.getLogger(__name__)


class ManageMagicLinkViewSet(AuditLogMixin, BranchIsolationMixin, viewsets.ModelViewSet):
    """
    Staff-only ViewSet to generate and manage magic links.
    """
    queryset = MagicLink.objects.all()
    branch_field = 'student__branch'
    serializer_class = CreateMagicLinkSerializer
    permission_classes = [permissions.IsAuthenticated, MagicLinkPermission]

    def get_queryset(self):
        queryset = super().get_queryset()
        if getattr(self.request.user, 'role', None) == User.Role.COUNSELOR:
            return queryset.filter(student__counselor=self.request.user)
        return queryset
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            logger.warning("Magic link validation error: %s", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        student = serializer.validated_data['student']
        requirements = serializer.validated_data['requirements']
        expiry_hours = serializer.validated_data.get('expiry_hours', 48)

        assert_branch_access(
            request,
            student.branch,
            message="Cannot generate magic links for another branch."
        )
        if getattr(request.user, 'role', None) == User.Role.COUNSELOR and student.counselor_id != request.user.id:
            return Response(
                {'error': 'You can only generate links for your own students.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        expires_at = timezone.now() + timedelta(hours=expiry_hours)
        
        link = MagicLink.objects.create(
            student=student,
            expires_at=expires_at,
            created_by=request.user
        )
        link.requirements.set(requirements)
        
        # Generate URL (Mocking full URL)
        # In real app: settings.FRONTEND_URL + /upload/ + token
        url = f"https://crm.bwbs.com/magic-upload/{link.token}"
        
        return Response({
            'message': 'Magic link generated successfully',
            'token': link.token,
            'url': url,
            'expires_at': expires_at
        }, status=status.HTTP_201_CREATED)


class PublicMagicLinkView(views.APIView):
    """
    Public View for External Users to Validate Token.
    """
    permission_classes = [permissions.AllowAny]
    throttle_classes = [MagicLinkPublicThrottle]
    
    def get(self, request, token):
        logger.info("Validating magic link token.")

        # 1. Flexible Lookup: Check if 'token' matches UUID OR 'id' matches UUID
        try:
            # Check if token is a valid UUID
            magic_link = MagicLink.objects.get(Q(token=token) | Q(id=token))
        except MagicLink.DoesNotExist:
            logger.info("Magic link token not found.")
            return Response({'error': 'Invalid Link'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            # Handle if token string is not a valid UUID format
            logger.info("Magic link invalid UUID format: %s", e)
            return Response({'error': 'Invalid Link format'}, status=status.HTTP_404_NOT_FOUND)

        # 2. Check Expiry
        if not magic_link.is_valid(): # Uses model method which checks expiry
            logger.info("Magic link expired.")
            return Response({'error': 'Link Expired'}, status=status.HTTP_410_GONE)

        # 3. Success Response
        logger.info("Magic link valid.")
        return Response({
            'student_name': magic_link.student.full_name if magic_link.student else "Student",
            'expires_at': magic_link.expires_at,
            'requirements': [
                {
                    'id': req.id,
                    'name': req.name,
                    'description': req.description,
                    'status': 'pending' # Logic to check if file exists can be added here
                } for req in magic_link.requirements.all()
            ]
        })


class MagicLinkUploadView(views.APIView):
    """
    Public Upload Endpoint.
    """
    permission_classes = [permissions.AllowAny]
    throttle_classes = [MagicLinkPublicThrottle]
    
    def post(self, request, token):
        # 1. Validate Token (Flexible Lookup)
        try:
            magic_link = MagicLink.objects.get(Q(token=token) | Q(id=token))
        except MagicLink.DoesNotExist:
            return Response({'error': 'Invalid Link'}, status=status.HTTP_404_NOT_FOUND)
        except Exception:
             return Response({'error': 'Invalid Link Format'}, status=status.HTTP_404_NOT_FOUND)
            
        if magic_link.is_used:
            return Response({'error': 'Link already completed'}, status=status.HTTP_410_GONE)

        if not magic_link.is_valid():
            return Response({'error': 'Link Expired'}, status=status.HTTP_410_GONE)
            
        # 2. Get Data
        file_obj = request.FILES.get('file')
        requirement_id = request.data.get('requirement_id')
        
        if not file_obj or not requirement_id:
            return Response({'error': 'File and Requirement ID are required'}, status=status.HTTP_400_BAD_REQUEST)

        validate_upload(file_obj)
        
        # Verify requirement is allowed for this link
        if not magic_link.requirements.filter(id=requirement_id).exists():
             return Response({'error': 'Requirement not requested in this link'}, status=status.HTTP_400_BAD_REQUEST)

        # 3. Create Document with LINKAGE
        # Using correct model fields instead of snippet's pseudo-fields
        document = Document.objects.create(
            student=magic_link.student,
            branch=magic_link.student.branch,
            file=file_obj,
            file_name=file_obj.name,
            file_size=file_obj.size,
            uploaded_by=None, # System upload
            requirement_id=requirement_id, # Link to Requirement (Crucial)
            category='OTHER', # Default category
            document_type=f"Magic Link Upload ({file_obj.name})",
            verification_status='PENDING' # Use default from model choices
        )
        
        # Mark as completed only when all requirements are uploaded
        required_ids = list(magic_link.requirements.values_list('id', flat=True))
        uploaded_ids = Document.objects.filter(
            student=magic_link.student,
            requirement_id__in=required_ids,
        ).values_list('requirement_id', flat=True).distinct()

        if len(required_ids) > 0 and len(set(uploaded_ids)) == len(required_ids):
            magic_link.is_used = True
            magic_link.save(update_fields=['is_used'])

        return Response({'message': 'File uploaded successfully', 'document_id': document.id}, status=status.HTTP_201_CREATED)
