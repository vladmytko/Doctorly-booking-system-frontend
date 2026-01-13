import axios from "axios"; // Remove later
import api from './api';
import { API_PATH, BASE_URL } from "./constant"
import AsyncStorage from "@react-native-async-storage/async-storage";    // Remove later

/**
 * Create/Book an appointment
 * Backend: POST /appointments
 * Request shape (AppointmentRequestDTO);
 * { dataOfBrirth, 'YYYY-MM-DD', gender: 'Male'|'Female', concern: string, patientId: string, doctorId: string }
 */

 export const createAppointment = async ({
  dateOfBirth,
  gender,
  concern,
  patientId,
  doctorId
 }) => {
  // Build payload with only defined fields
  const body = {};
  if(dateOfBirth) body.dateOfBirth = dateOfBirth; //e.g., '1990-09-21'
  if(gender) body.gender = String(gender).toUpperCase();
  if(concern !== undefined) body.concern = concern;
  if(patientId) body.patientId = patientId;
  if(doctorId) body.doctorId = doctorId;

  try {
    const token = await AsyncStorage.getItem('accessToken');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    console.log('Fetching URL:', `${api.defaults.baseURL}/appointments`);
    console.log('Request body:', body);
    console.log('Request headers:', headers);

    const { data } = await api.post('/appointments', body, { headers  });
    return data; // AppointmentDTO
  } catch (err) {
    console.log('[createAppointment] Error:', err?.response?.data || err?.message);
    throw err;
  }
 };

/**
 * Cancel a appointments by appointment id 
 */
export const fetchAppointmentById = async (appointmentId) => {
  if (appointmentId === undefined || appointmentId === null || appointmentId === '') {
    console.warn('fetchAppointmentById called with invalid appointmentId:', appointmentId);
    throw new Error('Appointment id is required');
  }
  try {
    const safeId = encodeURIComponent(String(appointmentId));
    const token = await AsyncStorage.getItem('accessToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    console.log('Fetching URL:', `${api.defaults.baseURL}/appointments/id/${safeId}`);
    const { data } = await api.get(`/appointments/id/${safeId}`, { headers });
    return data;
  } catch (err) {
    throw err;
  }
}; 



/**
 * Fetch all appointments
 * Relies on api.js baseURL = http://<host>:<port>/api and JWT interceptor
 */
export const fetchAppointments = async () => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    console.log('Fetching URL:', `${api.defaults.baseURL}/appointments`);
    const { data } = await api.get('/appointments', { headers });
    return data;
  } catch (err) {
    throw err;
  }
};

/**
 * Fetch a appointments by patient id
 *
export const fetchAppointmentByPatientId = async (patientId) => {
  if (patientId === undefined || patientId === null || patientId === '') {
    console.warn('fetchAppointmentByPatientId called with invalid patientId:', patientId);
    throw new Error('Patient id is required');
  }
  try {
    const safeId = encodeURIComponent(String(patientId));
    const token = await AsyncStorage.getItem('accessToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    console.log('Fetching URL:', `${api.defaults.baseURL}${API_PATH.APPOINTMENT}/patient-id/${safeId}`);
    const { data } = await api.get(`${API_PATH.APPOINTMENT}/patient-id/${safeId}`, { headers });
    return data;
  } catch (err) {
    console.log('[FetchAppointmentByPatientId] Error:', err?.response?.data || err?.message);
    throw err;
  }
};
*/

export const fetchAppointmentsByPatientId = async (patientId) => {
  if (!patientId) throw new Error('Patient id is required');

  try{
    const safeId = encodeURIComponent(String(patientId));
    const { data } = await api.get(`${API_PATH.APPOINTMENT}/patient-id/${safeId}`);

    console.log('Fetching URL:', `${api.defaults.baseURL}${API_PATH.APPOINTMENT}/patient-id/${safeId}`);
    
    return data;
  } catch (err) {
    console.log('[FetchAppointmentByPatientId] Error:', err?.response?.data || err?.message);
    throw err;
  }
  

  
}


/**
 * Fetch a appointments by doctorId 
 */
export const fetchAppointmentByDoctorId = async (doctorId) => {
  if (doctorId === undefined || doctorId === null || doctorId === '') {
    console.warn('fetchAppointmentByDoctorId called with invalid doctorId:', doctorId);
    throw new Error('Doctor id is required');
  }
  try {
    const safeId = encodeURIComponent(String(doctorId));
    const token = await AsyncStorage.getItem('accessToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    console.log('Fetching URL:', `${api.defaults.baseURL}/appointments/doctor/${safeId}`);
    const { data } = await api.get(`/appointments/doctor/${safeId}`, { headers });
    return data;
  } catch (err) {
    throw err;
  }
};

/**
 * Fetch a appointments by status 
 */
export const fetchAppointmentByStatus = async (status) => {
  if (status === undefined || status === null || status === '') {
    console.warn('fetchAppointmentByStatus called with invalid status:', status);
    throw new Error('Status id is required');
  }
  try {
    const safeId = encodeURIComponent(String(status));
    const token = await AsyncStorage.getItem('accessToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    console.log('Fetching URL:', `${api.defaults.baseURL}/appointments/status/${safeId}`);
    const { data } = await api.get(`/appointments/status/${safeId}`, { headers });
    return data;
  } catch (err) {
    throw err;
  }
};

/**
 * Cancel a appointments by appointment id 
 */
export const cancelAppointmentByAppointmentId = async (appointmentId) => {
  if (appointmentId === undefined || appointmentId === null || appointmentId === '') {
    console.warn('cancelAppointmentByAppointmentId called with invalid appointmentId:', appointmentId);
    throw new Error('Appointment id is required');
  }
  try {
    const safeId = encodeURIComponent(String(appointmentId));
    const token = await AsyncStorage.getItem('accessToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    console.log('Fetching URL:', `${api.defaults.baseURL}/appointments/cancel/${safeId}`);
    const { data } = await api.post(`/appointments/cancel/${safeId}`, { headers });
    return data;
  } catch (err) {
    throw err;
  }
};