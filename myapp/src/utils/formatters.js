// DealFlow360 — Indian Rupee (INR) and Number Formatting Utilities

/**
 * Format a number as Indian Rupee (INR) string: e.g. ₹1,45,000 or ₹24,343.20
 * @param {number|string} amount 
 * @param {boolean} includeDecimals 
 * @returns {string} e.g. "₹1,45,000"
 */
export const formatINR = (amount, includeDecimals = false) => {
  const num = Number(amount);
  if (isNaN(num) || num === null || num === undefined) return '₹0';

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: includeDecimals && num % 1 !== 0 ? 2 : 0,
    maximumFractionDigits: 2
  }).format(num);
};

/**
 * Format large INR numbers into Lakhs (L) and Crores (Cr)
 * e.g. 14205000 -> ₹1.42 Cr, 145000 -> ₹1.45L, 385400 -> ₹3.85L
 * @param {number|string} amount
 * @returns {string} e.g. "₹1.42 Cr" or "₹14.5L"
 */
export const formatINRAbbreviated = (amount) => {
  const num = Number(amount);
  if (isNaN(num) || num === null || num === undefined) return '₹0';

  if (Math.abs(num) >= 10000000) {
    // 1 Crore = 10,000,000 (100 Lakhs)
    const cr = num / 10000000;
    return `₹${cr.toFixed(cr % 1 === 0 ? 0 : 2)} Cr`;
  } else if (Math.abs(num) >= 100000) {
    // 1 Lakh = 100,000
    const lk = num / 100000;
    return `₹${lk.toFixed(lk % 1 === 0 ? 0 : 2)}L`;
  } else if (Math.abs(num) >= 1000) {
    const k = num / 1000;
    return `₹${k.toFixed(k % 1 === 0 ? 0 : 1)}k`;
  }
  return formatINR(num);
};

export const formatINRCompact = formatINRAbbreviated;

/**
 * Format raw number with Indian comma grouping (en-IN)
 * @param {number|string} val
 * @returns {string} e.g. "1,45,000"
 */
export const formatNumberIN = (val) => {
  const num = Number(val);
  if (isNaN(num)) return '0';
  return num.toLocaleString('en-IN');
};
