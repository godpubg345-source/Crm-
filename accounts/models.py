import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom User model extending AbstractUser.
    Supports role-based access control with branch-level data isolation.
    """
    
    class Role(models.TextChoices):
        SUPER_ADMIN = 'SUPER_ADMIN', 'Super Admin'
        COUNTRY_MANAGER = 'COUNTRY_MANAGER', 'Country Manager'
        BRANCH_MANAGER = 'BRANCH_MANAGER', 'Branch Manager'
        COUNSELOR = 'COUNSELOR', 'Branch Counselor'
        FINANCE_OFFICER = 'FINANCE_OFFICER', 'Finance Officer'
        DOC_PROCESSOR = 'DOC_PROCESSOR', 'Document Processor'
        AUDITOR = 'AUDITOR', 'Read-Only Auditor'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.COUNSELOR,
    )
    branch = models.ForeignKey(
        'branches.Branch',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users',
        help_text="Branch assignment. Null for HQ-level roles like Super Admin."
    )
    phone = models.CharField(max_length=20, blank=True, null=True)
    
    # Override username to make email the primary identifier
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"
    
    @property
    def is_hq_user(self):
        """Check if user is an HQ-level user (Super Admin or Auditor)"""
        return self.is_superuser or self.role in [self.Role.SUPER_ADMIN, self.Role.AUDITOR]
    
    @property
    def can_access_all_branches(self):
        """Check if user has access to all branches"""
        return self.is_superuser or self.role == self.Role.SUPER_ADMIN


class EmployeePerformance(models.Model):
    """
    Tracks gamification and performance metrics for employees.
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='performance'
    )
    
    # Gamification
    points = models.IntegerField(default=0, help_text="Total lifetime points earned")
    xp = models.IntegerField(default=0, help_text="Experience points toward next level")
    level = models.IntegerField(default=1)
    
    # Revenue & Conversions
    total_conversions = models.IntegerField(default=0)
    revenue_generated = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Wallet (Pending Commissions)
    wallet_balance = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=0,
        help_text="Unpaid commission balance"
    )
    
    # Activity Stats
    average_response_time = models.DurationField(null=True, blank=True)
    last_active = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Performance: {self.user.get_full_name()} (Lvl {self.level})"

    class Meta:
        verbose_name = "Employee Performance"
        verbose_name_plural = "Employee Performances"
class EmployeeDossier(models.Model):
    """
    Tracks sensitive HR and employment data for employees.
    """
    class ContractType(models.TextChoices):
        PERMANENT = 'PERMANENT', 'Permanent'
        FIXED_TERM = 'FIXED_TERM', 'Fixed Term'
        PROBATION = 'PROBATION', 'Probationary'
        CONTRACTOR = 'CONTRACTOR', 'External Contractor'

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='dossier'
    )
    
    # Financials
    base_salary = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency = models.CharField(max_length=10, default='GBP')
    
    # Timeline
    joined_date = models.DateField(null=True, blank=True)
    probation_end_date = models.DateField(null=True, blank=True)
    
    # Contract Status
    contract_type = models.CharField(
        max_length=20,
        choices=ContractType.choices,
        default=ContractType.PROBATION
    )
    contract_progress = models.IntegerField(default=0, help_text="Progress percentage 0-100")
    
    # Metadata
    last_review_date = models.DateField(null=True, blank=True)
    next_review_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"Dossier: {self.user.get_full_name()} ({self.get_contract_type_display()})"

    class Meta:
        verbose_name = "Employee Dossier"
        verbose_name_plural = "Employee Dossiers"
class EmployeeAuditLog(models.Model):
    """
    Forensic record of sensitive changes to employee profiles or HR data.
    """
    actor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='actions_logged'
    )
    target_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='audit_records'
    )
    
    event_type = models.CharField(max_length=50, default='UPDATE')
    field_name = models.CharField(max_length=100)
    old_value = models.TextField(null=True, blank=True)
    new_value = models.TextField(null=True, blank=True)
    
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    def __str__(self):
        return f"Audit: {self.target_user.email} - {self.field_name} by {self.actor.email if self.actor else 'SYSTEM'}"

    class Meta:
        ordering = ['-timestamp']
        verbose_name = "Employee Audit Log"
        verbose_name_plural = "Employee Audit Logs"


