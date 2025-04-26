import React, { useState } from 'react';
import { Search, Filter, Calendar, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { borrowings, books, users } from '../../mockData';

const BorrowingsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Merge borrowing data with book and user information
  const borrowingsWithDetails = borrowings.map(borrowing => {
    const book = books.find(b => b.id === borrowing.bookId);
    const user = users.find(u => u.id === borrowing.userId);
    
    return {
      ...borrowing,
      bookTitle: book ? book.name : 'Unknown Book',
      bookAuthor: book ? book.author : 'Unknown Author',
      bookCover: book ? book.cover : null,
      userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown User',
      userRole: user ? user.role : 'unknown',
    };
  });
  
  // Filter borrowings based on search and status
  const filteredBorrowings = borrowingsWithDetails.filter(borrowing => {
    const matchesSearch = 
      borrowing.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      borrowing.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      borrowing.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter ? borrowing.status === statusFilter : true;
    
    return matchesSearch && matchesStatus;
  });
  
  // Function to format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Function to get status badge style
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
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          icon: null
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Borrowing Records</h1>
          <p className="text-gray-600">Track and manage book borrowings and returns</p>
        </div>
        
        <div className="flex gap-2">
          <button className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200">
            <Calendar className="h-5 w-5 mr-2" />
            Check Out Book
          </button>
        </div>
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
              placeholder="Search by book title, user, or ID..."
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
              <option value="">All Statuses</option>
              <option value="borrowed">Borrowed</option>
              <option value="returned">Returned</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <button className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors">
              <Filter className="h-5 w-5 inline-block mr-2" />
              More Filters
            </button>
            <button className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-4 rounded-lg transition-colors">
              Export
            </button>
          </div>
        </div>
      </div>
      
      {/* Borrowings list table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Book Details
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Borrower
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Borrow Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Return Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBorrowings.map(borrowing => {
                const statusBadge = getStatusBadge(borrowing.status);
                
                return (
                  <tr key={borrowing.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {borrowing.bookCover ? (
                            <img className="h-10 w-10 rounded object-cover" src={borrowing.bookCover} alt={borrowing.bookTitle} />
                          ) : (
                            <div className="h-10 w-10 rounded bg-blue-100 flex items-center justify-center">
                              <BookOpen className="h-6 w-6 text-blue-600" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{borrowing.bookTitle}</div>
                          <div className="text-sm text-gray-500">by {borrowing.bookAuthor}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{borrowing.userName}</div>
                      <div className="text-xs text-gray-500 capitalize">{borrowing.userRole}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(borrowing.borrowDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(borrowing.dueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {borrowing.returnDate ? formatDate(borrowing.returnDate) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full items-center ${statusBadge.bg} ${statusBadge.text}`}>
                        {statusBadge.icon}
                        <span className="capitalize">{borrowing.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {borrowing.status === 'borrowed' && (
                        <button className="text-emerald-600 hover:text-emerald-900 font-medium">
                          Return
                        </button>
                      )}
                      {borrowing.status === 'overdue' && (
                        <button className="text-red-600 hover:text-red-900 font-medium">
                          Process Return
                        </button>
                      )}
                      {borrowing.status === 'returned' && (
                        <button className="text-gray-600 hover:text-gray-900 font-medium">
                          View Details
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Previous
            </button>
            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredBorrowings.length}</span> of{' '}
                <span className="font-medium">{filteredBorrowings.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  1
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BorrowingsList;