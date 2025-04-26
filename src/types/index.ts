// User Types
export interface BaseUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'admin' | 'faculty' | 'student' | 'librarian';
}

export interface Student extends BaseUser {
  role: 'student';
  studentId: string;
  program: string;
}

export interface Faculty extends BaseUser {
  role: 'faculty';
  facultyId: string;
  department: string;
}

export interface Admin extends BaseUser {
  role: 'admin';
}

export interface Librarian extends BaseUser {
  role: 'librarian';
}

export type User = Student | Faculty | Admin | Librarian;

// Department and Program Types
export const departments = [
  "College of Education",
  "College of Business Administration and Accountancy",
  "College of Engineering",
  "College of Computer Studies",
] as const;

export type Department = typeof departments[number];

export const programs = [
  "Bachelor of Science in Entrepreneurship",
  "Bachelor of Science in Accountancy",
  "Bachelor of Science in Management Accounting",
  "Bachelor of Early Childhood Education",
  "Bachelor of Science in Electronics Engineering",
  "Bachelor of Science in Industrial Engineering",
  "Bachelor of Science in Computer Engineering",
  "Bachelor of Science in Information Technology",
  "Bachelor of Science in Computer Science",
  "Bachelor of Science in Information System",
] as const;

export type Program = typeof programs[number];

// Book Types
export interface Book {
  id: string;
  name: string;
  author: string;
  quantity: number;
  available: number;
  category: string;
  campusAvailability: string;
  cover?: string;
  isbn?: string;
  publisher?: string;
  yearPublished?: number;
}

// Book Status Types
export interface BookStatus {
  total: number;
  borrowed: number;
  available: number;
  missing: number;
}

// Borrowing Types
export interface Borrowing {
  id: string;
  bookId: string;
  userId: string;
  borrowDate: Date;
  dueDate: Date;
  returnDate?: Date;
  status: 'borrowed' | 'returned' | 'overdue';
}