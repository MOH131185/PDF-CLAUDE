import { AuthManager, AuthStorage } from './index';
import { SupabaseAuthProvider } from './providers/supabase';
import { Platform } from '../types';

export interface MobileAuthStorageInterface {
  getAccessToken(): Promise<string | null>;
  setAccessToken(token: string): Promise<void>;
  getRefreshToken(): Promise<string | null>;
  setRefreshToken(token: string): Promise<void>;
  removeTokens(): Promise<void>;
  getUserData(): Promise<any>;
  setUserData(userData: any): Promise<void>;
}

export class MobileAuthStorageAdapter implements AuthStorage {
  constructor(private mobileStorage: MobileAuthStorageInterface) {}

  async getItem(key: string): Promise<string | null> {
    switch (key) {
      case 'auth_session':
        // For mobile, we'll construct the session from stored tokens and user data
        const accessToken = await this.mobileStorage.getAccessToken();
        const refreshToken = await this.mobileStorage.getRefreshToken();
        const userData = await this.mobileStorage.getUserData();
        
        if (!accessToken || !userData) return null;
        
        return JSON.stringify({
          access_token: accessToken,
          refresh_token: refreshToken,
          user: userData,
          expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
        });
      default:
        return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    if (key === 'auth_session') {
      try {
        const session = JSON.parse(value);
        if (session.access_token) {
          await this.mobileStorage.setAccessToken(session.access_token);
        }
        if (session.refresh_token) {
          await this.mobileStorage.setRefreshToken(session.refresh_token);
        }
        if (session.user) {
          await this.mobileStorage.setUserData(session.user);
        }
      } catch (error) {
        console.error('Error storing auth session:', error);
      }
    }
  }

  async removeItem(key: string): Promise<void> {
    if (key === 'auth_session') {
      await this.mobileStorage.removeTokens();
    }
  }

  async clear(): Promise<void> {
    await this.mobileStorage.removeTokens();
  }
}

export function createAuthManager(
  storageInterface: MobileAuthStorageInterface | 'web',
  platform: Platform
): AuthManager {
  const provider = new SupabaseAuthProvider();
  
  let storage: AuthStorage;
  
  if (storageInterface === 'web') {
    // Use web storage
    storage = {
      async getItem(key: string): Promise<string | null> {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(key);
      },
      async setItem(key: string, value: string): Promise<void> {
        if (typeof window === 'undefined') return;
        localStorage.setItem(key, value);
      },
      async removeItem(key: string): Promise<void> {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(key);
      },
      async clear(): Promise<void> {
        if (typeof window === 'undefined') return;
        localStorage.clear();
      },
    };
  } else {
    // Use mobile storage adapter
    storage = new MobileAuthStorageAdapter(storageInterface);
  }

  return new AuthManager(provider, storage, platform);
}