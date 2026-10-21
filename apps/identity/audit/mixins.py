from typing import Any, Dict

from django.forms.models import model_to_dict
from rest_framework.response import Response

from .models import AuditLog


class AuditLogMixin:
    """
    Logs create/update/delete actions for DRF viewsets.
    """

    audit_exclude_fields = {'password', 'refresh', 'access', 'file'}

    def _get_client_ip(self) -> str | None:
        request = self.request
        xff = request.META.get('HTTP_X_FORWARDED_FOR')
        if xff:
            return xff.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR')

    def _get_branch_from_instance(self, instance):
        if not instance:
            return None
        if hasattr(instance, 'branch') and instance.branch:
            return instance.branch
        if hasattr(instance, 'student') and instance.student:
            return instance.student.branch
        if hasattr(instance, 'application') and instance.application:
            if getattr(instance.application, 'student', None):
                return instance.application.student.branch
        if hasattr(instance, 'assigned_to') and instance.assigned_to:
            return instance.assigned_to.branch
        if hasattr(instance, 'created_by') and instance.created_by:
            return instance.created_by.branch
        return None

    def _sanitize_changes(self, data: Any) -> Dict[str, Any]:
        if not data:
            return {}
        if hasattr(data, 'dict'):
            data = data.dict()
        elif hasattr(data, 'items'):
            data = dict(data)
        else:
            return {}

        sanitized: Dict[str, Any] = {}
        for key, value in data.items():
            if key in self.audit_exclude_fields:
                sanitized[key] = '***'
                continue
            if hasattr(value, 'name') and hasattr(value, 'size'):
                sanitized[key] = f"<file:{value.name} ({value.size} bytes)>"
                continue
            if isinstance(value, str) and len(value) > 500:
                sanitized[key] = value[:500] + '...'
                continue
            sanitized[key] = value
        return sanitized

    def _log_action(self, action: str, instance=None, changes=None, status_code=None):
        user = self.request.user if getattr(self.request, 'user', None) and self.request.user.is_authenticated else None
        model_label = instance._meta.label if instance else self.__class__.__name__
        object_id = str(instance.pk) if instance else None
        object_repr = str(instance) if instance else None
        branch = self._get_branch_from_instance(instance)

        AuditLog.objects.create(
            actor=user,
            action=action,
            model=model_label,
            object_id=object_id,
            object_repr=object_repr,
            branch=branch,
            ip_address=self._get_client_ip(),
            path=self.request.path,
            method=self.request.method,
            status_code=status_code,
            changes=changes or {},
        )

    def create(self, request, *args, **kwargs):
        response: Response = super().create(request, *args, **kwargs)
        if 200 <= response.status_code < 300:
            instance = None
            if isinstance(response.data, dict) and response.data.get('id'):
                model = self.get_queryset().model
                try:
                    instance = model.objects.filter(id=response.data.get('id')).first()
                except Exception:
                    instance = None
            changes = self._sanitize_changes(request.data)
            self._log_action(AuditLog.Action.CREATE, instance=instance, changes=changes, status_code=response.status_code)
        return response

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        response: Response = super().update(request, *args, **kwargs)
        if 200 <= response.status_code < 300:
            try:
                instance.refresh_from_db()
            except Exception:
                pass
            changes = self._sanitize_changes(request.data)
            self._log_action(AuditLog.Action.UPDATE, instance=instance, changes=changes, status_code=response.status_code)
        return response

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        response: Response = super().partial_update(request, *args, **kwargs)
        if 200 <= response.status_code < 300:
            try:
                instance.refresh_from_db()
            except Exception:
                pass
            changes = self._sanitize_changes(request.data)
            self._log_action(AuditLog.Action.UPDATE, instance=instance, changes=changes, status_code=response.status_code)
        return response

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        response: Response = super().destroy(request, *args, **kwargs)
        if 200 <= response.status_code < 300:
            snapshot = {}
            try:
                snapshot = model_to_dict(instance)
            except Exception:
                snapshot = {}
            self._log_action(AuditLog.Action.DELETE, instance=instance, changes=snapshot, status_code=response.status_code)
        return response
