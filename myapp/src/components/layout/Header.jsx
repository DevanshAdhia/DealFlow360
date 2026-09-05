import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  Bell, 
  Search, 
  User, 
  LogOut, 
  ChevronDown, 
  HelpCircle, 
  Shield, 
  CheckCircle2 
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { NotificationModal } from './NotificationModal.jsx';
import { getRoleBadgeColor } from '../../data/users.js';

export const Header = ({ onMobileToggle }) => {
  const { user, logout } = useAuth();
  const { success } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const getPageTitle = (path) => {
    switch (path) {
      case '/dashboard': return 'Dashboard Overview';
      case '/quotations': return 'Quotations & CPQ Engine';
      case '/pipeline': return 'Sales Pipeline Governance';
      case '/customers': return 'Customer Accounts & Agreements';
      case '/approvals': return 'Approval Workflow Matrix';
      case '/fulfillment': return 'Multi-Warehouse Fulfillment';
      case '/billing': return 'Billing & Subscription Ledger';
      case '/reports': return 'Revenue & Margin Intelligence';
      case '/settings': return 'System Settings & Roles';
      default: return 'DealFlow360 Workspace';
    }
  };

  const handleLogout = () => {
    logout();
    success('Logged Out', 'You have been logged out successfully.');
    navigate('/login');
  };

  return (
    <header style={styles.header}>
      {/* Mobile Menu Toggle */}
      <div style={styles.leftSection}>
        <button 
          onClick={onMobileToggle} 
          style={styles.mobileMenuBtn} 
          className="btn-icon"
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Right Notifications Bell & Quick Actions */}
      <div style={styles.rightSection} className="header-actions">
        {/* Notifications Circular Button */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            style={styles.bellBtn}
            className="bell-notification-btn"
            aria-label="View notifications"
            title="Notifications"
          >
            <Bell size={18} color="#64748b" />
            <span style={styles.unreadBadge} />
          </button>

          {showNotifications && (
            <NotificationModal onClose={() => setShowNotifications(false)} />
          )}
        </div>
      </div>
    </header>
  );
};

const styles = {
  header: {
    height: '52px',
    backgroundColor: 'transparent',
    padding: '0 2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 30
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center'
  },
  mobileMenuBtn: {
    display: 'flex',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '50%',
    padding: '8px',
    cursor: 'pointer',
    color: '#64748b'
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    marginLeft: 'auto',
    gap: '0.75rem'
  },
  bellBtn: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    position: 'relative',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
    transition: 'all 150ms ease'
  },
  unreadBadge: {
    position: 'absolute',
    top: '7px',
    right: '8px',
    width: '7px',
    height: '7px',
    backgroundColor: '#ef4444',
    borderRadius: '50%'
  }
};
