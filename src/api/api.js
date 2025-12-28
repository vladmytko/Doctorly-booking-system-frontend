import axios from 'axios';
import { getToken, clearToken, clearCurrentUser, authEvents } from './auth/authStorage';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// Helper to detect auth endpoints when baseURL already includes /api
const isAuthPath = (url = '') => {
  try {
    const u = new URL(url, api.defaults.baseURL);
    return u.pathname.startsWith('/api/auth/');
  } catch {
    // Fallback for relative paths such as '/auth/login'
    return url.startsWith('/auth/');
  }
};

// 🔹 Request interceptor — attaches JWT to outgoing requests
api.interceptors.request.use(async (config) => {
  config.headers = { ...(config.headers || {}) };

  const skip = config.headers['X-Skip-Auth'] || isAuthPath(config.url || '');
  if (skip) {
    delete config.headers.Authorization;
    return config;
  }

  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 🔹 Response interceptor — logs user out automatically when token expires (401)
api.interceptors.response.use(
  response => response,
  async error => {
    const status = error?.response?.status;

    if (status === 401) {
      try {
        console.log('[API] Token expired — logging out user');
        await clearToken();
        await clearCurrentUser();
      } catch (e) {
        console.log('[API] Failed to clear session:', e?.message || e);
      } finally {
        authEvents.emit('authChanged'); // triggers logout navigation
      }
    }

    return Promise.reject(error);
  }
);

export default api;