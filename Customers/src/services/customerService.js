import { storageService } from './storageService.js';

export const customerService = {
  getCustomerById: (id, customersList = null) => {
    const list = customersList || storageService.getCustomers();
    return list.find(c => String(c.id) === String(id)) || null;
  },

  updateCustomer: (id, updatedData, currentCustomers = null) => {
    const list = currentCustomers || storageService.getCustomers();
    const updated = list.map(c => {
      if (String(c.id) === String(id)) {
        // Protect non-editable fields
        return {
          ...c,
          contactName: updatedData.contactName !== undefined ? updatedData.contactName : c.contactName,
          phone: updatedData.phone !== undefined ? updatedData.phone : c.phone,
          email: updatedData.email !== undefined ? updatedData.email : c.email,
          billingAddress: updatedData.billingAddress !== undefined ? updatedData.billingAddress : c.billingAddress,
          shippingAddress: updatedData.shippingAddress !== undefined ? updatedData.shippingAddress : c.shippingAddress
        };
      }
      return c;
    });

    storageService.saveCustomers(updated);
    return updated;
  }
};
