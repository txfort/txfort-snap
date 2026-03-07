/**
 * TxFort API Client
 * Handles all HTTP requests to the TxFort backend
 */

import type { 
  ApiConfig, 
  AuthResponse, 
  LoginRequest, 
  SignupRequest,
  ApiKeyResponse,
  AnalyzeRequest,
  TransactionAnalysis,
  ApiError 
} from '../types';

// Default configuration
const DEFAULT_CONFIG: ApiConfig = {
  baseUrl: 'http://localhost:3000',
  timeout: 30000,
};

let config: ApiConfig = { ...DEFAULT_CONFIG };

/**
 * Configure the API client
 */
export function configureApi(newConfig: Partial<ApiConfig>): void {
  config = { ...config, ...newConfig };
}

/**
 * Get the current API base URL
 */
export function getApiUrl(): string {
  return config.baseUrl;
}

/**
 * Make an HTTP request to the TxFort API
 */
async function request<T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: unknown;
    headers?: Record<string, string>;
    apiKey?: string;
  } = {}
): Promise<T> {
  const { method = 'GET', body, headers = {}, apiKey } = options;

  const url = `${config.baseUrl}${endpoint}`;
  
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (apiKey) {
    requestHeaders['X-API-Key'] = apiKey;
  }

  const fetchOptions: RequestInit = {
    method,
    headers: requestHeaders,
  };

  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      console.error('TxFort API: Response not OK');
      const errorData = await response.json().catch(() => ({})) as ApiError;
      throw {
        status: response.status,
        code: errorData.code || 'UNKNOWN_ERROR',
        message: errorData.message || `HTTP ${response.status}`,
      } as ApiError;
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return await response.json() as T;
  } catch (error) {
    console.error('TxFort API: Error caught:', error);
    // Re-throw API errors
    if ((error as ApiError).status) {
      throw error;
    }
    
    // Network or other errors
    throw {
      status: 0,
      code: 'NETWORK_ERROR',
      message: 'Failed to connect to TxFort API',
      details: String(error),
    } as ApiError;
  }
}

/**
 * Authentication API
 */
export const authApi = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: credentials,
    });
  },

  /**
   * Sign up a new user
   */
  async signup(data: SignupRequest): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: data,
    });
  },

  /**
   * Create a new API key
   */
  async createApiKey(token: string, name?: string): Promise<ApiKeyResponse> {
    return request<ApiKeyResponse>('/auth/api-keys', {
      method: 'POST',
      body: {
        name: name || 'MetaMask Snap',
        expires_in_days: 365, // 1 year expiration
      },
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  /**
   * Get user profile
   */
  async getProfile(token: string): Promise<{ id: string; email: string }> {
    return request('/user/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
};

/**
 * Analysis API
 */
export const analysisApi = {
  /**
   * Analyze a transaction
   */
  async analyze(apiKey: string, analyzeRequest: AnalyzeRequest): Promise<TransactionAnalysis> {
    return request<TransactionAnalysis>('/api/analyze', {
      method: 'POST',
      body: analyzeRequest,
      apiKey,
    });
  },
};

/**
 * Health check
 */
export async function healthCheck(): Promise<{ status: string }> {
  return request<{ status: string }>('/health');
}