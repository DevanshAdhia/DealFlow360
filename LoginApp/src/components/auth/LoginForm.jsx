import { useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, Check } from 'lucide-react'
import Logo from './Logo'
import GoogleIcon from './GoogleIcon'
import Toast from './Toast'
import { validateEmail, validatePassword } from '../../utils/validation'

export default function LoginForm() {
  const navigate = useNavigate()

  // ── form values
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // ── touched
  const [touched, setTouched] = useState({ email: false, password: false })

  // ── submission
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast]               = useState(null)

  // ── derived errors (login uses relaxed password check — just required)
  const errors = {
    email:    touched.email    ? validateEmail(email)       : '',
    password: touched.password ? (password ? '' : 'Password is required') : '',
  }

  const isFormValid = !validateEmail(email) && password.length > 0

  const handleBlur = useCallback((field) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }, [])

  const getInputClass = (field) => {
    const base = 'input-field'
    if (!touched[field]) return base
    if (errors[field]) return `${base} is-error`
    return `${base} is-success`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({ email: true, password: true })
    if (!isFormValid) return

    setIsSubmitting(true)
    try {
      await new Promise(res => setTimeout(res, 1600))
      setToast({ message: 'Logged in successfully! Redirecting…', type: 'success' })
      setTimeout(() => navigate('/dashboard'), 1600)
    } catch {
      setToast({ message: 'Something went wrong. Please try again.', type: 'error' })
      setIsSubmitting(false)
    }
  }

  const handleGoogle = () => {
    setToast({ message: 'Google authentication coming soon!', type: 'success' })
  }

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="auth-page">
        <div className="auth-card" role="main">
          {/* Logo */}
          <Logo />

          {/* Header */}
          {/* <div className="auth-header">
            <h1 className="auth-heading">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to continue to your account</p>
          </div> */}

          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit} noValidate>

            {/* ── Email ── */}
            <div className="field-group">
              <label className="field-label" htmlFor="login-email">Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon" aria-hidden="true">
                  <Mail size={17} strokeWidth={2} />
                </span>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  className={getInputClass('email')}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onBlur={() => handleBlur('email')}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'login-email-error' : undefined}
                  disabled={isSubmitting}
                />
                {touched.email && !errors.email && email && (
                  <span className="input-icon-right status-icon-success" aria-hidden="true">
                    <CheckCircle size={17} strokeWidth={2} />
                  </span>
                )}
                {touched.email && errors.email && (
                  <span className="input-icon-right status-icon-error" aria-hidden="true">
                    <AlertCircle size={17} strokeWidth={2} />
                  </span>
                )}
              </div>
              {errors.email && (
                <p id="login-email-error" className="field-error" role="alert">
                  <AlertCircle size={13} strokeWidth={2.5} /> {errors.email}
                </p>
              )}
            </div>

            {/* ── Password ── */}
            <div className="field-group">
              <label className="field-label" htmlFor="login-password">Password</label>
              <div className="input-wrapper">
                <span className="input-icon" aria-hidden="true">
                  <Lock size={17} strokeWidth={2} />
                </span>
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className={getInputClass('password')}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onBlur={() => handleBlur('password')}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'login-pw-error' : undefined}
                  disabled={isSubmitting}
                />
                <span className="input-icon-right">
                  <button
                    type="button"
                    className="input-btn"
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={0}
                  >
                    {showPassword ? <EyeOff size={17} strokeWidth={2} /> : <Eye size={17} strokeWidth={2} />}
                  </button>
                </span>
              </div>
              {errors.password && (
                <p id="login-pw-error" className="field-error" role="alert">
                  <AlertCircle size={13} strokeWidth={2.5} /> {errors.password}
                </p>
              )}
            </div>

            {/* ── Remember Me + Forgot Password ── */}
            <div className="auth-row">
              <label className="remember-label" htmlFor="remember-me">
                <input
                  id="remember-me"
                  name="rememberMe"
                  type="checkbox"
                  className="remember-input"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  aria-label="Remember me"
                />
                <span className={`custom-checkbox${rememberMe ? ' checked' : ''}`} aria-hidden="true">
                  {rememberMe && <Check size={12} strokeWidth={3} color="white" />}
                </span>
                Remember me
              </label>

              <Link
                to="/forgot-password"
                className="forgot-link"
                id="forgot-password-link"
              >
                Forgot Password?
              </Link>
            </div>

            {/* ── Submit ── */}
            <button
              id="login-submit-btn"
              type="submit"
              className="btn-primary"
              disabled={!isFormValid || isSubmitting}
              aria-label={isSubmitting ? 'Logging in…' : 'Login'}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  Logging in…
                </>
              ) : 'Login'}
            </button>

            {/* ── Divider ── */}
            <div className="auth-divider" aria-hidden="true">or continue with</div>

            {/* ── Google ── */}
            <button
              id="login-google-btn"
              type="button"
              className="btn-google"
              onClick={handleGoogle}
              disabled={isSubmitting}
              aria-label="Continue with Google"
            >
              <GoogleIcon size={22} />
              Continue with Google
            </button>
          </form>

          {/* Footer */}
          <p className="auth-footer" style={{ marginTop: '20px' }}>
            Don't have an account?{' '}
            <Link to="/signup" className="link-btn">Sign up</Link>
          </p>
        </div>
      </div>
    </>
  )
}
