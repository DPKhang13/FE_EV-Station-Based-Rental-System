import api from './api';

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

        // Lưu token vào localStorage
        if (response.accessToken) {
            localStorage.setItem('accessToken', response.accessToken);
        }
        if (response.refreshToken) {
            localStorage.setItem('refreshToken', response.refreshToken);
        }

        return response;
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
    verifyOTP: async (otp,email) => {
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
            // Clear tokens dù API success hay fail
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        }
    },

    /**
     * Làm mới AccessToken
     * POST /api/auth/refresh
     */
    refreshToken: async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await api.post('/auth/refresh', { refreshToken });

        if (response.accessToken) {
            localStorage.setItem('accessToken', response.accessToken);
        }

        return response;
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
