import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import Logo from './Logo'
import Toast from './Toast'
import { validateEmail } from '../../utils/validation'

export default function ForgotPasswordForm() {
  const navigate = useNavigate()
  const [email, setEmail]         = useState('')
  const [touched, setTouched]     = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [toast, setToast]         = useState(null)

  const error = touched ? validateEmail(email) : ''
  const isValid = !validateEmail(email)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched(true)
    if (!isValid) return

    setIsSubmitting(true)
    await new Promise(res => setTimeout(res, 1500))
    setIsSubmitting(false)
    setSubmitted(true)
    setToast({ message: 'Reset link sent! Check your inbox.', type: 'success' })
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

          {!submitted ? (
            <>
              {/* Header */}
              <div className="auth-header">
                <h1 className="auth-heading">Forgot Password?</h1>
                <p className="auth-subtitle">
                  Enter your email and we'll send you a link to reset your password.
                </p>
              </div>

              {/* Form */}
              <form className="auth-form" onSubmit={handleSubmit} noValidate>
                <div className="field-group">
                  <label className="field-label" htmlFor="forgot-email">Email Address</label>
                  <div className="input-wrapper">
                    <span className="input-icon" aria-hidden="true">
                      <Mail size={17} strokeWidth={2} />
                    </span>
                    <input
                      id="forgot-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="Enter your email"
                      className={`input-field${touched && error ? ' is-error' : touched && !error && email ? ' is-success' : ''}`}
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onBlur={() => setTouched(true)}
                      aria-invalid={!!error}
                      aria-describedby={error ? 'forgot-email-error' : undefined}
                      disabled={isSubmitting}
                    />
                    {touched && !error && email && (
                      <span className="input-icon-right status-icon-success" aria-hidden="true">
                        <CheckCircle size={17} strokeWidth={2} />
                      </span>
                    )}
                  </div>
                  {error && (
                    <p id="forgot-email-error" className="field-error" role="alert">
                      <AlertCircle size={13} strokeWidth={2.5} /> {error}
                    </p>
                  )}
                </div>

                <button
                  id="forgot-submit-btn"
                  type="submit"
                  className="btn-primary"
                  disabled={!isValid || isSubmitting}
                  aria-label={isSubmitting ? 'Sending reset link…' : 'Send Reset Link'}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner" aria-hidden="true" />
                      Sending…
                    </>
                  ) : 'Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            /* ── Success State ── */
            <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
              <div style={{
                width: 64, height: 64,
                background: '#F0FDF4', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 18px',
                border: '2px solid #86EFAC'
              }}>
                <CheckCircle size={30} color="#16A34A" strokeWidth={2} />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', marginBottom: 10 }}>
                Check Your Email
              </h2>
              <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.6, marginBottom: 24 }}>
                We've sent a password reset link to <strong style={{ color: '#0F172A' }}>{email}</strong>.
                Please check your inbox.
              </p>
              <button
                className="btn-primary"
                onClick={() => navigate('/login')}
                aria-label="Back to Login"
              >
                Back to Login
              </button>
            </div>
          )}

          {/* Back to Login */}
          {!submitted && (
            <p className="auth-footer" style={{ marginTop: '20px' }}>
              <Link to="/login" className="link-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <ArrowLeft size={14} strokeWidth={2.5} /> Back to Login
              </Link>
            </p>
          )}
        </div>
      </div>
    </>
  )
}
