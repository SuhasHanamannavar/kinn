const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  // Add Clerk auth token if available
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('clerk-token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed: ${response.status}`);
  }

  return data;
}

export const api = {
  // Health check
  health: () => request('/health'),

  // Auth
  getProfile: () => request('/auth/me'),

  // Companies
  searchCompanies: (query) => request(`/companies/search?q=${encodeURIComponent(query)}`),
  getCompanies: (limit = 50, offset = 0) => request(`/companies?limit=${limit}&offset=${offset}`),
  getCompany: (ticker) => request(`/companies/${ticker}`),
  getSearchHistory: () => request('/companies/history/recent'),

  // Research
  generateReport: (ticker, companyName) => 
    request('/research/generate', {
      method: 'POST',
      body: JSON.stringify({ ticker, companyName })
    }),
  getMyReports: (limit = 20) => request(`/research/my?limit=${limit}`),
  getReport: (id) => request(`/research/${id}`),
  deleteReport: (id) => request(`/research/${id}`, { method: 'DELETE' })
};

export default api;
