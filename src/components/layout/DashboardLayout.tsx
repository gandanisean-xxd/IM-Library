import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
  // Determine page title based on the current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard';
    if (path.includes('/books')) return 'Books';
    if (path.includes('/borrowings')) return 'Borrowings';
    if (path.includes('/borrows')) return 'My Borrowed Books';
    if (path.includes('/students')) return 'Students';
    if (path.includes('/faculty')) return 'Faculty';
    if (path.includes('/librarians')) return 'Librarians';
    if (path.includes('/reports')) return 'Reports';
    if (path.includes('/settings')) return 'Settings';
    return 'Library Management System';
  };
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggle={toggleSidebar} />
      
      {/* Overlay for mobile sidebar */}
      <div 
        className={`fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity md:hidden ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleSidebar}
      ></div>
      
      {/* Main content */}
      <div className="flex flex-col flex-1 min-h-screen md:pl-64">
        <Header toggleSidebar={toggleSidebar} title={getPageTitle()} />
        
        {/* Page content */}
        <main className="flex-1 p-4 overflow-y-auto">
          <Outlet />
        </main>
        
        {/* Footer */}
        <footer className="bg-white p-4 text-center text-gray-500 text-sm">
          <p>Library Management System &copy; {new Date().getFullYear()}</p>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;