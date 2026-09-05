import { dataService } from './src/services/dataService.js';

try {
  const qs = dataService.getInitialQuotations();
  console.log("Quotations length:", qs.length);
  
  const customers = dataService.getCustomers();
  console.log("Customers length:", customers.length);
} catch (e) {
  console.error("Error!", e);
}
