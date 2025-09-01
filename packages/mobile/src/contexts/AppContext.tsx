import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { createAPIClient, PDFToolsAPI } from '@pdf-tools/shared';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAuth } from './AuthContext';

interface AppContextType {
  isOnline: boolean;
  api: PDFToolsAPI;
  user: any; // Will be typed properly with the shared types
  appState: AppStateStatus;
  remainingOperations: number;
  isProUser: boolean;
  refreshUserData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user: authUser } = useAuth();
  const [isOnline, setIsOnline] = useState(true);
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const [remainingOperations, setRemainingOperations] = useState(10);
  const [isProUser, setIsProUser] = useState(false);
  const [user, setUser] = useState(authUser);

  // Initialize API client
  const [api] = useState(() => 
    createAPIClient(async () => {
      return await AsyncStorage.getItem('pdf_tools_access_token');
    })
  );

  useEffect(() => {
    // Monitor network connectivity
    const unsubscribeNetInfo = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
    });

    // Monitor app state changes
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      setAppState(nextAppState);
      
      // Refresh user data when app becomes active
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        refreshUserData();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      unsubscribeNetInfo();
      subscription?.remove();
    };
  }, [appState]);

  useEffect(() => {
    setUser(authUser);
    if (authUser) {
      refreshUserData();
    }
  }, [authUser]);

  const refreshUserData = async () => {
    if (!authUser) return;

    try {
      // Get user's remaining operations
      const operationsResult = await api.user.getRemainingOperations();
      if (operationsResult.success) {
        setRemainingOperations(operationsResult.data.remaining);
        setIsProUser(operationsResult.data.isProUser);
      }

      // Get user profile
      const profileResult = await api.user.getProfile();
      if (profileResult.success) {
        setUser(profileResult.data);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const value: AppContextType = {
    isOnline,
    api,
    user,
    appState,
    remainingOperations,
    isProUser,
    refreshUserData,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}