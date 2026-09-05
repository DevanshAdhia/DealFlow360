import React from 'react';
import { NavLink } from 'react-router-dom';
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

export const CustomerSidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const { currentCustomer } = useCustomer();
  const { customerQuotations } = useQuotations();

  const negotiationCount = customerQuotations.filter(q => {
    const s = (q.status || '').toUpperCase().replace(/\s+/g, '_');
    return s === 'UNDER_NEGOTIATION' || s === 'NEGOTIATION';
  }).length;

  const initial = 'JC';

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
        {/* ── Brand (Matches Admin Sidebar exactly) ── */}
        <div className="ds-sidebar__brand">
          <div className="ds-brand-icon" aria-hidden="true">
            <Zap size={18} />
          </div>
          <div className="ds-brand-text">
            {/* Removed DealFlow360 text as requested */}
            <div className="ds-brand-subtitle">ENTERPRISE</div>
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

        {/* ── User card (Bordered card matching Admin Sidebar) ── */}
        <div className="ds-sidebar__user-box">
          <div className="ds-user-avatar" aria-hidden="true">{initial}</div>
          <div className="ds-user-info">
            <div className="ds-user-name">{currentCustomer?.contactName || 'John Carter'}</div>
            <div className="ds-user-email">{currentCustomer?.email || 'john@acme.com'}</div>
            <div className="ds-user-role">{currentCustomer?.companyName || 'Acme Corporation'} • Gold Tier</div>
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
            {customerQuotations.length > 0 && (
              <span className="ds-nav-badge" aria-label={`${customerQuotations.length} quotations`}>
                {customerQuotations.length}
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
            onClick={() => alert('Customer Portal Session: Logged out (Demo mode)')}
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
