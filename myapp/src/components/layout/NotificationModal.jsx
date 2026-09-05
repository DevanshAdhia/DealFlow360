import React, { useState } from 'react';
import { Bell, Check, AlertCircle, FileText, X } from 'lucide-react';
import { motion } from 'framer-motion';

const INITIAL_NOTIFICATIONS = [
  {
    id: 'n-1',
    title: 'Discount Threshold Alert',
    message: 'Quote #Q-1049 requested a 22% discount requiring Finance VP approval.',
    time: '12 mins ago',
    type: 'alert',
    read: false
  },
  {
    id: 'n-2',
    title: 'Quote Approved',
    message: 'Sarah Jenkins approved Enterprise Agreement #Q-1042.',
    time: '1 hour ago',
    type: 'approval',
    read: false
  },
  {
    id: 'n-3',
    title: 'New Customer Activity',
    message: 'Elena Rostova viewed Quote #Q-1044 on Customer Portal.',
    time: '3 hours ago',
    type: 'info',
    read: true
  }
];

export const NotificationModal = ({ onClose }) => {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.98 }}
      style={styles.popover}
      className="glass-panel"
    >
      <div style={styles.header}>
        <div style={styles.titleGroup}>
          <Bell size={18} color="var(--primary-500)" />
          <h4 style={styles.title}>Notifications</h4>
          <span className="badge badge-primary">{notifications.filter(n => !n.read).length} new</span>
        </div>
        <button onClick={markAllRead} style={styles.markReadBtn}>
          Mark all as read
        </button>
      </div>

      <div style={styles.list}>
        {notifications.length === 0 ? (
          <div style={styles.emptyState}>No notifications</div>
        ) : (
          notifications.map((n) => (
            <div 
              key={n.id} 
              style={{
                ...styles.item,
                backgroundColor: n.read ? 'transparent' : 'rgba(59, 130, 246, 0.06)'
              }}
            >
              <div style={styles.itemIcon}>
                {n.type === 'alert' && <AlertCircle size={18} color="var(--color-warning)" />}
                {n.type === 'approval' && <Check size={18} color="var(--color-success)" />}
                {n.type === 'info' && <FileText size={18} color="var(--primary-500)" />}
              </div>
              <div style={styles.itemContent}>
                <div style={styles.itemHeader}>
                  <span style={styles.itemTitle}>{n.title}</span>
                  <span style={styles.itemTime}>{n.time}</span>
                </div>
                <p style={styles.itemMessage}>{n.message}</p>
              </div>
              <button onClick={() => removeNotification(n.id)} style={styles.itemDismiss}>
                <X size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      <div style={styles.footer}>
        <button onClick={onClose} style={styles.closeFooterBtn} className="btn btn-secondary">
          Close Notifications
        </button>
      </div>
    </motion.div>
  );
};

const styles = {
  popover: {
    position: 'absolute',
    top: 'calc(100% + 12px)',
    right: 0,
    width: '380px',
    maxWidth: '90vw',
    backgroundColor: 'var(--bg-surface-1)',
    border: '1px solid var(--border-medium)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-lg)',
    zIndex: 100,
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid var(--border-subtle)'
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  title: {
    fontSize: '0.9375rem',
    fontWeight: '700'
  },
  markReadBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--primary-500)',
    fontSize: '0.775rem',
    cursor: 'pointer',
    fontWeight: '600'
  },
  list: {
    maxHeight: '320px',
    overflowY: 'auto'
  },
  emptyState: {
    padding: '2rem',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '0.875rem'
  },
  item: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    padding: '0.875rem 1.25rem',
    borderBottom: '1px solid var(--border-subtle)',
    position: 'relative'
  },
  itemIcon: {
    paddingTop: '0.125rem'
  },
  itemContent: {
    flex: 1
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.25rem'
  },
  itemTitle: {
    fontSize: '0.8125rem',
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  itemTime: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)'
  },
  itemMessage: {
    fontSize: '0.775rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4'
  },
  itemDismiss: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '0.25rem'
  },
  footer: {
    padding: '0.75rem 1.25rem',
    borderTop: '1px solid var(--border-subtle)',
    backgroundColor: 'var(--bg-dark-secondary)'
  },
  closeFooterBtn: {
    width: '100%',
    padding: '0.375rem'
  }
};
