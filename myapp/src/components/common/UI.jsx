import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  ChevronDown, 
  X, 
  AlertTriangle, 
  Loader2 
} from 'lucide-react';

/* ==========================================================================
   1. BUTTON COMPONENT
   ========================================================================== */
export const Button = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'danger'
  size = 'md',        // 'sm' | 'md' | 'lg'
  icon: Icon,
  loading = false,
  disabled = false,
  onClick,
  className = '',
  style = {},
  type = 'button',
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Variant styles
  const variantStyles = {
    primary: {
      backgroundColor: isHovered && !disabled ? 'var(--primary-hover)' : 'var(--primary)',
      color: '#FFFFFF',
      border: 'none',
      boxShadow: isHovered && !disabled ? 'var(--shadow-md)' : 'var(--shadow-sm)',
      transform: isHovered && !disabled ? 'scale(1.02)' : 'scale(1)'
    },
    secondary: {
      backgroundColor: isHovered && !disabled ? 'var(--surface-secondary)' : 'var(--surface)',
      color: isHovered && !disabled ? 'var(--secondary)' : 'var(--text-primary)',
      border: isHovered && !disabled ? '1px solid var(--primary)' : '1px solid var(--border)',
      boxShadow: 'var(--shadow-sm)',
      transform: isHovered && !disabled ? 'translateY(-1px)' : 'translateY(0)'
    },
    danger: {
      backgroundColor: isHovered && !disabled ? '#DC2626' : 'var(--danger)',
      color: '#FFFFFF',
      border: 'none',
      boxShadow: isHovered && !disabled ? 'var(--shadow-md)' : 'var(--shadow-sm)',
      transform: isHovered && !disabled ? 'scale(1.02)' : 'scale(1)'
    }
  };

  // Size styles (Strict 8-Point Spacing)
  const sizeStyles = {
    sm: {
      padding: 'var(--space-1) var(--space-3)',
      fontSize: '0.75rem',
      borderRadius: 'var(--radius-md)'
    },
    md: {
      padding: 'var(--space-2) var(--space-4)',
      fontSize: '0.8125rem',
      borderRadius: 'var(--radius-md)'
    },
    lg: {
      padding: 'var(--space-3) var(--space-6)',
      fontSize: '0.9375rem',
      borderRadius: 'var(--radius-lg)'
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-2)',
        fontWeight: '600',
        fontFamily: 'var(--font-family)',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...style
      }}
      className={`btn-custom btn-${variant} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 size={16} className="spin-animation" style={{ animation: 'spin 1s linear infinite' }} />
      ) : Icon ? (
        <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />
      ) : null}
      {children}
    </button>
  );
};

/* ==========================================================================
   2. INPUT COMPONENT
   ========================================================================== */
export const Input = ({
  label,
  error,
  icon: Icon,
  className = '',
  style = {},
  containerStyle = {},
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', ...containerStyle }} className="form-group">
      {label && (
        <label style={{
          fontSize: '0.6875rem',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--text-secondary)'
        }}>
          {label}
        </label>
      )}

      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'var(--surface)',
        border: error 
          ? '1px solid var(--danger)' 
          : isFocused 
            ? '1px solid var(--primary)' 
            : '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: isFocused 
          ? '0 0 0 3px rgba(79, 70, 229, 0.15)' 
          : 'var(--shadow-sm)',
        transition: 'all 0.2s ease',
        overflow: 'hidden'
      }}>
        {Icon && (
          <div style={{
            paddingLeft: 'var(--space-3)',
            display: 'flex',
            alignItems: 'center',
            color: isFocused ? 'var(--primary)' : 'var(--text-tertiary)',
            transition: 'color 0.2s ease'
          }}>
            <Icon size={16} />
          </div>
        )}

        <input
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{
            flex: 1,
            width: '100%',
            padding: 'var(--space-2) var(--space-3)',
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            color: 'var(--text-primary)',
            fontSize: '0.8125rem',
            fontFamily: 'var(--font-family)',
            ...style
          }}
          className={`form-input ${className}`}
          {...props}
        />
      </div>

      {error && (
        <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '2px' }}>
          {error}
        </span>
      )}
    </div>
  );
};

/* ==========================================================================
   3. SELECT COMPONENT
   ========================================================================== */
export const Select = ({
  label,
  options = [],
  value,
  onChange,
  error,
  className = '',
  containerStyle = {},
  style = {},
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', ...containerStyle }} className="form-group">
      {label && (
        <label style={{
          fontSize: '0.6875rem',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--text-secondary)'
        }}>
          {label}
        </label>
      )}

      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'var(--surface)',
        border: error 
          ? '1px solid var(--danger)' 
          : isFocused 
            ? '1px solid var(--primary)' 
            : '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: isFocused 
          ? '0 0 0 3px rgba(79, 70, 229, 0.15)' 
          : 'var(--shadow-sm)',
        transition: 'all 0.2s ease'
      }}>
        <select
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{
            width: '100%',
            padding: 'var(--space-2) var(--space-4) var(--space-2) var(--space-3)',
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            color: 'var(--text-primary)',
            fontSize: '0.8125rem',
            fontFamily: 'var(--font-family)',
            appearance: 'none',
            cursor: 'pointer',
            ...style
          }}
          className={`form-select ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <ChevronDown 
          size={16} 
          style={{ 
            position: 'absolute', 
            right: 'var(--space-3)', 
            pointerEvents: 'none', 
            color: 'var(--text-secondary)' 
          }} 
        />
      </div>

      {error && (
        <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '2px' }}>
          {error}
        </span>
      )}
    </div>
  );
};

