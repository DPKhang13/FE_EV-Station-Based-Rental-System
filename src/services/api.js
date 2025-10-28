// Base API Configuration và Helper Functions
const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Get authorization header with token
 */
const getAuthHeader = () => {
    const token = localStorage.getItem('accessToken');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

/**
 * Handle API response
 */
const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
    }

    // Check if response has content
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return response.json();
    }

    return response.text();
};

/**
 * Base fetch wrapper
 */
export const apiFetch = async (endpoint, options = {}) => {
    try {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            ...options,
            headers: {
                ...getAuthHeader(),
                ...options.headers
            }
        };

        console.log(`🚀 [API] ${options.method || 'GET'} ${url}`);

        const response = await fetch(url, config);
        const data = await handleResponse(response);

        console.log(`✅ [API] Response:`, data);
        return data;
    } catch (error) {
        console.error(`❌ [API] Error:`, error);
        throw error;
    }
};

/**
 * API Methods
 */
export const api = {
    get: (endpoint) => apiFetch(endpoint, { method: 'GET' }),

    post: (endpoint, body) => apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(body)
    }),

    put: (endpoint, body) => apiFetch(endpoint, {
        method: 'PUT',
        body: JSON.stringify(body)
    }),

    delete: (endpoint) => apiFetch(endpoint, { method: 'DELETE' })
};

export default api;
