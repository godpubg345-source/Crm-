from django.db import models
from django.conf import settings
from django.utils import timezone
from core.models import TenantAwareModel


class University(TenantAwareModel):
    """
    Master data for universities/institutions.
    Global reference data (not branch-isolated).
    """
    
    class Country(models.TextChoices):
        UK = 'UK', 'United Kingdom'
        USA = 'USA', 'United States'
        CANADA = 'CANADA', 'Canada'
        AUSTRALIA = 'AUSTRALIA', 'Australia'
        IRELAND = 'IRELAND', 'Ireland'
        NEW_ZEALAND = 'NEW_ZEALAND', 'New Zealand'
        GERMANY = 'GERMANY', 'Germany'
        NETHERLANDS = 'NETHERLANDS', 'Netherlands'
        FRANCE = 'FRANCE', 'France'
        SWITZERLAND = 'SWITZERLAND', 'Switzerland'
        OTHER = 'OTHER', 'Other'
    
    # Fields handled by TenantAwareModel: id, branch, is_deleted, created_at, updated_at
    # University is typically global, so 'branch' might be null.
    
    name = models.CharField(max_length=255)
    country = models.CharField(max_length=20, choices=Country.choices, default=Country.UK)
    city = models.CharField(max_length=100, blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    logo = models.ImageField(upload_to='universities/logos/', blank=True, null=True)
    
    # Partner info
    is_partner = models.BooleanField(default=False, help_text="Is this a partner university?")
    commission_rate = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True,
        help_text="Commission Percentage (e.g. 10.0)"
    )
    invoice_template = models.CharField(
        max_length=50, 
        choices=[('STANDARD', 'Standard Invoice'), ('DETAILED', 'Detailed Invoice')],
        default='STANDARD',
        help_text="Template for generating commission claims"
    )
    territories = models.TextField(
        blank=True, null=True,
        help_text="Geographic territories covered by this partnership"
    )
    
    # Contact
    contact_email = models.EmailField(blank=True, null=True)
    contact_phone = models.CharField(max_length=30, blank=True, null=True)
    
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = "University"
        verbose_name_plural = "Universities"
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.get_country_display()})"


class Course(TenantAwareModel):
    """
    Courses offered by universities.
    """
    
    class Level(models.TextChoices):
        FOUNDATION = 'FOUNDATION', 'Foundation'
        UG = 'UG', 'Undergraduate (Bachelor)'
        PG = 'PG', 'Postgraduate (Master)'
        PHD = 'PHD', 'Doctorate (PhD)'
        PRE_MASTERS = 'PRE_MASTERS', 'Pre-Masters'
        DIPLOMA = 'DIPLOMA', 'Diploma'
    
    class Currency(models.TextChoices):
        GBP = 'GBP', 'British Pound (£)'
        USD = 'USD', 'US Dollar ($)'
        EUR = 'EUR', 'Euro (€)'
        CAD = 'CAD', 'Canadian Dollar'
        AUD = 'AUD', 'Australian Dollar'
    
    class DataSource(models.TextChoices):
        MANUAL = 'MANUAL', 'Manual Entry'
        PARTNER_PORTAL = 'PARTNER_PORTAL', 'Partner Portal'
        OFFICIAL_WEBSITE = 'OFFICIAL_WEBSITE', 'Official Website'
        UCAS = 'UCAS', 'UCAS'
        EXCEL_IMPORT = 'EXCEL_IMPORT', 'Excel Import'
    
    # Fields handled by TenantAwareModel: id, branch, is_deleted, created_at, updated_at
    
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name='courses')
    
    name = models.CharField(max_length=255, help_text="e.g., MSc Data Science")
    level = models.CharField(max_length=15, choices=Level.choices)
    duration = models.CharField(max_length=50, help_text="e.g., 1 Year, 2 Years")
    duration_months = models.IntegerField(null=True, blank=True, help_text="Duration in months")
    
    # Fees
    tuition_fee = models.DecimalField(max_digits=12, decimal_places=2)
    tuition_fee_home = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, help_text="Home/UK student fee")
    currency = models.CharField(max_length=3, choices=Currency.choices, default=Currency.GBP)
    deposit_required = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    
    # Intake info
    intakes = models.CharField(max_length=100, blank=True, null=True, help_text="e.g., Sep, Jan, May")
    intake_january = models.BooleanField(default=False)
    intake_may = models.BooleanField(default=False)
    intake_september = models.BooleanField(default=True)
    application_deadline = models.DateField(null=True, blank=True)
    
    # Requirements (general)
    ielts_requirement = models.CharField(max_length=50, blank=True, null=True, help_text="e.g., 6.5 overall, 6.0 each")
    ielts_overall = models.DecimalField(max_digits=2, decimal_places=1, null=True, blank=True)
    ielts_each_band = models.DecimalField(max_digits=2, decimal_places=1, null=True, blank=True)
    academic_requirement = models.TextField(blank=True, null=True)
    work_experience_required = models.BooleanField(default=False)
    work_experience_years = models.IntegerField(default=0)
    
    # Official Data Tracking
    official_url = models.URLField(blank=True, null=True, help_text="Official course page URL")
    data_source = models.CharField(max_length=20, choices=DataSource.choices, default=DataSource.MANUAL)
    last_verified = models.DateTimeField(null=True, blank=True, help_text="When data was last verified")
    is_data_verified = models.BooleanField(default=False, help_text="Has this data been verified against official source?")
    
    # Course details
    department = models.CharField(max_length=255, blank=True, null=True)
    course_code = models.CharField(max_length=50, blank=True, null=True)
    
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['university', 'name']
    
    def __str__(self):
        return f"{self.name} - {self.university.name}"


