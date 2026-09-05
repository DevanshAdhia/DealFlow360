import logging
from typing import Any, Dict
from django.db import transaction
from django.db.models import Q
from django.contrib.auth.models import User
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken

from apps.login.models import UserLoginHistory
from apps.signup.models import UserProfile, UserRole

logger = logging.getLogger(__name__)


class LoginService:

    @staticmethod
    def authenticate_user(username_or_email: str, password: str, ip_address: str = None, user_agent: str = "") -> Dict[str, Any]:
        """
        Authenticates a user via username or email, records a UserLoginHistory audit record,
        and generates JWT access and refresh tokens.
        """
        user = User.objects.filter(
            Q(username__iexact=username_or_email) | Q(email__iexact=username_or_email)
        ).first()

        if not user or not user.check_password(password):
            UserLoginHistory.objects.create(
                user=user,
                username_attempted=username_or_email,
                status=UserLoginHistory.LoginStatus.FAILED,
                ip_address=ip_address,
                user_agent=user_agent,
            )
            raise AuthenticationFailed("Invalid username/email or password.")

        if not user.is_active:
            UserLoginHistory.objects.create(
                user=user,
                username_attempted=username_or_email,
                status=UserLoginHistory.LoginStatus.FAILED,
                ip_address=ip_address,
                user_agent=user_agent,
            )
            raise AuthenticationFailed("User account is disabled.")

        # Ensure user profile exists
        if not hasattr(user, "profile"):
            default_role = UserRole.ADMIN if user.is_superuser else UserRole.CUSTOMER
            UserProfile.objects.create(user=user, role=default_role)

        # Log successful login session
        UserLoginHistory.objects.create(
            user=user,
            username_attempted=user.username,
            role=user.profile.role,
            status=UserLoginHistory.LoginStatus.SUCCESS,
            ip_address=ip_address,
            user_agent=user_agent,
        )

        refresh = RefreshToken.for_user(user)

        logger.info("User authenticated successfully: username=%s role=%s", user.username, user.profile.role)
        return {
            "user": user,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }

    @staticmethod
    def refresh_access_token(refresh_token_str: str) -> Dict[str, str]:
        """Generates a new access token using a valid refresh token."""
        try:
            refresh = RefreshToken(refresh_token_str)
            return {"access": str(refresh.access_token)}
        except Exception as e:
            raise AuthenticationFailed(f"Invalid refresh token: {str(e)}")

    @staticmethod
    def logout_user(refresh_token_str: str) -> None:
        """Blacklists the refresh token upon logout."""
        try:
            token = RefreshToken(refresh_token_str)
            token.blacklist()
            logger.info("User logged out successfully.")
        except Exception as e:
            logger.warning("Logout token blacklist warning: %s", str(e))

    @staticmethod
    @transaction.atomic
    def create(name: str, description: str = "") -> UserLoginHistory:
        """Create a new login history instance."""
        instance = UserLoginHistory.objects.create(
            username_attempted=name,
            role="CUSTOMER",
            status=UserLoginHistory.LoginStatus.SUCCESS,
        )
        logger.info("Login history created: id=%s name=%s", instance.pk, instance.username_attempted)
        return instance

    @staticmethod
    @transaction.atomic
    def update(instance: UserLoginHistory, **kwargs: Any) -> UserLoginHistory:
        """Update an existing login history instance."""
        for field, value in kwargs.items():
            if hasattr(instance, field):
                setattr(instance, field, value)
        instance.save()
        logger.info("Login history updated: id=%s", instance.pk)
        return instance

    @staticmethod
    @transaction.atomic
    def delete(instance: UserLoginHistory) -> None:
        """Hard-delete a login history instance."""
        pk = instance.pk
        instance.delete()
        logger.info("Login history deleted: id=%s", pk)

    @staticmethod
    @transaction.atomic
    def soft_delete(instance: UserLoginHistory) -> UserLoginHistory:
        """Soft-delete by deactivating."""
        instance.deactivate()
        logger.info("Login history deactivated: id=%s", instance.pk)
        return instance
