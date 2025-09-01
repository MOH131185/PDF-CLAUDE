import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthManager, AuthResult, AuthUser, createAuthManager } from '@pdf-tools/shared';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, userData: { name: string }) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'pdf_tools_access_token',
  REFRESH_TOKEN: 'pdf_tools_refresh_token',
  USER_DATA: 'pdf_tools_user_data',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authManager] = useState(() => 
    createAuthManager(
      {
        async getAccessToken() {
          return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        },
        async setAccessToken(token: string) {
          await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
        },
        async getRefreshToken() {
          return await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        },
        async setRefreshToken(token: string) {
          await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
        },
        async removeTokens() {
          await AsyncStorage.multiRemove([
            STORAGE_KEYS.ACCESS_TOKEN,
            STORAGE_KEYS.REFRESH_TOKEN,
            STORAGE_KEYS.USER_DATA,
          ]);
        },
        async getUserData() {
          const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
          return userData ? JSON.parse(userData) : null;
        },
        async setUserData(userData: AuthUser) {
          await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
        },
      },
      'mobile'
    )
  );

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setLoading(true);
      
      // Try to get existing session
      const result = await authManager.getCurrentSession();
      if (result.success && result.user) {
        setUser(result.user);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    try {
      setLoading(true);
      const result = await authManager.signIn(email, password);
      
      if (result.success && result.user) {
        setUser(result.user);
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign in failed',
      };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    userData: { name: string }
  ): Promise<AuthResult> => {
    try {
      setLoading(true);
      const result = await authManager.signUp(email, password, userData);
      
      if (result.success && result.user) {
        setUser(result.user);
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign up failed',
      };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      await authManager.signOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<AuthResult> => {
    try {
      return await authManager.resetPassword(email);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Reset password failed',
      };
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}