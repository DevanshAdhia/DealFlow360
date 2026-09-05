import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Zap, 
  Bell, 
  Menu, 
  Database, 
  LogOut, 
  UserCheck 
} from 'lucide-react';
import { NAVIGATION_CONFIG } from '../../config/navigationConfig.js';
import { HoverSubmenu } from './HoverSubmenu.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { NotificationModal } from './NotificationModal.jsx';
import { JsonInspectorModal } from '../common/JsonInspectorModal.jsx';

export const AppNavigation = ({ onMobileToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, switchDemoRole } = useAuth();
  const { success, info } = useToast();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showJsonModal, setShowJsonModal] = useState(false);

  const activeUser = user || {
    name: 'Alex Morgan',
    email: 'sales@dealflow360.demo',
    role: 'sales_rep',
    roleLabel: 'Sales Representative'
  };

  const currentPath = location.pathname;

  // Helper to check if top module is active based on path
  const isModuleActive = (item) => {
    if (item.key === 'dashboard') {
      return currentPath === '/dashboard' || currentPath === '/sales/dashboard' || currentPath === '/';
    }
    const baseSegment = item.key === 'dealHealth' ? 'deal-health' : item.key;
    return currentPath.includes(`/${baseSegment}`);
  };

  // Helper to extract active record ID from current path (if any)
  const extractActiveId = (moduleKey) => {
    const parts = currentPath.split('/').filter(Boolean);
    // e.g. ['sales', 'quotations', 'Q-1042'] -> Q-1042
    if (parts.length >= 3 && (parts[1] === moduleKey || parts[1] === (moduleKey === 'dealHealth' ? 'deal-health' : moduleKey))) {
      return parts[2];
    }
    if (parts.length >= 2 && (parts[0] === moduleKey || parts[0] === (moduleKey === 'dealHealth' ? 'deal-health' : moduleKey))) {
      return parts[1];
    }
    return null;
  };

  const handleLogout = () => {
    logout();
    success('Logged Out', 'You have been logged out successfully.');
    navigate('/login');
  };

  const handleRoleSwitch = (roleName) => {
    const newUser = switchDemoRole(roleName);
    setShowRoleSwitcher(false);
    info('Role Switched', `Switched workspace persona to ${newUser.roleLabel} (${newUser.name})`);
  };

  const initials = activeUser.name
    ? activeUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'AM';

  return (
    <header className="app-top-navbar" role="banner">
      {/* Left: Brand & Mobile Toggle */}
      <div className="top-navbar-left">
        {onMobileToggle && (
          <button
            type="button"
            onClick={onMobileToggle}
            className="top-nav-action-btn md:hidden"
            aria-label="Toggle menu"
          >
            <Menu size={18} />
          </button>
        )}

        <NavLink to="/sales/dashboard" className="top-navbar-brand" title="DealFlow360">
          <div className="brand-logo-icon">
            <Zap size={16} fill="#ffffff" />
          </div>
          <span>DealFlow360</span>
        </NavLink>
      </div>

      {/* Center: Module Navigation Pills & Submenus */}
      <nav className="top-navbar-links" aria-label="Main Navigation">
        {NAVIGATION_CONFIG.map((item) => {
          const active = isModuleActive(item);

          if (!item.hasSubmenu) {
            return (
              <NavLink
                key={item.key}
                to={item.path}
                className={`nav-pill-btn ${active ? 'active' : ''}`}
              >
                {item.label}
              </NavLink>
            );
          }

          const activeRecordId = extractActiveId(item.key);

          return (
            <HoverSubmenu
              key={item.key}
              item={item}
              activeRecordId={activeRecordId}
              isParentActive={active}
            />
          );
        })}
      </nav>

      {/* Right: Quick actions, Live JSON, Persona, Notifications */}
      <div className="top-navbar-right">
        {/* Live JSON Inspector */}
        <button
          type="button"
          onClick={() => setShowJsonModal(true)}
          className="top-nav-action-btn"
          title="Inspect Live System JSON Records"
          aria-label="Inspect Live JSON"
        >
          <Database size={16} />
        </button>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="top-nav-action-btn"
            title="System Notifications"
            aria-label="Notifications"
          >
            <Bell size={16} />
            <span
              style={{
                position: 'absolute',
                top: '5px',
                right: '6px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#ef4444'
              }}
            />
          </button>

          {showNotifications && (
            <NotificationModal onClose={() => setShowNotifications(false)} />
          )}
        </div>

        {/* User Persona Switcher */}
        <div style={{ position: 'relative' }}>
          <div
            className="top-nav-user-badge"
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
            title="Click to Switch Demo Persona"
          >
            <div className="top-nav-user-avatar">{initials}</div>
            <span className="top-nav-user-name">
              {activeUser.name}
            </span>
          </div>

          {showRoleSwitcher && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)',
                padding: '0.6rem',
                minWidth: '220px',
                zIndex: 100
              }}
            >
              <div style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Switch Persona
              </div>
              {[
                { key: 'sales_rep', name: 'Alex Morgan', label: 'Sales Representative' },
                { key: 'sales_manager', name: 'Marcus Vance', label: 'Sales Manager' },
                { key: 'finance', name: 'Elena Rostova', label: 'Finance Specialist' },
                { key: 'admin', name: 'Sarah Chen', label: 'System Admin' }
              ].map((role) => (
                <button
                  key={role.key}
                  type="button"
                  onClick={() => handleRoleSwitch(role.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '0.5rem 0.6rem',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: activeUser.role === role.key ? '#eff6ff' : 'transparent',
                    color: activeUser.role === role.key ? '#1e40af' : '#1e293b',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span>{role.name}</span>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{role.label}</span>
                </button>
              ))}

              <div style={{ borderTop: '1px solid #e2e8f0', margin: '0.4rem 0' }} />

              <button
                type="button"
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  width: '100%',
                  padding: '0.5rem 0.6rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#ef4444',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <LogOut size={14} />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Live JSON Inspector Modal */}
      {showJsonModal && (
        <JsonInspectorModal 
          isOpen={showJsonModal} 
          onClose={() => setShowJsonModal(false)} 
        />
      )}
    </header>
  );
};
