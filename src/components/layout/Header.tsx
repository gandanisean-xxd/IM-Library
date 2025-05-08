import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  toggleSidebar: () => void;
  title: string;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, title }) => {
  const { user } = useAuth();

  // Get user's full name with null checks and default values
  const userFullName = React.useMemo(() => {
    if (!user) return '';
    
    if (user.STUDENT_FIRSTNAME && user.STUDENT_LASTNAME) {
      return `${user.STUDENT_FIRSTNAME} ${user.STUDENT_LASTNAME}`;
    }
    
    if (user.FACULTY_FIRSTNAME && user.FACULTY_LASTNAME) {
      return `${user.FACULTY_FIRSTNAME} ${user.FACULTY_LASTNAME}`;
    }

    if (user.LIBRARIAN_FIRSTNAME && user.LIBRARIAN_LASTNAME) {
      return `${user.LIBRARIAN_FIRSTNAME} ${user.LIBRARIAN_LASTNAME}`;
    }
    
    return '';
  }, [user]);

  // Get user initials with null checks
  const userInitials = React.useMemo(() => {
    if (!user) return '';
    
    if (user.STUDENT_FIRSTNAME && user.STUDENT_LASTNAME) {
      return `${user.STUDENT_FIRSTNAME.charAt(0)}${user.STUDENT_LASTNAME.charAt(0)}`;
    }
    
    if (user.FACULTY_FIRSTNAME && user.FACULTY_LASTNAME) {
      return `${user.FACULTY_FIRSTNAME.charAt(0)}${user.FACULTY_LASTNAME.charAt(0)}`;
    }
    
    if (user.LIBRARIAN_FIRSTNAME && user.LIBRARIAN_LASTNAME) {
      return `${user.LIBRARIAN_FIRSTNAME.charAt(0)}${user.LIBRARIAN_LASTNAME.charAt(0)}`;
    }

    return '';
  }, [user]);

  const roleDisplay = React.useMemo(() => {
    if (!user?.role) return '';
    
    // Capitalize first letter of role
    return user.role.charAt(0).toUpperCase() + user.role.slice(1);
  }, [user]);

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
          
          {user && (
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