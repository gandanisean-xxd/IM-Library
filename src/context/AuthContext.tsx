import React, { createContext, useContext, useState } from 'react';

interface User {
  STUDENT_ID?: string;
  FACULTY_ID?: string;
  STUDENT_FIRSTNAME?: string;
  STUDENT_LASTNAME?: string;
  FACULTY_FIRSTNAME?: string;
  FACULTY_LASTNAME?: string;
  LIBRARIAN_FIRSTNAME?: string;
  LIBRARIAN_LASTNAME?: string;
  EMAIL: string;
  role: string;
  STUDENT_PROGRAM?: string;
  STUDENT_CAMPUS?: string;
  EXPECTED_GRADUATEYEAR?: string;
  STATUS?: string;
}

interface AuthContextType {
  currentUser: User | null;
  token: string | null;
  login: (data: { user: User; token: string; role: string }) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = (data: { user: User; token: string; role: string }) => {
    setCurrentUser(data.user);
    setToken(data.token);
    // Store auth data in localStorage
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('token', data.token);
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    // Clear auth data from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const updateUser = (user: User) => {
    setCurrentUser(user);
    // Update user data in localStorage while preserving the existing token
    localStorage.setItem('user', JSON.stringify(user));
    // Don't modify the token - keep the existing one
  };

  // Check for existing auth data on mount
  React.useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      setCurrentUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, token, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;