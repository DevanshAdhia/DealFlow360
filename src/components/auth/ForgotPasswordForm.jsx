import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, KeyRound, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import Logo from './Logo'
import Toast from './Toast'
import { validateEmail } from '../../utils/validation'
import { authService } from '../../services/authService'

export default function ForgotPasswordForm() {
  const navigate = useNavigate()
  const [step, setStep]           = useState(1) // 1: Request OTP, 2: Verify OTP, 3: New Password, 4: Done
  const [email, setEmail]         = useState('')
  const [otp, setOtp]             = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [touched, setTouched]     = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast]         = useState(null)

  const emailError = touched ? validateEmail(email) : ''
  const isEmailValid = !validateEmail(email)

  const handleSendOTP = async (e) => {
    e.preventDefault()
    setTouched(true)
    if (!isEmailValid) return

    setIsSubmitting(true)
    try {
      const res = await authService.requestPasswordReset(email)
      setIsSubmitting(false)
      setStep(2)
      setToast({ message: res.message || 'OTP sent to your email address.', type: 'success' })
    } catch (err) {
      setIsSubmitting(false)
      setToast({ message: err.message || 'Failed to send OTP. Please try again.', type: 'error' })
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    if (!otp || otp.length < 6) {
      setToast({ message: 'Please enter the 6-digit OTP code.', type: 'error' })
      return
    }

    setIsSubmitting(true)
    try {
      const res = await authService.verifyPasswordOTP(email, otp)
      setIsSubmitting(false)
      setStep(3)
      setToast({ message: res.message || 'OTP verified successfully.', type: 'success' })
    } catch (err) {
      setIsSubmitting(false)
      setToast({ message: err.message || 'Invalid OTP code.', type: 'error' })
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!newPassword || newPassword.length < 8) {
      setToast({ message: 'Password must be at least 8 characters.', type: 'error' })
      return
    }
    if (newPassword !== confirmPassword) {
      setToast({ message: 'Passwords do not match.', type: 'error' })
      return
    }

    setIsSubmitting(true)
    try {
      const res = await authService.resetPassword(email, otp, newPassword)
      setIsSubmitting(false)
      setStep(4)
      setToast({ message: res.message || 'Password reset successfully!', type: 'success' })
    } catch (err) {
      setIsSubmitting(false)
      setToast({ message: err.message || 'Failed to reset password.', type: 'error' })
    }
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
          <Logo />

          {step === 1 && (
            <>
              <div className="auth-header">
                <h1 className="auth-heading">Forgot Password?</h1>
                <p className="auth-subtitle">
                  Enter your email and we'll send you a 6-digit OTP to reset your password.
                </p>
              </div>

              <form className="auth-form" onSubmit={handleSendOTP} noValidate>
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
                      className={`input-field${touched && emailError ? ' is-error' : touched && !emailError && email ? ' is-success' : ''}`}
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onBlur={() => setTouched(true)}
                      aria-invalid={!!emailError}
                      aria-describedby={emailError ? 'forgot-email-error' : undefined}
                      disabled={isSubmitting}
                    />
                    {touched && !emailError && email && (
                      <span className="input-icon-right status-icon-success" aria-hidden="true">
                        <CheckCircle size={17} strokeWidth={2} />
                      </span>
                    )}
                  </div>
                  {emailError && (
                    <p id="forgot-email-error" className="field-error" role="alert">
                      <AlertCircle size={13} strokeWidth={2.5} /> {emailError}
                    </p>
                  )}
                </div>

                <button
                  id="forgot-submit-btn"
                  type="submit"
                  className="btn-primary"
                  disabled={!isEmailValid || isSubmitting}
                  aria-label={isSubmitting ? 'Sending OTP…' : 'Send OTP'}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner" aria-hidden="true" />
                      Sending OTP…
                    </>
                  ) : 'Send OTP'}
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <div className="auth-header">
                <h1 className="auth-heading">Enter Verification Code</h1>
                <p className="auth-subtitle">
                  Please enter the 6-digit OTP code sent to <strong>{email}</strong>
                </p>
              </div>

              <form className="auth-form" onSubmit={handleVerifyOTP} noValidate>
                <div className="field-group">
                  <label className="field-label" htmlFor="forgot-otp">6-Digit OTP</label>
                  <div className="input-wrapper">
                    <span className="input-icon" aria-hidden="true">
                      <KeyRound size={17} strokeWidth={2} />
                    </span>
                    <input
                      id="forgot-otp"
                      name="otp"
                      type="text"
                      maxLength={6}
                      placeholder="e.g. 123456"
                      className="input-field"
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={otp.length < 6 || isSubmitting}
                >
                  {isSubmitting ? 'Verifying…' : 'Verify OTP'}
                </button>

                <button
                  type="button"
                  style={{ marginTop: 10, background: 'none', border: 'none', color: '#3B82F6', cursor: 'pointer', fontSize: 14 }}
                  onClick={() => setStep(1)}
                >
                  Resend OTP / Change Email
                </button>
              </form>
            </>
          )}

          {step === 3 && (
            <>
              <div className="auth-header">
                <h1 className="auth-heading">Set New Password</h1>
                <p className="auth-subtitle">
                  Create a new strong password for your account.
                </p>
              </div>

              <form className="auth-form" onSubmit={handleResetPassword} noValidate>
                <div className="field-group">
                  <label className="field-label" htmlFor="new-password">New Password</label>
                  <div className="input-wrapper">
                    <span className="input-icon" aria-hidden="true">
                      <Lock size={17} strokeWidth={2} />
                    </span>
                    <input
                      id="new-password"
                      type="password"
                      placeholder="Enter new password"
                      className="input-field"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label" htmlFor="confirm-new-password">Confirm New Password</label>
                  <div className="input-wrapper">
                    <span className="input-icon" aria-hidden="true">
                      <Lock size={17} strokeWidth={2} />
                    </span>
                    <input
                      id="confirm-new-password"
                      type="password"
                      placeholder="Confirm new password"
                      className="input-field"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={!newPassword || newPassword !== confirmPassword || isSubmitting}
                >
                  {isSubmitting ? 'Resetting Password…' : 'Reset Password'}
                </button>
              </form>
            </>
          )}

          {step === 4 && (
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
                Password Reset Complete
              </h2>
              <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.6, marginBottom: 24 }}>
                Your password has been updated successfully.
              </p>
              <button
                className="btn-primary"
                onClick={() => navigate('/login')}
              >
                Back to Login
              </button>
            </div>
          )}

          {step !== 4 && (
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
