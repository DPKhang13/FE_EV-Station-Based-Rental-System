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
     * Lấy feedback theo Order ID
     * GET /api/feedbacks/getByOrderId/{orderId}
     */
    getByOrderId: async (orderId) => {
        try {
            const response = await api.get(`/feedbacks/getByOrderId/${orderId}`);
            // API trả về array, trả về trực tiếp
            return response;
        } catch (error) {
            // Nếu lỗi 500 hoặc 404, có thể order chưa có feedback - trả về null thay vì throw
            const statusCode = error?.response?.status || error?.status;
            if (statusCode === 500 || statusCode === 404) {
                console.log(`ℹ️ [FeedbackService] Order ${orderId} chưa có feedback (status: ${statusCode})`);
                return null;
            }
            // Lỗi khác thì throw lại
            throw error;
        }
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
