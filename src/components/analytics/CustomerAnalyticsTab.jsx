import React from 'react';
import { formatINR } from '../../utils/formatters.js';

export const CustomerAnalyticsTab = ({
  customers = []
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="analytics-table-card">
        <div className="analytics-table-header">
          <div>
            <h3>Customer Commercial Portfolio Analysis</h3>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Revenue realization, win rates, and average transaction sizes per account
            </span>
          </div>
        </div>

        <table className="analytics-table">
          <thead>
            <tr>
              <th>Customer Account</th>
              <th>Total Deals</th>
              <th>Win Rate</th>
              <th>Pipeline Value</th>
              <th>Confirmed Value</th>
              <th>Paid Revenue</th>
              <th>Avg Deal Value</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No customer records match current filter criteria.
                </td>
              </tr>
            ) : (
              customers.map((c, idx) => (
                <tr key={idx}>
                  <td>
                    <strong style={{ color: 'var(--text-primary)' }}>{c.customer}</strong>
                  </td>
                  <td>{c.totalDeals} quotes</td>
                  <td>
                    <span className={`badge ${c.conversionRate >= 50 ? 'badge-success' : c.conversionRate > 0 ? 'badge-primary' : 'badge-neutral'}`}>
                      {c.conversionRate}%
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{formatINR(c.pipelineValue)}</td>
                  <td style={{ fontWeight: '600', color: 'var(--primary-400)' }}>{formatINR(c.confirmedValue)}</td>
                  <td style={{ fontWeight: '700', color: 'var(--color-success)' }}>{formatINR(c.revenue)}</td>
                  <td>{formatINR(c.averageDealValue)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
