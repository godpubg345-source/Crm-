from django.db import models
from django.conf import settings
from core.models import TenantAwareModel

class Resource(TenantAwareModel):
    """
    Represents a file or link in the Knowledge Library.
    """
    CATEGORY_CHOICES = [
        ('TRAINING', 'Training Material'),
        ('MARKETING', 'Marketing Assets'),
        ('VISA_GUIDE', 'Visa Guidelines'),
        ('UNIVERSITY', 'University Info'),
        ('POLICY', 'Company Policy'),
        ('OTHER', 'Other'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to='resources/%Y/%m/', blank=True, null=True)
    link = models.URLField(blank=True, null=True, help_text="External link if no file")
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='OTHER')
    
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='uploaded_resources'
    )
    
    # Roles that can view this resource (JSON list of strings)
    # e.g. ["COUNSELOR", "BRANCH_MANAGER"]
    # If empty/null, visible to all authenticated users? Or none?
    # Let's say empty = all internal staff.
    visible_to_roles = models.JSONField(default=list, blank=True, help_text="List of roles allowed to view. Empty = All.")

    def __str__(self):
        return self.title
