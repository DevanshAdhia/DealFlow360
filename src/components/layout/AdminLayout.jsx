import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

function AdminLayout({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard' },
    { name: 'Users', path: '/admin/users' },
    { name: 'Roles', path: '/admin/roles' },
    { name: 'Customers', path: '/admin/customers' },
    { name: 'Products', path: '/admin/products' },
    { name: 'Categories', path: '/admin/categories' },
    { name: 'Price Lists', path: '/admin/price-lists' },
    { name: 'Discount Rules', path: '/admin/discount-rules' },
    { name: 'Approval Rules', path: '/admin/approval-rules' },
    { name: 'Quotations', path: '/admin/quotations' },
    { name: 'Orders', path: '/admin/orders' },
    { name: 'Warehouses', path: '/admin/warehouses' },
    { name: 'Inventory', path: '/admin/inventory' },
    { name: 'Billing', path: '/admin/billing' },
    { name: 'Notifications', path: '/admin/notifications' },
    { name: 'Audit Logs', path: '/admin/audit-logs' },
    { name: 'Settings', path: '/admin/settings' },
  ];

  return (
    <div className="app-container">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">DealFlow360</div>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="main-wrapper">
        <header className="header">
          <div className="header-left">
            <button className="btn btn-secondary" onClick={toggleSidebar} style={{ display: 'none' }} id="menu-toggle">
              ☰
            </button>
            <div className="search-bar">
              <input type="text" placeholder="Search everywhere..." />
            </div>
          </div>
          <div className="header-right">
            <span>{user.name}</span>
            <button className="btn btn-secondary" onClick={onLogout}>Logout</button>
          </div>
        </header>

        <div className="content">
          <Outlet />
        </div>
      </main>

      {/* Basic responsive override for menu toggle button */}
      <style>{`
        @media (max-width: 767px) {
          #menu-toggle { display: block !important; }
        }
      `}</style>
    </div>
  );
}

export default AdminLayout;
