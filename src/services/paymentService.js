import api from './api';

/**
 * Payment Service
 * Thanh toán VNPay
 */

export const paymentService = {
    /**
     * Tạo URL thanh toán VNPay
     * POST /api/payment/url
     */
    createPaymentUrl: async (paymentData) => {
        return await api.post('/payment/url', paymentData);
    },

    /**
     * VNPay callback
     * GET /api/payment/vnpay-callback
     */
    vnpayCallback: async (queryParams) => {
        const queryString = new URLSearchParams(queryParams).toString();
        return await api.get(`/payment/vnpay-callback?${queryString}`);
    }
};

export default paymentService;
