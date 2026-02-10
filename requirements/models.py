import uuid
from django.db import models

class VisaType(models.Model):
    """
    Standard Visa Types (e.g. Student, Visit).
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True, help_text="e.g. Student, Visit, Work")
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class RequiredDocument(models.Model):
    """
    Master list of documents (e.g. CAS, TB Test, Bank Statement).
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True, help_text="Unique document name")
    description = models.TextField(blank=True, null=True)
    is_uploadable = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class RequirementRule(models.Model):
    """
    Rules Engine mapping Visa Type + Country Route to Documents.
    
    Logic:
    - If origin_country is NULL: Applies globally to all applicants for that destination.
    - If origin_country is SET: Applies ONLY to applicants from that origin.
    """
    
    class Country(models.TextChoices):
        UK = 'UK', 'United Kingdom'
        USA = 'USA', 'United States'
        CANADA = 'CANADA', 'Canada'
        AUSTRALIA = 'AUSTRALIA', 'Australia'
        PAKISTAN = 'PAKISTAN', 'Pakistan'
        INDIA = 'INDIA', 'India'
        GLOBAL = 'GLOBAL', 'Global'
        # Add more as needed
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    visa_type = models.ForeignKey(VisaType, on_delete=models.CASCADE, related_name='rules')
    
    destination_country = models.CharField(
        max_length=50, 
        choices=Country.choices,
        help_text="Where the student wants to go"
    )
    
    origin_country = models.CharField(
        max_length=50, 
        choices=Country.choices,
        null=True, 
        blank=True,
        help_text="Specific origin (e.g. Pakistan). Leave Empty for GLOBAL rule.",
    )
    
    required_documents = models.ManyToManyField(RequiredDocument, related_name='rules')
    
    is_mandatory = models.BooleanField(default=True)
    notes = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['destination_country', 'origin_country']
        verbose_name = "Visa Requirement Rule"

    def __str__(self):
        origin = self.origin_country if self.origin_country else "Global"
        return f"{self.destination_country} ({origin}) - {self.visa_type}"
