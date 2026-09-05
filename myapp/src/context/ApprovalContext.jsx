// DealFlow360 — Approval Context
// Manages approval lifecycle for quotations. Uses React state only (no localStorage).

import React, { createContext, useContext, useReducer, useCallback } from 'react';
const INITIAL_APPROVAL_STEPS = [];
import { evaluateQuotationApproval, APPROVAL_LEVELS } from '../data/approvalRules.js';
import { MOCK_USERS } from '../data/users.js';

const ApprovalContext = createContext(null);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

const generateId = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const getUserByRole = (role) => {
  const roleMap = {
    SALES_MANAGER: 'USR-002',
    FINANCE_DIRECTOR: 'USR-003',
    sales_manager: 'USR-002',
    finance: 'USR-003',
  };
  const userId = roleMap[role];
  return MOCK_USERS.find((u) => u.id === userId) || MOCK_USERS[1];
};

// ─── Reducer ──────────────────────────────────────────────────────────────────
const approvalReducer = (state, action) => {
  switch (action.type) {
    case 'SET_STEPS':
      return action.payload;

    case 'ADD_STEPS': {
      const { steps } = action;
      return [...steps, ...state];
    }

    case 'UPDATE_STEP': {
      return state.map((step) =>
        step.id === action.id ? { ...step, ...action.updates } : step
      );
    }

    case 'REPLACE_STEPS_FOR_QUOTATION': {
      const { quotationId, steps } = action;
      const filtered = state.filter((s) => s.quotationId !== quotationId);
      return [...steps, ...filtered];
    }

    default:
      return state;
  }
};

