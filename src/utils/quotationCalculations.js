// DealFlow360 — Pure Business Logic Quotation Calculations (CPQ Engine)
// All pricing, margin, profit, tax, and governance calculations are strictly deterministic.

import { CUSTOMER_TIERS, getCustomerTierById } from '../data/customerTiers.js';
import { PRICE_LISTS, getPriceForProductInTier } from '../data/priceLists.js';
import { evaluateQuotationApproval } from '../data/approvalRules.js';

/**
 * Calculates line subtotal = quantity * unitPrice
 */
export const calculateLineSubtotal = (quantity, unitPrice) => {
  const qty = Math.max(Number(quantity) || 0, 0);
  const price = Math.max(Number(unitPrice) || 0, 0);
  return qty * price;
};

/**
 * Calculates line discount amount = subtotal * (discountPercent / 100)
 */
export const calculateLineDiscountAmount = (subtotal, discountPercent) => {
  const disc = Math.min(Math.max(Number(discountPercent) || 0, 0), 100);
  return Math.round(subtotal * (disc / 100));
};

/**
 * Calculates line taxable amount = subtotal - discountAmount
 */
export const calculateLineTaxableAmount = (subtotal, discountAmount) => {
  return Math.max(subtotal - discountAmount, 0);
};

/**
 * Calculates line GST tax = taxableAmount * (gstRate / 100)
 */
export const calculateLineTax = (taxableAmount, gstRate = 18) => {
  const rate = Math.max(Number(gstRate) || 0, 0);
  return Math.round(taxableAmount * (rate / 100));
};

/**
 * Calculates complete financials for a single line item
 */
export const calculateItemFinancials = (item, tierId = null) => {
  const qty = Math.max(Number(item.quantity) || 0, 0);
  const basePrice = Number(item.unitPrice) || 0;
  
  // If tierId is provided and unitPrice isn't explicitly fixed, check tier price list
  const unitPrice = tierId ? getPriceForProductInTier(item.productId, basePrice, tierId) : basePrice;
  const costPrice = Number(item.costPrice) || Math.round(unitPrice * 0.55);
  const discount = Math.min(Math.max(Number(item.discount) || 0, 0), 100);
  const gstRate = Number(item.gstRate) || 18;

  const subtotal = qty * unitPrice;
  const discountAmount = Math.round(subtotal * (discount / 100));
  const taxableAmount = Math.max(subtotal - discountAmount, 0);
  const tax = Math.round(taxableAmount * (gstRate / 100));
  const total = taxableAmount + tax;

  const totalCost = qty * costPrice;
  const profit = taxableAmount - totalCost;
  const margin = taxableAmount > 0 ? Math.round((profit / taxableAmount) * 1000) / 10 : 0;

  return {
    ...item,
    quantity: qty,
    unitPrice,
    costPrice,
    subtotal,
    discount,
    discountAmount,
    taxableAmount,
    gstRate,
    tax,
    total,
    totalCost,
    profit,
    margin
  };
};

/**
 * Calculates complete quotation totals across all line items
 */
export const calculateQuotationTotals = (items = [], overallDiscount = 0, taxRate = 18, customerTierId = null) => {
  const enrichedItems = (items || []).map(it => calculateItemFinancials(it, customerTierId));

  const rawSubtotal = enrichedItems.reduce((acc, it) => acc + (it.subtotal || 0), 0);
  const totalCost = enrichedItems.reduce((acc, it) => acc + (it.totalCost || (it.quantity * (it.costPrice || 0))), 0);

  const discPercent = Math.min(Math.max(Number(overallDiscount) || 0, 0), 100);
  const discountAmount = Math.round(rawSubtotal * (discPercent / 100));
  const taxableAmount = Math.max(rawSubtotal - discountAmount, 0);
  const tax = Math.round(taxableAmount * (Number(taxRate || 18) / 100));
  const total = taxableAmount + tax;

  const grossProfit = taxableAmount - totalCost;
  const margin = taxableAmount > 0 ? Math.round((grossProfit / taxableAmount) * 1000) / 10 : 0;

  return {
    items: enrichedItems,
    subtotal: rawSubtotal,
    discount: discPercent,
    discountAmount,
    taxableAmount,
    taxRate: Number(taxRate || 18),
    tax,
    total,
    totalCost,
    grossProfit,
    margin
  };
};

/**
 * Backward compatibility alias for single item total
 */
export const calculateItemTotal = (quantity, unitPrice) => {
  return (Number(quantity) || 0) * (Number(unitPrice) || 0);
};

/**
 * Re-export assessment and stage mapping
 */
export const assessDealHealth = (discount, margin = 40) => {
  const d = Number(discount) || 0;
  const m = Number(margin) || 40;

  if (d > 20 || m < 25) {
    return { health: 'Critical', riskScore: 85, color: '#EF4444' };
  }
  if (d > 12 || m < 35) {
    return { health: 'At Risk', riskScore: 65, color: '#F59E0B' };
  }
  return { health: 'Healthy', riskScore: 12, color: '#10B981' };
};

export const stageToStatus = (stage) => {
  switch (stage) {
    case 'draft': return 'Draft';
    case 'pending_approval': return 'Pending Approval';
    case 'approved': return 'Approved';
    case 'returned_for_revision': return 'Returned for Revision';
    case 'rejected': return 'Rejected';
    case 'negotiation': return 'Negotiation';
    case 'confirmed': return 'Confirmed';
    case 'cancelled': return 'Cancelled';
    default: return 'Draft';
  }
};

/**
 * Compatibility alias for line item computation in builder
 */
export const computeLineItem = (item) => {
  return calculateItemFinancials(item);
};

export const calculateQuotationMargin = (items = []) => {
  const computed = (items || []).map(computeLineItem);
  const totalRevenue = computed.reduce((acc, it) => acc + (it.taxableAmount || it.subtotal || 0), 0);
  const totalCost = computed.reduce((acc, it) => acc + (it.totalCost || (it.quantity * (it.costPrice || 0)) || 0), 0);
  const profit = totalRevenue - totalCost;
  const margin = totalRevenue > 0 ? Math.round((profit / totalRevenue) * 1000) / 10 : 0;
  return { totalRevenue, totalCost, profit, margin };
};

