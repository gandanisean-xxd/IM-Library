import React, { useState } from 'react';

import axios from 'axios';

const BorrowFormModal = ({ open, book, user, onClose, onSuccess }) => {
  const [borrowDate, setBorrowDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [returnDate, setReturnDate] = useState('');
  const [pickupTime, setPickupTime] = useState(''); // new state for pickup time
  const [maxReturnDate, setMaxReturnDate] = useState(() => {
    if (user && user.role === 'student') {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      return d.toISOString().slice(0, 10);
    }
    return '';
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  if (!open) return null;
  if (!book) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <div className="text-red-600 font-bold">No book selected</div>
        <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-700" onClick={onClose} aria-label="Close"><span className="text-xl">&times;</span></button>
      </div>
    </div>
  );
  if (!user) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <div className="text-red-600 font-bold">No user context</div>
        <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-700" onClick={onClose} aria-label="Close"><span className="text-xl">&times;</span></button>
      </div>
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback('');
    // Prevent submission if return date is more than 7 days after borrow date
    // Prevent submission if any selected date is Sunday
    const todayStr = new Date().toISOString().slice(0, 10);
    const borrowDay = new Date(borrowDate).getDay();
    const returnDay = returnDate ? new Date(returnDate).getDay() : null;
    const pickupDay = pickupTime ? new Date(pickupTime).getDay() : null;
    if (borrowDate < todayStr) {
      setFeedback('Borrow date cannot be in the past.');
      setSubmitting(false);
      return;
    }
    if (pickupTime) {
      const pickupDateObj = new Date(pickupTime);
      const pickupHour = pickupDateObj.getHours();
      const pickupDateStr = pickupTime.split('T')[0];
      if (pickupDateStr !== borrowDate) {
        setFeedback('Pickup date must be the same as borrow date.');
        setSubmitting(false);
        return;
      }
      if (pickupDateObj.toISOString().slice(0, 10) < todayStr) {
        setFeedback('Pickup date cannot be in the past.');
        setSubmitting(false);
        return;
      }
      if (pickupHour < 8 || pickupHour > 17 || (pickupHour === 17 && pickupDateObj.getMinutes() > 0)) {
        setFeedback('Pickup time must be between 8:00 AM and 5:00 PM.');
        setSubmitting(false);
        return;
      }
    }
    if (borrowDay === 0 || returnDay === 0 || pickupDay === 0) {
      setFeedback('Dates cannot fall on a Sunday. Please select a different day.');
      setSubmitting(false);
      return;
    }
    if (user && user.role === 'student' && returnDate) {
      const borrow = new Date(borrowDate);
      const ret = new Date(returnDate);
      const diff = (ret - borrow) / (1000 * 60 * 60 * 24);
      if (diff > 7) {
        setFeedback('Return date cannot be more than one week after borrow date.');
        setSubmitting(false);
        return;
      }
    }
    try {
      // Compute pickupExpiry as 30 minutes after pickupTime
      let pickupExpiry = '';
      if (pickupTime) {
        const pickupDateObj = new Date(pickupTime);
        const expiryDateObj = new Date(pickupDateObj.getTime() + 30 * 60000); // add 30 minutes
        pickupExpiry = expiryDateObj.toISOString();
      }
      const payload = {
        studentId: user.STUDENT_ID || user.FACULTY_ID || '',
        bookId: book.id,
        borrowDate,
        returnDate,
        pickupTime: pickupTime ? new Date(pickupTime).toISOString() : '',
        pickupExpiry,
      };
      const res = await axios.post('/api/borrow', payload);
      setFeedback('Book borrowed successfully!');
      setTimeout(() => {
        setFeedback('');
        setSubmitting(false);
        if (onSuccess) onSuccess();
        onClose();
      }, 1200);
    } catch (err) {
      setSubmitting(false);
      if (err.response && err.response.data && err.response.data.message) {
        setFeedback(err.response.data.message);
      } else {
        setFeedback('Failed to borrow book. Please try again.');
      }
    }
  };



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
          aria-label="Close"
        >
          <span className="text-xl">&times;</span>
        </button>
        <h2 className="text-xl font-bold mb-4 text-blue-700">Borrow Request</h2>
        {feedback && (
          <div className={`mb-2 text-center ${feedback.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{feedback}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Book</label>
            <div className="mt-1 text-gray-900 font-semibold">{book.name}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Borrower ID</label>
            <input type="text" value={user.STUDENT_ID || user.FACULTY_ID || ''} disabled className="mt-1 block w-full rounded border-gray-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input type="text" value={user.STUDENT_FIRSTNAME ? `${user.STUDENT_FIRSTNAME} ${user.STUDENT_LASTNAME}` : `${user.FACULTY_FIRSTNAME} ${user.FACULTY_LASTNAME}`} disabled className="mt-1 block w-full rounded border-gray-300" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Pickup Date</label>
            <input type="date" value={pickupTime ? pickupTime.split('T')[0] : ''} min={new Date().toISOString().slice(0, 10)} onChange={e => {
              const date = e.target.value;
              const d = new Date(date);
              if (d.getDay() === 0) {
                e.target.setCustomValidity('Sundays are not allowed.');
                return;
              } else {
                e.target.setCustomValidity('');
              }
              // Default to 08:00 if no time set
              setPickupTime(`${date}T${pickupTime ? pickupTime.split('T')[1] : '08:00'}`);
              setBorrowDate(date); // Sync borrow date
            }} required className="mt-1 block w-full rounded border-gray-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Pickup Time</label>
            <select value={pickupTime ? pickupTime.split('T')[1] : '08:00'} onChange={e => {
              const date = pickupTime ? pickupTime.split('T')[0] : new Date().toISOString().slice(0, 10);
              setPickupTime(`${date}T${e.target.value}`);
            }} required className="mt-1 block w-full rounded border-gray-300">
              {Array.from({length: 18}, (_, i) => {
                const hour = 8 + Math.floor(i / 2);
                const minute = i % 2 === 0 ? '00' : '30';
                const value = `${String(hour).padStart(2, '0')}:${minute}`;
                return <option key={value} value={value}>{`${hour}:${minute}`}</option>;
              })}
            </select>
            <p className="text-xs text-gray-500">Pickup expiry will be set to 30 minutes after this time. Only between 8:00 AM and 5:00 PM.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date Borrowed</label>
            <input type="date" value={borrowDate} disabled className="mt-1 block w-full rounded border-gray-300 bg-gray-100 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date of Return</label>
            <input type="date" value={returnDate} min={borrowDate} { ...(user && user.role === 'student' ? { max: maxReturnDate } : {}) } onChange={e => setReturnDate(e.target.value)} required className="mt-1 block w-full rounded border-gray-300" pattern="\\d{4}-\\d{2}-\\d{2}" onInput={e => {
              const d = new Date(e.target.value);
              if (d.getDay() === 0) {
                e.target.setCustomValidity('Sundays are not allowed.');
              } else {
                e.target.setCustomValidity('');
              }
            }} />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Request'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BorrowFormModal;
