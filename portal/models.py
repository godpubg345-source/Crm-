import uuid
from django.conf import settings
from django.db import models

from core.models import TenantAwareModel


class PortalAccess(TenantAwareModel):
    class Status(models.TextChoices):
        INVITED = 'INVITED', 'Invited'
        ACTIVE = 'ACTIVE', 'Active'
        SUSPENDED = 'SUSPENDED', 'Suspended'

    student = models.OneToOneField(
        'students.Student',
        on_delete=models.CASCADE,
        related_name='portal_access'
    )
    parent_email = models.EmailField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.INVITED)
    invite_token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    invited_at = models.DateTimeField(null=True, blank=True)
    last_login_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='portal_access_created'
    )

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"PortalAccess {self.student.student_code}"

    def save(self, *args, **kwargs):
        from django.utils import timezone
        if self.student and not self.branch:
            self.branch = self.student.branch
        if self.status == self.Status.INVITED and self.invited_at is None:
            self.invited_at = timezone.now()
        super().save(*args, **kwargs)


class PortalNotification(TenantAwareModel):
    class Category(models.TextChoices):
        INFO = 'INFO', 'Info'
        ACTION = 'ACTION', 'Action Required'
        PAYMENT = 'PAYMENT', 'Payment'
        DOCUMENT = 'DOCUMENT', 'Document'

    student = models.ForeignKey('students.Student', on_delete=models.CASCADE, related_name='portal_notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.INFO)
    read_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='portal_notifications_created'
    )

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student.student_code} - {self.title}"

    def save(self, *args, **kwargs):
        if self.student and not self.branch:
            self.branch = self.student.branch
        super().save(*args, **kwargs)


class PortalSession(TenantAwareModel):
    """
    Session token for portal access (student/parent).
    """

    access = models.ForeignKey(
        PortalAccess,
        on_delete=models.CASCADE,
        related_name='sessions'
    )
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    revoked_at = models.DateTimeField(null=True, blank=True)
    last_seen_at = models.DateTimeField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"PortalSession {self.access.student.student_code}"

    def save(self, *args, **kwargs):
        if self.access and not self.branch:
            self.branch = self.access.student.branch
        super().save(*args, **kwargs)
