import uuid

from django.conf import settings
from django.db import models


class AuditLog(models.Model):
    class Action(models.TextChoices):
        CREATE = 'CREATE', 'Create'
        UPDATE = 'UPDATE', 'Update'
        DELETE = 'DELETE', 'Delete'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs'
    )
    action = models.CharField(max_length=10, choices=Action.choices)
    model = models.CharField(max_length=100)
    object_id = models.CharField(max_length=64, null=True, blank=True)
    object_repr = models.CharField(max_length=255, null=True, blank=True)
    branch = models.ForeignKey(
        'branches.Branch',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs'
    )
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    path = models.CharField(max_length=255)
    method = models.CharField(max_length=10)
    status_code = models.PositiveSmallIntegerField(null=True, blank=True)
    changes = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Audit Log"
        verbose_name_plural = "Audit Logs"

    def __str__(self):
        return f"{self.action} {self.model} {self.object_id or ''}"
