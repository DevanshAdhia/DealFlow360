import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api } from '../services/apiService';
import { setSession, getUsers, saveEntity, addAuditLog } from '../services/storageService';

const ROLES = ['Admin', 'Sales Manager', 'Sales Representative', 'Finance', 'Operations'];

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';

  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('admin@dealflow360.com');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [rememberMe, setRememberMe] = useState(true);

  // Signup State
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    department: 'Sales',
    role: 'Sales Representative',
    password: '',
    confirmPassword: ''
  });
  const [signupErrors, setSignupErrors] = useState({});

  const [loading, setLoading] = useState(false);

  // Quick Demo Accounts
  const demoAccounts = [
    { label: 'Super Admin', email: 'admin@dealflow360.com', role: 'Admin' },
    { label: 'Sales Manager', email: 'sarah.smith@dealflow360.com', role: 'Sales Manager' },
    { label: 'Sales Rep', email: 'john.doe@dealflow360.com', role: 'Sales Representative' },
    { label: 'Finance Officer', email: 'finance@dealflow360.com', role: 'Finance' },
  ];

  const handleQuickLogin = (demo) => {
    setLoginEmail(demo.email);
    setLoginPassword('admin123');
    const user = {
      name: demo.label,
      email: demo.email,
      role: demo.role
    };
    setSession(user);
    addAuditLog(user, 'User Login', 'Auth', `Quick login as ${demo.label}`);
    onLogin(user);
    toast.success(`Logged in as ${demo.label}`);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail?.trim() || !loginPassword?.trim()) {
      toast.error('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.login({ username: loginEmail.trim(), password: loginPassword });
      if (res && res.access) {
        localStorage.setItem('access_token', res.access);
        if (res.refresh) {
          localStorage.setItem('refresh_token', res.refresh);
        }

        const userObj = res.user ? {
          id: res.user.id,
          name: res.user.name || res.user.username,
          email: res.user.email,
          role: res.user.role || 'Admin'
        } : { name: loginEmail, email: loginEmail, role: 'Admin' };

        setSession(userObj);
        addAuditLog(userObj, 'User Login', 'Auth', `${userObj.name} signed in via API`);
        onLogin(userObj);
        toast.success('Login successful');
      } else {
        throw new Error('Invalid response from server.');
      }
    } catch (err) {
      toast.error(err.message || 'Login failed. Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  const validateSignup = () => {
    const errs = {};
    if (!signupForm.name.trim()) errs.name = 'Full name is required';
    if (!signupForm.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupForm.email)) errs.email = 'Valid work email required';
    if (!signupForm.password || signupForm.password.length < 6) errs.password = 'Min 6 characters required';
    if (signupForm.password !== signupForm.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    const errs = validateSignup();
    if (Object.keys(errs).length > 0) {
      setSignupErrors(errs);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const existingUsers = getUsers();
      if (existingUsers.some(u => u.email?.toLowerCase() === signupForm.email.trim().toLowerCase())) {
        setSignupErrors({ email: 'An account with this email already exists' });
        setLoading(false);
        return;
      }

      const newUser = {
        name: signupForm.name.trim(),
        email: signupForm.email.trim(),
        department: signupForm.department,
        role: signupForm.role,
        status: 'Active',
        created: new Date().toISOString().split('T')[0]
      };

      // Save user to storage
      saveEntity('df_users', newUser, true);

      const sessionUser = { name: newUser.name, email: newUser.email, role: newUser.role };
      setSession(sessionUser);
      addAuditLog(sessionUser, 'Created Account', 'Auth', `New user registered: ${newUser.name}`);
      
      toast.success('Account created successfully!');
      onLogin(sessionUser);
    }, 500);
  };

  const inp = { width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem', boxSizing: 'border-box' };
  const lbl = { display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '0', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
        
        {/* Header Hero Banner */}
        <div style={{ backgroundColor: '#4f46e5', padding: '32px 24px 24px 24px', color: 'white', textAlign: 'center', position: 'relative' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
            <svg style={{ width: '28px', height: '28px', color: 'white' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: '0 0 4px 0', letterSpacing: '-0.025em' }}>DealFlow360</h1>
          <p style={{ fontSize: '0.875rem', color: '#c7d2fe', margin: 0 }}>Enterprise Control Center</p>
        </div>

        {/* Tab Toggle */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
          <button
            type="button"
            onClick={() => { setMode('login'); setSignupErrors({}); }}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              borderBottom: mode === 'login' ? '3px solid #4f46e5' : '3px solid transparent',
              backgroundColor: mode === 'login' ? 'white' : 'transparent',
              color: mode === 'login' ? '#4f46e5' : '#6b7280',
              fontWeight: '600',
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setSignupErrors({}); }}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              borderBottom: mode === 'signup' ? '3px solid #4f46e5' : '3px solid transparent',
              backgroundColor: mode === 'signup' ? 'white' : 'transparent',
              color: mode === 'signup' ? '#4f46e5' : '#6b7280',
              fontWeight: '600',
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <div style={{ padding: '24px' }}>
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={lbl}>Work Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="admin@dealflow360.com"
                  style={inp}
                  required
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ ...lbl, margin: 0 }}>Password</label>
                  <span style={{ fontSize: '0.75rem', color: '#4f46e5', cursor: 'pointer' }} onClick={() => toast.info('Default admin password is "admin123"')}>Forgot password?</span>
                </div>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  style={inp}
                  required
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <label htmlFor="remember" style={{ fontSize: '0.875rem', color: '#4b5563', cursor: 'pointer' }}>
                  Remember this device for 30 days
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '10px', fontSize: '0.875rem', fontWeight: '600', marginTop: '4px' }}
              >
                {loading ? 'Authenticating…' : 'Sign In to Dashboard'}
              </button>

              {/* Quick Persona Demo Switcher */}
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', textAlign: 'center' }}>
                  ⚡ Quick Demo 1-Click Login
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {demoAccounts.map(demo => (
                    <button
                      key={demo.label}
                      type="button"
                      onClick={() => handleQuickLogin(demo)}
                      style={{
                        padding: '6px 8px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        backgroundColor: '#f9fafb',
                        color: '#374151',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#c7d2fe'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                    >
                      <div style={{ fontWeight: '600', color: '#111827' }}>{demo.label}</div>
                      <div style={{ fontSize: '0.65rem', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis' }}>{demo.email}</div>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={lbl}>Full Name *</label>
                <input
                  type="text"
                  value={signupForm.name}
                  onChange={e => setSignupForm({ ...signupForm, name: e.target.value })}
                  placeholder="e.g. Alexander Wright"
                  style={{ ...inp, borderColor: signupErrors.name ? '#ef4444' : '#d1d5db' }}
                />
                {signupErrors.name && <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: '3px 0 0' }}>{signupErrors.name}</p>}
              </div>

              <div>
                <label style={lbl}>Work Email *</label>
                <input
                  type="email"
                  value={signupForm.email}
                  onChange={e => setSignupForm({ ...signupForm, email: e.target.value })}
                  placeholder="alexander@company.com"
                  style={{ ...inp, borderColor: signupErrors.email ? '#ef4444' : '#d1d5db' }}
                />
                {signupErrors.email && <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: '3px 0 0' }}>{signupErrors.email}</p>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={lbl}>Role *</label>
                  <select
                    value={signupForm.role}
                    onChange={e => setSignupForm({ ...signupForm, role: e.target.value })}
                    style={inp}
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Department</label>
                  <select
                    value={signupForm.department}
                    onChange={e => setSignupForm({ ...signupForm, department: e.target.value })}
                    style={inp}
                  >
                    <option value="Sales">Sales</option>
                    <option value="Finance">Finance</option>
                    <option value="Operations">Operations</option>
                    <option value="IT">IT</option>
                    <option value="HR">HR</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={lbl}>Password *</label>
                <input
                  type="password"
                  value={signupForm.password}
                  onChange={e => setSignupForm({ ...signupForm, password: e.target.value })}
                  placeholder="Min 6 characters"
                  style={{ ...inp, borderColor: signupErrors.password ? '#ef4444' : '#d1d5db' }}
                />
                {signupErrors.password && <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: '3px 0 0' }}>{signupErrors.password}</p>}
              </div>

              <div>
                <label style={lbl}>Confirm Password *</label>
                <input
                  type="password"
                  value={signupForm.confirmPassword}
                  onChange={e => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                  placeholder="Re-enter password"
                  style={{ ...inp, borderColor: signupErrors.confirmPassword ? '#ef4444' : '#d1d5db' }}
                />
                {signupErrors.confirmPassword && <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: '3px 0 0' }}>{signupErrors.confirmPassword}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '10px', fontSize: '0.875rem', fontWeight: '600', marginTop: '6px' }}
              >
                {loading ? 'Registering…' : 'Create & Access Dashboard'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '8px' }}>
                <span style={{ fontSize: '0.8125rem', color: '#6b7280' }}>
                  Already have an account?{' '}
                  <span
                    onClick={() => setMode('login')}
                    style={{ color: '#4f46e5', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Sign In
                  </span>
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
