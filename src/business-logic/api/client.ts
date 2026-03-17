import axios from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // TODO: handle token refresh
    }
    return Promise.reject(error);
  }
);
