import { toast, ToastOptions } from 'react-hot-toast';

// Custom toast configurations
const defaultOptions: ToastOptions = {
  duration: 4000,
  position: 'top-right',
  style: {
    borderRadius: '8px',
    background: '#fff',
    color: '#374151',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e5e7eb',
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: '500',
  },
};

const successOptions: ToastOptions = {
  ...defaultOptions,
  duration: 3000,
  style: {
    ...defaultOptions.style,
    border: '1px solid #10b981',
    background: '#ecfdf5',
    color: '#047857',
  },
  iconTheme: {
    primary: '#10b981',
    secondary: '#ecfdf5',
  },
};

const errorOptions: ToastOptions = {
  ...defaultOptions,
  duration: 5000,
  style: {
    ...defaultOptions.style,
    border: '1px solid #ef4444',
    background: '#fef2f2',
    color: '#dc2626',
  },
  iconTheme: {
    primary: '#ef4444',
    secondary: '#fef2f2',
  },
};

const warningOptions: ToastOptions = {
  ...defaultOptions,
  duration: 4000,
  style: {
    ...defaultOptions.style,
    border: '1px solid #f59e0b',
    background: '#fffbeb',
    color: '#d97706',
  },
  iconTheme: {
    primary: '#f59e0b',
    secondary: '#fffbeb',
  },
};

const infoOptions: ToastOptions = {
  ...defaultOptions,
  duration: 3500,
  style: {
    ...defaultOptions.style,
    border: '1px solid #3b82f6',
    background: '#eff6ff',
    color: '#1d4ed8',
  },
  iconTheme: {
    primary: '#3b82f6',
    secondary: '#eff6ff',
  },
};

const loadingOptions: ToastOptions = {
  ...defaultOptions,
  duration: Infinity, // Loading toasts should be manually dismissed
  style: {
    ...defaultOptions.style,
    border: '1px solid #6b7280',
    background: '#f9fafb',
    color: '#374151',
  },
};

// Enhanced toast functions with better UX
export const showToast = {
  success: (message: string, options?: Partial<ToastOptions>) => {
    return toast.success(message, { ...successOptions, ...options });
  },

  error: (message: string, options?: Partial<ToastOptions>) => {
    return toast.error(message, { ...errorOptions, ...options });
  },

  warning: (message: string, options?: Partial<ToastOptions>) => {
    return toast(message, { 
      ...warningOptions, 
      icon: '⚠️',
      ...options 
    });
  },

  info: (message: string, options?: Partial<ToastOptions>) => {
    return toast(message, { 
      ...infoOptions, 
      icon: 'ℹ️',
      ...options 
    });
  },

  loading: (message: string, options?: Partial<ToastOptions>) => {
    return toast.loading(message, { ...loadingOptions, ...options });
  },

  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
    options?: {
      loading?: Partial<ToastOptions>;
      success?: Partial<ToastOptions>;
      error?: Partial<ToastOptions>;
    }
  ) => {
    return toast.promise(promise, messages, {
      loading: { ...loadingOptions, ...options?.loading },
      success: { ...successOptions, ...options?.success },
      error: { ...errorOptions, ...options?.error },
    });
  },

  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },

  // PDF-specific toasts
  pdf: {
    processing: (operation: string) => 
      showToast.loading(`Processing ${operation}...`, {
        style: { 
          ...loadingOptions.style, 
          maxWidth: '400px' 
        }
      }),

    success: (operation: string, fileCount?: number) => {
      const message = fileCount 
        ? `${operation} completed successfully! ${fileCount} file${fileCount > 1 ? 's' : ''} processed.`
        : `${operation} completed successfully!`;
      
      return showToast.success(message, {
        duration: 4000,
        style: { maxWidth: '400px' }
      });
    },

    error: (operation: string, error?: string) => {
      const message = error 
        ? `${operation} failed: ${error}`
        : `${operation} failed. Please try again.`;
      
      return showToast.error(message, {
        duration: 6000,
        style: { maxWidth: '400px' }
      });
    },

    limitReached: () => 
      showToast.warning('Daily operation limit reached. Upgrade to Pro for unlimited access!', {
        duration: 5000,
        style: { maxWidth: '400px' }
      }),

    fileTooLarge: (maxSize: string) => 
      showToast.error(`File too large. Maximum size allowed is ${maxSize}.`, {
        duration: 5000
      }),

    invalidFile: () => 
      showToast.error('Invalid PDF file. Please select a valid PDF document.', {
        duration: 4000
      }),

    uploadProgress: (progress: number) => 
      showToast.loading(`Uploading... ${progress}%`, {
        style: { maxWidth: '300px' }
      }),
  },

  // Auth-specific toasts
  auth: {
    signInSuccess: () => showToast.success('Successfully signed in!'),
    signOutSuccess: () => showToast.success('Successfully signed out!'),
    signUpSuccess: () => showToast.success('Account created! Please check your email to verify.', { duration: 6000 }),
    passwordReset: () => showToast.success('Password reset email sent!', { duration: 5000 }),
    unauthorized: () => showToast.error('Please sign in to continue.'),
    sessionExpired: () => showToast.warning('Your session has expired. Please sign in again.'),
  },

  // Subscription-specific toasts
  subscription: {
    upgradeSuccess: () => showToast.success('Welcome to Pro! Enjoy unlimited PDF operations.', { duration: 6000 }),
    cancelSuccess: () => showToast.success('Subscription canceled successfully.'),
    paymentFailed: () => showToast.error('Payment failed. Please update your payment method.', { duration: 6000 }),
    trialExpiring: (daysLeft: number) => 
      showToast.warning(`Your trial expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''}. Upgrade to continue.`, {
        duration: 8000
      }),
  }
};

// Batch operations for better UX
export const batchToast = {
  dismissAll: () => toast.dismiss(),
  
  dismissByType: (_type: 'success' | 'error' | 'loading') => {
    // This is a limitation of react-hot-toast - we can't filter by type
    // But we can implement a workaround by tracking toast IDs
    toast.dismiss();
  },
};

export default showToast;