class CourseRequirement(TenantAwareModel):
    """
    Country-specific admission requirements for a course.
    Stores eligibility criteria that vary by student's country of origin.
    """
    
    class Country(models.TextChoices):
        PK = 'PK', 'Pakistan'
        BD = 'BD', 'Bangladesh'
        IN = 'IN', 'India'
        NG = 'NG', 'Nigeria'
        GH = 'GH', 'Ghana'
        KE = 'KE', 'Kenya'
        NP = 'NP', 'Nepal'
        LK = 'LK', 'Sri Lanka'
        AE = 'AE', 'UAE'
        SA = 'SA', 'Saudi Arabia'
        OTHER = 'OTHER', 'Other Countries'
    
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='country_requirements')
    country = models.CharField(max_length=10, choices=Country.choices)
    
    # Academic Requirements
    min_qualification = models.CharField(max_length=255, help_text="e.g., 16 years education, Bachelor's degree")
    accepted_qualifications = models.JSONField(default=list, blank=True, help_text="List of accepted qualifications")
    min_gpa = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True, help_text="Min GPA on 4.0 scale")
    min_percentage = models.IntegerField(null=True, blank=True, help_text="Min percentage score")
    min_cgpa = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True, help_text="Min CGPA on local scale")
    
    # English Requirements (country-specific if different)
    ielts_overall = models.DecimalField(max_digits=2, decimal_places=1, null=True, blank=True)
    ielts_speaking = models.DecimalField(max_digits=2, decimal_places=1, null=True, blank=True)
    ielts_writing = models.DecimalField(max_digits=2, decimal_places=1, null=True, blank=True)
    ielts_reading = models.DecimalField(max_digits=2, decimal_places=1, null=True, blank=True)
    ielts_listening = models.DecimalField(max_digits=2, decimal_places=1, null=True, blank=True)
    toefl_score = models.IntegerField(null=True, blank=True)
    pte_score = models.IntegerField(null=True, blank=True)
    duolingo_score = models.IntegerField(null=True, blank=True)
    
    # Work Experience
    work_experience_years = models.IntegerField(default=0)
    work_experience_required = models.BooleanField(default=False)
    work_experience_details = models.TextField(blank=True, null=True)
    
    # Required Documents
    required_documents = models.JSONField(default=list, blank=True)
    
    # Additional Info
    additional_notes = models.TextField(blank=True, null=True)
    special_conditions = models.TextField(blank=True, null=True)
    
    class Meta:
        unique_together = ['course', 'country']
        ordering = ['course', 'country']
    
    def __str__(self):
        return f"{self.get_country_display()} requirements for {self.course.name}"




class AdmissionCriteria(TenantAwareModel):
    """
    General entry requirements for the University.
    Used for filtering and eligibility checks.
    """
    # Fields handled by TenantAwareModel: id, branch, is_deleted, created_at, updated_at
    
    university = models.OneToOneField(University, on_delete=models.CASCADE, related_name='admission_criteria')
    
    min_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Minimum academic score required (%)")
    min_ielts = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True, help_text="Overall IELTS score (e.g. 6.0)")
    gap_limit = models.PositiveIntegerField(default=2, help_text="Maximum acceptable study gap in years")
    priority_rank = models.PositiveIntegerField(default=10, help_text="1 = High Priority/Partner, 10 = Low")
    accepted_territories = models.TextField(default="Global", help_text="Territories accepted (e.g. Global, South Asia)")
    
    notes = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"Criteria for {self.university.name}"

