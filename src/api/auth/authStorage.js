// src/storage/authStorage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'jwt';

// Event emmitter for auth changes
const listeners = new Set();

export const authEvents = {
  subscribe(fn) {
    if (typeof fn === 'function') listeners.add(fn);
    return () => listeners.delete(fn); // unsubscribe function
  },
  emit(payload) {
    listeners.forEach((fn) => {
      try { fn(payload);} catch (_) {}
    });
  },
};

export const saveToken = async (token) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (e) {
    console.error('Error saving token', e);
  }
};

export const getToken = async () => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (e) {
    console.error('Error reading token', e);
    return null;
  }
};

export const clearToken = async () => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    authEvents.emit('clearToken');
  } catch (e) {
    console.error('Error clearing token', e);
  }
};