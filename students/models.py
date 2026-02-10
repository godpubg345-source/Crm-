import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone
from core.models import TenantAwareModel
from core.managers import TenantQuerySet


class LeadQuerySet(TenantQuerySet):
    """Custom QuerySet for Lead model."""
    
    def for_user(self, user):
        """Filter leads based on user role."""
        if not user or not user.is_authenticated:
            return self.none()
            
        from accounts.models import User
        role = getattr(user, 'role', None)

        # Admin, HQ, Country Managers, and Branch Managers can view all leads (in their scope)
        if user.is_superuser or role in [
            User.Role.SUPER_ADMIN, 
            User.Role.COUNTRY_MANAGER, 
            User.Role.BRANCH_MANAGER,
            User.Role.AUDITOR
        ]:
            return self.alive()
            
        # Counselors only see their assigned leads
        if role == User.Role.COUNSELOR:
            return self.filter(assigned_to=user)
            
        # Default: No access
        return self.none()


class StudentQuerySet(TenantQuerySet):
    """Custom QuerySet for Student model."""
    
    def for_user(self, user):
        """Filter students based on user role."""
        if not user or not user.is_authenticated:
            return self.none()
            
        from accounts.models import User
        role = getattr(user, 'role', None)
        
        if user.is_superuser or role in [User.Role.SUPER_ADMIN, User.Role.COUNTRY_MANAGER]:
            return self.alive()
            
        if role == User.Role.COUNSELOR:
            return self.filter(counselor=user)
        
        if role == User.Role.BRANCH_MANAGER:
             return self.filter(branch=user.branch)
             
        return self.alive()


class Lead(TenantAwareModel):
    """
    Represents a prospective student before enrollment.
    All leads MUST belong to a branch for data isolation.
    """
    
    class Source(models.TextChoices):
        WALK_IN = 'WALK_IN', 'Walk-in'
        WEBSITE = 'WEBSITE', 'Website'
        FACEBOOK = 'FACEBOOK', 'Facebook'
        REFERRAL = 'REFERRAL', 'Referral'
        EVENT = 'EVENT', 'Event'
        OTHER = 'OTHER', 'Other'
    
    class Status(models.TextChoices):
        NEW = 'NEW', 'New'
        CONTACTED = 'CONTACTED', 'Contacted'
        QUALIFIED = 'QUALIFIED', 'Qualified'
        CONVERTED = 'CONVERTED', 'Converted'
        LOST = 'LOST', 'Lost'

    class Priority(models.TextChoices):
        HOT = 'HOT', 'Hot (High Interest) 🔥'
        WARM = 'WARM', 'Warm (Medium Interest)'
        COLD = 'COLD', 'Cold (Low Interest)'
    
    # Fields handled by TenantAwareModel: id, branch, is_deleted, created_at, updated_at
    # We remove them here.
    
    # Assignment
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_leads',
        help_text="Counselor assigned to this lead"
    )
    
    # Personal Info
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True, null=True)
    
    # Lead Details
    source = models.CharField(max_length=20, choices=Source.choices, default=Source.WALK_IN)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW)
    priority = models.CharField(max_length=10, choices=Priority.choices, default=Priority.WARM)
    score = models.IntegerField(default=0, help_text="Lead score based on interest/profile (0-100)")
    
    target_country = models.CharField(max_length=50, blank=True, null=True, help_text="Destination of interest")
    intended_intake = models.CharField(max_length=50, blank=True, null=True, help_text="e.g., Sep 2026")
    preferred_level = models.CharField(max_length=50, blank=True, null=True, help_text="Undergrad, Postgrad, PhD")
    budget_range = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    
    # SLA Tracking
    last_interaction_at = models.DateTimeField(null=True, blank=True)
    is_sla_violated = models.BooleanField(default=False)
    win_probability = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=0.00, 
        help_text="AI estimated conversion probability (0-100)"
    )
    
    # AI-Suggested Universities
    suggested_universities = models.ManyToManyField(
        'universities.University',
        blank=True,
        related_name='suggested_for_leads',
        help_text="AI-suggested universities based on lead profile"
    )
    
    # Timestamps
    # Timestamps (handled by TenantAwareModel)
    
    class Meta:
        verbose_name = "Lead"
        verbose_name_plural = "Leads"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email'], name='idx_lead_email'),
            models.Index(fields=['status'], name='idx_lead_status'),
            models.Index(fields=['assigned_to'], name='idx_lead_assigned'),
        ]
    
    # objects = LeadQuerySet.as_manager() # Handled by TenantAwareModel
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.get_status_display()})"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def anonymize(self):
        """Remove personal data for GDPR compliance."""
        if self.is_anonymized:
            return
        self.first_name = "Anonymized"
        self.last_name = "Lead"
        self.email = f"anonymized-{self.id}@example.invalid"
        self.phone = None
        self.intended_intake = None
        self.preferred_level = None
        self.budget_range = None
        self.notes = None
        self.is_anonymized = True
        self.anonymized_at = timezone.now()
        self.save(update_fields=[
            'first_name', 'last_name', 'email', 'phone',
            'intended_intake', 'preferred_level', 'budget_range',
            'notes', 'is_anonymized', 'anonymized_at'
        ])



