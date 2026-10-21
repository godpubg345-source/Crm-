import base64
import hashlib
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.db import models

try:
    from cryptography.fernet import Fernet, InvalidToken
except Exception:  # pragma: no cover - handled at runtime
    Fernet = None
    InvalidToken = Exception


ENC_PREFIX = "enc::"


def _derive_key(raw: str) -> bytes:
    if raw is None:
        raw = ""
    if not isinstance(raw, str):
        raw = str(raw)
    digest = hashlib.sha256(raw.encode("utf-8")).digest()
    return base64.urlsafe_b64encode(digest)


def _get_fernet() -> "Fernet":
    if Fernet is None:
        raise ImproperlyConfigured(
            "cryptography is required for EncryptedTextField. Install 'cryptography'."
        )
    raw_key = getattr(settings, "FIELD_ENCRYPTION_KEY", "") or settings.SECRET_KEY
    key = _derive_key(raw_key)
    return Fernet(key)


class EncryptedTextField(models.TextField):
    """
    Stores text encrypted at rest using Fernet.

    Values are stored as: enc::<token>
    """

    def get_prep_value(self, value):
        if value is None:
            return value
        if value == "":
            return value
        if isinstance(value, str) and value.startswith(ENC_PREFIX):
            return value
        token = _get_fernet().encrypt(str(value).encode("utf-8")).decode("utf-8")
        return f"{ENC_PREFIX}{token}"

    def from_db_value(self, value, expression, connection):
        if value is None:
            return value
        return self._decrypt(value)

    def to_python(self, value):
        if value is None:
            return value
        if isinstance(value, str) and not value.startswith(ENC_PREFIX):
            return value
        return self._decrypt(value)

    def _decrypt(self, value):
        if not isinstance(value, str):
            return value
        if not value.startswith(ENC_PREFIX):
            return value
        token = value[len(ENC_PREFIX):].encode("utf-8")
        try:
            return _get_fernet().decrypt(token).decode("utf-8")
        except InvalidToken:
            return value
