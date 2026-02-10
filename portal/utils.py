from django.utils import timezone
from django.conf import settings

from .models import PortalSession


def extract_portal_token(request):
    token = None
    if hasattr(request, 'headers'):
        token = request.headers.get('X-Portal-Token')
        if not token:
            auth = request.headers.get('Authorization', '')
            if auth.lower().startswith('bearer '):
                token = auth.split(' ', 1)[1].strip()
    if not token and hasattr(request, 'META'):
        token = request.META.get('HTTP_X_PORTAL_TOKEN')
    return token


def get_portal_session(request):
    token = extract_portal_token(request)
    if not token:
        return None
    try:
        session = PortalSession.objects.select_related('access', 'access__student').get(token=token)
    except PortalSession.DoesNotExist:
        return None

    if session.revoked_at is not None:
        return None

    if session.expires_at and session.expires_at <= timezone.now():
        return None

    return session
