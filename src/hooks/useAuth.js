import React, { useState, useContext, createContext, useEffect } from 'react';
import { apiRequest } from '../utils/apiErrorHandler';
import { isAuthError } from '../utils/errorHandler';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 检查本地存储中的认证信息
  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          // 验证token有效性
          const response = await apiRequest('/api/auth/verify', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          if (response.user) {
            setUser(response.user);
          }
        }
      } catch (err) {
        // 如果token无效，清除它
        if (isAuthError(err)) {
          localStorage.removeItem('authToken');
        } else {
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (username, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      
      if (response.token && response.user) {
        localStorage.setItem('authToken', response.token);
        setUser(response.user);
        return response.user;
      } else {
        throw new Error('Invalid login response');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    isLoading,
    error,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};