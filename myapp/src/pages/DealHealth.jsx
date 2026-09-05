import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Search, 
  Filter, 
  ArrowUpDown, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Percent,
  Clock,
  Package,
  Layers,
  Sparkles
} from 'lucide-react';
import { useQuotations } from '../context/QuotationContext.jsx';
import { useApprovals } from '../context/ApprovalContext.jsx';
import { useFulfillment } from '../context/FulfillmentContext.jsx';
import { formatINR } from '../utils/formatters.js';
import { 
  calculateDealHealth, 
  getRiskLevel, 
  getRiskBadgeClass, 
  getRiskColor 
} from '../utils/dealHealthUtils.js';

export const DealHealth = () => {
  const navigate = useNavigate();
  const { quotations } = useQuotations();
  const { approvals } = useApprovals();
  const { fulfillments, inventory } = useFulfillment();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [healthFilter, setHealthFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');
  const [customerFilter, setCustomerFilter] = useState('all');
  const [salesRepFilter, setSalesRepFilter] = useState('all');
  const [sortBy, setSortBy] = useState('risk_desc'); // risk_desc, risk_asc, value_desc, value_asc

  // Context bundle for health calculations
  const contextBundle = useMemo(() => ({
    approvals: approvals || [],
    fulfillments: fulfillments || [],
    inventory: inventory || []
  }), [approvals, fulfillments, inventory]);

  // Compute live health for every active quotation
  const analyzedDeals = useMemo(() => {
    return quotations
      .filter(q => !q.isArchived)
      .map(q => {
        const health = calculateDealHealth(q, contextBundle);
        return {
          ...q,
          healthAnalysis: health
        };
      });
  }, [quotations, contextBundle]);

  // Unique filter lists
  const customersList = useMemo(() => {
    const set = new Set(analyzedDeals.map(d => d.customerName || d.customer).filter(Boolean));
    return Array.from(set);
  }, [analyzedDeals]);

  const salesRepsList = useMemo(() => {
    const set = new Set(analyzedDeals.map(d => d.salesRepName).filter(Boolean));
    return Array.from(set);
  }, [analyzedDeals]);

  // High-level KPI Stats
  const kpiStats = useMemo(() => {
    const total = analyzedDeals.length;
    let healthyCount = 0;
    let atRiskCount = 0;
    let criticalCount = 0;
    let scoreSum = 0;

    analyzedDeals.forEach(d => {
      const score = d.healthAnalysis.score;
      scoreSum += score;
      if (score <= 30) healthyCount++;
      else if (score <= 60) atRiskCount++;
      else criticalCount++;
    });

    const avgScore = total > 0 ? Math.round(scoreSum / total) : 0;
    return {
      total,
      healthyCount,
      atRiskCount,
      criticalCount,
      avgScore
    };
  }, [analyzedDeals]);

  // Filtered & Sorted Deals
  const filteredDeals = useMemo(() => {
    let list = [...analyzedDeals];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(d => 
        (d.id || '').toLowerCase().includes(q) ||
        (d.customerName || d.customer || '').toLowerCase().includes(q) ||
        (d.salesRepName || '').toLowerCase().includes(q)
      );
    }

    // Health filter
    if (healthFilter !== 'all') {
      list = list.filter(d => d.healthAnalysis.level.toLowerCase() === healthFilter.toLowerCase());
    }

    // Stage filter
    if (stageFilter !== 'all') {
      list = list.filter(d => (d.stage || d.status || '').toLowerCase() === stageFilter.toLowerCase());
    }

    // Customer filter
    if (customerFilter !== 'all') {
      list = list.filter(d => (d.customerName || d.customer) === customerFilter);
    }

    // Sales Rep filter
    if (salesRepFilter !== 'all') {
      list = list.filter(d => d.salesRepName === salesRepFilter);
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'risk_desc') return b.healthAnalysis.score - a.healthAnalysis.score;
      if (sortBy === 'risk_asc') return a.healthAnalysis.score - b.healthAnalysis.score;
      if (sortBy === 'value_desc') return (b.total || 0) - (a.total || 0);
      if (sortBy === 'value_asc') return (a.total || 0) - (b.total || 0);
      return 0;
    });

    return list;
  }, [analyzedDeals, searchQuery, healthFilter, stageFilter, customerFilter, salesRepFilter, sortBy]);

  return (
    <div className="deal-health-page">
      {/* Header */}
      <div className="deal-health-header">
        <div className="deal-health-title-group">
          <h1>
            <Activity size={26} color="var(--primary-500)" />
            Deal Health & Risk Analysis
          </h1>
          <p>
            Real-time, deterministic 0–100 risk scoring powered by commercial governance, approvals, customer activity & fulfillment signals.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="deal-health-kpi-grid">
        <div className="dh-kpi-card">
          <div className="dh-kpi-info">
            <h3>Total Analyzed Deals</h3>
            <div className="dh-kpi-value">{kpiStats.total}</div>
            <div className="dh-kpi-sub">Across active sales pipeline</div>
          </div>
          <div className="dh-kpi-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--primary-500)' }}>
            <Layers size={22} />
          </div>
        </div>

        <div className="dh-kpi-card">
          <div className="dh-kpi-info">
            <h3>Healthy Deals</h3>
            <div className="dh-kpi-value" style={{ color: 'var(--color-success)' }}>{kpiStats.healthyCount}</div>
            <div className="dh-kpi-sub">Score 0–30 (Low Risk)</div>
          </div>
          <div className="dh-kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-success)' }}>
            <ShieldCheck size={22} />
          </div>
        </div>

        <div className="dh-kpi-card">
          <div className="dh-kpi-info">
            <h3>At Risk Deals</h3>
            <div className="dh-kpi-value" style={{ color: 'var(--color-warning)' }}>{kpiStats.atRiskCount}</div>
            <div className="dh-kpi-sub">Score 31–60 (Attention Needed)</div>
          </div>
          <div className="dh-kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-warning)' }}>
            <AlertTriangle size={22} />
          </div>
        </div>

        <div className="dh-kpi-card">
          <div className="dh-kpi-info">
            <h3>Critical Deals</h3>
            <div className="dh-kpi-value" style={{ color: 'var(--color-error)' }}>{kpiStats.criticalCount}</div>
            <div className="dh-kpi-sub">Score 61–100 (Immediate Escalation)</div>
          </div>
          <div className="dh-kpi-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-error)' }}>
            <ShieldAlert size={22} />
          </div>
        </div>

        <div className="dh-kpi-card">
          <div className="dh-kpi-info">
            <h3>Average Risk Score</h3>
            <div className="dh-kpi-value" style={{ color: getRiskColor(kpiStats.avgScore) }}>
              {kpiStats.avgScore} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ 100</span>
            </div>
            <div className="dh-kpi-sub">Portfolio Risk Index: {getRiskLevel(kpiStats.avgScore)}</div>
          </div>
          <div className="dh-kpi-icon" style={{ background: 'rgba(147, 51, 234, 0.15)', color: 'var(--accent-purple)' }}>
            <Activity size={22} />
          </div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="deal-health-toolbar">
        <div className="dh-search-box">
          <Search size={18} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search by quote ID, customer, sales rep..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="dh-filters-group">
          {/* Health Level Filter */}
          <select 
            className="dh-filter-select"
            value={healthFilter}
            onChange={(e) => setHealthFilter(e.target.value)}
          >
            <option value="all">All Health Levels</option>
            <option value="healthy">Healthy (0-30)</option>
            <option value="at risk">At Risk (31-60)</option>
            <option value="critical">Critical (61-100)</option>
          </select>

          {/* Deal Stage Filter */}
          <select 
            className="dh-filter-select"
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
          >
            <option value="all">All Stages</option>
            <option value="draft">Draft</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="negotiation">Negotiation</option>
            <option value="confirmed">Confirmed</option>
          </select>

          {/* Customer Filter */}
          <select 
            className="dh-filter-select"
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
          >
            <option value="all">All Customers</option>
            {customersList.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Sort Filter */}
          <select 
            className="dh-filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="risk_desc">Highest Risk First</option>
            <option value="risk_asc">Lowest Risk First</option>
            <option value="value_desc">Highest Deal Value</option>
            <option value="value_asc">Lowest Deal Value</option>
          </select>
        </div>
      </div>

      {/* Deals Table */}
      <div className="dh-table-container">
        {filteredDeals.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <Activity size={36} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
            <p style={{ fontWeight: '600', fontSize: '1rem' }}>No quotations match your health filter criteria.</p>
            <p style={{ fontSize: '0.8125rem', marginTop: '0.25rem' }}>Try clearing filters or search terms.</p>
          </div>
        ) : (
          <table className="dh-table">
            <thead>
              <tr>
                <th>Quotation</th>
                <th>Customer & Rep</th>
                <th>Deal Value</th>
                <th>Health & Risk Score</th>
                <th>Top Risk Signal</th>
                <th>Recommended Action</th>
                <th>Stage</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeals.map((deal) => {
                const health = deal.healthAnalysis;
                const topFactor = Object.entries(health.factors)
                  .sort(([, a], [, b]) => b.score - a.score)[0];
                const topFactorName = topFactor ? topFactor[0].replace('Risk', '') : 'None';
                const badgeClass = health.level === 'Healthy' ? 'healthy' : health.level === 'Critical' ? 'critical' : 'at-risk';

                return (
                  <tr 
                    key={deal.id} 
                    className="dh-table-row"
                    onClick={() => navigate(`/deal-health/${deal.id}`)}
                  >
                    <td>
                      <div style={{ fontWeight: '700', color: 'var(--primary-400)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span>{deal.id}</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Expires: {deal.validUntil || 'N/A'}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontWeight: '600' }}>{deal.customerName || deal.customer}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Rep: {deal.salesRepName || 'Unassigned'}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: '700' }}>{formatINR(deal.total)}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Disc: {deal.discount || 0}%
                      </div>
                    </td>

                    <td>
                      <div className={`dh-score-badge ${badgeClass}`}>
                        <span>{health.score}/100</span>
                        <span>•</span>
                        <span>{health.level}</span>
                      </div>
                      <div className="dh-mini-bar">
                        <div 
                          className="dh-mini-bar-fill"
                          style={{ 
                            width: `${health.score}%`, 
                            backgroundColor: getRiskColor(health.score) 
                          }}
                        />
                      </div>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.8125rem', fontWeight: '600', color: topFactor[1].score > 50 ? 'var(--color-warning)' : 'var(--text-primary)' }}>
                        {topFactorName.replace(/([A-Z])/g, ' $1').trim()} ({topFactor[1].score})
                      </div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {topFactor[1].explanation}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: '500', maxWidth: '240px' }}>
                        {health.nextBestAction?.description || 'Monitor deal'}
                      </div>
                      <span className={`badge ${health.nextBestAction?.priority === 'Urgent' ? 'badge-error' : 'badge-neutral'}`} style={{ fontSize: '0.65rem', marginTop: '0.2rem' }}>
                        {health.nextBestAction?.priority || 'Normal'}
                      </span>
                    </td>

                    <td>
                      <span className={`badge ${deal.stage === 'confirmed' ? 'badge-success' : deal.stage === 'pending_approval' ? 'badge-warning' : deal.stage === 'negotiation' ? 'badge-primary' : 'badge-neutral'}`}>
                        {deal.status || deal.stage}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/deal-health/${deal.id}`);
                        }}
                      >
                        <span>Deep Dive</span>
                        <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
