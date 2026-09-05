from django.db import models
from django.contrib.auth.models import User


class UserRole(models.TextChoices):
    SALES_REP = "SALES_REP", "Sales Representative"
    SALES_MANAGER = "SALES_MANAGER", "Sales Manager / Approver"
    FINANCE = "FINANCE", "Finance / Operations"
    ADMIN = "ADMIN", "Admin"
    CUSTOMER = "CUSTOMER", "Customer"


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    role = models.CharField(
        max_length=50,
        choices=UserRole.choices,
        default=UserRole.CUSTOMER,
        db_index=True,
    )
    phone = models.CharField(max_length=30, blank=True, default="")
    company = models.CharField(max_length=128, blank=True, default="")
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = "signup"
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.user.username} ({self.get_role_display()})"
