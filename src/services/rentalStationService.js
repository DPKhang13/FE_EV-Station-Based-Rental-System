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
    // ✅ Normalize status về lowercase để khớp với backend (available|rental|maintenance|checking)
    let normalizedStatus = status;
    if (status) {
      const statusUpper = status.toUpperCase();
      const statusMap = {
        "AVAILABLE": "available",
        "RENTED": "rental",
        "RENTAL": "rental",
        "MAINTENANCE": "maintenance",
        "CHECKING": "checking",
        "BOOKED": "available" // BOOKED không được backend hỗ trợ, map về available
      };
      normalizedStatus = statusMap[statusUpper] || status.toLowerCase();
    }

    // ⭐⭐ VALIDATION: Kiểm tra pin trước khi cho phép chuyển sang trạng thái "available" ⭐⭐
    if (normalizedStatus === "available") {
      const batteryPercent = Number(String(battery).replace("%", "").trim());
      if (batteryPercent <= 60) {
        throw new Error(`Không thể chuyển sang trạng thái 'Sẵn sàng'. Pin phải trên 60%. Pin hiện tại: ${batteryPercent}%.`);
      }
    }

    const body = {
       // ✅ đúng key swagger (không dấu %)
      status: normalizedStatus || undefined,
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
