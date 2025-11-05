import api from './api';

/**
 * Maintenance Service
 * Rating, comments about service
 */

export const maintenanceService = {
    /**
     * Lấy tất cả danh sách bảo trì
     * GET /api/maintanences/getAllList
     */
    getAll: async () => {
        return await api.get('/maintanences/getAllList');
    },

    /**
     * Lấy bảo trì theo ID
     * GET /api/maintanences/getById/{maintenanceId}
     */
    getById: async (maintenanceId) => {
        return await api.get(`/maintanences/getById/${maintenanceId}`);
    },

     createIncident: async (incidentData) => {
    return await api.post('/incidents/create', incidentData);
  },

  /**
   * 🛠️ Tạo mới yêu cầu bảo trì (maintenance)
   * POST /api/maintenances/create
   */
  createMaintenance: async (maintenanceData) => {
    return await api.post('/maintenances/create', maintenanceData);
  },
    /**
     * Cập nhật bảo trì
     * PUT /api/maintanences/update/{maintenanceId}
     */
    update: async (maintenanceId, maintenanceData) => {
        return await api.put(`/maintanences/update/${maintenanceId}`, maintenanceData);
    },

    /**
     * Xóa bảo trì
     * DELETE /api/maintanences/delete/{maintenanceId}
     */
    delete: async (maintenanceId) => {
        return await api.delete(`/maintanences/delete/${maintenanceId}`);
    }

};

export default maintenanceService;
