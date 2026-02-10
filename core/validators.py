"""
Custom Model Validators for Data Quality.
Centralizes validation logic for the CRM.
"""
import re
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator


# Phone Number Validator (International Format)
phone_validator = RegexValidator(
    regex=r'^\+?[0-9]{10,15}$',
    message='Phone number must be 10-15 digits and may start with +'
)


# Pakistani CNIC Validator
cnic_validator = RegexValidator(
    regex=r'^\d{5}-\d{7}-\d{1}$',
    message='CNIC must be in format: 12345-1234567-1'
)


# Student Code Validator (BRANCH-YEAR-SEQUENCE)
student_code_validator = RegexValidator(
    regex=r'^[A-Z]{2,4}-\d{4}-\d{5}$',
    message='Student code must be in format: XXX-YYYY-00000'
)


def validate_email_not_disposable(email: str):
    """Reject disposable/temporary email addresses."""
    disposable_domains = [
        'tempmail.com', 'guerrillamail.com', '10minutemail.com',
        'throwaway.email', 'mailinator.com', 'yopmail.com',
        'temp-mail.org', 'fakeinbox.com', 'sharklasers.com',
    ]
    domain = email.split('@')[-1].lower()
    if domain in disposable_domains:
        raise ValidationError(f"Disposable email addresses are not allowed: {domain}")


def validate_percentage(value):
    """Validate percentage is between 0 and 100."""
    if value is not None and (value < 0 or value > 100):
        raise ValidationError('Percentage must be between 0 and 100')


def validate_ielts_score(value):
    """Validate IELTS score is between 0 and 9."""
    if value is not None and (value < 0 or value > 9):
        raise ValidationError('IELTS score must be between 0 and 9')


def validate_gap_years(value):
    """Validate study gap is reasonable (0-15 years)."""
    if value is not None and (value < 0 or value > 15):
        raise ValidationError('Gap years must be between 0 and 15')


def validate_positive_amount(value):
    """Validate amount is positive."""
    if value is not None and value < 0:
        raise ValidationError('Amount must be positive')


def validate_future_date(value):
    """Validate date is in the future."""
    from django.utils import timezone
    if value and value < timezone.now().date():
        raise ValidationError('Date must be in the future')


def validate_past_date(value):
    """Validate date is in the past."""
    from django.utils import timezone
    if value and value > timezone.now().date():
        raise ValidationError('Date must be in the past')


class PasswordComplexityValidator:
    """
    Validate password has sufficient complexity.
    """
    def __init__(self, min_upper=1, min_lower=1, min_digits=1, min_special=1):
        self.min_upper = min_upper
        self.min_lower = min_lower
        self.min_digits = min_digits
        self.min_special = min_special

    def validate(self, password, user=None):
        errors = []
        if sum(1 for c in password if c.isupper()) < self.min_upper:
            errors.append(f'Password must contain at least {self.min_upper} uppercase letter(s).')
        if sum(1 for c in password if c.islower()) < self.min_lower:
            errors.append(f'Password must contain at least {self.min_lower} lowercase letter(s).')
        if sum(1 for c in password if c.isdigit()) < self.min_digits:
            errors.append(f'Password must contain at least {self.min_digits} digit(s).')
        special_chars = set('!@#$%^&*()_+-=[]{}|;:,.<>?')
        if sum(1 for c in password if c in special_chars) < self.min_special:
            errors.append(f'Password must contain at least {self.min_special} special character(s).')
        
        if errors:
            raise ValidationError(errors)

    def get_help_text(self):
        return (
            f'Password must contain at least {self.min_upper} uppercase, '
            f'{self.min_lower} lowercase, {self.min_digits} digit(s), '
            f'and {self.min_special} special character(s).'
        )
