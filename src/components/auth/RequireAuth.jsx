import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RequireAuth = ({ allowedRoles }) => {
  const { user, token, role } = useAuth();
  const location = useLocation();
  
  console.log('Auth check:', { user, token, role, allowedRoles, path: location.pathname });

  // Check if user is authenticated
  if (!user || !token) {
    console.log('No user or token, redirecting to login');
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check if user has allowed role
  if (!allowedRoles.includes(role)) {
    console.log('User role not allowed:', role);
    return <Navigate to="/" replace />;
  }

  console.log('Auth successful, rendering outlet');
  return <Outlet />;
};

export default RequireAuth;