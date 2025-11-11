import api from './api';

/**
 * Pricing Rule Service
 * Lấy bảng giá và cập nhật bảng giá theo seatCount & variant
 */

export const pricingRuleService = {
    /**
     * Lấy tất cả bảng giá
     * GET /api/pricingrules/get
     */
    getAll: async () => {
        return await api.get('/pricing-rules');
    },

    /**
     * Cập nhật bảng giá theo seatCount và variant
     * PUT /api/pricingrules/update/{seatCount}/{variant}
     */
    update: async (seatCount, variant, pricingData) => {
        return await api.put(`/pricing-rules/${seatCount}/${variant}`, pricingData);
    }
};

export default pricingRuleService;
