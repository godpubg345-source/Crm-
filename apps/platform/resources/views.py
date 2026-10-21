from rest_framework import viewsets, permissions, filters
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from .models import Resource
from .serializers import ResourceSerializer

class ResourceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Knowledge Library Resources.
    """
    queryset = Resource.objects.select_related('uploaded_by').order_by('-created_at')
    serializer_class = ResourceSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category']
    search_fields = ['title', 'description']

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

    def get_queryset(self):
        """
        Filter resources based on user role.
        """
        user = self.request.user
        qs = super().get_queryset()

        if user.is_superuser:
            return qs

        role = getattr(user, 'role', None)
        allowed_ids = []
        for resource_id, visible_to_roles in qs.values_list('id', 'visible_to_roles'):
            roles = visible_to_roles or []
            if not roles or (role and role in roles):
                allowed_ids.append(resource_id)

        if not allowed_ids:
            return qs.none()
        return qs.filter(id__in=allowed_ids)
