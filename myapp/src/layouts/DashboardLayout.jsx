import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar.jsx';
import { AppNavigation } from '../components/layout/AppNavigation.jsx';
import { ToastContainer } from '../components/ui/ToastContainer.jsx';

export const DashboardLayout = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div style={styles.appShell}>
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        closeMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div 
        style={styles.mainWrapper} 
        className="main-content-area"
      >
        <AppNavigation 
          onMobileToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)} 
        />

        <main style={styles.mainContent}>
          {children || <Outlet />}
        </main>
      </div>

      {/* Centralized Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

const styles = {
  appShell: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-dark)',
    color: 'var(--text-primary)',
    position: 'relative'
  },
  mainWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    overflowX: 'hidden'
  },
  mainContent: {
    flex: 1,
    padding: '1.75rem',
    backgroundColor: 'var(--bg-dark)',
    minHeight: 'calc(100vh - var(--header-height))'
  }
};
