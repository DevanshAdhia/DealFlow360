import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Bell, ChevronRight, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { useCustomer } from '../../context/CustomerContext.jsx';
import { mockNotifications } from '../../data/mockQuotations.js';

const getHeaderInfo = (pathname) => {
  if (pathname.includes('/dashboard')) {
    return {
      title: 'Customer Dashboard',
      subtitle: 'Review quotations, negotiate terms, and confirm approved proposals.',
      breadcrumb: ['Home', 'Dashboard']
    };
  }
  if (pathname.includes('/quotations') && pathname.includes('/reject')) {
    return {
      title: 'Quotation Feedback & Renegotiation',
      subtitle: 'Review commercial rejection details and evaluate next renegotiation steps.',
      breadcrumb: ['Home', 'Quotations', 'Rejected Terms']
    };
  }
  if (pathname.includes('/quotations/') && !pathname.endsWith('/quotations')) {
    return {
      title: 'Quotation Review',
      subtitle: 'Inspect line items, propose counter discounts, and confirm agreement.',
      breadcrumb: ['Home', 'Quotations', 'Review']
    };
  }
  if (pathname.includes('/quotations')) {
    return {
      title: 'My Quotations',
      subtitle: 'All active and historical commercial proposals from DealFlow360.',
      breadcrumb: ['Home', 'Quotations']
    };
  }
  if (pathname.includes('/negotiations')) {
    return {
      title: 'Active Negotiations',
      subtitle: 'Live commercial counter offers and discount requests with sales team.',
      breadcrumb: ['Home', 'Negotiations']
    };
  }
  if (pathname.includes('/profile')) {
    return {
      title: 'Company & Contact Profile',
      subtitle: 'Organization details, tier status, and billing parameters.',
      breadcrumb: ['Home', 'Profile']
    };
  }
  if (pathname.includes('/help')) {
    return {
      title: 'Help & Knowledge Center',
      subtitle: 'Common questions on commercial negotiations, governance and approval.',
      breadcrumb: ['Home', 'Help']
    };
  }
  return {
    title: 'Customer Portal',
    subtitle: 'DealFlow360 Enterprise Sales Portal',
    breadcrumb: ['Home', 'Portal']
  };
};

export const CustomerHeader = ({ onToggleSidebar }) => {
  const { currentCustomer } = useCustomer();
  const location = useLocation();
  const navigate = useNavigate();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);

  const { title, subtitle, breadcrumb } = getHeaderInfo(location.pathname);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (n) => {
    setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
    setNotifOpen(false);
    if (n.quotationId) {
      navigate(`/customer/quotations/${n.quotationId}`);
    }
  };

  const customerName = currentCustomer?.contactName || 'John Carter';
  const customerCompany = currentCustomer?.companyName || 'Acme Corporation';

  return (
    <header className="ds-header" role="banner">
      <div className="ds-header__left">
        {/* Mobile hamburger */}
        <button
          type="button"
          className="ds-header__menu-btn"
          onClick={onToggleSidebar}
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="ds-header__title-block">
          <h1 className="ds-header__page-title">{title}</h1>
          <p style={{ margin: '2px 0 0 0', fontSize: '0.8125rem', color: '#64748b' }}>
            {subtitle}
          </p>
        </div>
      </div>

      <div className="ds-header__right">
        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="ds-header__icon-btn"
            onClick={() => { setNotifOpen(v => !v); setProfileMenuOpen(false); }}
            aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
            aria-expanded={notifOpen}
            aria-haspopup="true"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="ds-header__notif-badge" aria-hidden="true">{unreadCount}</span>
            )}
          </button>

          {/* Notification Dropdown */}
          {notifOpen && (
            <div
              className="ds-notif-dropdown"
              role="dialog"
              aria-label="Notifications"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '360px',
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.15)',
                zIndex: 1000,
                overflow: 'hidden'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderBottom: '1px solid #f1f5f9',
                background: '#f8fafc'
              }}>
                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
                  Notifications ({unreadCount} unread)
                </span>
                <button
                  type="button"
                  onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                  style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Mark all as read
                </button>
              </div>

              <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
                    You're all caught up.
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #f8fafc',
                        background: n.read ? '#ffffff' : '#f0f7ff',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                        display: 'flex',
                        gap: '12px'
                      }}
                    >
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: n.read ? 'transparent' : '#2563eb',
                        marginTop: '6px',
                        flexShrink: 0
                      }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.8125rem', color: '#1e293b', fontWeight: n.read ? 500 : 600, lineHeight: 1.4 }}>
                          {n.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                          {n.time}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Customer Profile Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '6px 12px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            cursor: 'pointer'
          }}
          onClick={() => navigate('/customer/profile')}
        >
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.875rem'
          }}>
            {customerName.charAt(0)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
              {customerName}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.2 }}>
              {customerCompany}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
