import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { setSession } from '../services/storageService';

function Login({ onLogin }) {
  const [email, setEmail] = useState('admin@dealflow360.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (email === 'admin@dealflow360.com' && password === 'admin123') {
        const user = {
          name: 'Super Admin',
          email: 'admin@dealflow360.com',
          role: 'Admin'
        };
        setSession(user);
        onLogin(user);
        toast.success('Login successful');
      } else {
        toast.error('Invalid credentials');
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--surface-secondary)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: 'var(--space-8)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <h1 style={{ color: 'var(--primary)', marginBottom: 'var(--space-2)' }}>DealFlow360</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Admin Control Center</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-input" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@dealflow360.com"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="admin123"
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: 'var(--space-4)', padding: 'var(--space-3)' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
