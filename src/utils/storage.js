// DealFlow360 LocalStorage Utility

const STORAGE_KEYS = {
  USER: 'dealflow360_user',
  SESSION: 'dealflow360_session',
  REMEMBER: 'dealflow360_remembered_email',
  PREFERENCES: 'dealflow360_preferences'
};

export const getStoredSession = () => {
  try {
    const rawUser = localStorage.getItem(STORAGE_KEYS.USER) || localStorage.getItem('user');
    const rawSession = localStorage.getItem(STORAGE_KEYS.SESSION);

    if (!rawUser) return null;

    if (rawSession) {
      try {
        const session = JSON.parse(rawSession);
        if (session.expiresAt && new Date().getTime() > session.expiresAt) {
          clearSession();
          return null;
        }
      } catch {
        // Ignore JSON parse errors for session metadata
      }
    }

    return JSON.parse(rawUser);
  } catch (error) {
    console.error('Error reading session from localStorage:', error);
    return null;
  }
};

export const saveSession = (user, rememberMe = false) => {
  try {
    if (!user) return null;
    const safeUser = { ...user };
    delete safeUser.password; // Never store passwords in session

    const realToken = localStorage.getItem('access_token');
    const session = {
      token: realToken || `df360_session_${Date.now()}_${user.id || 'user'}`,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    };

    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(safeUser));
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    localStorage.setItem('user', JSON.stringify(safeUser)); // Sync with storageService

    if (rememberMe && user.email) {
      localStorage.setItem(STORAGE_KEYS.REMEMBER, user.email);
    } else {
      localStorage.removeItem(STORAGE_KEYS.REMEMBER);
    }

    return safeUser;
  } catch (error) {
    console.error('Error saving session to localStorage:', error);
    return null;
  }
};

export const clearSession = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  } catch (error) {
    console.error('Error clearing session from localStorage:', error);
  }
};

export const getRememberedEmail = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.REMEMBER) || '';
  } catch (error) {
    return '';
  }
};
