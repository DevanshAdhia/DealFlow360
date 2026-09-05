export const formatCurrency = (amount, currency = 'INR') => {
  const numeric = Number(amount) || 0;
  if (currency === 'INR') {
    return '₹' + Math.round(numeric).toLocaleString('en-IN');
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(numeric);
};

export const formatDate = (dateString) => {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return String(dateString);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch (e) {
    return String(dateString);
  }
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return String(dateString);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return String(dateString);
  }
};
