import { useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  User, Mail, Lock, Eye, EyeOff,
  CheckCircle, AlertCircle, ShieldCheck, Check
} from 'lucide-react'
import Logo from './Logo'
import GoogleIcon from './GoogleIcon'
import Toast from './Toast'
import {
  validateName,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  getPasswordRequirements
} from '../../utils/validation'
import { authService } from '../../services/authService'

export default function SignupForm() {
  const navigate = useNavigate()

  // ── form values
  const [name, setName]                 = useState('')
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // ── visibility toggles
  const [showPassword, setShowPassword]                 = useState(false)
  const [showConfirmPassword, setShowConfirmPassword]   = useState(false)

  // ── touched (dirty) state
  const [touched, setTouched] = useState({
    name: false, email: false, password: false, confirmPassword: false
  })

  // ── submission
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast]               = useState(null)

  // ── derived errors
  const errors = {
    name:            touched.name            ? validateName(name)                           : '',
    email:           touched.email           ? validateEmail(email)                         : '',
    password:        touched.password        ? validatePassword(password)                   : '',
    confirmPassword: touched.confirmPassword ? validateConfirmPassword(password, confirmPassword) : '',
  }

  const pwReqs = getPasswordRequirements(password)
  const showPwReqs = touched.password && password.length > 0

  // ── password match indicator (only show when confirmPassword has content)
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword
  const passwordsMismatch = touched.confirmPassword && confirmPassword.length > 0 && password !== confirmPassword

  // ── is form fully valid?
  const isFormValid =
    !validateName(name) &&
    !validateEmail(email) &&
    !validatePassword(password) &&
    !validateConfirmPassword(password, confirmPassword)

  // ── handlers
  const handleBlur = useCallback((field) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }, [])

  const getInputClass = (field) => {
    const base = 'input-field'
    if (!touched[field]) return base
    if (errors[field]) return `${base} is-error`
    if (field === 'name'  && name)            return `${base} is-success`
    if (field === 'email' && email)           return `${base} is-success`
    if (field === 'password' && password)     return `${base} is-success`
    if (field === 'confirmPassword' && confirmPassword && passwordsMatch) return `${base} is-success`
    if (field === 'confirmPassword' && confirmPassword && !passwordsMatch) return `${base} is-error`
    return base
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Mark all fields touched
    setTouched({ name: true, email: true, password: true, confirmPassword: true })

    if (!isFormValid) return

    setIsSubmitting(true)
    try {
      await authService.signup({ name, email, password })
      setToast({ message: 'Account created successfully! Please log in.', type: 'success' })
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setToast({ message: err.message || 'Signup failed. Please try again.', type: 'error' })
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
          <div className="auth-header">
            <h1 className="auth-heading">Create Your Account</h1>
            <p className="auth-subtitle">Sign up to get started with DealFlow360</p>
          </div>

          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit} noValidate>

            {/* ── Full Name ── */}
            <div className="field-group">
              <label className="field-label" htmlFor="signup-name">Full Name</label>
              <div className="input-wrapper">
                <span className="input-icon" aria-hidden="true">
                  <User size={17} strokeWidth={2} />
                </span>
                <input
                  id="signup-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  className={getInputClass('name')}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onBlur={() => handleBlur('name')}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                  disabled={isSubmitting}
                />
                {touched.name && !errors.name && name && (
                  <span className="input-icon-right status-icon-success" aria-hidden="true">
                    <CheckCircle size={17} strokeWidth={2} />
                  </span>
                )}
                {touched.name && errors.name && (
                  <span className="input-icon-right status-icon-error" aria-hidden="true">
                    <AlertCircle size={17} strokeWidth={2} />
                  </span>
                )}
              </div>
              {errors.name && (
                <p id="name-error" className="field-error" role="alert">
                  <AlertCircle size={13} strokeWidth={2.5} /> {errors.name}
                </p>
              )}
            </div>

            {/* ── Email ── */}
            <div className="field-group">
              <label className="field-label" htmlFor="signup-email">Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon" aria-hidden="true">
                  <Mail size={17} strokeWidth={2} />
                </span>
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  className={getInputClass('email')}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onBlur={() => handleBlur('email')}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
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
                <p id="email-error" className="field-error" role="alert">
                  <AlertCircle size={13} strokeWidth={2.5} /> {errors.email}
                </p>
              )}
            </div>

            {/* ── Password ── */}
            <div className="field-group">
              <label className="field-label" htmlFor="signup-password">Password</label>
              <div className="input-wrapper">
                <span className="input-icon" aria-hidden="true">
                  <Lock size={17} strokeWidth={2} />
                </span>
                <input
                  id="signup-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Enter your password"
                  className={getInputClass('password')}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onBlur={() => handleBlur('password')}
                  aria-invalid={!!errors.password}
                  aria-describedby="pw-reqs"
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

              {/* Password requirements */}
              {showPwReqs && (
                <div id="pw-reqs" className="pw-requirements" role="status" aria-label="Password requirements">
                  {pwReqs.map(req => (
                    <div key={req.label} className={`pw-req-item ${req.valid ? 'valid' : 'invalid'}`}>
                      {req.valid
                        ? <CheckCircle size={13} strokeWidth={2.5} />
                        : <ShieldCheck size={13} strokeWidth={2} />
                      }
                      {req.label}
                    </div>
                  ))}
                </div>
              )}

              {/* Show error only if not showing requirements panel */}
              {errors.password && !showPwReqs && (
                <p className="field-error" role="alert">
                  <AlertCircle size={13} strokeWidth={2.5} /> {errors.password}
                </p>
              )}
            </div>

            {/* ── Confirm Password ── */}
            <div className="field-group">
              <label className="field-label" htmlFor="signup-confirm-password">Confirm Password</label>
              <div className="input-wrapper">
                <span className="input-icon" aria-hidden="true">
                  <Lock size={17} strokeWidth={2} />
                </span>
                <input
                  id="signup-confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Confirm your password"
                  className={getInputClass('confirmPassword')}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  aria-invalid={passwordsMismatch}
                  aria-describedby="confirm-pw-status"
                  disabled={isSubmitting}
                />
                <span className="input-icon-right">
                  <button
                    type="button"
                    className="input-btn"
                    onClick={() => setShowConfirmPassword(v => !v)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    tabIndex={0}
                  >
                    {showConfirmPassword ? <EyeOff size={17} strokeWidth={2} /> : <Eye size={17} strokeWidth={2} />}
                  </button>
                </span>
              </div>

              {/* Match / Mismatch indicator */}
              {passwordsMatch && (
                <p id="confirm-pw-status" className="field-success" role="status">
                  <CheckCircle size={13} strokeWidth={2.5} /> Passwords match
                </p>
              )}
              {passwordsMismatch && (
                <p id="confirm-pw-status" className="field-error" role="alert">
                  <AlertCircle size={13} strokeWidth={2.5} /> Passwords do not match
                </p>
              )}
            </div>

            {/* ── Submit ── */}
            <button
              id="signup-submit-btn"
              type="submit"
              className="btn-primary"
              disabled={!isFormValid || isSubmitting}
              aria-label={isSubmitting ? 'Creating your account…' : 'Sign up'}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  Creating Account…
                </>
              ) : 'Sign Up'}
            </button>

            {/* ── Divider ── */}
            <div className="auth-divider" aria-hidden="true">or continue with</div>

            {/* ── Google ── */}
            <button
              id="signup-google-btn"
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
          <p className="auth-footer">
            Already have an account?{' '}
            <Link to="/login" className="link-btn">Login</Link>
          </p>
        </div>
      </div>
    </>
  )
}
