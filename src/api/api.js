import axios from 'axios';
import {  BASE_URL  } from './constant';
import { getToken, clearToken, clearCurrentUser, authEvents } from './auth/authStorage';

/* THIS IS GATEWAY, through witch all API requests to backend should go.
   1) Creates a preconfigured Axios client
   2) Sets the base backend URL
   3) Automatecally attaches JWT tokens to requests
   4) Automatecally logs the user out if the token exires
   5) Centralised all auth/network logic in one place
*/

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
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

/**
 * This function runs before every HTTP request is sent to the backend.
 * Request interceptor — attaches JWT to outgoing requests
 */
api.interceptors.request.use(async (config) => {

  // Check if headers object exist
  config.headers = { ...(config.headers || {}) };

  // Detect if this is an auth request, if yes, do not send JWT token
  const skip = config.headers['X-Skip-Auth'] || isAuthPath(config.url || '');
  if (skip) {
    delete config.headers.Authorization;
    return config;
  }

  // Otherwise, attach token
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response interceptor — logs user out automatically when token expires (401)
// This function runs after every response from the backend.
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