/**
 * billingUtils.js
 * Phase 7 — Hybrid Billing & Subscription utility functions.
 * All calculation logic lives here — pages/context call these.
 */

// Default GST rate when product does not specify one
const DEFAULT_GST_RATE = 0.18;

// ---------- Individual helpers ----------

/**
 * Calculate subtotal from an array of items.
 * @param {Array} items  - [{quantity, unitPrice}]
 */
export const calculateSubtotal = (items = []) =>
  items.reduce((sum, item) => sum + (item.unitPrice || 0) * (item.quantity || 1), 0);

/**
 * Calculate discount amount.
 * discountPercent is a number 0-100; discountAmount is a flat ₹ value.
 * If both are supplied, discountAmount wins.
 */
export const calculateDiscount = (subtotal, { discountPercent = 0, discountAmount = 0 } = {}) => {
  if (discountAmount > 0) return discountAmount;
  return (subtotal * discountPercent) / 100;
};

/**
 * Taxable Amount = Subtotal - Discount (floor at 0)
 */
export const calculateTaxableAmount = (subtotal, discount) =>
  Math.max(0, subtotal - discount);

/**
 * GST for a single item, respecting per-product gstRate if present.
 * @param {Object} item       - {unitPrice, quantity, gstRate?}
 * @param {number} baseAmount - pre-computed taxable amount for the item
 */
export const calculateItemGST = (item, baseAmount) => {
  const rate = item.gstRate !== undefined ? item.gstRate : DEFAULT_GST_RATE;
  return baseAmount * rate;
};

/**
 * Calculate blended GST across all items (respects per-product gstRate).
 * @param {Array}  items     - product items
 * @param {number} discount  - total discount already applied
 */
export const calculateGST = (items = [], discount = 0) => {
  const subtotal = calculateSubtotal(items);
  const taxable = calculateTaxableAmount(subtotal, discount);
  if (subtotal === 0) return 0;

  // If items have per-product rates, weight them proportionally
  const hasPerProductRates = items.some(i => i.gstRate !== undefined);
  if (hasPerProductRates) {
    const totalItemAmount = items.reduce((sum, item) => {
      const itemTotal = (item.unitPrice || 0) * (item.quantity || 1);
      const rate = item.gstRate !== undefined ? item.gstRate : DEFAULT_GST_RATE;
      return sum + itemTotal * rate;
    }, 0);
    // Scale GST proportionally to discount
    return (taxable / subtotal) * totalItemAmount;
  }

  return taxable * DEFAULT_GST_RATE;
};

/**
 * Full invoice total.
 * Total = Taxable Amount + GST
 */
export const calculateInvoiceTotal = (taxableAmount, gst) => taxableAmount + gst;

/**
 * Batch helper: returns the full {subtotal, discount, taxableAmount, gst, total} object.
 * Used by BillingContext.createInvoice().
 */
export const calculateInvoiceTotals = (items = [], totalDiscount = 0) => {
  const subtotal = calculateSubtotal(items);
  const taxableAmount = calculateTaxableAmount(subtotal, totalDiscount);
  const gst = calculateGST(items, totalDiscount);
  const total = calculateInvoiceTotal(taxableAmount, gst);

  return { subtotal, discount: totalDiscount, taxableAmount, gst, total };
};

/**
 * Calculate Monthly Recurring Revenue from active subscriptions.
 * Normalises Quarterly and Yearly to monthly equivalent.
 * @param {Array} subscriptions
 */
export const calculateMRR = (subscriptions = []) =>
  subscriptions
    .filter(sub => sub.status === 'Active')
    .reduce((sum, sub) => {
      const amount = sub.amount || 0;
      if (sub.billingCycle === 'Monthly') return sum + amount;
      if (sub.billingCycle === 'Quarterly') return sum + amount / 3;
      if (sub.billingCycle === 'Yearly') return sum + amount / 12;
      return sum;
    }, 0);

/**
 * Calculate the next billing date from startDate + cycle.
 * @param {string} startDate - ISO date string
 * @param {string} cycle     - 'Monthly' | 'Quarterly' | 'Yearly'
 */
export const calculateNextBillingDate = (startDate, cycle) => {
  const date = new Date(startDate);
  if (cycle === 'Monthly') date.setMonth(date.getMonth() + 1);
  else if (cycle === 'Quarterly') date.setMonth(date.getMonth() + 3);
  else date.setFullYear(date.getFullYear() + 1);
  return date.toISOString();
};

/**
 * Returns true if an invoice is overdue (not paid/cancelled and past dueDate).
 */
export const isOverdue = (invoice) => {
  if (!invoice) return false;
  if (['Paid', 'Cancelled', 'Partially Paid'].includes(invoice.status)) return false;
  return new Date(invoice.dueDate) < new Date();
};

/**
 * Separates items into One-Time vs Recurring buckets.
 * Detection order:
 *   1. Explicit billingType === 'recurring'
 *   2. Category is Software or Cloud
 *   3. Otherwise one-time
 */
export const splitHybridBilling = (items = []) => {
  const oneTimeItems = [];
  const recurringItems = [];
  let oneTimeSubtotal = 0;
  let recurringSubtotal = 0;

  items.forEach(item => {
    const isRecurring =
      item.billingType === 'recurring' ||
      ['Software', 'Cloud'].includes(item.category);

    const itemTotal = (item.unitPrice || 0) * (item.quantity || 1);

    if (isRecurring) {
      recurringItems.push({
        ...item,
        billingType: 'recurring',
        billingCycle: item.billingCycle || 'Yearly',
      });
      recurringSubtotal += itemTotal;
    } else {
      oneTimeItems.push({ ...item, billingType: 'one-time' });
      oneTimeSubtotal += itemTotal;
    }
  });

  return { oneTimeItems, recurringItems, oneTimeSubtotal, recurringSubtotal };
};

