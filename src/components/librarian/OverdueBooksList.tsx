import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface OverdueBook {
  id: string;
  studentId: string;
  studentName: string;
  bookId: string;
  bookTitle: string;
  borrowDate: string;
  dueDate: string;
  daysOverdue: number;
  fineAmount: number;
  status: 'overdue' | 'returned' | 'pending_payment';
}

const OverdueBooksList: React.FC = () => {
  const [overdueBooks, setOverdueBooks] = useState<OverdueBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOverdueBooks = async () => {
      try {
        // TODO: Implement API call to fetch overdue books
        // const response = await fetch('/api/librarian/overdue-books');
        // const data = await response.json();
        // setOverdueBooks(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching overdue books:', error);
        setError('Failed to fetch overdue books');
      } finally {
        setLoading(false);
      }
    };

    fetchOverdueBooks();
    const interval = setInterval(fetchOverdueBooks, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const handleMarkReturned = async (bookId: string) => {
    try {
      // TODO: Implement API call to mark book as returned
      // await fetch(`/api/librarian/mark-returned/${bookId}`, {
      //   method: 'POST',
      // });
      setOverdueBooks(overdueBooks.map(book => 
        book.id === bookId ? { ...book, status: 'pending_payment' as const } : book
      ));
    } catch (error) {
      console.error('Error marking book as returned:', error);
      setError('Failed to mark book as returned');
    }
  };

  const handleCollectFine = async (bookId: string) => {
    try {
      // TODO: Implement API call to collect fine
      // await fetch(`/api/librarian/collect-fine/${bookId}`, {
      //   method: 'POST',
      // });
      setOverdueBooks(overdueBooks.map(book => 
        book.id === bookId ? { ...book, status: 'returned' as const } : book
      ));
    } catch (error) {
      console.error('Error collecting fine:', error);
      setError('Failed to collect fine');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-md">
        {error}
      </div>
    );
  }

  const totalFines = overdueBooks.reduce((sum, book) => sum + book.fineAmount, 0);

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Overdue Books</h2>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Pending Fines</p>
            <p className="text-2xl font-bold text-red-600">₱{totalFines.toFixed(2)}</p>
          </div>
        </div>
        
        {overdueBooks.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No overdue books</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Book
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Borrow Date
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days Overdue
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fine Amount
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 bg-gray-50"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {overdueBooks.map((book) => (
                  <tr key={book.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{book.studentName}</div>
                        <div className="text-sm text-gray-500">{book.studentId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{book.bookTitle}</div>
                        <div className="text-sm text-gray-500">{book.bookId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(book.borrowDate), 'PP')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(book.dueDate), 'PP')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                        {book.daysOverdue} days
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                      ₱{book.fineAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        book.status === 'overdue' ? 'bg-red-100 text-red-800' :
                        book.status === 'pending_payment' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {book.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {book.status === 'overdue' && (
                        <button
                          onClick={() => handleMarkReturned(book.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Mark Returned
                        </button>
                      )}
                      {book.status === 'pending_payment' && (
                        <button
                          onClick={() => handleCollectFine(book.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Collect Fine
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OverdueBooksList; 