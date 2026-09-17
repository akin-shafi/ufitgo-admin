export const ADMIN_ROLES = ['SUPER_ADMIN', 'MANAGING_DIRECTOR', 'FINANCE', 'OPERATIONS', 'COMPLIANCE', 'TECHNICAL', 'SUPPORT'];

// Every permission string used to gate a sidebar route, grouped for the checklist UI.
export const PERMISSION_GROUPS = [
  {
    label: 'Analytics',
    permissions: ['analytics.read'],
  },
  {
    label: 'Operations',
    permissions: ['users.manage', 'operators.manage', 'packages.manage', 'bookings.manage', 'journeys.manage'],
  },
  {
    label: 'Finance',
    permissions: ['finance.summary.read', 'payments.read', 'settlements.manage', 'commissions.manage', 'reconciliation.manage'],
  },
  {
    label: 'Compliance',
    permissions: ['kyc.manage', 'kyb.manage', 'compliance.manage'],
  },
  {
    label: 'Monitoring',
    permissions: ['monitoring.read', 'infrastructure.read'],
  },
  {
    label: 'Marketing & Tools',
    permissions: ['marketing.manage', 'extensions.manage'],
  },
  {
    label: 'Platform',
    permissions: ['settings.manage', 'audit.read'],
  },
];

// Reasonable starting point for a newly invited admin of each role — always editable via the checklist.
export const ROLE_DEFAULT_PERMISSIONS = {
  SUPER_ADMIN: ['*'],
  MANAGING_DIRECTOR: ['*'],
  FINANCE: ['finance.summary.read', 'payments.read', 'settlements.manage', 'commissions.manage', 'reconciliation.manage'],
  OPERATIONS: ['users.manage', 'operators.manage', 'packages.manage', 'bookings.manage', 'journeys.manage'],
  COMPLIANCE: ['kyc.manage', 'kyb.manage', 'compliance.manage'],
  TECHNICAL: ['monitoring.read', 'infrastructure.read', 'extensions.manage'],
  SUPPORT: ['users.manage', 'bookings.manage'],
};
