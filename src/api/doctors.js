import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Optional: local fallback data for offline/dev usage
// import { doctorsData } from '../data/appContent';

/**
 * Fetch all doctors
 * Relies on api.js baseURL = http://<host>:<port>/api and JWT interceptor
 */
export const fetchDoctors = async () => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    console.log('Fetching URL:', `${api.defaults.baseURL}/doctors`);
    const { data } = await api.get('/doctors', { headers });
    return data;
  } catch (err) {
    // If you want to keep a local fallback in dev, uncomment next line
    // if (__DEV__) return doctorsData;
    throw err;
  }
};

/**
 * Fetch a single doctor by id
 */
export const fetchDoctorById = async (id) => {
  if (id === undefined || id === null || id === '') {
    console.warn('fetchDoctorById called with invalid id:', id);
    throw new Error('Doctor id is required');
  }
  try {
    const safeId = encodeURIComponent(String(id));
    const token = await AsyncStorage.getItem('accessToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    console.log('Fetching URL:', `${api.defaults.baseURL}/doctors/${safeId}`);
    const { data } = await api.get(`/doctors/${safeId}`, { headers });
    return data;
  } catch (err) {
    throw err;
  }
};

/**
 * Fetch doctors by speciality 
 * Support either specialityId or specialityTitle plus standart Spring Pageable params
 * Returns array
 */
export const fetchDoctorsBySpeciality = async ({specialityId, specialityTitle, page = 0, size = 20, sort} = {}) => {
  if(!specialityId && !specialityTitle) {
    throw new Error('Provide specialityId or specialityTitle');
  } 

  try{
    const token = await AsyncStorage.getItem('accessToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const params = {};

    if(specialityId) params.specialityId = specialityId;
    if(specialityTitle) params.specialityTitle = specialityTitle;

    if(page !== undefined) params.page = page;
    if(size !== undefined) params.size = size;
    if(sort) params.sort = sort;

    console.log('Fetching fetchDoctorsBySpeciality URL:', `${api.defaults.baseURL}/doctors/speciality`, { headers, params});
    const { data } = await api.get('/doctors/speciality', { headers, params});

    return Array.isArray(data?.content) ? data.content : [];
  } catch (err) {
    throw err;
  }
};

