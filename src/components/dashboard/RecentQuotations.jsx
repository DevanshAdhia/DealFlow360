import React from 'react';
import { 
  FileText, 
  Eye, 
  Edit3, 
  ArrowRight, 
  Plus, 
  ExternalLink,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatINR } from '../../utils/formatters.js';

export const RecentQuotations = ({ 
  quotations = [], 
  onViewQuote, 
  onEditQuote, 
  onContinueQuote,
  onResetFilters 
}) => {
  const navigate = useNavigate();

  const getStageBadgeClass = (stageKey) => {
    switch (stageKey) {
      case 'confirmed': return 'badge-success';
      case 'negotiation': return 'badge-primary';
      case 'pending_approval': return 'badge-warning';
      case 'draft':
      default: return 'badge-neutral';
    }
  };

  const getHealthBadgeClass = (healthKey) => {
    switch (healthKey) {
      case 'healthy': return 'badge-success';
      case 'at_risk': return 'badge-warning';
      case 'critical': return 'badge-error';
      default: return 'badge-neutral';
    }
  };

  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <div className="dash-card-title-group">
          <FileText size={20} color="var(--primary-500)" />
          <div>
            <h3 className="dash-card-title">Recent Quotations & CPQ Deals</h3>
            <span className="dash-card-subtitle">
              Showing {quotations.length} active quotations in workspace
            </span>
          </div>
        </div>

        <button 
          onClick={() => navigate('/quotations')}
          className="btn btn-primary"
          style={{ padding: '0.45rem 0.85rem', fontSize: '0.8125rem' }}
        >
          <Plus size={15} />
          <span>New Quotation</span>
        </button>
      </div>

      {quotations.length === 0 ? (
        <div className="empty-state-box">
          <div className="empty-state-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
            <Search size={22} color="var(--primary-500)" />
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.25rem' }}>
              No Quotations Found
            </h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              No quotations match your current search and filter combination.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={onResetFilters} className="btn btn-secondary">
              Reset Filters
            </button>
            <button onClick={() => navigate('/quotations')} className="btn btn-primary">
              <Plus size={14} />
              <span>Create First Quote</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="quotations-table-wrapper">
          <table className="quotations-table">
            <thead>
              <tr>
                <th>Quote ID</th>
                <th>Customer / Account</th>
                <th>Amount</th>
                <th>Stage</th>
                <th>Health</th>
                <th>Margin / Disc.</th>
                <th>Updated</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotations.map((quote) => (
                <tr key={quote.id}>
                  <td>
                    <button 
                      onClick={() => onViewQuote(quote)}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer',
                        padding: 0,
                        textAlign: 'left'
                      }}
                      title="Inspect quotation details"
                    >
                      <span className="quote-id-badge">{quote.id}</span>
                    </button>
                  </td>

                  <td>
                    <div className="quote-customer-cell">
                      <span className="quote-customer-name">{quote.customer}</span>
                      <span className="quote-contact-sub">{quote.contactPerson}</span>
                    </div>
                  </td>

                  <td>
                    <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                      {formatINR(quote.amount)}
                    </span>
                  </td>

                  <td>
                    <span className={`badge ${getStageBadgeClass(quote.stageKey)}`}>
                      {quote.stage}
                    </span>
                  </td>

                  <td>
                    <span className={`badge ${getHealthBadgeClass(quote.healthKey)}`}>
                      {quote.health}
                    </span>
                  </td>

                  <td>
                    <div style={{ fontSize: '0.75rem', display: 'flex', flexDirection: 'column' }}>
                      <span style={{ color: quote.margin >= 30 ? 'var(--color-success)' : 'var(--color-warning)', fontWeight: '600' }}>
                        {quote.margin}% Margin
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        {quote.discount}% Disc.
                      </span>
                    </div>
                  </td>

                  <td>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {quote.timeAgo}
                    </span>
                  </td>

                  <td>
                    <div className="table-actions-cell" style={{ justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => onViewQuote(quote)}
                        className="table-action-btn"
                        title="View Full Quotation Details"
                      >
                        <Eye size={13} />
                        <span>View</span>
                      </button>

                      <button
                        onClick={() => onEditQuote(quote)}
                        className="table-action-btn"
                        title="Edit Quote Configuration"
                      >
                        <Edit3 size={13} />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => onContinueQuote(quote)}
                        className="table-action-btn primary"
                        title={quote.stageKey === 'confirmed' ? 'View Agreement' : 'Advance Deal Stage'}
                      >
                        <span>{quote.stageKey === 'confirmed' ? 'View' : 'Continue'}</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
