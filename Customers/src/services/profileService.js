import { customerService } from './customerService.js';

export const profileService = {
  getCustomerProfile: (customerId, customersList = null) => {
    return customerService.getCustomerById(customerId, customersList);
  },

  updateCustomerProfile: (customerId, data, currentCustomers = null) => {
    return customerService.updateCustomer(customerId, data, currentCustomers);
  }
};
