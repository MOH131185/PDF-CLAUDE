import { APIResponse, Operation, User, Subscription, PDFFile } from '../types';
import { API_CONFIG } from '../constants';
import { retry } from '../utils';

export interface APIClient {
  get<T>(endpoint: string, params?: Record<string, any>): Promise<APIResponse<T>>;
  post<T>(endpoint: string, data?: any): Promise<APIResponse<T>>;
  put<T>(endpoint: string, data?: any): Promise<APIResponse<T>>;
  delete<T>(endpoint: string): Promise<APIResponse<T>>;
  upload<T>(endpoint: string, files: PDFFile[], data?: any): Promise<APIResponse<T>>;
}

export class BaseAPIClient implements APIClient {
  private baseURL: string;
  private timeout: number;
  private getAccessToken: () => Promise<string | null>;

  constructor(
    baseURL: string = API_CONFIG.BASE_URL,
    getAccessToken: () => Promise<string | null>
  ) {
    this.baseURL = baseURL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.getAccessToken = getAccessToken;
  }

  private async createHeaders(includeAuth: boolean = true): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = await this.getAccessToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit
  ): Promise<APIResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await retry(async () => {
        const res = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        return res;
      }, API_CONFIG.RETRY_ATTEMPTS);

      clearTimeout(timeoutId);

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Request failed',
      };
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<APIResponse<T>> {
    const url = new URL(`${this.baseURL}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return this.makeRequest(url.pathname + url.search, {
      method: 'GET',
      headers: await this.createHeaders(),
    });
  }

  async post<T>(endpoint: string, data?: any): Promise<APIResponse<T>> {
    return this.makeRequest(endpoint, {
      method: 'POST',
      headers: await this.createHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<APIResponse<T>> {
    return this.makeRequest(endpoint, {
      method: 'PUT',
      headers: await this.createHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<APIResponse<T>> {
    return this.makeRequest(endpoint, {
      method: 'DELETE',
      headers: await this.createHeaders(),
    });
  }

  async upload<T>(endpoint: string, files: PDFFile[], data?: any): Promise<APIResponse<T>> {
    const formData = new FormData();
    
    // Add files to form data
    files.forEach((file, index) => {
      if (file.buffer) {
        // Web environment - file.buffer is a File object
        formData.append('files', file.buffer, file.name);
      } else if (file.uri) {
        // Mobile environment - file.uri is the file URI
        // This will need platform-specific handling
        formData.append('files', {
          uri: file.uri,
          name: file.name,
          type: file.type,
        } as any);
      }
    });

    // Add additional data
    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    const headers = await this.createHeaders();
    delete (headers as any)['Content-Type']; // Let browser set content-type for FormData

    return this.makeRequest(endpoint, {
      method: 'POST',
      headers,
      body: formData,
    });
  }
}

// PDF Operations API
export class PDFOperationsAPI {
  constructor(private client: APIClient) {}

  async mergePDFs(files: PDFFile[]): Promise<APIResponse<{ downloadUrl: string }>> {
    return this.client.upload('/api/operations', files, { operation: 'merge' });
  }

  async splitPDF(file: PDFFile, pages: number[] | string): Promise<APIResponse<{ downloadUrl: string }>> {
    return this.client.upload('/api/operations', [file], { 
      operation: 'split', 
      pages: typeof pages === 'string' ? pages : pages.join(',')
    });
  }

  async compressPDF(file: PDFFile): Promise<APIResponse<{ downloadUrl: string }>> {
    return this.client.upload('/api/operations', [file], { operation: 'compress' });
  }

  async getOperations(limit: number = 10): Promise<APIResponse<Operation[]>> {
    return this.client.get('/api/operations', { limit });
  }

  async getOperation(id: string): Promise<APIResponse<Operation>> {
    return this.client.get(`/api/operations/${id}`);
  }
}

// User API
export class UserAPI {
  constructor(private client: APIClient) {}

  async getProfile(): Promise<APIResponse<User>> {
    return this.client.get('/api/user/profile');
  }

  async updateProfile(data: Partial<User>): Promise<APIResponse<User>> {
    return this.client.put('/api/user/profile', data);
  }

  async getSubscription(): Promise<APIResponse<Subscription>> {
    return this.client.get('/api/user/subscription');
  }

  async getRemainingOperations(): Promise<APIResponse<{ remaining: number; isProUser: boolean }>> {
    return this.client.get('/api/user/operations/remaining');
  }
}

// Payment API
export class PaymentAPI {
  constructor(private client: APIClient) {}

  async createCheckoutSession(priceId: string): Promise<APIResponse<{ checkoutUrl: string }>> {
    return this.client.post('/api/create-checkout-session', { priceId });
  }

  async createPortalSession(): Promise<APIResponse<{ portalUrl: string }>> {
    return this.client.post('/api/create-portal-session');
  }

  async getPlans(): Promise<APIResponse<any[]>> {
    return this.client.get('/api/plans');
  }
}

// Main API class that combines all services
export class PDFToolsAPI {
  public operations: PDFOperationsAPI;
  public user: UserAPI;
  public payment: PaymentAPI;

  constructor(
    baseURL: string = API_CONFIG.BASE_URL,
    getAccessToken: () => Promise<string | null>
  ) {
    const client = new BaseAPIClient(baseURL, getAccessToken);
    
    this.operations = new PDFOperationsAPI(client);
    this.user = new UserAPI(client);
    this.payment = new PaymentAPI(client);
  }
}

// Factory function to create API instance
export function createAPIClient(getAccessToken: () => Promise<string | null>): PDFToolsAPI {
  return new PDFToolsAPI(API_CONFIG.BASE_URL, getAccessToken);
}