export const FEATURE_FLAGS = {
    ESCROW_DASHBOARD: false, // Hide Compliance & Escrow for now
    FX_SAVINGS_STATS: true,
    AUDIT_LOGS: false,
};

export const isFeatureEnabled = (flag) => {
    return FEATURE_FLAGS[flag] || false;
};
