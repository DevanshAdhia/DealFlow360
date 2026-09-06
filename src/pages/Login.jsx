import { useState, useCallback } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { Mail, Check, CheckCircle, AlertCircle } from 'lucide-react'
import '../styles/auth.css'
import DealFlowLogo from '../components/auth/DealFlowLogo'
import AuthInput from '../components/auth/AuthInput'
import PasswordInput from '../components/auth/PasswordInput'
import GoogleButton from '../components/auth/GoogleButton'
import Toast from '../components/auth/Toast'
import { validateEmail } from '../utils/validation'

const API_BASE = 'http://localhost:8000/api';

/**
 * Maps backend role codes to frontend display names & redirect paths.
 * Roles from UserRole model: ADMIN, SALES_REP, SALES_MANAGER, FINANCE, CUSTOMER
 */
const STAFF_ROLES = new Set(['ADMIN', 'SALES_REP', 'SALES_MANAGER', 'FINANCE']);

const getRedirectPath = (profileRole) => {
  if (!profileRole) return '/customer/dashboard';
  const role = profileRole.toUpperCase().replace(/\s+/g, '_');
  if (role === 'SALES_REP' || role === 'SALES_MANAGER') {
    return '/sales/dashboard';
  }
  return STAFF_ROLES.has(role) ? '/admin/dashboard' : '/customer/dashboard';
};

