import { NextRequest, NextResponse } from 'next/server';

// Rate limiting configuration
interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (req: NextRequest) => string; // Function to generate unique keys
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
  handler?: (req: NextRequest) => NextResponse; // Custom response when limit is exceeded
}

// Rate limit store (in-memory for simplicity, use Redis in production)
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

// Default key generator (uses IP address)
const defaultKeyGenerator = (req: NextRequest): string => {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded 
    ? forwarded.split(',')[0].trim() 
    : req.headers.get('x-real-ip') || 
      'unknown';
  return ip;
};

// Default rate limit exceeded handler
const defaultHandler = (_req: NextRequest): NextResponse => {
  return NextResponse.json(
    { 
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil(60), // 1 minute
    },
    { 
      status: 429,
      headers: {
        'Retry-After': '60',
        'X-RateLimit-Limit': '10',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': Math.ceil(Date.now() / 1000 + 60).toString(),
      }
    }
  );
};

// Rate limiting middleware
export function rateLimit(config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    keyGenerator = defaultKeyGenerator,
    handler = defaultHandler,
  } = config;

  return {
    check: (req: NextRequest): { allowed: boolean; response?: NextResponse } => {
      const key = keyGenerator(req);
      const now = Date.now();
      
      // Get or create rate limit entry
      let entry = rateLimitStore.get(key);
      
      if (!entry || entry.resetTime < now) {
        // Create new entry or reset expired entry
        entry = {
          count: 0,
          resetTime: now + windowMs,
        };
        rateLimitStore.set(key, entry);
      }

      // Check if limit is exceeded
      if (entry.count >= maxRequests) {
        return {
          allowed: false,
          response: handler(req),
        };
      }

      // Increment counter
      entry.count++;
      rateLimitStore.set(key, entry);

      return { allowed: true };
    },

    // Get rate limit info for response headers
    getHeaders: (req: NextRequest) => {
      const key = keyGenerator(req);
      const entry = rateLimitStore.get(key);
      
      if (!entry) {
        return {
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': maxRequests.toString(),
          'X-RateLimit-Reset': Math.ceil((Date.now() + windowMs) / 1000).toString(),
        };
      }

      return {
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': Math.max(0, maxRequests - entry.count).toString(),
        'X-RateLimit-Reset': Math.ceil(entry.resetTime / 1000).toString(),
      };
    }
  };
}

// Predefined rate limiters for different scenarios
export const rateLimiters = {
  // Strict rate limiting for sensitive operations
  strict: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 requests per 15 minutes
  }),

  // Moderate rate limiting for API endpoints
  moderate: rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    maxRequests: 20, // 20 requests per 10 minutes
  }),

  // Lenient rate limiting for general endpoints
  lenient: rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 100, // 100 requests per 5 minutes
  }),

  // PDF operations rate limiter (per user)
  pdfOperations: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 operations per minute
    keyGenerator: (req: NextRequest) => {
      // Try to get user ID from headers/session, fall back to IP
      const userId = req.headers.get('x-user-id') || defaultKeyGenerator(req);
      return `pdf_${userId}`;
    },
    handler: (_req: NextRequest) => {
      return NextResponse.json(
        {
          error: 'PDF operation rate limit exceeded',
          message: 'You can perform up to 10 PDF operations per minute. Please wait before trying again.',
          retryAfter: 60,
        },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '0',
          }
        }
      );
    },
  }),

  // Authentication rate limiter
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 login attempts per 15 minutes
    keyGenerator: (req: NextRequest) => {
      const ip = defaultKeyGenerator(req);
      return `auth_${ip}`;
    },
    handler: (_req: NextRequest) => {
      return NextResponse.json(
        {
          error: 'Too many authentication attempts',
          message: 'Too many login attempts. Please try again in 15 minutes.',
          retryAfter: 900,
        },
        {
          status: 429,
          headers: {
            'Retry-After': '900',
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
          }
        }
      );
    },
  }),

  // Payment operations rate limiter
  payment: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 3, // 3 payment attempts per minute
    keyGenerator: (req: NextRequest) => {
      const userId = req.headers.get('x-user-id') || defaultKeyGenerator(req);
      return `payment_${userId}`;
    },
    handler: (_req: NextRequest) => {
      return NextResponse.json(
        {
          error: 'Payment rate limit exceeded',
          message: 'Too many payment attempts. Please wait before trying again.',
          retryAfter: 60,
        },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': '3',
            'X-RateLimit-Remaining': '0',
          }
        }
      );
    },
  }),
};

// Wrapper function to easily add rate limiting to API routes
export function withRateLimit(
  rateLimiter: ReturnType<typeof rateLimit>,
  handler: (req: NextRequest) => Promise<NextResponse> | NextResponse
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    // Check rate limit
    const { allowed, response: rateLimitResponse } = rateLimiter.check(req);
    
    if (!allowed && rateLimitResponse) {
      return rateLimitResponse;
    }

    try {
      // Execute the original handler
      const response = await handler(req);
      
      // Add rate limit headers to successful responses
      const rateLimitHeaders = rateLimiter.getHeaders(req);
      Object.entries(rateLimitHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;
    } catch {
      // Add rate limit headers to error responses too
      const rateLimitHeaders = rateLimiter.getHeaders(req);
      const errorResponse = NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
      
      Object.entries(rateLimitHeaders).forEach(([key, value]) => {
        errorResponse.headers.set(key, value);
      });

      return errorResponse;
    }
  };
}

export default rateLimit;