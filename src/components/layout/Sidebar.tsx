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
  const { user, logout } = useAuth();  // Change this line to get user instead of currentUser
  
  // Update role checks to use user.role
  const isAdmin = user?.role === 'staff';
  const isLibrarian = user?.role === 'librarian';
  const isStaff = isAdmin || isLibrarian;

  const userInitials = React.useMemo(() => {
    if (!user) return '';
    
    if (user.LIBRARIAN_FIRSTNAME && user.LIBRARIAN_LASTNAME) {
      return `${user.LIBRARIAN_FIRSTNAME.charAt(0)}${user.LIBRARIAN_LASTNAME.charAt(0)}`;
    }
    
    if (user.STUDENT_FIRSTNAME && user.STUDENT_LASTNAME) {
      return `${user.STUDENT_FIRSTNAME.charAt(0)}${user.STUDENT_LASTNAME.charAt(0)}`;
    }
    
    if (user.FACULTY_FIRSTNAME && user.FACULTY_LASTNAME) {
      return `${user.FACULTY_FIRSTNAME.charAt(0)}${user.FACULTY_LASTNAME.charAt(0)}`;
    }

    return '';
  }, [user]);

  const userFullName = React.useMemo(() => {
    if (!user) return '';
    
    if (user.LIBRARIAN_FIRSTNAME && user.LIBRARIAN_LASTNAME) {
      return `${user.LIBRARIAN_FIRSTNAME} ${user.LIBRARIAN_LASTNAME}`;
    }
    
    if (user.STUDENT_FIRSTNAME && user.STUDENT_LASTNAME) {
      return `${user.STUDENT_FIRSTNAME} ${user.STUDENT_LASTNAME}`;
    }
    
    if (user.FACULTY_FIRSTNAME && user.FACULTY_LASTNAME) {
      return `${user.FACULTY_FIRSTNAME} ${user.FACULTY_LASTNAME}`;
    }
    
    return '';
  }, [user]);
  
  const navLinks = [
    {
      name: 'Dashboard',
      path: isStaff ? '/admin/dashboard' : '/user/dashboard',
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
      path: '/admin/borrowings',
      icon: <BookMarked size={20} />,
      visible: isStaff,
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
      path: '/admin/reports',
      icon: <BarChart2 size={20} />,
      visible: isStaff,
    },
    {
      name: 'Settings',
      path: isStaff ? '/admin/settings' : '/user/settings',
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
            <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
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