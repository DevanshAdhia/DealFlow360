import { MOCK_USERS } from '../data/users.js';

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

export const authenticateCredentials = (email, password) => {
  const normalizedEmail = email.trim().toLowerCase();
  
  const user = MOCK_USERS.find(
    (u) => u.email.toLowerCase() === normalizedEmail && u.password === password
  );

  if (!user) {
    return {
      success: false,
      user: null,
      error: 'Invalid email or password.'
    };
  }

  return {
    success: true,
    user,
    error: null
  };
};

export const isRoleAuthorized = (userRole, allowedRoles) => {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  if (!userRole) return false;
  if (userRole === 'admin') return true; // Admin has universal access
  return allowedRoles.includes(userRole);
};
