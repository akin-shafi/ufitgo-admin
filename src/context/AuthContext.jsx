import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import api from '@/api/client';

const AuthContext = createContext(null);
const INACTIVITY_LIMIT = 15 * 60 * 1000;
const WARNING_WINDOW = 60 * 1000;
const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll', 'click'];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [countdown, setCountdown] = useState(Math.ceil(WARNING_WINDOW / 1000));

  const inactivityTimerRef = useRef(null);
  const warningIntervalRef = useRef(null);

  const clearSessionTimers = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }

    if (warningIntervalRef.current) {
      clearInterval(warningIntervalRef.current);
      warningIntervalRef.current = null;
    }
  }, []);

  const finishLogout = useCallback(() => {
    clearSessionTimers();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setShowSessionWarning(false);
    setCountdown(Math.ceil(WARNING_WINDOW / 1000));
    window.location.href = '/login';
  }, [clearSessionTimers]);

  const resetSession = useCallback(() => {
    if (!user) return;

    clearSessionTimers();
    setShowSessionWarning(false);
    setCountdown(Math.ceil(WARNING_WINDOW / 1000));

    inactivityTimerRef.current = setTimeout(() => {
      setShowSessionWarning(true);
      setCountdown(Math.ceil(WARNING_WINDOW / 1000));

      warningIntervalRef.current = setInterval(() => {
        setCountdown((previous) => {
          if (previous <= 1) {
            clearInterval(warningIntervalRef.current);
            warningIntervalRef.current = null;
            finishLogout();
            return 0;
          }
          return previous - 1;
        });
      }, 1000);
    }, INACTIVITY_LIMIT - WARNING_WINDOW);
  }, [clearSessionTimers, finishLogout, user]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Verify token if needed
        } catch {
          finishLogout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [finishLogout]);

  useEffect(() => {
    if (!user) {
      clearSessionTimers();
      setShowSessionWarning(false);
      setCountdown(Math.ceil(WARNING_WINDOW / 1000));
      return undefined;
    }

    resetSession();
    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, resetSession));

    return () => {
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, resetSession));
      clearSessionTimers();
    };
  }, [user, resetSession, clearSessionTimers]);

  const login = async (email, password) => {
    const { data } = await api.post('/admin/auth/login', { email, password });

    if (!data.admin) {
      throw new Error('Access denied. Invalid admin credentials.');
    }

    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.admin));
    setUser(data.admin);
    setShowSessionWarning(false);
    setCountdown(Math.ceil(WARNING_WINDOW / 1000));
    return data;
  };

  const logout = () => {
    finishLogout();
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user,
      loading,
      showSessionWarning,
      countdown,
      resetSession,
    }}>
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
