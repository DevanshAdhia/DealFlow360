import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { INITIAL_INVOICES } from '../data/invoices.js';
import { INITIAL_SUBSCRIPTIONS } from '../data/subscriptions.js';
import { calculateInvoiceTotals, splitHybridBilling, calculateNextBillingDate, isOverdue } from '../utils/billingUtils.js';

const BillingContext = createContext();

const STORAGE_KEY_INVOICES = 'dealflow360_invoices';
const STORAGE_KEY_SUBS = 'dealflow360_subscriptions';

// Apply overdue status to any invoice that has passed its due date
const applyOverdueStatus = (invoices) =>
  invoices.map(inv =>
    isOverdue(inv) ? { ...inv, status: 'Overdue' } : inv
  );

const historyEntry = (action, comment, actor = 'System') => ({
  id: `IH-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  action,
  comment,
  timestamp: new Date().toISOString(),
  actor,
});

export const BillingProvider = ({ children }) => {
  const [invoices, setInvoices] = useState(() => applyOverdueStatus(INITIAL_INVOICES));
  const [subscriptions, setSubscriptions] = useState(INITIAL_SUBSCRIPTIONS);
  const [isLoaded, setIsLoaded] = useState(true);

  // ── Bootstrap from state / source data ──────────────────────────────
  useEffect(() => {
    try {
      const storedInvoices = localStorage.getItem(STORAGE_KEY_INVOICES);
      const storedSubs = localStorage.getItem(STORAGE_KEY_SUBS);

      if (storedInvoices) {
        const raw = JSON.parse(storedInvoices);
        setInvoices(applyOverdueStatus(raw));
      }
      if (storedSubs) {
        const parsedSubs = JSON.parse(storedSubs);
        if (parsedSubs && parsedSubs.length >= INITIAL_SUBSCRIPTIONS.length) {
          setSubscriptions(parsedSubs);
        } else {
          setSubscriptions(INITIAL_SUBSCRIPTIONS);
        }
      }
    } catch (e) {
      console.error('Failed to load billing data', e);
      setInvoices(applyOverdueStatus(INITIAL_INVOICES));
      setSubscriptions(INITIAL_SUBSCRIPTIONS);
    }
  }, []);

  // ── Persist to localStorage ───────────────────────────────────────
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY_INVOICES, JSON.stringify(invoices));
      localStorage.setItem(STORAGE_KEY_SUBS, JSON.stringify(subscriptions));
    }
  }, [invoices, subscriptions, isLoaded]);

  // ── INVOICE ACTIONS ───────────────────────────────────────────────

  const createInvoice = useCallback((fulfillment, quotation) => {
    const existing = invoices.find(inv => inv.fulfillmentId === fulfillment.id);
    if (existing) return existing;

    const items = quotation.items || [];
    const subtotal = items.reduce((s, i) => s + (i.unitPrice || 0) * (i.quantity || 1), 0);
    const discountAmount = quotation.discount ? (subtotal * quotation.discount / 100) : 0;

    const totals = calculateInvoiceTotals(items, discountAmount);
    const { recurringItems } = splitHybridBilling(items);

    const now = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const newInvoice = {
      id: `INV-${now.getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      quotationId: quotation.id,
      fulfillmentId: fulfillment.id,
      customerId: quotation.customerId || '',
      customerName: quotation.customerName || quotation.customer || 'Unknown Customer',
      items,
      recurringItemsDetails: recurringItems,
      ...totals,
      status: 'Issued',
      issueDate: now.toISOString(),
      dueDate: dueDate.toISOString(),
      paymentDate: null,
      paymentMethod: null,
      amountPaid: null,
      history: [
        historyEntry('Issued', 'Invoice generated from fulfilled order.', 'System'),
      ],
    };

    setInvoices(prev => [newInvoice, ...prev]);
    return newInvoice;
  }, [invoices]);

  const createInvoiceFromSubscription = useCallback((subscription) => {
    const now = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const amount = Number(subscription.amount) || 50000;
    const tax = Math.round(amount * 0.18);
    const total = amount + tax;

    const newInvoice = {
      id: `INV-${now.getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      quotationId: subscription.quotationId || 'QID-001',
      fulfillmentId: subscription.fulfillmentId || 'FO-1042',
      subscriptionId: subscription.id,
      customerId: subscription.customerId || 'CUST-001',
      customerName: subscription.customerName || 'Acme Corporation',
      items: [
        {
          id: `ITM-REC-${Date.now()}`,
          name: `${subscription.planName || subscription.productName} (${subscription.billingCycle} Recurring)`,
          quantity: 1,
          unitPrice: amount,
          totalPrice: amount,
          billingCycle: subscription.billingCycle || 'Yearly'
        }
      ],
      recurringItemsDetails: [],
      subtotal: amount,
      discountAmount: 0,
      tax,
      total,
      status: 'Issued',
      issueDate: now.toISOString(),
      dueDate: dueDate.toISOString(),
      paymentDate: null,
      paymentMethod: null,
      amountPaid: null,
      history: [
        historyEntry(
          'Issued',
          `Recurring invoice generated from subscription ${subscription.id} for cycle ${subscription.billingCycle}.`,
          'Automated Billing Engine'
        )
      ]
    };

    setInvoices(prev => [newInvoice, ...prev]);

    // Recalculate next billing date for this subscription
    const nextDate = calculateNextBillingDate(now.toISOString(), subscription.billingCycle || 'Yearly');
    setSubscriptions(prev => prev.map(s => s.id === subscription.id ? { ...s, nextBillingDate: nextDate } : s));

    return newInvoice;
  }, []);

  const getInvoiceById = useCallback((id) =>
    invoices.find(inv => inv.id === id),
  [invoices]);

  const getInvoiceByFulfillmentId = useCallback((id) =>
    invoices.find(inv => inv.fulfillmentId === id),
  [invoices]);

  const updateInvoice = useCallback((invoiceId, updates) => {
    setInvoices(prev =>
      prev.map(inv => inv.id === invoiceId ? { ...inv, ...updates } : inv)
    );
  }, []);

  const markAsPaid = useCallback((invoiceId, paymentMethod, actor = 'Finance') => {
    setInvoices(prevInvoices => {
      const idx = prevInvoices.findIndex(inv => inv.id === invoiceId);
      if (idx === -1) return prevInvoices;

      const invoice = { ...prevInvoices[idx] };
      if (['Paid', 'Cancelled'].includes(invoice.status)) return prevInvoices;

      const now = new Date().toISOString();
      invoice.status = 'Paid';
      invoice.paymentDate = now;
      invoice.paymentMethod = paymentMethod;
      invoice.amountPaid = invoice.total;
      invoice.history = [
        historyEntry('Paid', `Full payment of ₹${invoice.total.toLocaleString('en-IN')} received via ${paymentMethod}.`, actor),
        ...(invoice.history || []),
      ];

      // Auto-create subscriptions for recurring items
      if (invoice.recurringItemsDetails?.length > 0) {
        setSubscriptions(prevSubs => {
          const newSubs = invoice.recurringItemsDetails.map((item, i) => ({
            id: `SUB-${Math.floor(1000 + Math.random() * 9000)}-${i}`,
            invoiceId: invoice.id,
            customerId: invoice.customerId || '',
            customerName: invoice.customerName,
            productName: item.name,
            planName: `${item.name} Plan`,
            amount: (item.unitPrice || 0) * (item.quantity || 1),
            billingCycle: item.billingCycle || 'Yearly',
            startDate: now,
            nextBillingDate: calculateNextBillingDate(now, item.billingCycle || 'Yearly'),
            status: 'Active',
          }));
          return [...newSubs, ...prevSubs];
        });
      }

      const updated = [...prevInvoices];
      updated[idx] = invoice;
      return updated;
    });
  }, []);

  const markAsPartiallyPaid = useCallback((invoiceId, { amount, paymentMethod, actor = 'Finance' }) => {
    setInvoices(prevInvoices => {
      const idx = prevInvoices.findIndex(inv => inv.id === invoiceId);
      if (idx === -1) return prevInvoices;

      const invoice = { ...prevInvoices[idx] };
      if (['Paid', 'Cancelled'].includes(invoice.status)) return prevInvoices;

      const now = new Date().toISOString();
      invoice.status = 'Partially Paid';
      invoice.paymentDate = now;
      invoice.paymentMethod = paymentMethod;
      invoice.amountPaid = amount;
      invoice.history = [
        historyEntry(
          'Partially Paid',
          `Partial payment of ₹${Number(amount).toLocaleString('en-IN')} received via ${paymentMethod}. Balance: ₹${(invoice.total - amount).toLocaleString('en-IN')}.`,
          actor
        ),
        ...(invoice.history || []),
      ];

      const updated = [...prevInvoices];
      updated[idx] = invoice;
      return updated;
    });
  }, []);

  const cancelInvoice = useCallback((invoiceId, { reason = 'Cancelled by Finance', actor = 'Finance' } = {}) => {
    setInvoices(prevInvoices => {
      const idx = prevInvoices.findIndex(inv => inv.id === invoiceId);
      if (idx === -1) return prevInvoices;

      const invoice = { ...prevInvoices[idx] };
      if (invoice.status === 'Cancelled') return prevInvoices;

      const prevStatus = invoice.status;
      invoice.status = 'Cancelled';
      invoice.history = [
        historyEntry('Cancelled', `${reason} (was: ${prevStatus})`, actor),
        ...(invoice.history || []),
      ];

      const updated = [...prevInvoices];
      updated[idx] = invoice;
      return updated;
    });
  }, []);

  // ── SUBSCRIPTION ACTIONS ──────────────────────────────────────────

  const createSubscription = useCallback((data) => {
    const newSub = {
      id: `SUB-${Math.floor(1000 + Math.random() * 9000)}`,
      startDate: new Date().toISOString(),
      nextBillingDate: calculateNextBillingDate(new Date().toISOString(), data.billingCycle || 'Yearly'),
      status: 'Active',
      ...data,
    };
    setSubscriptions(prev => [newSub, ...prev]);
    return newSub;
  }, []);

  const updateSubscription = useCallback((subId, updates) => {
    setSubscriptions(prev =>
      prev.map(s => s.id === subId ? { ...s, ...updates } : s)
    );
  }, []);

  const pauseSubscription = useCallback((subId) => {
    setSubscriptions(prev =>
      prev.map(s => s.id === subId && s.status === 'Active'
        ? { ...s, status: 'Paused' }
        : s)
    );
  }, []);

  const resumeSubscription = useCallback((subId) => {
    setSubscriptions(prev =>
      prev.map(s => s.id === subId && s.status === 'Paused'
        ? { ...s, status: 'Active', nextBillingDate: calculateNextBillingDate(new Date().toISOString(), s.billingCycle) }
        : s)
    );
  }, []);

  const cancelSubscription = useCallback((subId) => {
    setSubscriptions(prev =>
      prev.map(s => s.id === subId && s.status !== 'Cancelled'
        ? { ...s, status: 'Cancelled' }
        : s)
    );
  }, []);

  return (
    <BillingContext.Provider value={{
      invoices,
      subscriptions,
      // Invoice
      createInvoice,
      createInvoiceFromSubscription,
      getInvoiceById,
      getInvoiceByFulfillmentId,
      updateInvoice,
      markAsPaid,
      markAsPartiallyPaid,
      cancelInvoice,
      // Subscription
      createSubscription,
      updateSubscription,
      pauseSubscription,
      resumeSubscription,
      cancelSubscription,
    }}>
      {children}
    </BillingContext.Provider>
  );
};

export const useBilling = () => useContext(BillingContext);
