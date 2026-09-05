from django.db import models
from django.contrib.auth.models import User


class Role(models.Model):
    ADMIN = "ADMIN"
    SALES_REP = "SALES_REP"
    SALES_MANAGER = "SALES_MANAGER"
    FINANCE = "FINANCE"
    CUSTOMER_PORTAL_USER = "CUSTOMER_PORTAL_USER"

    ROLE_CHOICES = (
        (ADMIN, "Admin"),
        (SALES_REP, "Sales Representative"),
        (SALES_MANAGER, "Sales Manager"),
        (FINANCE, "Finance"),
        (CUSTOMER_PORTAL_USER, "Customer Portal User"),
    )

    name = models.CharField(max_length=50, choices=ROLE_CHOICES, unique=True)
    description = models.TextField(blank=True, default="")

    class Meta:
        db_table = "roles"

    def __str__(self) -> str:
        return self.name


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="login_profile")
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True, related_name="user_profiles")
    customer = models.ForeignKey(
        "customer.Customer",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="user_profiles"
    )

    class Meta:
        db_table = "user_profiles"

    def __str__(self) -> str:
        role_name = self.role.name if self.role else "No Role"
        return f"{self.user.username} ({role_name})"


class UserLoginHistory(models.Model):
    class LoginStatus(models.TextChoices):
        SUCCESS = "SUCCESS", "Success"
        FAILED = "FAILED", "Failed"

    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="login_history",
    )
    username_attempted = models.CharField(max_length=150, db_index=True)
    role = models.CharField(max_length=50, blank=True, default="")
    status = models.CharField(
        max_length=20,
        choices=LoginStatus.choices,
        default=LoginStatus.SUCCESS,
        db_index=True,
    )
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, default="")
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = "login"
        verbose_name = "User Login History"
        verbose_name_plural = "User Login History"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.username_attempted} - {self.status} ({self.created_at.strftime('%Y-%m-%d %H:%M')})"

    @property
    def name(self) -> str:
        return f"{self.username_attempted} ({self.status})"

    @property
    def description(self) -> str:
        return f"Role: {self.role or 'N/A'}, IP: {self.ip_address or 'Unknown'}"

    def deactivate(self) -> None:
        self.is_active = False
        self.save(update_fields=["is_active", "updated_at"])

    def activate(self) -> None:
        self.is_active = True
        self.save(update_fields=["is_active", "updated_at"])


# Backward compatibility alias
Login = UserLoginHistory
