import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, UserPlus } from 'lucide-react';

const RoleSelection: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="text-blue-600 h-10 w-10 mr-2" />
            <h1 className="text-4xl font-bold text-gray-800">Library Management System</h1>
          </div>
          <p className="text-gray-600 text-xl">Please select your role to continue</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-center h-20 w-20 rounded-full bg-blue-100 text-blue-600 mx-auto mb-4">
                <Users size={36} />
              </div>
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Student</h2>
              <p className="text-gray-600 text-center">
                Access the library system as a student to borrow books and manage your account
              </p>
            </div>
            <div className="p-4 flex justify-center bg-gray-50">
              <Link 
                to="/auth/student" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md transition-colors duration-300"
              >
                Continue as Student
              </Link>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-center h-20 w-20 rounded-full bg-amber-100 text-amber-600 mx-auto mb-4">
                <UserPlus size={36} />
              </div>
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Faculty</h2>
              <p className="text-gray-600 text-center">
                Access the library system as a faculty member with extended borrowing privileges
              </p>
            </div>
            <div className="p-4 flex justify-center bg-gray-50">
              <Link 
                to="/auth/faculty" 
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-6 rounded-md transition-colors duration-300"
              >
                Continue as Faculty
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <p className="text-gray-600">Are you a librarian or administrator?</p>
          <Link 
            to="/auth/staff" 
            className="inline-block mt-2 text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-300"
          >
            Staff Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;