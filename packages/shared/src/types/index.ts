import { z } from 'zod';

// User types
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  full_name: z.string().optional(),
  avatar_url: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type User = z.infer<typeof UserSchema>;

// Subscription types
export const SubscriptionStatusSchema = z.enum([
  'active',
  'canceled',
  'past_due',
  'unpaid',
  'trialing',
  'incomplete'
]);

export const SubscriptionSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  stripe_customer_id: z.string(),
  stripe_subscription_id: z.string().optional(),
  status: SubscriptionStatusSchema,
  plan_id: z.string(),
  current_period_start: z.string().optional(),
  current_period_end: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Subscription = z.infer<typeof SubscriptionSchema>;
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>;

// PDF Operation types
export const OperationTypeSchema = z.enum(['merge', 'split', 'compress']);
export const OperationStatusSchema = z.enum(['processing', 'completed', 'failed']);

export const OperationSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  type: OperationTypeSchema,
  filename: z.string(),
  file_size: z.number(),
  status: OperationStatusSchema,
  created_at: z.string(),
  completed_at: z.string().optional(),
  error_message: z.string().optional(),
  operation_date: z.string(),
});

export type Operation = z.infer<typeof OperationSchema>;
export type OperationType = z.infer<typeof OperationTypeSchema>;
export type OperationStatus = z.infer<typeof OperationStatusSchema>;

// PDF file types
export const PDFFileSchema = z.object({
  id: z.string(),
  name: z.string(),
  size: z.number(),
  type: z.string(),
  uri: z.string().optional(), // For mobile file URIs
  buffer: z.any().optional(), // For web File objects
});

export type PDFFile = z.infer<typeof PDFFileSchema>;

// API Response types
export const APIResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

export type APIResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

// Authentication types
export const AuthUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  full_name: z.string().optional(),
  avatar_url: z.string().optional(),
});

export type AuthUser = z.infer<typeof AuthUserSchema>;

export const AuthSessionSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_at: z.number(),
  user: AuthUserSchema,
});

export type AuthSession = z.infer<typeof AuthSessionSchema>;

// Platform-specific types
export type Platform = 'web' | 'ios' | 'android';

export interface DeviceInfo {
  platform: Platform;
  version: string;
  model?: string;
  os_version?: string;
}

// Configuration types
export interface AppConfig {
  api_url: string;
  supabase_url: string;
  supabase_anon_key: string;
  stripe_publishable_key: string;
  app_store_url?: string;
  play_store_url?: string;
}

// Error types
export class PDFToolsError extends Error {
  public code: string;
  public platform?: Platform;

  constructor(message: string, code: string, platform?: Platform) {
    super(message);
    this.name = 'PDFToolsError';
    this.code = code;
    this.platform = platform;
  }
}

// Constants
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_FILES_PER_OPERATION = 10;
export const SUPPORTED_FILE_TYPES = ['application/pdf'];
export const FREE_TIER_DAILY_LIMIT = 5;