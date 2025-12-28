import * as keychain from 'react-native-keychain';
export const BASE_URL = 'http://localhost:8080';

export const API_PATH = {
    DOCTORS:'/api/doctors',
    SPECIALITY:'/api/specialities',
    APPOINTMENT: '/api/appointments',
    AUTH_LOGIN_GOOGLE:'/api/auth/google'
}

export const getHeaders = async() => {
    const credentials = await keychain.getGenericPassword();
    console.log("getHeaders ", credentials.password);
    return `Bearer ${credentials.password}`;
    
}