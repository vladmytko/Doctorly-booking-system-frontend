import api from './api';
import { getToken } from '../auth/authStorage';


/**
 * Fetch a single user by id
 */
export const fetchUserById = async (id) => {
  const safeId = encodeURIComponent(String(id));
  const token = await getToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  const { data } = await api.get(`/users/${safeId}`, { headers });
  return data;
};