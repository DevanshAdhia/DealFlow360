import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, Eye, EyeOff, AlertCircle, CheckCircle, ArrowRight, UserCheck } from 'lucide-react';
import { AuthLayout } from '../../layouts/AuthLayout.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { validateEmail, validatePassword } from '../../utils/auth.js';
import { getRememberedEmail } from '../../utils/storage.js';
import { MOCK_USERS } from '../../data/users.js';

export const Login = () => {
  const { login, error: serverError, clearError } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginState, setLoginState] = useState('idle'); // idle | loading | success | error

  // Pre-fill remembered email on load
  useEffect(() => {
    const remembered = getRememberedEmail();
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  }, []);

  const handleInputChange = (field, value) => {
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);
    
    // Clear specific field errors when typing
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    }
    if (serverError) clearError();
    if (loginState === 'error') setLoginState('idle');
  };

  const validateForm = () => {
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);

    setFieldErrors({
      email: emailValidation.error,
      password: passwordValidation.error
    });

    return emailValidation.isValid && passwordValidation.isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setLoginState('loading');

    try {
      const result = await login(email, password, rememberMe);

      if (result.success) {
        setLoginState('success');
        success('Login Successful', `Welcome back, ${result.user.name}!`);
        
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 500);
      } else {
        setLoginState('error');
        toastError('Authentication Failed', result.error || 'Invalid credentials');
      }
    } catch (err) {
      setLoginState('error');
      toastError('System Error', 'An unexpected error occurred during authentication.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Demo User Selector for Hackathon Judges
  const quickFillUser = (mockUser) => {
    setEmail(mockUser.email);
    setPassword(mockUser.password);
    setFieldErrors({ email: '', password: '' });
    clearError();
    setLoginState('idle');
  };

  return (
    <AuthLayout>
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={styles.card}
        className="auth-card"
      >
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>Welcome back</h2>
          <p style={styles.cardSubtitle}>
            Sign in to access your DealFlow360 workspace
          </p>
        </div>

        {/* Server Error Banner */}
        {serverError && (
          <div style={styles.errorBanner}>
            <AlertCircle size={18} color="var(--color-error)" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          {/* Email Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="email-input">
              Email Address
            </label>
            <div className="form-input-container">
              <input
                id="email-input"
                type="email"
                className={`form-input ${fieldErrors.email ? 'has-error' : ''}`}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={isSubmitting}
                autoComplete="email"
              />
            </div>
            {fieldErrors.email && (
              <span className="form-error">
                <AlertCircle size={14} /> {fieldErrors.email}
              </span>
            )}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="password-input">
              <span>Password</span>
            </label>
            <div className="form-input-container">
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                className={`form-input ${fieldErrors.password ? 'has-error' : ''}`}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                disabled={isSubmitting}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="input-icon-right"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.password && (
              <span className="form-error">
                <AlertCircle size={14} /> {fieldErrors.password}
              </span>
            )}
          </div>

          {/* Options Row: Remember Me & Forgot Password */}
          <div style={styles.optionsRow}>
            <label style={styles.rememberLabel}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isSubmitting}
                style={styles.checkbox}
              />
              <span>Remember me</span>
            </label>

            <Link to="/forgot-password" style={styles.forgotLink}>
              Forgot password?
            </Link>
          </div>

          {/* Sign In Multi-State Button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || loginState === 'success'}
            style={styles.submitBtn}
          >
            {loginState === 'loading' && (
              <>
                <span className="spinner" />
                <span>Signing in...</span>
              </>
            )}

            {loginState === 'success' && (
              <>
                <CheckCircle size={18} color="#ffffff" />
                <span>Login Successful</span>
              </>
            )}

            {(loginState === 'idle' || loginState === 'error') && (
              <>
                <span>Sign In</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Hackathon Demo User Quick-Select Section */}
        <div style={styles.demoSection}>
          <div style={styles.demoHeader}>
            <UserCheck size={14} color="var(--primary-500)" />
            <span>Hackathon Demo Credentials (1-Click Fill)</span>
          </div>

          <div style={styles.demoPillsContainer} className="quick-demo-pills">
            {MOCK_USERS.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => quickFillUser(user)}
                style={styles.demoPillBtn}
                title={`Click to fill ${user.name} (${user.roleLabel})`}
              >
                <span style={styles.pillRole}>{user.roleLabel}</span>
                <span style={styles.pillName}>{user.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
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
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    padding: '0.75rem 1rem',
    backgroundColor: 'var(--color-error-bg)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--color-error)',
    fontSize: '0.8125rem',
    fontWeight: '500'
  },
  form: {
    display: 'flex',
    flexDirection: 'column'
  },
  optionsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.5rem',
    fontSize: '0.8125rem'
  },
  rememberLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: 'var(--text-secondary)',
    cursor: 'pointer'
  },
  checkbox: {
    accentColor: 'var(--primary-600)',
    width: '16px',
    height: '16px',
    cursor: 'pointer'
  },
  forgotLink: {
    fontSize: '0.8125rem',
    fontWeight: '600'
  },
  submitBtn: {
    width: '100%',
    padding: '0.875rem',
    fontSize: '0.9375rem',
    fontWeight: '700'
  },
  demoSection: {
    marginTop: '0.5rem',
    padding: '1rem',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--bg-surface-1)',
    border: '1px solid var(--border-subtle)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  demoHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    letterSpacing: '0.02em'
  },
  demoPillsContainer: {
    display: 'flex',
    gap: '0.5rem'
  },
  demoPillBtn: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0.4rem 0.25rem',
    backgroundColor: 'var(--bg-surface-2)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    transition: 'all 150ms'
  },
  pillRole: {
    fontSize: '0.65rem',
    fontWeight: '700',
    color: 'var(--primary-500)'
  },
  pillName: {
    fontSize: '0.725rem',
    color: 'var(--text-primary)'
  }
};
