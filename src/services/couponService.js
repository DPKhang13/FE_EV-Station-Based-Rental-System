import api from './api';

/**
 * Coupon Service
 * Lay danh sach ma giam gia
 */

export const couponService = {
    /**
     * Hiển thị tất cả mã giảm giá
     * GET /api/coupon/showall
     */
    showAll: async () => {
        return await api.get('/coupon/showall');
    }
};

export default couponService;
