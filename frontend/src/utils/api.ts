import axios from 'axios';

export const api = axios.create({
  baseURL: '/api', // Backend API
  withCredentials: true, //  Important for cookies, if you are using them
});

//  Interceptors for handling errors, authentication, etc.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    //  Handle 401 Unauthorized errors, redirect to login, etc.
    if (error.response?.status === 401) {
      //  Example: Redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);