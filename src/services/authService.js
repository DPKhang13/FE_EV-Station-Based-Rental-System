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
  stationId: response.stationId, // ✅ thêm dòng này
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
   

    /**
     * Gửi OTP quên mật khẩu
     * POST /api/auth/account/forget
     */
    forgotPassword: async (email) => {
  return await api.post(`/auth/account/forget?email=${encodeURIComponent(email)}`);
}
,

    /**
     * Xác thực OTP quên mật khẩu
     * POST /api/auth/account/verify
     */
   verifyForgotPasswordOTP: async (email, otp) => {
  return await api.post(
    `/auth/account/verify?email=${encodeURIComponent(email)}&inputOtp=${encodeURIComponent(otp)}`
  );
},


    /**
     * Đặt lại mật khẩu
     * POST /api/auth/account/reset-password
     */
  resetPassword: async (email, password, otp) => {
  return await api.post(`/auth/account/reset-password?inputOtp=${otp}`, {
    email,
    password
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
