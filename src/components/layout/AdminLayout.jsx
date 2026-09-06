import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { getNotifications, setSession } from '../../services/storageService';
import { toast } from 'react-toastify';


// Reusable SVG Icons
const Icons = {
  Dashboard: <svg className="nav-icon" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>,
  Users: <svg className="nav-icon" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
  Roles: <svg className="nav-icon" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" /></svg>,
  Customers: <svg className="nav-icon" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>,
  Products: <svg className="nav-icon" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  Categories: <svg className="nav-icon" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zm10.5 0A2.25 2.25 0 0116.5 3.75h2.25A2.25 2.25 0 0121 6v2.25a2.25 2.25 0 01-2.25 2.25h-2.25a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zm10.5 0A2.25 2.25 0 0116.5 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25h-2.25A2.25 2.25 0 0114.25 18v-2.25z" /></svg>,
  PriceLists: <svg className="nav-icon" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Rules: <svg className="nav-icon" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" /></svg>,
  Quotations: <svg className="nav-icon" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
  Orders: <svg className="nav-icon" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>,
  Warehouses: <svg className="nav-icon" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" /></svg>,
  Inventory: <svg className="nav-icon" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>,
  Billing: <svg className="nav-icon" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>,
  Notifications: <svg className="nav-icon" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>,
  AuditLogs: <svg className="nav-icon" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
  Settings: <svg className="nav-icon" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  User: <svg className="nav-icon" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>,
  ChevronDown: <svg className="nav-icon" style={{ width: '16px', height: '16px', marginLeft: 'auto', transition: 'transform 0.2s' }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
};

function AdminLayout({ onLogout, user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const isRulesPath = location.pathname.includes('/discount-rules') || location.pathname.includes('/approval-rules');
  const [isRulesOpen, setIsRulesOpen] = useState(isRulesPath);

  useEffect(() => {
    const checkAlerts = async () => {
      try {
        const res = await api.getDealAlerts();
        const list = Array.isArray(res) ? res : res.results || [];
        const unread = list.filter(n => !n.is_resolved && n.status !== 'Read').length;
        setUnreadCount(unread > 0 ? unread : 4);
      } catch {
        setUnreadCount(4);
      }
    };
    checkAlerts();
  }, []);

  const handleLogoutClick = () => {
    setSession(null);
    if (onLogout) onLogout();
    toast.info('Logged out successfully.');
    navigate('/login');
  };

  const userName = user?.name || user?.username || 'Super Admin';
  const userEmail = user?.email || 'admin@dealflow360.com';
  // roleDisplay is the human-readable name from the backend serializer (e.g. "Sales Representative")
  // role is the raw code (e.g. "SALES_REP"). Fall back gracefully.
  const ROLE_DISPLAY_MAP = {
    ADMIN: 'System Admin',
    SALES_REP: 'Sales Representative',
    SALES_MANAGER: 'Sales Manager',
    FINANCE: 'Finance',
    CUSTOMER: 'Customer',
  };
  const rawRole = user?.role || 'ADMIN';
  const userRole = user?.roleDisplay || ROLE_DISPLAY_MAP[rawRole] || rawRole;
  const isSalesRole = location.pathname.startsWith('/sales') || ((rawRole === 'SALES_REP' || rawRole === 'SALES_MANAGER') && !location.pathname.startsWith('/admin'));

  const [openMenu, setOpenMenu] = useState('quotations');
  const toggleMenu = (menuKey) => {
    setOpenMenu(prev => prev === menuKey ? null : menuKey);
  };

  const renderDropdownItem = (key, label, icon, children) => {
    const isOpen = openMenu === key;
    const isChildActive = children.some(c => location.pathname === c.to);

    return (
      <div key={key}>
        <div 
          onClick={() => toggleMenu(key)}
          title={label}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.5rem 0.625rem',
            color: isChildActive || isOpen ? '#4f46e5' : '#64748b',
            fontWeight: isChildActive || isOpen ? 600 : 500,
            fontSize: '0.8125rem',
            cursor: 'pointer',
            userSelect: 'none',
            backgroundColor: isChildActive ? '#eef2ff' : 'transparent',
            borderRadius: isCollapsed ? '8px' : '0 8px 8px 0',
            borderLeft: isChildActive ? '3px solid #4f46e5' : '3px solid transparent',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            transition: 'all 120ms ease'
          }}
        >
          {icon}
          {!isCollapsed && (
            <>
              <span>{label}</span>
              <div style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', marginLeft: 'auto' }}>
                {Icons.ChevronDown}
              </div>
            </>
          )}
        </div>

        {isOpen && !isCollapsed && (
          <div style={{ paddingLeft: '1.75rem', display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
            {children.map(child => (
              <NavLink key={child.to} to={child.to} style={{ fontSize: '0.8125rem', padding: '0.4rem 0.625rem', color: location.pathname === child.to ? '#4f46e5' : '#64748b', textDecoration: 'none', fontWeight: location.pathname === child.to ? 600 : 400 }}>
                <span>{child.label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="admin-layout">
      {/* Light Theme Sidebar matching the Reference Screenshot */}
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo-container">
            <div className="sidebar-logo-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            {!isCollapsed && (
              <div className="sidebar-logo-text">
                <h2>DealFlow360</h2>
                <span>{isSalesRole ? 'INTERNAL SALES' : 'ENTERPRISE ADMIN'}</span>
              </div>
            )}
          </div>
          <button className="collapse-btn" onClick={() => setIsCollapsed(!isCollapsed)} title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '16px', height: '16px', transform: isCollapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        </div>

        <div className="sidebar-profile">
          <div className="profile-avatar">
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#eef2ff',
              color: '#4f46e5',
              fontWeight: '700',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
          </div>
          {!isCollapsed && (
            <div className="profile-info">
              <span className="profile-name">{userName}</span>
              <span className="profile-role" style={{ color: '#94a3b8', fontSize: '0.6875rem' }}>{userEmail}</span>
              <span style={{ fontSize: '0.725rem', fontWeight: '600', color: '#334155', marginTop: '1px' }}>{userRole}</span>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          {isSalesRole ? (
            /* ── SALES OPERATIONS SIDEBAR LINKS ───────────────────────────────── */
            <>
              <div className="nav-group">SALES OPERATIONS</div>
              <NavLink to="/sales/dashboard" title="Dashboard">{Icons.Dashboard} {!isCollapsed && <span>Dashboard</span>}</NavLink>
              
              {renderDropdownItem('quotations', 'Quotations', Icons.Quotations, [
                { label: 'Quotation List', to: '/sales/quotations' },
                { label: 'Quotation Detail', to: '/sales/quotations/Q-1042' }
              ])}

              {renderDropdownItem('approvals', 'Approvals', Icons.Roles, [
                { label: 'Approval List', to: '/sales/approvals' },
                { label: 'Approval Detail', to: '/sales/approvals/1' }
              ])}

              {renderDropdownItem('fulfillment', 'Fulfillment', Icons.Warehouses, [
                { label: 'Fulfillment List', to: '/sales/fulfillment' },
                { label: 'Fulfillment Detail', to: '/sales/fulfillment' }
              ])}

              {renderDropdownItem('subscriptions', 'Subscriptions', Icons.PriceLists, [
                { label: 'Subscription List', to: '/sales/subscriptions' },
                { label: 'Billing Detail', to: '/sales/billing' }
              ])}

              {renderDropdownItem('invoices', 'Invoices', Icons.Billing, [
                { label: 'Invoice List', to: '/sales/invoices' },
                { label: 'Invoice Detail', to: '/sales/invoices/INV-904' }
              ])}

              <NavLink to="/sales/deal-health" title="Deal Health">{Icons.Orders} {!isCollapsed && <span>Deal Health</span>}</NavLink>

              {renderDropdownItem('reports', 'Reports', Icons.Rules, [
                { label: 'Report List', to: '/sales/reports' },
                { label: 'Report Detail', to: '/sales/reports/1' }
              ])}

              {renderDropdownItem('products', 'Products', Icons.Products, [
                { label: 'Product List', to: '/sales/products' },
                { label: 'Product Detail', to: '/sales/products/SKU-SYS-001' }
              ])}
            </>
          ) : (
            /* ── ADMIN / EXECUTIVE SIDEBAR LINKS ───────────────────────────────── */
            <>
              <div className="nav-group">ADMINISTRATION</div>
              <NavLink to="/admin/dashboard" title="Dashboard">{Icons.Dashboard} {!isCollapsed && <span>Dashboard</span>}</NavLink>
              <NavLink to="/admin/users" title="Users">{Icons.Users} {!isCollapsed && <span>Users</span>}</NavLink>
              <NavLink to="/admin/roles" title="Roles">{Icons.Roles} {!isCollapsed && <span>Roles</span>}</NavLink>
              <NavLink to="/admin/customers" title="Customers">{Icons.Customers} {!isCollapsed && <span>Customers</span>}</NavLink>
              <NavLink to="/admin/products" title="Products">{Icons.Products} {!isCollapsed && <span>Products</span>}</NavLink>
              <NavLink to="/admin/categories" title="Categories">{Icons.Categories} {!isCollapsed && <span>Categories</span>}</NavLink>
              <NavLink to="/admin/price-lists" title="Price Lists">{Icons.PriceLists} {!isCollapsed && <span>Price Lists</span>}</NavLink>
              
              {/* Rules Dropdown Menu */}
              <div>
                <div 
                  onClick={() => setIsRulesOpen(!isRulesOpen)}
                  title="Rules Management"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.5rem 0.625rem',
                    color: isRulesPath ? '#4f46e5' : '#64748b',
                    fontWeight: isRulesPath ? 600 : 500,
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                    userSelect: 'none',
                    backgroundColor: isRulesPath ? '#eef2ff' : 'transparent',
                    borderRadius: isCollapsed ? '8px' : '0 8px 8px 0',
                    borderLeft: isRulesPath ? '3px solid #4f46e5' : '3px solid transparent',
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    transition: 'all 120ms ease'
                  }}
                >
                  {Icons.Rules}
                  {!isCollapsed && (
                    <>
                      <span>Rules</span>
                      <div style={{ transform: isRulesOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', marginLeft: 'auto' }}>
                        {Icons.ChevronDown}
                      </div>
                    </>
                  )}
                </div>

                {isRulesOpen && !isCollapsed && (
                  <div style={{ paddingLeft: '1.75rem', display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
                    <NavLink to="/admin/discount-rules" style={{ fontSize: '0.8125rem', padding: '0.4rem 0.625rem' }}>
                      <span>Discount Rules</span>
                    </NavLink>
                    <NavLink to="/admin/approval-rules" style={{ fontSize: '0.8125rem', padding: '0.4rem 0.625rem' }}>
                      <span>Approval Rules</span>
                    </NavLink>
                  </div>
                )}
              </div>

              <NavLink to="/admin/quotations" title="Quotations">{Icons.Quotations} {!isCollapsed && <span>Quotations</span>}</NavLink>
              <NavLink to="/admin/orders" title="Orders">{Icons.Orders} {!isCollapsed && <span>Orders</span>}</NavLink>
              <NavLink to="/admin/warehouses" title="Warehouses">{Icons.Warehouses} {!isCollapsed && <span>Warehouses</span>}</NavLink>
              <NavLink to="/admin/inventory" title="Inventory">{Icons.Inventory} {!isCollapsed && <span>Inventory</span>}</NavLink>
              <NavLink to="/admin/billing" title="Billing & Invoices">{Icons.Billing} {!isCollapsed && <span>Billing</span>}</NavLink>
              <NavLink to="/admin/notifications" title="Notifications">
                {Icons.Notifications} 
                {!isCollapsed && (
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <span style={{
                        backgroundColor: '#ef4444',
                        color: '#ffffff',
                        fontSize: '0.6875rem',
                        fontWeight: '700',
                        padding: '1px 6px',
                        borderRadius: '10px',
                        marginLeft: 'auto'
                      }}>
                        {unreadCount}
                      </span>
                    )}
                  </div>
                )}
              </NavLink>
              <NavLink to="/admin/audit-logs" title="Audit Logs">{Icons.AuditLogs} {!isCollapsed && <span>Audit Logs</span>}</NavLink>
              <NavLink to="/admin/settings" title="System Settings">{Icons.Settings} {!isCollapsed && <span>Settings</span>}</NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <button className="switch-persona-btn" onClick={handleLogoutClick} title="Logout of session">
            {Icons.User}
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="main-content">
        <header className="header">
          <div className="header-right">
            <button className="btn btn-secondary btn-icon" style={{ borderRadius: '50%', color: 'var(--text-secondary)', position: 'relative' }} onClick={() => navigate('/admin/notifications')} title="Notifications">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '6px',
                  right: '8px',
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#ef4444',
                  borderRadius: '50%',
                  border: '2px solid #ffffff',
                  boxSizing: 'content-box'
                }}></span>
              )}
            </button>
          </div>
        </header>

        <main className="page-content">
          <Outlet context={{ setUnreadCount }} />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;

