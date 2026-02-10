def _mask_chunk(value: str, show: int = 2) -> str:
    if not value:
        return value
    if len(value) <= show:
        return "*" * len(value)
    return value[:show] + "*" * (len(value) - show)


def mask_email(email: str, show: int = 2) -> str:
    if not email or "@" not in email:
        return _mask_chunk(email or "", show)
    local, domain = email.split("@", 1)
    masked_local = _mask_chunk(local, show)
    return f"{masked_local}@{domain}"


def mask_phone(phone: str, show: int = 2) -> str:
    if not phone:
        return phone
    digits = "".join(ch for ch in phone if ch.isdigit())
    if not digits:
        return _mask_chunk(phone, show)
    masked = _mask_chunk(digits, show)
    return masked


def mask_name(name: str, show: int = 1) -> str:
    if not name:
        return name
    parts = name.split()
    return " ".join(_mask_chunk(part, show) for part in parts)


def mask_text(text: str, show: int = 2) -> str:
    return _mask_chunk(text, show)


def mask_value(value, show: int = 2) -> str:
    if value is None:
        return value
    if not isinstance(value, str):
        value = str(value)
    if "@" in value:
        return mask_email(value, show=show)
    if value.replace(" ", "").replace("+", "").isdigit():
        return mask_phone(value, show=show)
    return mask_text(value, show=show)
