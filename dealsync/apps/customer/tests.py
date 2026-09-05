import pytest
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from apps.customer.models import Customer
from apps.customer.services import CustomerService

User = get_user_model()


class TestCustomerModel(TestCase):

    def test_create_customer(self):
        instance = Customer.objects.create(name="Test Customer", description="A test description")
        self.assertEqual(instance.name, "Test Customer")
        self.assertEqual(instance.description, "A test description")
        self.assertTrue(instance.is_active)
        self.assertIsNotNone(instance.created_at)
        self.assertIsNotNone(instance.updated_at)

    def test_customer_str(self):
        instance = Customer(name="My Customer")
        self.assertEqual(str(instance), "My Customer")

    def test_deactivate_customer(self):
        instance = Customer.objects.create(name="Active Customer")
        self.assertTrue(instance.is_active)
        instance.deactivate()
        self.assertFalse(instance.is_active)

    def test_activate_customer(self):
        instance = Customer.objects.create(name="Inactive Customer", is_active=False)
        self.assertFalse(instance.is_active)
        instance.activate()
        self.assertTrue(instance.is_active)

    def test_customer_default_ordering(self):
        Customer.objects.create(name="First")
        Customer.objects.create(name="Second")
        items = list(Customer.objects.all())
        # Default ordering is -created_at, so newest first
        self.assertGreaterEqual(items[0].created_at, items[1].created_at)


class TestCustomerService(TestCase):

    def test_create_customer(self):
        instance = CustomerService.create(name="Service Created", description="desc")
        self.assertIsInstance(instance, Customer)
        self.assertEqual(instance.name, "Service Created")
        self.assertTrue(instance.is_active)

    def test_update_customer(self):
        instance = Customer.objects.create(name="Original")
        updated = CustomerService.update(instance=instance, name="Updated Name")
        self.assertEqual(updated.name, "Updated Name")
        instance.refresh_from_db()
        self.assertEqual(instance.name, "Updated Name")

    def test_delete_customer(self):
        instance = Customer.objects.create(name="To Delete")
        pk = instance.pk
        CustomerService.delete(instance=instance)
        self.assertFalse(Customer.objects.filter(pk=pk).exists())

    def test_soft_delete_customer(self):
        instance = Customer.objects.create(name="To Soft Delete")
        CustomerService.soft_delete(instance=instance)
        instance.refresh_from_db()
        self.assertFalse(instance.is_active)


class TestCustomerViewSet(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser",
            password="testpass123",
            email="test@example.com",
        )
        self.client.force_authenticate(user=self.user)
        self.base_url = "/api/customer/{}s/".format("")

    def _url(self, pk=None):
        if pk:
            return f"/api/customer/customers/{pk}/"
        return "/api/customer/customers/"

    def test_list_customers(self):
        Customer.objects.create(name="Item 1")
        Customer.objects.create(name="Item 2")
        response = self.client.get(self._url())
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("results", response.data)

    def test_create_customer(self):
        data = {"name": "New Customer", "description": "A description"}
        response = self.client.post(self._url(), data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "New Customer")

    def test_retrieve_customer(self):
        instance = Customer.objects.create(name="Retrieve Me")
        response = self.client.get(self._url(pk=instance.pk))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Retrieve Me")

    def test_update_customer(self):
        instance = Customer.objects.create(name="Old Name")
        data = {"name": "New Name", "description": "Updated"}
        response = self.client.put(self._url(pk=instance.pk), data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "New Name")

    def test_partial_update_customer(self):
        instance = Customer.objects.create(name="Partial Name")
        data = {"description": "Only description updated"}
        response = self.client.patch(self._url(pk=instance.pk), data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["description"], "Only description updated")

    def test_delete_customer(self):
        instance = Customer.objects.create(name="Delete Me")
        response = self.client.delete(self._url(pk=instance.pk))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Customer.objects.filter(pk=instance.pk).exists())

    def test_unauthenticated_access(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self._url())
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_customer_missing_name(self):
        data = {"description": "No name"}
        response = self.client.post(self._url(), data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
