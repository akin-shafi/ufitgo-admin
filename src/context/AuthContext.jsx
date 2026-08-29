import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Verify token if needed
        } catch  {
          logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  // Inactivity Timeout (15 minutes)
  useEffect(() => {
    let timeoutId;
    const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutes

    const resetTimeout = () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (user) {
        timeoutId = setTimeout(() => {
          logout();
          alert('You have been logged out due to inactivity.');
        }, INACTIVITY_LIMIT);
      }
    };

    if (user) {
      resetTimeout();
      const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
      events.forEach(event => window.addEventListener(event, resetTimeout));

      return () => {
        if (timeoutId) clearTimeout(timeoutId);
        events.forEach(event => window.removeEventListener(event, resetTimeout));
      };
    }
  }, [user]);

  const login = async (email, password) => {
    // Uses VITE_API_URL which will point to Kong API Gateway, or Admin API directly if configured
    const { data } = await api.post('/admin/auth/login', { email, password });
    
    // The new admin api returns { access_token, admin: { id, email, name } }
    if (!data.admin) {
      throw new Error('Access denied. Invalid admin credentials.');
    }

    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.admin));
    setUser(data.admin);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
