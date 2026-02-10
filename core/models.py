import uuid
from django.db import models
from .managers import TenantManager


class TenantAwareModel(models.Model):
    """
    Base Template for ALL Models.
    Includes: UUID, Branch Link, Soft Delete, GDPR Anonymization, Timestamps.
    """
    # Universal UUID Primary Key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Universal Branch Link
    branch = models.ForeignKey(
        'branches.Branch', 
        on_delete=models.CASCADE, 
        null=True, blank=True,
        related_name="%(class)s_branch",  # Generates lead_branch, student_branch etc.
        db_index=True  # Index for faster branch-based queries
    )
    
    # Universal Soft Delete & Logs
    is_deleted = models.BooleanField(default=False, db_index=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    # GDPR Anonymization Fields
    is_anonymized = models.BooleanField(default=False)
    anonymized_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Attach the Brain (Manager)
    objects = TenantManager()
    all_objects = models.Manager()  # Backup to access deleted items

    class Meta:
        abstract = True  # This means no database table for this, just a template.
        ordering = ['-created_at']
        # Note: Composite indexes should be defined in child models with short names
        # Field-level db_index on branch, is_deleted, created_at provide basic optimization


    def delete(self, using=None, keep_parents=False):
        """Soft Delete Logic - sets is_deleted and deleted_at."""
        from django.utils import timezone
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save(update_fields=['is_deleted', 'deleted_at', 'updated_at'])

