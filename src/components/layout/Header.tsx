import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  toggleSidebar: () => void;
  title: string;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, title }) => {
  const { currentUser } = useAuth();
  // Get user's full name with null checks and default values
  const userFullName = React.useMemo(() => {
    if (!currentUser) return '';
    
    if (currentUser.role === 'admin') {
      return 'Administrator';
    }

    if (currentUser.STUDENT_FIRSTNAME && currentUser.STUDENT_LASTNAME) {
      return `${currentUser.STUDENT_FIRSTNAME} ${currentUser.STUDENT_LASTNAME}`;
    }
    
    if (currentUser.FACULTY_FIRSTNAME && currentUser.FACULTY_LASTNAME) {
      return `${currentUser.FACULTY_FIRSTNAME} ${currentUser.FACULTY_LASTNAME}`;
    }

    if (currentUser.LIBRARIAN_FIRSTNAME && currentUser.LIBRARIAN_LASTNAME) {
      return `${currentUser.LIBRARIAN_FIRSTNAME} ${currentUser.LIBRARIAN_LASTNAME}`;
    }
    
    return '';
  }, [currentUser]);
  // Get user initials with null checks
  const userInitials = React.useMemo(() => {
    if (!currentUser) return '';
    
    if (currentUser.role === 'admin') {
      return 'AD';
    }

    if (currentUser.STUDENT_FIRSTNAME && currentUser.STUDENT_LASTNAME) {
      return `${currentUser.STUDENT_FIRSTNAME.charAt(0)}${currentUser.STUDENT_LASTNAME.charAt(0)}`;
    }
    
    if (currentUser.FACULTY_FIRSTNAME && currentUser.FACULTY_LASTNAME) {
      return `${currentUser.FACULTY_FIRSTNAME.charAt(0)}${currentUser.FACULTY_LASTNAME.charAt(0)}`;
    }
    
    if (currentUser.LIBRARIAN_FIRSTNAME && currentUser.LIBRARIAN_LASTNAME) {
      return `${currentUser.LIBRARIAN_FIRSTNAME.charAt(0)}${currentUser.LIBRARIAN_LASTNAME.charAt(0)}`;
    }

    return '';
  }, [currentUser]);

  const roleDisplay = React.useMemo(() => {
    if (!currentUser?.role) return '';
    
    // Capitalize first letter of role
    return currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
  }, [currentUser]);

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
          <button 
            className="p-1 text-gray-600 rounded-full hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 relative"
            aria-label="Notifications"
          >
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          {currentUser && (
            <div className="relative group">
              <button 
                className="flex items-center text-sm font-medium text-gray-700 rounded-full hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                aria-label="User menu"
              >
                <span className="hidden md:flex md:flex-col md:items-end mr-2">
                  <span className="font-medium">{userFullName}</span>
                  <span className="text-xs text-gray-500">{roleDisplay}</span>
                </span>
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  {userInitials}
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;