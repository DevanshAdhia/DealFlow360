import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight } from 'lucide-react';

export const AttentionCard = ({ quotation, message, actionLabel = 'Review Quotation' }) => {
  const navigate = useNavigate();

  return (
    <div className="attention-card" role="alert">
      <div className="attention-card-left">
        <div className="attention-icon">
          <AlertTriangle size={16} aria-hidden="true" />
        </div>
        <div className="attention-body">
          <div className="attention-id">{quotation.id}</div>
          <div className="attention-message">{message}</div>
        </div>
      </div>
      <button
        type="button"
        className="btn btn-attention"
        onClick={() => navigate(`/customer/quotations/${quotation.id}`)}
        aria-label={`${actionLabel} for ${quotation.id}`}
      >
        <span>{actionLabel}</span>
        <ArrowRight size={14} aria-hidden="true" />
      </button>
    </div>
  );
};
