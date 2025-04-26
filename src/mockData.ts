import { Book, BookStatus, User, Borrowing } from './types';

// Mock Users
export const users: User[] = [
  {
    id: '1',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@library.edu',
    password: 'admin123',
    role: 'admin',
  },
  {
    id: '2',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@library.edu',
    password: 'faculty123',
    role: 'faculty',
    facultyId: 'F1001',
    department: 'College of Computer Studies',
  },
  {
    id: '3',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@library.edu',
    password: 'student123',
    role: 'student',
    studentId: 'S2001',
    program: 'Bachelor of Science in Computer Science',
  },
  {
    id: '4',
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.johnson@library.edu',
    password: 'librarian123',
    role: 'librarian',
  },
];

// Mock Books
export const books: Book[] = [
  {
    id: 'B1001',
    name: 'Introduction to Computer Science',
    author: 'John Smith',
    quantity: 10,
    available: 7,
    category: 'Computer Science',
    campusAvailability: 'Main Campus',
    cover: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    isbn: '978-3-16-148410-0',
    publisher: 'Academic Press',
    yearPublished: 2020,
  },
  {
    id: 'B1002',
    name: 'Advanced Database Systems',
    author: 'Sarah Johnson',
    quantity: 5,
    available: 3,
    category: 'Computer Science',
    campusAvailability: 'Main Campus',
    cover: 'https://images.pexels.com/photos/6147179/pexels-photo-6147179.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    isbn: '978-3-16-148411-7',
    publisher: 'Tech Publishing',
    yearPublished: 2019,
  },
  {
    id: 'B1003',
    name: 'Principles of Economics',
    author: 'Robert Wilson',
    quantity: 8,
    available: 5,
    category: 'Economics',
    campusAvailability: 'Business Campus',
    cover: 'https://images.pexels.com/photos/3944417/pexels-photo-3944417.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    isbn: '978-3-16-148412-4',
    publisher: 'Economic Press',
    yearPublished: 2018,
  },
  {
    id: 'B1004',
    name: 'Modern Physics',
    author: 'Michael Brown',
    quantity: 6,
    available: 2,
    category: 'Physics',
    campusAvailability: 'Science Campus',
    cover: 'https://images.pexels.com/photos/2873486/pexels-photo-2873486.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    isbn: '978-3-16-148413-1',
    publisher: 'Science Publications',
    yearPublished: 2021,
  },
  {
    id: 'B1005',
    name: 'Organic Chemistry',
    author: 'Emily Green',
    quantity: 7,
    available: 4,
    category: 'Chemistry',
    campusAvailability: 'Science Campus',
    cover: 'https://images.pexels.com/photos/6074935/pexels-photo-6074935.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    isbn: '978-3-16-148414-8',
    publisher: 'Chemistry Press',
    yearPublished: 2020,
  },
  {
    id: 'B1006',
    name: 'Software Engineering Principles',
    author: 'David Lee',
    quantity: 9,
    available: 6,
    category: 'Computer Science',
    campusAvailability: 'Main Campus',
    cover: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    isbn: '978-3-16-148415-5',
    publisher: 'Tech Books',
    yearPublished: 2022,
  },
];

// Book Status
export const bookStatus: BookStatus = {
  total: books.reduce((acc, book) => acc + book.quantity, 0),
  borrowed: books.reduce((acc, book) => acc + (book.quantity - book.available), 0),
  available: books.reduce((acc, book) => acc + book.available, 0),
  missing: 2, // Mock missing books
};

// Mock Borrowings
export const borrowings: Borrowing[] = [
  {
    id: 'BR1001',
    bookId: 'B1001',
    userId: '3',
    borrowDate: new Date('2023-05-10'),
    dueDate: new Date('2023-05-24'),
    returnDate: new Date('2023-05-22'),
    status: 'returned',
  },
  {
    id: 'BR1002',
    bookId: 'B1002',
    userId: '3',
    borrowDate: new Date('2023-06-01'),
    dueDate: new Date('2023-06-15'),
    status: 'borrowed',
  },
  {
    id: 'BR1003',
    bookId: 'B1003',
    userId: '2',
    borrowDate: new Date('2023-05-20'),
    dueDate: new Date('2023-06-03'),
    status: 'borrowed',
  },
  {
    id: 'BR1004',
    bookId: 'B1004',
    userId: '3',
    borrowDate: new Date('2023-04-15'),
    dueDate: new Date('2023-04-29'),
    status: 'overdue',
  },
];

// Monthly borrowing stats for chart
export const monthlyBorrowingStats = [
  { month: 'Jan', borrowed: 12, returned: 10 },
  { month: 'Feb', borrowed: 15, returned: 13 },
  { month: 'Mar', borrowed: 18, returned: 15 },
  { month: 'Apr', borrowed: 22, returned: 19 },
  { month: 'May', borrowed: 25, returned: 20 },
  { month: 'Jun', borrowed: 20, returned: 18 },
  { month: 'Jul', borrowed: 15, returned: 14 },
];

// Categories for chart
export const bookCategories = [
  { category: 'Computer Science', count: 25 },
  { category: 'Business', count: 18 },
  { category: 'Engineering', count: 15 },
  { category: 'Science', count: 12 },
  { category: 'Education', count: 10 },
];