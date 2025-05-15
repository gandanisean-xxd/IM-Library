import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Reservation {
  reservation_id: number;
  student_id: string;
  student_firstname: string;
  student_lastname: string;  
  student_program: string;
  reservation_date: string;
  time_slot: string;
  member_count: number;
  member_names: string;
  purpose: string;
  status: string;
  created_at: string;
}

const RoomReservations: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const getStatusClass = (status: string): string => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateStr: string | undefined | null): string => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return String(dateStr);
    }
  };

  const formatDateTime = (dateTimeStr: string | undefined | null): string => {
    if (!dateTimeStr) return 'N/A';
    try {
      const date = new Date(dateTimeStr);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting datetime:', error);
      return String(dateTimeStr);
    }
  };  const handleStatusUpdate = async (reservationId: number, newStatus: 'approved' | 'rejected') => {
    try {
      const response = await fetch(`http://localhost:5000/api/librarian/room-reservations/${reservationId}/status`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update status');
      }

      setReservations(prevReservations =>
        prevReservations.map(reservation =>
          reservation.reservation_id === reservationId
            ? { ...reservation, status: newStatus }
            : reservation
        )
      );

      toast.success(`Reservation ${newStatus} successfully`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update reservation status');
    }
  };  const fetchReservations = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/librarian/room-reservations', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response not ok:', errorText);
        throw new Error('Failed to fetch reservations');
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Invalid content type:', contentType, 'Response:', text);
        throw new Error('Invalid response format');
      }      const data = await response.json();
      console.log('Received data:', data); // Debug log

      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response data');
      }

      const reservationsData = Array.isArray(data) ? data : (data.reservations || []);
      if (!Array.isArray(reservationsData)) {
        throw new Error('Invalid reservations data format');
      }

      setReservations(reservationsData);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast.error('Failed to load reservations. Please check console for details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
    // Set up polling every 30 seconds for real-time updates
    const pollingInterval = setInterval(fetchReservations, 30000);

    // Cleanup the interval when component unmounts
    return () => clearInterval(pollingInterval);
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-[2000px] mx-auto space-y-6">
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div>
          <h1 className="text-2xl font-bold mb-2">Room Reservations</h1>
          <div className="flex gap-2">
            <span className="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">Pending</span>
            <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">Approved</span>
            <span className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-800">Rejected</span>
            <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">Cancelled</span>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="overflow-x-auto">            
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Student ID</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Student Name</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Program</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Date</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Time Slot</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Members</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Member Names</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Purpose</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Created</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Status</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Actions</th>
                </tr>
              </thead>              
              <tbody className="divide-y divide-gray-200">
                {reservations.map(reservation => (
                  <tr key={reservation.reservation_id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 whitespace-nowrap">{reservation.student_id}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {reservation.student_firstname} {reservation.student_lastname}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">{reservation.student_program}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{formatDate(reservation.reservation_date)}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{reservation.time_slot}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{reservation.member_count}</td>
                    <td className="py-3 px-4">
                      <div className="max-w-[200px] truncate" title={reservation.member_names}>
                        {reservation.member_names}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="max-w-[200px] truncate" title={reservation.purpose}>
                        {reservation.purpose}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">{formatDateTime(reservation.created_at)}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(reservation.status)}`}>
                        {reservation.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {reservation.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStatusUpdate(reservation.reservation_id, 'approved')}
                            className="px-3 py-1 text-xs font-medium text-white bg-green-500 rounded-full hover:bg-green-600 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(reservation.reservation_id, 'rejected')}
                            className="px-3 py-1 text-xs font-medium text-white bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomReservations;
