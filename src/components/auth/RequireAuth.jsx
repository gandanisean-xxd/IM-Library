import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RequireAuth = ({ allowedRoles }) => {
  const { currentUser, token } = useAuth();
  const location = useLocation();
  
  console.log('Auth check:', { currentUser, token, allowedRoles, path: location.pathname });

  // Check if user is authenticated
  if (!currentUser || !token) {
    console.log('No user or token, redirecting to login');
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Map staff role to librarian for permission checking
  const effectiveRole = currentUser.role === 'staff' ? 'librarian' : currentUser.role;

  // Check if user has allowed role
  if (!allowedRoles.includes(effectiveRole)) {
    console.log('User role not allowed:', currentUser.role);
    return <Navigate to="/" replace />;
  }

  console.log('Auth successful, rendering outlet');
  return <Outlet />;
};

export default RequireAuth;