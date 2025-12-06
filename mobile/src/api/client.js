import { Platform } from 'react-native';

// Default to localhost for web/iOS, and 10.0.2.2 for Android Emulator
// If running on a physical device, you should change this to your computer's IP address
const DEV_API_URL = Platform.select({
    android: 'http://10.0.2.2:8080',
    ios: 'http://localhost:8080',
    default: 'http://localhost:8080',
});

export const API_BASE_URL = DEV_API_URL;

export const apiClient = {
    async get(endpoint) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`API GET Error (${endpoint}):`, error);
            throw error;
        }
    },

    async post(endpoint, body) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`API POST Error (${endpoint}):`, error);
            throw error;
        }
    }
};
