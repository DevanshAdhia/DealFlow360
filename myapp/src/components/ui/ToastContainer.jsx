import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { useToastContext } from '../../context/ToastContext.jsx';
import '../../styles/variables.css';

export const ToastContainer = () => {
  const { toasts, removeToast } = useToastContext();

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="toast-icon text-success" size={20} />;
      case 'warning':
        return <AlertTriangle className="toast-icon text-warning" size={20} />;
      case 'error':
        return <XCircle className="toast-icon text-error" size={20} />;
      case 'info':
      default:
        return <Info className="toast-icon text-info" size={20} />;
    }
  };

  return (
    <div className="toast-container" style={styles.container}>
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
            layout
            style={{
              ...styles.toastCard,
              borderColor: getBorderColor(toast.type)
            }}
            role="alert"
          >
            <div style={styles.iconWrapper}>{getIcon(toast.type)}</div>
            <div style={styles.content}>
              {toast.title && <h5 style={styles.title}>{toast.title}</h5>}
              <p style={styles.message}>{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={styles.closeBtn}
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

const getBorderColor = (type) => {
  switch (type) {
    case 'success': return 'var(--color-success)';
    case 'warning': return 'var(--color-warning)';
    case 'error': return 'var(--color-error)';
    case 'info': default: return 'var(--primary-500)';
  }
};

const styles = {
  container: {
    position: 'fixed',
    top: '1.25rem',
    right: '1.25rem',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    maxWidth: '400px',
    width: 'calc(100vw - 2.5rem)',
    pointerEvents: 'none'
  },
  toastCard: {
    pointerEvents: 'auto',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    padding: '0.875rem 1rem',
    background: 'var(--bg-surface-1)',
    color: 'var(--text-primary)',
    borderRadius: 'var(--radius-md)',
    borderLeft: '4px solid',
    borderTop: '1px solid var(--border-subtle)',
    borderRight: '1px solid var(--border-subtle)',
    borderBottom: '1px solid var(--border-subtle)',
    boxShadow: 'var(--shadow-lg)',
    backdropFilter: 'blur(8px)'
  },
  iconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '0.125rem'
  },
  content: {
    flex: 1
  },
  title: {
    fontSize: '0.875rem',
    fontWeight: '600',
    marginBottom: '0.25rem',
    color: 'var(--text-primary)'
  },
  message: {
    fontSize: '0.8125rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4'
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '0.25rem',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 150ms'
  }
};
