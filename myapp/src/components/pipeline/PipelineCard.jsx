import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building, 
  Calendar, 
  ArrowRight, 
  ShieldAlert, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useToast } from '../../hooks/useToast.js';
import { formatINR } from '../../utils/formatters.js';

export const PipelineCard = ({ quote, onMoveStage }) => {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const getHealthBadge = (health) => {
    switch (health) {
      case 'Healthy': return <span className="badge badge-success">Healthy</span>;
      case 'At Risk': return <span className="badge badge-warning">At Risk</span>;
      case 'Critical': return <span className="badge badge-error">Critical</span>;
      default: return <span className="badge badge-neutral">{health || 'Normal'}</span>;
    }
  };

  const handleStageSelect = (e) => {
    e.stopPropagation();
    const newStage = e.target.value;
    if (newStage === quote.stage) return;

    const res = onMoveStage(quote.id, newStage);
    if (res && res.success) {
      success('Stage Updated', `${quote.id} moved to ${newStage.replace('_', ' ')}.`);
    } else if (res && res.error) {
      error('Governance Violation', res.error);
    }
  };

  return (
    <div 
      className="kanban-deal-card"
      onClick={() => navigate(`/quotations/${quote.id}`)}
    >
      <div className="kanban-card-top">
        <span className="quote-id-badge">{quote.id}</span>
        {getHealthBadge(quote.health)}
      </div>

      <div className="kanban-card-customer">
        {quote.customerName || quote.customer}
      </div>

      <div className="kanban-card-amount">
        {formatINR(quote.total || quote.subtotal || 0)}
      </div>

      <div className="kanban-card-meta-row">
        <span>Rep: {quote.salesRepName || 'Alex Morgan'}</span>
        <span>Valid: {quote.validUntil || '30 days'}</span>
      </div>

      {/* Stage Mover Selector */}
      <div className="kanban-card-actions" onClick={(e) => e.stopPropagation()}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Move Stage:</span>
        <select
          value={quote.stage}
          onChange={handleStageSelect}
          className="stage-move-select"
        >
          <option value="draft">Draft</option>
          <option value="pending_approval">Pending Approval</option>
          <option value="negotiation">Negotiation</option>
          <option value="confirmed">Confirmed</option>
        </select>
      </div>
    </div>
  );
};
