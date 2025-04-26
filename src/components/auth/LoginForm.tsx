import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface LoginFormProps {
  role: string;
  buttonColorClass: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ role, buttonColorClass }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    const success = login(email, password);
    
    if (success) {
      // Redirect based on role
      switch (role) {
        case 'student':
        case 'faculty':
          navigate('/user/dashboard');
          break;
        case 'staff':
          navigate('/admin/dashboard');
          break;
        default:
          navigate('/');
      }
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
          Email
        </label>
        <input
          id="email"
          type="email"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <div className="mb-6">
        <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
          Password
        </label>
        <input
          id="password"
          type="password"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      
      <div className="flex flex-col space-y-4">
        <button
          type="submit"
          className={`${buttonColorClass} text-white font-semibold py-2 px-4 rounded-md transition-colors duration-300 w-full`}
        >
          Login
        </button>
      </div>
      
      <div className="mt-4 text-center">
        <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
          Forgot your password?
        </a>
      </div>
    </form>
  );
};

export default LoginForm;