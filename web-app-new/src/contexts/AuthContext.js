import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await api.auth.me();
        setUser(response.data);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.auth.login({ email, password });
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Login failed';
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.auth.register(userData);
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Registration failed';
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Role-based access control helpers
  const isAdmin = () => user?.role === 'admin';
  const isManager = () => user?.role === 'manager';
  const isWaiter = () => user?.role === 'waiter';
  const isChef = () => user?.role === 'chef';
  const isCustomer = () => user?.role === 'customer';

  // Get role-specific dashboard route
  const getDashboardRoute = () => {
    switch (user?.role) {
      case 'admin':
        return '/admin';
      case 'manager':
        return '/manager';
      case 'waiter':
        return '/waiter';
      case 'chef':
        return '/chef';
      default:
        return '/';
    }
  };

  // Check if user has required role
  const hasRole = (requiredRole) => {
    if (!user) return false;
    if (requiredRole === 'admin') return isAdmin();
    if (requiredRole === 'manager') return isAdmin() || isManager();
    if (requiredRole === 'staff') return isAdmin() || isManager() || isWaiter() || isChef();
    return user.role === requiredRole;
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    isAdmin,
    isManager,
    isWaiter,
    isChef,
    isCustomer,
    getDashboardRoute,
    hasRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 