/**
 * Centralized API Client for FleetOS Frontend
 * Handles all communication with the backend API
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Get orgId from localStorage
    const organizationId = typeof window !== 'undefined' ? localStorage.getItem('orgId') : null;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(organizationId && { 'x-organization-id': organizationId }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return {
        error: errorData.error || `HTTP ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      data: data.data as T,
      message: data.message,
    };
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch data',
    };
  }
}

/**
 * Staff/Driver API Methods
 */
export const staffAPI = {
  /**
   * Get all staff members
   */
  getAll: async () => {
    return fetchAPI<any[]>('/staff');
  },

  /**
   * Register new staff member
   */
  register: async (staffData: {
    email: string;
    name: string;
    password: string;
    roleName: string;
    licenseNumber?: string;
    experience?: number;
  }) => {
    return fetchAPI<any>('/staff/register', {
      method: 'POST',
      body: JSON.stringify(staffData),
    });
  },

  /**
   * Login staff member
   */
  login: async (email: string, password: string) => {
    return fetchAPI<any>('/staff/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
};

/**
 * Fleet/Vehicle API Methods
 */
export const fleetAPI = {
  /**
   * Get all vehicles in the fleet
   */
  getAll: async () => {
    return fetchAPI<any[]>('/fleet');
  },

  /**
   * Register new vehicle
   */
  register: async (vehicleData: {
    vin: string;
    type: 'BUS' | 'TRUCK' | 'VAN';
    licensePlate: string;
    seatingCapacity?: number;
  }) => {
    return fetchAPI<any>('/fleet/register', {
      method: 'POST',
      body: JSON.stringify(vehicleData),
    });
  },
};

/**
 * User/Auth API Methods
 */
export const authAPI = {
  /**
   * Register new user
   */
  register: async (userData: {
    email: string;
    name: string;
    password: string;
  }) => {
    return fetchAPI<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  /**
   * Login user
   */
  login: async (email: string, password: string) => {
    return fetchAPI<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
};
