import api from '../api';
import { saveToken } from './authStorage';

/**
 * Login against Spring backend
 *  - POST /api/auth/login
 *  - Body: { email, password }
 *  - Response: { token: string }
 */
export const loginWithCredentials = async (email, password) => {
  const res = await api.post(
    '/auth/login',
    { email, password },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: undefined,
        'X-Skip-Auth': 'true',
      },
      withCredentials: false,
    }
  );

  const token = res?.data?.token;
  if (!token) throw new Error('Login succeeded but no token was returned by the server.');

  await saveToken(token);
  return res.data;
};

const authService = { loginWithCredentials };
export default authService;