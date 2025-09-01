import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AuthProvider, AuthResult } from '../index';
import { AuthUser, AuthSession } from '../../types';
import { SUPABASE_CONFIG } from '../../constants';

export class SupabaseAuthProvider implements AuthProvider {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      SUPABASE_CONFIG.URL,
      SUPABASE_CONFIG.ANON_KEY
    );
  }

  async signUp(email: string, password: string, userData?: { name?: string }): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData || {},
        },
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        user: data.user ? this.mapUser(data.user) : null,
        session: data.session ? this.mapSession(data.session) : null,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign up failed',
      };
    }
  }

  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        user: data.user ? this.mapUser(data.user) : null,
        session: data.session ? this.mapSession(data.session) : null,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign in failed',
      };
    }
  }

  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser();
      
      if (error || !user) {
        return null;
      }

      return this.mapUser(user);
    } catch {
      return null;
    }
  }

  async getCurrentSession(): Promise<AuthResult> {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession();
      
      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        user: session?.user ? this.mapUser(session.user) : null,
        session: session ? this.mapSession(session) : null,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get session',
      };
    }
  }

  async refreshSession(): Promise<AuthSession | null> {
    try {
      const { data, error } = await this.supabase.auth.refreshSession();
      
      if (error || !data.session) {
        return null;
      }

      return this.mapSession(data.session);
    } catch {
      return null;
    }
  }

  async resetPassword(email: string): Promise<AuthResult> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window?.location?.origin || ''}/reset-password`,
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send reset email',
      };
    }
  }

  private mapUser(user: any): AuthUser {
    return {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || user.email?.split('@')[0] || '',
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      emailVerified: user.email_confirmed_at ? true : false,
      metadata: user.user_metadata || {},
    };
  }

  private mapSession(session: any): AuthSession {
    return {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at,
      token_type: session.token_type,
      user: session.user ? this.mapUser(session.user) : undefined,
    };
  }
}