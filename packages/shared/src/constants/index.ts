// App configuration constants
export const APP_CONFIG = {
  NAME: 'PDF Tools',
  VERSION: '1.0.0',
  DESCRIPTION: 'Professional PDF tools for merging, splitting, and compressing PDF files',
  WEBSITE_URL: 'https://www.pdftools.com',
  SUPPORT_EMAIL: 'support@pdftools.com',
} as const;

// API configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.pdftools.com',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
} as const;

// File processing limits
export const FILE_LIMITS = {
  MAX_SIZE_FREE: 10 * 1024 * 1024, // 10MB for free users
  MAX_SIZE_PRO: 50 * 1024 * 1024,  // 50MB for pro users
  MAX_FILES_PER_OPERATION: 10,
  MAX_PAGES_PER_SPLIT: 1000,
} as const;

// Subscription plans
export const SUBSCRIPTION_PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    daily_operations: 5,
    max_file_size: FILE_LIMITS.MAX_SIZE_FREE,
    features: [
      'Basic PDF operations',
      'Up to 5 operations per day',
      'Files up to 10MB',
      'Basic support',
    ],
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    price: 19,
    daily_operations: -1, // unlimited
    max_file_size: FILE_LIMITS.MAX_SIZE_PRO,
    features: [
      'Unlimited operations',
      'Files up to 50MB',
      'Priority support',
      'Advanced features',
      'API access',
    ],
  },
} as const;

// App Store URLs
export const APP_STORE_URLS = {
  IOS: 'https://apps.apple.com/app/pdf-tools/id123456789',
  ANDROID: 'https://play.google.com/store/apps/details?id=com.pdftools.app',
  WEB: 'https://www.pdftools.com',
} as const;

// QR Code configuration
export const QR_CODE_CONFIG = {
  SIZE: 200,
  ERROR_CORRECTION_LEVEL: 'M' as const,
  MARGIN: 4,
  COLOR_DARK: '#000000',
  COLOR_LIGHT: '#FFFFFF',
} as const;

// Error codes
export const ERROR_CODES = {
  // Authentication errors
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  AUTH_INVALID: 'AUTH_INVALID',
  AUTH_EXPIRED: 'AUTH_EXPIRED',
  
  // File errors
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  FILE_INVALID_TYPE: 'FILE_INVALID_TYPE',
  FILE_CORRUPTED: 'FILE_CORRUPTED',
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  
  // Operation errors
  OPERATION_FAILED: 'OPERATION_FAILED',
  OPERATION_TIMEOUT: 'OPERATION_TIMEOUT',
  OPERATION_CANCELED: 'OPERATION_CANCELED',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  DAILY_LIMIT_EXCEEDED: 'DAILY_LIMIT_EXCEEDED',
  
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  
  // Payment errors
  PAYMENT_REQUIRED: 'PAYMENT_REQUIRED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
} as const;

// Platform-specific constants
export const PLATFORM_CONFIG = {
  WEB: {
    support_drag_drop: true,
    support_clipboard: true,
    support_file_picker: true,
  },
  MOBILE: {
    support_camera: true,
    support_gallery: true,
    support_document_picker: true,
    support_share: true,
  },
} as const;

// Analytics events
export const ANALYTICS_EVENTS = {
  // User actions
  USER_SIGNED_UP: 'user_signed_up',
  USER_SIGNED_IN: 'user_signed_in',
  USER_UPGRADED: 'user_upgraded',
  
  // PDF operations
  PDF_MERGE_STARTED: 'pdf_merge_started',
  PDF_MERGE_COMPLETED: 'pdf_merge_completed',
  PDF_SPLIT_STARTED: 'pdf_split_started',
  PDF_SPLIT_COMPLETED: 'pdf_split_completed',
  PDF_COMPRESS_STARTED: 'pdf_compress_started',
  PDF_COMPRESS_COMPLETED: 'pdf_compress_completed',
  
  // App downloads
  QR_CODE_SCANNED: 'qr_code_scanned',
  APP_DOWNLOADED: 'app_downloaded',
  
  // Errors
  OPERATION_FAILED: 'operation_failed',
  PAYMENT_FAILED: 'payment_failed',
} as const;

export type AnalyticsEvent = keyof typeof ANALYTICS_EVENTS;

// Supabase Configuration
export const SUPABASE_CONFIG = {
  URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co',
  ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key',
} as const;

// Development/Production environment detection
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';