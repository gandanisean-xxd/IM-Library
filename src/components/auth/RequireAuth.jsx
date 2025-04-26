import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RequireAuth = ({ allowedRoles }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const location = useLocation();
  
  if (!isAuthenticated) {
    // Redirect to the role selection page if not authenticated
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  
  if (currentUser && !allowedRoles.includes(currentUser.role)) {
    // If user role is not allowed, redirect to appropriate dashboard based on role
    if (currentUser.role === 'admin' || currentUser.role === 'librarian') {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/user/dashboard" replace />;
    }
  }
  
  // If authenticated and authorized, render the child routes
  return <Outlet />;
};

export default RequireAuth;