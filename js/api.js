// API Configuration
const API_BASE_URL = window.location.origin + '/api';

// API Helper Functions
class AuditAPI {
  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  // Clear authentication token
  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  // Get headers with authentication
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Make API request
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.clearToken();
    }
  }

  async verifyToken() {
    if (!this.token) {
      return { valid: false };
    }
    
    try {
      return await this.request('/auth/verify');
    } catch (error) {
      this.clearToken();
      return { valid: false };
    }
  }

  // Company methods
  async getCompanies() {
    return await this.request('/companies');
  }

  async getCompany(name) {
    return await this.request(`/companies/name/${name}`);
  }

  async getCompanyAudits(companyId, options = {}) {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit);
    if (options.offset) params.append('offset', options.offset);
    if (options.status) params.append('status', options.status);
    
    const queryString = params.toString();
    const endpoint = `/companies/${companyId}/audits${queryString ? `?${queryString}` : ''}`;
    
    return await this.request(endpoint);
  }

  // Audit methods
  async getAudits(options = {}) {
    const params = new URLSearchParams();
    if (options.company) params.append('company', options.company);
    if (options.status) params.append('status', options.status);
    if (options.limit) params.append('limit', options.limit);
    if (options.offset) params.append('offset', options.offset);
    
    const queryString = params.toString();
    const endpoint = `/audits${queryString ? `?${queryString}` : ''}`;
    
    return await this.request(endpoint);
  }

  async getAuditStats() {
    return await this.request('/audits/stats/overview');
  }

  async uploadAudit(formData) {
    const headers = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    // Don't set Content-Type for FormData, let browser set it with boundary

    const response = await fetch(`${API_BASE_URL}/audits/upload`, {
      method: 'POST',
      headers,
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  }

  async deleteAudit(auditId) {
    return await this.request(`/audits/${auditId}`, {
      method: 'DELETE'
    });
  }

  // News methods
  async getNews(options = {}) {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit);
    if (options.offset) params.append('offset', options.offset);
    
    const queryString = params.toString();
    const endpoint = `/news${queryString ? `?${queryString}` : ''}`;
    
    return await this.request(endpoint);
  }

  async createNews(newsData) {
    return await this.request('/news', {
      method: 'POST',
      body: JSON.stringify(newsData)
    });
  }

  async updateNews(newsId, newsData) {
    return await this.request(`/news/${newsId}`, {
      method: 'PUT',
      body: JSON.stringify(newsData)
    });
  }

  async deleteNews(newsId) {
    return await this.request(`/news/${newsId}`, {
      method: 'DELETE'
    });
  }

  // Health check
  async healthCheck() {
    return await this.request('/health');
  }
}

// Create global API instance
window.auditAPI = new AuditAPI();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuditAPI;
}



