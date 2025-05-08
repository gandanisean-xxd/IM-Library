import React, { createContext, useContext, useState } from 'react';

interface User {
  id: string;
  email: string;
  role: string;
  // Add other user properties as needed
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

  const login = (data: AuthData) => {
    setUser(data.user);
    setToken(data.token);
    setRole(data.role);
    // Optionally save to localStorage
    localStorage.setItem('user', JSON.stringify(data.user));
    if (data.token) {
      localStorage.setItem('token', data.token);
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