import axios from 'axios';

export const api = axios.create({
  baseURL: '/api', 
  withCredentials: true, 
});


api.interceptors.response.use(
  (response) => response,
  (error) => {
    
    if (error.response?.status === 401) {
      //redir to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);