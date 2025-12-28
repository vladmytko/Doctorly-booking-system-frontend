import axios from "axios";
import api from "./api";
import { API_PATH, BASE_URL } from "./constant";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Fetch a specility by  id
 */
export const fetchSpecialityById = async (id) => {
  if (id === undefined || id === null || id === '') {
    console.warn('fetchSpecialityById called with invalid ID:', id);
    throw new Error('Speciality id is required');
  }
  try {
    const safeId = encodeURIComponent(String(id));
    const token = await AsyncStorage.getItem('accessToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    console.log('Fetching URL:', `${api.defaults.baseURL}/specialities/id/${safeId}`);
    const { data } = await api.get(`/specialities/id/${safeId}`, { headers });
    return data;
  } catch (err) {
    throw err;
  }
};

/**
 * Fetch a specility by  title
 */
export const fetchSpecialityByTitle = async (title) => {
  if (title === undefined || title === null || title === '') {
    console.warn('fetchSpecialityByTitle called with invalid title:', title);
    throw new Error('Title is required');
  }
  try {
    const safeId = encodeURIComponent(String(title));
    const token = await AsyncStorage.getItem('accessToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    console.log('Fetching URL:', `${api.defaults.baseURL}/specialities/title/${safeId}`);
    const { data } = await api.get(`/specialities/title/${safeId}`, { headers });
    return data;
  } catch (err) {
    throw err;
  }
};


/**
 * Fetch all specialities
 */
export const fetchSpecialities = async () => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    console.log('Fetching URL:', `${api.defaults.baseURL}/specialities`);
    const { data } = await api.get(`/specialities`, { headers });
    return data;
  } catch (err) {
    throw err;
  }
};