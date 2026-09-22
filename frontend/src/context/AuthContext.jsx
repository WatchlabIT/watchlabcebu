import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginAdmin as apiLoginAdmin, checkAdminSession } from '../utils/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('watchlab_token') || null);
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

  const login = async (email, password) => {
    const data = await apiLoginAdmin(email, password);
    localStorage.setItem('watchlab_token', data.token);
    setToken(data.token);
    setAdmin(data.admin);
    return data;
  };

  const logout = () => {
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