export default function Login({ onLogin }) {
  const navigate  = useNavigate()
  const location  = useLocation()

  // Success message from Signup redirect
  const successMsg = location.state?.message || ''

  // Form state
  const [identifier, setIdentifier] = useState('') // username or email
  const [password,   setPassword]   = useState('')
  const [remember,   setRemember]   = useState(false)

  // Touched
  const [touched, setTouched] = useState({ identifier: false, password: false })

  // Submission
  const [loading,    setLoading]    = useState(false)
  const [apiError,   setApiError]   = useState('')
  const [toast,      setToast]      = useState(null)

  // Validation — identifier can be username (no @ required) or email
  const identifierErr = touched.identifier
    ? (identifier.trim() ? '' : 'Username or email is required')
    : ''
  const pwErr = touched.password
    ? (password ? '' : 'Password is required')
    : ''

  const isValid = identifier.trim().length > 0 && password.length > 0

  const handleBlur = useCallback((field) => {
    setTouched(p => ({ ...p, [field]: true }))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({ identifier: true, password: true })
    setApiError('')
    if (!isValid) return

    setLoading(true)

    try {
      // ── 1. Call real Django JWT login endpoint ──────────────────────────────
      const res = await fetch(`${API_BASE}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: identifier.trim(), password }),
      })

      const data = await res.json()

      if (!res.ok) {
        // Backend returns errors in { error: { message } } or { detail } form
        const msg = data?.error?.message
          || data?.detail
          || data?.non_field_errors?.[0]
          || 'Invalid username or password.'
        setApiError(msg)
        setLoading(false)
        return
      }

      // ── 2. Persist JWT tokens ───────────────────────────────────────────────
      if (data.access) {
        localStorage.setItem('access_token', data.access)
      }
      if (data.refresh) {
        localStorage.setItem('refresh_token', data.refresh)
      }

      // ── 3. Build user object from backend response ─────────────────────────
      // data.user shape: { id, username, email, name, role, profile: { role, phone, company } }
      const backendUser = data.user || {}
      let profileRole = backendUser?.profile?.role || backendUser?.role || ''
      const roleUpper = profileRole.toUpperCase().replace(/\s+/g, '_')
      if (roleUpper.includes('SALES_REP') || roleUpper.includes('SALES_REPRESENTATIVE')) profileRole = 'SALES_REP'
      else if (roleUpper.includes('SALES_MANAGER')) profileRole = 'SALES_MANAGER'
      else if (roleUpper.includes('ADMIN')) profileRole = 'ADMIN'
      else if (roleUpper.includes('FINANCE')) profileRole = 'FINANCE'
      else if (roleUpper.includes('CUSTOMER')) profileRole = 'CUSTOMER'

      const userObj = {
        id:       backendUser.id       || null,
        username: backendUser.username || identifier.trim(),
        name:     backendUser.name     || `${backendUser.first_name || ''} ${backendUser.last_name || ''}`.trim() || identifier.trim(),
        email:    backendUser.email    || '',
        role:     profileRole,            // raw role code: ADMIN | SALES_REP | SALES_MANAGER | FINANCE | CUSTOMER
        roleDisplay: backendUser.role  || profileRole, // human-readable from serializer
        company:  backendUser?.profile?.company || '',
        phone:    backendUser?.profile?.phone   || '',
        is_active: backendUser.is_active ?? true,
      }

      // ── 4. Save session to localStorage (mirrors existing session helpers) ──
      localStorage.setItem('user',              JSON.stringify(userObj))
      localStorage.setItem('dealflow360_user',  JSON.stringify(userObj))
      localStorage.setItem('dealflow360_session', JSON.stringify({
        token:     data.access,
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      }))
      localStorage.removeItem('dealflow360_logged_out')

      if (remember) {
        localStorage.setItem('dealflow360_remembered_email', identifier.trim())
      } else {
        localStorage.removeItem('dealflow360_remembered_email')
      }

      // ── 5. Notify parent App component (updates session state) ─────────────
      if (onLogin) {
        onLogin(userObj)
      }

      // ── 6. Redirect based on actual backend role ────────────────────────────
      const redirectPath = getRedirectPath(profileRole)
      navigate(redirectPath)

    } catch (networkErr) {
      setApiError('Cannot connect to DealFlow360 server. Please ensure the backend is running on port 8000.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = () => {
    setToast({ message: 'Google sign-in coming soon!', type: 'success' })
  }

  return (
    <>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="auth-page">
        <div className="auth-card" role="main">

          <DealFlowLogo />

          {/* Success message from signup */}
          {successMsg && (
            <div className="auth-alert auth-alert-success" role="status">
              <CheckCircle size={15} strokeWidth={2}/> {successMsg}
            </div>
          )}

          {/* API / server error */}
          {apiError && (
            <div className="auth-alert auth-alert-error" role="alert" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.25)',
              color: '#ef4444',
              fontSize: '0.85rem',
              marginBottom: '16px',
              lineHeight: 1.4,
            }}>
              <AlertCircle size={15} strokeWidth={2} style={{ flexShrink: 0 }}/>
              {apiError}
            </div>
          )}

          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-description">Sign in to continue to DealFlow360</p>

          <form className="auth-form" onSubmit={handleSubmit} noValidate autoComplete="off">
            {/* Hidden fields prevent Chrome from autofilling the real fields */}
            <input type="text" name="username" style={{ display: 'none' }} readOnly />
            <input type="password" name="password" style={{ display: 'none' }} readOnly />

            <AuthInput
              id="login-identifier"
              name="identifier"
              type="text"
              label="Username or Email"
              placeholder="Enter your username or email"
              value={identifier}
              onChange={e => { setIdentifier(e.target.value); setApiError('') }}
              onBlur={() => handleBlur('identifier')}
              icon={Mail}
              error={identifierErr}
              touched={touched.identifier}
              autoComplete="off"
              disabled={loading}
            />

            <PasswordInput
              id="login-password"
              name="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={e => { setPassword(e.target.value); setApiError('') }}
              onBlur={() => handleBlur('password')}
              error={pwErr}
              touched={touched.password}
              autoComplete="current-password"
              disabled={loading}
            />

            {/* Remember me + Forgot */}
            <div className="auth-row">
              <label className="remember-label" htmlFor="remember-me">
                <input
                  id="remember-me" type="checkbox"
                  className="remember-hidden"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                />
                <span className={`checkbox-box${remember ? ' checked' : ''}`} aria-hidden="true">
                  {remember && <Check size={11} strokeWidth={3} color="white"/>}
                </span>
                Remember me
              </label>
              <Link to="/forgot-password" className="forgot-btn" id="forgot-pw-link">
                Forgot Password?
              </Link>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              className="btn-primary"
              disabled={!isValid || loading}
              aria-label={loading ? 'Logging in…' : 'Login'}
            >
              {loading ? <><span className="spinner" aria-hidden="true"/> Logging in…</> : 'Login'}
            </button>

            <div className="auth-divider">or</div>

            <GoogleButton onClick={handleGoogle} disabled={loading} />
          </form>

          {/* Demo credentials helper */}
          <div style={{
            marginTop: '20px',
            padding: '12px 14px',
            borderRadius: '10px',
            background: 'rgba(99,102,241,0.06)',
            border: '1px solid rgba(99,102,241,0.15)',
            fontSize: '0.78rem',
            color: 'var(--text-secondary, #94a3b8)',
            lineHeight: 1.6,
          }}>
            <strong style={{ color: 'var(--text-primary, #e2e8f0)', display: 'block', marginBottom: '4px' }}>
              Demo Credentials
            </strong>
            <span>Admin: <code style={{ color: '#a5b4fc' }}>admin</code> / <code style={{ color: '#a5b4fc' }}>Password123!</code></span><br/>
            <span>Sales Rep: <code style={{ color: '#a5b4fc' }}>sales_rep1</code> / <code style={{ color: '#a5b4fc' }}>Password123!</code></span><br/>
            <span>Customer: any seeded customer username / <code style={{ color: '#a5b4fc' }}>Password123!</code></span>
          </div>

          <p className="auth-footer" style={{marginTop: '14px'}}>
            Don't have an account?{' '}
            <Link to="/signup" className="auth-footer-link">Sign Up</Link>
          </p>

        </div>
      </div>
    </>
  )
}
