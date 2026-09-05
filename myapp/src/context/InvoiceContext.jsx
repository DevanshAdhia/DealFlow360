import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

// Seed master JSON datasets
const INVOICES_DATA = [];
const INVOICE_ITEMS_DATA = [];
const PAYMENTS_DATA = [];
const CUSTOMERS_DATA = [];
const ORDERS_DATA = [];
const ORDER_ITEMS_DATA = [];
const SUBSCRIPTIONS_DATA = [];
const SUBSCRIPTION_ITEMS_DATA = [];
const BILLING_SCHEDULES_DATA = [];
const FULFILLMENT_ORDERS_DATA = [];
const FULFILLMENT_ITEMS_DATA = [];

import {
  calculateInvoicePaidAmount,
  calculateInvoiceBalance,
  calculateInvoicePaymentStatus
} from '../services/invoiceCalculationService.js';
import { validatePayment, createPaymentRecord } from '../services/paymentService.js';
import { resolveInvoiceDetails, getRelatedInvoices } from '../services/invoiceService.js';
import { createAuditEvent } from '../services/auditService.js';

const InvoiceContext = createContext();

const getOrSeed = (key, seedData) => {
  const lsKey = `dealflow_${key}`;
  const existing = localStorage.getItem(lsKey);
  if (existing) {
    try { return JSON.parse(existing); } catch(e) {}
  }
  localStorage.setItem(lsKey, JSON.stringify(seedData));
  return JSON.parse(JSON.stringify(seedData));
};

