import { useState, useCallback } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { Mail, Check, CheckCircle } from 'lucide-react'
import '../styles/auth.css'
import DealFlowLogo from '../components/auth/DealFlowLogo'
import AuthInput from '../components/auth/AuthInput'
import PasswordInput from '../components/auth/PasswordInput'
import GoogleButton from '../components/auth/GoogleButton'
import Toast from '../components/auth/Toast'
import { validateEmail } from '../utils/validation'

export default function Login() {
  const navigate  = useNavigate()
  const location  = useLocation()

  // Success message from Signup redirect
  const successMsg = location.state?.message || ''

  // Form state
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)

  // Touched
  const [touched, setTouched] = useState({ email: false, password: false })

  // Submission
  const [loading, setLoading] = useState(false)
  const [toast,   setToast]   = useState(null)

  // Validation
  const emailErr = touched.email    ? validateEmail(email)          : ''
  const pwErr    = touched.password ? (password ? '' : 'Password is required') : ''

  const isValid  = !validateEmail(email) && password.length > 0

  const handleBlur = useCallback((field) => {
    setTouched(p => ({ ...p, [field]: true }))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({ email: true, password: true })
    if (!isValid) return

    setLoading(true)
    // Frontend-only: simulate brief loading then navigate
    await new Promise(r => setTimeout(r, 800))
    navigate('/dashboard')
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

          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-description">Sign in to continue to DealFlow360</p>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>

            <AuthInput
              id="login-email" name="email" type="email"
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onBlur={() => handleBlur('email')}
              icon={Mail}
              error={emailErr}
              touched={touched.email}
              autoComplete="email"
              disabled={loading}
            />

            <PasswordInput
              id="login-password" name="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
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

          <p className="auth-footer" style={{marginTop: '14px'}}>
            Don't have an account?{' '}
            <Link to="/signup" className="auth-footer-link">Sign Up</Link>
          </p>

        </div>
      </div>
    </>
  )
}
