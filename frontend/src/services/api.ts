const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');

// Helper for authorization header
function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('nexus_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Universal fetch wrapper
async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    ...getAuthHeader(),
    ...(options.headers || {})
  };

  // If body is not FormData, set Content-Type JSON
  if (options.body && !(options.body instanceof FormData) && !(headers as any)['Content-Type']) {
    (headers as any)['Content-Type'] = 'application/json';
  }

  try {
    const res = await fetch(url, { ...options, headers });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `HTTP error ${res.status}`);
    }
    return data;
  } catch (err: any) {
    console.error(`API Error [${endpoint}]:`, err.message);
    throw err;
  }
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),

  register: (userData: { name: string; email: string; password: string; phone?: string; role?: string }) =>
    apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),

  demoLogin: (role: string, email?: string) =>
    apiRequest('/auth/demo-login', { method: 'POST', body: JSON.stringify({ role, email }) }),

  getMe: () => apiRequest('/auth/me'),

  getDemoAccounts: () => apiRequest('/auth/demo-accounts'),

  // Reports
  getReports: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/reports?${query}`);
  },

  getReportById: (id: string | number) => apiRequest(`/reports/${id}`),

  analyzePreview: (data: { title: string; description: string; category?: string; latitude?: number; longitude?: number }) =>
    apiRequest('/reports/analyze-preview', { method: 'POST', body: JSON.stringify(data) }),

  submitReport: (formData: FormData) =>
    apiRequest('/reports', { method: 'POST', body: formData }),

  getNearbyReports: (lat: number, lon: number, radius = 2000) =>
    apiRequest(`/reports/geo/nearby?lat=${lat}&lon=${lon}&radius=${radius}`),

  // Community Issues
  getIssues: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/issues?${query}`);
  },

  getIssueById: (id: string | number) => apiRequest(`/issues/${id}`),

  updateIssueStatus: (id: string | number, data: { status: string; notes?: string; resolutionNotes?: string; resolutionProofUrl?: string }) =>
    apiRequest(`/issues/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),

  assignIssue: (id: string | number, data: { departmentId?: number; assignedToUserId?: number | null; notes?: string }) =>
    apiRequest(`/issues/${id}/assign`, { method: 'PUT', body: JSON.stringify(data) }),

  addProgressUpdate: (id: string | number, formData: FormData) =>
    apiRequest(`/issues/${id}/updates`, { method: 'POST', body: formData }),

  verifyIssue: (id: string | number, formData: FormData) =>
    apiRequest(`/issues/${id}/verify`, { method: 'POST', body: formData }),

  mergeReports: (data: { targetIssueId: number; reportIds: number[] }) =>
    apiRequest('/issues/merge', { method: 'POST', body: JSON.stringify(data) }),

  // Departments
  getDepartments: () => apiRequest('/departments'),

  getMyCases: (tab = 'all') => apiRequest(`/departments/my-cases?tab=${tab}`),

  getDepartmentResolvers: (deptId: number | string) => apiRequest(`/departments/${deptId}/resolvers`),

  // Categories
  getCategories: () => apiRequest('/categories'),

  // Analytics
  getAnalyticsOverview: () => apiRequest('/analytics/overview'),

  getAnalyticsTrends: () => apiRequest('/analytics/trends'),

  getAnalyticsCategories: () => apiRequest('/analytics/categories'),

  getAnalyticsWorkload: () => apiRequest('/analytics/workload'),

  getAnalyticsHotspots: () => apiRequest('/analytics/hotspots'),

  getAiInsights: () => apiRequest('/analytics/ai-insights'),

  // Notifications
  getNotifications: () => apiRequest('/notifications'),

  markNotificationRead: (id: number | string) =>
    apiRequest(`/notifications/${id}/read`, { method: 'PUT' }),

  markAllNotificationsRead: () =>
    apiRequest('/notifications/read-all', { method: 'PUT' }),
};

export default api;