/* ==========================================================================
   4. BADGE COMPONENT
   ========================================================================== */
export const Badge = ({
  children,
  variant = 'info', // 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  size = 'md',      // 'sm' | 'md'
  className = '',
  style = {}
}) => {
  const badgeColors = {
    success: { bg: 'var(--success-bg)', text: 'var(--success-text)', border: 'rgba(16, 185, 129, 0.2)' },
    warning: { bg: 'var(--warning-bg)', text: 'var(--warning-text)', border: 'rgba(245, 158, 11, 0.2)' },
    danger:  { bg: 'var(--danger-bg)',  text: 'var(--danger-text)',  border: 'rgba(239, 68, 68, 0.2)' },
    info:    { bg: 'var(--info-bg)',    text: 'var(--info-text)',    border: 'rgba(59, 130, 246, 0.2)' },
    neutral: { bg: 'var(--surface-secondary)', text: 'var(--text-secondary)', border: 'var(--border)' }
  };

  const selected = badgeColors[variant] || badgeColors.info;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-1)',
        backgroundColor: selected.bg,
        color: selected.text,
        border: `1px solid ${selected.border}`,
        borderRadius: 'var(--radius-full)',
        padding: size === 'sm' ? '1px 6px' : '2px 8px',
        fontSize: size === 'sm' ? '0.6875rem' : '0.75rem',
        fontWeight: '700',
        lineHeight: 1.3,
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
        ...style
      }}
      className={`badge badge-${variant} ${className}`}
    >
      {children}
    </span>
  );
};

/* ==========================================================================
   5. QUICK STATUS BADGE (Interactive Inline Stage Dropdown)
   ========================================================================== */
