import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  TrendingUp, 
  Users, 
  CheckSquare, 
  Package, 
  Building2, 
  Zap, 
  ChevronLeft, 
  ChevronRight, 
  PlusCircle, 
  Activity, 
  CreditCard, 
  BarChart3, 
  LogOut, 
  UserCheck, 
  Layers, 
  ShieldCheck,
  Code
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { NAVIGATION_CONFIG } from '../../config/navigationConfig.js';

const SidebarNavItem = ({ item, isCollapsed, closeMobile, currentPath }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = item.icon || FileText;
  
  // Use a fallback icon mapping since config doesn't have icons
  const iconMap = {
    dashboard: LayoutDashboard,
    quotations: FileText,
    approvals: CheckSquare,
    fulfillment: Package,
    subscriptions: Layers,
    invoices: CreditCard,
    dealHealth: Activity,
    reports: BarChart3,
    products: Package
  };
  const ResolvedIcon = iconMap[item.key] || Icon;

  const isActive = currentPath.includes(item.path);

  if (!item.hasSubmenu) {
    return (
      <NavLink
        to={item.path}
        onClick={closeMobile}
        style={({ isActive: isLinkActive }) => ({
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.625rem 0.875rem',
          borderRadius: '0 8px 8px 0',
          textDecoration: 'none',
          color: isLinkActive || isActive ? '#6366f1' : '#64748b',
          backgroundColor: isLinkActive || isActive ? '#eff6ff' : 'transparent',
          fontWeight: isLinkActive || isActive ? '600' : '500',
          marginBottom: '2px',
          borderLeft: isLinkActive || isActive ? '4px solid #6366f1' : '4px solid transparent',
          transition: 'all 150ms ease'
        })}
        title={isCollapsed ? item.label : undefined}
      >
        <ResolvedIcon size={18} />
        {!isCollapsed && <span style={{ fontSize: '0.8125rem' }}>{item.label}</span>}
      </NavLink>
    );
  }

  return (
    <div style={{ marginBottom: '2px' }}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '0.625rem 0.875rem',
          borderRadius: '0 8px 8px 0',
          border: 'none',
          borderLeft: isActive ? '4px solid #6366f1' : '4px solid transparent',
          background: 'transparent',
          color: isActive ? '#6366f1' : '#64748b',
          backgroundColor: isActive && !isExpanded ? '#eff6ff' : 'transparent',
          cursor: 'pointer',
          fontWeight: isActive ? '600' : '500',
          transition: 'all 150ms ease'
        }}
        title={isCollapsed ? item.label : undefined}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ResolvedIcon size={18} />
          {!isCollapsed && <span style={{ fontSize: '0.8125rem' }}>{item.label}</span>}
        </div>
        {!isCollapsed && (
          <ChevronRight 
            size={16} 
            style={{ 
              transform: isExpanded ? 'rotate(90deg)' : 'rotate(0)',
              transition: 'transform 150ms ease'
            }} 
          />
        )}
      </button>

      {isExpanded && !isCollapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '2.5rem', marginTop: '2px' }}>
          {item.children.map(child => {
            let childPath = child.path || child.pathTemplate?.replace(child.paramKey, item.defaultDetailId);
            return (
              <NavLink
                key={child.key}
                to={childPath}
                onClick={closeMobile}
                style={({ isActive: isLinkActive }) => ({
                  padding: '0.4rem 0.5rem',
                  fontSize: '0.75rem',
                  color: isLinkActive ? '#6366f1' : '#64748b',
                  textDecoration: 'none',
                  fontWeight: isLinkActive ? '600' : '500',
                  borderRadius: '4px',
                  backgroundColor: isLinkActive ? '#eff6ff' : 'transparent',
                })}
              >
                {child.label}
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const Sidebar = ({ isCollapsed, toggleCollapse, mobileOpen, closeMobile }) => {
  const { user, logout, switchDemoRole } = useAuth();
  const { success, info } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  
  // Default to Sales Persona (Alex Morgan) if not logged in or in Sales mode
  const activeUser = user || {
    name: 'Alex Morgan',
    email: 'sales@dealflow360.demo',
    role: 'sales_rep',
    roleLabel: 'Sales Representative',
    department: 'Enterprise Sales'
  };

  const isSalesSide = activeUser.role === 'sales_rep' || activeUser.role === 'sales_manager' || !user;

  // Group 1: SALES PIPELINE (Matching Sales Suite Architecture)
  const salesNavItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Products & Catalog', icon: Package, path: '/sales/products' },
    { label: 'Quotations', icon: FileText, path: '/quotations' },
    { label: 'New Quotation', icon: PlusCircle, path: '/quotations/new' },
    { label: 'Sales Pipeline', icon: TrendingUp, path: '/pipeline' },
  ];

  // Group 2: GOVERNANCE & REVOPS
  const governanceNavItems = [
    { label: 'Deal Health', icon: Activity, path: '/deal-health' },
    { label: 'Reports & Analytics', icon: BarChart3, path: '/reports' },
    { label: 'Approvals', icon: CheckSquare, path: '/approvals' },
    { label: 'Fulfillment', icon: Package, path: '/fulfillment' },
    { label: 'Invoices', icon: FileText, path: '/invoices' },
    { label: 'Billing & Schedules', icon: CreditCard, path: '/billing' },
  ];

  // Admin Nav Items fallback if switched to Admin role
  const adminNavItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Products & Catalog', icon: Package, path: '/sales/products' },
    { label: 'Users & Roles', icon: Users, path: '/settings' },
    { label: 'Customers', icon: Building2, path: '/customers' },
    { label: 'Quotations', icon: FileText, path: '/quotations' },
    { label: 'Pipeline', icon: TrendingUp, path: '/pipeline' },
    { label: 'Approvals', icon: CheckSquare, path: '/approvals' },
    { label: 'Invoices', icon: FileText, path: '/invoices' },
    { label: 'Reports & Analytics', icon: BarChart3, path: '/reports' }
  ];

  const handleLogout = () => {
    logout();
    success('Logged Out', 'You have been logged out successfully.');
    navigate('/login');
  };

  const handleRoleSwitch = (roleName) => {
    const newUser = switchDemoRole(roleName);
    setShowRoleSwitcher(false);
    info('Role Switched', `Switched workspace persona to ${newUser.roleLabel} (${newUser.name})`);
    if (mobileOpen) closeMobile();
  };

  // Initials for avatar
  const initials = activeUser.name
    ? activeUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'AM';

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div 
          style={styles.backdrop} 
          className="sidebar-backdrop"
          onClick={closeMobile} 
        />
      )}

      <aside 
        style={{
          ...styles.sidebar,
          width: isCollapsed ? '76px' : '240px'
        }}
        className={`app-sidebar ${mobileOpen ? 'mobile-open' : ''}`}
      >
        {/* Brand Header */}
        <div style={styles.brandContainer}>
          <div style={styles.logoGroup}>
            <div style={styles.logoBox}>
              <Zap size={18} color="#6366f1" fill="#6366f1" />
            </div>
            {!isCollapsed && (
              <div style={styles.brandTextGroup}>
                <span style={styles.brandName}>DealFlow360</span>
                <span style={styles.brandTag}>
                  {isSalesSide ? 'INTERNAL SALES' : 'ENTERPRISE ADMIN'}
                </span>
              </div>
            )}
          </div>

          <button 
            onClick={toggleCollapse} 
            style={styles.collapseBtn}
            className="btn-icon"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* User Card (Moved to Top) */}
        {!isCollapsed && (
          <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
            <div 
              style={styles.userCard}
              onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
              title="Click to switch persona (Sales Rep, Sales Manager, Finance, Admin)"
            >
              <div style={styles.avatarCircle}>
                {initials}
              </div>
              <div style={styles.userInfo}>
                <div style={styles.userName}>{activeUser.name}</div>
                <div style={styles.userEmail}>{activeUser.email}</div>
                <div style={styles.userRole}>{activeUser.roleLabel || 'Sales Representative'}</div>
              </div>
            </div>

            {/* Persona Switcher Dropdown */}
            {showRoleSwitcher && (
              <div style={{...styles.roleDropdown, position: 'absolute', top: '100%', left: '0.875rem', right: '0.875rem', zIndex: 50}}>
                <div style={styles.roleDropdownHeader}>Select Workspace Persona</div>
                {[
                  { role: 'sales_rep', name: 'Alex Morgan (Sales Rep)' },
                  { role: 'sales_manager', name: 'Sarah Jenkins (Sales Manager)' },
                  { role: 'finance', name: 'Marcus Vance (Finance / Ops)' },
                  { role: 'admin', name: 'David Sterling (System Admin)' }
                ].map((r) => (
                  <button
                    key={r.role}
                    onClick={() => handleRoleSwitch(r.role)}
                    style={{
                      ...styles.roleOption,
                      ...(activeUser.role === r.role ? styles.roleOptionActive : {})
                    }}
                  >
                    {r.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}


        {/* Navigation Links */}
        <nav style={styles.navContainer}>
          <div style={styles.navGroupLabel}>
            {!isCollapsed ? (isSalesSide ? 'SALES OPERATIONS' : 'ADMINISTRATION') : '•••'}
          </div>

          {NAVIGATION_CONFIG.map((item) => (
            <SidebarNavItem 
              key={item.key} 
              item={item} 
              isCollapsed={isCollapsed} 
              closeMobile={closeMobile}
              currentPath={location.pathname}
            />
          ))}

        </nav>

        {/* Footer with Logout */}
        <div style={styles.footerContainer}>
          <button 
            onClick={handleLogout}
            style={styles.logoutBtn}
            className="sidebar-logout-btn"
          >
            <LogOut size={16} color="#64748b" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

const styles = {
  backdrop: {
    display: 'none',
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    backdropFilter: 'blur(2px)',
    zIndex: 40
  },
  sidebar: {
    height: '100vh',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #f1f5f9',
    display: 'flex',
    flexDirection: 'column',
    position: 'sticky',
    top: 0,
    zIndex: 45,
    transition: 'width 200ms ease'
  },
  brandContainer: {
    height: '56px',
    padding: '0 1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #f8fafc'
  },
  logoGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem'
  },
  logoBox: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: '#eff6ff',
    border: '1px solid #dbeafe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  brandTextGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  brandName: {
    fontSize: '0.95rem',
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: '1.2'
  },
  brandTag: {
    fontSize: '0.625rem',
    color: '#6366f1',
    fontWeight: '700',
    letterSpacing: '0.06em'
  },
  collapseBtn: {
    color: '#94a3b8',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '4px'
  },
  userCard: {
    margin: '0.75rem 0.875rem 0.25rem 0.875rem',
    padding: '0.625rem 0.75rem',
    borderRadius: '10px',
    backgroundColor: '#ffffff',
    border: '1px solid #f1f5f9',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    cursor: 'pointer',
    transition: 'all 150ms ease'
  },
  avatarCircle: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#ede9fe',
    color: '#6366f1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '0.8125rem',
    flexShrink: 0
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  userName: {
    fontSize: '0.8125rem',
    fontWeight: '700',
    color: '#0f172a',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden'
  },
  userEmail: {
    fontSize: '0.6875rem',
    color: '#94a3b8',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden'
  },
  userRole: {
    fontSize: '0.725rem',
    fontWeight: '600',
    color: '#334155',
    marginTop: '1px'
  },
  roleDropdown: {
    margin: '0 0.875rem 0.5rem 0.875rem',
    padding: '0.5rem',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  roleDropdownHeader: {
    fontSize: '0.6875rem',
    fontWeight: '700',
    color: '#94a3b8',
    padding: '0.25rem 0.5rem'
  },
  roleOption: {
    background: 'none',
    border: 'none',
    color: '#334155',
    textAlign: 'left',
    padding: '0.4rem 0.5rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    cursor: 'pointer'
  },
  roleOptionActive: {
    backgroundColor: '#eef2ff',
    color: '#6366f1',
    fontWeight: '600'
  },
  navContainer: {
    flex: 1,
    padding: '0.625rem 0.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    overflowY: 'auto'
  },
  navGroupLabel: {
    fontSize: '0.65rem',
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: '0.06em',
    padding: '0.35rem 0.625rem',
    textTransform: 'uppercase'
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem 0.625rem',
    borderRadius: '8px',
    color: '#64748b',
    fontSize: '0.8125rem',
    fontWeight: '500',
    textDecoration: 'none',
    transition: 'all 120ms ease'
  },
  navLinkActive: {
    backgroundColor: '#eef2ff',
    color: '#4f46e5',
    fontWeight: '600'
  },
  navLabel: {
    flex: 1,
    whiteSpace: 'nowrap'
  },
  footerContainer: {
    padding: '0.875rem',
    borderTop: '1px solid #f8fafc',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem'
  },
  logoutBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    color: '#475569',
    fontSize: '0.8125rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 150ms ease',
    boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
  }
};
