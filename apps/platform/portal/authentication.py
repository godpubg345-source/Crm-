from rest_framework import authentication
from rest_framework import exceptions
from .utils import get_portal_session

class PortalAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        session = get_portal_session(request)
        if not session:
            return None
        
        # For the portal, 'user' is the Student object linked to the session
        # and 'auth' is the session object itself.
        student = session.access.student
        
        # Compatibility for DRF internal checks
        student.is_authenticated = True
        student.is_anonymous = False
        
        return (student, session)

    def authenticate_header(self, request):
        return 'Bearer realm="portal"'
