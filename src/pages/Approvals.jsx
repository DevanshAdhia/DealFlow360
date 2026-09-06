import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Search,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowRight,
  TrendingDown,
  Filter,
  Activity,
  Eye,
} from 'lucide-react';
import { useApprovals } from '../context/ApprovalContext.jsx';
import { useQuotations } from '../context/QuotationContext.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { formatINRCompact, formatINR } from '../utils/formatters.js';

// ── Status Configuration ──────────────────────────────────────────────────────
const STATUS_CONFIG = {
  PENDING: { label: 'Pending', color: '#D97706', bg: '#FFFBEB', icon: Clock },
  APPROVED: { label: 'Approved', color: '#059669', bg: '#ECFDF5', icon: CheckCircle2 },
  RETURNED: { label: 'Returned', color: '#7C3AED', bg: '#F5F3FF', icon: RefreshCw },
  REJECTED: { label: 'Rejected', color: '#DC2626', bg: '#FEF2F2', icon: XCircle },
  WAITING: { label: 'Waiting', color: '#64748B', bg: '#F1F5F9', icon: Clock },
  IN_PROGRESS: { label: 'In Progress', color: '#2563EB', bg: '#EFF6FF', icon: Activity },
};

const getRiskBadge = (score) => {
  if (score >= 70) return { label: 'HIGH', color: '#DC2626', bg: '#FEF2F2' };
  if (score >= 40) return { label: 'MEDIUM', color: '#D97706', bg: '#FFFBEB' };
  return { label: 'LOW', color: '#059669', bg: '#ECFDF5' };
};

const StatusPill = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  const Icon = cfg.icon;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      fontSize: '0.7rem', fontWeight: 700, padding: '3px 8px',
      borderRadius: '9999px', backgroundColor: cfg.bg, color: cfg.color,
    }}>
      <Icon size={11} />{cfg.label}
    </span>
  );
};

