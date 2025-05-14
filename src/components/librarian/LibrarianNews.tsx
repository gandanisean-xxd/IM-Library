import React from 'react';
import NotificationCenter from './NotificationCenter';

const LibrarianNews: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Librarian News & Notifications</h1>
      <NotificationCenter />
    </div>
  );
};

export default LibrarianNews;