class Scholarship(TenantAwareModel):
    """
    Scholarships and financial aid offered by universities.
    """
    
    class AmountType(models.TextChoices):
        PERCENTAGE = 'PERCENTAGE', 'Percentage of Tuition'
        FIXED = 'FIXED', 'Fixed Amount'
    
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name='scholarships')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='scholarships', null=True, blank=True, help_text="Optional: Link to a specific course")
    
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    
    amount_type = models.CharField(
        max_length=20, 
        choices=AmountType.choices,
        default=AmountType.PERCENTAGE
    )
    value = models.DecimalField(max_digits=12, decimal_places=2, help_text="e.g. 10.00 for 10% or 5000.00 for £5k")
    
    # Matching Criteria
    min_cgpa = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Minimum academic score required for this scholarship (%)")
    min_ielts = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True, help_text="Overall IELTS score required")
    
    deadline = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-value']
        verbose_name = "Scholarship"
        verbose_name_plural = "Scholarships"

    def __str__(self):
        return f"{self.name} - {self.university.name}"


class PartnershipAgreement(TenantAwareModel):
    """
    Contracts and commission agreements between the agency and university.
    """
    university = models.OneToOneField(University, on_delete=models.CASCADE, related_name='partnership_agreement')
    
    start_date = models.DateField(default=timezone.now)
    end_date = models.DateField(null=True, blank=True)
    
    commission_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=10.0)
    flat_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text="Fixed bonus or flat fee per enrollment")
    
    is_exclusive = models.BooleanField(default=False)
    renewal_reminder_sent = models.BooleanField(default=False)
    
    terms_conditions = models.TextField(blank=True, null=True)
    
    def is_active_contract(self):
        if self.end_date and self.end_date < timezone.now().date():
            return False
        return True

    def __str__(self):
        return f"Agreement: {self.university.name}"


class UniversityContact(TenantAwareModel):
    """
    Key personnel at the university (Admissions, Agents, HQ).
    """
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name='key_contacts')
    
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=100, help_text="e.g. International Admissions Manager")
    email = models.EmailField()
    phone = models.CharField(max_length=30, blank=True, null=True)
    linkedin = models.URLField(blank=True, null=True)
    
    is_primary = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} ({self.university.name})"


class UniversityDocument(TenantAwareModel):
    """
    Vault for partnership-related files.
    """
    class DocType(models.TextChoices):
        CONTRACT = 'CONTRACT', 'Partnership Contract'
        MOU = 'MOU', 'Memorandum of Understanding'
        BROCHURE = 'BROCHURE', 'Marketing Brochure'
        FLYER = 'FLYER', 'Tuition Fees Flyer'
        OTHER = 'OTHER', 'Other Support Doc'

    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name='documents')
    
    title = models.CharField(max_length=255)
    document_type = models.CharField(max_length=20, choices=DocType.choices, default=DocType.OTHER)
    file = models.FileField(upload_to='universities/docs/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.university.name}"


class IntakeDate(TenantAwareModel):
    """
    Specific intake periods for courses.
    """
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='intake_dates')
    month = models.CharField(max_length=20, help_text="e.g. September")
    year = models.IntegerField(default=2024)
    deadline = models.DateField(null=True, blank=True)
    
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.month} {self.year} - {self.course.name}"


class CourseWishlist(TenantAwareModel):
    """
    Saved/bookmarked courses for users.
    Allows students and counselors to create shortlists.
    """
    from django.conf import settings
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='wishlists'
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='wishlisted_by'
    )
    notes = models.TextField(blank=True, null=True, help_text="Optional notes about this saved course")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'course']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.course.name}"


class LivingCostEstimate(models.Model):
    """
    Living cost estimates by city for cost calculator.
    Monthly estimates in local currency.
    """
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=50)
    currency = models.CharField(max_length=3, default='GBP')
    
    # Monthly costs
    monthly_rent = models.DecimalField(max_digits=10, decimal_places=2, help_text="Average rent per month")
    monthly_food = models.DecimalField(max_digits=10, decimal_places=2, help_text="Food and groceries per month")
    monthly_transport = models.DecimalField(max_digits=10, decimal_places=2, help_text="Local transport per month")
    monthly_utilities = models.DecimalField(max_digits=10, decimal_places=2, default=150, help_text="Bills, phone, internet")
    monthly_other = models.DecimalField(max_digits=10, decimal_places=2, default=200, help_text="Entertainment, supplies, misc")
    
    # One-time costs
    visa_fee = models.DecimalField(max_digits=10, decimal_places=2, default=490, help_text="Student visa fee")
    ihs_per_year = models.DecimalField(max_digits=10, decimal_places=2, default=776, help_text="Immigration Health Surcharge/year")
    
    # Notes
    notes = models.TextField(blank=True, null=True)
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['city', 'country']
        ordering = ['country', 'city']
    
    @property
    def monthly_total(self):
        return self.monthly_rent + self.monthly_food + self.monthly_transport + self.monthly_utilities + self.monthly_other
    
    def __str__(self):
        return f"{self.city}, {self.country}"


