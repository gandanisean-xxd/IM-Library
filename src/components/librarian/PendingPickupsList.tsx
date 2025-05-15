import React from 'react';
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

}

interface PendingPickupsListProps {
  borrows: any[];
  loading: boolean;
  error: string | null;
  onApprove?: (id: string) => void;
  onDeny?: (id: string) => void;
}

const PendingPickupsList: React.FC<PendingPickupsListProps> = ({ borrows, loading, error, onApprove, onDeny }) => {
  // Map borrows to PendingPickup structure
  // Calculate time remaining in minutes until pickup expiry
  const calcTimeRemaining = (pickupTime: string) => {
    if (!pickupTime) return 0;
    const now = new Date();
    const pickup = new Date(pickupTime);
    const diffMs = pickup.getTime() + 30 * 60 * 1000 - now.getTime(); // 30 min window
    return Math.max(0, Math.ceil(diffMs / 60000));
  };

  const pendingPickups: PendingPickup[] = borrows
    .filter(borrow => borrow.STATUS && borrow.STATUS.toLowerCase() === 'pending')
    .map(borrow => ({
      id: borrow.BORROW_ID,
      studentId: borrow.STUDENT_ID,
      studentName: borrow.STUDENT_NAME || '',
      bookId: borrow.BOOK_ID,
      bookTitle: borrow.BOOK_TITLE || '',
      requestTime: borrow.BORROW_DATE,
      pickupTime: borrow.PICKUP_TIME || '',
      status: 'pending',

    }));

  // Remove handleAction and handleCancel. Use props for button actions.

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
                      {(() => {
                        const dt = new Date(pickup.pickupTime);
                        dt.setHours(8, 0, 0, 0);
                        return format(dt, 'PPp');
                      })()}
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
                        <div className="flex gap-2">
                          <button
                            onClick={() => onApprove && onApprove(pickup.id)}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => onDeny && onDeny(pickup.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Deny
                          </button>
                        </div>
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