import React, { createContext, useContext, useReducer } from 'react';
import { dataService } from '../services/dataService.js';
import {
  calculateQuotationTotals,
  calculateItemTotal,
  assessDealHealth,
  stageToStatus,
} from '../utils/quotationCalculations.js';
import { evaluateQuotationApproval } from '../data/approvalRules.js';
import { getCustomerTierById } from '../data/customerTiers.js';

// ─── Initial State from JSON files via dataService (NO localStorage) ─────────
const loadInitialState = () => {
  return dataService.getInitialQuotations();
};

// ─── Reducer with strictly immutable operations ───────────────────────
const quotationReducer = (state, action) => {
  switch (action.type) {
    case 'ADD':
      return dataService.createImmutableQuotation(state, action.payload);

    case 'UPDATE':
      return dataService.updateImmutableQuotation(state, action.id, action.updates);

    case 'DELETE':
      return dataService.deleteImmutableQuotation(state, action.id);

    case 'ARCHIVE':
      return dataService.updateImmutableQuotation(state, action.id, {
        isArchived: true,
        activityNote: `Quotation archived`
      });

    case 'RESTORE':
      return dataService.updateImmutableQuotation(state, action.id, {
        isArchived: false,
        activityNote: `Quotation restored to active status`
      });

    case 'RESET':
      return dataService.getInitialQuotations();

    default:
      return state;
  }
};

// ─── Context ───────────────────────────────────────────────────────
const QuotationContext = createContext(null);

