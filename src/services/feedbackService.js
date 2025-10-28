import api from './api';

/**
 * Feedback Service
 * Rating, comments about service
 */

export const feedbackService = {
    /**
     * Lấy tất cả feedback
     * GET /api/feedbacks/getAllList
     */
    getAll: async () => {
        return await api.get('/feedbacks/getAllList');
    },

    /**
     * Lấy feedback theo ID
     * GET /api/feedbacks/getById/{feedbackId}
     */
    getById: async (feedbackId) => {
        return await api.get(`/feedbacks/getById/${feedbackId}`);
    },

    /**
     * Tạo feedback mới
     * POST /api/feedbacks/create
     */
    create: async (feedbackData) => {
        return await api.post('/feedbacks/create', feedbackData);
    },

    /**
     * Cập nhật feedback
     * PUT /api/feedbacks/update/{feedbackId}
     */
    update: async (feedbackId, feedbackData) => {
        return await api.put(`/feedbacks/update/${feedbackId}`, feedbackData);
    },

    /**
     * Xóa feedback
     * DELETE /api/feedbacks/delete/{feedbackId}
     */
    delete: async (feedbackId) => {
        return await api.delete(`/feedbacks/delete/${feedbackId}`);
    }
};

export default feedbackService;
