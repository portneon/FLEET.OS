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
export async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Read session from localStorage
    const organizationId = typeof window !== 'undefined'
      ? (localStorage.getItem('orgId') || '')
      : '';
    const token = typeof window !== 'undefined'
      ? (localStorage.getItem('token') || '')
      : '';
    const userStr = typeof window !== 'undefined'
      ? localStorage.getItem('user')
      : null;
    const user = userStr ? JSON.parse(userStr) : null;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(organizationId ? { 'x-organization-id': organizationId } : {}),
      ...(token          ? { 'Authorization': `Bearer ${token}` }   : {}),
      // RBAC middleware uses x-admin-email for admin-only routes
      ...(user?.email    ? { 'x-admin-email': user.email }          : {}),
      ...(options.headers as Record<string, string> || {}),
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return { error: errorData.error || `HTTP ${response.status}` };
    }

    const data = await response.json();
    return { data: data.data as T, message: data.message };
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    return { error: error instanceof Error ? error.message : 'Failed to fetch data' };
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


export const fleetAPI = {
 
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

/**
 * Finance API Methods
 */
export const financeAPI = {
  getSummary: async () => fetchAPI<any>('/finance/summary'),

  addTransaction: async (data: {
    amount: number;
    type: string;
    category: string;
    description?: string;
  }) =>
    fetchAPI<any>('/finance/record', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

/**
 * Transit API Methods (Routes &amp; Stops)
 */
export const transitAPI = {
  // Routes
  getRoutes: async () => fetchAPI<any[]>('/transit/routes'),

  createRoute: async (name: string) =>
    fetchAPI<any>('/transit/routes', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),

  deleteRoute: async (routeId: string) =>
    fetchAPI<any>(`/transit/routes/${routeId}`, { method: 'DELETE' }),

  // Stops
  getStops: async () => fetchAPI<any[]>('/transit/stops'),

  createStop: async (data: { name: string; latitude: number; longitude: number }) =>
    fetchAPI<any>('/transit/stops', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Link stop to route
  addStopToRoute: async (routeId: string, stopId: string, sequence: number) =>
    fetchAPI<any>(`/transit/routes/${routeId}/stops`, {
      method: 'POST',
      body: JSON.stringify({ stopId, sequence }),
    }),
};

/**
 * Trip / Dispatch API Methods
 */
export const tripAPI = {
  getAll: async () => fetchAPI<any[]>('/trips'),

  getActive: async () => fetchAPI<any[]>('/trips/active'),

  schedule: async (data: {
    routeId: string;
    vehicleId: string;
    driverId: string;
    scheduledStart: string;
  }) =>
    fetchAPI<any>('/trips', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  start: async (tripId: string) =>
    fetchAPI<any>(`/trips/${tripId}/start`, { method: 'PATCH' }),

  end: async (tripId: string) =>
    fetchAPI<any>(`/trips/${tripId}/end`, { method: 'PATCH' }),

  cancel: async (tripId: string) =>
    fetchAPI<any>(`/trips/${tripId}/cancel`, { method: 'PATCH' }),
};
