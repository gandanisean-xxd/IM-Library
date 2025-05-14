// updated signup form

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { departments, programs } from '../../types';

interface SignupFormProps {
  role: string;
  buttonColorClass: string;
}

const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const SignupForm: React.FC<SignupFormProps> = ({ role, buttonColorClass }) => {
  // Block admin sign-up entirely
  if (role === 'admin') {
    return (
      <div className="text-center text-red-600 font-semibold p-8">
        Admin sign-up is not allowed. Please contact your system administrator if you need admin access.
      </div>
    );
  }
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    facultyId: '',
    librarianId: '',
    program: '',
    department: '',
    expectedYearOfGraduate: '',
    status: 'active',
    student_campus: '',
    librarian_category: '',
    librarian_campus: '',
  });
  
  const [passwordValidation, setPasswordValidation] = useState({
  hasLength: false,
  hasUpperCase: false,
  hasLowerCase: false,
  hasNumber: false,
  hasSpecial: false
 });

 const [isEmailVerified, setIsEmailVerified] = useState(false);
const [otp, setOtp] = useState('');
const [showOtpInput, setShowOtpInput] = useState(false);
const [sentEmail, setSentEmail] = useState('');

  const [error, setError] = useState('');
  
  const calculateExpectedYearOfGraduate = (studentId: string, program: string): string => {
    if (!studentId || studentId.length < 2) return '';
    const yearPrefix = studentId.substring(0, 2);
    const enrollmentYear = parseInt('20' + yearPrefix, 10);
    if (isNaN(enrollmentYear)) return '';
    const duration = program === 'Bachelor of Science in Entrepreneurship' ? 3 : 4;
    return (enrollmentYear + duration).toString();
  };

  const sendOTP = async (email: string) => {
  try {
    const response = await fetch('http://localhost:5000/api/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    });

    const data = await response.json();
    
    if (response.ok) {
      setShowOtpInput(true);
      setSentEmail(email);
      setError('');
      alert('OTP has been sent to your email');
    } else {
      setError(data.message || 'Failed to send OTP');
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    setError('Failed to send OTP. Please try again.');
  }
};

const verifyOTP = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email: sentEmail,
        otp: otp 
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      setIsEmailVerified(true);
      setShowOtpInput(false);
      setError('');
      alert('Email verified successfully!');
    } else {
      setError(data.message || 'Invalid OTP');
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    setError('Failed to verify OTP. Please try again.');
  }
};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value } = e.target;
  setFormData(prev => {
    const updatedFormData = { ...prev, [name]: value };
    
    // Check password requirements in real-time
    if (name === 'password') {
      setPasswordValidation({
        hasLength: value.length >= 8,
        hasUpperCase: /[A-Z]/.test(value),
        hasLowerCase: /[a-z]/.test(value),
        hasNumber: /[0-9]/.test(value),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(value)
      });
      
      const { errors } = validatePassword(value);
      setError(errors.join('\n'));
    }
    
    // Clear error when password confirmation matches
    if (name === 'confirmPassword' && value === formData.password) {
      setError('');
    }
    
    if (name === 'studentId' || name === 'program') {
      updatedFormData.expectedYearOfGraduate = calculateExpectedYearOfGraduate(
        updatedFormData.studentId, 
        updatedFormData.program
      );
    }
    return updatedFormData;
  });
};
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isEmailVerified) {
    setError('Please verify your email first');
    return;
  }

    const { isValid, errors } = validatePassword(formData.password);
    if (!isValid) {
    setError(errors.join('\n'));
    return;
  }
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }    

    if (formData.firstName.length > 50 || formData.lastName.length > 50) {
      setError('First name and last name must not exceed 50 characters');
      return;
    }
  
    if (formData.email.length > 255) {
      setError('Email must not exceed 255 characters');
      return;
    }

    if (role === 'student') {
      if (!formData.studentId || !formData.program || !formData.expectedYearOfGraduate || !formData.student_campus) {
        setError('Please fill in all required fields');
        return;
      }

      if (formData.studentId.length > 50) {
        setError('Student ID must not exceed 50 characters');
        return;
      }
      if (formData.program.length > 100) {
        setError('Program must not exceed 100 characters');
        return;
      }
      
      const studentData = {
        student_id: formData.studentId, // Changed to string since VARCHAR2 in DB
        student_lastname: formData.lastName,
        student_firstname: formData.firstName,
        student_program: formData.program,
        student_campus: formData.student_campus,
        expected_graduateyear: parseInt(formData.expectedYearOfGraduate),
        status: formData.status,
        email: formData.email,
        password: formData.password
      };
  
      try {
        console.log('Sending student data:', studentData);
        
        const response = await fetch('http://localhost:5000/api/register/student', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(studentData)
        });
  
        const responseData = await response.json();
        console.log('Server response:', responseData);
  
        if (response.ok) {
          alert('Registration successful! Please login to continue.');
          navigate('/');
        } else {
          setError(responseData.message || 'Registration failed');
        }
      } catch (error) {
        console.error('Registration error:', error);
        setError('Server connection failed. Please try again later.');
      }
    } else if (role === 'faculty') {
      if (!formData.facultyId || !formData.department) {
        setError('Please fill in all required fields');
        return;
      }

      if (formData.facultyId.length > 50) {
        setError('Faculty ID must not exceed 50 characters');
        return;
      }
      if (formData.department.length > 100) {
        setError('Department must not exceed 100 characters');
        return;
      }
      
      const facultyData = {
        faculty_id: formData.facultyId, // Changed to string since VARCHAR2 in DB
        faculty_lastname: formData.lastName,
        faculty_firstname: formData.firstName,
        college_department: formData.department,
        status: 'active',
        email: formData.email,
        password: formData.password
      };
  
      try {
        console.log('Sending faculty data:', facultyData);
        
        const response = await fetch('http://localhost:5000/api/register/faculty', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(facultyData)
        });
  
        const responseData = await response.json();
        console.log('Server response:', responseData);
  
        if (response.ok) {
          alert('Registration successful! Please login to continue.');
          navigate('/login');
        } else {
          setError(responseData.message || 'Registration failed');
        }
      } catch (error) {
        console.error('Registration error:', error);
        setError('Server connection failed. Please try again later.');
      }
    } else if (role === 'librarian') {
      if (!formData.librarianId || !formData.librarian_category || !formData.librarian_campus) {
        setError('Please fill in all required fields');
        return;
      }

      if (formData.librarianId.length > 50) {
        setError('Librarian ID must not exceed 50 characters');
        return;
      }

      const librarianData = {
        librarian_id: formData.librarianId,
        librarian_lastname: formData.lastName,
        librarian_firstname: formData.firstName,
        email: formData.email,
        password: formData.password,
        librarian_category: formData.librarian_category,
        librarian_campus: formData.librarian_campus,
        status: formData.status
      };

      try {
        console.log('Sending librarian data:', librarianData);
        
        const response = await fetch('http://localhost:5000/api/register/librarian', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(librarianData)
        });

        const responseData = await response.json();
        console.log('Server response:', responseData);

        if (response.ok) {
          alert('Registration successful! Please login to continue.');
          navigate('/auth/librarian');
        } else {
          setError(responseData.message || 'Registration failed');
        }
      } catch (error) {
        console.error('Registration error:', error);
        setError('Server connection failed. Please try again later.');
      }
    }
  };
  
  // Add librarian categories and campuses
  const librarianCategories = [
    'Student Staff',
    'Staff'
  ];

  const campuses = [
    'San Bartolome Campus',
    'Batasan Campus',
    'San Francisco Campus'
  ];

  return (
    <form onSubmit={handleSubmit} className="px-6 pb-6">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="firstName" className="block text-gray-700 font-medium mb-2">
            First Name
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </div>
        
        <div>
          <label htmlFor="lastName" className="block text-gray-700 font-medium mb-2">
            Last Name
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      
      {role === 'student' && (
        <>
          <div className="mb-4">
            <label htmlFor="studentId" className="block text-gray-700 font-medium mb-2">
              Student ID
            </label>
            <input
              id="studentId"
              name="studentId"
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.studentId}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="student_campus" className="block text-gray-700 font-medium mb-2">
              Campus
            </label>
            <select
              id="student_campus"
              name="student_campus"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.student_campus}
              onChange={handleChange}
              required
              >
              <option value="">Select a campus</option>
              <option value="San Bartolome Campus">San Bartolome Campus</option>
              <option value="Batasan Campus">Batasan Campus</option>
              <option value="San Francisco Campus">San Francisco Campus</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="program" className="block text-gray-700 font-medium mb-2">
              Program
            </label>
            <select
              id="program"
              name="program"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.program}
              onChange={handleChange}
              required
            >
              <option value="">Select a program</option>
              {programs.map((program) => (
                <option key={program} value={program}>
                  {program}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label htmlFor="expectedYearOfGraduate" className="block text-gray-700 font-medium mb-2">
              Expected Year of Graduate
            </label>
            <input
              id="expectedYearOfGraduate"
              name="expectedYearOfGraduate"
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
              value={formData.expectedYearOfGraduate}
              disabled
            />
          </div>
        </>
      )}
      
      {role === 'faculty' && (
        <div className="mb-4">
          <label htmlFor="facultyId" className="block text-gray-700 font-medium mb-2">
            Faculty ID
          </label>
          <input
            id="facultyId"
            name="facultyId"
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.facultyId}
            onChange={handleChange}
            required
          />
        </div>
      )}
      
      {role === 'faculty' && (
        <div className="mb-4">
          <label htmlFor="department" className="block text-gray-700 font-medium mb-2">
            Department
          </label>
          <select
            id="department"
            name="department"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.department}
            onChange={handleChange}
            required
          >
            <option value="">Select a department</option>
            {departments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>
        </div>
      )}
      
      {role === 'librarian' && (
        <>
          <div className="mb-4">
            <label htmlFor="librarianId" className="block text-gray-700 font-medium mb-2">
              Librarian ID
            </label>
            <input
              id="librarianId"
              name="librarianId"
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.librarianId}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="librarian_category" className="block text-gray-700 font-medium mb-2">
              Category
            </label>
            <select
              id="librarian_category"
              name="librarian_category"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.librarian_category}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              {librarianCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="librarian_campus" className="block text-gray-700 font-medium mb-2">
              Campus
            </label>
            <select
              id="librarian_campus"
              name="librarian_campus"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.librarian_campus}
              onChange={handleChange}
              required
            >
              <option value="">Select a campus</option>
              {campuses.map((campus) => (
                <option key={campus} value={campus}>
                  {campus}
                </option>
              ))}
            </select>
          </div>
        </>
      )}
      
      <div className="mb-4">
        <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
          Email
        </label>
        <div className="flex gap-2">
          <input
            id="email"
            name="email"
            type="email"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isEmailVerified}
          />
          {!isEmailVerified && !showOtpInput && (
            <button
              type="button"
              onClick={() => sendOTP(formData.email)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              disabled={!formData.email}
            >
              Verify Email
            </button>
          )}
        </div>
      </div>

      {showOtpInput && (
        <div className="mb-4">
          <label htmlFor="otp" className="block text-gray-700 font-medium mb-2">
            Enter OTP
          </label>
          <div className="flex gap-2">
            <input
              id="otp"
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP sent to your email"
              required
            />
            <button
              type="button"
              onClick={verifyOTP}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Verify OTP
            </button>
          </div>
        </div>
      )}

      {isEmailVerified && (
        <div className="mb-4 p-2 bg-green-100 text-green-700 rounded-md">
          Email verified successfully!
        </div>
      )}
      
      <div className="mb-4">
        <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <div className="mt-1 text-sm">
          Password must contain at least:
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li className={`flex items-center ${passwordValidation.hasLength ? 'text-green-600' : 'text-gray-500'}`}>
              <span>{passwordValidation.hasLength ? '✓' : '•'}</span>
              <span className="ml-2">8 characters</span>
            </li>
            <li className={`flex items-center ${passwordValidation.hasUpperCase ? 'text-green-600' : 'text-gray-500'}`}>
              <span>{passwordValidation.hasUpperCase ? '✓' : '•'}</span>
              <span className="ml-2">One uppercase letter</span>
            </li>
            <li className={`flex items-center ${passwordValidation.hasLowerCase ? 'text-green-600' : 'text-gray-500'}`}>
              <span>{passwordValidation.hasLowerCase ? '✓' : '•'}</span>
              <span className="ml-2">One lowercase letter</span>
            </li>
            <li className={`flex items-center ${passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
              <span>{passwordValidation.hasNumber ? '✓' : '•'}</span>
              <span className="ml-2">One number</span>
            </li>
            <li className={`flex items-center ${passwordValidation.hasSpecial ? 'text-green-600' : 'text-gray-500'}`}>
              <span>{passwordValidation.hasSpecial ? '✓' : '•'}</span>
              <span className="ml-2">One special character (!@#$%^&*(),.?":{}|)</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mb-6">
        <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
      </div>

      <button
        type="submit"
        className={`${buttonColorClass} text-white font-semibold py-2 px-4 rounded-md transition-colors duration-300 w-full`}
        disabled={!isEmailVerified}
      >
        Sign Up
      </button>
    </form>
  );
};

export default SignupForm;