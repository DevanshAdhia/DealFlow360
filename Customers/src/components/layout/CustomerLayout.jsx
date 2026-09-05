import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { CustomerSidebar } from './CustomerSidebar.jsx';
import { CustomerHeader } from './CustomerHeader.jsx';

export const CustomerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`portal-layout ${isCollapsed ? 'portal-layout--collapsed' : ''}`}>
      {/* Sidebar navigation */}
      <CustomerSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main viewport */}
      <div className="portal-main">
        <CustomerHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="content-wrapper">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
