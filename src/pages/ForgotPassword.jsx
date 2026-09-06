import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import '../styles/auth.css'
import DealFlowLogo from '../components/auth/DealFlowLogo'
import AuthInput from '../components/auth/AuthInput'
import { validateEmail } from '../utils/validation'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email,   setEmail]   = useState('')
  const [touched, setTouched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)

  const error   = touched ? validateEmail(email) : ''
  const isValid = !validateEmail(email)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched(true)
    if (!isValid) return

    setLoading(true)
    await new Promise(r => setTimeout(r, 900))
    setLoading(false)
    setSent(true)
  }

  return (
    <div className="auth-page">
      <div className="auth-card" role="main">
        <DealFlowLogo />

        {!sent ? (
          <>
            <h1 className="auth-title">Forgot Password?</h1>
            <p className="auth-description">
              Enter your email and we'll help you reset your password.
            </p>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <AuthInput
                id="forgot-email" name="email" type="email"
                label="Email Address"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onBlur={() => setTouched(true)}
                icon={Mail}
                error={error}
                touched={touched}
                autoComplete="email"
                disabled={loading}
              />

              <button
                id="forgot-submit-btn"
                type="submit"
                className="btn-primary"
                disabled={!isValid || loading}
                aria-label={loading ? 'Sending…' : 'Send Reset Link'}
                style={{marginTop:'4px'}}
              >
                {loading ? <><span className="spinner" aria-hidden="true"/> Sending…</> : 'Send Reset Link'}
              </button>
            </form>
          </>
        ) : (
          /* Success state */
          <div style={{textAlign:'center', padding:'8px 0'}}>
            <div style={{
              width:56, height:56, background:'#F0FDF4', borderRadius:'50%',
              display:'flex', alignItems:'center', justifyContent:'center',
              margin:'0 auto 14px', border:'2px solid #86EFAC'
            }}>
              <CheckCircle size={26} color="#16A34A" strokeWidth={2}/>
            </div>
            <h2 style={{fontSize:18, fontWeight:700, color:'#0F172A', marginBottom:8}}>
              Check Your Email
            </h2>
            <p style={{fontSize:13, color:'#64748B', lineHeight:1.6, marginBottom:20}}>
              We sent a reset link to <strong style={{color:'#0F172A'}}>{email}</strong>.<br/>
              Please check your inbox.
            </p>
            <button
              className="btn-primary"
              onClick={() => navigate('/login')}
              id="forgot-back-btn"
            >
              Back to Login
            </button>
          </div>
        )}

        {!sent && (
          <p className="auth-footer" style={{marginTop:'14px'}}>
            <Link to="/login" className="auth-footer-link"
              style={{display:'inline-flex', alignItems:'center', gap:'4px'}}>
              <ArrowLeft size={13} strokeWidth={2.5}/> Back to Login
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
