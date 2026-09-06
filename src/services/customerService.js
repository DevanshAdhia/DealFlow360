const API_BASE_URL = 'http://localhost:8000/api';

const getHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const customerService = {
  fetchCustomers: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/customer/customers/?page_size=1000`, {
        headers: getHeaders(),
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.results || data || [];
    } catch (err) {
      console.warn('Error fetching customers from API:', err);
      return [];
    }
  },

  getCustomerById: (id, customersList = []) => {
    return customersList.find(c => String(c.id) === String(id)) || null;
  },

  updateCustomer: async (id, updatedData, currentCustomers = []) => {
    try {
      const res = await fetch(`${API_BASE_URL}/customer/customers/${id}/`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(updatedData),
      });
      if (res.ok) {
        const saved = await res.json();
        return currentCustomers.map(c => String(c.id) === String(id) ? { ...c, ...saved } : c);
      }
    } catch (err) {
      console.warn('Error updating customer profile API:', err);
    }
    return currentCustomers.map(c => {
      if (String(c.id) === String(id)) {
        return { ...c, ...updatedData };
      }
      return c;
    });
  }
};
