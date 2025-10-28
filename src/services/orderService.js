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
        return await api.post('/order/create', orderData);
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
        return await api.post(`/order/${orderId}/return`, returnData);
    }
};

export default orderService;
