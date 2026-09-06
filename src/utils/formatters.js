// DealFlow360 — Indian Rupee (INR) and Number Formatting Utilities

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

export const formatCurrency = formatINR;

export const formatINRAbbreviated = (amount) => {
  const num = Number(amount);
  if (isNaN(num) || num === null || num === undefined) return '₹0';

  if (Math.abs(num) >= 10000000) {
    const cr = num / 10000000;
    return `₹${cr.toFixed(cr % 1 === 0 ? 0 : 2)} Cr`;
  } else if (Math.abs(num) >= 100000) {
    const lk = num / 100000;
    return `₹${lk.toFixed(lk % 1 === 0 ? 0 : 2)}L`;
  } else if (Math.abs(num) >= 1000) {
    const k = num / 1000;
    return `₹${k.toFixed(k % 1 === 0 ? 0 : 1)}k`;
  }
  return formatINR(num);
};

export const formatINRCompact = formatINRAbbreviated;

export const formatNumberIN = (val) => {
  const num = Number(val);
  if (isNaN(num)) return '0';
  return num.toLocaleString('en-IN');
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};
