import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, NotificationItem } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  activeTab: string;
  selectedIssueId: number | string | null;
  notifications: NotificationItem[];
  unreadCount: number;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  demoLogin: (role: string, email?: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  navigateTo: (tab: string, issueId?: number | string | null) => void;
  refreshNotifications: () => Promise<void>;
  markNotificationRead: (id: number) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('nexus_token'));
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [selectedIssueId, setSelectedIssueId] = useState<number | string | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Initialize and check current user session
  useEffect(() => {
    async function loadSession() {
      if (token) {
        try {
          const res = await api.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            // Auto navigate to role dashboard if on landing
            if (activeTab === 'landing') {
              if (res.user.role === 'admin') setActiveTab('admin');
              else if (res.user.role === 'resolver') setActiveTab('resolver');
              else setActiveTab('citizen');
            }
          }
        } catch (err) {
          console.warn('Session expired or invalid, logging out:', err);
          logout();
        }
      }
      setLoading(false);
    }
    loadSession();
  }, [token]);

  // Notifications polling / fetcher
  const refreshNotifications = async () => {
    if (!token) return;
    try {
      const res = await api.getNotifications();
      if (res.success) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      // silently fail if offline
    }
  };

  useEffect(() => {
    if (user) {
      refreshNotifications();
      const interval = setInterval(refreshNotifications, 20000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const login = async (credentials: { email: string; password: string }) => {
    const res = await api.login(credentials);
    if (res.success && res.token) {
      localStorage.setItem('nexus_token', res.token);
      setToken(res.token);
      setUser(res.user);
      if (res.user.role === 'admin') setActiveTab('admin');
      else if (res.user.role === 'resolver') setActiveTab('resolver');
      else setActiveTab('citizen');
    }
  };

  const demoLogin = async (role: string, email?: string) => {
    const res = await api.demoLogin(role, email);
    if (res.success && res.token) {
      localStorage.setItem('nexus_token', res.token);
      setToken(res.token);
      setUser(res.user);
      if (res.user.role === 'admin') setActiveTab('admin');
      else if (res.user.role === 'resolver') setActiveTab('resolver');
      else setActiveTab('citizen');
    }
  };

  const register = async (userData: any) => {
    const res = await api.register(userData);
    if (res.success && res.token) {
      localStorage.setItem('nexus_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setActiveTab('citizen');
    }
  };

  const logout = () => {
    localStorage.removeItem('nexus_token');
    setToken(null);
    setUser(null);
    setNotifications([]);
    setUnreadCount(0);
    setActiveTab('landing');
    setSelectedIssueId(null);
  };

  const navigateTo = (tab: string, issueId: number | string | null = null) => {
    setActiveTab(tab);
    if (issueId !== null && issueId !== undefined) {
      setSelectedIssueId(issueId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const markNotificationRead = async (id: number) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        activeTab,
        selectedIssueId,
        notifications,
        unreadCount,
        login,
        demoLogin,
        register,
        logout,
        navigateTo,
        refreshNotifications,
        markNotificationRead,
        markAllNotificationsRead
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
