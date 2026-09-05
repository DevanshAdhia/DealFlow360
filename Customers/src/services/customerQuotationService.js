import { storageService } from './storageService.js';

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
        canAccept: false, // Active negotiation prevents acceptance of an outdated version!
        canComment: true,
        canDecline: true
      };
    case 'CONFIRMED':
      return {
        canView: true,
        canNegotiate: false,
        canAccept: false, // Double acceptance prevented!
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
  getCustomerQuotations: (customerId, quotationsList = null) => {
    const list = quotationsList || storageService.getQuotations();
    return list.filter(q => String(q.customerId) === String(customerId));
  },

  getCustomerQuotationById: (customerId, quotationId, quotationsList = null) => {
    const list = quotationsList || storageService.getQuotations();
    const quote = list.find(q => String(q.id) === String(quotationId) || String(q.quotationNumber) === String(quotationId));
    // Crucial Security Rule: validate customerId!
    if (!quote || String(quote.customerId) !== String(customerId)) {
      return null;
    }
    return quote;
  },

  getQuotationItems: (quotationId, itemsList = null, productsList = null) => {
    const items = itemsList || storageService.getQuotationItems();
    const products = productsList || storageService.getProducts();
    const productMap = new Map(products.map(p => [p.id, p]));

    return items
      .filter(item => String(item.quotationId) === String(quotationId))
      .map(item => {
        const prod = productMap.get(item.productId) || {};
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

  acceptQuotation: (customerId, quotationId, currentQuotations = null) => {
    const list = currentQuotations || storageService.getQuotations();
    let acceptedQuote = null;

    const updated = list.map(q => {
      if ((String(q.id) === String(quotationId) || String(q.quotationNumber) === String(quotationId)) &&
          String(q.customerId) === String(customerId)) {
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

    if (acceptedQuote) {
      storageService.saveQuotations(updated);
    }
    return { updatedList: updated, acceptedQuote };
  },

  declineQuotation: (customerId, quotationId, reason, currentQuotations = null) => {
    const list = currentQuotations || storageService.getQuotations();
    let declinedQuote = null;

    const updated = list.map(q => {
      if ((String(q.id) === String(quotationId) || String(q.quotationNumber) === String(quotationId)) &&
          String(q.customerId) === String(customerId)) {
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

    if (declinedQuote) {
      storageService.saveQuotations(updated);
    }
    return { updatedList: updated, declinedQuote };
  }
};
