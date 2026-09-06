import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X } from 'lucide-react';

export const NotificationPanel = ({ notifications = [], isOpen, onClose, onMarkRead }) => {
  const navigate = useNavigate();
  const panelRef = useRef(null);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <div className="notif-wrapper" ref={panelRef}>
      <button
        type="button"
        className="notif-bell-btn"
        onClick={() => isOpen ? onClose() : null}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Bell size={20} aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="notif-badge" aria-hidden="true">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notif-dropdown" role="dialog" aria-label="Notifications">
          <div className="notif-header">
            <span className="notif-title">Notifications</span>
            <button
              type="button"
              className="notif-close-btn"
              onClick={onClose}
              aria-label="Close notifications"
            >
              <X size={16} />
            </button>
          </div>

          <div className="notif-list">
            {notifications.length === 0 ? (
              <div className="notif-empty">No notifications yet.</div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className={`notif-item ${!n.read ? 'unread' : ''}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    onMarkRead?.(n.id);
                    onClose();
                    if (n.quotationId) navigate(`/customer/quotations/${n.quotationId}`);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onMarkRead?.(n.id);
                      onClose();
                      if (n.quotationId) navigate(`/customer/quotations/${n.quotationId}`);
                    }
                  }}
                  aria-label={`${n.title}, ${n.time}${!n.read ? ', unread' : ''}`}
                >
                  {!n.read && <div className="notif-unread-dot" aria-hidden="true" />}
                  <div className="notif-item-content">
                    <div className="notif-item-title">{n.title}</div>
                    <div className="notif-item-time">{n.time}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            type="button"
            className="notif-view-all"
            onClick={onClose}
          >
            View All Notifications
          </button>
        </div>
      )}
    </div>
  );
};
