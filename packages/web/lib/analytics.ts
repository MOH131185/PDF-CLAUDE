'use client';

// Analytics configuration and utilities
export interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

export interface ConversionEvent {
  event_name: string;
  currency?: string;
  value?: number;
  transaction_id?: string;
  custom_parameters?: Record<string, any>;
  items?: Array<{
    item_id: string;
    item_name: string;
    category: string;
    price: number;
    quantity: number;
  }>;
}

// Google Analytics 4 (gtag)
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'set' | 'js',
      targetIdOrDate: string | AnalyticsEvent['action'] | Date,
      config?: any
    ) => void;
    dataLayer: any[];
  }
}

class Analytics {
  private isEnabled: boolean;
  private gaId: string | undefined;
  private isDev: boolean;

  constructor() {
    this.isDev = process.env.NODE_ENV === 'development';
    this.gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    this.isEnabled = !!this.gaId && typeof window !== 'undefined' && !this.isDev;
  }

  // Initialize Google Analytics
  init() {
    if (!this.isEnabled || !this.gaId) return;

    // Load Google Analytics script
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.gaId}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(...args: any[]) {
      window.dataLayer.push(args);
    };

    window.gtag('js', new Date());
    window.gtag('config', this.gaId, {
      page_title: document.title,
      page_location: window.location.href,
    });

