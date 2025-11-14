import api, { apiFetch } from "./api";

export const paymentService = {
    /**
     * Tạo URL thanh toán MoMo
     */
    createMoMoPayment: async (paymentData) => {
        return await api.post('/payment/url', paymentData);
    },

    /**
     * Verify MoMo payment từ FE
     */
    verifyMoMoPayment: async (params) => {
        return await apiFetch('/payment/verify', {
            method: "POST",
            body: JSON.stringify(params)
        });
    }
};

export default paymentService;
