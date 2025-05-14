import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface PendingPickup {
  id: string;
  studentId: string;
  studentName: string;
  bookId: string;
  bookTitle: string;
  requestTime: string;
  pickupTime: string;
  status: 'pending' | 'verified' | 'expired' | 'cancelled';
  timeRemaining: number; // in minutes
}

const PendingPickupsList: React.FC = () => {
  const [pendingPickups, setPendingPickups] = useState<PendingPickup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPendingPickups = async () => {
      try {
        // TODO: Implement API call to fetch pending pickups
        // const response = await fetch('/api/librarian/pending-pickups');
        // const data = await response.json();
        // setPendingPickups(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching pending pickups:', error);
        setError('Failed to fetch pending pickups');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingPickups();
    const interval = setInterval(fetchPendingPickups, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const handleCancel = async (pickupId: string) => {
    try {
      // TODO: Implement API call to cancel pickup
      // await fetch(`/api/librarian/cancel-pickup/${pickupId}`, {
      //   method: 'POST',
      // });
      setPendingPickups(pendingPickups.filter(pickup => pickup.id !== pickupId));
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error('Error canceling pickup:', error);
      setError('Failed to cancel pickup');
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

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Pending Book Pickups</h2>
        
        {pendingPickups.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No pending pickups</p>
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
                    Request Time
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pickup Time
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Remaining
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 bg-gray-50"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingPickups.map((pickup) => (
                  <tr key={pickup.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{pickup.studentName}</div>
                        <div className="text-sm text-gray-500">{pickup.studentId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{pickup.bookTitle}</div>
                        <div className="text-sm text-gray-500">{pickup.bookId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(pickup.requestTime), 'PPp')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(pickup.pickupTime), 'PPp')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        pickup.timeRemaining > 15 ? 'bg-green-100 text-green-800' :
                        pickup.timeRemaining > 5 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {pickup.timeRemaining > 0 ? `${pickup.timeRemaining} min` : 'Expired'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        pickup.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                        pickup.status === 'verified' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {pickup.status.charAt(0).toUpperCase() + pickup.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {pickup.status === 'pending' && (
                        <button
                          onClick={() => handleCancel(pickup.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Cancel
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

export default PendingPickupsList; 