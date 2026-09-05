import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/apiService';
import { setSession } from '../services/storageService';

function Login({ onLogin }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Password123!');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error('Please enter both username/email and password');
      return;
    }

    setLoading(true);

    try {
      const res = await api.login({ username: username.trim(), password });
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
        } : { name: username, email: username, role: 'Admin' };

        setSession(userObj);
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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--surface-secondary)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: 'var(--space-8)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <h1 style={{ color: 'var(--primary)', marginBottom: 'var(--space-2)' }}>DealFlow360</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Admin Control Center</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username or Email</label>
            <input 
              type="text" 
              className="form-input" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password123!"
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
