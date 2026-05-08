import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('palmas_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('palmas_user');
      }
    }
    setLoading(false);
  }, []);

  const signup = async (name, email, password) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.post(`${apiUrl}/api/auth/signup`, {
        name,
        email,
        password
      });
      if (response.data.success) {
        setUser(response.data.user);
        localStorage.setItem('palmas_user', JSON.stringify(response.data.user));
        return { success: true };
      }
      return { success: false, error: 'Signup failed' };
    } catch (error) {
      console.error('Signup error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Une erreur est survenue. Veuillez réessayer.'
      };
    }
  };

  const signin = async (email, password) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.post(`${apiUrl}/api/auth/signin`, {
        email,
        password
      });
      if (response.data.success) {
        setUser(response.data.user);
        localStorage.setItem('palmas_user', JSON.stringify(response.data.user));
        return { success: true };
      }
      return { success: false, error: 'Invalid credentials' };
    } catch (error) {
      console.error('Signin error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Email ou mot de passe incorrect'
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('palmas_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, signin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
