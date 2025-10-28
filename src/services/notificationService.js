import api from './api';

/**
 * Notification Service
 * User nhận thông báo từ dịch vụ
 */

export const notificationService = {
    /**
     * Lấy tất cả thông báo
     * GET /api/notification/getAllList
     */
    getAll: async () => {
        return await api.get('/notification/getAllList');
    },

    /**
     * Lấy thông báo theo ID
     * GET /api/notification/getById/{notificationId}
     */
    getById: async (notificationId) => {
        return await api.get(`/notification/getById/${notificationId}`);
    },

    /**
     * Tạo thông báo mới
     * POST /api/notification/create
     */
    create: async (notificationData) => {
        return await api.post('/notification/create', notificationData);
    },

    /**
     * Cập nhật thông báo
     * PUT /api/notification/update/{notificationId}
     */
    update: async (notificationId, notificationData) => {
        return await api.put(`/notification/update/${notificationId}`, notificationData);
    },

    /**
     * Xóa thông báo
     * DELETE /api/notification/delete/{notificationId}
     */
    delete: async (notificationId) => {
        return await api.delete(`/notification/delete/${notificationId}`);
    }
};

export default notificationService;
