import { useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { User, Mail, CheckCircle, AlertCircle } from 'lucide-react'
import '../styles/auth.css'
import DealFlowLogo from '../components/auth/DealFlowLogo'
import AuthInput from '../components/auth/AuthInput'
import PasswordInput from '../components/auth/PasswordInput'
import PasswordRequirements from '../components/auth/PasswordRequirements'
import GoogleButton from '../components/auth/GoogleButton'
import Toast from '../components/auth/Toast'
import {
  validateName, validateEmail,
  validatePassword, validateConfirmPassword
} from '../utils/validation'

export default function Signup() {
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [touched, setTouched] = useState({ name: false, email: false, password: false, confirmPassword: false })
  const [loading, setLoading] = useState(false)
  const [toast,   setToast]   = useState(null)

  const errors = {
    name:            validateName(form.name),
    email:           validateEmail(form.email),
    password:        validatePassword(form.password),
    confirmPassword: validateConfirmPassword(form.password, form.confirmPassword),
  }

  const isValid = !errors.name && !errors.email && !errors.password && !errors.confirmPassword

  const handleChange = useCallback((field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }))
  }, [])

  const handleBlur = useCallback((field) => {
    setTouched(p => ({ ...p, [field]: true }))
  }, [])

  // Password match indicator (only after confirmPassword is touched & has value)
  const showMatch    = touched.confirmPassword && form.confirmPassword && form.password === form.confirmPassword
  const showMismatch = touched.confirmPassword && form.confirmPassword && form.password !== form.confirmPassword

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({ name: true, email: true, password: true, confirmPassword: true })
    if (!isValid) return

    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    navigate('/login', { state: { message: 'Account created successfully. Please login.' } })
  }

  const handleGoogle = () => {
    setToast({ message: 'Google sign-up coming soon!', type: 'success' })
  }

  return (
    <>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="auth-page">
        <div className="auth-card" role="main">

          <DealFlowLogo />

          <h1 className="auth-title">Create Your Account</h1>
          <p className="auth-description">Get started with DealFlow360</p>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>

            <AuthInput
              id="signup-name" name="name" type="text"
              label="Full Name"
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange('name')}
              onBlur={() => handleBlur('name')}
              icon={User}
              error={touched.name ? errors.name : ''}
              touched={touched.name}
              autoComplete="name"
              disabled={loading}
            />

            <AuthInput
              id="signup-email" name="email" type="email"
              label="Email Address"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange('email')}
              onBlur={() => handleBlur('email')}
              icon={Mail}
              error={touched.email ? errors.email : ''}
              touched={touched.email}
              autoComplete="email"
              disabled={loading}
            />

            {/* Password with requirements */}
            <div>
              <PasswordInput
                id="signup-password" name="password"
                label="Password"
                placeholder="Create a password"
                value={form.password}
                onChange={handleChange('password')}
                onBlur={() => handleBlur('password')}
                error={touched.password && !form.password ? errors.password : ''}
                touched={touched.password}
                autoComplete="new-password"
                disabled={loading}
              />
              {/* Show requirements whenever password has input */}
              <PasswordRequirements password={form.password} />
            </div>

            {/* Confirm Password */}
            <div>
              <PasswordInput
                id="signup-confirm" name="confirmPassword"
                label="Confirm Password"
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={handleChange('confirmPassword')}
                onBlur={() => handleBlur('confirmPassword')}
                error={showMismatch ? 'Passwords do not match' : ''}
                touched={touched.confirmPassword}
                autoComplete="new-password"
                disabled={loading}
              />
              {/* Match indicator */}
              {showMatch && (
                <span className="field-msg field-msg-success" role="status" style={{marginTop:'4px'}}>
                  <CheckCircle size={12} strokeWidth={2.5}/> Passwords match
                </span>
              )}
            </div>

            <button
              id="signup-submit-btn"
              type="submit"
              className="btn-primary"
              disabled={!isValid || loading}
              aria-label={loading ? 'Creating account…' : 'Create Account'}
              style={{marginTop:'2px'}}
            >
              {loading
                ? <><span className="spinner" aria-hidden="true"/> Creating account…</>
                : 'Create Account'}
            </button>

            <div className="auth-divider">or</div>

            <GoogleButton onClick={handleGoogle} disabled={loading} />
          </form>

          <p className="auth-footer" style={{marginTop: '14px'}}>
            Already have an account?{' '}
            <Link to="/login" className="auth-footer-link">Login</Link>
          </p>

        </div>
      </div>
    </>
  )
}