class Student(TenantAwareModel):
    """
    Represents an enrolled student in the CRM.
    Created after Lead conversion. Branch isolation enforced.
    """
    
    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        ON_HOLD = 'ON_HOLD', 'On Hold'
        ENROLLED = 'ENROLLED', 'Enrolled'
        WITHDRAWN = 'WITHDRAWN', 'Withdrawn'
    
    # Fields handled by TenantAwareModel: id, branch, is_deleted, created_at, updated_at
    
    # Link to Lead (optional - student may be created directly)
    lead = models.OneToOneField(
        Lead,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='converted_student',
        help_text="Original lead if converted"
    )
    
    # Counselor assignment
    counselor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='students',
        help_text="Assigned counselor"
    )
    
    # Origin
    source = models.CharField(
        max_length=20,
        choices=Lead.Source.choices,
        default=Lead.Source.WALK_IN,
        help_text="How this student was acquired"
    )
    
    # Unique student code
    student_code = models.CharField(
        max_length=20,
        unique=True,
        help_text="Unique code, e.g., LHR-2026-00123"
    )
    
    # Personal Info
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True, null=True)
    date_of_birth = models.DateField(null=True, blank=True)
    nationality = models.CharField(max_length=100, blank=True, null=True)
    current_address = models.TextField(blank=True, null=True)
    
    # Passport Details
    passport_number = models.CharField(max_length=50, blank=True, null=True)
    passport_expiry = models.DateField(null=True, blank=True)
    
    # Academic & Professional (JSONFields for flexibility)
    academic_history = models.JSONField(
        default=list,
        blank=True,
        help_text="Array of qualifications: [{degree, institution, year, grade}]"
    )
    english_test_type = models.CharField(max_length=20, blank=True, null=True, help_text="IELTS, PTE, TOEFL, etc.")
    english_test_score = models.JSONField(
        default=dict,
        blank=True,
        help_text="Detailed scores: {overall, reading, writing, speaking, listening}"
    )
    work_experience = models.JSONField(
        default=list,
        blank=True,
        help_text="Array of experiences: [{company, role, duration}]"
    )
    financial_status = models.JSONField(
        default=dict,
        blank=True,
        help_text="Sponsor details, bank info"
    )
    
    # Profile tracking
    profile_completeness = models.PositiveIntegerField(
        default=0,
        help_text="Percentage of profile completion (0-100)"
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    
    # Timestamps (Handled by TenantAwareModel)
    

    # objects = StudentQuerySet.as_manager() # Managed by TenantAwareModel (mostly)
    # Actually, we likely want to KEEP specific managers or attach them differently?
    # TenantAwareModel has `objects = TenantManager()`. 
    # If we want `StudentQuerySet`, we should perhaps attach it or rely on TenantManager.
    # The prompt said "objects = ... (Parent handle karega)". So I should remove it.
    
    class Meta:
        verbose_name = "Student"
        verbose_name_plural = "Students"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['student_code'], name='idx_student_code'),
            models.Index(fields=['status'], name='idx_student_status'),
            models.Index(fields=['counselor'], name='idx_student_counselor'),
        ]
    
    def __str__(self):
        return f"{self.student_code} - {self.first_name} {self.last_name}"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    def calculate_profile_completeness(self):
        """Calculate profile completeness percentage."""
        fields_to_check = [
            self.first_name, self.last_name, self.email, self.phone,
            self.date_of_birth, self.nationality, self.passport_number,
            self.passport_expiry, self.academic_history, self.english_test_type
        ]
        filled = sum(1 for f in fields_to_check if f)
        self.profile_completeness = int((filled / len(fields_to_check)) * 100)
        return self.profile_completeness

    def anonymize(self):
        """Remove personal data for GDPR compliance."""
        if self.is_anonymized:
            return
        self.first_name = "Anonymized"
        self.last_name = "Student"
        self.email = f"anonymized-{self.id}@example.invalid"
        self.phone = None
        self.date_of_birth = None
        self.nationality = None
        self.current_address = None
        self.passport_number = None
        self.passport_expiry = None
        self.academic_history = []
        self.english_test_type = None
        self.english_test_score = {}
        self.work_experience = []
        self.financial_status = {}
        self.is_anonymized = True
        self.anonymized_at = timezone.now()
        self.save(update_fields=[
            'first_name', 'last_name', 'email', 'phone',
            'date_of_birth', 'nationality', 'current_address',
            'passport_number', 'passport_expiry', 'academic_history',
            'english_test_type', 'english_test_score', 'work_experience',
            'financial_status', 'is_anonymized', 'anonymized_at'
        ])


