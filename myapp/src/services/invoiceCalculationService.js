/**
 * DealFlow360 - Invoice Calculation Service
 * Deterministic calculations for line items, paid amounts, balance amounts,
 * and financial payment status transitions.
 */

/**
 * Calculate total paid amount from successful payment records
 * @param {Array} payments 
 * @returns {number}
 */
export const calculateInvoicePaidAmount = (payments = []) => {
  return payments
    .filter(p => !p.status || p.status === 'SUCCESS')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
};

/**
 * Calculate outstanding balance
 * @param {number} total 
 * @param {number} paidAmount 
 * @returns {number}
 */
export const calculateInvoiceBalance = (total = 0, paidAmount = 0) => {
  return Math.max(0, Number(total) - Number(paidAmount));
};

/**
 * Compute payment status based on amounts and due date
 * @param {number} total 
 * @param {number} paidAmount 
 * @param {string} dueDate 
 * @param {string} currentStatus 
 * @returns {"UNPAID" | "PARTIALLY_PAID" | "PAID" | "OVERDUE" | "CANCELLED"}
 */
export const calculateInvoicePaymentStatus = (total, paidAmount, dueDate, currentStatus) => {
  if (currentStatus === 'CANCELLED') return 'CANCELLED';

  const t = Number(total) || 0;
  const p = Number(paidAmount) || 0;

  if (p >= t && t > 0) {
    return 'PAID';
  }

  if (p > 0 && p < t) {
    return 'PARTIALLY_PAID';
  }

  // Check overdue
  if (dueDate) {
    const due = new Date(dueDate).getTime();
    const now = Date.now();
    if (now > due && p < t) {
      return 'OVERDUE';
    }
  }

  return 'UNPAID';
};

/**
 * Calculate line totals and grand invoice totals
 * @param {Array} items 
 * @param {number} discountAmount 
 * @returns {Object}
 */
export const calculateInvoiceTotalsFromItems = (items = [], discountAmount = 0) => {
  const subtotal = items.reduce((sum, item) => {
    const lineSubtotal = (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0);
    return sum + lineSubtotal;
  }, 0);

  const taxable = Math.max(0, subtotal - (Number(discountAmount) || 0));
  const taxAmount = items.reduce((sum, item) => sum + (Number(item.taxAmount) || 0), 0);
  const total = taxable + taxAmount;

  return {
    subtotal,
    discountAmount: Number(discountAmount) || 0,
    taxableAmount: taxable,
    taxAmount,
    total
  };
};

/**
 * Format currency in Indian Rupee format
 * @param {number} val 
 * @returns {string}
 */
export const formatCurrency = (val) => {
  const num = Number(val) || 0;
  return `₹${num.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: Number.isInteger(num) ? 0 : 2
  })}`;
};

/**
 * Get CSS badge class for invoice type
 * @param {string} type 
 * @returns {string}
 */
export const getInvoiceTypeBadgeClass = (type) => {
  switch (type) {
    case 'ONE_TIME':
      return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200';
    case 'RECURRING':
      return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200';
    case 'MIXED':
      return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200';
    default:
      return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200';
  }
};

/**
 * Get CSS badge class for payment status
 * @param {string} status 
 * @returns {string}
 */
export const getPaymentStatusBadgeClass = (status) => {
  switch (status) {
    case 'PAID':
      return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200';
    case 'PARTIALLY_PAID':
      return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200';
    case 'OVERDUE':
      return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200';
    case 'CANCELLED':
      return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200';
    case 'UNPAID':
    default:
      return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200';
  }
};

