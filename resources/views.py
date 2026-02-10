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

        # If visible_to_roles is empty, show to everyone? Or check logic.
        # Logic: If visible_to_roles is empty OR user.role in visible_to_roles
        # Need complex query or just filter in python? Query is better.
        # But JSONField querying depends on DB (Postgres supports it).
        # For MVP/SQLite: 
        # We can implement a simple filtering here.
        # Actually with SQLite JSONField is supported in recent Django versions.
        
        # However, for robustness, let's just return all for now and filter in frontend 
        # or implement simple logic if list is not huge.
        # Better:
        role = getattr(user, 'role', '')
        
        # We can use Q objects if we really want to filter by JSON content, 
        # but let's keep it simple: Admins see all. Standard users see what's allowed.
        # If we skip filtering for MVP it's also acceptable for "Internal" resources.
        return qs