class CourseReview(models.Model):
    """
    Student reviews and ratings for courses.
    Helps students make informed decisions.
    """
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='course_reviews'
    )
    
    # Rating (1-5 stars)
    overall_rating = models.IntegerField(help_text="1-5 star rating")
    teaching_quality = models.IntegerField(null=True, blank=True)
    career_prospects = models.IntegerField(null=True, blank=True)
    value_for_money = models.IntegerField(null=True, blank=True)
    course_content = models.IntegerField(null=True, blank=True)
    
    # Review text
    title = models.CharField(max_length=200, blank=True, null=True)
    review_text = models.TextField(blank=True, null=True)
    pros = models.TextField(blank=True, null=True, help_text="What was good")
    cons = models.TextField(blank=True, null=True, help_text="What could be improved")
    
    # Reviewer context
    graduation_year = models.IntegerField(null=True, blank=True)
    is_verified = models.BooleanField(default=False, help_text="Verified student/alumni")
    is_anonymous = models.BooleanField(default=False)
    
    # Engagement
    helpful_count = models.IntegerField(default=0)
    
    # Status
    is_approved = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['course', 'user']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.course.name} - {self.overall_rating}★ by {self.user.email}"


class CareerPath(models.Model):
    """
    Career outcomes linked to courses.
    Shows what careers/jobs a course leads to.
    """
    name = models.CharField(max_length=200, help_text="e.g., Data Scientist, Financial Analyst")
    
    class Sector(models.TextChoices):
        TECHNOLOGY = 'TECH', 'Technology'
        FINANCE = 'FINANCE', 'Finance & Banking'
        HEALTHCARE = 'HEALTH', 'Healthcare'
        ENGINEERING = 'ENGINEERING', 'Engineering'
        CONSULTING = 'CONSULTING', 'Consulting'
        MARKETING = 'MARKETING', 'Marketing & Media'
        EDUCATION = 'EDUCATION', 'Education'
        GOVERNMENT = 'GOVERNMENT', 'Government & Public Sector'
        OTHER = 'OTHER', 'Other'
    
    sector = models.CharField(max_length=20, choices=Sector.choices, default=Sector.OTHER)
    description = models.TextField(blank=True, null=True)
    
    # Salary ranges (GBP annual)
    salary_min = models.IntegerField(null=True, blank=True, help_text="Entry level salary GBP")
    salary_max = models.IntegerField(null=True, blank=True, help_text="Senior level salary GBP")
    salary_median = models.IntegerField(null=True, blank=True, help_text="Median salary GBP")
    
    # Employment stats
    employment_rate = models.IntegerField(null=True, blank=True, help_text="% employed in 6 months")
    growth_outlook = models.CharField(
        max_length=20,
        choices=[('HIGH', 'High Growth'), ('MODERATE', 'Moderate'), ('STABLE', 'Stable'), ('DECLINING', 'Declining')],
        default='MODERATE'
    )
    
    # Skills
    key_skills = models.TextField(blank=True, null=True, help_text="Comma-separated skills")
    
    # Linked courses
    courses = models.ManyToManyField(Course, related_name='career_paths', blank=True)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['sector', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.get_sector_display()})"


class CourseQuickApply(TenantAwareModel):
    """
    Quick apply submissions from Course Finder.
    Creates a lightweight application that can be converted to full application.
    """
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='quick_applies'
    )
    student = models.ForeignKey(
        'students.Student',
        on_delete=models.CASCADE,
        related_name='quick_applies',
        null=True, blank=True
    )
    
    # If not logged in or no student profile
    guest_name = models.CharField(max_length=200, blank=True, null=True)
    guest_email = models.EmailField(blank=True, null=True)
    guest_phone = models.CharField(max_length=30, blank=True, null=True)
    guest_country = models.CharField(max_length=50, blank=True, null=True)
    
    # Quick profile info
    highest_qualification = models.CharField(max_length=100, blank=True, null=True)
    percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    ielts_score = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)
    work_experience_years = models.IntegerField(default=0)
    
    # Preferred intake
    preferred_intake = models.CharField(max_length=20, blank=True, null=True, help_text="e.g., Sep 2025")
    
    # Notes
    message = models.TextField(blank=True, null=True, help_text="Additional message")
    
    # Status
    class Status(models.TextChoices):
        NEW = 'NEW', 'New'
        CONTACTED = 'CONTACTED', 'Contacted'
        CONVERTED = 'CONVERTED', 'Converted to Application'
        REJECTED = 'REJECTED', 'Not Interested'
    
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW)
    converted_application = models.ForeignKey(
        'applications.Application',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='quick_apply_source'
    )
    
    # Tracking
    source = models.CharField(max_length=50, default='COURSE_FINDER')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Quick Apply"
        verbose_name_plural = "Quick Applies"
    
    def __str__(self):
        name = self.student.full_name if self.student else self.guest_name
        return f"{name} → {self.course.name}"

