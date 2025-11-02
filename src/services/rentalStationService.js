import api from './api';

/**
 * Rental Station Service
 * Search, chinh sua va update dia chi tram
 */

export const rentalStationService = {
    /**
     * Lấy tất cả trạm
     * GET /api/rentalstation/getAll
     */
    getAll: async () => {
        return await api.get('/rentalstation/getAll');
    },

    /**
     * Tìm kiếm trạm
     * GET /api/rentalstation/search
     */
    search: async (searchParams) => {
        const queryString = new URLSearchParams(searchParams).toString();
        return await api.get(`/rentalstation/search?${queryString}`);
    },

    /**
     * Tạo trạm mới
     * POST /api/rentalstation/create
     */
    create: async (stationData) => {
        return await api.post('/rentalstation/create', stationData);
    },

    /**
     * Cập nhật trạm
     * PUT /api/rentalstation/update/{id}
     */
    update: async (id, stationData) => {
        return await api.put(`/rentalstation/update/${id}`, stationData);
    },

   updateVehicleStatus: async (vehicle_id, {status,battery }) => {
  try {
    const body = {
       // ✅ đúng key swagger (không dấu %)
      status: status || undefined,
      batteryStatus: `${battery}%`,
    };

    const res = await api.put(`/vehicles/updateStatus/${vehicle_id}`, body);
    return res.data;
  } catch (err) {
    console.error("❌ Lỗi updateVehicleStatus:", err);
    throw err;
  }
},


};

export default rentalStationService;
