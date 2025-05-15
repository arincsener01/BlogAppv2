import React, { createContext, useContext, useState, useEffect } from 'react';
import { usersApi } from '../services/api';

const AuthContext = createContext(null);

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
  const [error, setError] = useState(null);

  // Check if we have a token in localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      checkAuthStatus();
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await usersApi.get('/Users/Authorize');
      
      if (response.data.success) {
        setUser({
          isAuthenticated: true,
          ...response.data
        });
      } else {
        setUser(null);
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      setError(null);
      const response = await usersApi.post('/Users/Token', {
        userName: username,
        password: password
      });

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        await checkAuthStatus();
        return true;
      } else {
        setError(response.data.message || 'Login failed');
        return false;
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 