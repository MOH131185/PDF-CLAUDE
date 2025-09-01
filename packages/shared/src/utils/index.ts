import { Platform, PDFFile } from '../types';
import { FILE_LIMITS } from '../constants';

// File validation utilities
export function validateFileSize(file: PDFFile, isPro: boolean = false): {
  isValid: boolean;
  error?: string;
} {
  const maxSize = isPro ? FILE_LIMITS.MAX_SIZE_PRO : FILE_LIMITS.MAX_SIZE_FREE;
  
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size exceeds the ${isPro ? '50MB' : '10MB'} limit${isPro ? '' : '. Upgrade to Pro for larger files.'}`,
    };
  }
  
  return { isValid: true };
}

export function validateFileType(file: PDFFile): {
  isValid: boolean;
  error?: string;
} {
  if (!file.type.includes('pdf')) {
    return {
      isValid: false,
      error: 'Only PDF files are supported',
    };
  }
  
  return { isValid: true };
}

export function validateFileArray(files: PDFFile[], isPro: boolean = false): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (files.length === 0) {
    errors.push('Please select at least one file');
  }
  
  if (files.length > FILE_LIMITS.MAX_FILES_PER_OPERATION) {
    errors.push(`Maximum ${FILE_LIMITS.MAX_FILES_PER_OPERATION} files allowed per operation`);
  }
  
  files.forEach((file, index) => {
    const sizeValidation = validateFileSize(file, isPro);
    if (!sizeValidation.isValid) {
      errors.push(`File ${index + 1}: ${sizeValidation.error}`);
    }
    
    const typeValidation = validateFileType(file);
    if (!typeValidation.isValid) {
      errors.push(`File ${index + 1}: ${typeValidation.error}`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Format utilities
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

// URL utilities
export function getAppDownloadUrl(platform: Platform): string {
  switch (platform) {
    case 'ios':
      return 'https://apps.apple.com/app/pdf-tools/id123456789';
    case 'android':
      return 'https://play.google.com/store/apps/details?id=com.pdftools.app';
    default:
      return 'https://www.pdftools.com';
  }
}

export function generateQRCodeData(platform?: Platform): string {
  if (platform) {
    return getAppDownloadUrl(platform);
  }
  
  // Smart URL that detects platform and redirects accordingly
  return 'https://www.pdftools.com/download';
}

// Async utilities
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (attempt < maxAttempts) {
        await delay(delayMs * attempt); // Exponential backoff
      }
    }
  }
  
  throw lastError!;
}

// Platform detection utilities
export function getPlatform(): Platform {
  if (typeof window === 'undefined') {
    return 'web'; // SSR context
  }
  
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (/iphone|ipad|ipod/.test(userAgent)) {
    return 'ios';
  } else if (/android/.test(userAgent)) {
    return 'android';
  } else {
    return 'web';
  }
}

export function isMobile(): boolean {
  const platform = getPlatform();
  return platform === 'ios' || platform === 'android';
}

// Error utilities
export function createErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  } else if (typeof error === 'string') {
    return error;
  } else {
    return 'An unknown error occurred';
  }
}

// Deep clone utility
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }
  
  const clonedObj = {} as T;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clonedObj[key] = deepClone(obj[key]);
    }
  }
  
  return clonedObj;
}

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | number;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId as NodeJS.Timeout);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Throttle utility
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}