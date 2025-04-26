import React from 'react';
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<RoleSelection />} />
          <Route path="/auth/:role" element={<AuthLayout />} />
          
          {/* Admin routes for admin role */}
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

          {/* Admin routes for librarian role */}
          <Route element={<RequireAuth allowedRoles={['librarian']} />}>
            <Route path="/admin" element={<DashboardLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="books" element={<BooksList />} />
              <Route path="librarians" element={<LibrariansList />} />
              <Route path="borrowings" element={<BorrowingsList />} />
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