import React, { useState } from 'react';
import { format } from 'date-fns';

interface BorrowRequest {
  id: string;
  studentId: string;
  studentName: string;
  bookId: string;
  bookTitle: string;
  requestTime: string;
  pickupTime: string;
  status: 'pending' | 'verified' | 'expired' | 'cancelled';
}

const BorrowVerificationForm: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentRequest, setCurrentRequest] = useState<BorrowRequest | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setErrorMessage('Please enter a student ID or request ID');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement API call to fetch borrow request
      // const response = await fetch(`/api/librarian/borrow-requests/${searchQuery}`);
      // if (!response.ok) {
      //   throw new Error('Request failed');
      // }
      // const data = await response.json();
      // setCurrentRequest(data);
      setVerificationStatus('idle');
      setErrorMessage('');
    } catch (error) {
      console.error('Error searching for borrow request:', error);
      setErrorMessage('Failed to find borrow request');
      setCurrentRequest(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!currentRequest) return;

    setIsLoading(true);
    try {
      // TODO: Implement API call to verify borrow request
      // const response = await fetch(`/api/librarian/verify-borrow/${currentRequest.id}`, {
      //   method: 'POST',
      // });
      // if (!response.ok) {
      //   throw new Error('Verification failed');
      // }
      // const data = await response.json();
      setVerificationStatus('success');
      setErrorMessage('');
      // Update current request status
      setCurrentRequest(prev => prev ? { ...prev, status: 'verified' } : null);
    } catch (error) {
      console.error('Error verifying borrow request:', error);
      setVerificationStatus('error');
      setErrorMessage('Failed to verify borrow request');
    } finally {
      setIsLoading(false);
    }
  };

  const isExpired = (pickupTime: string) => {
    const pickupDateTime = new Date(pickupTime);
    const thirtyMinutesLater = new Date(pickupDateTime.getTime() + 30 * 60000);
    return new Date() > thirtyMinutesLater;
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Verify Book Pickup</h2>
      
      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter student ID or request ID"
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {errorMessage}
        </div>
      )}

      {/* Request Details */}
      {currentRequest && (
        <div className="border rounded-md p-4">
          <h3 className="font-medium mb-4">Borrow Request Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Student ID</p>
              <p className="font-medium">{currentRequest.studentId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Student Name</p>
              <p className="font-medium">{currentRequest.studentName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Book ID</p>
              <p className="font-medium">{currentRequest.bookId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Book Title</p>
              <p className="font-medium">{currentRequest.bookTitle}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Request Time</p>
              <p className="font-medium">
                {format(new Date(currentRequest.requestTime), 'PPp')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Pickup Time</p>
              <p className="font-medium">
                {format(new Date(currentRequest.pickupTime), 'PPp')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className={`font-medium ${
                currentRequest.status === 'pending' ? 'text-yellow-600' :
                currentRequest.status === 'verified' ? 'text-green-600' :
                'text-red-600'
              }`}>
                {currentRequest.status.charAt(0).toUpperCase() + currentRequest.status.slice(1)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Time Remaining</p>
              <p className={`font-medium ${isExpired(currentRequest.pickupTime) ? 'text-red-600' : 'text-green-600'}`}>
                {isExpired(currentRequest.pickupTime) ? 'Expired' : '< 30 minutes'}
              </p>
            </div>
          </div>

          {/* Verification Actions */}
          <div className="mt-6 flex justify-end gap-4">
            <button
              onClick={handleVerify}
              disabled={currentRequest.status !== 'pending' || isExpired(currentRequest.pickupTime) || isLoading}
              className={`px-4 py-2 rounded-md ${
                currentRequest.status === 'pending' && !isExpired(currentRequest.pickupTime) && !isLoading
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? 'Verifying...' : 'Verify Pickup'}
            </button>
          </div>
        </div>
      )}

      {/* Verification Status */}
      {verificationStatus === 'success' && (
        <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-md">
          Book pickup verified successfully!
        </div>
      )}
    </div>
  );
};

export default BorrowVerificationForm; 