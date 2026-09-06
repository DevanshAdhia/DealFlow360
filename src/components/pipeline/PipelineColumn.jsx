import React from 'react';
import { PipelineCard } from './PipelineCard.jsx';
import { 
  FileEdit, 
  Clock, 
  MessageSquare, 
  CheckCircle2, 
  Plus 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { formatINRAbbreviated } from '../../utils/formatters.js';

export const PipelineColumn = ({ 
  stageId, 
  title, 
  color, 
  quotes = [], 
  onMoveStage 
}) => {
  const navigate = useNavigate();

  const getStageIcon = () => {
    switch (stageId) {
      case 'draft': return <FileEdit size={16} color={color} />;
      case 'pending_approval': return <Clock size={16} color={color} />;
      case 'negotiation': return <MessageSquare size={16} color={color} />;
      case 'confirmed': return <CheckCircle2 size={16} color={color} />;
      default: return null;
    }
  };

  const totalValue = quotes.reduce((acc, q) => acc + (q.total || q.subtotal || 0), 0);

  return (
    <div className="kanban-column" style={{ '--column-accent': color }}>
      <div className="kanban-column-header">
        <div className="kanban-column-title-row">
          <div className="kanban-column-title">
            {getStageIcon()}
            <span>{title}</span>
            <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
              {quotes.length}
            </span>
          </div>

          {stageId === 'draft' && (
            <button
              onClick={() => navigate('/quotations/new')}
              className="btn-icon"
              style={{ padding: '0.2rem' }}
              title="Create new quotation"
            >
              <Plus size={16} color="var(--primary-500)" />
            </button>
          )}
        </div>

        <div className="kanban-column-total-val">
          {formatINRAbbreviated(totalValue)} Total Stage Volume
        </div>
      </div>

      <div className="kanban-cards-list">
        {quotes.length === 0 ? (
          <div style={{
            padding: '2rem 1rem',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.8125rem',
            border: '1px dashed var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            marginTop: '0.5rem'
          }}>
            No deals in {title}
          </div>
        ) : (
          quotes.map((quote) => (
            <PipelineCard
              key={quote.id}
              quote={quote}
              onMoveStage={onMoveStage}
            />
          ))
        )}
      </div>
    </div>
  );
};
