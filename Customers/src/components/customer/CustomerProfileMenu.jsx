import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut } from 'lucide-react';

export const CustomerProfileMenu = ({ customer, isOpen, onClose }) => {
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const initial = (customer?.name || 'U').charAt(0).toUpperCase();

  return (
    <div className="profile-menu-wrapper" ref={menuRef}>
      <button
        type="button"
        className="profile-trigger-btn"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`Profile menu for ${customer?.name || 'User'}`}
      >
        <div className="profile-avatar" aria-hidden="true">{initial}</div>
        <div className="profile-info">
          <div className="profile-name">{customer?.name || 'User'}</div>
          <div className="profile-company">{customer?.company || ''}</div>
        </div>
      </button>

      {isOpen && (
        <div className="profile-dropdown" role="menu" aria-label="User menu">
          <div className="profile-dropdown-header">
            <div className="profile-dropdown-avatar">{initial}</div>
            <div>
              <div className="profile-dropdown-name">{customer?.name}</div>
              <div className="profile-dropdown-email">{customer?.email}</div>
            </div>
          </div>

          <div className="profile-dropdown-divider" />

          <button
            type="button"
            className="profile-menu-item"
            role="menuitem"
            onClick={() => { onClose(); navigate('/customer/profile'); }}
          >
            <User size={15} aria-hidden="true" />
            <span>My Profile</span>
          </button>

          <button
            type="button"
            className="profile-menu-item"
            role="menuitem"
            onClick={() => { onClose(); navigate('/customer/profile/edit'); }}
          >
            <Settings size={15} aria-hidden="true" />
            <span>Settings</span>
          </button>

          <div className="profile-dropdown-divider" />

          <button
            type="button"
            className="profile-menu-item logout"
            role="menuitem"
            onClick={() => { onClose(); alert('Logged out'); }}
          >
            <LogOut size={15} aria-hidden="true" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};
