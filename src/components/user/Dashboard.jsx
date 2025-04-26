import React from 'react';
import { BookOpen, BookMarked, AlertCircle, Clock } from 'lucide-react';
import { books, borrowings } from '../../mockData';
import { useAuth } from '../../context/AuthContext';

const UserDashboard = () => {
  const { currentUser } = useAuth();
  
  // Filter borrowings for the current user
  const userBorrowings = borrowings.filter(borrowing => borrowing.userId === currentUser?.id);
  
  // Count by status
  const borrowed = userBorrowings.filter(b => b.status === 'borrowed').length;
  const returned = userBorrowings.filter(b => b.status === 'returned').length;
  const overdue = userBorrowings.filter(b => b.status === 'overdue').length;
  
  // Get current date for the greeting
  const currentHour = new Date().getHours();
  let greeting;
  if (currentHour < 12) greeting = 'Good morning';
  else if (currentHour < 18) greeting = 'Good afternoon';
  else greeting = 'Good evening';
  
  // Get recent borrowings with book details
  const recentBorrowings = userBorrowings
    .sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate))
    .slice(0, 3)
    .map(borrowing => {
      const book = books.find(b => b.id === borrowing.bookId);
      return {
        ...borrowing,
        bookTitle: book ? book.name : 'Unknown Book',
        bookAuthor: book ? book.author : 'Unknown Author',
        bookCover: book ? book.cover : null,
      };
    });
  
  // Format date function
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Calculate days remaining or overdue
  const calculateDaysStatus = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return {
        days: Math.abs(diffDays),
        status: 'overdue',
        text: `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} overdue`,
        color: 'text-red-600'
      };
    } else if (diffDays === 0) {
      return {
        days: 0,
        status: 'due-today',
        text: 'Due today',
        color: 'text-amber-600'
      };
    } else {
      return {
        days: diffDays,
        status: 'upcoming',
        text: `${diffDays} day${diffDays !== 1 ? 's' : ''} remaining`,
        color: 'text-green-600'
      };
    }
  };

  return (
    <div className="space-y-6">
      {/* Greeting section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">{greeting}, {currentUser?.firstName}!</h1>
        <p className="opacity-90">Welcome to your library dashboard</p>
      </div>
      
      {/* Statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Current Borrows</h3>
            <div className="bg-blue-100 p-3 rounded-full">
              <BookMarked className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{borrowed}</p>
          <p className="text-sm text-gray-500 mt-2">Books currently in your possession</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Returned</h3>
            <div className="bg-green-100 p-3 rounded-full">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{returned}</p>
          <p className="text-sm text-gray-500 mt-2">Books you've returned</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Overdue</h3>
            <div className="bg-red-100 p-3 rounded-full">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{overdue}</p>
          <p className="text-sm text-gray-500 mt-2">Books past their due date</p>
        </div>
      </div>
      
      {/* Recent Borrowings */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Recent Borrowings</h3>
        </div>
        
        {recentBorrowings.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {recentBorrowings.map(borrowing => {
              const daysStatus = calculateDaysStatus(borrowing.dueDate);
              
              return (
                <div key={borrowing.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className="h-12 w-12 flex-shrink-0">
                      {borrowing.bookCover ? (
                        <img className="h-12 w-12 rounded object-cover" src={borrowing.bookCover} alt={borrowing.bookTitle} />
                      ) : (
                        <div className="h-12 w-12 rounded bg-blue-100 flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-blue-600" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{borrowing.bookTitle}</div>
                      <div className="text-xs text-gray-500">by {borrowing.bookAuthor}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Borrowed: {formatDate(borrowing.borrowDate)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      Due: {formatDate(borrowing.dueDate)}
                    </div>
                    {borrowing.status !== 'returned' && (
                      <div className={`text-xs font-medium ${daysStatus.color}`}>
                        {daysStatus.text}
                      </div>
                    )}
                    {borrowing.status === 'returned' && (
                      <div className="text-xs font-medium text-green-600">
                        Returned on {formatDate(borrowing.returnDate)}
                      </div>
                    )}
                    
                    {borrowing.status === 'borrowed' && (
                      <button className="text-sm text-blue-600 hover:text-blue-800 mt-1">
                        Renew
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No borrowing history</h3>
            <p className="text-gray-500">You haven't borrowed any books yet.</p>
            <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
              Browse Books
            </button>
          </div>
        )}
        
        {recentBorrowings.length > 0 && (
          <div className="bg-gray-50 px-6 py-3 flex justify-end">
            <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
              View All Borrowings →
            </button>
          </div>
        )}
      </div>
      
      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recommended Books */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recommended For You</h3>
          <div className="space-y-4">
            {books.slice(0, 3).map(book => (
              <div key={book.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-12 h-16 flex-shrink-0">
                  {book.cover ? (
                    <img src={book.cover} alt={book.name} className="w-full h-full object-cover rounded" />
                  ) : (
                    <div className="w-full h-full bg-blue-100 flex items-center justify-center rounded">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{book.name}</p>
                  <p className="text-xs text-gray-500">by {book.author}</p>
                  <p className="text-xs text-gray-500 mt-1">{book.available} available</p>
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-800 whitespace-nowrap">
                  View
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
              Browse More Books
            </button>
          </div>
        </div>
        
        {/* Announcements */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Library Announcements</h3>
          <div className="space-y-4">
            <div className="p-3 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg">
              <h4 className="text-sm font-semibold text-gray-900">New Books Available</h4>
              <p className="text-xs text-gray-600 mt-1">We've added 50 new titles to our computer science collection!</p>
              <p className="text-xs text-gray-500 mt-2">2 days ago</p>
            </div>
            <div className="p-3 border-l-4 border-amber-500 bg-amber-50 rounded-r-lg">
              <h4 className="text-sm font-semibold text-gray-900">Holiday Hours</h4>
              <p className="text-xs text-gray-600 mt-1">The library will have modified hours during the upcoming holiday break.</p>
              <p className="text-xs text-gray-500 mt-2">5 days ago</p>
            </div>
            <div className="p-3 border-l-4 border-emerald-500 bg-emerald-50 rounded-r-lg">
              <h4 className="text-sm font-semibold text-gray-900">Research Workshop</h4>
              <p className="text-xs text-gray-600 mt-1">Join us for a free workshop on research methodologies this Friday.</p>
              <p className="text-xs text-gray-500 mt-2">1 week ago</p>
            </div>
          </div>
          <div className="mt-4 text-center">
            <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
              View All Announcements
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;