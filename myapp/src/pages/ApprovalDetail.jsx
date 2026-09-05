import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  MessageSquare,
  History,
  TrendingDown,
  User,
  Building2,
  DollarSign,
  FileText,
  ArrowRight,
  Activity,
  Info,
} from 'lucide-react';
import { useApprovals } from '../context/ApprovalContext.jsx';
import { useQuotations } from '../context/QuotationContext.jsx';
import { useFulfillment } from '../context/FulfillmentContext.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { formatINR, formatINRCompact } from '../utils/formatters.js';
import { APPROVAL_RULES } from '../data/approvalRules.js';

// ── Helpers ───────────────────────────────────────────────────────────────────
const getRiskBadge = (score) => {
  if (score >= 70) return { label: 'HIGH RISK', color: '#DC2626', bg: '#FEF2F2', borderColor: '#FECACA' };
  if (score >= 40) return { label: 'MEDIUM RISK', color: '#D97706', bg: '#FFFBEB', borderColor: '#FDE68A' };
  return { label: 'LOW RISK', color: '#059669', bg: '#ECFDF5', borderColor: '#A7F3D0' };
};

const STEP_STATUS = {
  APPROVED: { label: 'Approved', color: '#059669', bg: '#ECFDF5', icon: CheckCircle2 },
  PENDING: { label: 'Pending Review', color: '#D97706', bg: '#FFFBEB', icon: Clock },
  WAITING: { label: 'Waiting', color: '#94A3B8', bg: '#F1F5F9', icon: Clock },
  RETURNED: { label: 'Returned', color: '#7C3AED', bg: '#F5F3FF', icon: RefreshCw },
  REJECTED: { label: 'Rejected', color: '#DC2626', bg: '#FEF2F2', icon: XCircle },
};

const HISTORY_ACTIONS = {
  SUBMITTED: { label: 'Submitted', color: '#4F46E5' },
  APPROVED: { label: 'Approved', color: '#059669' },
  RETURNED: { label: 'Returned for Revision', color: '#7C3AED' },
  REJECTED: { label: 'Rejected', color: '#DC2626' },
  RESUBMITTED: { label: 'Resubmitted', color: '#D97706' },
};

