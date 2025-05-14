import { FC } from 'react';

// Admin Components
declare module './components/admin/Dashboard' {
    const AdminDashboard: FC;
    export default AdminDashboard;
}

declare module './components/admin/BooksList' {
    const BooksList: FC;
    export default BooksList;
}

declare module './components/admin/StudentsList' {
    const StudentsList: FC;
    export default StudentsList;
}

declare module './components/admin/FacultyList' {
    const FacultyList: FC;
    export default FacultyList;
}

declare module './components/admin/LibrariansList' {
    const LibrariansList: FC;
    export default LibrariansList;
}

declare module './components/admin/BorrowingsList' {
    const BorrowingsList: FC;
    export default BorrowingsList;
}

// User Components
declare module './components/user/Dashboard' {
    const UserDashboard: FC;
    export default UserDashboard;
}

declare module './components/user/Books' {
    const UserBooks: FC;
    export default UserBooks;
}

declare module './components/user/Borrows' {
    const UserBorrows: FC;
    export default UserBorrows;
}

// Shared Components
declare module './components/shared/Settings' {
    const Settings: FC;
    export default Settings;
}

declare module './components/shared/NotFound' {
    const NotFound: FC;
    export default NotFound;
}

declare module './components/auth/RequireAuth' {
    interface RequireAuthProps {
        allowedRoles: string[];
    }
    const RequireAuth: FC<RequireAuthProps>;
    export default RequireAuth;
}

// Librarian Components
declare module './components/librarian/Reports' {
    const Reports: FC;
    export default Reports;
}

declare module './components/librarian/Borrowings' {
    const Borrowings: FC;
    export default Borrowings;
} 