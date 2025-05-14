import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

interface LoginFormProps {
  role: string;
  buttonColorClass: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ role, buttonColorClass }) => {
  const [studentId, setStudentId] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [librarianId, setLibrarianId] = useState('');
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
        const response = await fetch(`http://localhost:5000/api/login/${role}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                student_id: role === 'student' ? studentId : undefined,
                faculty_id: role === 'faculty' ? facultyId : undefined,
                librarian_id: role === 'librarian' ? librarianId : undefined,
                admin_id: role === 'admin' ? adminId : undefined,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            login({
                user: data.user,
                token: data.token,
                role: data.role
            });

            switch (data.role) {
                case 'admin':
                    navigate('/admin/dashboard', { replace: true });
                    break;
                case 'librarian':
                case 'staff':
                    navigate('/librarian/dashboard', { replace: true });
                    break;
                default:
                    navigate('/user/dashboard', { replace: true });
            }
        } else {
            setError(data.message || 'Invalid credentials');
        }
    } catch (error) {
        console.error('Login error:', error);
        setError(error instanceof Error ? 
            error.message : 
            'Server connection failed. Please try again later.');
    } finally {
        setIsLoading(false);
    }
  };

  const getInputLabel = () => {
    switch (role) {
      case 'student':
        return 'Student ID';
      case 'faculty':
        return 'Faculty ID';
      case 'librarian':
        return 'Librarian ID';
      case 'admin':
        return 'Admin ID';
      default:
        return 'ID';
    }
  };

  const getInputValue = () => {
    switch (role) {
      case 'student':
        return studentId;
      case 'faculty':
        return facultyId;
      case 'librarian':
        return librarianId;
      case 'admin':
        return adminId;
      default:
        return '';
    }
  };

  const handleInputChange = (value: string) => {
    switch (role) {
      case 'student':
        setStudentId(value);
        break;
      case 'faculty':
        setFacultyId(value);
        break;
      case 'librarian':
        setLibrarianId(value);
        break;
      case 'admin':
        setAdminId(value);
        break;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-6 pb-6">
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
          {getInputLabel()}
        </label>
        <input
          type="text"
          id="userId"
          value={getInputValue()}
          onChange={(e) => handleInputChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      
      <div className="mb-6">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>
      
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full ${buttonColorClass} text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

export default LoginForm;