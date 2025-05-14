import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

const AuthLayout: React.FC = () => {
  const { role } = useParams<{ role: string }>();
  const [isLogin, setIsLogin] = useState(true);

  const getRoleDisplayName = () => {
    switch (role) {
        case 'student':
            return 'Student';
        case 'faculty':
            return 'Faculty';
        case 'librarian':
            return 'Librarian';
        case 'admin':
            return 'Admin';
        default:
            return 'User';
    }
};

const getHeaderColor = () => {
    switch (role) {
        case 'student':
            return 'bg-blue-600';
        case 'faculty':
            return 'bg-amber-600';
        case 'librarian':
            return 'bg-purple-600';
        case 'admin':
            return 'bg-red-600';
        default:
            return 'bg-gray-800';
    }
};

const getPrimaryColor = () => {
    switch (role) {
        case 'student':
            return 'text-blue-600 border-blue-600';
        case 'faculty':
            return 'text-amber-600 border-amber-600';
        case 'librarian':
            return 'text-purple-600 border-purple-600';
        case 'admin':
            return 'text-red-600 border-red-600';
        default:
            return 'text-gray-800 border-gray-800';
    }
};

const getButtonColor = () => {
    switch (role) {
        case 'student':
            return 'bg-blue-600 hover:bg-blue-700';
        case 'faculty':
            return 'bg-amber-600 hover:bg-amber-700';
        case 'staff':
            return 'bg-emerald-600 hover:bg-emerald-700';
        case 'librarian':
            return 'bg-purple-600 hover:bg-purple-700';
        case 'admin':
            return 'bg-red-600 hover:bg-red-700';
        default:
            return 'bg-gray-800 hover:bg-gray-900';
    }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className={`py-4 ${getHeaderColor()}`}>
          <div className="flex items-center justify-center">
            <BookOpen className="text-white h-8 w-8 mr-2" />
            <h1 className="text-2xl font-bold text-white">Library Management System</h1>
          </div>
        </div>
        
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            {isLogin ? `${getRoleDisplayName()} Login` : `${getRoleDisplayName()} Registration`}
          </h2>
          
          {/* Toggle between login and signup */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`flex-1 py-2 font-medium border-b-2 transition-colors duration-300 ${
                isLogin 
                  ? getPrimaryColor() 
                  : 'text-gray-400 border-transparent'
              }`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            {role !== 'staff' && (
              <button
                className={`flex-1 py-2 font-medium border-b-2 transition-colors duration-300 ${
                  !isLogin 
                    ? getPrimaryColor() 
                    : 'text-gray-400 border-transparent'
                }`}
                onClick={() => setIsLogin(false)}
              >
                Sign Up
              </button>
            )}
          </div>
          
          {isLogin ? (
            <LoginForm role={role || ''} buttonColorClass={getButtonColor()} />
          ) : (
            <SignupForm role={role || ''} buttonColorClass={getButtonColor()} />
          )}
        </div>
        
        <div className="p-4 bg-gray-50 text-center">
          <Link to="/" className="text-gray-600 hover:text-gray-800 transition-colors duration-300">
            Return to role selection
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;