import type {
  User,
  Expense,
  ExpenseFormData,
  ReceiptData,
  VoiceData,
  Budget,
  BudgetSuggestion,
  ForecastData,
  Group,
  GroupExpense,
  BillReminder,
  DashboardStats,
  SpendingByCategory,
  SpendingOverTime,
  ApiResponse,
  PaginatedResponse,
} from '@/types/models';

// Configure your Django backend URL here
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Auth token management
let authToken: string | null = localStorage.getItem('auth_token');

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
};

export const getAuthToken = () => authToken;

// HTTP client with auth headers
const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    setAuthToken(null);
    window.location.href = '/login';
  }

  return response;
};

// ============================================
// AUTHENTICATION API
// ============================================

export const authApi = {
  login: async (email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await fetchWithAuth('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  register: async (name: string, email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await fetchWithAuth('/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    return response.json();
  },

  logout: async (): Promise<ApiResponse<null>> => {
    const response = await fetchWithAuth('/logout', { method: 'POST' });
    setAuthToken(null);
    return response.json();
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await fetchWithAuth('/profile');
    return response.json();
  },

  updateProfile: async (data: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await fetchWithAuth('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },
};

// ============================================
// EXPENSES API
// ============================================

export const expenseApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    category?: string;
    search?: string;
  }): Promise<ApiResponse<PaginatedResponse<Expense>>> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, String(value));
      });
    }
    const response = await fetchWithAuth(`/expenses?${queryParams}`);
    return response.json();
  },

  getById: async (id: string): Promise<ApiResponse<Expense>> => {
    const response = await fetchWithAuth(`/expenses/${id}`);
    return response.json();
  },

  create: async (data: ExpenseFormData): Promise<ApiResponse<Expense>> => {
    const response = await fetchWithAuth('/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  update: async (id: string, data: Partial<ExpenseFormData>): Promise<ApiResponse<Expense>> => {
    const response = await fetchWithAuth(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await fetchWithAuth(`/expenses/${id}`, { method: 'DELETE' });
    return response.json();
  },

  // Export expenses as CSV
  export: async (startDate?: string, endDate?: string): Promise<Blob> => {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    const response = await fetchWithAuth(`/expenses/export?${queryParams}`);
    return response.blob();
  },
};

// ============================================
// AI FEATURES API
// ============================================

export const aiApi = {
  // OCR Receipt Processing
  processReceipt: async (imageFile: File): Promise<ApiResponse<ReceiptData>> => {
    const formData = new FormData();
    formData.append('receipt', imageFile);

    const response = await fetch(`${API_BASE_URL}/receipt`, {
      method: 'POST',
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      body: formData,
    });
    return response.json();
  },

  // Voice Processing
  processVoice: async (transcript: string): Promise<ApiResponse<VoiceData>> => {
    const response = await fetchWithAuth('/voice', {
      method: 'POST',
      body: JSON.stringify({ transcript }),
    });
    return response.json();
  },

  // Get categorization for expense
  categorize: async (description: string, amount: number): Promise<ApiResponse<{
    category: string;
    confidence: number;
  }>> => {
    const response = await fetchWithAuth('/categorize', {
      method: 'POST',
      body: JSON.stringify({ description, amount }),
    });
    return response.json();
  },

  // Budget Suggestions
  getBudgetSuggestions: async (): Promise<ApiResponse<BudgetSuggestion[]>> => {
    const response = await fetchWithAuth('/budget');
    return response.json();
  },

  // Spending Forecast
  getForecast: async (months?: number): Promise<ApiResponse<ForecastData[]>> => {
    const queryParams = months ? `?months=${months}` : '';
    const response = await fetchWithAuth(`/forecast${queryParams}`);
    return response.json();
  },
};

// ============================================
// GROUPS API
// ============================================

export const groupApi = {
  getAll: async (): Promise<ApiResponse<Group[]>> => {
    const response = await fetchWithAuth('/groups');
    return response.json();
  },

  getById: async (id: string): Promise<ApiResponse<Group>> => {
    const response = await fetchWithAuth(`/groups/${id}`);
    return response.json();
  },

  create: async (data: { name: string; description?: string }): Promise<ApiResponse<Group>> => {
    const response = await fetchWithAuth('/groups', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  addMember: async (groupId: string, email: string): Promise<ApiResponse<Group>> => {
    const response = await fetchWithAuth(`/groups/${groupId}/members`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return response.json();
  },

  removeMember: async (groupId: string, userId: string): Promise<ApiResponse<Group>> => {
    const response = await fetchWithAuth(`/groups/${groupId}/members/${userId}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  getExpenses: async (groupId: string): Promise<ApiResponse<GroupExpense[]>> => {
    const response = await fetchWithAuth(`/groups/${groupId}/expenses`);
    return response.json();
  },

  addExpense: async (groupId: string, data: Omit<GroupExpense, 'id' | 'groupId' | 'createdAt'>): Promise<ApiResponse<GroupExpense>> => {
    const response = await fetchWithAuth(`/groups/${groupId}/expenses`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  settleBalance: async (groupId: string, userId: string): Promise<ApiResponse<null>> => {
    const response = await fetchWithAuth(`/groups/${groupId}/settle/${userId}`, {
      method: 'POST',
    });
    return response.json();
  },
};

// ============================================
// BILL REMINDERS API
// ============================================

export const reminderApi = {
  getAll: async (): Promise<ApiResponse<BillReminder[]>> => {
    const response = await fetchWithAuth('/reminders');
    return response.json();
  },

  create: async (data: Omit<BillReminder, 'id' | 'userId' | 'createdAt'>): Promise<ApiResponse<BillReminder>> => {
    const response = await fetchWithAuth('/reminders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  update: async (id: string, data: Partial<BillReminder>): Promise<ApiResponse<BillReminder>> => {
    const response = await fetchWithAuth(`/reminders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await fetchWithAuth(`/reminders/${id}`, { method: 'DELETE' });
    return response.json();
  },

  markPaid: async (id: string): Promise<ApiResponse<BillReminder>> => {
    const response = await fetchWithAuth(`/reminders/${id}/paid`, { method: 'POST' });
    return response.json();
  },
};

// ============================================
// DASHBOARD API
// ============================================

export const dashboardApi = {
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const response = await fetchWithAuth('/dashboard/stats');
    return response.json();
  },

  getSpendingByCategory: async (month?: string): Promise<ApiResponse<SpendingByCategory[]>> => {
    const queryParams = month ? `?month=${month}` : '';
    const response = await fetchWithAuth(`/dashboard/by-category${queryParams}`);
    return response.json();
  },

  getSpendingOverTime: async (period: 'week' | 'month' | 'year' = 'month'): Promise<ApiResponse<SpendingOverTime[]>> => {
    const response = await fetchWithAuth(`/dashboard/over-time?period=${period}`);
    return response.json();
  },

  getRecentExpenses: async (limit: number = 10): Promise<ApiResponse<Expense[]>> => {
    const response = await fetchWithAuth(`/dashboard/recent?limit=${limit}`);
    return response.json();
  },
};