export const QuotationProvider = ({ children }) => {
  // Pure React state manages runtime modifications, synced to localStorage
  const [allQuotations, dispatch] = useReducer(quotationReducer, null, loadInitialState);

  // Sync to localStorage on change
  React.useEffect(() => {
    if (allQuotations) {
      localStorage.setItem('dealflow_quotations', JSON.stringify(allQuotations));
    }
  }, [allQuotations]);

  // Active / archived views
  const quotations = allQuotations.filter((q) => !q.isArchived);
  const archivedQuotations = allQuotations.filter((q) => q.isArchived);

  // ── CREATE ──────────────────────────────────────────────────────
  const addQuotation = (formData) => {
    const items = (formData.items || []).map((it, idx) => ({
      ...it,
      id: it.id || `QI-${Date.now()}-${idx}`,
      quantity: Number(it.quantity) || 0,
      unitPrice: Number(it.unitPrice) || 0,
      costPrice: Number(it.costPrice) || Math.round((Number(it.unitPrice) || 0) * 0.55),
      total: calculateItemTotal(it.quantity, it.unitPrice),
    }));

    const totals = calculateQuotationTotals(items, formData.discount, 18, formData.customerTierId);
    const { health, riskScore } = assessDealHealth(totals.discount, totals.margin);
    const stage = formData.stage || 'draft';

    const tier = formData.customerTierId ? getCustomerTierById(formData.customerTierId) : null;
    const approvalEval = evaluateQuotationApproval({ ...formData, ...totals }, tier);

    
    const nums = allQuotations.map(q => {
      const m = (q.quotationNumber || '').replace(/[^0-9]/g, '');
      return m ? parseInt(m, 10) : 1000;
    });
    const nextNum = Math.max(...nums, 1004) + 1;
    const newId = `QID-${String(nextNum).padStart(3, '0')}`;
    const newNumber = `Q-${nextNum}`;

    const payload = {
      ...formData,
      id: newId,
      quotationNumber: newNumber,
      stage,
      status: stageToStatus(stage),
      health: formData.health || health,
      riskScore: formData.riskScore ?? riskScore,
      currency: formData.currency || 'INR',
      ...totals,
      approvalStatus: approvalEval.isApprovalRequired ? 'PENDING_APPROVAL' : 'NOT_REQUIRED',
      approvalDetails: {
        required: approvalEval.isApprovalRequired,
        level: approvalEval.requiredLevel,
        routingRole: approvalEval.routingRole,
        reason: approvalEval.primaryReason
      },
      validUntil: formData.validUntil || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      paymentTerms: formData.paymentTerms || (tier ? tier.defaultPaymentTerms : 'Net 30'),
      isArchived: false,
      items: totals.items
    };

    dispatch({ type: 'ADD', payload });
    return payload;
  };

  // ── READ (supports both internal id and quotationNumber) ──────────
  const getQuotationById = (lookupKey) => {
    if (!lookupKey) return null;
    const cleanKey = String(lookupKey).trim().toLowerCase();
    return allQuotations.find(
      (q) => (q.id && q.id.toLowerCase() === cleanKey) || 
             (q.quotationNumber && q.quotationNumber.toLowerCase() === cleanKey)
    ) || null;
  };

  // ── UPDATE ───────────────────────────────────────────────────────
  const updateQuotation = (idOrNum, updates) => {
    const existing = getQuotationById(idOrNum);
    if (!existing) return null;

    const items = updates.items !== undefined ? updates.items : existing.items;
    const discount = updates.discount !== undefined ? updates.discount : existing.discount;
    const taxRate = updates.taxRate !== undefined ? updates.taxRate : existing.taxRate;
    const customerTierId = updates.customerTierId || existing.customerTierId;

    const totals = calculateQuotationTotals(items, discount, taxRate, customerTierId);
    const { health, riskScore } = assessDealHealth(totals.discount, totals.margin);
    const tier = customerTierId ? getCustomerTierById(customerTierId) : null;
    const approvalEval = evaluateQuotationApproval({ ...existing, ...updates, ...totals }, tier);

    const preparedUpdates = {
      ...updates,
      items: totals.items,
      ...totals,
      health: updates.health || health,
      riskScore: updates.riskScore ?? riskScore,
      approvalStatus: approvalEval.isApprovalRequired ? 'PENDING_APPROVAL' : 'NOT_REQUIRED',
      approvalDetails: {
        required: approvalEval.isApprovalRequired,
        level: approvalEval.requiredLevel,
        routingRole: approvalEval.routingRole,
        reason: approvalEval.primaryReason
      }
    };

    dispatch({ type: 'UPDATE', id: existing.id, updates: preparedUpdates });
    return { ...existing, ...preparedUpdates };
  };

  // ── DELETE ───────────────────────────────────────────────────────
  const deleteQuotation = (id) => {
    dispatch({ type: 'DELETE', id });
  };

  // ── DUPLICATE ────────────────────────────────────────────────────
  const duplicateQuotation = (id) => {
    const original = getQuotationById(id);
    if (!original) return null;

    const dupPayload = {
      ...original,
      stage: 'draft',
      status: 'Draft',
      health: 'Healthy',
      riskScore: 15,
      isArchived: false,
      notes: `Duplicated from ${original.quotationNumber || original.id}. ${original.notes || ''}`.trim()
    };

    delete dupPayload.id;
    delete dupPayload.quotationNumber;

    dispatch({ type: 'ADD', payload: dupPayload });
    return dupPayload;
  };

  // ── ARCHIVE / RESTORE ────────────────────────────────────────────
  const archiveQuotation = (id) => dispatch({ type: 'ARCHIVE', id });
  const restoreQuotation = (id) => dispatch({ type: 'RESTORE', id });

  // ── SEARCH ───────────────────────────────────────────────────────
  const searchQuotations = (query = '', currentRepOnly = false, currentRepId = 'USR-001') => {
    let list = currentRepOnly ? quotations.filter(q => q.salesRepId === currentRepId) : quotations;
    const q = query.toLowerCase().trim();
    if (!q) return list;
    return list.filter(
      (item) =>
        (item.id || '').toLowerCase().includes(q) ||
        (item.quotationNumber || '').toLowerCase().includes(q) ||
        (item.customerName || '').toLowerCase().includes(q) ||
        (item.salesRepName || '').toLowerCase().includes(q) ||
        (item.notes || '').toLowerCase().includes(q)
    );
  };

  // ── FILTER ───────────────────────────────────────────────────────
  const filterQuotations = (filters = {}, currentRepOnly = false, currentRepId = 'USR-001') => {
    let list = currentRepOnly ? quotations.filter(q => q.salesRepId === currentRepId) : [...quotations];
    if (filters.stage && filters.stage !== 'all') list = list.filter((q) => q.stage === filters.stage);
    if (filters.health && filters.health !== 'all')
      list = list.filter((q) => (q.health || '').toLowerCase() === filters.health.toLowerCase());
    if (filters.customerId && filters.customerId !== 'all')
      list = list.filter((q) => q.customerId === filters.customerId);
    if (filters.tierId && filters.tierId !== 'all')
      list = list.filter((q) => q.customerTierId === filters.tierId);
    return list;
  };

  // ── SORT ─────────────────────────────────────────────────────────
  const sortQuotations = (list, sortBy = 'newest') => {
    return [...list].sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'highest_value':
          return (b.total || 0) - (a.total || 0);
        case 'lowest_value':
          return (a.total || 0) - (b.total || 0);
        case 'highest_margin':
          return (b.margin || 0) - (a.margin || 0);
        case 'customer_az':
          return (a.customerName || '').localeCompare(b.customerName || '');
        case 'newest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
  };

  // ── STAGE MOVEMENT ───────────────────────────────────────────────
  const moveQuotationStage = (id, newStage, reason = '') => {
    const target = getQuotationById(id);
    if (!target) return { success: false, error: 'Quotation not found.' };
    if (target.stage === newStage) return { success: true, quote: target };

    // Business rule: Draft → Confirmed is blocked directly
    if (target.stage === 'draft' && newStage === 'confirmed') {
      return {
        success: false,
        error: 'Direct transition from Draft to Confirmed is blocked. Complete Pending Approval or Negotiation first.',
      };
    }

    const stageNames = {
      draft: 'Draft',
      pending_approval: 'Pending Approval',
      approved: 'Approved',
      returned_for_revision: 'Returned for Revision',
      rejected: 'Rejected',
      negotiation: 'Negotiation',
      confirmed: 'Confirmed',
    };

    const activityNote = reason
      ? `Stage changed: ${stageNames[target.stage] || target.stage} → ${stageNames[newStage] || newStage} (${reason})`
      : `Moved to ${stageNames[newStage] || newStage}`;

    const updated = updateQuotation(target.id, {
      stage: newStage,
      status: stageToStatus(newStage),
      activityNote,
    });

    return { success: true, quote: updated };
  };

  // ── DIRECT STAGE SETTER (for approval-driven transitions) ─────────
  // Bypasses business-rule guard — use only when triggered by approval actions.
  const setQuotationStage = (id, newStage, approvalStatus = null, activityNote = '') => {
    const target = getQuotationById(id);
    if (!target) return null;

    const statusMap = {
      draft: 'Draft',
      pending_approval: 'Pending Approval',
      approved: 'Approved',
      returned_for_revision: 'Returned for Revision',
      rejected: 'Rejected',
      negotiation: 'Negotiation',
      confirmed: 'Confirmed',
      cancelled: 'Cancelled',
    };

    const updates = {
      stage: newStage,
      status: statusMap[newStage] || newStage,
      activityNote: activityNote || `Stage set to ${statusMap[newStage] || newStage}`,
    };
    if (approvalStatus !== null) {
      updates.approvalStatus = approvalStatus;
    }

    return updateQuotation(target.id, updates);
  };

  // ── PIPELINE METRICS ─────────────────────────────────────────────
  const getPipelineMetrics = (repId = null) => {
    const scope = repId ? quotations.filter(q => q.salesRepId === repId) : quotations;
    const active = scope.filter((q) => q.stage !== 'confirmed');
    const confirmed = scope.filter((q) => q.stage === 'confirmed');
    const negotiation = scope.filter((q) => q.stage === 'negotiation');
    const pending = scope.filter((q) => q.stage === 'pending_approval');
    const draft = scope.filter((q) => q.stage === 'draft');

    const totalRevenue = scope.reduce((s, q) => s + (q.total || 0), 0);
    const totalProfit = scope.reduce((s, q) => s + (q.grossProfit || 0), 0);
    const avgMargin = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 1000) / 10 : 0;

    return {
      totalPipelineValue: active.reduce((s, q) => s + (q.total || 0), 0),
      activeDealsCount: active.length,
      negotiationValue: negotiation.reduce((s, q) => s + (q.total || 0), 0),
      confirmedValue: confirmed.reduce((s, q) => s + (q.total || 0), 0),
      winRate: scope.length ? Math.round((confirmed.length / scope.length) * 1000) / 10 : 0,
      avgMargin,
      totalQuotesCount: scope.length,
      draftCount: draft.length,
      pendingCount: pending.length,
      negotiationCount: negotiation.length,
      confirmedCount: confirmed.length,
      healthyCount: scope.filter((q) => (q.health || '').toLowerCase() === 'healthy').length,
      atRiskCount: scope.filter((q) => (q.health || '').toLowerCase() === 'at risk').length,
      criticalCount: scope.filter((q) => (q.health || '').toLowerCase() === 'critical').length,
    };
  };

  // ── RESET TO JSON DATA ────────────────────────────────────────────
  const resetToDefaultQuotations = () => {
    dispatch({ type: 'RESET' });
  };

  return (
    <QuotationContext.Provider
      value={{
        quotations,
        archivedQuotations,
        allQuotations,
        addQuotation,
        getQuotationById,
        updateQuotation,
        deleteQuotation,
        duplicateQuotation,
        archiveQuotation,
        restoreQuotation,
        searchQuotations,
        filterQuotations,
        sortQuotations,
        moveQuotationStage,
        setQuotationStage,
        getPipelineMetrics,
        calculateQuoteTotals: calculateQuotationTotals,
        resetToDefaultQuotations,
      }}
    >
      {children}
    </QuotationContext.Provider>
  );
};

export const useQuotations = () => {
  const ctx = useContext(QuotationContext);
  if (!ctx) throw new Error('useQuotations must be used inside QuotationProvider');
  return ctx;
};

export const useQuotation = useQuotations;
export const calculateQuoteTotals = calculateQuotationTotals;
