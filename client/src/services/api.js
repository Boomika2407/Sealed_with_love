import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to inject JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sealed_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API helper functions
export const authApi = {
  login: async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  },
  register: async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    return data;
  },
  getMe: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  }
};

export const capsuleApi = {
  create: async (formData) => {
    const { data } = await api.post('/capsules', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },
  getMyCapsules: async () => {
    const { data } = await api.get('/capsules/my-capsules');
    return data;
  },
  getById: async (id) => {
    const { data } = await api.get(`/capsules/${id}`);
    return data;
  },
  unlock: async (id, { latitude, longitude, accuracy }) => {
    const { data } = await api.post(`/capsules/${id}/unlock`, {
      latitude,
      longitude,
      accuracy
    });
    return data;
  },
  react: async (id) => {
    const { data } = await api.post(`/capsules/${id}/react`);
    return data;
  }
};

export const wallApi = {
  getWall: async () => {
    const { data } = await api.get('/wall');
    return data;
  }
};

export const spotApi = {
  getCampus: async () => {
    const { data } = await api.get('/campus');
    return data;
  },
  getSpots: async () => {
    const { data } = await api.get('/spots');
    return data;
  },
  createSpot: async (spotData) => {
    const { data } = await api.post('/spots', spotData);
    return data;
  },
  updateSpot: async (id, spotData) => {
    const { data } = await api.put(`/spots/${id}`, spotData);
    return data;
  },
  deleteSpot: async (id) => {
    const { data } = await api.delete(`/spots/${id}`);
    return data;
  }
};

export const systemApi = {
  checkHealth: async () => {
    const { data } = await api.get('/health');
    return data;
  }
};

export const memoryWallApi = {
  // Get paginated wall feed
  getFeed: async (params = {}) => {
    const { data } = await api.get('/memory-wall', { params });
    return data;
  },
  // Create a new memory post (multipart)
  createPost: async (formData, onUploadProgress) => {
    const { data } = await api.post('/memory-wall', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress
    });
    return data;
  },
  // Share an unlocked capsule to the wall
  shareCapsule: async (capsuleId, caption) => {
    const { data } = await api.post('/memory-wall/share-capsule', { capsuleId, caption });
    return data;
  },
  // React with emoji: emoji = 'heart'|'cry'|'haha'|'care'|'grad'
  react: async (postId, emoji) => {
    const { data } = await api.post(`/memory-wall/${postId}/react`, { emoji });
    return data;
  },
  // Comments
  addComment: async (postId, text, isAnonymous = false) => {
    const { data } = await api.post(`/memory-wall/${postId}/comments`, { text, isAnonymous });
    return data;
  },
  replyToComment: async (postId, commentId, text, isAnonymous = false) => {
    const { data } = await api.post(`/memory-wall/${postId}/comments/${commentId}/reply`, { text, isAnonymous });
    return data;
  },
  // Save / bookmark toggle
  savePost: async (postId) => {
    const { data } = await api.post(`/memory-wall/${postId}/save`);
    return data;
  },
  // Report
  reportPost: async (postId, reason) => {
    const { data } = await api.post(`/memory-wall/${postId}/report`, { reason });
    return data;
  },
  // Delete own post
  deletePost: async (postId) => {
    const { data } = await api.delete(`/memory-wall/${postId}`);
    return data;
  },
  // Spots map pins
  getSpotMapPins: async () => {
    const { data } = await api.get('/memory-wall/spots-map');
    return data;
  }
};

export default api;

