import uuid
from django.db import models
from django.utils import timezone
from students.models import Student
from requirements.models import RequiredDocument
from django.conf import settings

class MagicLink(models.Model):
    """
    Secure temporary link for external document uploads.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='magic_links')
    requirements = models.ManyToManyField(RequiredDocument, related_name='magic_links')
    
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    is_used = models.BooleanField(default=False, help_text="Mark as used if one-time link (optional usage)")
    
    def is_valid(self):
        return timezone.now() < self.expires_at

    def __str__(self):
        return f"Link for {self.student.student_code} (Expires: {self.expires_at})"
