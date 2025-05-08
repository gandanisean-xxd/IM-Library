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
}

interface AuthData {
  user: User;
  token: string | null;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: string | null;
  login: (data: AuthData) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });

  const [role, setRole] = useState<string | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser).role : null;
  });

  // Update the login function in AuthContext.tsx
  const login = (data: AuthData) => {
    try {
        if (!data || !data.user) {
            throw new Error('Invalid login data received');
        }

        if (!data.role) {
            throw new Error('No role received from server');
        }

        const userRole = data.role.toLowerCase();
        
        // Create user object with explicit role
        const updatedUser = {
            ...data.user,
            role: userRole
        };

        setUser(updatedUser);
        setToken(data.token);
        setRole(userRole);
        
        localStorage.setItem('user', JSON.stringify(updatedUser));
        if (data.token) {
            localStorage.setItem('token', data.token);
        }

    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

  const logout = () => {
    setUser(null);
    setToken(null);
    setRole(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, role, login, logout }}>
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