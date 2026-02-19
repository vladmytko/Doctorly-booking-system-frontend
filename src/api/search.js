import api from './api';
import { API_PATH } from './constant';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const searchDoctors = async ({
  specialityId,
  language,
  city,
  postCode,
  clinicId,
  lng,
  lat,
  radiusKm,
  minFee,
  maxFee,
  q,
  page = 0,
  size = 20,
} = {}) => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

    const url = `${API_PATH.DOCTOR}/search-doctor`;
    console.log('Fetching URL:', `${api.defaults.baseURL}${url}`);

    const { data } = await api.get(url, {
      params: {
        specialityId,
        language,
        city,
        postCode,
        clinicId,
        lng,
        lat,
        radiusKm,
        minFee,
        maxFee,
        q,
        page,
        size,
      },
      ...(headers ? { headers } : {}),
    });

    return data;
  } catch (error) {
    console.error('Error searching doctors:', error?.response?.data || error.message);
    throw error;
  }
};