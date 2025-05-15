import React from 'react';

const BookModal = ({ book, open, onClose }) => {
  if (!open || !book) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
          aria-label="Close"
        >
          <span className="text-xl">&times;</span>
        </button>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0 w-full md:w-32 h-48 flex items-center justify-center bg-gray-100 rounded">
            {book.cover ? (
              <img src={book.cover} alt={book.name} className="w-full h-full object-cover rounded" />
            ) : (
              <span className="text-gray-400">No Cover</span>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{book.name}</h2>
            <p className="text-gray-600 mb-1"><span className="font-semibold">Author:</span> {book.author}</p>
            <p className="text-gray-600 mb-1"><span className="font-semild">Category:</span> {book.category}</p>
            <p className="text-gray-600 mb-1"><span className="font-semibold">Available:</span> {book.available} / {book.quantity}</p>
            <div className="text-gray-600 mb-1"><span className="font-semibold">Campus:</span> {Array.isArray(book.campusAvailability) ? (
              <span className="ml-2 space-x-2">
                {book.campusAvailability.map((campus, idx) => (
                  <span key={idx} className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">{campus}</span>
                ))}
              </span>
            ) : (
              <span className="ml-2 inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">{book.campusAvailability}</span>
            )}
            </div>
            {book.description && (
              <div className="mt-3">
                <h3 className="font-semibold text-gray-700 mb-1">Description:</h3>
                <p className="text-gray-600 text-sm">{book.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookModal;
