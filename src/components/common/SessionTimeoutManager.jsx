import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SessionTimeoutModal } from './SessionTimeoutModal';

// Configurations
const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutes
const WARNING_LIMIT = 60 * 1000; // 60 seconds warning before logout
const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];

export const SessionTimeoutManager = () => {
    const { operator, logout } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [countdown, setCountdown] = useState(WARNING_LIMIT / 1000);

    const timerRef = useRef(null);
    const warningTimerRef = useRef(null);
    const countdownIntervalRef = useRef(null);

    const handleLogout = useCallback(() => {
        // Clear all timers
        if (timerRef.current) clearTimeout(timerRef.current);
        if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

        setShowModal(false);
        logout();
    }, [logout]);

    const resetTimers = useCallback(() => {
        if (!operator) return;

        // Clear existing timers
        if (timerRef.current) clearTimeout(timerRef.current);
        if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

        setShowModal(false);
        setCountdown(WARNING_LIMIT / 1000);

        // Set main inactivity timer
        timerRef.current = setTimeout(() => {
            setShowModal(true);

            // Start countdown interval
            countdownIntervalRef.current = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        handleLogout();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

        }, INACTIVITY_LIMIT - WARNING_LIMIT);

    }, [operator, handleLogout]);

    useEffect(() => {
        if (operator) {
            // Add activity listeners
            ACTIVITY_EVENTS.forEach((event) => {
                window.addEventListener(event, resetTimers);
            });

            // Initial timer set
            resetTimers();
        }

        return () => {
            ACTIVITY_EVENTS.forEach((event) => {
                window.removeEventListener(event, resetTimers);
            });
            if (timerRef.current) clearTimeout(timerRef.current);
            if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        };
    }, [operator, resetTimers]);

    if (!operator || !showModal) return null;

    return (
        <SessionTimeoutModal
            countdown={countdown}
            onStayLoggedIn={resetTimers}
            onLogout={handleLogout}
        />
    );
};
