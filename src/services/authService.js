import api, { setAuthToken } from './api';

/**
 * Authentication Service
 * Các endpoint để quản lý tài khoản: đăng ký, đăng nhập, OTP, refresh token, quên mật khẩu
 */

export const authService = {
    /**
     * Đăng nhập tài khoản
     * POST /api/auth/login
     */
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });

        console.log('📥 API Login Response:', response);

        // ✅ Lưu token vào localStorage VÀ Cookie
        if (response.accessToken || response.jwtToken) {
            const token = response.accessToken || response.jwtToken;
            setAuthToken(token); // ← Set cả localStorage và cookie
        }
        if (response.refreshToken) {
            localStorage.setItem('refreshToken', response.refreshToken);
        }

        // Normalize response format for AuthContext
        const normalizedResponse = {
            jwtToken: response.accessToken || response.jwtToken || response.token,
            userId: response.userId || response.customerId || response.id,
            fullName: response.fullName || response.username || response.name,
            email: response.email,
            role: response.role,
            phone: response.phone || response.phoneNumber,
            address: response.address,
            dateOfBirth: response.dateOfBirth || response.dob,
            needOtp: response.needOtp,
            verifyUrl: response.verifyUrl
        };

        console.log('✅ Normalized Login Response:', normalizedResponse);

        return normalizedResponse;
    },

    /**
     * Đăng ký tài khoản bằng email
     * POST /api/auth/register
     */
    register: async (userData) => {
        return await api.post('/auth/register', userData);
    },

    /**
     * Xác minh OTP khi đăng ký
     * POST /api/auth/verify
     */
    verifyOTP: async (otp, email) => {
        return await api.post('/auth/verify', { otp, email });
    },

    /**
     * Đăng xuất
     * POST /api/auth/logout
     */
    logout: async () => {
        try {
            await api.post('/auth/logout');
        } finally {
            // ✅ Clear tokens và cookie dù API success hay fail
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            // Clear cookie
            document.cookie = 'AccessToken=; path=/; max-age=0';
            console.log('✅ Token cleared from localStorage and cookie');
        }
    },

    /**
     * Làm mới AccessToken
     * POST /api/auth/refresh
     * Backend đọc RefreshToken từ Cookie, trả về AccessToken mới trong Cookie
     */
    refreshToken: async () => {
        try {
            // ✅ Backend đọc RefreshToken từ cookie (@CookieValue)
            // Không cần gửi refreshToken trong body
            const response = await api.post('/auth/refresh', {});

            console.log('✅ Token refreshed successfully');

            // Backend tự set AccessToken cookie mới, frontend chỉ cần đọc lại
            // Nhưng vẫn lưu vào localStorage để restore sau reload
            const cookies = document.cookie.split(';');
            const accessTokenCookie = cookies.find(c => c.trim().startsWith('AccessToken='));
            if (accessTokenCookie) {
                const token = accessTokenCookie.split('=')[1];
                localStorage.setItem('accessToken', token);
                console.log('✅ New AccessToken saved to localStorage');
            }

            return response;
        } catch (error) {
            console.error('❌ Failed to refresh token:', error);
            throw error;
        }
    },

    /**
     * Gửi OTP quên mật khẩu
     * POST /api/auth/account/forget
     */
    forgotPassword: async (email) => {
        return await api.post('/auth/account/forget', { email });
    },

    /**
     * Xác thực OTP quên mật khẩu
     * POST /api/auth/account/verify
     */
    verifyForgotPasswordOTP: async (email, otp) => {
        return await api.post('/auth/account/verify', { email, otp });
    },

    /**
     * Đặt lại mật khẩu
     * POST /api/auth/account/reset-password
     */
    resetPassword: async (email, newPassword, confirmPassword) => {
        return await api.post('/auth/account/reset-password', {
            email,
            newPassword,
            confirmPassword
        });
    },
    getProfilePendingVerification: async () => {
        return await api.get('/auth/verify-profile/pending');
    },
    verifyProfileByUserId: async (userId) => {
        // PUT /api/auth/verify-profile/{userId}
        return await api.put(`/auth/verify-profile/${userId}`);
    }
};

export default authService;
