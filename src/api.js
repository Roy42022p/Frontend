import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const { status } = error.response || {};
        const isLoginRequest = error.config?.url === '/auth/login';

        if (status === 401 && !isLoginRequest) {
            localStorage.removeItem('access_token');
            window.location.href = '/';
        }

        return Promise.reject(error);
    }
);

export default api;