// ── Approval Timeline Step ────────────────────────────────────────────────────
const TimelineStep = ({ step, index, isLast }) => {
  const cfg = STEP_STATUS[step.status] || STEP_STATUS.WAITING;
  const Icon = cfg.icon;

  return (
    <div style={{ display: 'flex', gap: '1rem' }}>
      {/* Connector + icon */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 36, flexShrink: 0 }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          backgroundColor: cfg.bg, border: `2px solid ${cfg.color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon size={16} color={cfg.color} />
        </div>
        {!isLast && (
          <div style={{ width: 2, flex: 1, minHeight: 28, backgroundColor: '#E2E8F0', marginTop: 4 }} />
        )}
      </div>

      {/* Content */}
      <div style={{ paddingBottom: isLast ? 0 : '1.25rem', flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Step {index + 1}: {step.approverTitle || step.approverRole}
          </span>
          <span style={{
            fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px',
            borderRadius: '9999px', backgroundColor: cfg.bg, color: cfg.color,
          }}>
            {cfg.label}
          </span>
        </div>

        <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginBottom: step.comment ? '0.5rem' : 0 }}>
          <span>Assigned to <strong>{step.approverName}</strong></span>
          {step.reviewedAt && (
            <span style={{ marginLeft: '0.75rem', color: 'var(--text-muted)' }}>
              Reviewed: {new Date(step.reviewedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
          )}
        </div>

        {step.comment && (
          <div style={{
            marginTop: '0.5rem',
            padding: '0.625rem 0.875rem',
            backgroundColor: 'var(--surface-secondary)',
            borderRadius: '8px',
            border: '1px solid #E2E8F0',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            fontStyle: 'italic',
          }}>
            "{step.comment}"
          </div>
        )}
      </div>
    </div>
  );
};

// ── History Entry ─────────────────────────────────────────────────────────────
const HistoryEntry = ({ entry }) => {
  const cfg = HISTORY_ACTIONS[entry.action] || HISTORY_ACTIONS.SUBMITTED;

  return (
    <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start', paddingBottom: '0.875rem' }}>
      <div style={{
        width: 7, height: 7, borderRadius: '50%',
        backgroundColor: cfg.color, marginTop: '0.45rem', flexShrink: 0,
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: cfg.color }}>{cfg.label}</span>
          <span style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>by {entry.actor}</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
            {entry.timestamp ? new Date(entry.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
          </span>
        </div>
        {entry.comment && (
          <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '0.25rem', fontStyle: 'italic' }}>
            {entry.comment}
          </p>
        )}
      </div>
    </div>
  );
};

// ── Rule Badge ────────────────────────────────────────────────────────────────
const RuleBadge = ({ rule }) => {
  const severityColors = {
    CRITICAL: { text: '#DC2626', bg: '#FEF2F2' },
    HIGH: { text: '#D97706', bg: '#FFFBEB' },
    MEDIUM: { text: '#2563EB', bg: '#EFF6FF' },
  };
  const sc = severityColors[rule.severity] || severityColors.MEDIUM;

  return (
    <div style={{
      padding: '0.75rem 1rem',
      backgroundColor: sc.bg,
      border: `1px solid ${sc.text}30`,
      borderRadius: '8px',
      marginBottom: '0.5rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
        <AlertTriangle size={13} color={sc.text} />
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: sc.text }}>{rule.name}</span>
        <span style={{
          fontSize: '0.6rem', fontWeight: 700, padding: '1px 6px',
          borderRadius: '4px', backgroundColor: sc.text, color: '#FFF',
          marginLeft: 'auto',
        }}>
          {rule.severity}
        </span>
      </div>
      <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', margin: 0 }}>
        {rule.triggerDescription}
      </p>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
export const ApprovalDetail = () => {
  const { id, quotationId } = useParams(); // id or quotationId
  const resolvedId = quotationId || id;
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error } = useToast();

  const {
    getApprovalStepsByQuotationId,
    getApprovalStatus,
    approveStep,
    returnForRevision,
    rejectApproval,
    getApprovalById, // legacy compat
  } = useApprovals();
  const { getQuotationById, setQuotationStage } = useQuotations();
  const { createFulfillment } = useFulfillment();

  const [comment, setComment] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'history'
  const [actionConfirm, setActionConfirm] = useState(null); // 'approve' | 'return' | 'reject'

  // Resolve: resolvedId could be quotationId or step id
  // Try quotationId first, then legacy step id
  const steps = getApprovalStepsByQuotationId(resolvedId);
  const effectiveQuotationId = steps.length > 0 ? steps[0].quotationId : resolvedId;
  const quotation = getQuotationById(effectiveQuotationId);

  // Fallback: legacy approval step lookup
  const legacyStep = steps.length === 0 ? getApprovalById(resolvedId) : null;
  const legacyQuotation = legacyStep ? getQuotationById(legacyStep.quotationId) : null;

  const activeQuotation = quotation || legacyQuotation;
  const activeSteps = steps.length > 0 ? steps : (legacyStep ? [legacyStep] : []);

  const overallStatus = getApprovalStatus(effectiveQuotationId);

  // Current pending step (what this user can act on)
  const pendingStep = useMemo(() => {
    return activeSteps.find((s) => s.status === 'PENDING');
  }, [activeSteps]);

  // Can this user review?
  const userRole = user?.role || 'sales_rep';
  const canReview = useMemo(() => {
    if (!pendingStep || overallStatus !== 'PENDING') return false;
    if (userRole === 'admin') return true;
    if (userRole === 'sales_manager' && pendingStep.approverRole === 'SALES_MANAGER') return true;
    if (userRole === 'finance' && pendingStep.approverRole === 'FINANCE_DIRECTOR') return true;
    if (userRole === 'finance' && pendingStep.approverRole === 'SALES_MANAGER') return true; // Finance can do all
    return false;
  }, [pendingStep, userRole, overallStatus]);

  // All triggered rules across steps
  const allTriggeredRules = useMemo(() => {
    if (!activeSteps.length) return [];
    const ruleIds = activeSteps.flatMap((s) => s.triggeredRules || []);
    const uniqueIds = [...new Set(ruleIds)];
    return uniqueIds.map((rid) => APPROVAL_RULES.find((r) => r.id === rid)).filter(Boolean);
  }, [activeSteps]);

  // All history entries across steps
  const allHistory = useMemo(() => {
    const entries = activeSteps.flatMap((s) => s.history || []);
    return entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [activeSteps]);

  if (!activeQuotation && !activeSteps.length) {
    return (
      <div className="quotations-page-container">
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <AlertTriangle size={32} color="var(--color-error)" style={{ margin: '0 auto 1rem', display: 'block' }} />
          <h2 style={{ fontWeight: 700 }}>Approval Request Not Found</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            No approval record found for ID: <strong>{resolvedId}</strong>
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/sales/approvals')} style={{ marginTop: '1.5rem' }}>
            <ArrowLeft size={16} /> Back to Approvals
          </button>
        </div>
      </div>
    );
  }

  const riskScore = activeSteps[0]?.riskScore || 0;
  const riskBadge = getRiskBadge(riskScore);

  const handleAction = (actionType) => {
    if (actionType !== 'approve' && !comment.trim()) {
      error('Comment Required', 'Please provide a comment explaining your decision.');
      return;
    }

    if (actionType === 'approve') {
      const result = approveStep(quotationId, user, comment || 'Approved.');
      if (result.success) {
        if (result.approvalFinalResult === 'APPROVED') {
          // All steps done → move quotation to approved
          setQuotationStage(quotationId, 'approved', 'APPROVED', 'All approval steps completed. Quotation approved.');
          if (createFulfillment && activeQuotation) {
            createFulfillment(activeQuotation);
          }
          success('Fully Approved ✓', `${activeQuotation?.quotationNumber || quotationId} has been approved. Order created and entered fulfillment.`);
        } else {
          success('Step Approved', `Step approved. Escalating to next approver: ${result.nextStep?.approverTitle}.`);
        }
        setComment('');
        setActionConfirm(null);
        navigate('/approvals');
      } else {
        error('Action Failed', result.error || 'Could not complete the approval action.');
      }
    } else if (actionType === 'return') {
      const result = returnForRevision(quotationId, user, comment);
      if (result.success) {
        setQuotationStage(quotationId, 'returned_for_revision', 'RETURNED', `Returned for revision: ${comment}`);
        success('Returned for Revision', `${activeQuotation?.quotationNumber || quotationId} sent back to sales for revision.`);
        setComment('');
        setActionConfirm(null);
        navigate('/approvals');
      } else {
        error('Action Failed', result.error || 'Could not return for revision.');
      }
    } else if (actionType === 'reject') {
      const result = rejectApproval(quotationId, user, comment);
      if (result.success) {
        setQuotationStage(quotationId, 'rejected', 'REJECTED', `Rejected by approver: ${comment}`);
        success('Approval Rejected', `${activeQuotation?.quotationNumber || quotationId} has been permanently rejected.`);
        setComment('');
        setActionConfirm(null);
        navigate('/approvals');
      } else {
        error('Action Failed', result.error || 'Could not reject the approval.');
      }
    }
  };

  const OVERALL_STATUS_CONFIG = {
    PENDING: { label: 'Pending Review', color: '#D97706', bg: '#FFFBEB', icon: Clock },
    IN_PROGRESS: { label: 'In Progress', color: '#2563EB', bg: '#EFF6FF', icon: Activity },
    APPROVED: { label: 'Approved', color: '#059669', bg: '#ECFDF5', icon: CheckCircle2 },
    RETURNED: { label: 'Returned for Revision', color: '#7C3AED', bg: '#F5F3FF', icon: RefreshCw },
    REJECTED: { label: 'Rejected', color: '#DC2626', bg: '#FEF2F2', icon: XCircle },
    NOT_SUBMITTED: { label: 'Not Submitted', color: '#64748B', bg: '#F1F5F9', icon: Info },
  };

  const statusCfg = OVERALL_STATUS_CONFIG[overallStatus] || OVERALL_STATUS_CONFIG.NOT_SUBMITTED;
  const StatusIcon = statusCfg.icon;

  return (
    <div className="quotations-page-container">
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn btn-outline" onClick={() => navigate('/approvals')}>
            <ArrowLeft size={15} /> Back
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <ShieldCheck size={22} color="var(--primary)" />
              <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Approval Review — {activeQuotation?.quotationNumber || quotationId}
              </h1>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px',
                borderRadius: '9999px', backgroundColor: statusCfg.bg, color: statusCfg.color,
              }}>
                <StatusIcon size={13} />{statusCfg.label}
              </span>
              <span style={{
                fontSize: '0.7rem', fontWeight: 700, padding: '3px 8px',
                borderRadius: '4px', backgroundColor: riskBadge.bg, color: riskBadge.color,
              }}>
                {riskBadge.label} (Score: {riskScore})
              </span>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
              Submitted {activeSteps[0]?.submittedAt
                ? new Date(activeSteps[0].submittedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                : '—'}
              {' '}• {activeSteps[0]?.history?.find(h => h.action === 'SUBMITTED')?.actor || activeQuotation?.salesRepName || 'Sales Rep'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.25rem', alignItems: 'start' }}>
        {/* ── Left Column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: 'var(--surface-secondary)', padding: '3px', borderRadius: '8px', width: 'fit-content' }}>
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'history', label: `History (${allHistory.length})` },
            ].map(({ id: tabId, label }) => (
              <button
                key={tabId}
                onClick={() => setActiveTab(tabId)}
                style={{
                  border: 'none', cursor: 'pointer',
                  backgroundColor: activeTab === tabId ? '#FFFFFF' : 'transparent',
                  color: activeTab === tabId ? 'var(--primary)' : 'var(--text-secondary)',
                  boxShadow: activeTab === tabId ? 'var(--shadow-sm)' : 'none',
                  padding: '0.35rem 0.875rem', borderRadius: '6px',
                  fontSize: '0.8rem', fontWeight: 700, transition: 'all 0.15s',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {activeTab === 'overview' ? (
            <>
              {/* Triggered Rules */}
              {allTriggeredRules.length > 0 && (
                <div className="card" style={{ padding: '1.125rem' }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertTriangle size={15} color="#DC2626" /> Flagged Violations
                  </h3>
                  {allTriggeredRules.map((rule) => (
                    <RuleBadge key={rule.id} rule={rule} />
                  ))}
                </div>
              )}

              {/* Approval Steps Timeline */}
              {activeSteps.length > 0 && (
                <div className="card" style={{ padding: '1.125rem' }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldCheck size={15} color="var(--primary)" /> Approval Workflow
                  </h3>
                  {activeSteps.map((step, i) => (
                    <TimelineStep
                      key={step.id}
                      step={step}
                      index={i}
                      isLast={i === activeSteps.length - 1}
                    />
                  ))}
                </div>
              )}

              {/* Quotation line items */}
              {activeQuotation?.items?.length > 0 && (
                <div className="card" style={{ padding: '1.125rem', overflow: 'hidden' }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={15} color="var(--primary)" /> Line Items Under Review
                  </h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                      <thead>
                        <tr style={{ backgroundColor: 'var(--surface-secondary)' }}>
                          {['Product', 'Qty', 'Unit Price', 'Discount', 'Taxable', 'Margin', 'Total'].map((h) => (
                            <th key={h} style={{ padding: '0.625rem 0.75rem', textAlign: h === 'Product' ? 'left' : 'right', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {activeQuotation.items.map((item, i) => {
                          const isOverDiscount = (item.discount || 0) > 15;
                          const isLowMargin = (item.margin || 0) < 25;
                          return (
                            <tr key={item.id || i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                              <td style={{ padding: '0.625rem 0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                {item.name || item.productId || `Item ${i + 1}`}
                              </td>
                              <td style={{ padding: '0.625rem 0.75rem', textAlign: 'right', color: 'var(--text-secondary)' }}>
                                {item.quantity}
                              </td>
                              <td style={{ padding: '0.625rem 0.75rem', textAlign: 'right' }}>
                                {formatINR(item.unitPrice || 0)}
                              </td>
                              <td style={{ padding: '0.625rem 0.75rem', textAlign: 'right' }}>
                                <span style={{ fontWeight: 700, color: isOverDiscount ? '#DC2626' : 'var(--text-primary)' }}>
                                  {(item.discount || 0)}%
                                </span>
                                {isOverDiscount && <span style={{ fontSize: '0.6rem', color: '#DC2626', marginLeft: 4 }}>⚠</span>}
                              </td>
                              <td style={{ padding: '0.625rem 0.75rem', textAlign: 'right', color: 'var(--text-secondary)' }}>
                                {formatINR(item.taxableAmount || item.subtotal || 0)}
                              </td>
                              <td style={{ padding: '0.625rem 0.75rem', textAlign: 'right' }}>
                                <span style={{ fontWeight: 700, color: isLowMargin ? '#DC2626' : '#059669' }}>
                                  {(item.margin || 0).toFixed(1)}%
                                </span>
                              </td>
                              <td style={{ padding: '0.625rem 0.75rem', textAlign: 'right', fontWeight: 700 }}>
                                {formatINR(item.total || 0)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            // History Tab
            <div className="card" style={{ padding: '1.125rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <History size={15} color="var(--primary)" /> Full Activity Log
              </h3>
              {allHistory.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No activity recorded yet.</p>
              ) : (
                allHistory.map((entry) => (
                  <HistoryEntry key={entry.id} entry={entry} />
                ))
              )}
            </div>
          )}
        </div>

        {/* ── Right Column: Quotation Info + Action Panel ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Quotation snapshot */}
          {activeQuotation && (
            <div className="card" style={{ padding: '1rem' }}>
              <h3 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.875rem' }}>
                Quotation Summary
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {[
                  { label: 'Quotation #', value: activeQuotation.quotationNumber || activeQuotation.id, icon: FileText },
                  { label: 'Customer', value: activeQuotation.customerName || '—', icon: Building2 },
                  { label: 'Sales Rep', value: activeQuotation.salesRepName || '—', icon: User },
                  { label: 'Tier', value: activeQuotation.customerTierName || '—', icon: Activity },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '6px', backgroundColor: 'var(--surface-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={13} color="var(--text-secondary)" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>{label}</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '0.875rem', paddingTop: '0.875rem', borderTop: '1px solid #E2E8F0' }}>
                {[
                  { label: 'Subtotal', value: formatINR(activeQuotation.subtotal || 0) },
                  { label: `Discount (${activeQuotation.discount || 0}%)`, value: `- ${formatINR(activeQuotation.discountAmount || 0)}`, color: '#DC2626' },
                  { label: 'GST (18%)', value: formatINR(activeQuotation.tax || 0) },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.775rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                    <span>{label}</span><span style={{ color: color || 'inherit', fontWeight: 600 }}>{value}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #E2E8F0' }}>
                  <span>Grand Total</span><span style={{ color: 'var(--primary)' }}>{formatINR(activeQuotation.total || 0)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.775rem', marginTop: '0.5rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Gross Margin</span>
                  <span style={{ fontWeight: 700, color: (activeQuotation.margin || 0) < 25 ? '#DC2626' : '#059669' }}>
                    {(activeQuotation.margin || 0).toFixed(1)}%
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate(`/quotations/${activeQuotation.id}`)}
                style={{
                  marginTop: '0.875rem', width: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  padding: '0.5rem', borderRadius: '8px', border: '1px solid #E2E8F0',
                  backgroundColor: 'transparent', color: 'var(--primary)', fontWeight: 600,
                  fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary-light)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <FileText size={13} /><span>View Full Quotation</span><ArrowRight size={13} />
              </button>
            </div>
          )}

          {/* Action Panel */}
          {canReview && (
            <div className="card" style={{ padding: '1rem', border: '1px solid #DDD6FE' }}>
              <h3 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageSquare size={13} color="var(--primary)" /> Your Decision
              </h3>

              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.375rem' }}>
                  Comment / Notes
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Required for Return and Reject. Optional for Approve..."
                  rows={3}
                  style={{
                    width: '100%', padding: '0.625rem 0.75rem', borderRadius: '8px',
                    border: '1px solid #E2E8F0', fontSize: '0.8rem',
                    color: 'var(--text-primary)', resize: 'vertical',
                    fontFamily: 'var(--font-family)',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {/* Approve */}
                <button
                  onClick={() => setActionConfirm('approve')}
                  style={{
                    width: '100%', padding: '0.625rem',
                    backgroundColor: '#059669', color: '#FFF',
                    border: 'none', borderRadius: '8px', fontWeight: 700,
                    fontSize: '0.875rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    transition: 'background-color 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#047857'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#059669'; }}
                >
                  <CheckCircle2 size={15} /><span>Approve</span>
                </button>

                {/* Return for Revision */}
                <button
                  onClick={() => setActionConfirm('return')}
                  style={{
                    width: '100%', padding: '0.625rem',
                    backgroundColor: '#7C3AED', color: '#FFF',
                    border: 'none', borderRadius: '8px', fontWeight: 700,
                    fontSize: '0.875rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    transition: 'background-color 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#6D28D9'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#7C3AED'; }}
                >
                  <RefreshCw size={15} /><span>Return for Revision</span>
                </button>

                {/* Reject */}
                <button
                  onClick={() => setActionConfirm('reject')}
                  style={{
                    width: '100%', padding: '0.625rem',
                    backgroundColor: '#DC2626', color: '#FFF',
                    border: 'none', borderRadius: '8px', fontWeight: 700,
                    fontSize: '0.875rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    transition: 'background-color 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#B91C1C'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#DC2626'; }}
                >
                  <XCircle size={15} /><span>Reject Permanently</span>
                </button>
              </div>
            </div>
          )}

          {!canReview && overallStatus === 'PENDING' && (
            <div style={{
              padding: '0.875rem 1rem', backgroundColor: '#FFFBEB',
              border: '1px solid #FDE68A', borderRadius: '10px',
              fontSize: '0.8rem', color: '#92400E', fontWeight: 600,
              display: 'flex', gap: '0.5rem', alignItems: 'flex-start',
            }}>
              <Info size={15} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
              <span>
                This approval is awaiting review by the <strong>{pendingStep?.approverTitle || 'assigned approver'}</strong>. You do not have permission to act on this step with your current role.
              </span>
            </div>
          )}

          {['APPROVED', 'REJECTED', 'RETURNED'].includes(overallStatus) && (
            <div style={{
              padding: '0.875rem 1rem',
              backgroundColor: statusCfg.bg,
              border: `1px solid ${statusCfg.color}30`,
              borderRadius: '10px',
              fontSize: '0.8rem', color: statusCfg.color, fontWeight: 600,
              display: 'flex', gap: '0.5rem', alignItems: 'flex-start',
            }}>
              <StatusIcon size={15} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
              <span>This approval has been <strong>{statusCfg.label}</strong>. No further action is required.</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Confirm Modal ── */}
      {actionConfirm && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.4)',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setActionConfirm(null); }}
        >
          <div style={{
            backgroundColor: '#FFFFFF', borderRadius: '14px',
            padding: '1.5rem', maxWidth: '420px', width: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }}>
            {actionConfirm === 'approve' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
                  <CheckCircle2 size={22} color="#059669" />
                  <h2 style={{ fontSize: '1.125rem', fontWeight: 800 }}>Confirm Approval</h2>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  You are approving <strong>{activeQuotation?.quotationNumber}</strong> for <strong>{activeQuotation?.customerName}</strong>.
                  {activeSteps.length > 1 && ` This will advance to the next approval step.`}
                  {activeSteps.length === 1 && ` The quotation will move to Approved status.`}
                </p>
              </>
            )}
            {actionConfirm === 'return' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
                  <RefreshCw size={22} color="#7C3AED" />
                  <h2 style={{ fontSize: '1.125rem', fontWeight: 800 }}>Return for Revision</h2>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  The quotation will be sent back to <strong>{activeQuotation?.salesRepName}</strong> for revision. Your comment is required.
                </p>
                {!comment.trim() && (
                  <p style={{ fontSize: '0.8rem', color: '#DC2626', marginBottom: '1rem' }}>
                    ⚠ Please provide a comment explaining the reason for return.
                  </p>
                )}
              </>
            )}
            {actionConfirm === 'reject' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
                  <XCircle size={22} color="#DC2626" />
                  <h2 style={{ fontSize: '1.125rem', fontWeight: 800 }}>Permanently Reject</h2>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  This will <strong>permanently reject</strong> the quotation. This action cannot be undone. Your comment is required.
                </p>
                {!comment.trim() && (
                  <p style={{ fontSize: '0.8rem', color: '#DC2626', marginBottom: '1rem' }}>
                    ⚠ Please provide a reason for rejection.
                  </p>
                )}
              </>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setActionConfirm(null)}
                style={{ padding: '0.5rem 1rem', border: '1px solid #E2E8F0', borderRadius: '8px', backgroundColor: 'transparent', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(actionConfirm)}
                style={{
                  padding: '0.5rem 1.25rem', border: 'none', borderRadius: '8px',
                  backgroundColor: actionConfirm === 'approve' ? '#059669' : actionConfirm === 'return' ? '#7C3AED' : '#DC2626',
                  color: '#FFF', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem',
                }}
              >
                {actionConfirm === 'approve' ? 'Confirm Approval' : actionConfirm === 'return' ? 'Return for Revision' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
