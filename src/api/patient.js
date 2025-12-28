import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Optional: local fallback data for offline/dev usage
// import { doctorsData } from '../data/appContent';


/**
 * Fetch a single patient by id
 */
export const fetchPatientById = async (id) => {
  if (id === undefined || id === null || id === '') {
    console.warn('fetchPatientById called with invalid id:', id);
    throw new Error('Patient id is required');
  }
  try {
    const safeId = encodeURIComponent(String(id));
    const token = await AsyncStorage.getItem('accessToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    console.log('Fetching URL:', `${api.defaults.baseURL}/patients/${safeId}`);
    const { data } = await api.get(`/patients/${safeId}`, { headers });
    return data;
  } catch (err) {
    throw err;
  }
};

/**
 * Fetch a single patient by user id
 */
export const fetchPatientByUserId = async (userId) => {
  if (userId === undefined || userId === null || userId === '') {
    console.warn('fetchPatientByUserId called with invalid userId:', userId);
    throw new Error('Patient userId is required');
  }
  try {
    const safeId = encodeURIComponent(String(userId));
    const token = await AsyncStorage.getItem('accessToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    console.log('Fetching URL:', `${api.defaults.baseURL}/patients/by-user/${safeId}`);
    const { data } = await api.get(`/patients/by-user/${safeId}`, { headers });
    return data;
  } catch (err) {
    throw err;
  }
};