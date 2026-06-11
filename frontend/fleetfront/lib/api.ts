

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3005/api';

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;

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
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(user?.email ? { 'x-admin-email': user.email } : {}),
      ...(options.headers as Record<string, string> || {}),
    };

    const fetchOptions: RequestInit = {
      ...options,
      headers,
      cache: 'no-store', // Disable caching for all authenticated API calls
    };

    const response = await fetch(url, fetchOptions);

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


export const staffAPI = {

  getAll: async () => {
    return fetchAPI<any[]>('/staff');
  },

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


  login: async (email: string, password: string) => {
    return fetchAPI<any>('/staff/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  getHistory: async (staffId: string) => {
    return fetchAPI<any>(`/staff/${staffId}/history`);
  },

  updateStaff: async (staffId: string, data: any) => {
    return fetchAPI<any>(`/staff/${staffId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  toggleStatus: async (staffId: string) => {
    return fetchAPI<any>(`/staff/${staffId}/status`, {
      method: 'PATCH',
    });
  },

  deleteStaff: async (staffId: string) => {
    return fetchAPI<any>(`/staff/${staffId}`, {
      method: 'DELETE',
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
    purchasePrice?: number;
    purchaseDate?: string;
    residualValue?: number;
    insuranceCost?: number;
    loanAmount?: number;
    monthlyEmi?: number;
    expectedLifeYears?: number;
  }) => {
    return fetchAPI<any>('/fleet/register', {
      method: 'POST',
      body: JSON.stringify(vehicleData),
    });
  },

  getHistory: async (vehicleId: string) => {
    return fetchAPI<any>(`/fleet/${vehicleId}/history`);
  },
};


export const authAPI = {

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
   * Google Login
   */
  googleLogin: async (idToken: string) => {
    return fetchAPI<any>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
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

  /**
   * Get all users
   */
  getUsers: async () => {
    return fetchAPI<any[]>('/auth/users');
  },

  me: async () => {
    return fetchAPI<any>('/auth/me');
  },

  updateProfile: async (data: { businessName?: string; newPassword?: string }) => {
    return fetchAPI<any>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};


export const financeAPI = {
  // Transaction Audit Trail
  getSummary: async (filters?: { category?: string; type?: string }) => {
    let url = '/finance/summary';
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.type) params.append('type', filters.type);
    const qs = params.toString();
    if (qs) url += `?${qs}`;
    return fetchAPI<any>(url);
  },
  addTransaction: async (data: { amount: number; type: string; category: string; description?: string }) =>
    fetchAPI<any>('/finance/record', { method: 'POST', body: JSON.stringify(data) }),
  updateTransaction: async (id: string, data: { amount?: number; category?: string; description?: string }) =>
    fetchAPI<any>(`/finance/transactions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTransaction: async (id: string) =>
    fetchAPI<any>(`/finance/transactions/${id}`, { method: 'DELETE' }),

  // Dashboard
  getDashboard: async () => fetchAPI<any>('/finance/dashboard'),

  // Customers
  getCustomers: async () => fetchAPI<any[]>('/finance/customers'),
  getCustomerById: async (id: string) => fetchAPI<any>(`/finance/customers/${id}`),
  createCustomer: async (data: { name: string; email?: string; phone?: string; customerType: string }) =>
    fetchAPI<any>('/finance/customers', { method: 'POST', body: JSON.stringify(data) }),
  updateCustomer: async (id: string, data: any) =>
    fetchAPI<any>(`/finance/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCustomer: async (id: string) =>
    fetchAPI<any>(`/finance/customers/${id}`, { method: 'DELETE' }),

  // Invoices
  getInvoices: async (filters?: { status?: string; customerId?: string }) => {
    let url = '/finance/invoices';
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.customerId) params.append('customerId', filters.customerId);
    const qs = params.toString();
    if (qs) url += `?${qs}`;
    return fetchAPI<any[]>(url);
  },
  getInvoiceById: async (id: string) => fetchAPI<any>(`/finance/invoices/${id}`),
  createInvoice: async (data: { customerId: string; tripId?: string; subtotal: number; tax: number; discount?: number; total?: number; dueDate: string }) =>
    fetchAPI<any>('/finance/invoices', { method: 'POST', body: JSON.stringify(data) }),
  updateInvoice: async (id: string, data: any) =>
    fetchAPI<any>(`/finance/invoices/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteInvoice: async (id: string) =>
    fetchAPI<any>(`/finance/invoices/${id}`, { method: 'DELETE' }),

  // Payments
  getPayments: async () => fetchAPI<any[]>('/finance/payments'),
  recordPayment: async (data: { invoiceId: string; amount: number; method: string; status: string }) =>
    fetchAPI<any>('/finance/payments', { method: 'POST', body: JSON.stringify(data) }),

  // Expenses
  getExpenses: async (filters?: { category?: string; vehicleId?: string; driverId?: string; tripId?: string }) => {
    let url = '/finance/expenses';
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.vehicleId) params.append('vehicleId', filters.vehicleId);
    if (filters?.driverId) params.append('driverId', filters.driverId);
    if (filters?.tripId) params.append('tripId', filters.tripId);
    const qs = params.toString();
    if (qs) url += `?${qs}`;
    return fetchAPI<any[]>(url);
  },
  getExpenseById: async (id: string) => fetchAPI<any>(`/finance/expenses/${id}`),
  createExpense: async (data: { vehicleId?: string; driverId?: string; tripId?: string; category: string; amount: number; vendor?: string; notes?: string; expenseDate?: string }) =>
    fetchAPI<any>('/finance/expenses', { method: 'POST', body: JSON.stringify(data) }),
  updateExpense: async (id: string, data: any) =>
    fetchAPI<any>(`/finance/expenses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteExpense: async (id: string) =>
    fetchAPI<any>(`/finance/expenses/${id}`, { method: 'DELETE' }),

  // Fuel Logs
  getFuelLogs: async (filters?: { vehicleId?: string; tripId?: string }) => {
    let url = '/finance/fuel-logs';
    const params = new URLSearchParams();
    if (filters?.vehicleId) params.append('vehicleId', filters.vehicleId);
    if (filters?.tripId) params.append('tripId', filters.tripId);
    const qs = params.toString();
    if (qs) url += `?${qs}`;
    return fetchAPI<any[]>(url);
  },
  getFuelLogById: async (id: string) => fetchAPI<any>(`/finance/fuel-logs/${id}`),
  createFuelLog: async (data: { vehicleId: string; tripId?: string; liters: number; cost: number; odometer: number }) =>
    fetchAPI<any>('/finance/fuel-logs', { method: 'POST', body: JSON.stringify(data) }),

  // Maintenance Logs
  getMaintenanceLogs: async (vehicleId: string) =>
    fetchAPI<any[]>(`/finance/maintenance?vehicleId=${vehicleId}`),
  getMaintenanceLogById: async (id: string) => fetchAPI<any>(`/finance/maintenance/${id}`),
  createMaintenanceLog: async (data: { vehicleId: string; maintenanceType: string; cost: number; vendor?: string; notes?: string; nextDue?: string }) =>
    fetchAPI<any>('/finance/maintenance', { method: 'POST', body: JSON.stringify(data) }),

  // Payroll
  getPayrolls: async (filters?: { driverId?: string; month?: string }) => {
    let url = '/finance/payroll';
    const params = new URLSearchParams();
    if (filters?.driverId) params.append('driverId', filters.driverId);
    if (filters?.month) params.append('month', filters.month);
    const qs = params.toString();
    if (qs) url += `?${qs}`;
    return fetchAPI<any[]>(url);
  },
  getPayrollById: async (id: string) => fetchAPI<any>(`/finance/payroll/${id}`),
  createPayroll: async (data: { driverId: string; month: string; baseSalary: number; bonus?: number; deductions?: number; netPay?: number }) =>
    fetchAPI<any>('/finance/payroll', { method: 'POST', body: JSON.stringify(data) }),
  updatePayroll: async (id: string, data: any) =>
    fetchAPI<any>(`/finance/payroll/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Receivables
  getReceivables: async (filters?: { status?: string }) => {
    let url = '/finance/receivables';
    if (filters?.status) url += `?status=${filters.status}`;
    return fetchAPI<any[]>(url);
  },
  updateReceivable: async (id: string, data: any) =>
    fetchAPI<any>(`/finance/receivables/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Payables
  getPayables: async (filters?: { status?: string }) => {
    let url = '/finance/payables';
    if (filters?.status) url += `?status=${filters.status}`;
    return fetchAPI<any[]>(url);
  },
  createPayable: async (data: { vendor: string; amount: number; dueDate: string; status?: string }) =>
    fetchAPI<any>('/finance/payables', { method: 'POST', body: JSON.stringify(data) }),
  updatePayable: async (id: string, data: any) =>
    fetchAPI<any>(`/finance/payables/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};

export const transitAPI = {

  getRoutes: async () => fetchAPI<any[]>('/transit/routes'),

  getRouteById: async (routeId: string) =>
    fetchAPI<any>(`/transit/routes/${routeId}`),

  createRoute: async (name: string) =>
    fetchAPI<any>('/transit/routes', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),

  deleteRoute: async (routeId: string) =>
    fetchAPI<any>(`/transit/routes/${routeId}`, { method: 'DELETE' }),


  getStops: async () => fetchAPI<any[]>('/transit/stops'),

  createStop: async (data: { name: string; latitude: number; longitude: number }) =>
    fetchAPI<any>('/transit/stops', {
      method: 'POST',
      body: JSON.stringify(data),
    }),


  addStopToRoute: async (routeId: string, stopId: string, sequence: number) =>
    fetchAPI<any>(`/transit/routes/${routeId}/stops`, {
      method: 'POST',
      body: JSON.stringify({ stopId, sequence }),
    }),

  removeStopFromRoute: async (routeId: string, stopId: string) =>
    fetchAPI<any>(`/transit/routes/${routeId}/stops/${stopId}`, {
      method: 'DELETE',
    }),

  planRoute: async (data: {
    name: string;
    stops: { name: string; latitude: number; longitude: number }[];
  }) =>
    fetchAPI<any>('/transit/routes/plan', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};


export const tripAPI = {
  getAll: async () => fetchAPI<any[]>('/trips'),

  getById: async (tripId: string) => fetchAPI<any>(`/trips/${tripId}`),

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

  book: async (tripId: string, data: { userId: string; amount: number }) =>
    fetchAPI<any>(`/trips/${tripId}/book`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
};


export const analyticsAPI = {
  getReport: async (period: string = 'weekly', customStart?: string, customEnd?: string) => {
    let url = `/analytics/report?period=${period}`;
    if (customStart) url += `&customStart=${customStart}`;
    if (customEnd) url += `&customEnd=${customEnd}`;
    return fetchAPI<any>(url);
  }
};

export const aiAnalyticsAPI = {
  listSessions: async () => fetchAPI<any[]>('/ai-analytics/sessions'),
  createSession: async () => fetchAPI<any>('/ai-analytics/session', { method: 'POST' }),
  query: async (sessionId: string, message: string) =>
    fetchAPI<any>('/ai-analytics/query', {
      method: 'POST',
      body: JSON.stringify({ sessionId, message }),
    }),
  getHistory: async (sessionId: string) =>
    fetchAPI<any[]>(`/ai-analytics/session/${sessionId}/history`),
  deleteSession: async (sessionId: string) =>
    fetchAPI<any>(`/ai-analytics/session/${sessionId}`, { method: 'DELETE' }),
};


export const chatAPI = {
  query: async (message: string) => {
    const data = await fetch('https://fleet-os-2.onrender.com/api/chat', {
      method: 'POST',
      body: JSON.stringify({ query: message }),
    })
    return data
  }
};