export const QuickStatusBadge = ({
  currentStatus,
  onStatusChange,
  statusOptions = [
    { value: 'draft', label: 'Draft', variant: 'neutral' },
    { value: 'pending_approval', label: 'Pending Approval', variant: 'warning' },
    { value: 'negotiation', label: 'Negotiation', variant: 'info' },
    { value: 'confirmed', label: 'Confirmed', variant: 'success' },
    { value: 'rejected', label: 'Rejected', variant: 'danger' }
  ]
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentOpt = statusOptions.find(o => o.value === currentStatus) || {
    value: currentStatus,
    label: currentStatus?.toUpperCase() || 'UNKNOWN',
    variant: 'info'
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        title="Click to quickly update status"
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '2px'
        }}
      >
        <Badge variant={currentOpt.variant}>
          <span>{currentOpt.label}</span>
          <ChevronDown size={12} style={{ opacity: 0.7 }} />
        </Badge>
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          padding: 'var(--space-1)',
          zIndex: 50,
          minWidth: '150px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px'
        }}>
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={(e) => {
                e.stopPropagation();
                if (onStatusChange) onStatusChange(opt.value);
                setIsOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-1) var(--space-2)',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: opt.value === currentStatus ? 'var(--surface-secondary)' : 'transparent',
                color: 'var(--text-primary)',
                fontSize: '0.75rem',
                fontWeight: '600',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.15s ease'
              }}
            >
              <Badge variant={opt.variant} size="sm">
                {opt.label}
              </Badge>
              {opt.value === currentStatus && (
                <Check size={14} color="var(--primary)" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ==========================================================================
   6. DATA TABLE COMPONENT
   ========================================================================== */
export const DataTable = ({
  columns = [],
  data = [],
  onRowClick,
  emptyMessage = 'No records found matching your filters.',
  className = '',
  loading = false
}) => {
  return (
    <div style={{
      width: '100%',
      overflowX: 'auto',
      borderTop: '1px solid var(--border)'
    }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        textAlign: 'left',
        fontFamily: 'var(--font-family)',
        fontSize: '0.8125rem'
      }} className={`data-table ${className}`}>
        <thead>
          <tr style={{ backgroundColor: 'var(--surface-secondary)' }}>
            {columns.map((col, idx) => (
              <th
                key={idx}
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid var(--border)',
                  whiteSpace: 'nowrap',
                  textAlign: col.align || 'left',
                  width: col.width || 'auto'
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)', color: 'var(--text-secondary)' }}>
                  <Loader2 size={20} className="spin-animation" style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Loading records...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{
                padding: 'var(--space-8)',
                textAlign: 'center',
                color: 'var(--text-secondary)'
              }}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr
                key={row.id || rowIdx}
                onClick={() => onRowClick && onRowClick(row)}
                style={{
                  borderBottom: '1px solid var(--border)',
                  backgroundColor: 'var(--surface)',
                  cursor: onRowClick ? 'pointer' : 'default',
                  transition: 'background 0.2s ease'
                }}
                className="data-table-row"
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    style={{
                      padding: 'var(--space-3) var(--space-4)',
                      color: 'var(--text-primary)',
                      textAlign: col.align || 'left',
                      verticalAlign: 'middle'
                    }}
                  >
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

/* ==========================================================================
   7. MODAL COMPONENT (with Slide-Up & Backdrop Blur)
   ========================================================================== */
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = '550px',
  footer
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-lg)',
            width: '100%',
            maxWidth: maxWidth,
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--space-4) var(--space-6)',
            borderBottom: '1px solid var(--border)'
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '700',
              color: 'var(--text-primary)',
              margin: 0
            }}>
              {title}
            </h3>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                padding: 'var(--space-1)',
                borderRadius: 'var(--radius-md)',
                transition: 'all 0.15s ease'
              }}
              className="btn-icon"
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Body */}
          <div style={{
            padding: 'var(--space-6)',
            overflowY: 'auto',
            flex: 1
          }}>
            {children}
          </div>

          {/* Modal Footer (Optional) */}
          {footer && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 'var(--space-3)',
              padding: 'var(--space-4) var(--space-6)',
              borderTop: '1px solid var(--border)',
              backgroundColor: 'var(--surface-secondary)'
            }}>
              {footer}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

/* ==========================================================================
   8. CONFIRM DIALOG COMPONENT
   ========================================================================== */
export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger'
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="440px"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button variant={variant} onClick={() => { onConfirm(); onClose(); }}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: variant === 'danger' ? 'var(--danger-bg)' : 'var(--warning-bg)',
          color: variant === 'danger' ? 'var(--danger)' : 'var(--warning)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <AlertTriangle size={20} />
        </div>
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          lineHeight: '1.5',
          margin: 0
        }}>
          {message}
        </p>
      </div>
    </Modal>
  );
};
