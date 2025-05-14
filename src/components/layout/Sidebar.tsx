import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  UserPlus, 
  Library, 
  Settings, 
  LogOut,
  BookMarked,
  BarChart2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggle }) => {
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  
  // Update role checks
  const isAdmin = currentUser?.role === 'admin';
  const isLibrarian = currentUser?.role === 'librarian';
  const isStaff = isAdmin || isLibrarian;

  const userInitials = React.useMemo(() => {
    if (!currentUser) return '';
    
    if (currentUser.LIBRARIAN_FIRSTNAME && currentUser.LIBRARIAN_LASTNAME) {
      return `${currentUser.LIBRARIAN_FIRSTNAME.charAt(0)}${currentUser.LIBRARIAN_LASTNAME.charAt(0)}`;
    }
    
    if (currentUser.STUDENT_FIRSTNAME && currentUser.STUDENT_LASTNAME) {
      return `${currentUser.STUDENT_FIRSTNAME.charAt(0)}${currentUser.STUDENT_LASTNAME.charAt(0)}`;
    }
    
    if (currentUser.FACULTY_FIRSTNAME && currentUser.FACULTY_LASTNAME) {
      return `${currentUser.FACULTY_FIRSTNAME.charAt(0)}${currentUser.FACULTY_LASTNAME.charAt(0)}`;
    }

    return '';
  }, [currentUser]);

  const userFullName = React.useMemo(() => {
    if (!currentUser) return '';
    
    if (currentUser.LIBRARIAN_FIRSTNAME && currentUser.LIBRARIAN_LASTNAME) {
      return `${currentUser.LIBRARIAN_FIRSTNAME} ${currentUser.LIBRARIAN_LASTNAME}`;
    }
    
    if (currentUser.STUDENT_FIRSTNAME && currentUser.STUDENT_LASTNAME) {
      return `${currentUser.STUDENT_FIRSTNAME} ${currentUser.STUDENT_LASTNAME}`;
    }
    
    if (currentUser.FACULTY_FIRSTNAME && currentUser.FACULTY_LASTNAME) {
      return `${currentUser.FACULTY_FIRSTNAME} ${currentUser.FACULTY_LASTNAME}`;
    }
    
    return '';
  }, [currentUser]);
  
  const navLinks = [
    {
      name: 'Dashboard',
      path: isAdmin ? '/admin/dashboard' : isLibrarian ? '/librarian/dashboard' : '/user/dashboard',
      icon: <LayoutDashboard size={20} />,
      visible: true,
    },
    {
      name: 'Books',
      path: '/admin/books',
      icon: <BookOpen size={20} />,
      visible: isAdmin,
    },
    {
      name: 'Catalog',
      path: '/user/books',
      icon: <BookOpen size={20} />,
      visible: !isStaff,
    },
    {
      name: 'My Borrows',
      path: '/user/borrows',
      icon: <BookMarked size={20} />,
      visible: !isStaff,
    },
    {
      name: 'Borrowings',
      path: '/librarian/books',
      icon: <BookOpen size={20} />,
      visible: isLibrarian,
    },
    {
      name: 'News & Notifications',
      path: '/librarian/news',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
      visible: isLibrarian,
    },
    {
      name: 'Students',
      path: '/admin/students',
      icon: <Users size={20} />,
      visible: isAdmin,
    },
    {
      name: 'Faculty',
      path: '/admin/faculty',
      icon: <UserPlus size={20} />,
      visible: isAdmin,
    },
    {
      name: 'Librarians',
      path: '/admin/librarians',
      icon: <Library size={20} />,
      visible: isAdmin,
    },
    {
      name: 'Reports',
      path: '/librarian/reports',
      icon: <BarChart2 size={20} />,
      visible: isLibrarian,
    },
    {
      name: 'Settings',
      path: isAdmin ? '/admin/settings' : isLibrarian ? '/librarian/settings' : '/user/settings',
      icon: <Settings size={20} />,
      visible: true,
    },
  ];

  return (
    <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <Link to="/" className="flex items-center">
            <BookOpen className="text-blue-500 h-8 w-8 mr-2" />
            <h1 className="text-xl font-bold text-white">Library System</h1>
          </Link>
          <button 
            onClick={toggle}
            className="text-gray-400 hover:text-white md:hidden"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="px-4 py-6 border-b border-gray-800">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              {userInitials}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">
                {userFullName}
              </p>
              <p className="text-xs text-gray-400 capitalize">{currentUser?.role}</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="px-2 space-y-1">
            {navLinks.filter(link => link.visible).map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`flex items-center px-4 py-3 text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors duration-200 ${
                    location.pathname === link.path ? 'bg-gray-800 text-white' : ''
                  }`}
                >
                  <span className="mr-3">{link.icon}</span>
                  <span>{link.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-3 text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors duration-200"
          >
            <LogOut size={20} className="mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;