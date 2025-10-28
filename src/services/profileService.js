import api from './api';

/**
 * Profile Service
 * Read, update profile
 */

export const profileService = {
    /**
     * Cập nhật profile
     * POST /api/profile/update
     */
    update: async (profileData) => {
        return await api.post('/profile/update', profileData);
    }
};

export default profileService;
