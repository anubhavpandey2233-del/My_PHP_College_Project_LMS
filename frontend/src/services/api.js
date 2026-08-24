
import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost/php-lms-project/backend/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});


// =====================================
// Request Interceptor
// =====================================

api.interceptors.request.use(
  (config) => {

    const token = localStorage.getItem('token');

    if (token) {

      config.headers = config.headers || {};

      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);


// =====================================
// Response Interceptor
// =====================================

api.interceptors.response.use(

  (response) => {
    return response;
  },

  (error) => {

    /*
     * IMPORTANT:
     * Do NOT automatically redirect to login
     * from here.
     *
     * AuthContext will handle authentication
     * and logout when required.
     */

    return Promise.reject(error);
  }
);


export default api;

