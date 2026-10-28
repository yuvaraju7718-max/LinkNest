const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const contentType = response.headers.get('content-type');
    let data = null;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }

    if (!response.ok) {
      const error = new Error(data.message || data.error || `HTTP ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      const networkError = new Error(
        'Cannot connect to LinkNest API server. Ensure the Flask backend is running on http://localhost:5000.'
      );
      networkError.isNetworkError = true;
      throw networkError;
    }
    throw err;
  }
}

export const api = {
  // Health
  getHealth: () => request('/health'),

  // Links
  getLinks: (params = {}) => {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.collection_id) query.append('collection_id', params.collection_id);
    if (params.favorite !== undefined) query.append('favorite', params.favorite);
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.sort_by) query.append('sort_by', params.sort_by);

    const qs = query.toString();
    return request(`/links${qs ? `?${qs}` : ''}`);
  },

  getLink: (id) => request(`/links/${id}`),

  createLink: (linkData) =>
    request('/links', {
      method: 'POST',
      body: JSON.stringify(linkData)
    }),

  updateLink: (id, linkData) =>
    request(`/links/${id}`, {
      method: 'PUT',
      body: JSON.stringify(linkData)
    }),

  deleteLink: (id) =>
    request(`/links/${id}`, {
      method: 'DELETE'
    }),

  toggleFavorite: (id) =>
    request(`/links/${id}/favorite`, {
      method: 'PATCH'
    }),

  updateReadingStatus: (id, reading_status) =>
    request(`/links/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ reading_status })
    }),

  checkDuplicate: (url) =>
    request(`/links/check-duplicate?url=${encodeURIComponent(url)}`),

  // Search
  search: (q) =>
    request(`/search?q=${encodeURIComponent(q)}`),

  // Stats
  getStats: () => request('/stats'),

  // Collections
  getCollections: () => request('/collections'),

  getCollection: (id) => request(`/collections/${id}`),

  createCollection: (data) =>
    request('/collections', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateCollection: (id, data) =>
    request(`/collections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  deleteCollection: (id) =>
    request(`/collections/${id}`, {
      method: 'DELETE'
    }),

  // Metadata Extraction
  extractMetadata: (url) =>
    request('/meta/extract', {
      method: 'POST',
      body: JSON.stringify({ url })
    }),

  // S3 Uploads
  getUploadStatus: () => request('/uploads/status'),

  presignUpload: (filename, contentType) =>
    request('/uploads/presign', {
      method: 'POST',
      body: JSON.stringify({ filename, content_type: contentType })
    }),

  // Sample Data Reset
  resetSampleData: () =>
    request('/reset-sample-data', {
      method: 'POST'
    })
};
