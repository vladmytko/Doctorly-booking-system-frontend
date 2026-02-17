import api from './api';
import { API_PATH } from './constant';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Fetch a clinic by clinic UD
 */

export const fetchClinicById = async (id) => {
    if (!id) {
        console.warn('fetchClinicById called with invalid id:', id);
        throw new Error('Clinic ID is required');
    }
    try {
        const safeId = encodeURIComponent(String(id));
        const token = await AsyncStorage.getItem('accessToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

        console.log('Fetching URL:', `${api.defaults.baseURL}${API_PATH.CLINIC}/by-id/${safeId}`);
        const { data } = await api.get(`${API_PATH.CLINIC}/by-id/${safeId}`, { headers });
        return data;
    } catch (err) {
        console.error('Error fetching clinic:', err?.response?.data || err.message || err.response.status);
        throw err;
    }
};