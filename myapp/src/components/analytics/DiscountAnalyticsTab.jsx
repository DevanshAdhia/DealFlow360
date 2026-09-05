import React from 'react';
import { formatINR } from '../../utils/formatters.js';

export const DiscountAnalyticsTab = ({
  discountAnalytics = { rows: [] }
}) => {
  const { rows = [], averageDiscount = 0, highestDiscount = 0, totalDiscountAmount = 0 } = discountAnalytics;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700' }}>AVERAGE PORTFOLIO DISCOUNT</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: averageDiscount > 15 ? 'var(--color-error)' : 'var(--primary-400)', marginTop: '0.25rem' }}>
            {averageDiscount}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Baseline authorized rep limit: 15%</div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-error)', fontWeight: '700' }}>HIGHEST CONCESSION</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-error)', marginTop: '0.25rem' }}>
            {highestDiscount}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Max discount escalated in current pool</div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-warning)', fontWeight: '700' }}>TOTAL DISCOUNT VALUE</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-warning)', marginTop: '0.25rem' }}>
            {formatINR(totalDiscountAmount)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Commercial price concessions applied</div>
        </div>
      </div>

      {/* Discount Leakage Matrix Table */}
      <div className="analytics-table-card">
        <div className="analytics-table-header">
          <div>
            <h3>Discount Governance & Leakage Log</h3>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Requested vs authorized thresholds and governance approval status
            </span>
          </div>
        </div>

        <table className="analytics-table">
          <thead>
            <tr>
              <th>Quotation</th>
              <th>Customer</th>
              <th>Requested Discount</th>
              <th>Allowed Limit</th>
              <th>Excess Concession</th>
              <th>Discount Value</th>
              <th>Approval Status</th>
              <th>Governance Risk</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No quotations match current filter criteria.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong style={{ color: 'var(--primary-400)' }}>{r.id}</strong>
                  </td>
                  <td>{r.customer}</td>
                  <td><strong>{r.requestedDiscount}%</strong></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{r.allowedDiscount}%</td>
                  <td>
                    <span className={`badge ${r.excessDiscount > 0 ? 'badge-error' : 'badge-success'}`}>
                      {r.excessDiscount > 0 ? `+${r.excessDiscount}% Excess` : 'Compliant'}
                    </span>
                  </td>
                  <td style={{ fontWeight: '600' }}>{formatINR(r.discountAmount)}</td>
                  <td>
                    <span className={`badge ${r.approvalStatus === 'Approved' ? 'badge-success' : r.approvalStatus === 'Pending' ? 'badge-warning' : 'badge-neutral'}`}>
                      {r.approvalStatus}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${r.riskScore === 'Critical' ? 'badge-error' : r.riskScore === 'At Risk' ? 'badge-warning' : 'badge-success'}`}>
                      {r.riskScore}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
