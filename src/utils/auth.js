export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return { isValid: false, error: 'Email is required.' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: 'Please enter a valid email address.' };
  }

  return { isValid: true, error: '' };
};

export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, error: 'Password is required.' };
  }

  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters.' };
  }

  return { isValid: true, error: '' };
};

export const authenticateCredentials = async (email, password) => {
  try {
    const res = await fetch('http://localhost:8000/api/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, user: null, error: data.detail || 'Invalid email or password.' };
    }
    if (data.access) {
      localStorage.setItem('access_token', data.access);
      if (data.refresh) localStorage.setItem('refresh_token', data.refresh);
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
    }
    return { success: true, user: data.user, error: null };
  } catch (err) {
    return { success: false, user: null, error: 'Cannot connect to authentication service.' };
  }
};

export const isRoleAuthorized = (userRole, allowedRoles) => {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  if (!userRole) return false;
  if (userRole === 'admin' || userRole === 'ADMIN') return true;
  return allowedRoles.includes(userRole);
};
