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
    },

    /**
     * Verify VNPay payment từ Frontend
     * POST /api/payment/verify-vnpay
     */
    verifyVNPayPayment: async (vnpParams) => {
        try {
            console.log('🔄 [PaymentService] Verifying VNPay payment:', vnpParams);

            const response = await api.post('/payment/verify-vnpay', vnpParams);

            console.log('✅ [PaymentService] Verify response:', response);
            return response;
        } catch (error) {
            console.error('❌ [PaymentService] Verify error:', error);
            throw error;
        }
    }
};

export default paymentService;
