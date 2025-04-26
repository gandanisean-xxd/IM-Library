import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BookOpen, BookMarked, AlertCircle, Users } from 'lucide-react';
import { bookStatus, books, users, monthlyBorrowingStats, bookCategories } from '../../mockData';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  // Filter users based on roles
  const studentCount = users.filter(user => user.role === 'student').length;
  const facultyCount = users.filter(user => user.role === 'faculty').length;
  const librarianCount = users.filter(user => user.role === 'librarian').length;
  
  // Get current date for the greeting
  const currentHour = new Date().getHours();
  let greeting;
  if (currentHour < 12) greeting = 'Good morning';
  else if (currentHour < 18) greeting = 'Good afternoon';
  else greeting = 'Good evening';
  
  // Colors for the pie chart
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // Quick link handlers
  const handleAddBook = () => {
    navigate('/admin/books');
  };

  const handleRegisterUser = () => {
    navigate('/admin/students');
  };

  const handleProcessReturn = () => {
    navigate('/admin/borrowings');
  };

  const handleGenerateReport = () => {
    navigate('/admin/reports');
  };

  return (
    <div className="space-y-6">
      {/* Greeting section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">{greeting}, Admin</h1>
        <p className="opacity-90">Here's what's happening with your library today</p>
      </div>
      
      {/* Statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Total Books</h3>
            <div className="bg-blue-100 p-3 rounded-full">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{bookStatus.total}</p>
          <p className="text-sm text-gray-500 mt-2">From {books.length} unique titles</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Borrowed Books</h3>
            <div className="bg-amber-100 p-3 rounded-full">
              <BookMarked className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{bookStatus.borrowed}</p>
          <p className="text-sm text-gray-500 mt-2">{(bookStatus.borrowed / bookStatus.total * 100).toFixed(1)}% of total inventory</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Missing Books</h3>
            <div className="bg-red-100 p-3 rounded-full">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{bookStatus.missing}</p>
          <p className="text-sm text-gray-500 mt-2">{(bookStatus.missing / bookStatus.total * 100).toFixed(1)}% of total inventory</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
            <div className="bg-emerald-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{users.length}</p>
          <p className="text-sm text-gray-500 mt-2">
            {studentCount} students, {facultyCount} faculty, {librarianCount} staff
          </p>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Borrowing Chart */}
        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Monthly Borrowing Activity</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyBorrowingStats}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="borrowed" name="Books Borrowed" fill="#3b82f6" />
                <Bar dataKey="returned" name="Books Returned" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Book Categories Chart */}
        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Book Categories</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bookCategories}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="category"
                  label={({ category, count }) => `${category}: ${count}`}
                >
                  {bookCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name, props) => [`${value} books`, props.payload.category]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Quick Links */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Quick Links</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={handleProcessReturn}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Process Return
          </button>
          <button 
            onClick={handleGenerateReport}
            className="bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;