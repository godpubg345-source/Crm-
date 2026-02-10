from django.db import models
from core.models import TenantAwareModel
from django.conf import settings

class Task(TenantAwareModel):
    class Priority(models.TextChoices):
        LOW = 'LOW', 'Low'
        MEDIUM = 'MEDIUM', 'Medium'
        HIGH = 'HIGH', 'High'
        URGENT = 'URGENT', 'Urgent'

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        COMPLETED = 'COMPLETED', 'Completed'
        CANCELLED = 'CANCELLED', 'Cancelled'

    class Category(models.TextChoices):
        DOCUMENTATION = 'DOCUMENTATION', 'Documentation'
        FINANCE = 'FINANCE', 'Finance'
        ADMISSION = 'ADMISSION', 'Admission'
        VISA_PREP = 'VISA_PREP', 'Visa Prep'
        POST_ARRIVAL = 'POST_ARRIVAL', 'Post Arrival'
        OTHER = 'OTHER', 'Other'

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='assigned_tasks'
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_tasks'
    )
    student = models.ForeignKey(
        'students.Student',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tasks'
    )
    application = models.ForeignKey(
        'applications.Application',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tasks'
    )
    due_date = models.DateTimeField()
    priority = models.CharField(
        max_length=20,
        choices=Priority.choices,
        default=Priority.MEDIUM
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    category = models.CharField(
        max_length=20,
        choices=Category.choices,
        default=Category.OTHER
    )
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.title

class TaskTemplate(TenantAwareModel):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    category = models.CharField(
        max_length=20,
        choices=Task.Category.choices,
        default=Task.Category.OTHER
    )
    due_days_offset = models.IntegerField(
        default=7, 
        help_text="Number of days from trigger to set the due date"
    )
    country = models.CharField(
        max_length=50, 
        blank=True, 
        null=True, 
        help_text="Specific country this template applies to (or null for all)"
    )
    trigger_status = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="Application status that triggers this task (e.g. SUBMITTED)"
    )
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.title} ({self.country or 'Global'})"
