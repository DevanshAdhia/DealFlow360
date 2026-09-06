import { storageService } from './storageService.js';

const API_BASE_URL = 'http://localhost:8000/api';

const getHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const getCustomerStatusLabel = (status) => {
  if (!status) return 'Awaiting Response';
  const normalized = status.toUpperCase().replace(/\s+/g, '_');

  switch (normalized) {
    case 'DRAFT':
      return 'Being Prepared';
    case 'PENDING_APPROVAL':
    case 'PENDING':
      return 'Being Reviewed';
    case 'APPROVED':
      return 'Ready for Your Response';
    case 'SENT':
    case 'AWAITING_RESPONSE':
      return 'Awaiting Response';
    case 'UNDER_NEGOTIATION':
    case 'NEGOTIATION':
      return 'Under Negotiation';
    case 'CONFIRMED':
      return 'Confirmed';
    case 'REJECTED':
      return 'Rejected';
    case 'CANCELLED':
      return 'Cancelled';
    case 'EXPIRED':
      return 'Expired';
    case 'RETURNED_FOR_REVISION':
      return 'Being Updated';
    default:
      return status;
  }
};

export const getCustomerStatusBadgeClass = (status) => {
  if (!status) return 'awaiting';
  const normalized = status.toUpperCase().replace(/\s+/g, '_');

  switch (normalized) {
    case 'SENT':
    case 'AWAITING_RESPONSE':
      return 'awaiting';
    case 'UNDER_NEGOTIATION':
    case 'NEGOTIATION':
      return 'negotiation';
    case 'CONFIRMED':
      return 'confirmed';
    case 'APPROVED':
      return 'approved';
    case 'REJECTED':
    case 'CANCELLED':
      return 'rejected';
    case 'EXPIRED':
      return 'expired';
    default:
      return 'review';
  }
};

export const isQuotationExpired = (quotation) => {
  if (!quotation || !quotation.validUntil) return false;
  const expiryDate = new Date(quotation.validUntil);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return expiryDate < today;
};

export const getCustomerQuotationActions = (quotation) => {
  if (!quotation) {
    return { canView: false, canNegotiate: false, canAccept: false, canComment: false, canDecline: false };
  }

  const normalized = (quotation.status || '').toUpperCase().replace(/\s+/g, '_');
  const expired = isQuotationExpired(quotation);

  if (expired) {
    return {
      canView: true,
      canNegotiate: false,
      canAccept: false,
      canComment: false,
      canDecline: false
    };
  }

  switch (normalized) {
    case 'SENT':
    case 'APPROVED':
      return {
        canView: true,
        canNegotiate: true,
        canAccept: true,
        canComment: true,
        canDecline: true
      };
    case 'UNDER_NEGOTIATION':
    case 'NEGOTIATION':
      return {
        canView: true,
        canNegotiate: true,
        canAccept: false,
        canComment: true,
        canDecline: true
      };
    case 'CONFIRMED':
      return {
        canView: true,
        canNegotiate: false,
        canAccept: false,
        canComment: true,
        canDecline: false
      };
    case 'REJECTED':
    case 'CANCELLED':
      return {
        canView: true,
        canNegotiate: false,
        canAccept: false,
        canComment: false,
        canDecline: false
      };
    case 'DRAFT':
    case 'PENDING_APPROVAL':
    case 'PENDING':
    case 'RETURNED_FOR_REVISION':
      return {
        canView: true,
        canNegotiate: false,
        canAccept: false,
        canComment: true,
        canDecline: false
      };
    default:
      return {
        canView: true,
        canNegotiate: false,
        canAccept: false,
        canComment: true,
        canDecline: false
      };
  }
};

export const customerQuotationService = {
  fetchQuotations: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/sales/quotations/?page_size=1000`, {
        headers: getHeaders(),
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.results || (Array.isArray(data) ? data : []);
    } catch {
      return [];
    }
  },

  getCustomerQuotations: (customerId, quotationsList = []) => {
    const list = Array.isArray(quotationsList) ? quotationsList : [];
    return list.filter(q => !customerId || String(q.customerId) === String(customerId) || String(q.customer) === String(customerId));
  },

  getCustomerQuotationById: (customerId, quotationId, quotationsList = []) => {
    const list = Array.isArray(quotationsList) ? quotationsList : [];
    const quote = list.find(q => String(q.id) === String(quotationId) || String(q.quotationNumber) === String(quotationId));
    if (!quote) return null;
    if (customerId && String(quote.customerId || quote.customer) !== String(customerId)) {
      return null;
    }
    return quote;
  },

  getQuotationItems: (quotationId, itemsList = [], productsList = []) => {
    const safeProducts = Array.isArray(productsList) ? productsList : [];
    const safeItems = Array.isArray(itemsList) ? itemsList : [];
    const productMap = new Map(safeProducts.map(p => [p.id, p]));

    return safeItems
      .filter(item => String(item.quotationId || item.quotation) === String(quotationId))
      .map(item => {
        const prod = productMap.get(item.productId || item.product) || {};
        return {
          ...item,
          productName: item.productName || prod.name || 'Product',
          description: item.description || prod.description || '',
          unitPrice: Number(item.unitPrice) || Number(prod.unitPrice) || 0,
          quantity: Number(item.quantity) || 1,
          discount: Number(item.discount) || 0,
          taxRate: Number(item.taxRate) || Number(prod.gstRate) || 18,
          tax: Number(item.tax) || 0,
          total: Number(item.total) || 0
        };
      });
  },

  acceptQuotation: async (customerId, quotationId, currentQuotations = []) => {
    try {
      await fetch(`${API_BASE_URL}/sales/quotations/${quotationId}/submit/`, {
        method: 'POST',
        headers: getHeaders(),
      });
    } catch {}

    const list = Array.isArray(currentQuotations) ? currentQuotations : [];
    let acceptedQuote = null;
    const updated = list.map(q => {
      if ((String(q.id) === String(quotationId) || String(q.quotationNumber) === String(quotationId))) {
        acceptedQuote = {
          ...q,
          status: 'CONFIRMED',
          confirmedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        return acceptedQuote;
      }
      return q;
    });

    storageService.saveQuotations(updated);
    return { updatedList: updated, acceptedQuote };
  },

  declineQuotation: async (customerId, quotationId, reason, currentQuotations = []) => {
    const list = Array.isArray(currentQuotations) ? currentQuotations : [];
    let declinedQuote = null;
    const updated = list.map(q => {
      if ((String(q.id) === String(quotationId) || String(q.quotationNumber) === String(quotationId))) {
        declinedQuote = {
          ...q,
          status: 'REJECTED',
          declineReason: reason,
          declinedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        return declinedQuote;
      }
      return q;
    });

    storageService.saveQuotations(updated);
    return { updatedList: updated, declinedQuote };
  }
};