export const InvoiceProvider = ({ children }) => {
  // Pure React state synced to localStorage
  const [invoices, setInvoices] = useState(() => getOrSeed('invoices_state', INVOICES_DATA));
  const [invoiceItems, setInvoiceItems] = useState(() => getOrSeed('invoiceItems_state', INVOICE_ITEMS_DATA));
  const [payments, setPayments] = useState(() => getOrSeed('payments_state', PAYMENTS_DATA));
  const [billingSchedules, setBillingSchedules] = useState(() => getOrSeed('billingSchedules_state', BILLING_SCHEDULES_DATA));
  const [subscriptionItems, setSubscriptionItems] = useState(() => getOrSeed('subscriptionItems_state', SUBSCRIPTION_ITEMS_DATA));
  const [auditLogs, setAuditLogs] = useState(() => getOrSeed('invoiceAuditLogs_state', []));

  React.useEffect(() => { localStorage.setItem('dealflow_invoices_state', JSON.stringify(invoices)); }, [invoices]);
  React.useEffect(() => { localStorage.setItem('dealflow_invoiceItems_state', JSON.stringify(invoiceItems)); }, [invoiceItems]);
  React.useEffect(() => { localStorage.setItem('dealflow_payments_state', JSON.stringify(payments)); }, [payments]);
  React.useEffect(() => { localStorage.setItem('dealflow_billingSchedules_state', JSON.stringify(billingSchedules)); }, [billingSchedules]);
  React.useEffect(() => { localStorage.setItem('dealflow_subscriptionItems_state', JSON.stringify(subscriptionItems)); }, [subscriptionItems]);
  React.useEffect(() => { localStorage.setItem('dealflow_invoiceAuditLogs_state', JSON.stringify(auditLogs)); }, [auditLogs]);

  // Compute live invoices with updated paid amount, balance, and payment status
  const liveInvoices = useMemo(() => {
    return invoices.map(inv => {
      const invPayments = payments.filter(p => p.invoiceId === inv.id);
      const paidAmount = calculateInvoicePaidAmount(invPayments);
      const balanceAmount = calculateInvoiceBalance(inv.total, paidAmount);
      const status = calculateInvoicePaymentStatus(inv.total, paidAmount, inv.dueDate, inv.paymentStatus);
      const stage = (status === 'PAID' && inv.billingStage !== 'PAID') ? 'PAID' : inv.billingStage;

      return {
        ...inv,
        paidAmount,
        balanceAmount,
        paymentStatus: status,
        billingStage: stage
      };
    });
  }, [invoices, payments]);

  /**
   * Resolve full details for a single invoice
   */
  const getInvoiceDetails = useCallback((invoiceId) => {
    return resolveInvoiceDetails(invoiceId, {
      invoices: liveInvoices,
      invoiceItems,
      payments,
      customers: CUSTOMERS_DATA,
      orders: ORDERS_DATA,
      orderItems: ORDER_ITEMS_DATA,
      subscriptions: SUBSCRIPTIONS_DATA,
      billingSchedules,
      fulfillmentOrders: FULFILLMENT_ORDERS_DATA,
      fulfillmentItems: FULFILLMENT_ITEMS_DATA
    });
  }, [liveInvoices, invoiceItems, payments, billingSchedules]);

  /**
   * Record a payment against an invoice
   * Enforces strict validation and overpayment prevention
   */
  const recordPayment = useCallback((invoiceId, paymentData, actor = 'Finance Specialist') => {
    const targetInv = liveInvoices.find(i => i.id === invoiceId);
    if (!targetInv) {
      throw new Error(`Invoice ${invoiceId} not found.`);
    }

    const { valid, error } = validatePayment(paymentData.amount, targetInv.balanceAmount);
    if (!valid) {
      throw new Error(error);
    }

    // 1. Create runtime payment record
    const newPayment = createPaymentRecord({
      invoiceId,
      amount: paymentData.amount,
      paymentMethod: paymentData.paymentMethod,
      transactionReference: paymentData.transactionReference,
      paymentDate: paymentData.paymentDate,
      notes: paymentData.notes
    });

    const updatedPayments = [newPayment, ...payments];
    setPayments(updatedPayments);

    // 2. Recalculate amounts
    const invPayments = updatedPayments.filter(p => p.invoiceId === invoiceId);
    const newPaidAmount = calculateInvoicePaidAmount(invPayments);
    const newBalance = calculateInvoiceBalance(targetInv.total, newPaidAmount);
    const newStatus = calculateInvoicePaymentStatus(targetInv.total, newPaidAmount, targetInv.dueDate, targetInv.paymentStatus);
    const newStage = (newStatus === 'PAID') ? 'PAID' : targetInv.billingStage;

    // 3. Update invoice runtime state
    setInvoices(prev => prev.map(inv => {
      if (inv.id === invoiceId) {
        return {
          ...inv,
          paidAmount: newPaidAmount,
          balanceAmount: newBalance,
          paymentStatus: newStatus,
          billingStage: newStage
        };
      }
      return inv;
    }));

    // 4. Record audit event
    const auditEvent = createAuditEvent(
      'Invoice',
      invoiceId,
      'RECORD_PAYMENT',
      `Payment of ₹${Number(paymentData.amount).toLocaleString('en-IN')} recorded via ${paymentData.paymentMethod}. Balance: ₹${newBalance.toLocaleString('en-IN')}. Status: ${newStatus}.`,
      actor
    );
    setAuditLogs(prev => [auditEvent, ...prev]);

    return {
      payment: newPayment,
      paidAmount: newPaidAmount,
      balanceAmount: newBalance,
      paymentStatus: newStatus,
      billingStage: newStage
    };
  }, [liveInvoices, payments]);

  /**
   * Create a new unified invoice entity
   */
  const createInvoice = useCallback((invoiceData, itemsData = []) => {
    const newId = invoiceData.id || `INV-${Math.floor(1000 + Math.random() * 9000)}`;
    const newInvoice = {
      id: newId,
      invoiceNumber: newId,
      customerId: invoiceData.customerId,
      orderId: invoiceData.orderId || null,
      subscriptionId: invoiceData.subscriptionId || null,
      invoiceType: invoiceData.invoiceType || 'ONE_TIME', // ONE_TIME | RECURRING | MIXED
      paymentStatus: 'UNPAID',
      billingStage: 'INVOICED',
      issueDate: invoiceData.issueDate || new Date().toISOString().split('T')[0],
      dueDate: invoiceData.dueDate || new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
      currency: 'INR',
      subtotal: Number(invoiceData.subtotal) || 0,
      discountAmount: Number(invoiceData.discountAmount) || 0,
      taxAmount: Number(invoiceData.taxAmount) || 0,
      total: Number(invoiceData.total) || 0,
      notes: invoiceData.notes || 'Generated invoice.'
    };

    const newItems = itemsData.map((item, idx) => ({
      id: `ITEM-${newId}-${idx + 1}`,
      invoiceId: newId,
      productId: item.productId,
      description: item.description || item.name || 'Product',
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unitPrice) || 0,
      discountAmount: Number(item.discountAmount) || 0,
      taxAmount: Number(item.taxAmount) || 0,
      lineTotal: Number(item.lineTotal) || (Number(item.quantity) * Number(item.unitPrice)),
      billingType: item.billingType || 'ONE_TIME'
    }));

    setInvoices(prev => [newInvoice, ...prev]);
    setInvoiceItems(prev => [...newItems, ...prev]);

    return newInvoice;
  }, []);

  return (
    <InvoiceContext.Provider value={{
      invoices: liveInvoices,
      invoiceItems,
      payments,
      billingSchedules,
      subscriptionItems,
      auditLogs,
      customers: CUSTOMERS_DATA,
      orders: ORDERS_DATA,
      subscriptions: SUBSCRIPTIONS_DATA,
      getInvoiceDetails,
      getRelatedInvoices: (inv) => getRelatedInvoices(inv, liveInvoices),
      recordPayment,
      createInvoice
    }}>
      {children}
    </InvoiceContext.Provider>
  );
};

export const useInvoices = () => useContext(InvoiceContext);
