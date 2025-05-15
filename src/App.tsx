
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RoleSelection from './components/RoleSelection';
import AuthLayout from './components/auth/AuthLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminDashboard from './components/admin/Dashboard';
import BooksList from './components/admin/BooksList';
import StudentsList from './components/admin/StudentsList';
import FacultyList from './components/admin/FacultyList';
import LibrariansList from './components/admin/LibrariansList';
import BorrowingsList from './components/admin/BorrowingsList';
import UserDashboard from './components/user/Dashboard';
import UserBooks from './components/user/Books';
import UserBorrows from './components/user/Borrows';
import Settings from './components/shared/Settings';
import RequireAuth from './components/auth/RequireAuth';
import NotFound from './components/shared/NotFound';
<<<<<<< HEAD
=======
import ReservationForm from './components/user/ReservationForm';

>>>>>>> 0ef76e0ee4fd50d8aa40f7941e3383128544db64
// Import librarian components
import LibrarianDashboard from './components/librarian/Dashboard';
import BookManagement from './components/librarian/BookManagement';
<<<<<<< HEAD

=======
import LibrarianNews from './components/librarian/LibrarianNews';
import RoomReservations from './components/librarian/RoomReservations';
>>>>>>> 0ef76e0ee4fd50d8aa40f7941e3383128544db64

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<RoleSelection />} />
          <Route path="/auth/:role" element={<AuthLayout />} />
          
          {/* Admin routes */}
          <Route element={<RequireAuth allowedRoles={['admin']} />}>
            <Route path="/admin" element={<DashboardLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="books" element={<BooksList />} />
              <Route path="students" element={<StudentsList />} />
              <Route path="faculty" element={<FacultyList />} />
              <Route path="librarians" element={<LibrariansList />} />
              <Route path="borrowings" element={<BorrowingsList />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>

          {/* Librarian routes */}
          <Route element={<RequireAuth allowedRoles={['librarian', 'staff']} />}>
            <Route path="/librarian" element={<DashboardLayout />}>
              <Route index element={<Navigate to="/librarian/dashboard" replace />} />
              <Route path="dashboard" element={<LibrarianDashboard />} />
              
              <Route path="books" element={<BookManagement />} />
<<<<<<< HEAD
              
=======
              <Route path="room-reservations" element={<RoomReservations />} />
              <Route path="news" element={<LibrarianNews />} />
>>>>>>> 0ef76e0ee4fd50d8aa40f7941e3383128544db64
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>
          
          {/* User routes (student & faculty) */}
          <Route element={<RequireAuth allowedRoles={['student', 'faculty']} />}>
            <Route path="/user" element={<DashboardLayout />}>
              <Route index element={<Navigate to="/user/dashboard" replace />} />
              <Route path="dashboard" element={<UserDashboard />} />
              <Route path="books" element={<UserBooks />} />
              <Route path="borrows" element={<UserBorrows />} />
              <Route path="reservations" element={<div className="p-6">
                                <h1 className="text-2xl font-bold mb-6">Room Reservation</h1>
                                <ReservationForm />
                              </div> } />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>
          
          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;