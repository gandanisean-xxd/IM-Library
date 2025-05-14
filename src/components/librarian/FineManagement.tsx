import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface Fine {
  id: string;
  studentId: string;
  studentName: string;
  bookId: string;
  bookTitle: string;
  dueDate: string;
  returnDate: string;
  daysLate: number;
  amount: number;
  status: 'pending' | 'paid';
  paymentDate?: string;
}

const FineManagement: React.FC = () => {
  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'paid'>('all');

  useEffect(() => {
    const fetchFines = async () => {
      try {
        // TODO: Implement API call to fetch fines
        // const response = await fetch('/api/librarian/fines');
        // const data = await response.json();
        // setFines(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching fines:', error);
        setError('Failed to fetch fines');
      } finally {
        setLoading(false);
      }
    };

    fetchFines();
  }, []);

  const handleCollectFine = async (fineId: string) => {
    try {
      // TODO: Implement API call to collect fine
      // await fetch(`/api/librarian/collect-fine/${fineId}`, {
      //   method: 'POST',
      // });
      setFines(fines.map(fine => 
        fine.id === fineId 
          ? { ...fine, status: 'paid', paymentDate: new Date().toISOString() } 
          : fine
      ));
    } catch (error) {
      console.error('Error collecting fine:', error);
      setError('Failed to collect fine');
    }
  };

  const filteredFines = fines.filter(fine => {
    if (selectedFilter === 'all') return true;
    return fine.status === selectedFilter;
  });

  const totalPendingFines = fines
    .filter(fine => fine.status === 'pending')
    .reduce((sum, fine) => sum + fine.amount, 0);

  const totalCollectedFines = fines
    .filter(fine => fine.status === 'paid')
    .reduce((sum, fine) => sum + fine.amount, 0);

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

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900">Pending Fines</h3>
          <p className="mt-2 text-3xl font-bold text-red-600">₱{totalPendingFines.toFixed(2)}</p>
          <p className="mt-1 text-sm text-gray-500">
            {fines.filter(fine => fine.status === 'pending').length} pending payments
          </p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900">Collected Fines</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">₱{totalCollectedFines.toFixed(2)}</p>
          <p className="mt-1 text-sm text-gray-500">
            {fines.filter(fine => fine.status === 'paid').length} payments collected
          </p>
        </div>
      </div>

      {/* Fines List */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Fine Records</h2>
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value as 'all' | 'pending' | 'paid')}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All Records</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        {filteredFines.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No fine records found</p>
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
                    Due Date
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Return Date
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days Late
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
                {filteredFines.map((fine) => (
                  <tr key={fine.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{fine.studentName}</div>
                        <div className="text-sm text-gray-500">{fine.studentId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{fine.bookTitle}</div>
                        <div className="text-sm text-gray-500">{fine.bookId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(fine.dueDate), 'PP')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(fine.returnDate), 'PP')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                        {fine.daysLate} days
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                      ₱{fine.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        fine.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {fine.status.charAt(0).toUpperCase() + fine.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {fine.status === 'pending' && (
                        <button
                          onClick={() => handleCollectFine(fine.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Collect Fine
                        </button>
                      )}
                      {fine.status === 'paid' && fine.paymentDate && (
                        <span className="text-sm text-gray-500">
                          Paid on {format(new Date(fine.paymentDate), 'PP')}
                        </span>
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

export default FineManagement; 