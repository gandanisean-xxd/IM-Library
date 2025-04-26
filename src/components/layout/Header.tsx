import React from 'react';
import { Menu, Bell, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  toggleSidebar: () => void;
  title: string;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, title }) => {
  const { currentUser } = useAuth();

  return (
    <header className="bg-white shadow-sm z-20">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 md:hidden"
          >
            <Menu size={24} />
          </button>
          <h1 className="ml-2 text-xl font-semibold text-gray-800 md:ml-0">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-1 text-gray-600 rounded-full hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 relative">
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="relative">
            <button className="flex items-center text-sm font-medium text-gray-700 rounded-full hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <span className="hidden md:block mr-2">{currentUser?.firstName} {currentUser?.lastName}</span>
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                {currentUser?.firstName?.charAt(0)}{currentUser?.lastName?.charAt(0)}
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;