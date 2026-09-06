import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight, 
  Activity, 
  Zap,
  ExternalLink
} from 'lucide-react';

import { formatINR } from '../../utils/formatters.js';
import { calculateDealHealth, getRiskColor, getRiskLevel } from '../../utils/dealHealthUtils.js';
import { useQuotations } from '../../context/QuotationContext.jsx';
import { useApprovals } from '../../context/ApprovalContext.jsx';
import { useFulfillment } from '../../context/FulfillmentContext.jsx';

export const DealHealth = ({ 
  healthData, 
  onInspectQuote 
}) => {
  const navigate = useNavigate();
  const { quotations } = useQuotations();
  const { approvals } = useApprovals();
  const { fulfillments, inventory } = useFulfillment();

  // Calculate live dynamic health across all unarchived quotations
  const dynamicHealth = useMemo(() => {
    const context = {
      approvals: approvals || [],
      fulfillments: fulfillments || [],
      inventory: inventory || []
    };

    const activeQuotes = quotations.filter(q => !q.isArchived);
    const total = activeQuotes.length || 1;

    let healthyCount = 0;
    let atRiskCount = 0;
    let criticalCount = 0;
    let scoreSum = 0;

    const analyzedList = activeQuotes.map(q => {
      const analysis = calculateDealHealth(q, context);
      scoreSum += analysis.score;
      if (analysis.score <= 30) healthyCount++;
      else if (analysis.score <= 60) atRiskCount++;
      else criticalCount++;

      return {
        id: q.id,
        customer: q.customerName || q.customer,
        amount: q.total || 0,
        riskScore: analysis.score,
        riskLevel: analysis.level,
        factors: analysis.factors,
        reasons: analysis.reasons,
        action: analysis.nextBestAction
      };
    });

    // Top Risky Deals (score > 30 sorted desc)
    const topRisky = analyzedList
      .filter(d => d.riskScore > 30)
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 4);

    const avgScore = Math.round(scoreSum / total);

    return {
      total,
      healthyCount,
      atRiskCount,
      criticalCount,
      avgScore,
      topRisky
    };
  }, [quotations, approvals, fulfillments, inventory]);

  const { total, healthyCount, atRiskCount, criticalCount, avgScore, topRisky } = dynamicHealth;

  const healthyPct = Math.round((healthyCount / total) * 100);
  const atRiskPct = Math.round((atRiskCount / total) * 100);
  const criticalPct = Math.round((criticalCount / total) * 100);

  return (
    <div className="dash-card">
      <div className="dash-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
            Deal Health Monitor
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <span style={{
            backgroundColor: '#dcfce7',
            color: '#15803d',
            fontSize: '0.6875rem',
            fontWeight: '800',
            padding: '0.2rem 0.55rem',
            borderRadius: '9999px',
            letterSpacing: '0.04em'
          }}>
            LIVE
          </span>
          <button 
            className="btn btn-outline" 
            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff' }}
            onClick={() => navigate('/deal-health')}
          >
            <span>Details</span>
            <ExternalLink size={12} style={{ marginLeft: '4px' }} />
          </button>
        </div>
      </div>

      {/* Summary Score Gauge & Distribution Bars */}
      <div className="deal-health-summary-row">
        <div className="deal-health-gauge-box">
          <div className="deal-health-score-large" style={{ color: getRiskColor(avgScore) }}>
            {avgScore}
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            Avg Risk Index
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Status: {getRiskLevel(avgScore)}
          </span>
        </div>

        <div className="deal-health-breakdown-bars">
          {/* Healthy */}
          <div className="deal-health-bar-row">
            <span style={{ width: '80px', color: 'var(--color-success)', fontWeight: '600' }}>
              Healthy ({healthyCount})
            </span>
            <div className="deal-health-bar-track">
              <div 
                className="deal-health-bar-fill" 
                style={{ width: `${healthyPct}%`, backgroundColor: 'var(--color-success)' }} 
              />
            </div>
            <span style={{ width: '35px', textAlign: 'right', color: 'var(--text-muted)' }}>
              {healthyPct}%
            </span>
          </div>

          {/* At Risk */}
          <div className="deal-health-bar-row">
            <span style={{ width: '80px', color: 'var(--color-warning)', fontWeight: '600' }}>
              At Risk ({atRiskCount})
            </span>
            <div className="deal-health-bar-track">
              <div 
                className="deal-health-bar-fill" 
                style={{ width: `${atRiskPct}%`, backgroundColor: 'var(--color-warning)' }} 
              />
            </div>
            <span style={{ width: '35px', textAlign: 'right', color: 'var(--text-muted)' }}>
              {atRiskPct}%
            </span>
          </div>

          {/* Critical */}
          <div className="deal-health-bar-row">
            <span style={{ width: '80px', color: 'var(--color-error)', fontWeight: '600' }}>
              Critical ({criticalCount})
            </span>
            <div className="deal-health-bar-track">
              <div 
                className="deal-health-bar-fill" 
                style={{ width: `${criticalPct}%`, backgroundColor: 'var(--color-error)' }} 
              />
            </div>
            <span style={{ width: '35px', textAlign: 'right', color: 'var(--text-muted)' }}>
              {criticalPct}%
            </span>
          </div>
        </div>
      </div>

      {/* Flagged At-Risk Deals */}
      <div style={{ marginTop: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
          <span style={{ fontSize: '0.775rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
            TOP RISKY DEALS REQUIRING ATTENTION ({topRisky.length})
          </span>
          <span 
            onClick={() => navigate('/deal-health')}
            style={{ fontSize: '0.75rem', color: 'var(--primary-400)', cursor: 'pointer', fontWeight: '600' }}
          >
            View Matrix →
          </span>
        </div>

        <div className="risk-deals-list">
          {topRisky.length === 0 ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
              No critical or at-risk deals currently detected. Portfolio is healthy!
            </div>
          ) : (
            topRisky.map((deal) => {
              const isCritical = deal.riskLevel === 'Critical';
              return (
                <div 
                  key={deal.id} 
                  className={`risk-deal-item ${isCritical ? 'critical' : 'warning'}`}
                  onClick={() => navigate(`/deal-health/${deal.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="risk-deal-info">
                    <div className="risk-deal-header">
                      <span className="quote-id-badge">{deal.id}</span>
                      <span>•</span>
                      <span>{deal.customer}</span>
                      <span>({formatINR(deal.amount)})</span>
                      <span className={`badge ${isCritical ? 'badge-error' : 'badge-warning'}`} style={{ marginLeft: 'auto' }}>
                        Risk: {deal.riskScore}/100 ({deal.riskLevel})
                      </span>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-primary)', marginTop: '0.35rem' }}>
                      <strong>Action:</strong> {deal.action?.description || 'Review quotation'}
                    </div>
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/deal-health/${deal.id}`);
                    }}
                    className="btn btn-secondary"
                    style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', alignSelf: 'center' }}
                    title="Deep dive deal health"
                  >
                    <span>Analyze</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
