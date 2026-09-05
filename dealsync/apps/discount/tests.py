import pytest
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from apps.discount.models import Discount
from apps.discount.services import DiscountService

User = get_user_model()


class TestDiscountModel(TestCase):

    def test_create_discount(self):
        instance = Discount.objects.create(name="Test Discount", description="A test description")
        self.assertEqual(instance.name, "Test Discount")
        self.assertEqual(instance.description, "A test description")
        self.assertTrue(instance.is_active)
        self.assertIsNotNone(instance.created_at)
        self.assertIsNotNone(instance.updated_at)

    def test_discount_str(self):
        instance = Discount(name="My Discount")
        self.assertEqual(str(instance), "My Discount")

    def test_deactivate_discount(self):
        instance = Discount.objects.create(name="Active Discount")
        self.assertTrue(instance.is_active)
        instance.deactivate()
        self.assertFalse(instance.is_active)

    def test_activate_discount(self):
        instance = Discount.objects.create(name="Inactive Discount", is_active=False)
        self.assertFalse(instance.is_active)
        instance.activate()
        self.assertTrue(instance.is_active)

    def test_discount_default_ordering(self):
        Discount.objects.create(name="First")
        Discount.objects.create(name="Second")
        items = list(Discount.objects.all())
        # Default ordering is -created_at, so newest first
        self.assertGreaterEqual(items[0].created_at, items[1].created_at)


class TestDiscountService(TestCase):

    def test_create_discount(self):
        instance = DiscountService.create(name="Service Created", description="desc")
        self.assertIsInstance(instance, Discount)
        self.assertEqual(instance.name, "Service Created")
        self.assertTrue(instance.is_active)

    def test_update_discount(self):
        instance = Discount.objects.create(name="Original")
        updated = DiscountService.update(instance=instance, name="Updated Name")
        self.assertEqual(updated.name, "Updated Name")
        instance.refresh_from_db()
        self.assertEqual(instance.name, "Updated Name")

    def test_delete_discount(self):
        instance = Discount.objects.create(name="To Delete")
        pk = instance.pk
        DiscountService.delete(instance=instance)
        self.assertFalse(Discount.objects.filter(pk=pk).exists())

    def test_soft_delete_discount(self):
        instance = Discount.objects.create(name="To Soft Delete")
        DiscountService.soft_delete(instance=instance)
        instance.refresh_from_db()
        self.assertFalse(instance.is_active)


class TestDiscountViewSet(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser",
            password="testpass123",
            email="test@example.com",
        )
        self.client.force_authenticate(user=self.user)
        self.base_url = "/api/discount/{}s/".format("")

    def _url(self, pk=None):
        if pk:
            return f"/api/discount/discounts/{pk}/"
        return "/api/discount/discounts/"

    def test_list_discounts(self):
        Discount.objects.create(name="Item 1")
        Discount.objects.create(name="Item 2")
        response = self.client.get(self._url())
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("results", response.data)

    def test_create_discount(self):
        data = {"name": "New Discount", "description": "A description"}
        response = self.client.post(self._url(), data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "New Discount")

    def test_retrieve_discount(self):
        instance = Discount.objects.create(name="Retrieve Me")
        response = self.client.get(self._url(pk=instance.pk))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Retrieve Me")

    def test_update_discount(self):
        instance = Discount.objects.create(name="Old Name")
        data = {"name": "New Name", "description": "Updated"}
        response = self.client.put(self._url(pk=instance.pk), data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "New Name")

    def test_partial_update_discount(self):
        instance = Discount.objects.create(name="Partial Name")
        data = {"description": "Only description updated"}
        response = self.client.patch(self._url(pk=instance.pk), data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["description"], "Only description updated")

    def test_delete_discount(self):
        instance = Discount.objects.create(name="Delete Me")
        response = self.client.delete(self._url(pk=instance.pk))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Discount.objects.filter(pk=instance.pk).exists())

    def test_unauthenticated_access(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self._url())
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_discount_missing_name(self):
        data = {"description": "No name"}
        response = self.client.post(self._url(), data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
