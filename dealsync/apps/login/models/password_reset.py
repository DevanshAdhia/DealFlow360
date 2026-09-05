import random
import hashlib
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta


class PasswordResetOTP(models.Model):
    """
    Stores a hashed 6-digit OTP for password reset.
    OTPs expire after 10 minutes and are invalidated after use.
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="password_reset_otps",
    )
    otp_hash = models.CharField(max_length=64)  # SHA-256 hex digest
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    OTP_EXPIRY_MINUTES = 10

    class Meta:
        app_label = "login"
        verbose_name = "Password Reset OTP"
        verbose_name_plural = "Password Reset OTPs"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"OTP for {self.user.email} (used={self.is_used})"

    @classmethod
    def generate_for_user(cls, user: User) -> str:
        """
        Invalidate all previous unused OTPs for this user,
        generate a new 6-digit OTP, store its hash, and return the plain OTP.
        """
        cls.objects.filter(user=user, is_used=False).update(is_used=True)

        otp = f"{random.SystemRandom().randint(0, 999999):06d}"
        otp_hash = hashlib.sha256(otp.encode()).hexdigest()
        cls.objects.create(
            user=user,
            otp_hash=otp_hash,
            expires_at=timezone.now() + timedelta(minutes=cls.OTP_EXPIRY_MINUTES),
        )
        return otp

    @classmethod
    def verify(cls, user: User, otp: str) -> bool:
        """
        Returns True if the OTP is valid, unused, and not expired.
        Does NOT mark it used — call mark_used() after verifying.
        """
        otp_hash = hashlib.sha256(otp.encode()).hexdigest()
        return cls.objects.filter(
            user=user,
            otp_hash=otp_hash,
            is_used=False,
            expires_at__gt=timezone.now(),
        ).exists()

    @classmethod
    def mark_used(cls, user: User, otp: str) -> None:
        """Mark the OTP as used so it cannot be replayed."""
        otp_hash = hashlib.sha256(otp.encode()).hexdigest()
        cls.objects.filter(user=user, otp_hash=otp_hash, is_used=False).update(is_used=True)
