// updated signup form

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { departments, programs } from '../../types';

interface SignupFormProps {
  role: string;
  buttonColorClass: string;
}

const SignupForm: React.FC<SignupFormProps> = ({ role, buttonColorClass }) => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    facultyId: '',
    program: '',
    department: '',
    expectedYearOfGraduate: '',
    status: 'active',
    student_campus: '',
  });
  
  const [error, setError] = useState('');
  
  const calculateExpectedYearOfGraduate = (studentId: string, program: string): string => {
    if (!studentId || studentId.length < 2) return '';
    const yearPrefix = studentId.substring(0, 2);
    const enrollmentYear = parseInt('20' + yearPrefix, 10);
    if (isNaN(enrollmentYear)) return '';
    const duration = program === 'Bachelor of Science in Entrepreneurship' ? 3 : 4;
    return (enrollmentYear + duration).toString();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updatedFormData = { ...prev, [name]: value };
      if (name === 'studentId' || name === 'program') {
        updatedFormData.expectedYearOfGraduate = calculateExpectedYearOfGraduate(updatedFormData.studentId, updatedFormData.program);
      }
      return updatedFormData;
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
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
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
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
      
      <div className="mb-4">
        <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      
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
      >
        Sign Up
      </button>
    </form>
  );
};

export default SignupForm;