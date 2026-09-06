import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { AuthLayout } from '../../layouts/AuthLayout.jsx';
import { validateEmail } from '../../utils/auth.js';
import { useToast } from '../../hooks/useToast.js';

export const ForgotPassword = () => {
  const { success } = useToast();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validateEmail(email);

    if (!validation.isValid) {
      setEmailError(validation.error);
      return;
    }

    setEmailError('');
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      success('Reset Requested', 'Demo reset instructions prepared.');
    }, 600);
  };

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={styles.card}
      >
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>Reset your password</h2>
          <p style={styles.cardSubtitle}>
            Enter your account email to receive password recovery instructions
          </p>
        </div>

        {isSubmitted ? (
          <div style={styles.successState}>
            <div style={styles.successIconBox}>
              <CheckCircle size={32} color="var(--color-success)" />
            </div>
            <h3 style={styles.successTitle}>Instructions Prepared</h3>
            <p style={styles.successMessage}>
              If an account exists for <strong>{email}</strong>, password reset instructions have been prepared for this demo.
            </p>
            <p style={styles.noteMessage}>
              Note: This is a frontend demo application. Real email delivery is disabled in Phase 1.
            </p>

            <Link to="/login" className="btn btn-primary" style={styles.backBtn}>
              <ArrowLeft size={16} />
              <span>Return to Sign In</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="reset-email">
                Registered Email Address
              </label>
              <div className="form-input-container">
                <input
                  id="reset-email"
                  type="email"
                  className={`form-input ${emailError ? 'has-error' : ''}`}
                  placeholder="enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  disabled={isSubmitting}
                />
              </div>
              {emailError && (
                <span className="form-error">
                  <AlertCircle size={14} /> {emailError}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={styles.submitBtn}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>

            <div style={styles.backLinkWrapper}>
              <Link to="/login" style={styles.backLink}>
                <ArrowLeft size={16} />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </AuthLayout>
  );
};

const styles = {
  card: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  cardHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem'
  },
  cardTitle: {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: 'var(--text-primary)'
  },
  cardSubtitle: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
  },
  submitBtn: {
    width: '100%',
    padding: '0.875rem',
    fontSize: '0.9375rem'
  },
  backLinkWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '0.5rem'
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'var(--text-secondary)'
  },
  successState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '1.5rem',
    backgroundColor: 'var(--bg-surface-1)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border-subtle)'
  },
  successIconBox: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-success-bg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1rem'
  },
  successTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    marginBottom: '0.5rem'
  },
  successMessage: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    marginBottom: '1rem'
  },
  noteMessage: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginBottom: '1.5rem'
  },
  backBtn: {
    width: '100%',
    padding: '0.75rem'
  }
};
