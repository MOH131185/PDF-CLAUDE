import { AuthUser, AuthSession, Platform } from '../types';

export interface AuthProvider {
  signUp(email: string, password: string, userData?: any): Promise<AuthResult>;
  signIn(email: string, password: string): Promise<AuthResult>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<AuthUser | null>;
  getCurrentSession(): Promise<AuthResult>;
  refreshSession(): Promise<AuthSession | null>;
  resetPassword(email: string): Promise<AuthResult>;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser | null;
  session?: AuthSession | null;
  error?: string;
}

export interface AuthStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

export class AuthManager {
  private provider: AuthProvider;
  private storage: AuthStorage;
  private platform: Platform;

  constructor(provider: AuthProvider, storage: AuthStorage, platform: Platform) {
    this.provider = provider;
    this.storage = storage;
    this.platform = platform;
  }

  async signUp(email: string, password: string, userData?: any): Promise<AuthResult> {
    try {
      const result = await this.provider.signUp(email, password, userData);
      
      if (result.success && result.session) {
        await this.storeSession(result.session);
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        user: null,
        session: null,
        error: error instanceof Error ? error.message : 'Sign up failed',
      };
    }
  }

  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      const result = await this.provider.signIn(email, password);
      
      if (result.success && result.session) {
        await this.storeSession(result.session);
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        user: null,
        session: null,
        error: error instanceof Error ? error.message : 'Sign in failed',
      };
    }
  }

  async signOut(): Promise<void> {
    try {
      await this.provider.signOut();
      await this.clearSession();
    } catch (error) {
      // Still clear local session even if remote sign out fails
      await this.clearSession();
      throw error;
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      // First try to get user from the provider (which might validate the session)
      const user = await this.provider.getCurrentUser();
      
      if (!user) {
        // If no user from provider, clear local session
        await this.clearSession();
      }
      
      return user;
    } catch (error) {
      // If there's an error, clear local session and return null
      await this.clearSession();
      return null;
    }
  }

  async refreshSession(): Promise<AuthSession | null> {
    try {
      const session = await this.provider.refreshSession();
      
      if (session) {
        await this.storeSession(session);
      } else {
        await this.clearSession();
      }
      
      return session;
    } catch (error) {
      await this.clearSession();
      throw error;
    }
  }

  async getCurrentSession(): Promise<AuthResult> {
    try {
      return await this.provider.getCurrentSession();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get session',
      };
    }
  }

  async resetPassword(email: string): Promise<AuthResult> {
    return this.provider.resetPassword(email);
  }

  private async storeSession(session: AuthSession): Promise<void> {
    const sessionData = {
      ...session,
      stored_at: Date.now(),
      platform: this.platform,
    };
    
    await this.storage.setItem('auth_session', JSON.stringify(sessionData));
  }

  private async getStoredSession(): Promise<AuthSession | null> {
    try {
      const sessionData = await this.storage.getItem('auth_session');
      
      if (!sessionData) {
        return null;
      }
      
      const parsed = JSON.parse(sessionData);
      
      // Check if session is expired
      if (parsed.expires_at && parsed.expires_at < Date.now() / 1000) {
        await this.clearSession();
        return null;
      }
      
      return parsed;
    } catch (error) {
      await this.clearSession();
      return null;
    }
  }

  private async clearSession(): Promise<void> {
    await this.storage.removeItem('auth_session');
  }

  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }

  async getAccessToken(): Promise<string | null> {
    const session = await this.getStoredSession();
    return session?.access_token || null;
  }
}

// Platform-specific auth storage implementations
export class WebAuthStorage implements AuthStorage {
  async getItem(key: string): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, value);
  }

  async removeItem(key: string): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  }

  async clear(): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.clear();
  }
}

// Mobile auth storage will be implemented in the mobile package
export interface MobileAuthStorage extends AuthStorage {
  // Mobile-specific methods can be added here
}

// Auth utilities
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}