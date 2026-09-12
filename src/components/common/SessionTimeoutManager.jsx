import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { SessionTimeoutModal } from './SessionTimeoutModal';

export const SessionTimeoutManager = () => {
    const { user, showSessionWarning, countdown, resetSession, logout } = useAuth();

    if (!user || !showSessionWarning) return null;

    return (
        <SessionTimeoutModal
            countdown={countdown}
            onStayLoggedIn={resetSession}
            onLogout={logout}
        />
    );
};
