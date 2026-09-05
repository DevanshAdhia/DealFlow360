/**
 * DealFlow360 - Sales Data Manifest
 * All operational sales and relational schema data aggregated inside src/sales.
 */

import quotations from './quotations.json';
import products from './products.json';
import categories from './categories.json';
import priceLists from './priceLists.json';
import priceListItems from './priceListItems.json';
import productVariants from './productVariants.json';
import customers from './customers.json';
import customerTiers from './customerTiers.json';
import invoices from './invoices.json';
import invoiceItems from './invoiceItems.json';
import subscriptions from './subscriptions.json';
import subscriptionItems from './subscriptionItems.json';
import fulfillmentOrders from './fulfillmentOrders.json';
import fulfillmentItems from './fulfillmentItems.json';
import inventory from './inventory.json';
import warehouses from './warehouses.json';
import approvals from './approvals.json';
import approvalRules from './approvalRules.json';
import approvalLevels from './approvalLevels.json';
import discountRules from './discountRules.json';
import users from './users.json';
import roles from './roles.json';
import payments from './payments.json';
import orders from './orders.json';
import orderItems from './orderItems.json';

export {
  quotations,
  products,
  categories,
  priceLists,
  priceListItems,
  productVariants,
  customers,
  customerTiers,
  invoices,
  invoiceItems,
  subscriptions,
  subscriptionItems,
  fulfillmentOrders,
  fulfillmentItems,
  inventory,
  warehouses,
  approvals,
  approvalRules,
  approvalLevels,
  discountRules,
  users,
  roles,
  payments,
  orders,
  orderItems
};

export const SALES_DATA_SNAPSHOT = {
  quotations,
  products,
  categories,
  priceLists,
  priceListItems,
  productVariants,
  customers,
  customerTiers,
  invoices,
  invoiceItems,
  subscriptions,
  subscriptionItems,
  fulfillmentOrders,
  fulfillmentItems,
  inventory,
  warehouses,
  approvals,
  approvalRules,
  approvalLevels,
  discountRules,
  users,
  roles,
  payments,
  orders,
  orderItems
};

export default SALES_DATA_SNAPSHOT;
