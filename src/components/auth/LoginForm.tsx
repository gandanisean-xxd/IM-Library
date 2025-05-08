import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface LoginFormProps {
  role: string;
  buttonColorClass: string;
}

// ...existing imports...

const LoginForm: React.FC<LoginFormProps> = ({ role, buttonColorClass }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
        console.log('Sending login request:', { email, role }); // Debug log

        const response = await fetch(`http://localhost:5000/api/login/${role}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                email: email.trim(),
                password: password
            })
        });

        const data = await response.json();
        console.log('Login response:', data); // Debug log

        if (response.ok && data.success) {
            // Create login data with token
            const loginData = {
                user: {
                    ...data.user,
                    role: role
                },
                token: data.token, // Don't use || null here
                role: role
            };

            console.log('Login data:', loginData); // Debug log
            
            // Store user data in context
            login(loginData);

            // Navigate based on role
            if (role === 'staff') {
                navigate('/admin/dashboard', { replace: true });
            } else {
                navigate('/user/dashboard', { replace: true });
            }
        } else {
            setError(data.message || 'Invalid email or password');
        }
    } catch (error) {
        console.error('Login error:', error);
        setError('Server connection failed. Please try again later.');
    } finally {
        setIsLoading(false);
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
                disabled={isLoading}
                className={`${buttonColorClass} text-white font-semibold py-2 px-4 rounded-md 
                    transition-colors duration-300 w-full 
                    ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {isLoading ? 'Logging in...' : 'Login'}
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