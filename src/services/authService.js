const API_BASE_URL = 'http://localhost:8000/api';

const handleResponse = async (response) => {
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    let message = 'An error occurred';
    if (data.error && data.error.message) {
      message = data.error.message;
    } else if (data.detail) {
      message = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
    } else if (typeof data === 'object' && Object.keys(data).length > 0) {
      message = Object.entries(data)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
        .join(' | ');
    }
    const err = new Error(message);
    err.status = response.status;
    err.data = data;
    throw err;
  }
  return data;
};

export const authService = {
  login: async (emailOrUsername, password) => {
    const res = await fetch(`${API_BASE_URL}/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: emailOrUsername, password }),
    });
    const data = await handleResponse(res);
    if (data.access) {
      localStorage.setItem('access_token', data.access);
      if (data.refresh) localStorage.setItem('refresh_token', data.refresh);
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  signup: async ({ name, email, password, role = 'CUSTOMER' }) => {
    const nameParts = (name || '').trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    const username = email.split('@')[0] + '_' + Math.floor(Math.random() * 1000);

    const res = await fetch(`${API_BASE_URL}/signup/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        role,
      }),
    });
    return await handleResponse(res);
  },

  requestPasswordReset: async (email) => {
    const res = await fetch(`${API_BASE_URL}/login/forgot-password/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return await handleResponse(res);
  },

  verifyPasswordOTP: async (email, otp) => {
    const res = await fetch(`${API_BASE_URL}/login/verify-otp/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    return await handleResponse(res);
  },

  resetPassword: async (email, otp, newPassword) => {
    const res = await fetch(`${API_BASE_URL}/login/reset-password/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, new_password: newPassword, confirm_password: newPassword }),
    });
    return await handleResponse(res);
  },

  getCurrentUser: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return null;
    const res = await fetch(`${API_BASE_URL}/login/me/`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return await handleResponse(res);
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },
};
