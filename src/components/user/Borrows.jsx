import React, { useState, useEffect } from 'react';
import { Search, Filter, BookOpen, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const UserBorrows = () => {
  const { currentUser } = useAuth();
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBorrows = async () => {
      const studentId = currentUser?.STUDENT_ID || currentUser?.id;
      if (!studentId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get('http://localhost:5000/api/borrows', {
          params: { studentId }
        });
        if (res.data.success) {
          // Map backend fields to frontend fields
          const mapped = res.data.borrows.map(b => ({
            id: b.BORROW_ID,
            bookId: b.BOOK_ID,
            borrowDate: b.BORROW_DATE,
            dueDate: b.DUE_DATE,
            returnDate: b.RETURN_DATE,
            status: b.STATUS?.toLowerCase(),
            // bookTitle, bookAuthor, bookCover: will be fetched below
          }));
          setBorrowings(mapped);
        } else {
          setError(res.data.message || 'Failed to fetch borrows');
        }
      } catch (e) {
        setError('Failed to fetch borrows');
      }
      setLoading(false);
    };
    fetchBorrows();
  }, [currentUser]);

  // Optionally, fetch book details here if needed (e.g., from /api/books)
  // For now, display only IDs if book info is not available.

  // Filter borrowings for the current user (already filtered by backend)
  const userBorrowings = borrowings.map(borrowing => ({
    ...borrowing,
    bookTitle: borrowing.bookTitle || `Book ID: ${borrowing.bookId}`,
    bookAuthor: borrowing.bookAuthor || '',
    bookCover: borrowing.bookCover || null,
  }));

  // Apply filters
  const filteredBorrowings = userBorrowings.filter(borrowing => {
    const matchesSearch = 
      borrowing.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      borrowing.bookAuthor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter ? borrowing.status === statusFilter : true;
    
    return matchesSearch && matchesStatus;
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
  
  // Function to get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'borrowed':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          icon: <Clock className="h-4 w-4 mr-1" />
        };
      case 'returned':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          icon: <CheckCircle className="h-4 w-4 mr-1" />
        };
      case 'overdue':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          icon: <AlertCircle className="h-4 w-4 mr-1" />
        };
      case 'pending':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          icon: <Clock className="h-4 w-4 mr-1 animate-pulse" />
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          icon: null
        };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-40 text-blue-600 font-semibold">Loading your borrows...</div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-40 text-red-600 font-semibold">{error}</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Borrowed Books</h1>
        <p className="text-gray-600">Track your current and past borrowings</p>
      </div>
      
      {/* Search and filter bar */}
      <div className="bg-white rounded-xl p-4 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by Book ID..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="borrowed">Currently Borrowed</option>
              <option value="returned">Returned</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          
          <div>
            <button className="w-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors">
              <Filter className="h-5 w-5 mr-2" />
              More Filters
            </button>
          </div>
        </div>
      </div>
      
      {/* Books list */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {filteredBorrowings.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredBorrowings.map(borrowing => {
              const daysStatus = calculateDaysStatus(borrowing.dueDate);
              const statusBadge = getStatusBadge(borrowing.status);
              
              return (
                <div key={borrowing.id} className="p-6 flex flex-col md:flex-row md:items-center md:justify-between hover:bg-gray-50">
                  <div className="flex items-start space-x-4">
                    <div className="h-16 w-12 flex-shrink-0">
                      {borrowing.bookCover ? (
                        <img className="h-16 w-12 rounded object-cover" src={borrowing.bookCover} alt={borrowing.bookTitle} />
                      ) : (
                        <div className="h-16 w-12 rounded bg-blue-100 flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-blue-600" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-md font-medium text-gray-900">{borrowing.bookTitle}</h3>
                      <p className="text-sm text-gray-500">by {borrowing.bookAuthor}</p>
                      <div className="flex items-center mt-2">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full items-center ${statusBadge.bg} ${statusBadge.text}`}>
                          {statusBadge.icon}
                          <span className="capitalize">{borrowing.status}</span>
                        </span>
                        <span className="mx-2 text-gray-300">•</span>
                        <span className="text-xs text-gray-500">
                          ID: {borrowing.id}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-0 md:text-right">
                    <div className="flex flex-col space-y-1">
                      <div className="text-sm text-gray-500">
                        Borrowed: <span className="font-medium">{formatDate(borrowing.borrowDate)}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Due: <span className="font-medium">{formatDate(borrowing.dueDate)}</span>
                      </div>
                      {borrowing.returnDate && (
                        <div className="text-sm text-gray-500">
                          Returned: <span className="font-medium">{formatDate(borrowing.returnDate)}</span>
                        </div>
                      )}
                      {!borrowing.returnDate && (
                        <div className={`text-sm font-medium ${daysStatus.color}`}>
                          {daysStatus.text}
                        </div>
                      )}
                    </div>
                    
                    {borrowing.status === 'borrowed' && (
                      <button className="mt-3 inline-flex items-center px-3 py-1 border border-blue-600 text-sm leading-5 font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:border-blue-700 focus:shadow-outline-blue transition ease-in-out duration-150">
                        Renew Borrowing
                      </button>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No borrow records found</h3>
          <p className="text-gray-500">You haven't borrowed any books yet, or no books match your filters.</p>
          <button 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  </div>
);
};

export default UserBorrows;