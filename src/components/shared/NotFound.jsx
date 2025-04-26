import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NotFound = () => {
  const { isAuthenticated, currentUser } = useAuth();
  
  // Determine where to redirect the user based on their role
  const getDashboardLink = () => {
    if (!isAuthenticated) return '/';
    
    if (currentUser?.role === 'admin' || currentUser?.role === 'librarian') {
      return '/admin/dashboard';
    } else {
      return '/user/dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <BookOpen className="h-20 w-20 text-blue-600 mx-auto" />
        </div>
        
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't seem to exist or has been moved.
        </p>
        
        <div className="space-x-4">
          <Link 
            to={getDashboardLink()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <Home className="mr-2 h-5 w-5" />
            Back to Home
          </Link>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-blue-300 text-base font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100"
          >
            Role Selection
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;