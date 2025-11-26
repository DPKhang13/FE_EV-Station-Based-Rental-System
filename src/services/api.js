// Base API Configuration và Helper Functions
const API_BASE_URL = 'https://be-ev-station-based-rental-system.onrender.com/api';

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
    console.log('  - Token type:', typeof token);
    console.log('  - Token value:', token && typeof token === 'string' ? `${token.substring(0, 20)}...` : (token || 'NULL/UNDEFINED'));
    console.log('  - All localStorage keys:', Object.keys(localStorage));

    const headers = {
        'Content-Type': 'application/json'
    };

    // ✅ Kiểm tra token hợp lệ (phải là string và không rỗng)
    if (token && typeof token === 'string' && token.trim() !== '' && token !== 'undefined' && token !== 'null') {
        setTokenCookie(token);
        // ✅ GỬI TOKEN TRONG HEADER để backend đọc được
        headers['Authorization'] = `Bearer ${token}`;
        console.log('✅ [API] Token added to Authorization header');
    } else {
        console.error('❌❌❌ [API] No valid token found in localStorage!');
        console.error('❌ Token value:', token);
        console.error('❌ YOU NEED TO LOGIN FIRST!');
        console.error('❌ Current localStorage keys:', Object.keys(localStorage));
        console.error('❌ Current localStorage values:', Object.keys(localStorage).map(key => ({ key, value: localStorage.getItem(key)?.substring(0, 50) })));
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

    // ✅ Extract new AccessToken từ response (body hoặc Set-Cookie header)
    // Chỉ extract nếu response thành công
    let responseData = null;
    const contentType = response.headers.get('content-type');
    
    if (response.ok) {
        // 1. Thử lấy từ Set-Cookie header trước (không cần đọc body)
        const setCookieHeader = response.headers.get('set-cookie');
        if (setCookieHeader && setCookieHeader.includes('AccessToken=')) {
            const match = setCookieHeader.match(/AccessToken=([^;]+)/);
            if (match && match[1]) {
                const newToken = match[1];
                localStorage.setItem('accessToken', newToken);
                setTokenCookie(newToken);
                console.log('✅ New AccessToken extracted from Set-Cookie header');
            }
        }
        
        // 2. Đọc response body (chỉ một lần)
        if (contentType && contentType.includes('application/json')) {
            responseData = await response.json();
            
            // Kiểm tra token trong body (nếu chưa có từ header)
            const newToken = responseData?.accessToken || responseData?.jwtToken || responseData?.token;
            if (newToken) {
                const currentToken = localStorage.getItem('accessToken');
                // Update nếu token mới khác với token hiện tại
                if (newToken !== currentToken) {
                    localStorage.setItem('accessToken', newToken);
                    setTokenCookie(newToken);
                    console.log('✅ New AccessToken extracted from response body');
                }
            }
            
            return responseData;
        } else {
            responseData = await response.text();
            return responseData;
        }
    }

    // Nếu không phải success, đã throw error ở trên
    return null;
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
        if (options.body) {
            console.log(`📦 [API] Request body:`, options.body);
        }

        let response = await fetch(url, config);

        // ✅ Kiểm tra nếu response là lỗi authentication (401, 403, hoặc 400 với message về token)
        let isAuthError = false;
        if (response.status === 401 || response.status === 403) {
            isAuthError = true;
        } else if (response.status === 400) {
            // Kiểm tra xem có phải lỗi về token không
            try {
                const errorData = await response.clone().json();
                if (errorData.message && (
                    errorData.message.includes('Phiên đăng nhập không hợp lệ') ||
                    errorData.message.includes('token') ||
                    errorData.message.includes('authentication') ||
                    errorData.message.includes('unauthorized')
                )) {
                    isAuthError = true;
                }
            } catch (e) {
                // Không phải JSON, bỏ qua
            }
        }

        // ✅ Nếu là lỗi authentication, tự động refresh token
        if (isAuthError && endpoint !== '/auth/refresh' && endpoint !== '/auth/login') {
            console.log('⚠️ Token expired or invalid, attempting refresh...');
            
            // ✅ Kiểm tra refreshToken có tồn tại không
            const refreshTokenFromStorage = localStorage.getItem('refreshToken');
            const refreshTokenFromCookie = document.cookie.split(';').find(c => c.trim().startsWith('RefreshToken='));
            console.log('🔍 [Refresh] Checking refreshToken:');
            console.log('  - In localStorage:', !!refreshTokenFromStorage);
            console.log('  - In cookie:', !!refreshTokenFromCookie);
            if (refreshTokenFromCookie) {
                console.log('  - Cookie value:', refreshTokenFromCookie.split('=')[1].substring(0, 20) + '...');
            }

            // ✅ Tránh multiple refresh cùng lúc
            if (!refreshTokenPromise) {
                // ✅ Tạo request body với refreshToken nếu có (một số backend yêu cầu)
                const refreshBody = refreshTokenFromStorage ? { refreshToken: refreshTokenFromStorage } : {};
                
                refreshTokenPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: Object.keys(refreshBody).length > 0 ? JSON.stringify(refreshBody) : undefined,
                    credentials: 'include' // ✅ Quan trọng: Gửi cookie (RefreshToken) cùng request
                }).then(async (refreshResponse) => {
                    if (refreshResponse.ok) {
                        let newToken = null;
                        
                        // ✅ 1. Thử lấy token từ response body
                        let refreshData = null;
                        try {
                            refreshData = await refreshResponse.json();
                            newToken = refreshData.accessToken || refreshData.jwtToken || refreshData.token;
                            if (newToken) {
                                console.log('✅ Token found in response body');
                            }
                            
                            // ✅ Cập nhật refreshToken mới nếu có trong response
                            if (refreshData.refreshToken || refreshData.refresh_token) {
                                const newRefreshToken = refreshData.refreshToken || refreshData.refresh_token;
                                localStorage.setItem('refreshToken', newRefreshToken);
                                // Cập nhật refreshToken cookie
                                const expiryDate = new Date();
                                expiryDate.setTime(expiryDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 ngày
                                const isLocal = window.location.hostname === "localhost";
                                document.cookie = `RefreshToken=${newRefreshToken}; path=/; expires=${expiryDate.toUTCString()}; SameSite=Lax${isLocal ? "" : "; Secure"}`;
                                console.log('✅ RefreshToken updated in localStorage and cookie');
                            }
                        } catch (e) {
                            // Không phải JSON, bỏ qua
                            console.log('⚠️ Refresh response is not JSON, trying other methods...');
                        }
                        
                        // ✅ 2. Nếu không có trong body, thử lấy từ Set-Cookie header
                        if (!newToken) {
                            const setCookieHeader = refreshResponse.headers.get('set-cookie');
                            if (setCookieHeader && setCookieHeader.includes('AccessToken=')) {
                                const match = setCookieHeader.match(/AccessToken=([^;]+)/);
                                if (match && match[1]) {
                                    newToken = match[1];
                                    console.log('✅ Token found in Set-Cookie header');
                                }
                            }
                        }
                        
                        // ✅ 3. Nếu vẫn không có, thử lấy từ cookie hiện tại (backend có thể set tự động)
                        if (!newToken) {
                            const cookies = document.cookie.split(';');
                            const accessTokenCookie = cookies.find(c => c.trim().startsWith('AccessToken='));
                            if (accessTokenCookie) {
                                newToken = accessTokenCookie.split('=')[1];
                                console.log('✅ Token found in current cookies');
                            }
                        }
                        
                        if (newToken) {
                            localStorage.setItem('accessToken', newToken);
                            setTokenCookie(newToken); // Update cookie
                            console.log('✅ Token refreshed and saved successfully');
                            return { success: true, token: newToken };
                        } else {
                            console.error('❌ No token found in refresh response');
                            return { success: false };
                        }
                    } else {
                        // ✅ Kiểm tra status code để xác định lý do thất bại
                        const statusCode = refreshResponse.status;
                        console.error(`❌ Refresh token failed with status ${statusCode}`);
                        
                        // ✅ Chỉ logout khi refreshToken thực sự hết hạn (401/403)
                        // Nếu là lỗi khác (500, 400), có thể là lỗi server, không nên logout
                        if (statusCode === 401 || statusCode === 403) {
                            console.error('❌ RefreshToken expired or invalid, clearing session...');
                            localStorage.clear();
                            document.cookie = 'AccessToken=; path=/; max-age=0';
                            document.cookie = 'RefreshToken=; path=/; max-age=0';
                            return { success: false, shouldLogout: true };
                        } else {
                            // ✅ Lỗi server (500, 400), không logout, chỉ return false
                            console.warn('⚠️ Refresh token failed due to server error, not logging out');
                            return { success: false, shouldLogout: false };
                        }
                    }
                }).finally(() => {
                    refreshTokenPromise = null;
                });
            }

            const refreshResult = await refreshTokenPromise;

            if (refreshResult && refreshResult.success) {
                // ✅ Retry original request với token mới
                console.log('🔄 Retrying original request with new token...');
                // Update headers với token mới
                const newHeaders = ensureTokenCookie();
                const retryConfig = {
                    ...options,
                    headers: {
                        ...newHeaders,
                        ...options.headers
                    },
                    credentials: 'include'
                };
                response = await fetch(url, retryConfig);
            } else if (refreshResult && refreshResult.shouldLogout) {
                // ✅ Chỉ logout khi refreshToken thực sự hết hạn
                console.error('❌ RefreshToken expired, redirecting to login...');
                // Clear tất cả session data
                localStorage.clear();
                document.cookie = 'AccessToken=; path=/; max-age=0';
                document.cookie = 'RefreshToken=; path=/; max-age=0';
                // Redirect to login
                window.location.href = '/login';
                throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            } else {
                // ✅ Refresh failed nhưng không phải do token hết hạn (có thể là lỗi server)
                // Không logout, chỉ throw error để component xử lý
                console.warn('⚠️ Refresh token failed but not logging out (possible server error)');
                throw new Error('Không thể làm mới token. Vui lòng thử lại sau.');
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

    put: (endpoint, body) => {
        const bodyData = body ? JSON.stringify(body) : undefined;
        console.log(`📤 [API] PUT ${endpoint}`, body ? { body } : 'No body');
        return apiFetch(endpoint, {
            method: 'PUT',
            body: bodyData
        });
    },

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