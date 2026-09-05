import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, List, FileText } from 'lucide-react';
import { resolveChildPath } from '../../config/navigationConfig.js';

export const HoverSubmenu = ({
  item,
  activeRecordId,
  isParentActive
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 180); // 180ms grace window prevents any flickering
  };

  const handleClickParent = (e) => {
    // Left click navigates directly to the module's List page (as required: "Parent menu opens its List")
    navigate(item.path);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      setIsOpen(true);
    }
  };

  // Close on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="nav-item-dropdown-container"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      style={{ position: 'relative', display: 'inline-block', zIndex: isOpen ? 10002 : 'auto' }}
    >
      {/* Top Level Module Button */}
      <button
        type="button"
        onClick={handleClickParent}
        className={`nav-pill-btn ${isParentActive ? 'active' : ''}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span>{item.label}</span>
        <ChevronDown 
          size={12} 
          className={`nav-chevron ${isOpen ? 'rotated' : ''}`}
        />
      </button>

      {/* Invisible bridging zone to guarantee zero pointer gaps */}
      {isOpen && (
        <div 
          className="nav-bridge-zone"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            height: '10px',
            zIndex: 10003
          }}
        />
      )}

      {/* Submenu with ONLY List and Detail */}
      {isOpen && (
        <div
          role="menu"
          aria-label={`${item.label} Submenu`}
          className="nav-dropdown-menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            minWidth: '195px',
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #cbd5e1',
            boxShadow: '0 12px 28px -4px rgba(0, 0, 0, 0.22), 0 6px 12px -2px rgba(0, 0, 0, 0.1)',
            padding: '0.4rem',
            zIndex: 10005,
            animation: 'dropdownFadeIn 0.15s ease-out'
          }}
        >
          {item.children.map((child) => {
            const childPath = resolveChildPath(child, activeRecordId, item.defaultDetailId);
            const isDetail = child.key.includes('detail');
            const Icon = isDetail ? FileText : List;

            return (
              <NavLink
                key={child.key}
                to={childPath}
                role="menuitem"
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => `nav-submenu-item ${isActive ? 'active' : ''}`}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: isActive ? '#1e40af' : '#334155',
                  backgroundColor: isActive ? '#eff6ff' : 'transparent',
                  textDecoration: 'none',
                  transition: 'background-color 0.15s ease, color 0.15s ease'
                })}
              >
                <Icon size={15} color={isDetail ? '#6366f1' : '#2563eb'} />
                <span>{child.label}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
};
