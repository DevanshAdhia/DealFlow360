import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Award, 
  Percent,
  CheckCircle2
} from 'lucide-react';
import { formatINR, formatINRAbbreviated } from '../../utils/formatters.js';

export const SalesPerformance = ({ performanceData }) => {
  const {
    quotesCreated = 38,
    quotesWon = 24,
    winRate = 63.2,
    avgDealValue = 2845000,
    monthlyTrend = [],
    quotaAttainment = 108.5
  } = performanceData || {};

  const [hoveredMonth, setHoveredMonth] = useState(null);

  const maxVal = Math.max(...monthlyTrend.map(m => Math.max(m.target, m.actual)), 4000000);

  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <div className="dash-card-title-group">
          <BarChart3 size={20} color="var(--primary-500)" />
          <div>
            <h3 className="dash-card-title">Sales Velocity & Quota Attainment</h3>
            <span className="dash-card-subtitle">
              Pacing at {quotaAttainment}% against Q3 commercial revenue targets
            </span>
          </div>
        </div>

        <span className="badge badge-success">
          <TrendingUp size={12} />
          {quotaAttainment}% Quota
        </span>
      </div>

      {/* 4 Performance Metrics Grid */}
      <div className="performance-metrics-grid">
        <div className="performance-metric-box">
          <span className="performance-metric-label">Quotes Created</span>
          <div className="performance-metric-val">{quotesCreated}</div>
          <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>This Quarter</span>
        </div>

        <div className="performance-metric-box">
          <span className="performance-metric-label">Quotes Won</span>
          <div className="performance-metric-val" style={{ color: 'var(--color-success)' }}>{quotesWon}</div>
          <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>+18% vs Last Q</span>
        </div>

        <div className="performance-metric-box">
          <span className="performance-metric-label">Win Rate</span>
          <div className="performance-metric-val" style={{ color: 'var(--accent-teal)' }}>{winRate}%</div>
          <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>Industry Avg: 48%</span>
        </div>

        <div className="performance-metric-box">
          <span className="performance-metric-label">Avg Deal Value</span>
          <div className="performance-metric-val">{formatINRAbbreviated(avgDealValue)}</div>
          <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>Enterprise Segment</span>
        </div>
      </div>

      {/* Sales Trend Visualization (CSS & Bar Heights) */}
      <div className="sales-chart-wrapper">
        <div className="sales-chart-header">
          <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
            Monthly Revenue vs Quota Target (INR)
          </span>

          <div className="sales-chart-legend">
            <div className="chart-legend-item">
              <span className="chart-legend-dot" style={{ backgroundColor: 'var(--bg-surface-3)' }} />
              <span>Target Quota</span>
            </div>
            <div className="chart-legend-item">
              <span className="chart-legend-dot" style={{ backgroundColor: 'var(--primary-500)' }} />
              <span>Booked Revenue</span>
            </div>
          </div>
        </div>

        {/* Hovered Month Info Tooltip Bar */}
        {hoveredMonth && (
          <div style={{
            fontSize: '0.75rem',
            padding: '0.35rem 0.6rem',
            backgroundColor: 'var(--bg-surface-1)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--primary-500)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span><strong>{hoveredMonth.month}</strong>: Booked <strong>{formatINRAbbreviated(hoveredMonth.actual)}</strong></span>
            <span>Target: {formatINRAbbreviated(hoveredMonth.target)} ({hoveredMonth.wonDeals} deals won)</span>
          </div>
        )}

        <div className="sales-trend-bars">
          {monthlyTrend.map((m, i) => {
            const targetHeight = Math.round((m.target / maxVal) * 100);
            const actualHeight = Math.round((m.actual / maxVal) * 100);

            return (
              <div 
                key={i} 
                className="sales-bar-column"
                onMouseEnter={() => setHoveredMonth(m)}
                onMouseLeave={() => setHoveredMonth(null)}
                style={{ cursor: 'pointer' }}
              >
                <div className="sales-bar-dual-group">
                  <div 
                    className="sales-bar-target" 
                    style={{ height: `${targetHeight}%` }} 
                    title={`Target: ${formatINR(m.target)}`}
                  />
                  <div 
                    className="sales-bar-actual" 
                    style={{ height: `${actualHeight}%` }} 
                    title={`Actual: ${formatINR(m.actual)}`}
                  />
                </div>
                <span className="sales-bar-label">{m.month}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