export const Approvals = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getApprovalsListForRole } = useApprovals();
  const { getQuotationById } = useQuotations();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Get approval summaries for the current user's role
  const approvalSummaries = getApprovalsListForRole(user?.role || 'sales_rep', user?.id);

  // Enrich with quotation data
  const enriched = useMemo(() => {
    return approvalSummaries.map((summary) => {
      const quotation = getQuotationById(summary.quotationId);
      return { ...summary, quotation };
    });
  }, [approvalSummaries, getQuotationById]);

  // Filter
  const filtered = useMemo(() => {
    return enriched.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        (item.quotationNumber || '').toLowerCase().includes(q) ||
        (item.quotation?.customerName || '').toLowerCase().includes(q) ||
        (item.quotation?.salesRepName || '').toLowerCase().includes(q) ||
        (item.quotationId || '').toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'ALL' || item.overallStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [enriched, searchQuery, statusFilter]);

  // Metrics
  const pendingCount = enriched.filter((i) => i.overallStatus === 'PENDING').length;
  const highRiskCount = enriched.filter((i) => i.riskScore >= 70).length;
  const totalValuePending = enriched
    .filter((i) => i.overallStatus === 'PENDING')
    .reduce((s, i) => s + (i.quotation?.total || 0), 0);
  const approvedCount = enriched.filter((i) => i.overallStatus === 'APPROVED').length;

  return (
    <div className="quotations-page-container">
      {/* ── Header ── */}
      <div className="page-header" style={{ marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShieldCheck size={26} color="var(--primary)" />
            <h1 className="page-title">Approval Center</h1>
            <span style={{
              fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px',
              borderRadius: '9999px', backgroundColor: '#FEF3C7', color: '#D97706'
            }}>
              GOVERNANCE
            </span>
          </div>
          <p className="page-subtitle">
            Review and action discount exceptions, margin guardrails, and high-value commercial deals.
          </p>
        </div>
      </div>

      {/* ── KPI Strip ── */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Pending Review', value: pendingCount, color: '#D97706', bg: '#FFFBEB', icon: Clock },
          { label: 'High Risk', value: highRiskCount, color: '#DC2626', bg: '#FEF2F2', icon: AlertTriangle },
          { label: 'Value at Stake', value: formatINRCompact(totalValuePending), color: '#4F46E5', bg: '#EEF2FF', icon: TrendingDown },
          { label: 'Approved This Cycle', value: approvedCount, color: '#059669', bg: '#ECFDF5', icon: CheckCircle2 },
        ].map((kpi) => {
          const KpiIcon = kpi.icon;
          return (
            <div key={kpi.label} style={{
              flex: '1 1 170px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '0.875rem 1rem',
              display: 'flex', alignItems: 'center', gap: '0.75rem',
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: '9px',
                backgroundColor: kpi.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <KpiIcon size={18} color={kpi.color} />
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{kpi.label}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: kpi.value === 0 ? 'var(--text-secondary)' : kpi.color }}>
                  {kpi.value}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Filter Bar ── */}
      <div className="card" style={{ padding: '0.875rem 1.125rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          {/* Status tabs */}
          <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: 'var(--surface-secondary)', padding: '3px', borderRadius: '8px' }}>
            {['ALL', 'PENDING', 'APPROVED', 'RETURNED', 'REJECTED'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                style={{
                  border: 'none', cursor: 'pointer',
                  backgroundColor: statusFilter === s ? '#FFFFFF' : 'transparent',
                  color: statusFilter === s ? 'var(--primary)' : 'var(--text-secondary)',
                  boxShadow: statusFilter === s ? 'var(--shadow-sm)' : 'none',
                  padding: '0.3rem 0.7rem', borderRadius: '6px',
                  fontSize: '0.75rem', fontWeight: 700, transition: 'all 0.15s',
                }}
              >
                {s === 'ALL' ? 'All' : STATUS_CONFIG[s]?.label || s}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            flex: 1, minWidth: 220, backgroundColor: 'var(--surface-secondary)',
            borderRadius: '8px', padding: '0.35rem 0.75rem', border: '1px solid #E2E8F0'
          }}>
            <Search size={14} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search quotation, customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.8125rem', color: 'var(--text-primary)', width: '100%' }}
            />
          </div>

          <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            {filtered.length} record{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* ── Approval Cards List ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filtered.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
            <ShieldCheck size={36} color="var(--text-muted)" style={{ margin: '0 auto 1rem', display: 'block' }} />
            <h3 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>No Approval Requests</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.875rem' }}>
              {statusFilter !== 'ALL'
                ? `No ${STATUS_CONFIG[statusFilter]?.label || statusFilter} requests found.`
                : 'No approval requests match your current filters.'}
            </p>
          </div>
        ) : (
          filtered.map((item) => {
            const riskBadge = getRiskBadge(item.riskScore || 0);
            const q = item.quotation;
            const currentStep = item.pendingStep;

            return (
              <div
                key={item.quotationId}
                className="card"
                style={{ padding: '1rem 1.25rem', cursor: 'pointer', transition: 'all 0.18s', border: '1px solid #E2E8F0' }}
                onClick={() => navigate(`/sales/approvals/${item.quotationId}`)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#C7D2FE';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(79,70,229,0.08)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.boxShadow = '';
                  e.currentTarget.style.transform = '';
                }}
              >
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  {/* Risk indicator */}
                  <div style={{
                    width: 42, height: 42, borderRadius: '10px', flexShrink: 0,
                    backgroundColor: riskBadge.bg,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <TrendingDown size={14} color={riskBadge.color} />
                    <span style={{ fontSize: '0.6rem', fontWeight: 800, color: riskBadge.color, marginTop: '2px' }}>
                      {item.riskScore || 0}
                    </span>
                  </div>

                  {/* Main content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.375rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--primary)' }}>
                        {item.quotationNumber || item.quotationId}
                      </span>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        — {q?.customerName || 'Unknown Customer'}
                      </span>
                      <StatusPill status={item.overallStatus} />
                      <span style={{
                        fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px',
                        borderRadius: '4px', backgroundColor: riskBadge.bg, color: riskBadge.color,
                      }}>
                        {riskBadge.label} RISK
                      </span>
                    </div>

                    {/* Sub info */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.775rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      <span>Submitted by <strong>{q?.salesRepName || 'Sales Rep'}</strong></span>
                      <span>Value: <strong style={{ color: 'var(--text-primary)' }}>{formatINR(q?.total || 0)}</strong></span>
                      <span>Discount: <strong style={{ color: (q?.discount || 0) > 15 ? '#DC2626' : 'var(--text-primary)' }}>{q?.discount || 0}%</strong></span>
                      <span>Margin: <strong style={{ color: (q?.margin || 0) < 25 ? '#DC2626' : 'var(--text-primary)' }}>{(q?.margin || 0).toFixed(1)}%</strong></span>
                    </div>

                    {/* Triggered rules */}
                    {item.triggeredRulesDetails?.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                        {item.triggeredRulesDetails.map((rule) => (
                          <span key={rule.id} style={{
                            fontSize: '0.65rem', fontWeight: 600, padding: '2px 7px',
                            borderRadius: '4px', backgroundColor: '#FEE2E2', color: '#DC2626',
                          }}>
                            {rule.name}
                          </span>
                        ))}
                      </div>
                    )}
                    {item.reason && !item.triggeredRulesDetails?.length && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        {item.reason}
                      </div>
                    )}
                  </div>

                  {/* Right: Approver + Steps + Date + CTA */}
                  <div style={{ flexShrink: 0, textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    {/* Progress */}
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      Step {item.completedSteps}/{item.totalSteps} complete
                    </div>

                    {/* Step dots */}
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {item.steps.map((step, i) => {
                        const dotColors = {
                          APPROVED: '#10B981',
                          PENDING: '#D97706',
                          REJECTED: '#DC2626',
                          RETURNED: '#7C3AED',
                          WAITING: '#CBD5E1',
                        };
                        return (
                          <div key={step.id} style={{
                            width: 10, height: 10, borderRadius: '50%',
                            backgroundColor: dotColors[step.status] || '#CBD5E1',
                            border: step.status === 'PENDING' ? '2px solid #D97706' : 'none',
                          }} title={`Step ${i + 1}: ${step.approverTitle} — ${step.status}`} />
                        );
                      })}
                    </div>

                    {currentStep && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        Awaiting: <strong style={{ color: 'var(--text-primary)' }}>{currentStep.approverTitle || currentStep.approverName}</strong>
                      </div>
                    )}

                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}
                    </div>

                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '0.35rem',
                      fontSize: '0.775rem', fontWeight: 700, color: 'var(--primary)',
                    }}>
                      <Eye size={13} /><span>Review</span><ArrowRight size={13} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
