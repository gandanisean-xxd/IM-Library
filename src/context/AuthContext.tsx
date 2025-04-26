import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { users } from '../mockData';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  register: (user: Omit<User, 'id'>) => boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  login: () => false,
  logout: () => {},
  register: () => false,
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [localUsers, setLocalUsers] = useState<User[]>(users);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = (email: string, password: string): boolean => {
    const user = localUsers.find(
      (u) => u.email === email && u.password === password
    );
    
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
  };

  const register = (user: Omit<User, 'id'>): boolean => {
    // Check if email already exists
    const emailExists = localUsers.some((u) => u.email === user.email);
    
    if (emailExists) {
      return false;
    }
    
    // Generate new ID (in a real app, this would be handled by the backend)
    const newUser = {
      ...user,
      id: `${localUsers.length + 1}`,
    } as User;
    
    setLocalUsers([...localUsers, newUser]);
    
    // Auto login after registration
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    return true;
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, register, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};