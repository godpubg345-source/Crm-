import re

from django.core.exceptions import ValidationError


class PasswordComplexityValidator:
    """
    Enforce password complexity:
    - at least 1 lowercase
    - at least 1 uppercase
    - at least 1 digit
    - at least 1 special character
    """

    def validate(self, password, user=None):
        errors = []

        if not re.search(r"[a-z]", password or ""):
            errors.append("must contain at least one lowercase letter.")
        if not re.search(r"[A-Z]", password or ""):
            errors.append("must contain at least one uppercase letter.")
        if not re.search(r"[0-9]", password or ""):
            errors.append("must contain at least one number.")
        if not re.search(r"[^A-Za-z0-9]", password or ""):
            errors.append("must contain at least one special character.")

        if errors:
            raise ValidationError("Password " + " ".join(errors))

    def get_help_text(self):
        return "Password must include uppercase, lowercase, number, and special character."
