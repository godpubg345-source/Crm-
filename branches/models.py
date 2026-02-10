import uuid
from django.db import models
from django.utils import timezone


class Branch(models.Model):
    """
    Represents a branch office of the consultancy.
    The is_hq field identifies the UK Headquarters.
    All data isolation is enforced via branch_id foreign keys.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=10, unique=True, help_text="Unique branch code, e.g., LHR, DXB")
    name = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    currency = models.CharField(max_length=10, default='GBP', help_text="Local currency, e.g. PKR, AED")
    address = models.TextField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    timezone = models.CharField(max_length=50, default='UTC')
    is_hq = models.BooleanField(default=False, help_text="Is this the UK Headquarters?")
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Office Hours & Automation
    opening_time = models.TimeField(default='09:00:00', help_text="Local opening time")
    closing_time = models.TimeField(default='18:00:00', help_text="Local closing time")
    auto_handoff_enabled = models.BooleanField(default=False, help_text="Allow automatic lead handoffs after hours")
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def is_currently_open(self):
        """Checks if the branch is currently open based on its local timezone."""
        import datetime
        from zoneinfo import ZoneInfo
        
        if not self.timezone or not self.opening_time or not self.closing_time:
            return True # Assume open if data is missing
            
        try:
            local_now = datetime.datetime.now(ZoneInfo(self.timezone)).time()
            return self.opening_time <= local_now <= self.closing_time
        except Exception:
            # Fallback to true if timezone is invalid
            return True

    @property
    def local_time(self):
        """Returns the current local time string for the branch."""
        import datetime
        from zoneinfo import ZoneInfo
        if not self.timezone:
            return "--:--"
            
        try:
            return datetime.datetime.now(ZoneInfo(self.timezone)).strftime('%H:%M')
        except Exception:
            return "--:--"

    class Meta:
        verbose_name = "Branch"
        verbose_name_plural = "Branches"
        ordering = ['-is_hq', 'name']

    def __str__(self):
        return f"{self.code} - {self.name}"


class TransferRequest(models.Model):
    """
    Workflow for moving a Lead or Student from one branch to another.
    Requires approval from the target branch or HQ.
    """
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'
        CANCELLED = 'CANCELLED', 'Cancelled'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Target of transfer (One of these should be set)
    lead = models.ForeignKey('students.Lead', on_delete=models.CASCADE, null=True, blank=True, related_name='transfer_requests')
    student = models.ForeignKey('students.Student', on_delete=models.CASCADE, null=True, blank=True, related_name='transfer_requests')
    
    # Logistics
    from_branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='transfers_out')
    to_branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='transfers_in')
    reason = models.TextField(help_text="Reason for the transfer request")
    
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    
    # Audit
    requested_by = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='requested_transfers')
    approved_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_transfers')
    approval_notes = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Transfer Request"
        verbose_name_plural = "Transfer Requests"
        ordering = ['-created_at']

    def __str__(self):
        target = self.lead if self.lead else self.student
        return f"Transfer: {target} to {self.to_branch.code}"


class BranchTarget(models.Model):
    """
    Monthly financial and operational targets for a branch.
    Enables vs-target analytics on the dashboard.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='targets')
    
    month = models.PositiveSmallIntegerField()
    year = models.PositiveIntegerField()
    
    # Operational Targets
    target_leads = models.PositiveIntegerField(default=0)
    target_enrollments = models.PositiveIntegerField(default=0)
    
    # Financial Targets
    target_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency = models.CharField(max_length=10, default='GBP')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Branch Target"
        verbose_name_plural = "Branch Targets"
        unique_together = ('branch', 'month', 'year')
        ordering = ['-year', '-month', 'branch']

    def __str__(self):
        return f"{self.branch.code} Target - {self.month}/{self.year}"


class FixedAsset(models.Model):
    """
    Physical property owned/managed by a branch.
    """
    class Category(models.TextChoices):
        IT_EQUIPMENT = 'IT_EQUIPMENT', 'IT Equipment'
        FURNITURE = 'FURNITURE', 'Furniture'
        OFFICE_SUPPLY = 'OFFICE_SUPPLY', 'Office Supply'
        VEHICLE = 'VEHICLE', 'Vehicle'
        OTHER = 'OTHER', 'Other'

    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        UNDER_REPAIR = 'UNDER_REPAIR', 'Under Repair'
        DEPRECATED = 'DEPRECATED', 'Deprecated'
        LOST = 'LOST', 'Lost'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='assets')
    
    name = models.CharField(max_length=200)
    asset_tag = models.CharField(max_length=50, unique=True, null=True, blank=True)
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.OTHER)
    
    purchase_date = models.DateField(null=True, blank=True)
    purchase_value = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    current_value = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    notes = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Fixed Asset"
        verbose_name_plural = "Fixed Assets"
        ordering = ['-purchase_date']

    def __str__(self):
        return f"{self.name} ({self.branch.code})"


class BranchComplaint(models.Model):
    """
    Tracks internal or facility-related complaints for a branch.
    """
    class Status(models.TextChoices):
        OPEN = 'OPEN', 'Open'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        RESOLVED = 'RESOLVED', 'Resolved'
        CLOSED = 'CLOSED', 'Closed'

    class Priority(models.TextChoices):
        LOW = 'LOW', 'Low'
        MEDIUM = 'MEDIUM', 'Medium'
        HIGH = 'HIGH', 'High'
        URGENT = 'URGENT', 'Urgent'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='complaints')
    
    subject = models.CharField(max_length=255)
    description = models.TextField()
    
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    priority = models.CharField(max_length=20, choices=Priority.choices, default=Priority.MEDIUM)
    
    created_by = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='filed_complaints')
    assigned_to = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_complaints')
    
    resolution_notes = models.TextField(blank=True, null=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Branch Complaint"
        verbose_name_plural = "Branch Complaints"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.subject} ({self.branch.code})"

class BranchAnalyticsSnapshot(models.Model):
    """
    Persistent snapshot of branch BI data for historical tracking.
    Enables month-over-month performance comparisons.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='bi_snapshots')
    
    snapshot_date = models.DateField(default=timezone.now)
    
    # Core Metrics Snapshot
    total_leads = models.IntegerField()
    converted_leads = models.IntegerField()
    conversion_rate = models.DecimalField(max_digits=5, decimal_places=2)
    active_students = models.IntegerField()
    
    # Financial Snapshot
    total_revenue_estimate = models.DecimalField(max_digits=12, decimal_places=2)
    total_payroll_monthly = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Pipeline Snapshot (Stored as JSON for flexibility)
    pipeline_state = models.JSONField(default=dict)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Branch Analytics Snapshot"
        verbose_name_plural = "Branch Analytics Snapshots"
        ordering = ['-snapshot_date', 'branch']
        unique_together = ('branch', 'snapshot_date')

    def __str__(self):
        return f"Snapshot: {self.branch.code} - {self.snapshot_date}"
