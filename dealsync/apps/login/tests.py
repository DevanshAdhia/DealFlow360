import pytest
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from apps.login.models import Login
from apps.login.services import LoginService

User = get_user_model()


class TestLoginModel(TestCase):

    def test_create_login(self):
        instance = Login.objects.create(name="Test Login", description="A test description")
        self.assertEqual(instance.name, "Test Login")
        self.assertEqual(instance.description, "A test description")
        self.assertTrue(instance.is_active)
        self.assertIsNotNone(instance.created_at)
        self.assertIsNotNone(instance.updated_at)

    def test_login_str(self):
        instance = Login(name="My Login")
        self.assertEqual(str(instance), "My Login")

    def test_deactivate_login(self):
        instance = Login.objects.create(name="Active Login")
        self.assertTrue(instance.is_active)
        instance.deactivate()
        self.assertFalse(instance.is_active)

    def test_activate_login(self):
        instance = Login.objects.create(name="Inactive Login", is_active=False)
        self.assertFalse(instance.is_active)
        instance.activate()
        self.assertTrue(instance.is_active)

    def test_login_default_ordering(self):
        Login.objects.create(name="First")
        Login.objects.create(name="Second")
        items = list(Login.objects.all())
        # Default ordering is -created_at, so newest first
        self.assertGreaterEqual(items[0].created_at, items[1].created_at)


class TestLoginService(TestCase):

    def test_create_login(self):
        instance = LoginService.create(name="Service Created", description="desc")
        self.assertIsInstance(instance, Login)
        self.assertEqual(instance.name, "Service Created")
        self.assertTrue(instance.is_active)

    def test_update_login(self):
        instance = Login.objects.create(name="Original")
        updated = LoginService.update(instance=instance, name="Updated Name")
        self.assertEqual(updated.name, "Updated Name")
        instance.refresh_from_db()
        self.assertEqual(instance.name, "Updated Name")

    def test_delete_login(self):
        instance = Login.objects.create(name="To Delete")
        pk = instance.pk
        LoginService.delete(instance=instance)
        self.assertFalse(Login.objects.filter(pk=pk).exists())

    def test_soft_delete_login(self):
        instance = Login.objects.create(name="To Soft Delete")
        LoginService.soft_delete(instance=instance)
        instance.refresh_from_db()
        self.assertFalse(instance.is_active)


class TestLoginViewSet(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser",
            password="testpass123",
            email="test@example.com",
        )
        self.client.force_authenticate(user=self.user)
        self.base_url = "/api/login/{}s/".format("")

    def _url(self, pk=None):
        if pk:
            return f"/api/login/logins/{pk}/"
        return "/api/login/logins/"

    def test_list_logins(self):
        Login.objects.create(name="Item 1")
        Login.objects.create(name="Item 2")
        response = self.client.get(self._url())
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("results", response.data)

    def test_create_login(self):
        data = {"name": "New Login", "description": "A description"}
        response = self.client.post(self._url(), data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "New Login")

    def test_retrieve_login(self):
        instance = Login.objects.create(name="Retrieve Me")
        response = self.client.get(self._url(pk=instance.pk))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Retrieve Me")

    def test_update_login(self):
        instance = Login.objects.create(name="Old Name")
        data = {"name": "New Name", "description": "Updated"}
        response = self.client.put(self._url(pk=instance.pk), data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "New Name")

    def test_partial_update_login(self):
        instance = Login.objects.create(name="Partial Name")
        data = {"description": "Only description updated"}
        response = self.client.patch(self._url(pk=instance.pk), data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["description"], "Only description updated")

    def test_delete_login(self):
        instance = Login.objects.create(name="Delete Me")
        response = self.client.delete(self._url(pk=instance.pk))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Login.objects.filter(pk=instance.pk).exists())

    def test_unauthenticated_access(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self._url())
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_login_missing_name(self):
        data = {"description": "No name"}
        response = self.client.post(self._url(), data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
