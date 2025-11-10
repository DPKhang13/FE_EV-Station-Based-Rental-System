// Base API Configuration và Helper Functions
const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Set token as cookie
 */
// ✅ KHÔNG thêm "Secure" khi đang chạy HTTP local
const setTokenCookie = (token) => {
  if (token) {
    const expiryDate = new Date();
    expiryDate.setTime(expiryDate.getTime() + 15 * 60 * 1000); // 15 phút
    const isLocal = window.location.hostname === "localhost";

    // ⚡ Nếu chạy local → KHÔNG dùng Secure
    document.cookie = `AccessToken=${token}; path=/; expires=${expiryDate.toUTCString()}; SameSite=Lax${isLocal ? "" : "; Secure"}`;
    console.log("✅ Token set in cookie (expires in 15 minutes)");
  }
};

/**
 * Get token from localStorage and set cookie + return Authorization header
 */
const ensureTokenCookie = () => {
    const token = localStorage.getItem('accessToken');

    console.log('🔍 [API] Checking token in localStorage:');
    console.log('  - Token exists:', !!token);
    console.log('  - Token value:', token ? `${token.substring(0, 20)}...` : 'NULL/UNDEFINED');

    const headers = {
        'Content-Type': 'application/json'
    };

    if (token) {
        setTokenCookie(token);
        // ✅ GỬI TOKEN TRONG HEADER để backend đọc được
        headers['Authorization'] = `Bearer ${token}`;
        console.log('✅ [API] Token added to Authorization header');
    } else {
        console.error('❌❌❌ [API] No token found in localStorage!');
        console.error('❌ YOU NEED TO LOGIN FIRST!');
        console.error('❌ Current localStorage keys:', Object.keys(localStorage));
    }

    return headers;
};

/**
 * Handle API response
 */
const handleResponse = async (response) => {
    if (!response.ok) {
        let errorData;
        const contentType = response.headers.get('content-type');

        try {
            if (contentType && contentType.includes('application/json')) {
                errorData = await response.json();
            } else {
                errorData = await response.text();
            }
        } catch (e) {
            errorData = 'Failed to parse error response';
        }

        console.error(`🔴 [API] Error Response (${response.status}):`, errorData);

        const error = new Error(`HTTP ${response.status}: ${typeof errorData === 'string' ? errorData : JSON.stringify(errorData)}`);
        error.response = {
            status: response.status,
            data: errorData,
            headers: response.headers
        };
        throw error;
    }

    // ✅ Extract new AccessToken from Set-Cookie header if present
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader && setCookieHeader.includes('AccessToken=')) {
        const match = setCookieHeader.match(/AccessToken=([^;]+)/);
        if (match && match[1]) {
            const newToken = match[1];
            localStorage.setItem('accessToken', newToken);
            console.log('✅ New AccessToken extracted and saved to localStorage');
        }
    }

    // Check if response has content
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return response.json();
    }

    return response.text();
};

// ✅ Import authService để tránh circular dependency
let refreshTokenPromise = null;

/**
 * Base fetch wrapper với auto-refresh token
 */
export const apiFetch = async (endpoint, options = {}) => {
    try {
        const url = `${API_BASE_URL}${endpoint}`;

        // ✅ Đảm bảo token được set vào cookie trước khi gọi API
        const headers = ensureTokenCookie();

        const config = {
            ...options,
            headers: {
                ...headers,
                ...options.headers
            },
            credentials: 'include' // ✅ Quan trọng: Gửi cookie cùng request
        };

        console.log(`🚀 [API] ${options.method || 'GET'} ${url}`);
        console.log(`🍪 [API] Sending with credentials (cookies)`);
        console.log(`🔑 [API] Headers:`, config.headers);

        let response = await fetch(url, config);

        // ✅ Nếu nhận 401/403 (token expired), tự động refresh
        if ((response.status === 401 || response.status === 403) && endpoint !== '/auth/refresh' && endpoint !== '/auth/login') {
            console.log('⚠️ Token expired, attempting refresh...');

            // ✅ Tránh multiple refresh cùng lúc
            if (!refreshTokenPromise) {
                refreshTokenPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                }).then(async (refreshResponse) => {
                    if (refreshResponse.ok) {
                        // Extract new token from cookie
                        const cookies = document.cookie.split(';');
                        const accessTokenCookie = cookies.find(c => c.trim().startsWith('AccessToken='));
                        if (accessTokenCookie) {
                            const token = accessTokenCookie.split('=')[1];
                            localStorage.setItem('accessToken', token);
                            console.log('✅ Token refreshed successfully');
                        }
                        return true;
                    } else {
                        console.error('❌ Refresh token failed, redirecting to login...');
                        localStorage.clear();
                        window.location.href = '/login';
                        return false;
                    }
                }).finally(() => {
                    refreshTokenPromise = null;
                });
            }

            const refreshSuccess = await refreshTokenPromise;

            if (refreshSuccess) {
                // Retry original request với token mới
                console.log('🔄 Retrying original request with new token...');
                response = await fetch(url, config);
            }
        }

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

// ✅ Export helper để set token cookie từ bên ngoài
export const setAuthToken = (token) => {
    if (token) {
        localStorage.setItem('accessToken', token);
        // Set cookie với thời gian 15 phút (khớp với backend JWT_ACCESSEXPIRATION=900000ms)
        const expiryDate = new Date();
        expiryDate.setTime(expiryDate.getTime() + 15 * 60 * 1000); // 15 phút
        document.cookie = `AccessToken=${token}; path=/; expires=${expiryDate.toUTCString()}; SameSite=Lax; Secure`;
        console.log('✅ Token saved to localStorage and cookie (15 minutes)');
    }
};

export default api;
