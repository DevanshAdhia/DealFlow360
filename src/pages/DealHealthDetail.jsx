import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Activity, 
  ArrowLeft, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Percent, 
  Users, 
  CheckSquare, 
  Clock, 
  Calendar, 
  Package, 
  TrendingUp,
  FileEdit,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { useQuotations } from '../context/QuotationContext.jsx';
import { useApprovals } from '../context/ApprovalContext.jsx';
import { useFulfillment } from '../context/FulfillmentContext.jsx';
import { formatINR } from '../utils/formatters.js';
import { 
  calculateDealHealth, 
  getRiskColor, 
  getRiskLevel, 
  getRiskBadgeClass 
} from '../utils/dealHealthUtils.js';

export const DealHealthDetail = () => {
  const { quotationId, id } = useParams();
  const navigate = useNavigate();
  const activeId = quotationId || id;

  const { quotations } = useQuotations();
  const { approvals } = useApprovals();
  const { fulfillments, inventory } = useFulfillment();

  // Find the target quotation
  const quotation = useMemo(() => {
    return quotations.find(q => q.id === activeId);
  }, [quotations, activeId]);

  // Context bundle
  const contextBundle = useMemo(() => ({
    approvals: approvals || [],
    fulfillments: fulfillments || [],
    inventory: inventory || []
  }), [approvals, fulfillments, inventory]);

  // Calculated Health Metrics
  const health = useMemo(() => {
    if (!quotation) return null;
    return calculateDealHealth(quotation, contextBundle);
  }, [quotation, contextBundle]);

  if (!quotation || !health) {
    return (
      <div className="dh-detail-page" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <ShieldAlert size={48} color="var(--color-error)" style={{ margin: '0 auto 1rem' }} />
        <h2>Quotation Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Quotation ID "{quotationId}" could not be located in the active portfolio.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/deal-health')}>
          <ArrowLeft size={16} /> Return to Deal Health
        </button>
      </div>
    );
  }

  const { factors, reasons, nextBestAction, score, level } = health;
  const badgeClass = level === 'Healthy' ? 'healthy' : level === 'Critical' ? 'critical' : 'at-risk';
  const heroClass = level === 'Healthy' ? 'healthy' : level === 'Critical' ? 'critical' : 'at-risk';

  const factorList = [
    {
      key: 'discount',
      title: 'Discount Governance Risk',
      icon: Percent,
      data: factors.discountRisk,
      weightLabel: '25% Weight',
      metricLabel: `Requested: ${factors.discountRisk.requestedDiscount}% (Allowed: ${factors.discountRisk.allowedDiscount}%)`
    },
    {
      key: 'engagement',
      title: 'Customer Engagement Risk',
      icon: Users,
      data: factors.customerEngagementRisk,
      weightLabel: '20% Weight',
      metricLabel: `${factors.customerEngagementRisk.daysInactive} days inactive`
    },
    {
      key: 'approval',
      title: 'Approval Delay Risk',
      icon: CheckSquare,
      data: factors.approvalDelayRisk,
      weightLabel: '15% Weight',
      metricLabel: `Status: ${factors.approvalDelayRisk.status} (${factors.approvalDelayRisk.pendingDays} days pending)`
    },
    {
      key: 'negotiation',
      title: 'Negotiation Delay Risk',
      icon: Clock,
      data: factors.negotiationDelayRisk,
      weightLabel: '15% Weight',
      metricLabel: `Active for ${factors.negotiationDelayRisk.negotiationDays} days`
    },
    {
      key: 'expiry',
      title: 'Quotation Expiry Risk',
      icon: Calendar,
      data: factors.expiryRisk,
      weightLabel: '10% Weight',
      metricLabel: factors.expiryRisk.daysRemaining !== null 
        ? `${factors.expiryRisk.daysRemaining} days remaining` 
        : 'No expiry set'
    },
    {
      key: 'fulfillment',
      title: 'Fulfillment & Inventory Risk',
      icon: Package,
      data: factors.fulfillmentRisk,
      weightLabel: '15% Weight',
      metricLabel: `Status: ${factors.fulfillmentRisk.fulfillmentStatus} (${factors.fulfillmentRisk.backorderCount} backorders)`
    }
  ];

  return (
    <div className="dh-detail-page">
      {/* Back navigation & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <button 
          className="btn btn-outline"
          onClick={() => navigate('/deal-health')}
        >
          <ArrowLeft size={16} /> Back to Deal Health
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate(`/quotations/${quotation.id}`)}
          >
            <span>View Quotation</span>
            <ExternalLink size={14} />
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => navigate(`/quotations/${quotation.id}/builder`)}
          >
            <FileEdit size={16} />
            <span>Open CPQ Builder</span>
          </button>
        </div>
      </div>

      {/* Hero Master Summary Card */}
      <div className={`dh-hero-card ${heroClass}`}>
        <div className="dh-hero-left">
          <div 
            className="dh-score-gauge-box"
            style={{ 
              borderColor: getRiskColor(score),
              color: getRiskColor(score)
            }}
          >
            <span className="score-num">{score}</span>
            <span className="score-label">Risk Index</span>
          </div>

          <div className="dh-hero-meta">
            <h2>{quotation.id} — {quotation.customerName || quotation.customer}</h2>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Assigned Rep: <strong>{quotation.salesRepName || 'Unassigned'}</strong> • Deal Value: <strong>{formatINR(quotation.total)}</strong>
            </div>

            <div className="dh-meta-tags">
              <span className={`dh-score-badge ${badgeClass}`}>
                {level === 'Healthy' ? <ShieldCheck size={14} /> : level === 'Critical' ? <ShieldAlert size={14} /> : <AlertTriangle size={14} />}
                {level} Risk Level
              </span>

              <span className={`badge ${quotation.stage === 'confirmed' ? 'badge-success' : quotation.stage === 'pending_approval' ? 'badge-warning' : quotation.stage === 'negotiation' ? 'badge-primary' : 'badge-neutral'}`}>
                Stage: {quotation.status || quotation.stage}
              </span>

              <span className="badge badge-neutral">
                Valid Until: {quotation.validUntil || 'N/A'}
              </span>

              <span className="badge badge-neutral">
                Discount: {quotation.discount || 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Quick Recommended Action snippet */}
        <div style={{ maxWidth: '320px', textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700', color: 'var(--text-muted)' }}>
            Next Recommended Step
          </div>
          <div style={{ fontSize: '0.9375rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            {nextBestAction?.title}
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            {nextBestAction?.description}
          </div>
        </div>
      </div>

      {/* 6 Risk Factors Grid */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              Risk Signal Breakdown
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Deterministic 6-factor commercial analysis weighted to 100% total risk score
            </p>
          </div>
        </div>

        <div className="dh-factors-grid">
          {factorList.map((factor) => {
            const Icon = factor.icon;
            const fScore = factor.data.score;
            const fColor = getRiskColor(fScore);
            
            return (
              <div key={factor.key} className="dh-factor-card">
                <div className="dh-factor-header">
                  <div className="dh-factor-title">
                    <Icon size={18} color="var(--primary-400)" />
                    <span>{factor.title}</span>
                  </div>
                  <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                    {factor.weightLabel}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: fColor }}>
                    {fScore} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ 100</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Impact: +{factor.data.weightedScore} pts
                  </div>
                </div>

                <div className="dh-factor-meter">
                  <div 
                    className="dh-factor-meter-fill"
                    style={{ 
                      width: `${fScore}%`, 
                      backgroundColor: fColor 
                    }}
                  />
                </div>

                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                  {factor.metricLabel}
                </div>

                <div className="dh-factor-desc">
                  {factor.data.explanation}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reasons and Recommended Actions Row */}
      <div className="dh-two-col">
        {/* Real Risk Reasons */}
        <div className="dash-card">
          <div className="dash-card-header">
            <div className="dash-card-title-group">
              <AlertCircle size={20} color="var(--color-warning)" />
              <div>
                <h3 className="dash-card-title">Real Business Risk Reasons</h3>
                <span className="dash-card-subtitle">
                  Data-backed observations triggering the current risk score
                </span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '0.5rem' }}>
            {reasons.map((r, idx) => (
              <div key={idx} className="dh-reason-item">
                <div 
                  className="dh-reason-dot" 
                  style={{ 
                    backgroundColor: r.severity === 'critical' ? 'var(--color-error)' : 
                                     r.severity === 'warning' ? 'var(--color-warning)' : 'var(--color-success)' 
                  }} 
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <strong style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                      {r.factor}
                    </strong>
                    <span className={`badge ${r.severity === 'critical' ? 'badge-error' : r.severity === 'warning' ? 'badge-warning' : 'badge-success'}`} style={{ fontSize: '0.65rem' }}>
                      {r.severity}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    {r.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Action */}
        <div className="dh-action-card">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Sparkles size={20} color="var(--primary-400)" />
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                Recommended Action
              </h3>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Rule-based mitigation advice to lower risk and accelerate deal velocity.
            </p>

            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <strong style={{ fontSize: '0.9375rem', color: 'var(--primary-400)' }}>
                  {nextBestAction?.title}
                </strong>
                <span className={`badge ${nextBestAction?.priority === 'Urgent' ? 'badge-error' : 'badge-neutral'}`}>
                  {nextBestAction?.priority} Priority
                </span>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                {nextBestAction?.description}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            <button 
              className="btn btn-primary"
              onClick={() => navigate(nextBestAction?.route || `/quotations/${quotation.id}`)}
              style={{ flex: 1 }}
            >
              <span>Execute Recommended Mitigation</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Quotation Audit & Activity Trail */}
      <div className="dash-card">
        <div className="dash-card-header">
          <div className="dash-card-title-group">
            <Clock size={20} color="var(--accent-teal)" />
            <div>
              <h3 className="dash-card-title">Deal Activity & Governance History</h3>
              <span className="dash-card-subtitle">
                Chronological log of customer interactions, revisions, and status shifts
              </span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '0.75rem' }}>
          {(quotation.activity || []).length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No activity records available for this quotation.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {quotation.activity.map((act, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <div>
                    <span style={{ fontWeight: '600', fontSize: '0.8125rem' }}>{act.event}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>by {act.user}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{act.date}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