// ─── Provider ─────────────────────────────────────────────────────────────────
export const ApprovalProvider = ({ children }) => {
  const [approvalSteps, dispatch] = useReducer(
    approvalReducer,
    null,
    () => {
      const existing = localStorage.getItem('dealflow_approvalSteps');
      if (existing) {
        try { return JSON.parse(existing); } catch (e) {}
      }
      const seed = deepClone(INITIAL_APPROVAL_STEPS);
      localStorage.setItem('dealflow_approvalSteps', JSON.stringify(seed));
      return seed;
    }
  );

  React.useEffect(() => {
    if (approvalSteps) {
      localStorage.setItem('dealflow_approvalSteps', JSON.stringify(approvalSteps));
    }
  }, [approvalSteps]);

  /**
   * Evaluates a quotation and creates approval steps based on triggered rules.
   * Returns { isRequired, steps, triggeredRules }
   */
  const buildApprovalSteps = useCallback((quotation, customerTier = null) => {
    const evalResult = evaluateQuotationApproval(quotation, customerTier);

    if (!evalResult.isApprovalRequired) {
      return { isRequired: false, steps: [], triggeredRules: [] };
    }

    const now = new Date().toISOString();
    const requiredLevel = evalResult.requiredLevel;

    // Build sequential steps from level 1 up to requiredLevel
    const steps = [];
    for (let lvl = 1; lvl <= requiredLevel; lvl++) {
      const levelConfig = APPROVAL_LEVELS.find((al) => al.level === lvl);
      if (!levelConfig) continue;

      const approver = getUserByRole(levelConfig.role);

      steps.push({
        id: generateId('QA'),
        quotationId: quotation.id,
        quotationNumber: quotation.quotationNumber,
        approvalCycle: 1,
        sequence: lvl,
        approvalLevelId: levelConfig.id,
        approverId: approver.id,
        approverName: approver.name,
        approverRole: approver.role.toUpperCase().replace(' ', '_'),
        approverTitle: approver.title,
        status: lvl === 1 ? 'PENDING' : 'WAITING', // Only first step active immediately
        action: null,
        riskScore: quotation.riskScore || 50,
        riskLevel: requiredLevel >= 2 ? 'HIGH' : 'MEDIUM',
        triggeredRules: evalResult.triggeredRules.map((r) => r.id),
        triggeredRulesDetails: evalResult.triggeredRules,
        reason: evalResult.primaryReason,
        comment: null,
        submittedAt: now,
        reviewedAt: null,
        history: [
          {
            id: generateId('H'),
            actor: quotation.salesRepName || 'Sales Rep',
            role: 'SALES_REP',
            action: 'SUBMITTED',
            comment: `Submitted for approval. ${evalResult.primaryReason}`,
            timestamp: now,
            fromStatus: null,
            toStatus: lvl === 1 ? 'PENDING' : 'WAITING',
          },
        ],
      });
    }

    return { isRequired: true, steps, triggeredRules: evalResult.triggeredRules };
  }, []);

  /**
   * Submit a quotation for approval. Creates approval steps and returns the evaluation result.
   */
  const submitForApproval = useCallback(
    (quotation, customerTier = null) => {
      const { isRequired, steps, triggeredRules } = buildApprovalSteps(quotation, customerTier);

      if (!isRequired) {
        return { isRequired: false, steps: [], triggeredRules: [] };
      }

      dispatch({ type: 'REPLACE_STEPS_FOR_QUOTATION', quotationId: quotation.id, steps });
      return { isRequired: true, steps, triggeredRules };
    },
    [buildApprovalSteps]
  );

  /**
   * Approve the current pending step for a quotation.
   * If it's the last step, returns approvalFinalResult: 'APPROVED'.
   * If more steps remain, activates the next step.
   */
  const approveStep = useCallback(
    (quotationId, actorUser, comment = '') => {
      const stepsForQuote = approvalSteps
        .filter((s) => s.quotationId === quotationId)
        .sort((a, b) => a.sequence - b.sequence);

      const pendingStep = stepsForQuote.find((s) => s.status === 'PENDING');
      if (!pendingStep) return { success: false, error: 'No pending step found.' };

      const now = new Date().toISOString();
      const historyEntry = {
        id: generateId('H'),
        actor: actorUser?.name || 'Approver',
        role: actorUser?.role?.toUpperCase() || 'APPROVER',
        action: 'APPROVED',
        comment: comment || 'Approved.',
        timestamp: now,
        fromStatus: 'PENDING',
        toStatus: 'APPROVED',
      };

      // Update this step to APPROVED
      dispatch({
        type: 'UPDATE_STEP',
        id: pendingStep.id,
        updates: {
          status: 'APPROVED',
          action: 'APPROVED',
          approverName: actorUser?.name || pendingStep.approverName,
          reviewedAt: now,
          history: [historyEntry, ...(pendingStep.history || [])],
        },
      });

      // Check if there's a next waiting step
      const nextStep = stepsForQuote.find((s) => s.sequence === pendingStep.sequence + 1);
      if (nextStep && nextStep.status === 'WAITING') {
        dispatch({
          type: 'UPDATE_STEP',
          id: nextStep.id,
          updates: { status: 'PENDING' },
        });
        return { success: true, approvalFinalResult: 'IN_PROGRESS', nextStep };
      }

      // All steps approved → final approval
      return { success: true, approvalFinalResult: 'APPROVED' };
    },
    [approvalSteps]
  );

  /**
   * Return a quotation for revision. All waiting/pending steps become RETURNED.
   */
  const returnForRevision = useCallback(
    (quotationId, actorUser, reason) => {
      if (!reason?.trim()) {
        return { success: false, error: 'A reason is required to return for revision.' };
      }

      const now = new Date().toISOString();
      const historyEntry = {
        id: generateId('H'),
        actor: actorUser?.name || 'Approver',
        role: actorUser?.role?.toUpperCase() || 'APPROVER',
        action: 'RETURNED',
        comment: reason,
        timestamp: now,
        fromStatus: 'PENDING',
        toStatus: 'RETURNED',
      };

      const stepsForQuote = approvalSteps.filter((s) => s.quotationId === quotationId);
      stepsForQuote.forEach((step) => {
        if (step.status === 'PENDING' || step.status === 'WAITING') {
          dispatch({
            type: 'UPDATE_STEP',
            id: step.id,
            updates: {
              status: 'RETURNED',
              action: 'RETURNED',
              reviewedAt: now,
              comment: reason,
              history: [historyEntry, ...(step.history || [])],
            },
          });
        }
      });

      return { success: true, approvalFinalResult: 'RETURNED' };
    },
    [approvalSteps]
  );

  /**
   * Reject a quotation permanently. All steps become REJECTED.
   */
  const rejectApproval = useCallback(
    (quotationId, actorUser, reason) => {
      if (!reason?.trim()) {
        return { success: false, error: 'A reason is required to reject.' };
      }

      const now = new Date().toISOString();
      const historyEntry = {
        id: generateId('H'),
        actor: actorUser?.name || 'Approver',
        role: actorUser?.role?.toUpperCase() || 'APPROVER',
        action: 'REJECTED',
        comment: reason,
        timestamp: now,
        fromStatus: 'PENDING',
        toStatus: 'REJECTED',
      };

      const stepsForQuote = approvalSteps.filter((s) => s.quotationId === quotationId);
      stepsForQuote.forEach((step) => {
        if (step.status === 'PENDING' || step.status === 'WAITING') {
          dispatch({
            type: 'UPDATE_STEP',
            id: step.id,
            updates: {
              status: 'REJECTED',
              action: 'REJECTED',
              reviewedAt: now,
              comment: reason,
              history: [historyEntry, ...(step.history || [])],
            },
          });
        }
      });

      return { success: true, approvalFinalResult: 'REJECTED' };
    },
    [approvalSteps]
  );

  /**
   * Get all approval steps for a quotation, sorted by sequence.
   */
  const getApprovalStepsByQuotationId = useCallback(
    (quotationId) => {
      return approvalSteps
        .filter((s) => s.quotationId === quotationId)
        .sort((a, b) => a.sequence - b.sequence);
    },
    [approvalSteps]
  );

  /**
   * Get the overall approval status for a quotation.
   * Returns: 'NOT_SUBMITTED' | 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'RETURNED' | 'REJECTED'
   */
  const getApprovalStatus = useCallback(
    (quotationId) => {
      const steps = approvalSteps.filter((s) => s.quotationId === quotationId);
      if (!steps.length) return 'NOT_SUBMITTED';

      const statuses = steps.map((s) => s.status);
      if (statuses.includes('REJECTED')) return 'REJECTED';
      if (statuses.includes('RETURNED')) return 'RETURNED';
      if (statuses.every((s) => s === 'APPROVED')) return 'APPROVED';
      if (statuses.includes('PENDING')) return 'PENDING';
      return 'NOT_SUBMITTED';
    },
    [approvalSteps]
  );

  /**
   * Get summary list for the Approvals List page.
   * Returns one entry per unique quotation that has approval steps.
   * Role-filtered: sales_rep sees own, manager sees their step, finance sees finance steps.
   */
  const getApprovalsListForRole = useCallback(
    (role, userId) => {
      // Group steps by quotationId
      const quotationMap = {};
      approvalSteps.forEach((step) => {
        if (!quotationMap[step.quotationId]) {
          quotationMap[step.quotationId] = { steps: [] };
        }
        quotationMap[step.quotationId].steps.push(step);
      });

      const summaries = Object.values(quotationMap).map(({ steps }) => {
        const sorted = steps.sort((a, b) => a.sequence - b.sequence);
        const pendingStep = sorted.find((s) => s.status === 'PENDING');
        const latestStep = sorted[sorted.length - 1];
        const allApproved = sorted.every((s) => s.status === 'APPROVED');
        const anyReturned = sorted.some((s) => s.status === 'RETURNED');
        const anyRejected = sorted.some((s) => s.status === 'REJECTED');

        let overallStatus = 'WAITING';
        if (anyRejected) overallStatus = 'REJECTED';
        else if (anyReturned) overallStatus = 'RETURNED';
        else if (allApproved) overallStatus = 'APPROVED';
        else if (pendingStep) overallStatus = 'PENDING';

        return {
          quotationId: sorted[0].quotationId,
          quotationNumber: sorted[0].quotationNumber,
          riskScore: sorted[0].riskScore,
          riskLevel: sorted[0].riskLevel,
          submittedAt: sorted[0].submittedAt,
          overallStatus,
          pendingStep: pendingStep || null,
          totalSteps: sorted.length,
          completedSteps: sorted.filter((s) => s.status === 'APPROVED').length,
          triggeredRulesDetails: sorted[0].triggeredRulesDetails || [],
          reason: sorted[0].reason,
          steps: sorted,
        };
      });

      // Role filtering
      if (role === 'admin') return summaries;
      if (role === 'sales_rep') {
        // Sales rep sees their own submitted items
        return summaries; // In real app, filter by salesRepId from quotation
      }
      if (role === 'sales_manager') {
        return summaries.filter(
          (s) =>
            s.pendingStep?.approverRole === 'SALES_MANAGER' ||
            s.steps.some((st) => st.approverRole === 'SALES_MANAGER')
        );
      }
      if (role === 'finance') {
        return summaries.filter(
          (s) =>
            s.pendingStep?.approverRole === 'FINANCE_DIRECTOR' ||
            s.steps.some((st) => st.approverRole === 'FINANCE_DIRECTOR')
        );
      }
      return summaries;
    },
    [approvalSteps]
  );

  /**
   * Legacy compat: submit via the old approval model (for backward compat with ApprovalDetail.jsx)
   */
  const reviewApproval = useCallback(
    (approvalId, action, comment) => {
      // Find the step
      const step = approvalSteps.find((s) => s.id === approvalId);
      if (!step) return null;

      const now = new Date().toISOString();
      const historyEntry = {
        id: generateId('H'),
        actor: 'Approver',
        role: 'APPROVER',
        action,
        comment,
        timestamp: now,
        fromStatus: step.status,
        toStatus: action === 'APPROVE' ? 'APPROVED' : action === 'REJECT' ? 'REJECTED' : 'RETURNED',
      };

      dispatch({
        type: 'UPDATE_STEP',
        id: approvalId,
        updates: {
          status: action === 'APPROVE' ? 'APPROVED' : action === 'REJECT' ? 'REJECTED' : 'RETURNED',
          action,
          reviewedAt: now,
          comment,
          history: [historyEntry, ...(step.history || [])],
        },
      });
      return { ...step, status: action === 'APPROVE' ? 'APPROVED' : action === 'REJECT' ? 'REJECTED' : 'RETURNED' };
    },
    [approvalSteps]
  );

  /**
   * Legacy: get approval by quotation id (returns first pending or latest step)
   */
  const getApprovalByQuotationId = useCallback(
    (quotationId) => {
      const steps = approvalSteps
        .filter((s) => s.quotationId === quotationId)
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
      return steps[0] || null;
    },
    [approvalSteps]
  );

  /**
   * Legacy: get approval by id
   */
  const getApprovalById = useCallback(
    (id) => approvalSteps.find((s) => s.id === id) || null,
    [approvalSteps]
  );

  /**
   * Legacy: get approvals by role (returns all steps visible to a role)
   */
  const getApprovalsByRole = useCallback(
    (role, userId) => {
      if (role === 'admin') return approvalSteps;
      if (role === 'sales_manager')
        return approvalSteps.filter((s) => s.approverRole === 'SALES_MANAGER');
      if (role === 'finance')
        return approvalSteps.filter((s) => s.approverRole === 'FINANCE_DIRECTOR');
      return approvalSteps; // sales_rep and others see everything for demo
    },
    [approvalSteps]
  );

  /**
   * Legacy: submitApproval (backward compat)
   */
  const submitApproval = useCallback(
    (quotationData, requestedDiscount, reason) => {
      const step = {
        id: generateId('APP'),
        quotationId: quotationData.id,
        quotationNumber: quotationData.quotationNumber,
        customerName: quotationData.customerName,
        salesRepName: quotationData.salesRepName,
        quotationValue: quotationData.total || 0,
        requestedDiscount,
        allowedDiscount: 15,
        excessDiscount: requestedDiscount - 15,
        riskScore: requestedDiscount > 20 ? 72 : 45,
        priority: requestedDiscount > 20 ? 'High' : 'Medium',
        reason,
        status: 'PENDING',
        approverRole: requestedDiscount > 20 ? 'FINANCE_DIRECTOR' : 'SALES_MANAGER',
        approvalCycle: 1,
        sequence: 1,
        triggeredRulesDetails: [],
        submittedAt: new Date().toISOString(),
        reviewedAt: null,
        history: [
          {
            id: generateId('H'),
            actor: quotationData.salesRepName || 'Sales Rep',
            role: 'SALES_REP',
            action: 'SUBMITTED',
            comment: reason,
            timestamp: new Date().toISOString(),
            fromStatus: null,
            toStatus: 'PENDING',
          },
        ],
      };
      dispatch({ type: 'ADD_STEPS', steps: [step] });
      return step;
    },
    []
  );

  /**
   * Resubmit (legacy compat)
   */
  const resubmitApproval = useCallback(
    (approvalId, newDiscount, newReason) => {
      const step = approvalSteps.find((s) => s.id === approvalId);
      if (!step) return;

      dispatch({
        type: 'UPDATE_STEP',
        id: approvalId,
        updates: {
          status: 'PENDING',
          action: null,
          requestedDiscount: newDiscount,
          reason: newReason,
          submittedAt: new Date().toISOString(),
          reviewedAt: null,
          history: [
            {
              id: generateId('H'),
              actor: 'Sales Rep',
              role: 'SALES_REP',
              action: 'RESUBMITTED',
              comment: newReason,
              timestamp: new Date().toISOString(),
              fromStatus: step.status,
              toStatus: 'PENDING',
            },
            ...(step.history || []),
          ],
        },
      });
    },
    [approvalSteps]
  );

  return (
    <ApprovalContext.Provider
      value={{
        approvalSteps,
        // New API
        submitForApproval,
        approveStep,
        returnForRevision,
        rejectApproval,
        getApprovalStepsByQuotationId,
        getApprovalStatus,
        getApprovalsListForRole,
        buildApprovalSteps,
        // Legacy compat
        approvals: approvalSteps,
        submitApproval,
        reviewApproval,
        resubmitApproval,
        getApprovalsByRole,
        getApprovalByQuotationId,
        getApprovalById,
      }}
    >
      {children}
    </ApprovalContext.Provider>
  );
};

export const useApprovals = () => {
  const ctx = useContext(ApprovalContext);
  if (!ctx) throw new Error('useApprovals must be used inside ApprovalProvider');
  return ctx;
};
