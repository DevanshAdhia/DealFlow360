import pytest
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from apps.signup.models import Signup
from apps.signup.services import SignupService

User = get_user_model()


class TestSignupModel(TestCase):

    def test_create_signup(self):
        instance = Signup.objects.create(name="Test Signup", description="A test description")
        self.assertEqual(instance.name, "Test Signup")
        self.assertEqual(instance.description, "A test description")
        self.assertTrue(instance.is_active)
        self.assertIsNotNone(instance.created_at)
        self.assertIsNotNone(instance.updated_at)

    def test_signup_str(self):
        instance = Signup(name="My Signup")
        self.assertEqual(str(instance), "My Signup")

    def test_deactivate_signup(self):
        instance = Signup.objects.create(name="Active Signup")
        self.assertTrue(instance.is_active)
        instance.deactivate()
        self.assertFalse(instance.is_active)

    def test_activate_signup(self):
        instance = Signup.objects.create(name="Inactive Signup", is_active=False)
        self.assertFalse(instance.is_active)
        instance.activate()
        self.assertTrue(instance.is_active)

    def test_signup_default_ordering(self):
        Signup.objects.create(name="First")
        Signup.objects.create(name="Second")
        items = list(Signup.objects.all())
        # Default ordering is -created_at, so newest first
        self.assertGreaterEqual(items[0].created_at, items[1].created_at)


class TestSignupService(TestCase):

    def test_create_signup(self):
        instance = SignupService.create(name="Service Created", description="desc")
        self.assertIsInstance(instance, Signup)
        self.assertEqual(instance.name, "Service Created")
        self.assertTrue(instance.is_active)

    def test_update_signup(self):
        instance = Signup.objects.create(name="Original")
        updated = SignupService.update(instance=instance, name="Updated Name")
        self.assertEqual(updated.name, "Updated Name")
        instance.refresh_from_db()
        self.assertEqual(instance.name, "Updated Name")

    def test_delete_signup(self):
        instance = Signup.objects.create(name="To Delete")
        pk = instance.pk
        SignupService.delete(instance=instance)
        self.assertFalse(Signup.objects.filter(pk=pk).exists())

    def test_soft_delete_signup(self):
        instance = Signup.objects.create(name="To Soft Delete")
        SignupService.soft_delete(instance=instance)
        instance.refresh_from_db()
        self.assertFalse(instance.is_active)


class TestSignupViewSet(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser",
            password="testpass123",
            email="test@example.com",
        )
        self.client.force_authenticate(user=self.user)
        self.base_url = "/api/signup/{}s/".format("")

    def _url(self, pk=None):
        if pk:
            return f"/api/signup/signups/{pk}/"
        return "/api/signup/signups/"

    def test_list_signups(self):
        Signup.objects.create(name="Item 1")
        Signup.objects.create(name="Item 2")
        response = self.client.get(self._url())
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("results", response.data)

    def test_create_signup(self):
        data = {"name": "New Signup", "description": "A description"}
        response = self.client.post(self._url(), data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "New Signup")

    def test_retrieve_signup(self):
        instance = Signup.objects.create(name="Retrieve Me")
        response = self.client.get(self._url(pk=instance.pk))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Retrieve Me")

    def test_update_signup(self):
        instance = Signup.objects.create(name="Old Name")
        data = {"name": "New Name", "description": "Updated"}
        response = self.client.put(self._url(pk=instance.pk), data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "New Name")

    def test_partial_update_signup(self):
        instance = Signup.objects.create(name="Partial Name")
        data = {"description": "Only description updated"}
        response = self.client.patch(self._url(pk=instance.pk), data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["description"], "Only description updated")

    def test_delete_signup(self):
        instance = Signup.objects.create(name="Delete Me")
        response = self.client.delete(self._url(pk=instance.pk))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Signup.objects.filter(pk=instance.pk).exists())

    def test_unauthenticated_access(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self._url())
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_signup_missing_name(self):
        data = {"description": "No name"}
        response = self.client.post(self._url(), data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
