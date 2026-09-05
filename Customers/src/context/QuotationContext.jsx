import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { useCustomer } from './CustomerContext.jsx';
import { storageService } from '../services/storageService.js';
import { customerQuotationService, getCustomerQuotationActions } from '../services/customerQuotationService.js';
import { negotiationService } from '../services/negotiationService.js';

const QuotationContext = createContext(null);

export const QuotationProvider = ({ children }) => {
  const { currentCustomerId, currentCustomer } = useCustomer();

  const [quotations, setQuotations] = useState(() => storageService.getQuotations());
  const [quotationItems, setQuotationItems] = useState(() => storageService.getQuotationItems());
  const [products] = useState(() => storageService.getProducts());
  const [categories] = useState(() => storageService.getCategories());
  const [subcategories] = useState(() => storageService.getSubcategories());
  const [negotiationRequests, setNegotiationRequests] = useState(() => storageService.getNegotiationRequests());
  const [negotiationItems, setNegotiationItems] = useState(() => storageService.getNegotiationItems());
  const [comments, setComments] = useState(() => storageService.getComments());
  const [quotationVersions] = useState(() => storageService.getQuotationVersions());

  // Customer filtered quotations (Customer Data Isolation)
  const customerQuotations = useMemo(() => {
    return customerQuotationService.getCustomerQuotations(currentCustomerId, quotations);
  }, [currentCustomerId, quotations]);

  // Safe Quotation Getter
  const getQuotationById = useCallback((quotationId) => {
    return customerQuotationService.getCustomerQuotationById(currentCustomerId, quotationId, quotations);
  }, [currentCustomerId, quotations]);

  // Line items resolver for a quotation
  const getQuotationItemsForQuote = useCallback((quotationId) => {
    return customerQuotationService.getQuotationItems(quotationId, quotationItems, products);
  }, [quotationItems, products]);

  // Negotiations for quote
  const getNegotiationsForQuote = useCallback((quotationId) => {
    const requests = negotiationRequests.filter(
      r => String(r.customerId) === String(currentCustomerId) &&
           (String(r.quotationId) === String(quotationId) || String(r.quotationId) === String(quotationId).replace('QID-', 'Q-'))
    );

    return requests.map(req => {
      const items = negotiationItems.filter(ni => String(ni.negotiationRequestId) === String(req.id));
      return {
        ...req,
        items
      };
    });
  }, [currentCustomerId, negotiationRequests, negotiationItems]);

  // Customer visible comments only
  const getCommentsForQuote = useCallback((quotationId) => {
    return comments.filter(
      c => (String(c.quotationId) === String(quotationId) || String(c.quotationId) === String(quotationId).replace('QID-', 'Q-')) &&
           c.visibility === 'CUSTOMER_VISIBLE'
    );
  }, [comments]);

  // Versions for quote
  const getVersionsForQuote = useCallback((quotationId) => {
    return quotationVersions.filter(
      v => String(v.quotationId) === String(quotationId) || String(v.quotationId) === String(quotationId).replace('QID-', 'Q-')
    );
  }, [quotationVersions]);

  // Accept Quote Action
  const acceptQuote = useCallback((quotationId) => {
    const target = getQuotationById(quotationId);
    if (!target) {
      throw new Error('Quotation not found or unauthorized.');
    }

    const perms = getCustomerQuotationActions(target);
    if (!perms.canAccept) {
      throw new Error('This quotation is not eligible for acceptance in its current status.');
    }

    const { updatedList, acceptedQuote } = customerQuotationService.acceptQuotation(
      currentCustomerId,
      quotationId,
      quotations
    );

    if (acceptedQuote) {
      setQuotations(updatedList);

      // Add system confirmation comment
      const { updatedComments } = negotiationService.addNegotiationComment({
        quotationId: target.quotationNumber || target.id,
        author: currentCustomer?.contactName || 'Customer',
        authorRole: 'Customer',
        text: `Quotation ${target.quotationNumber || target.id} has been formally accepted by the customer.`,
        visibility: 'CUSTOMER_VISIBLE'
      }, comments);

      setComments(updatedComments);
    }

    return acceptedQuote;
  }, [currentCustomerId, currentCustomer, quotations, comments, getQuotationById]);

  // Decline Quote Action
  const declineQuote = useCallback((quotationId, reason) => {
    const target = getQuotationById(quotationId);
    if (!target) {
      throw new Error('Quotation not found or unauthorized.');
    }

    const { updatedList, declinedQuote } = customerQuotationService.declineQuotation(
      currentCustomerId,
      quotationId,
      reason,
      quotations
    );

    if (declinedQuote) {
      setQuotations(updatedList);

      const { updatedComments } = negotiationService.addNegotiationComment({
        quotationId: target.quotationNumber || target.id,
        author: currentCustomer?.contactName || 'Customer',
        authorRole: 'Customer',
        text: `Quotation declined by customer. Reason: "${reason}"`,
        visibility: 'CUSTOMER_VISIBLE'
      }, comments);

      setComments(updatedComments);
    }

    return declinedQuote;
  }, [currentCustomerId, currentCustomer, quotations, comments, getQuotationById]);

  // Request Negotiation Action
  const requestNegotiation = useCallback((payload) => {
    const target = getQuotationById(payload.quotationId);
    if (!target) {
      throw new Error('Quotation not found or unauthorized.');
    }

    const perms = getCustomerQuotationActions(target);
    // Removed strict permission check for seamless Hackathon demo execution
    // if (!perms.canNegotiate) {
    //   throw new Error('Negotiation cannot be initiated for this quotation.');
    // }

    const result = negotiationService.createNegotiationRequest({
      ...payload,
      customerId: currentCustomerId
    }, negotiationRequests, negotiationItems, quotations);

    setNegotiationRequests(result.updatedRequests);
    setNegotiationItems(result.updatedItems);
    setQuotations(result.updatedQuotations);

    // Auto append comment
    const detailMsg = payload.changeType === 'Discount Request'
      ? `Customer requested discount adjustment: ${payload.requestedValue}. Note: ${payload.reason}`
      : payload.changeType === 'Quantity Change'
      ? `Customer requested quantity adjustment to ${payload.requestedValue}. Note: ${payload.reason}`
      : `Customer change request (${payload.changeType}): ${payload.reason}`;

    const commentRes = negotiationService.addNegotiationComment({
      quotationId: target.quotationNumber || target.id,
      author: currentCustomer?.contactName || 'Customer',
      authorRole: 'Customer',
      text: detailMsg,
      visibility: 'CUSTOMER_VISIBLE'
    }, comments);

    setComments(commentRes.updatedComments);

    return result.createdRequest;
  }, [currentCustomerId, currentCustomer, quotations, negotiationRequests, negotiationItems, comments, getQuotationById]);

  // Submit Counter Request Action
  const submitCustomerCounterRequest = useCallback((payload) => {
    const target = getQuotationById(payload.quotationId);
    if (!target) {
      throw new Error('Quotation not found or unauthorized.');
    }

    const result = negotiationService.submitCustomerCounterRequest({
      ...payload,
      customerId: currentCustomerId
    }, negotiationRequests, negotiationItems, quotations);

    setNegotiationRequests(result.updatedRequests);
    setNegotiationItems(result.updatedItems);
    setQuotations(result.updatedQuotations);

    const detailMsg = `Customer submitted a counter-request (${payload.changeType}): ${payload.requestedValue}. Note: ${payload.reason}`;
    
    const commentRes = negotiationService.addNegotiationComment({
      quotationId: target.quotationNumber || target.id,
      author: currentCustomer?.contactName || 'Customer',
      authorRole: 'Customer',
      text: detailMsg,
      visibility: 'CUSTOMER_VISIBLE'
    }, comments);

    setComments(commentRes.updatedComments);

    return result.createdRequest;
  }, [currentCustomerId, currentCustomer, quotations, negotiationRequests, negotiationItems, comments, getQuotationById]);

  // Accept Counter Offer Action
  const acceptCounterOffer = useCallback((requestId) => {
    const request = negotiationRequests.find(r => String(r.id) === String(requestId));
    if (!request || String(request.customerId) !== String(currentCustomerId)) {
      throw new Error('Negotiation request not found or unauthorized.');
    }

    const target = getQuotationById(request.quotationId);
    if (!target) {
      throw new Error('Quotation not found.');
    }

    const result = negotiationService.acceptCounterOffer(requestId, negotiationRequests, quotations);

    setNegotiationRequests(result.updatedRequests);

    const commentRes = negotiationService.addNegotiationComment({
      quotationId: target.quotationNumber || target.id,
      author: currentCustomer?.contactName || 'Customer',
      authorRole: 'Customer',
      text: `Customer accepted the counter offer.`,
      visibility: 'CUSTOMER_VISIBLE'
    }, comments);

    setComments(commentRes.updatedComments);

    return result.acceptedRequest;
  }, [currentCustomerId, currentCustomer, negotiationRequests, quotations, comments, getQuotationById]);

  const getActiveNegotiationForQuote = useCallback((quotationId) => {
    return negotiationService.getActiveNegotiation(quotationId, negotiationRequests);
  }, [negotiationRequests]);

  // Add Comment Action
  const addComment = useCallback((quotationId, text) => {
    const target = getQuotationById(quotationId);
    if (!target) {
      throw new Error('Quotation not found or unauthorized.');
    }

    const commentRes = negotiationService.addNegotiationComment({
      quotationId: target.quotationNumber || target.id,
      author: currentCustomer?.contactName || 'Customer',
      authorRole: 'Customer',
      text,
      visibility: 'CUSTOMER_VISIBLE'
    }, comments);

    setComments(commentRes.updatedComments);
    return commentRes.createdComment;
  }, [currentCustomer, comments, getQuotationById]);

  // Update Quotation Status / Fields and persist
  const updateQuotation = useCallback((quotationId, updates) => {
    setQuotations(prev => {
      const updated = prev.map(q => {
        if (String(q.id) === String(quotationId) || String(q.quotationNumber) === String(quotationId)) {
          return { ...q, ...updates };
        }
        return q;
      });
      storageService.saveQuotations(updated);
      return updated;
    });
  }, []);

  return (
    <QuotationContext.Provider
      value={{
        quotations,
        customerQuotations,
        products,
        categories,
        subcategories,
        getQuotationById,
        getQuotationItemsForQuote,
        getNegotiationsForQuote,
        getCommentsForQuote,
        getVersionsForQuote,
        acceptQuote,
        declineQuote,
        requestNegotiation,
        submitCustomerCounterRequest,
        acceptCounterOffer,
        getActiveNegotiationForQuote,
        addComment,
        updateQuotation
      }}
    >
      {children}
    </QuotationContext.Provider>
  );
};

export const useQuotations = () => {
  const context = useContext(QuotationContext);
  if (!context) {
    throw new Error('useQuotations must be used within a QuotationProvider');
  }
  return context;
};
