import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export const PermissionRoute = ({ requiredPermissions = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center py-20">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If no specific permissions are required, just allow access
  if (requiredPermissions.length === 0) {
    return <Outlet />;
  }

  // Check if user has ALL required permissions (or has the '*' wildcard)
  const userPermissions = user?.permissions || [];
  
  const hasAccess = userPermissions.includes('*') || 
    requiredPermissions.every(permission => userPermissions.includes(permission));

  if (!hasAccess) {
    // If they don't have access, redirect them to the dashboard or an unauthorized page
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PermissionRoute;
