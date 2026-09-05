import React from 'react';
import { 
  Clock, 
  FilePlus, 
  CheckCircle2, 
  MessageSquare, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';

export const ActivityTimeline = ({ activities = [] }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'quote_created': return <FilePlus size={10} color="var(--primary-500)" />;
      case 'approval_requested': return <AlertCircle size={10} color="var(--color-warning)" />;
      case 'customer_replied': return <MessageSquare size={10} color="var(--primary-500)" />;
      case 'quote_confirmed': return <CheckCircle2 size={10} color="var(--color-success)" />;
      case 'margin_cleared': return <ShieldCheck size={10} color="var(--accent-teal)" />;
      default: return <Clock size={10} color="var(--text-muted)" />;
    }
  };

  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <div className="dash-card-title-group">
          <Clock size={20} color="var(--accent-purple)" />
          <div>
            <h3 className="dash-card-title">Deal Activity & Audit Trail</h3>
            <span className="dash-card-subtitle">
              Live feed of quote events, customer actions, and governance approvals
            </span>
          </div>
        </div>

        <span className="badge badge-neutral">Live Feed</span>
      </div>

      <div className="activity-feed-list">
        {activities.map((item) => (
          <div key={item.id} className="activity-feed-item">
            <div className="activity-feed-dot">
              {getActivityIcon(item.type)}
            </div>

            <div className="activity-item-header">
              <span className="activity-item-title">{item.title}</span>
              <span className="activity-item-time">{item.time}</span>
            </div>

            <p className="activity-item-desc">{item.description}</p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
              <img 
                src={item.avatar} 
                alt={item.user} 
                style={{ width: '16px', height: '16px', borderRadius: '50%', objectFit: 'cover' }} 
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {item.user} ({item.role})
              </span>
              <span className={`badge ${item.badgeClass}`} style={{ fontSize: '0.625rem', padding: '0.05rem 0.35rem', marginLeft: 'auto' }}>
                {item.badge}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
