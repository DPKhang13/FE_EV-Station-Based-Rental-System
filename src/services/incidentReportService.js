import api from './api';

/**
 * Incident Report Service
 * Quản lý báo cáo sự cố xe
 */

export const incidentReportService = {
  /**
   * Lấy tất cả danh sách báo cáo sự cố
   * GET /api/incident-reports/getAll
   */
  getAll: async () => {
    return await api.get('/incident-reports/getAll');
  },

  /**
   * Lấy báo cáo sự cố theo ID
   * GET /api/incident-reports/get/{incidentId}
   */
  getById: async (incidentId) => {
    return await api.get(`/incident-reports/get/${incidentId}`);
  },

  /**
   * Lấy báo cáo sự cố theo vehicleId
   * GET /api/incident-reports/getByVehicleId/{vehicleId}
   */
  getByVehicleId: async (vehicleId) => {
    return await api.get(`/incident-reports/getByVehicleId/${vehicleId}`);
  },

  /**
   * Tạo mới báo cáo sự cố
   * POST /api/incident-reports/create
   */
  create: async (incidentData) => {
    return await api.post('/incident-reports/create', incidentData);
  },

  /**
   * Cập nhật báo cáo sự cố
   * PUT /api/incident-reports/update/{incidentId}
   */
  update: async (incidentId, incidentData) => {
    return await api.put(`/incident-reports/update/${incidentId}`, incidentData);
  },

  /**
   * Xóa báo cáo sự cố
   * DELETE /api/incident-reports/delete/{incidentId}
   */
  delete: async (incidentId) => {
    return await api.delete(`/incident-reports/delete/${incidentId}`);
  }
};

export default incidentReportService;

