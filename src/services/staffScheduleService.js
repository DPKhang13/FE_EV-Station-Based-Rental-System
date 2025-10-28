import api from './api';

/**
 * Staff Schedule Service
 * Create, update, search staff schedule
 */

export const staffScheduleService = {
    /**
     * Lấy danh sách lịch làm việc
     * GET /api/staffschedule/list
     */
    getList: async () => {
        return await api.get('/staffschedule/list');
    },

    /**
     * Tìm kiếm lịch làm việc
     * GET /api/staffschedule/search
     */
    search: async (searchParams) => {
        const queryString = new URLSearchParams(searchParams).toString();
        return await api.get(`/staffschedule/search?${queryString}`);
    },

    /**
     * Tạo lịch làm việc mới
     * POST /api/staffschedule/create
     */
    create: async (scheduleData) => {
        return await api.post('/staffschedule/create', scheduleData);
    },

    /**
     * Cập nhật lịch làm việc
     * PUT /api/staffschedule/update/{id}
     */
    update: async (id, scheduleData) => {
        return await api.put(`/staffschedule/update/${id}`, scheduleData);
    }
};

export default staffScheduleService;