class Document(TenantAwareModel):
    """
    Represents uploaded documents for a student.
    Supports verification workflow and categorization.
    """
    
    class Category(models.TextChoices):
        PASSPORT = 'PASSPORT', 'Passport'
        NATIONAL_ID = 'NATIONAL_ID', 'National ID'
        TRANSCRIPT = 'TRANSCRIPT', 'Academic Transcript'
        CERTIFICATE = 'CERTIFICATE', 'Certificate'
        ENGLISH_TEST = 'ENGLISH_TEST', 'English Test Score'
        BANK_STATEMENT = 'BANK_STATEMENT', 'Bank Statement'
        SPONSOR_LETTER = 'SPONSOR_LETTER', 'Sponsor Letter'
        SOP = 'SOP', 'Statement of Purpose'
        CV = 'CV', 'CV/Resume'
        REFERENCE = 'REFERENCE', 'Reference Letter'
        OFFER_LETTER = 'OFFER_LETTER', 'Offer Letter'
        CAS = 'CAS', 'CAS Document'
        VISA = 'VISA', 'Visa Document'
        OTHER = 'OTHER', 'Other'
    
    class VerificationStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        IN_REVIEW = 'IN_REVIEW', 'In Review'
        VERIFIED = 'VERIFIED', 'Verified'
        REJECTED = 'REJECTED', 'Rejected'
    
    # Fields handled by TenantAwareModel: id, branch, is_deleted, created_at, updated_at
    # Note: Document historically didn't have 'branch' explicity but relied on student.branch.
    # TenantAwareModel adds 'branch'. This is fine (and better for isolation).
    
    # Link to student
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='documents'
    )
    application = models.ForeignKey(
        'applications.Application',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='documents',
        help_text="Optional application this document is linked to"
    )
    
    # Document details
    category = models.CharField(max_length=20, choices=Category.choices)
    document_type = models.CharField(max_length=100, help_text="Specific document name")
    
    # Requirement Link (Compliance)
    requirement = models.ForeignKey(
        'requirements.RequiredDocument',
        on_delete=models.SET_NULL,
        null=True, 
        blank=True,
        related_name='student_documents',
        help_text="Linked to a specific visa requirement"
    )
    
    file = models.FileField(upload_to='documents/%Y/%m/', null=True, blank=True)
    file_name = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField(help_text="Size in bytes", null=True, blank=True)
    
    # Verification
    is_verified = models.BooleanField(default=False)
    verification_status = models.CharField(
        max_length=20,
        choices=VerificationStatus.choices,
        default=VerificationStatus.PENDING
    )
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_documents'
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True, null=True)
    
    # Metadata
    expiry_date = models.DateField(null=True, blank=True, help_text="For passport, visa, etc.")
    notify_before_days = models.PositiveIntegerField(default=30, help_text="Notify X days before expiry")
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='uploaded_documents'
    )
    
    class Meta:
        verbose_name = "Document"
        verbose_name_plural = "Documents"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_category_display()} - {self.student.student_code}"

    def anonymize(self):
        """Remove file contents and identifying metadata."""
        if self.is_anonymized:
            return
        self.file = None
        self.file_name = "anonymized"
        self.file_size = None
        self.document_type = "Anonymized Document"
        self.is_anonymized = True
        self.anonymized_at = timezone.now()
        self.save(update_fields=[
            'file', 'file_name', 'file_size', 'document_type',
            'is_anonymized', 'anonymized_at'
        ])


