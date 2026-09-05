import React from 'react';
import { formatINR } from '../../utils/formatters.js';

export const ProductAnalyticsTab = ({
  products = []
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="analytics-table-card">
        <div className="analytics-table-header">
          <div>
            <h3>Product Line Performance & Discount Leakage</h3>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Revenue contributions, volume velocity, and applied discount rates by catalog item
            </span>
          </div>
        </div>

        <table className="analytics-table">
          <thead>
            <tr>
              <th>Product Line</th>
              <th>Category</th>
              <th>Units Sold</th>
              <th>Realized Revenue</th>
              <th>Avg Discount Applied</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No product sales records match current filter criteria.
                </td>
              </tr>
            ) : (
              products.map((p, idx) => (
                <tr key={idx}>
                  <td>
                    <strong style={{ color: 'var(--text-primary)' }}>{p.product}</strong>
                  </td>
                  <td>
                    <span className="badge badge-neutral">{p.category}</span>
                  </td>
                  <td>{p.unitsSold} units</td>
                  <td style={{ fontWeight: '700', color: 'var(--color-success)' }}>
                    {formatINR(p.revenue)}
                  </td>
                  <td>
                    <span className={`badge ${p.averageDiscount > 15 ? 'badge-error' : p.averageDiscount > 10 ? 'badge-warning' : 'badge-neutral'}`}>
                      {p.averageDiscount}%
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-success">Active</span>
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
