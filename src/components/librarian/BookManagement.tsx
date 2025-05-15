import React, { useEffect, useState } from 'react';
import { Tab } from '@headlessui/react';
import BorrowVerificationForm from './BorrowVerificationForm';
import PendingPickupsList from './PendingPickupsList';
import OverdueBooksList from './OverdueBooksList';
import FineManagement from './FineManagement';
import { BookOpen } from 'lucide-react';

interface ActivityItemProps {
  action: string;
  title: string;
  user: string;
}

interface BorrowRecord {
  BORROW_ID: string;
  STUDENT_ID: string;
  BOOK_ID: string;
  BORROW_DATE: string;
  DUE_DATE: string;
  PICKUP_TIME?: string;
  STATUS: string;
  // Optionally add more fields as needed
}

const ActivityItem: React.FC<ActivityItemProps> = ({ action, title, user }) => {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center space-x-4">
        <div className="bg-blue-50 rounded-full p-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{action}</p>
          <p className="text-sm text-gray-500">{title} by {user}</p>
        </div>
      </div>
    </div>
  );
};

// Utility to map borrow status to action
function getActionFromStatus(status: string): string {
  switch (status?.toLowerCase()) {
    case 'pending': return 'Borrow Requested';
    case 'borrowed': return 'Book Borrowed';
    case 'returned': return 'Book Returned';
    case 'overdue': return 'Overdue Notice';
    case 'cancelled': return 'Borrow Cancelled';
    default: return status;
  }
}


const BookManagement: React.FC = () => {
  const [borrows, setBorrows] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Approve handler: set status to 'BORROWED', remove from pending
  const handleApprove = async (borrowId: string) => {
    try {
      const response = await fetch(`/api/librarian/borrows/${borrowId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'BORROWED' })
      });
      if (!response.ok) throw new Error('Failed to update borrow status');
      setBorrows(prev => prev.map(b => b.BORROW_ID === borrowId ? { ...b, STATUS: 'BORROWED' } : b));
    } catch (err) {
      alert('Error: ' + (err as Error).message);
    }
  };

  // Deny handler: delete from list
  const handleDeny = async (borrowId: string) => {
    try {
      const response = await fetch(`/api/librarian/borrows/${borrowId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DENIED' })
      });
      if (!response.ok) throw new Error('Failed to update borrow status');
      setBorrows(prev => prev.filter(b => b.BORROW_ID !== borrowId));
    } catch (err) {
      alert('Error: ' + (err as Error).message);
    }
  };

  useEffect(() => {
    const fetchBorrows = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/librarian/borrows');
        if (!response.ok) throw new Error('Failed to fetch borrow records');
        const data = await response.json();
        setBorrows(data.borrows || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch borrow records');
      } finally {
        setLoading(false);
      }
    };
    fetchBorrows();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Book Management</h1>
      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-4">
          <Tab className={({ selected }) =>
            `w-full rounded-lg py-2.5 text-sm font-medium leading-5 ${selected ? 'bg-white shadow text-blue-700' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'}`
          }>Books Borrowed</Tab>
          <Tab className={({ selected }) =>
            `w-full rounded-lg py-2.5 text-sm font-medium leading-5 ${selected ? 'bg-white shadow text-blue-700' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'}`
          }>Pending Pickups</Tab>
          <Tab className={({ selected }) =>
            `w-full rounded-lg py-2.5 text-sm font-medium leading-5 ${selected ? 'bg-white shadow text-blue-700' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'}`
          }>Overdue Books</Tab>
          <Tab className={({ selected }) =>
            `w-full rounded-lg py-2.5 text-sm font-medium leading-5 ${selected ? 'bg-white shadow text-blue-700' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'}`
          }>Fine Management</Tab>
          <Tab className={({ selected }) =>
            `w-full rounded-lg py-2.5 text-sm font-medium leading-5 ${selected ? 'bg-white shadow text-blue-700' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'}`
          }>Returned Books</Tab>
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel>
            {/* Books Borrowed List */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Books Borrowed</h2>
              {loading ? (
                <div className="text-gray-500">Loading...</div>
              ) : error ? (
                <div className="text-red-500">{error}</div>
              ) : borrows.filter(b => b.STATUS && b.STATUS.toLowerCase() === 'borrowed').length === 0 ? (
                <div className="text-gray-500">No books currently borrowed.</div>
              ) : (
                <div className="space-y-4">
                  {borrows.filter(b => b.STATUS && b.STATUS.toLowerCase() === 'borrowed').map(borrow => (
                    <div key={borrow.BORROW_ID} className="p-4 border rounded-lg bg-blue-50 flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-semibold text-blue-700 text-lg mb-1">Book ID: {borrow.BOOK_ID}</div>
                        <div className="text-gray-700 text-sm">Borrowed by: <span className="font-medium">{borrow.STUDENT_ID}</span></div>
                        <div className="text-gray-700 text-sm">Borrow Date: {new Date(borrow.BORROW_DATE).toLocaleString()}</div>
                        <div className="text-gray-700 text-sm">Return Date: {borrow.DUE_DATE ? new Date(borrow.DUE_DATE).toLocaleString() : 'N/A'}</div>
                      </div>
                      <div className="mt-2 md:mt-0 md:ml-8">
                        <span className="inline-block px-3 py-1 rounded-full bg-blue-200 text-blue-900 text-xs font-bold">Status: {borrow.STATUS}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Tab.Panel>
          <Tab.Panel>
            <PendingPickupsList
              borrows={borrows}
              loading={loading}
              error={error}
              onApprove={handleApprove}
              onDeny={handleDeny}
            />
          </Tab.Panel>
          <Tab.Panel><OverdueBooksList /></Tab.Panel>
          <Tab.Panel><FineManagement /></Tab.Panel>
          <Tab.Panel>
            {/* Returned Books List */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Returned Books</h2>
              {loading ? (
                <div className="text-gray-500">Loading...</div>
              ) : error ? (
                <div className="text-red-500">{error}</div>
              ) : borrows.filter(b => b.STATUS.toLowerCase() === 'returned').length === 0 ? (
                <div className="text-gray-500">No returned books.</div>
              ) : (
                <div className="space-y-4">
                  {borrows.filter(b => b.STATUS.toLowerCase() === 'returned').map(borrow => (
                    <ActivityItem
                      key={borrow.BORROW_ID}
                      action={getActionFromStatus(borrow.STATUS)}
                      title={borrow.BOOK_ID}
                      user={borrow.STUDENT_ID}
                    />
                  ))}
                </div>
              )}
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default BookManagement;
