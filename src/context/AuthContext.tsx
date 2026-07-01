import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNotifications } from './NotificationContext';
import { logFirebaseEvent } from '../services/firebase';

export interface UserResponse {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: 'Citizen' | 'Government' | 'NGO' | 'Admin';
  sub_role?: string;
  profile_image?: string;
  address?: string;
  city: string;
  state: string;
  country: string;
  organization?: string;
  email_verified: boolean;
  account_status: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

interface AuthContextType {
  currentUser: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = localStorage.getItem('VITE_API_BASE_URL') || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const { showNotification } = useNotifications();

  const logout = useCallback(async () => {
    try {
      if (token) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        });
      }
    } catch (e) {
      console.warn('Logout notification error:', e);
    } finally {
      setToken(null);
      setCurrentUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      showNotification('Successfully logged out.', 'info');
      logFirebaseEvent('logout');
    }
  }, [token, showNotification]);

  // Load persisted session on startup
  useEffect(() => {
    const savedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    const savedUser = localStorage.getItem('user') || sessionStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch {
        // Clear corrupt data
        logout();
      }
    }
    setIsAuthenticating(false);
  }, [logout]);

  const login = async (email: string, password: string, rememberMe: boolean) => {
    setIsAuthenticating(true);
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.detail || 'Failed to authenticate credentials.');
      }

      const { access_token, user } = resData;
      setToken(access_token);
      setCurrentUser(user);
      logFirebaseEvent('login', { role: user.role, email: user.email });

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('token', access_token);
      storage.setItem('user', JSON.stringify(user));

      showNotification(`Welcome back, ${user.first_name}!`, 'success');
    } catch (err: any) {
      showNotification(err.message || 'Login failed.', 'error');
      throw err;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const register = async (registerData: any) => {
    setIsAuthenticating(true);
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.detail || 'Registration failed.');
      }

      showNotification('Account created successfully! Please check your email to verify.', 'success');
      logFirebaseEvent('sign_up', { role: registerData.role, email: registerData.email });
    } catch (err: any) {
      showNotification(err.message || 'Registration failed.', 'error');
      throw err;
    } finally {
      setIsAuthenticating(false);
    }
  };



  const updateProfile = async (profileData: any) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.detail || 'Could not update profile info.');
      }

      setCurrentUser(resData);
      const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
      storage.setItem('user', JSON.stringify(resData));
      showNotification('Profile updated successfully!', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Update failed.', 'error');
      throw err;
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!token) return;
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE}/user/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.detail || 'Avatar upload failed.');
      }

      setCurrentUser(resData);
      const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
      storage.setItem('user', JSON.stringify(resData));
      showNotification('Profile photo uploaded!', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Avatar upload failed.', 'error');
      throw err;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE}/user/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.detail || 'Password update failed.');
      }

      showNotification('Password updated successfully!', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Password update failed.', 'error');
      throw err;
    }
  };

  const deleteAccount = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE}/user/account`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.detail || 'Account deletion failed.');
      }

      setToken(null);
      setCurrentUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      showNotification('Your account has been deleted from CivicMind AI.', 'warning');
    } catch (err: any) {
      showNotification(err.message || 'Account deletion failed.', 'error');
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        isAuthenticated: !!token,
        isAuthenticating,
        login,
        register,
        logout,
        updateProfile,
        uploadAvatar,
        changePassword,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
export default AuthContext;