class DocumentAlert(TenantAwareModel):
    """
    Automated alerts for expiring documents.
    Enables Risk Mitigation by notifying counselors.
    """
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='alerts')
    alert_date = models.DateField(auto_now_add=True)
    is_acknowledged = models.BooleanField(default=False)
    acknowledged_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='acknowledged_alerts'
    )
    acknowledged_at = models.DateTimeField(null=True, blank=True)
    
    # We can add severity based on days remaining
    class Severity(models.TextChoices):
        CRITICAL = 'CRITICAL', 'Critical (<7 days)'
        WARNING = 'WARNING', 'Warning (<30 days)'
        INFO = 'INFO', 'Info (>30 days)'
    
    severity = models.CharField(max_length=20, choices=Severity.choices, default=Severity.WARNING)

    class Meta:
        verbose_name = "Document Alert"
        verbose_name_plural = "Document Alerts"
        ordering = ['-alert_date', '-created_at']

    def __str__(self):
        return f"Alert: {self.document.document_type} ({self.document.student.student_code})"


class LeadInteraction(TenantAwareModel):
    """
    Timeline of all interactions with a lead.
    Tracks Calls, WhatsApp, Emails, and Meetings.
    """
    class Type(models.TextChoices):
        CALL = 'CALL', 'Phone Call'
        WHATSAPP = 'WHATSAPP', 'WhatsApp Message'
        EMAIL = 'EMAIL', 'Email sent'
        MEETING = 'MEETING', 'In-person/Online Meeting'
        NOTE = 'NOTE', 'General Note'

    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='interactions')
    staff = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='lead_interactions')
    
    type = models.CharField(max_length=20, choices=Type.choices, default=Type.NOTE)
    content = models.TextField()
    audio_file = models.FileField(upload_to='lead_voice_notes/', null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Lead Interaction"
        verbose_name_plural = "Lead Interactions"
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.get_type_display()} - {self.lead.full_name} ({self.timestamp.date()})"


class WhatsAppTemplate(TenantAwareModel):
    """
    Standardized WhatsApp messages for quick sales engagement.
    """
    class Category(models.TextChoices):
        FOLLOW_UP = 'FOLLOW_UP', 'Follow up'
        BROCHURE = 'BROCHURE', 'Brochure/Info'
        DOCUMENT_REQ = 'DOCUMENT_REQ', 'Document Request'
        GREETING = 'GREETING', 'Greeting'
        OTHER = 'OTHER', 'Other'

    title = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.FOLLOW_UP)
    content = models.TextField(help_text="Template content. Use {first_name}, {last_name}, {target_country} as placeholders.")
    
    class Meta:
        verbose_name = "WhatsApp Template"
        verbose_name_plural = "WhatsApp Templates"
        ordering = ['title']

    def __str__(self):
        return f"[{self.get_category_display()}] {self.title}"

    def format_message(self, lead):
        """Replaces placeholders with lead data."""
        return self.content.format(
            first_name=lead.first_name,
            last_name=lead.last_name,
            target_country=lead.target_country or "your destination"
        )

class CounselorAvailability(TenantAwareModel):
    """Stores counselor's available time slots for student booking."""
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='availability')
    day_of_week = models.IntegerField(choices=[
        (0, 'Monday'), (1, 'Tuesday'), (2, 'Wednesday'), 
        (3, 'Thursday'), (4, 'Friday'), (5, 'Saturday'), (6, 'Sunday')
    ])
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        verbose_name = "Counselor Availability"
        verbose_name_plural = "Counselor Availabilities"
        unique_together = ('user', 'day_of_week', 'start_time', 'end_time')

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.get_day_of_week_display()} ({self.start_time}-{self.end_time})"