class EmployeeIncentive(models.Model):
    """
    Monthly snapshot of performance for incentive/bonus calculation.
    """
    class PayoutStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending Review'
        APPROVED = 'APPROVED', 'Approved for Payout'
        PAID = 'PAID', 'Paid'
        REJECTED = 'REJECTED', 'Rejected'

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='performance_incentives'
    )
    
    month = models.DateField(help_text="First day of the month for this snapshot")
    
    # Snapshot Metrics
    points_earned = models.IntegerField(default=0)
    conversions = models.IntegerField(default=0)
    revenue_generated = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Calculated Bonus
    base_incentive = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    performance_multiplier = models.DecimalField(max_digits=5, decimal_places=2, default=1.0)
    total_incentive = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    status = models.CharField(
        max_length=20,
        choices=PayoutStatus.choices,
        default=PayoutStatus.PENDING
    )
    
    remarks = models.TextField(blank=True, null=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    processed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='incentives_processed'
    )

    def calculate_total(self):
        self.total_incentive = self.base_incentive * self.performance_multiplier
        return self.total_incentive

    def __str__(self):
        return f"Incentive: {self.user.get_full_name()} ({self.month.strftime('%B %Y')})"

    class Meta:
        unique_together = ['user', 'month']
        verbose_name = "Employee Incentive"
        verbose_name_plural = "Employee Incentives"
class EmployeePayroll(models.Model):
    """
    Financial record of a specific month's payout.
    """
    class PayoutStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        APPROVED = 'APPROVED', 'Approved'
        PAID = 'PAID', 'Paid'
        VOID = 'VOID', 'Void'

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='payroll_records'
    )
    month = models.DateField(help_text="First day of the month for this payroll")
    
    base_salary_snapshot = models.DecimalField(max_digits=12, decimal_places=2)
    incentive_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    gross_payout = models.DecimalField(max_digits=12, decimal_places=2)
    tax_deductions = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    other_deductions = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    net_payout = models.DecimalField(max_digits=12, decimal_places=2)
    
    status = models.CharField(
        max_length=20,
        choices=PayoutStatus.choices,
        default=PayoutStatus.PENDING
    )
    
    payout_date = models.DateField(null=True, blank=True)
    payslip_pdf = models.FileField(upload_to='payslips/', null=True, blank=True)
    
    # Audit tracking
    processed_at = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    def calculate_net(self):
        self.gross_payout = self.base_salary_snapshot + self.incentive_total
        self.net_payout = self.gross_payout - self.tax_deductions - self.other_deductions
        return self.net_payout

    def __str__(self):
        return f"Payroll: {self.user.get_full_name()} ({self.month.strftime('%B %Y')})"

    class Meta:
        unique_together = ['user', 'month']
        verbose_name = "Employee Payroll"
        verbose_name_plural = "Employee Payrolls"


class AttendanceLog(models.Model):
    """
    Log of daily attendance and working hours.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attendance_logs')
    branch = models.ForeignKey('branches.Branch', on_delete=models.CASCADE, related_name='attendance_records')
    
    date = models.DateField(db_index=True)
    clock_in = models.DateTimeField(null=True, blank=True)
    clock_out = models.DateTimeField(null=True, blank=True)
    
    total_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    is_on_leave = models.BooleanField(default=False)
    
    notes = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Attendance Log"
        verbose_name_plural = "Attendance Logs"
        unique_together = ['user', 'date']
        ordering = ['-date', 'user']

    def __str__(self):
        return f"{self.user.email} - {self.date}"


class LeaveRequest(models.Model):
    """
    Employee leave requests and approval workflow.
    """
    class LeaveType(models.TextChoices):
        SICK = 'SICK', 'Sick Leave'
        ANNUAL = 'ANNUAL', 'Annual Leave'
        UNPAID = 'UNPAID', 'Unpaid Leave'
        MATERNITY = 'MATERNITY', 'Maternity/Paternity'
        EMERGENCY = 'EMERGENCY', 'Emergency Leave'

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'
        CANCELLED = 'CANCELLED', 'Cancelled'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='leave_requests')
    branch = models.ForeignKey('branches.Branch', on_delete=models.CASCADE, related_name='leave_records')
    
    leave_type = models.CharField(max_length=20, choices=LeaveType.choices, default=LeaveType.ANNUAL)
    start_date = models.DateField()
    end_date = models.DateField()
    
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_leaves')
    approval_notes = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Leave Request"
        verbose_name_plural = "Leave Requests"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.leave_type} ({self.start_date})"
