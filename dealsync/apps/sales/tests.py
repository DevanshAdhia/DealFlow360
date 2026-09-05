from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth.models import User
from apps.signup.models import UserProfile, UserRole

class BackendAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="testadmin", email="admin@test.com", password="password123")
        UserProfile.objects.create(user=self.user, role=UserRole.ADMIN)

    def test_signup_users_list_api(self):
        response = self.client.get("/api/signup/users/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) >= 1)

    def test_signup_user_creation_validation_duplicate_email(self):
        # Trying to register duplicate email must return 400 Bad Request
        payload = {
            "name": "Duplicate User",
            "email": "admin@test.com",
            "role": "Sales Representative",
        }
        response = self.client.post("/api/signup/users/", data=payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    def test_executive_dashboard_api(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/sales/quotations/dashboard/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("total_revenue", response.data)
        self.assertIn("pipeline_value", response.data)
