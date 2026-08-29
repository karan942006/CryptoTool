import React, { createContext, useContext, useState, useEffect } from 'react';
import { Organization, UserMember } from '../types';
import * as api from '../services/api';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
}

interface AppContextType {
  organization: Organization | null;
  user: UserMember | null;
  organizationsList: Organization[];
  setOrganization: (org: Organization) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isDemoMode: boolean;
  setDemoMode: (val: boolean) => void;
  notifications: NotificationItem[];
  addNotification: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  removeNotification: (id: string) => void;
  isGlobalSearchOpen: boolean;
  setIsGlobalSearchOpen: (val: boolean) => void;
  activeScanId: string | null;
  setActiveScanId: (id: string | null) => void;
  refreshAppData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [user, setUser] = useState<UserMember | null>(null);
  const [organizationsList, setOrganizationsList] = useState<Organization[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isDemoMode, setDemoMode] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState<boolean>(false);
  const [activeScanId, setActiveScanId] = useState<string | null>(null);

  const addNotification = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const item: NotificationItem = {
      id: Math.random().toString(36).substring(7),
      title,
      message,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setNotifications(prev => [item, ...prev]);

    // Auto dismiss toast after 6s
    setTimeout(() => {
      removeNotification(item.id);
    }, 6000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  const refreshAppData = async () => {
    try {
      const authData = await api.fetchAuthMe();
      setUser(authData.user);
      setOrganization(authData.organization);
      const orgs = await api.fetchOrganizations();
      setOrganizationsList(orgs);
    } catch (e) {
      console.warn('Backend not yet reachable, using offline fallback profile', e);
      const defaultOrg: Organization = {
        id: 'a0000000-0000-0000-0000-000000000001',
        name: 'National Cyber Defense Agency',
        slug: 'national-cyber-defense',
        description: 'Authorized Enterprise Security Assessment Unit',
        tier: 'enterprise',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setOrganization(defaultOrg);
      setOrganizationsList([defaultOrg]);
      setUser({
        id: 'b0000000-0000-0000-0000-000000000001',
        organization_id: defaultOrg.id,
        user_id: 'c0000000-0000-0000-0000-000000000001',
        role: 'owner',
        email: 'admin@cryptotool.internal',
        full_name: 'Chief Information Security Officer',
        created_at: new Date().toISOString(),
      });
    }
  };

  useEffect(() => {
    document.documentElement.classList.add('dark');
    refreshAppData();

    // Global keyboard shortcut for search palette (Ctrl+K or Cmd+K)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <AppContext.Provider
      value={{
        organization,
        user,
        organizationsList,
        setOrganization,
        isDarkMode,
        toggleDarkMode,
        isDemoMode,
        setDemoMode,
        notifications,
        addNotification,
        removeNotification,
        isGlobalSearchOpen,
        setIsGlobalSearchOpen,
        activeScanId,
        setActiveScanId,
        refreshAppData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