    // Track initial page view
    this.pageView(window.location.pathname);
  }

  // Track page views
  pageView(path: string) {
    if (!this.isEnabled) return;

    window.gtag('config', this.gaId!, {
      page_path: path,
      page_title: document.title,
      page_location: window.location.origin + path,
    });
  }

  // Track custom events
  event({ action, category, label, value, custom_parameters }: AnalyticsEvent) {
    if (!this.isEnabled) {
      if (this.isDev) {
        console.log('Analytics Event (Dev):', { action, category, label, value, custom_parameters });
      }
      return;
    }

    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
      ...custom_parameters,
    });
  }

  // Track conversions
  conversion({ event_name, currency = 'USD', value, transaction_id, custom_parameters, items }: ConversionEvent) {
    if (!this.isEnabled) {
      if (this.isDev) {
        console.log('Analytics Conversion (Dev):', { event_name, currency, value, transaction_id, items });
      }
      return;
    }

    window.gtag('event', event_name, {
      currency,
      value,
      transaction_id,
      items,
      ...custom_parameters,
    });
  }

  // PDF Tool specific tracking
  pdfTool = {
    // Track tool usage
    toolUsed: (toolName: string, fileCount: number, fileSize: number) => {
      this.event({
        action: 'tool_used',
        category: 'PDF Tools',
        label: toolName,
        value: fileCount,
        custom_parameters: {
          file_count: fileCount,
          file_size_mb: Math.round(fileSize / (1024 * 1024)),
          tool_name: toolName,
        }
      });
    },

    // Track successful operations
    operationSuccess: (toolName: string, processingTime: number) => {
      this.event({
        action: 'operation_success',
        category: 'PDF Tools',
        label: toolName,
        value: Math.round(processingTime),
        custom_parameters: {
          tool_name: toolName,
          processing_time_ms: processingTime,
        }
      });
    },

    // Track failed operations
    operationError: (toolName: string, errorType: string) => {
      this.event({
        action: 'operation_error',
        category: 'PDF Tools',
        label: `${toolName} - ${errorType}`,
        custom_parameters: {
          tool_name: toolName,
          error_type: errorType,
        }
      });
    },

    // Track file uploads
    fileUpload: (toolName: string, fileType: string, fileSize: number) => {
      this.event({
        action: 'file_upload',
        category: 'PDF Tools',
        label: toolName,
        custom_parameters: {
          tool_name: toolName,
          file_type: fileType,
          file_size_mb: Math.round(fileSize / (1024 * 1024)),
        }
      });
    },

    // Track downloads
    fileDownload: (toolName: string, outputSize: number) => {
      this.event({
        action: 'file_download',
        category: 'PDF Tools',
        label: toolName,
        custom_parameters: {
          tool_name: toolName,
          output_size_mb: Math.round(outputSize / (1024 * 1024)),
        }
      });
    },

    // Track usage limits hit
    limitReached: (planType: string, operationType: string) => {
      this.event({
        action: 'usage_limit_reached',
        category: 'User Engagement',
        label: `${planType} - ${operationType}`,
        custom_parameters: {
          plan_type: planType,
          operation_type: operationType,
        }
      });
    },
  };

  // User engagement tracking
  user = {
    // Track sign-ups
    signUp: (method: string) => {
      this.event({
        action: 'sign_up',
        category: 'User Engagement',
        label: method,
        custom_parameters: {
          signup_method: method,
        }
      });

      // Also track as conversion
      this.conversion({
        event_name: 'sign_up',
        custom_parameters: {
          method: method,
        }
      });
    },

    // Track sign-ins
    signIn: (method: string) => {
      this.event({
        action: 'login',
        category: 'User Engagement',
        label: method,
        custom_parameters: {
          login_method: method,
        }
      });
    },

    // Track plan upgrades
    planUpgrade: (fromPlan: string, toPlan: string, revenue: number) => {
      this.event({
        action: 'plan_upgrade',
        category: 'Conversion',
        label: `${fromPlan} to ${toPlan}`,
        value: revenue,
        custom_parameters: {
          from_plan: fromPlan,
          to_plan: toPlan,
          revenue: revenue,
        }
      });

      // Track as conversion
      this.conversion({
        event_name: 'purchase',
        currency: 'USD',
        value: revenue,
        transaction_id: `upgrade_${Date.now()}`,
        items: [{
          item_id: toPlan,
          item_name: `${toPlan} Plan`,
          category: 'Subscription',
          price: revenue,
          quantity: 1,
        }]
      });
    },

    // Track subscription cancellations
    subscriptionCancel: (plan: string, reason?: string) => {
      this.event({
        action: 'subscription_cancel',
        category: 'User Engagement',
        label: plan,
        custom_parameters: {
          plan: plan,
          cancellation_reason: reason,
        }
      });
    },
  };

  // Marketing and conversion tracking
  marketing = {
    // Track CTA clicks
    ctaClick: (ctaText: string, page: string) => {
      this.event({
        action: 'cta_click',
        category: 'Marketing',
        label: ctaText,
        custom_parameters: {
          cta_text: ctaText,
          page: page,
        }
      });
    },

    // Track pricing page views
    pricingView: (source?: string) => {
      this.event({
        action: 'pricing_page_view',
        category: 'Marketing',
        label: source || 'direct',
        custom_parameters: {
          traffic_source: source,
        }
      });
    },

    // Track feature usage by plan type
    featureUsage: (feature: string, planType: string) => {
      this.event({
        action: 'feature_usage',
        category: 'User Behavior',
        label: feature,
        custom_parameters: {
          feature: feature,
          plan_type: planType,
        }
      });
    },
  };

  // Mobile app tracking
  mobile = {
    // Track QR code scans
    qrCodeScanned: (platform: 'ios' | 'android') => {
      this.event({
        action: 'qr_code_scanned',
        category: 'Mobile App',
        label: platform,
        custom_parameters: {
          platform: platform,
          scan_source: 'website',
        }
      });
    },

    // Track app download clicks
    appDownloadClicked: (platform: 'ios' | 'android', source: 'qr_code' | 'direct_link') => {
      this.event({
        action: 'app_download_clicked',
        category: 'Mobile App',
        label: platform,
        custom_parameters: {
          platform: platform,
          download_source: source,
        }
      });

      // Track as conversion
      this.conversion({
        event_name: 'app_download_intent',
        custom_parameters: {
          platform: platform,
          source: source,
        }
      });
    },

    // Track platform switch
    platformSwitched: (from: 'web' | 'mobile', to: 'web' | 'mobile') => {
      this.event({
        action: 'platform_switch',
        category: 'User Behavior',
        label: `${from}_to_${to}`,
        custom_parameters: {
          from_platform: from,
          to_platform: to,
        }
      });
    },
  };

  // Error tracking
  error = {
    // Track JavaScript errors
    jsError: (error: Error, context?: string) => {
      this.event({
        action: 'javascript_error',
        category: 'Error',
        label: error.message,
        custom_parameters: {
          error_message: error.message,
          error_stack: error.stack,
          context: context,
          user_agent: navigator.userAgent,
        }
      });
    },

    // Track API errors
    apiError: (endpoint: string, statusCode: number, errorMessage: string) => {
      this.event({
        action: 'api_error',
        category: 'Error',
        label: `${endpoint} - ${statusCode}`,
        custom_parameters: {
          endpoint: endpoint,
          status_code: statusCode,
          error_message: errorMessage,
        }
      });
    },
  };
}

// Create singleton instance
const analytics = new Analytics();

// Auto-initialize if in browser
if (typeof window !== 'undefined') {
  // Initialize after a short delay to not block initial render
  setTimeout(() => analytics.init(), 100);
}

export default analytics;