import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, 
  Copy, 
  Archive, 
  RotateCcw, 
  Building, 
  Calendar, 
  ArrowRight,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { useToast } from '../../hooks/useToast.js';
import { formatINR } from '../../utils/formatters.js';

export const QuotationCard = ({ 
  quote, 
  onDuplicate, 
  onArchive, 
  onRestore, 
  onMoveStage 
}) => {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const getStageBadge = (stage) => {
    switch (stage) {
      case 'confirmed': return <span className="badge badge-success">Confirmed</span>;
      case 'negotiation': return <span className="badge badge-primary">Negotiation</span>;
      case 'pending_approval': return <span className="badge badge-warning">Pending Approval</span>;
      case 'draft':
      default: return <span className="badge badge-neutral">Draft</span>;
    }
  };

  const getHealthBadge = (health) => {
    switch (health) {
      case 'Healthy': return <span className="badge badge-success">Healthy</span>;
      case 'At Risk': return <span className="badge badge-warning">At Risk</span>;
      case 'Critical': return <span className="badge badge-error">Critical</span>;
      default: return <span className="badge badge-neutral">{health}</span>;
    }
  };

  const handleStageChange = (newStage) => {
    if (quote.stage === newStage) return;
    const res = onMoveStage(quote.id, newStage);
    if (res && res.success) {
      success('Stage Updated', `${quote.id} moved to ${newStage.replace('_', ' ')}.`);
    } else if (res && res.error) {
      error('Invalid Stage Movement', res.error);
    }
  };

  return (
    <div className="quote-card-item">
      <div className="quote-card-top">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <button
            onClick={() => navigate(`/quotations/${quote.id}`)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}
          >
            <span className="quote-id-badge" style={{ fontSize: '1rem' }}>{quote.id}</span>
          </button>
          <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-primary)' }}>
            {quote.customerName || quote.customer}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {quote.contactPerson || quote.contactEmail}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
          {getStageBadge(quote.stage)}
          {getHealthBadge(quote.health)}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
            Quotation Value (INR)
          </span>
          <span style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-primary)' }}>
            {formatINR(quote.total || quote.subtotal || 0)}
          </span>
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
          <span>{quote.discount || 0}% discount</span>
          <br />
          <span style={{ color: 'var(--text-muted)' }}>{(quote.items || []).length} line items</span>
        </div>
      </div>

      <div className="quote-card-meta">
        <span>Rep: {quote.salesRepName || 'Alex Morgan'}</span>
        <span>Valid: {quote.validUntil || '30 days'}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', paddingTop: '0.5rem' }}>
        {!quote.isArchived && (
          <select
            value={quote.stage}
            onChange={(e) => handleStageChange(e.target.value)}
            className="stage-move-select"
            style={{ flex: 1 }}
          >
            <option value="draft">Draft</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="negotiation">Negotiation</option>
            <option value="confirmed">Confirmed</option>
          </select>
        )}

        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <button
            onClick={() => onDuplicate(quote.id)}
            className="table-action-btn"
            title="Duplicate"
          >
            <Copy size={13} />
          </button>
          {quote.isArchived ? (
            <button
              onClick={() => onRestore(quote.id)}
              className="table-action-btn"
              title="Restore"
            >
              <RotateCcw size={13} />
            </button>
          ) : (
            <button
              onClick={() => onArchive(quote.id)}
              className="table-action-btn"
              title="Archive"
            >
              <Archive size={13} />
            </button>
          )}
          <button
            onClick={() => navigate(`/quotations/${quote.id}`)}
            className="table-action-btn primary"
            title="View Details"
          >
            <Eye size={13} />
            <span>Open</span>
          </button>
        </div>
      </div>
    </div>
  );
};
