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

const mockReservations: Reservation[] = [
  {
    reservation_id: 1,
    student_id: "23-2319",
    student_firstname: "Sean",
    student_lastname: "Tagle",
    student_program: "BS Information Technology",
    reservation_date: "2025-05-17",
    time_slot: "10:00 AM - 11:00 AM",
    member_count: 5,
    member_names: "Mima, Mims, Mimi, Mimo, Mima",
    purpose: "Video Project Presentation",
    status: "pending",
    created_at: "2025-05-15 09:24:23.432000000"
  },
  {
    reservation_id: 2,
    student_id: "23-1234",
    student_firstname: "John",
    student_lastname: "Doe",
    student_program: "BS Computer Science",
    reservation_date: "2025-05-18",
    time_slot: "2:00 PM - 3:00 PM",
    member_count: 6,
    member_names: "John, Jane, Jack, Jill, Jim, Joe",
    purpose: "Group Study Session",
    status: "approved",
    created_at: "2025-05-15 10:15:00.000000000"
  },
  {
    reservation_id: 3,
    student_id: "23-5678",
    student_firstname: "Mary",
    student_lastname: "Smith",
    student_program: "BS Information Systems",
    reservation_date: "2025-05-19",
    time_slot: "3:00 PM - 4:00 PM",
    member_count: 5,
    member_names: "Mary, Mark, Mike, Marge, Molly",
    purpose: "Team Meeting",
    status: "rejected",
    created_at: "2025-05-15 11:30:00.000000000"
  }
];

const RoomReservations: React.FC = () => {
  const [reservations] = useState<Reservation[]>(mockReservations);
  const [loading] = useState(false);

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

      toast.success(`Reservation ${newStatus} successfully`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update reservation status');
    }
  };  // Removed fetchReservations and useEffect since we're using mock data

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-6 max-w-[2000px] mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold mb-2">Room Reservations</h1>
          <div className="flex gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Approved</span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Rejected</span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Cancelled</span>
          </div>        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="overflow-x-auto">            
            <table className="w-full min-w-max">
              <thead className="bg-gray-50/50 border-b border-gray-200">
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
