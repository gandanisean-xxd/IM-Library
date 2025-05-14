import React, { useEffect } from 'react';
import { Check, X } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, message }) => {
  useEffect(() => {
    console.log('ConfirmationModal props:', { isOpen, message });
  }, [isOpen, message]);

  if (!isOpen) {
    console.log('Modal not showing because isOpen is false');
    return null;
  }

  console.log('Rendering modal with message:', message);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal Content */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 z-10">
          <div className="text-center">
            {/* Success Icon */}
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>

            {/* Message */}
            <h3 className="text-lg font-medium text-gray-900 mb-4">Success!</h3>
            <p className="text-sm text-gray-500 mb-6">{message}</p>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full inline-flex justify-center items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
            >
              Continue
            </button>
          </div>

          {/* Close Icon */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal; 