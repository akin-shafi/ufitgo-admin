import React from 'react';
import { Button } from './Button';

export const SessionTimeoutModal = ({ countdown, onStayLoggedIn, onLogout }) => {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl animate-scale-in">
                <div className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg
                            className="w-8 h-8 text-primary"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>

                    <h2 className="text-2xl font-bold text-fg mb-3">Session Expiring</h2>
                    <p className="text-fg/60 mb-6 leading-relaxed">
                        Your session is about to expire due to inactivity. You will be logged out automatically if no activity is detected.
                    </p>

                    <div className="mb-6 rounded-xl bg-fg/5 border border-fg/10 py-4">
                        <div className="text-sm uppercase tracking-[0.2em] text-fg/50 mb-2">Time Remaining</div>
                        <div className="text-4xl font-mono font-bold text-primary tracking-tighter">
                            {countdown}s
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button
                            onClick={onStayLoggedIn}
                            className="w-full py-4 text-base font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                        >
                            Stay Logged In
                        </Button>
                        <button
                            onClick={onLogout}
                            className="w-full py-3 text-fg/50 hover:text-fg font-medium transition-colors"
                        >
                            Log out now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
