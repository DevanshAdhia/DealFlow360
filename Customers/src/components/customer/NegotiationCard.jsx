import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Clock, ArrowRight } from 'lucide-react';

export const NegotiationCard = ({ quotation }) => {
  const navigate = useNavigate();
  const isResponse = quotation.lastMessage?.toLowerCase().includes('updated');

  return (
    <div className="negotiation-card">
      <div className="negotiation-card-header">
        <div className="negotiation-id">{quotation.id}</div>
        <span className="negotiation-status-badge">Under Negotiation</span>
      </div>

      <div className="negotiation-meta">
        <Clock size={13} aria-hidden="true" />
        <span>Last activity: {quotation.lastActivity || 'Unknown'}</span>
      </div>

      {quotation.lastMessage && (
        <div className="negotiation-message">
          <MessageSquare size={13} aria-hidden="true" />
          <span>"{quotation.lastMessage}"</span>
        </div>
      )}

      <button
        type="button"
        className={`btn ${isResponse ? 'btn-primary' : 'btn-negotiate'} btn-full`}
        onClick={() => navigate(`/customer/quotations/${quotation.id}`)}
        aria-label={`${isResponse ? 'Review Update' : 'Continue Negotiation'} for ${quotation.id}`}
      >
        <span>{isResponse ? 'Review Update' : 'Continue Negotiation'}</span>
        <ArrowRight size={14} aria-hidden="true" />
      </button>
    </div>
  );
};
