import React from 'react';
import { 
  AlertCircle, 
  CheckSquare, 
  ArrowRight, 
  Clock, 
  UserCheck, 
  Split, 
  Send 
} from 'lucide-react';

export const PendingActions = ({ 
  actions = [], 
  onResolveAction 
}) => {
  const getActionIcon = (type) => {
    switch (type) {
      case 'discount_approval': return AlertCircle;
      case 'negotiation_reply': return UserCheck;
      case 'fulfillment_issue': return Split;
      case 'expiry_warning': return Clock;
      default: return CheckSquare;
    }
  };

  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <div className="dash-card-title-group">
          <CheckSquare size={20} color="var(--color-warning)" />
          <div>
            <h3 className="dash-card-title">Pending Sales Actions</h3>
            <span className="dash-card-subtitle">
              {actions.length} actionable bottlenecks requiring sales rep resolution
            </span>
          </div>
        </div>

        <span className="badge badge-warning">
          {actions.length} Pending
        </span>
      </div>

      <div className="pending-actions-list">
        {actions.map((action) => {
          const Icon = getActionIcon(action.type);

          return (
            <div key={action.id} className="pending-action-item">
              <div className="pending-action-content">
                <div className="pending-action-title-row">
                  <span className={`badge ${action.badgeColor}`}>
                    {action.badge}
                  </span>
                  <span className="pending-action-title">{action.title}</span>
                </div>

                <p className="pending-action-desc">{action.description}</p>

                <div className="pending-action-footer">
                  <span className="quote-id-badge">{action.quoteId}</span>
                  <span>•</span>
                  <span>{action.customer}</span>
                  <span>•</span>
                  <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{action.amount}</span>
                  <span>•</span>
                  <span>{action.time}</span>
                </div>
              </div>

              <button
                onClick={() => onResolveAction(action)}
                className="btn btn-primary"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.775rem', flexShrink: 0 }}
              >
                <span>{action.actionLabel}</span>
                <ArrowRight size={13} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
