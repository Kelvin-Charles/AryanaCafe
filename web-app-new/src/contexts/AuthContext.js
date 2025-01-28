import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiMethods, { api } from '../services/api';

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

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Checking auth - Token:', token ? 'exists' : 'not found');
      
      if (!token) {
        console.log('No token found, user is not authenticated');
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        // Ensure token is set in headers
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        const response = await apiMethods.auth.me();
        console.log('Auth check response:', response.data);
        
        if (response.data) {
          setUser(response.data);
          console.log('User authenticated:', response.data);
        } else {
          console.log('No user data in response');
          setUser(null);
          localStorage.removeItem('token');
        }
      } catch (error) {
        // Only clear token if it's an auth error (401)
        if (error.response?.status === 401) {
          console.error('Auth check failed with 401:', error.response?.data);
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
          setUser(null);
        } else {
          // For other errors, keep the token but log the error
          console.error('Auth check failed with non-401 error:', error);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial auth check
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Set up interval to refresh auth
  useEffect(() => {
    const interval = setInterval(checkAuth, 5 * 60 * 1000); // Check every 5 minutes
    return () => clearInterval(interval);
  }, [checkAuth]);

  const login = async (email, password) => {
    try {
      const response = await apiMethods.auth.login({ email, password });
      console.log('Login response:', response.data);
      
      if (!response.data.token || !response.data.user) {
        throw new Error('Invalid login response format');
      }
      
      const { token, user: userData } = response.data;
      
      // Set token in localStorage and headers
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      console.log('Setting user data:', userData);
      setUser(userData);
      
      return response.data;
    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message);
      throw error.response?.data?.error || 'Login failed';
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiMethods.auth.register(userData);
      
      if (!response.data.token || !response.data.user) {
        throw new Error('Invalid registration response format');
      }
      
      const { token, user: newUser } = response.data;
      
      // Set token in localStorage and headers
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(newUser);
      return response.data;
    } catch (error) {
      console.error('Registration failed:', error.response?.data || error.message);
      throw error.response?.data?.error || 'Registration failed';
    }
  };

  const logout = () => {
    console.log('Logging out user');
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
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
    console.log('Getting dashboard route for role:', user?.role);
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
    console.log('Checking role:', { requiredRole, userRole: user?.role, user });
    if (!user) return false;
    
    // Special role handling
    switch (requiredRole) {
      case 'admin':
        return isAdmin();
      case 'manager':
        return isAdmin() || isManager();
      case 'staff':
        return isAdmin() || isManager() || isWaiter() || isChef();
      case 'waiter':
        return isAdmin() || isWaiter();
      case 'chef':
        return isAdmin() || isChef();
      default:
        return user.role === requiredRole;
    }
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
    hasRole,
    checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 