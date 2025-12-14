import axios from 'axios';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: '/api', // Vite proxy will handle this
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor for generic error handling if needed
apiClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const customError = {
            message: error.response?.data?.error || error.message || 'Network Error',
            details: error.response?.data?.details,
            status: error.response?.status,
        };
        return Promise.reject(customError);
    }
);

export default apiClient;
