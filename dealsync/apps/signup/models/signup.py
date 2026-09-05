from django.db import models
from django.contrib.auth.models import User


class SignupAudit(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="signup_audits",
    )
    username = models.CharField(max_length=150, db_index=True)
    email = models.EmailField()
    role = models.CharField(max_length=50, db_index=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = "signup"
        verbose_name = "Signup Audit Record"
        verbose_name_plural = "Signup Audit Records"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Signup: {self.username} [{self.role}] ({self.created_at.strftime('%Y-%m-%d')})"

    @property
    def name(self) -> str:
        return f"{self.username} ({self.role})"

    @property
    def description(self) -> str:
        return f"Email: {self.email}, Role: {self.role}"

    def deactivate(self) -> None:
        self.is_active = False
        self.save(update_fields=["is_active", "updated_at"])

    def activate(self) -> None:
        self.is_active = True
        self.save(update_fields=["is_active", "updated_at"])


# Backward compatibility alias
Signup = SignupAudit
