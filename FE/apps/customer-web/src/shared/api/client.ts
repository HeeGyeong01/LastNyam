import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://lastnyam.co.kr';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (인증 토큰 등 추가 가능)
apiClient.interceptors.request.use(
  (config) => {
    // localStorage에서 accessToken 가져와서 헤더에 추가
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (에러 처리)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // TODO: 에러 처리 로직 추가
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

