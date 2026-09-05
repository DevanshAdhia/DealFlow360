/**
 * DealFlow360 - Invoice Service
 * Resolves full relational context from invoice ID alone.
 * Provides related invoices retrieval.
 */

import { calculateInvoicePaidAmount, calculateInvoiceBalance, calculateInvoicePaymentStatus } from './invoiceCalculationService.js';
import { calculateBillingTimeline } from './billingService.js';

/**
 * Resolves invoice entity and all related relations from ID
 * @param {string} invoiceId 
 * @param {Object} datasets 
 * @returns {Object|null}
 */
export const resolveInvoiceDetails = (invoiceId, {
  invoices = [],
  invoiceItems = [],
  payments = [],
  customers = [],
  orders = [],
  orderItems = [],
  subscriptions = [],
  billingSchedules = [],
  fulfillmentOrders = [],
  fulfillmentItems = []
} = {}) => {
  if (!invoiceId) return null;

  const invoice = invoices.find(inv => inv.id === invoiceId || inv.invoiceNumber === invoiceId);
  if (!invoice) return null;

  const customer = customers.find(c => c.id === invoice.customerId) || {
    id: invoice.customerId,
    companyName: invoice.customerName || 'Acme Corporation',
    contactName: 'Customer Representative',
    email: 'billing@customer.com'
  };

  const order = orders.find(o => o.id === invoice.orderId) || null;
  const currentOrderItems = order ? orderItems.filter(oi => oi.orderId === order.id) : [];

  const subscription = subscriptions.find(s => s.id === invoice.subscriptionId) || null;
  const currentBillingSchedules = billingSchedules.filter(bs => bs.invoiceId === invoice.id || (subscription && bs.subscriptionId === subscription.id));

  let currentInvoiceItems = invoiceItems.filter(item => item.invoiceId === invoice.id);
  if (currentInvoiceItems.length === 0 && Array.isArray(invoice.items) && invoice.items.length > 0) {
    currentInvoiceItems = invoice.items;
  }

  const oneTimeItems = [];
  const recurringItems = [];

  currentInvoiceItems.forEach(item => {
    const isRecurring = item.billingType === 'RECURRING' || item.billingType === 'recurring' || item.category === 'Software' || item.category === 'Cloud';
    const totalPrice = item.lineTotal ?? item.totalPrice ?? ((item.unitPrice || 0) * (item.quantity || 1));
    const normalizedItem = {
      ...item,
      totalPrice,
      lineTotal: totalPrice
    };

    if (isRecurring) {
      recurringItems.push(normalizedItem);
    } else {
      oneTimeItems.push(normalizedItem);
    }
  });

  const currentPayments = payments.filter(p => p.invoiceId === invoice.id);

  const fulfillmentOrder = order ? fulfillmentOrders.find(fo => fo.orderId === order.id) : null;
  const currentFulfillmentItems = fulfillmentOrder ? fulfillmentItems.filter(fi => fi.fulfillmentOrderId === fulfillmentOrder.id) : [];

  // Financial calculations
  const totalAmount = invoice.totalAmount ?? invoice.total ?? 0;
  const paidAmount = calculateInvoicePaidAmount(currentPayments);
  const balanceAmount = calculateInvoiceBalance(totalAmount, paidAmount);
  const calculatedStatus = calculateInvoicePaymentStatus(totalAmount, paidAmount, invoice.dueDate, invoice.paymentStatus);
  const isFullyPaid = balanceAmount <= 0 && totalAmount > 0 && paidAmount >= totalAmount;

  const relatedInvoices = getRelatedInvoices(invoice, invoices);

  // Reconciliation summary
  const hasBackorder = oneTimeItems.some(it => (it.fulfilledQuantity ?? it.quantity ?? 1) < (it.orderedQuantity ?? it.quantity ?? 1));

  return {
    invoice: {
      ...invoice,
      totalAmount,
      paymentStatus: calculatedStatus,
      paidAmount,
      balanceAmount
    },
    customer,
    order,
    orderItems: currentOrderItems,
    subscription,
    billingSchedules: currentBillingSchedules,
    billingSchedule: currentBillingSchedules[0] || null,
    invoiceItems: currentInvoiceItems,
    items: currentInvoiceItems,
    oneTimeItems,
    recurringItems,
    payments: currentPayments,
    fulfillmentOrder,
    fulfillmentItems: currentFulfillmentItems,
    reconciliationSummary: { hasBackorder },
    timelineStages: calculateBillingTimeline(invoice, fulfillmentOrder, currentPayments),
    totalAmount,
    paidAmount,
    balanceAmount,
    isFullyPaid,
    relatedInvoices: relatedInvoices || []
  };
};

/**
 * Finds related invoices belonging to the same customer, order, or subscription
 * @param {Object} currentInvoice 
 * @param {Array} allInvoices 
 * @returns {Array} Sibling invoices (excluding current)
 */
export const getRelatedInvoices = (currentInvoice, allInvoices = []) => {
  if (!currentInvoice) return [];

  return allInvoices.filter(inv => {
    if (inv.id === currentInvoice.id) return false;
    const sameCustomer = inv.customerId && inv.customerId === currentInvoice.customerId;
    const sameOrder = inv.orderId && inv.orderId === currentInvoice.orderId;
    const sameSub = inv.subscriptionId && inv.subscriptionId === currentInvoice.subscriptionId;
    return sameCustomer || sameOrder || sameSub;
  });
};
