import api from './api';

/**
 * Profile Service
 * Read, update profile
 */

export const profileService = {
    /**
     * Lấy profile của user hiện tại từ database
     * Thử nhiều endpoint khác nhau
     */
    getProfile: async (userId = null) => {
        const endpoints = [
            '/customer/profile',      // Thử này trước (phổ biến nhất)
            '/profile/me',
            '/auth/profile',
            '/user/profile',
            '/profile',
        ];
        
        // Nếu có userId, thử với userId trong URL
        if (userId) {
            endpoints.unshift(`/customer/${userId}`);
            endpoints.unshift(`/customer/profile/${userId}`);
            endpoints.unshift(`/profile/${userId}`);
        }
        
        let lastError;
        
        for (const endpoint of endpoints) {
            try {
                console.log(`🔍 Trying to fetch profile from: ${endpoint}`);
                const response = await api.get(endpoint);
                console.log(`✅ Success! Profile fetched from ${endpoint}:`, response);
                
                // Nếu response có data, thử fetch photos riêng
                const profileData = response?.data || response;
                if (profileData && userId) {
                    try {
                        console.log('🔍 Trying to fetch photos separately...');
                        const photosResponse = await api.get(`/customer/${userId}/photos`);
                        console.log('✅ Photos fetched:', photosResponse);
                        // Merge photos vào profile data
                        if (photosResponse?.data || photosResponse) {
                            const photos = photosResponse?.data || photosResponse;
                            return {
                                ...response,
                                data: {
                                    ...profileData,
                                    ...photos
                                }
                            };
                        }
                    } catch (photoErr) {
                        console.warn('⚠️ Could not fetch photos separately:', photoErr.message);
                    }
                }
                
                return response;
            } catch (err) {
                console.warn(`⚠️ Failed to fetch from ${endpoint}:`, err.message);
                lastError = err;
                // Continue to next endpoint
            }
        }
        
        // Nếu tất cả endpoints đều fail
        throw lastError || new Error('Failed to fetch profile from all available endpoints');
    },

    /**
     * Cập nhật profile
     * POST /api/profile/update
     */
    update: async (profileData) => {
        console.log('📤 Updating profile with data:', profileData);
        const response = await api.post('/profile/update', profileData);
        console.log('✅ Profile update response:', response);
        return response;
    }
};

export default profileService;
