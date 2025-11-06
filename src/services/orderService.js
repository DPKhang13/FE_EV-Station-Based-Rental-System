import api from './api';

/**
 * Order Service
 * Create, update, delete, pickup, return, get orders
 */

export const orderService = {
    /**
     * Tạo đơn hàng mới
     * POST /api/order/create
     */
    create: async (orderData) => {
        console.log('🚀 [orderService.create] Sending request to /api/order/create');
        console.log('📦 [orderService.create] Payload:', JSON.stringify(orderData, null, 2));
        console.log('🔍 [orderService.create] Field types:');
        Object.keys(orderData).forEach(key => {
            const value = orderData[key];
            console.log(`  - ${key}:`, value, `| type: ${typeof value} | isNumber: ${typeof value === 'number'} | isNaN: ${isNaN(value)}`);
        });

        // ✅ VALIDATE trước khi gửi
        if (orderData.vehicleId && typeof orderData.vehicleId !== 'number') {
            console.error('❌❌❌ vehicleId phải là NUMBER, nhưng đang là:', typeof orderData.vehicleId);
        }
        if (orderData.plannedHours && typeof orderData.plannedHours !== 'number') {
            console.error('❌❌❌ plannedHours phải là NUMBER, nhưng đang là:', typeof orderData.plannedHours);
        }

        return await api.post('/order/create', orderData);
    },
    getPendingOrders: async () => {
        return await api.get('/order/pending-verification');
    },

    /**
     * Lấy tất cả đơn hàng
     * GET /api/order/getAll
     */
    getAll: async () => {
        return await api.get('/order/getAll');
    },

    /**
     * Lấy đơn hàng của tôi
     * GET /api/order/get/my-orders
     */
    getMyOrders: async () => {
        return await api.get('/order/get/my-orders');
    },


    /**
     * Cập nhật đơn hàng
     * PUT /api/order/update/{orderId}
     */
    update: async (orderId, orderData) => {
        return await api.put(`/order/update/${orderId}`, orderData);
    },

    /**
     * Xóa đơn hàng
     * DELETE /api/order/delete/{orderId}
     */
    delete: async (orderId) => {
        return await api.delete(`/order/delete/${orderId}`);
    },

    /**
     * Pickup - Nhận xe
     * POST /api/order/{orderId}/pickup
     */
    pickup: async (orderId, pickupData) => {
        return await api.post(`/order/${orderId}/pickup`, pickupData);
    },

    /**
     * Return - Trả xe
     * POST /api/order/{orderId}/return
     */
    return: async (orderId, returnData) => {
        try {
            const res = await api.post(`/order/${orderId}/return`, returnData);
            const data = res?.data ?? res;
            console.log("✅ [orderService.return] Kết quả API:", data);
            return data;
        } catch (error) {
            console.error("❌ [orderService.return] Lỗi:", error);
            throw error;
        }
    },

    /**
     * Get order by ID with preview-return data
     * GET /api/order/{orderId}/preview-return
     */
    get: async (orderId) => {
        try {
            const res = await api.get(`/order/${orderId}/preview-return`);
            const data = res?.data ?? res;
            console.log("✅ [orderService.get] Kết quả API:", data);
            return data;
        } catch (error) {
            console.error("❌ [orderService.get] Lỗi:", error);
            throw error;
        }
    },

    /**
     * Get order return preview với status và remainingAmount
     * GET /api/order/{orderId}/preview-return
     */
    getReturnPreview: async (orderId) => {
        try {
            const res = await api.get(`/order/${orderId}/preview-return`);
            const data = res?.data ?? res;
            console.log(`✅ [orderService.getReturnPreview] Order ${orderId}:`, data);
            return data;
        } catch (error) {
            console.error(`❌ [orderService.getReturnPreview] Order ${orderId} error:`, error);
            throw error;
        }
    },

};

export default orderService;
