import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginAdmin as apiLoginAdmin, checkAdminSession } from '../utils/api';

const AuthContext = createContext();

const INACTIVITY_TIMEOUT_MS = 60 * 1000; // 1 minute inactivity timeout

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(
    sessionStorage.getItem('watchlab_token') || localStorage.getItem('watchlab_token') || null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      if (token) {
        try {
          const res = await checkAdminSession();
          if (res && res.admin) {
            setAdmin(res.admin);
          } else {
            logout();
          }
        } catch (err) {
          logout();
        }
      }
      setLoading(false);
    }
    initAuth();
  }, [token]);

  // Auto-logout after 1 minute of inactivity or tab switching/hidden tab
  useEffect(() => {
    if (!admin) return;

    let timeoutId;

    const resetInactivityTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        logout();
      }, INACTIVITY_TIMEOUT_MS);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // If tab is hidden or backgrounded, start inactivity countdown immediately
        resetInactivityTimer();
      } else {
        resetInactivityTimer();
      }
    };

    const userActivityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];

    userActivityEvents.forEach((evt) => {
      window.addEventListener(evt, resetInactivityTimer, { passive: true });
    });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    resetInactivityTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      userActivityEvents.forEach((evt) => {
        window.removeEventListener(evt, resetInactivityTimer);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [admin]);

  const login = async (email, password) => {
    const data = await apiLoginAdmin(email, password);
    sessionStorage.setItem('watchlab_token', data.token);
    localStorage.setItem('watchlab_token', data.token);
    setToken(data.token);
    setAdmin(data.admin);
    return data;
  };

  const logout = () => {
    sessionStorage.removeItem('watchlab_token');
    localStorage.removeItem('watchlab_token');
    setToken(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        token,
        loading,
        isAuthenticated: !!admin,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
