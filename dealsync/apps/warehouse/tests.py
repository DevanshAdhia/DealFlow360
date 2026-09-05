import pytest
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from apps.warehouse.models import Warehouse
from apps.warehouse.services import WarehouseService

User = get_user_model()


class TestWarehouseModel(TestCase):

    def test_create_warehouse(self):
        instance = Warehouse.objects.create(name="Test Warehouse", description="A test description")
        self.assertEqual(instance.name, "Test Warehouse")
        self.assertEqual(instance.description, "A test description")
        self.assertTrue(instance.is_active)
        self.assertIsNotNone(instance.created_at)
        self.assertIsNotNone(instance.updated_at)

    def test_warehouse_str(self):
        instance = Warehouse(name="My Warehouse")
        self.assertEqual(str(instance), "My Warehouse")

    def test_deactivate_warehouse(self):
        instance = Warehouse.objects.create(name="Active Warehouse")
        self.assertTrue(instance.is_active)
        instance.deactivate()
        self.assertFalse(instance.is_active)

    def test_activate_warehouse(self):
        instance = Warehouse.objects.create(name="Inactive Warehouse", is_active=False)
        self.assertFalse(instance.is_active)
        instance.activate()
        self.assertTrue(instance.is_active)

    def test_warehouse_default_ordering(self):
        Warehouse.objects.create(name="First")
        Warehouse.objects.create(name="Second")
        items = list(Warehouse.objects.all())
        # Default ordering is -created_at, so newest first
        self.assertGreaterEqual(items[0].created_at, items[1].created_at)


class TestWarehouseService(TestCase):

    def test_create_warehouse(self):
        instance = WarehouseService.create(name="Service Created", description="desc")
        self.assertIsInstance(instance, Warehouse)
        self.assertEqual(instance.name, "Service Created")
        self.assertTrue(instance.is_active)

    def test_update_warehouse(self):
        instance = Warehouse.objects.create(name="Original")
        updated = WarehouseService.update(instance=instance, name="Updated Name")
        self.assertEqual(updated.name, "Updated Name")
        instance.refresh_from_db()
        self.assertEqual(instance.name, "Updated Name")

    def test_delete_warehouse(self):
        instance = Warehouse.objects.create(name="To Delete")
        pk = instance.pk
        WarehouseService.delete(instance=instance)
        self.assertFalse(Warehouse.objects.filter(pk=pk).exists())

    def test_soft_delete_warehouse(self):
        instance = Warehouse.objects.create(name="To Soft Delete")
        WarehouseService.soft_delete(instance=instance)
        instance.refresh_from_db()
        self.assertFalse(instance.is_active)


class TestWarehouseViewSet(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser",
            password="testpass123",
            email="test@example.com",
        )
        self.client.force_authenticate(user=self.user)
        self.base_url = "/api/warehouse/{}s/".format("")

    def _url(self, pk=None):
        if pk:
            return f"/api/warehouse/warehouses/{pk}/"
        return "/api/warehouse/warehouses/"

    def test_list_warehouses(self):
        Warehouse.objects.create(name="Item 1")
        Warehouse.objects.create(name="Item 2")
        response = self.client.get(self._url())
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("results", response.data)

    def test_create_warehouse(self):
        data = {"name": "New Warehouse", "description": "A description"}
        response = self.client.post(self._url(), data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "New Warehouse")

    def test_retrieve_warehouse(self):
        instance = Warehouse.objects.create(name="Retrieve Me")
        response = self.client.get(self._url(pk=instance.pk))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Retrieve Me")

    def test_update_warehouse(self):
        instance = Warehouse.objects.create(name="Old Name")
        data = {"name": "New Name", "description": "Updated"}
        response = self.client.put(self._url(pk=instance.pk), data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "New Name")

    def test_partial_update_warehouse(self):
        instance = Warehouse.objects.create(name="Partial Name")
        data = {"description": "Only description updated"}
        response = self.client.patch(self._url(pk=instance.pk), data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["description"], "Only description updated")

    def test_delete_warehouse(self):
        instance = Warehouse.objects.create(name="Delete Me")
        response = self.client.delete(self._url(pk=instance.pk))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Warehouse.objects.filter(pk=instance.pk).exists())

    def test_unauthenticated_access(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self._url())
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_warehouse_missing_name(self):
        data = {"description": "No name"}
        response = self.client.post(self._url(), data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
