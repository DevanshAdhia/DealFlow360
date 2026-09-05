import hashlib
import secrets
import string
from typing import Any, Optional
from django.utils.text import slugify as django_slugify


def generate_token(length: int = 32) -> str:
    """Generate a cryptographically secure random token."""
    return secrets.token_urlsafe(length)


def generate_short_code(length: int = 8) -> str:
    """Generate a short random alphanumeric code."""
    alphabet = string.ascii_letters + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(length))


def slugify(value: str, allow_unicode: bool = False) -> str:
    """Convert value to a slug."""
    return django_slugify(value, allow_unicode=allow_unicode)


def hash_value(value: str, salt: str = "") -> str:
    """Return a SHA-256 hash of the given value."""
    combined = f"{value}{salt}".encode("utf-8")
    return hashlib.sha256(combined).hexdigest()


def chunk_list(lst: list, size: int) -> list:
    """Split a list into chunks of the given size."""
    return [lst[i : i + size] for i in range(0, len(lst), size)]


def flatten(nested: list) -> list:
    """Flatten a list of lists."""
    return [item for sublist in nested for item in sublist]


def safe_int(value: Any, default: int = 0) -> int:
    """Safely convert a value to int, returning default on failure."""
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def safe_float(value: Any, default: float = 0.0) -> float:
    """Safely convert a value to float, returning default on failure."""
    try:
        return float(value)
    except (TypeError, ValueError):
        return default
