import { storageService } from './storageService.js';

export const negotiationService = {
  createNegotiationRequest: ({
    quotationId,
    customerId,
    quotationItemId,
    changeType,
    currentValue,
    requestedValue,
    reason
  }, currentRequests = null, currentItems = null, currentQuotations = null) => {
    const requests = currentRequests || storageService.getNegotiationRequests();
    const items = currentItems || storageService.getNegotiationItems();
    const quotations = currentQuotations || storageService.getQuotations();

    // Determine round number by counting existing requests for this quote
    const existingRequests = requests.filter(r => String(r.quotationId) === String(quotationId));
    const roundNumber = existingRequests.length + 1;

    const newRequestId = `NEG-${Date.now().toString().slice(-4)}`;
    const newRequest = {
      id: newRequestId,
      quotationId,
      customerId,
      roundNumber,
      status: 'PENDING',
      requestedAt: new Date().toISOString(),
      reason,
      createdBy: 'CUSTOMER'
    };

    const newItems = [...items];
    if (quotationItemId) {
      newItems.push({
        id: `NEGI-${Date.now().toString().slice(-4)}`,
        negotiationRequestId: newRequestId,
        quotationItemId,
        changeType: changeType || 'Quantity Change',
        currentValue: String(currentValue || ''),
        requestedValue: String(requestedValue || '')
      });
    }

    // Update quotation status in state to UNDER_NEGOTIATION
    const updatedQuotations = quotations.map(q => {
      if (String(q.id) === String(quotationId) || String(q.quotationNumber) === String(quotationId)) {
        return {
          ...q,
          status: 'UNDER_NEGOTIATION',
          updatedAt: new Date().toISOString()
        };
      }
      return q;
    });

    const updatedRequests = [newRequest, ...requests];

    storageService.saveNegotiationRequests(updatedRequests);
    storageService.saveNegotiationItems(newItems);
    storageService.saveQuotations(updatedQuotations);

    return {
      updatedRequests,
      updatedItems: newItems,
      updatedQuotations,
      createdRequest: newRequest
    };
  },

  getNegotiationRequests: (customerId, quotationId = null, requestsList = null) => {
    const list = requestsList || storageService.getNegotiationRequests();
    return list.filter(r => {
      const matchCustomer = String(r.customerId) === String(customerId);
      if (!matchCustomer) return false;
      if (quotationId) {
        return String(r.quotationId) === String(quotationId);
      }
      return true;
    });
  },

  getActiveNegotiation: (quotationId, requestsList = null) => {
    const list = requestsList || storageService.getNegotiationRequests();
    const quoteRequests = list.filter(r => String(r.quotationId) === String(quotationId));
    
    // Sort by roundNumber descending or created date
    quoteRequests.sort((a, b) => (b.roundNumber || 0) - (a.roundNumber || 0));
    
    const latest = quoteRequests[0];
    if (latest && (latest.status === 'PENDING' || latest.status === 'COUNTER_OFFER')) {
      return latest;
    }
    return null;
  },

  getNegotiationActions: (negotiation) => {
    if (!negotiation) {
       return {
         canRequest: true,
         canAcceptCounter: false,
         canRequestAnotherChange: false,
         canCancel: false,
         canComment: false
       };
    }
    
    switch (negotiation.status) {
      case 'PENDING':
        return {
          canRequest: false,
          canAcceptCounter: false,
          canRequestAnotherChange: false,
          canCancel: true,
          canComment: true
        };
      case 'COUNTER_OFFER':
        return {
          canRequest: false,
          canAcceptCounter: true,
          canRequestAnotherChange: true,
          canCancel: false,
          canComment: true
        };
      case 'ACCEPTED':
        return {
          canRequest: false,
          canAcceptCounter: false,
          canRequestAnotherChange: false,
          canCancel: false,
          canComment: true
        };
      case 'REJECTED':
        return {
          canRequest: false,
          canAcceptCounter: false,
          canRequestAnotherChange: true,
          canCancel: false,
          canComment: true
        };
      default:
         return {
           canRequest: true,
           canAcceptCounter: false,
           canRequestAnotherChange: false,
           canCancel: false,
           canComment: true
         };
    }
  },

  submitCustomerCounterRequest: (payload, currentRequests = null, currentItems = null, currentQuotations = null) => {
    return negotiationService.createNegotiationRequest(payload, currentRequests, currentItems, currentQuotations);
  },

  acceptCounterOffer: (requestId, currentRequests = null, currentQuotations = null) => {
    const requests = currentRequests || storageService.getNegotiationRequests();
    const quotations = currentQuotations || storageService.getQuotations();

    let acceptedRequest = null;

    const updatedRequests = requests.map(r => {
      if (String(r.id) === String(requestId)) {
        acceptedRequest = {
          ...r,
          status: 'ACCEPTED',
          respondedAt: new Date().toISOString()
        };
        return acceptedRequest;
      }
      return r;
    });

    if (!acceptedRequest) {
      throw new Error("Negotiation request not found");
    }

    storageService.saveNegotiationRequests(updatedRequests);
    
    return {
      updatedRequests,
      acceptedRequest
    };
  },

  addNegotiationComment: ({
    quotationId,
    author = 'Customer',
    authorRole = 'Customer',
    text,
    visibility = 'CUSTOMER_VISIBLE'
  }, currentComments = null) => {
    const comments = currentComments || storageService.getComments();
    const newComment = {
      id: `CMT-${Date.now().toString().slice(-4)}`,
      quotationId,
      author,
      authorRole,
      text,
      createdAt: new Date().toISOString(),
      visibility
    };

    const updatedComments = [...comments, newComment];
    storageService.saveComments(updatedComments);

    return {
      updatedComments,
      createdComment: newComment
    };
  }
};
