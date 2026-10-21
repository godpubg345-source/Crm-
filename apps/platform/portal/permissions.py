from rest_framework import permissions

class IsPortalAuthenticated(permissions.BasePermission):
    """
    Allows access only to authenticated portal students.
    """
    def has_permission(self, request, view):
        # request.user will be the Student object if authenticated via PortalAuthentication
        # request.auth will be the PortalSession object
        from apps.crm.students.models import Student
        return isinstance(request.user, Student) and request.auth is not None
