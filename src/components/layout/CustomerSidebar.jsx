import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  User,
  HelpCircle,
  LogOut,
  Zap,
  ChevronLeft,
  X
} from 'lucide-react';
import { useCustomer } from '../../context/CustomerContext.jsx';
import { useQuotations } from '../../context/QuotationContext.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { clearSession } from '../../utils/storage.js';

export const CustomerSidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const navigate = useNavigate();
  const { currentCustomer } = useCustomer();
  const { quotations, customerQuotations } = useQuotations();
  const { user, logout } = useAuth();

  const safeQuotes = Array.isArray(customerQuotations) ? customerQuotations : (Array.isArray(quotations) ? quotations : []);

  const negotiationCount = safeQuotes.filter(q => {
    const s = (q.status || '').toUpperCase().replace(/\s+/g, '_');
    return s === 'UNDER_NEGOTIATION' || s === 'NEGOTIATION';
  }).length;

  const storedUserRaw = localStorage.getItem('dealflow360_user') || localStorage.getItem('user');
  let activeUser = user;
  if (!activeUser && storedUserRaw) {
    try { activeUser = JSON.parse(storedUserRaw); } catch {}
  }

  const displayName = activeUser?.name || currentCustomer?.contactName || 'Om';
  const displayEmail = activeUser?.email || currentCustomer?.email || 'om@gmail.com';
  const displayCompany = activeUser?.company || currentCustomer?.companyName || `${displayName}'s Business`;

  const initial = displayName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'OM';

  const handleLogout = () => {
    if (logout) logout();
    clearSession();
    if (onClose) onClose();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div className="sidebar-backdrop" onClick={onClose} aria-hidden="true" />
      )}

      <aside
        className={`ds-sidebar ${isOpen ? 'ds-sidebar--open' : ''} ${isCollapsed ? 'ds-sidebar--collapsed' : ''}`}
        aria-label="Main navigation"
      >
        {/* ── Brand ── */}
        <div className="ds-sidebar__brand">
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer' }}
            onClick={() => navigate('/customer/dashboard')}
            title="Go to Customer Dashboard"
          >
            <div className="ds-brand-icon" aria-hidden="true">
              <Zap size={18} />
            </div>
            <div className="ds-brand-text">
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>DealFlow360</span>
              <div className="ds-brand-subtitle">CUSTOMER PORTAL</div>
            </div>
          </div>

          {/* Collapse icon */}
          <button
            type="button"
            className="ds-brand-collapse-btn"
            onClick={onToggleCollapse}
            aria-label="Collapse sidebar"
          >
            <ChevronLeft size={16} />
          </button>
          {/* Mobile close */}
          <button
            type="button"
            className="ds-sidebar__close-btn"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── User card (Clickable to go to Profile) ── */}
        <div 
          className="ds-sidebar__user-box"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/customer/profile')}
          title="View Customer Profile"
        >
          <div className="ds-user-avatar" aria-hidden="true">{initial}</div>
          <div className="ds-user-info">
            <div className="ds-user-name">{displayName}</div>
            <div className="ds-user-email">{displayEmail}</div>
            <div className="ds-user-role">{displayCompany} • Gold Tier</div>
          </div>
        </div>

        {/* ── Navigation ── */}
        <nav className="ds-sidebar__nav" aria-label="Portal navigation">
          <div className="ds-nav-section-label">CUSTOMER WORKSPACE</div>

          <NavLink
            to="/customer/dashboard"
            className={({ isActive }) => `ds-nav-link ${isActive ? 'ds-nav-link--active' : ''}`}
            onClick={onClose}
            title="Dashboard"
          >
            <LayoutDashboard size={18} aria-hidden="true" />
            <span className="ds-nav-label">Dashboard</span>
          </NavLink>

          <NavLink
            to="/customer/quotations"
            className={({ isActive }) => `ds-nav-link ${isActive ? 'ds-nav-link--active' : ''}`}
            onClick={onClose}
            title="Quotations"
          >
            <FileText size={18} aria-hidden="true" />
            <span className="ds-nav-label">Quotations</span>
            {safeQuotes.length > 0 && (
              <span className="ds-nav-badge" aria-label={`${safeQuotes.length} quotations`}>
                {safeQuotes.length}
              </span>
            )}
          </NavLink>

          <NavLink
            to="/customer/negotiations"
            className={({ isActive }) => `ds-nav-link ${isActive ? 'ds-nav-link--active' : ''}`}
            onClick={onClose}
            title="Negotiations"
          >
            <MessageSquare size={18} aria-hidden="true" />
            <span className="ds-nav-label">Negotiations</span>
            {negotiationCount > 0 && (
              <span className="ds-nav-badge ds-nav-badge--amber" aria-label={`${negotiationCount} active`}>
                {negotiationCount}
              </span>
            )}
          </NavLink>

          <NavLink
            to="/customer/profile"
            className={({ isActive }) => `ds-nav-link ${isActive ? 'ds-nav-link--active' : ''}`}
            onClick={onClose}
            title="Profile"
          >
            <User size={18} aria-hidden="true" />
            <span className="ds-nav-label">Profile</span>
          </NavLink>

          <NavLink
            to="/customer/help"
            className={({ isActive }) => `ds-nav-link ${isActive ? 'ds-nav-link--active' : ''}`}
            onClick={onClose}
            title="Help & FAQs"
          >
            <HelpCircle size={18} aria-hidden="true" />
            <span className="ds-nav-label">Help & FAQs</span>
          </NavLink>
        </nav>

        {/* ── Bottom Logout Button (Bordered button matching Admin Sidebar) ── */}
        <div className="ds-sidebar__bottom">
          <button
            type="button"
            className="ds-sidebar__logout-btn"
            onClick={handleLogout}
            aria-label="Logout"
            title="Logout"
          >
            <LogOut size={16} aria-hidden="true" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
