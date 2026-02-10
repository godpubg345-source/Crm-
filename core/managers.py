from django.db import models
from accounts.models import User

class TenantQuerySet(models.QuerySet):
    def for_user(self, user):
        """
        Universal Filtering Logic:
        1. Superuser/Admin -> See Everything.
        2. Branch Manager -> See Branch Data.
        3. Counselor -> See Assigned Data OR Branch Data.
        """
        # Always hide soft-deleted items by default
        qs = self.filter(is_deleted=False)

        if not user or not getattr(user, 'is_authenticated', False):
            return qs.none()

        role = getattr(user, 'role', None)

        # 1. HQ/Admins see all
        if user.is_superuser or role in (User.Role.SUPER_ADMIN, User.Role.AUDITOR):
            return qs

        # 2. Country Manager: all branches in their country (if branch is available)
        if role == User.Role.COUNTRY_MANAGER:
            if getattr(user, 'branch', None) and hasattr(self.model, 'branch'):
                return qs.filter(branch__country=user.branch.country)
            return qs

        # 3. Branch Filtering
        if getattr(user, 'branch', None):
            qs = qs.filter(branch_id=user.branch_id)

        # 4. Counselor Filtering (Only if model has 'counselor' field)
        if role == User.Role.COUNSELOR and hasattr(self.model, 'counselor'):
            qs = qs.filter(counselor=user)

        return qs

class TenantManager(models.Manager):
    def get_queryset(self):
        # Default: Return custom queryset & hide deleted
        return TenantQuerySet(self.model, using=self._db).filter(is_deleted=False)

    def for_user(self, user):
        return self.get_queryset().for_user(user)
