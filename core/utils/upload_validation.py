import os

from django.conf import settings
from rest_framework.exceptions import ValidationError


DEFAULT_MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10 MB
DEFAULT_ALLOWED_EXTENSIONS = {'.pdf', '.jpg', '.jpeg', '.png'}


def validate_upload(file_obj):
    """
    Validate uploaded file size and extension.
    """
    if not file_obj:
        return

    max_size = getattr(settings, 'MAX_UPLOAD_SIZE', DEFAULT_MAX_UPLOAD_SIZE)
    allowed_exts = set(getattr(settings, 'ALLOWED_UPLOAD_EXTENSIONS', DEFAULT_ALLOWED_EXTENSIONS))

    ext = os.path.splitext(file_obj.name)[1].lower()
    if allowed_exts and ext not in allowed_exts:
        raise ValidationError({'file': 'Unsupported file type. Allowed: PDF, JPG, JPEG, PNG.'})

    if file_obj.size > max_size:
        max_mb = max_size // (1024 * 1024)
        raise ValidationError({'file': f'File too large. Max {max_mb}MB.'})
