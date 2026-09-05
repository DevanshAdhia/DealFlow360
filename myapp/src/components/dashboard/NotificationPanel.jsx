import React, { useState } from 'react';
import { 
  Bell, 
  AlertCircle, 
  Check, 
  Info, 
  X, 
  CheckCircle2 
} from 'lucide-react';
import { NOTIFICATIONS_DATA } from '../../data/dashboard.js';

export const NotificationPanel = ({ notifications = NOTIFICATIONS_DATA }) => {
  const [items, setItems] = useState(notifications);

  const markAllRead = () => {
    setItems(items.map(n => ({ ...n, read: true })));
  };

  const removeItem = (id) => {
    setItems(items.filter(n => n.id !== id));
  };

  const unreadCount = items.filter(n => !n.read).length;

  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <div className="dash-card-title-group">
          <Bell size={20} color="var(--primary-500)" />
          <div>
            <h3 className="dash-card-title">Live System Notifications</h3>
            <span className="dash-card-subtitle">
              Real-time threshold alerts and customer portal redlines
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {unreadCount > 0 && (
            <span className="badge badge-primary">{unreadCount} unread</span>
          )}
          <button 
            onClick={markAllRead} 
            className="btn btn-outline"
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
          >
            Mark all read
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {items.length === 0 ? (
          <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
            All notifications cleared
          </div>
        ) : (
          items.map((n) => (
            <div 
              key={n.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '0.75rem',
                backgroundColor: n.read ? 'var(--bg-surface-2)' : 'rgba(59, 130, 246, 0.08)',
                border: `1px solid ${n.read ? 'var(--border-subtle)' : 'rgba(59, 130, 246, 0.25)'}`,
                borderRadius: 'var(--radius-md)'
              }}
            >
              <div style={{ paddingTop: '2px' }}>
                {n.type === 'alert' && <AlertCircle size={16} color="var(--color-warning)" />}
                {n.type === 'success' && <CheckCircle2 size={16} color="var(--color-success)" />}
                {n.type === 'info' && <Info size={16} color="var(--primary-500)" />}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {n.title}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {n.time}
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {n.message}
                </p>
              </div>

              <button 
                onClick={() => removeItem(n.id)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                title="Dismiss notification"
              >
                <X size={13} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
