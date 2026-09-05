// DealFlow360 LocalStorage Utility

const STORAGE_KEYS = {
  USER: 'dealflow360_user',
  SESSION: 'dealflow360_session',
  REMEMBER: 'dealflow360_remembered_email',
  PREFERENCES: 'dealflow360_preferences'
};

export const getStoredSession = () => {
  try {
    const rawUser = localStorage.getItem(STORAGE_KEYS.USER);
    const rawSession = localStorage.getItem(STORAGE_KEYS.SESSION);

    if (!rawUser || !rawSession) return null;

    const session = JSON.parse(rawSession);
    
    // Validate session expiration (e.g. 24 hours demo session)
    if (session.expiresAt && new Date().getTime() > session.expiresAt) {
      clearSession();
      return null;
    }

    return JSON.parse(rawUser);
  } catch (error) {
    console.error('Error reading session from localStorage:', error);
    return null;
  }
};

export const saveSession = (user, rememberMe = false) => {
  try {
    const safeUser = { ...user };
    delete safeUser.password; // Never store passwords in session

    const session = {
      token: `demo_jwt_token_${Date.now()}_${user.id}`,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    };

    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(safeUser));
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));

    if (rememberMe) {
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
