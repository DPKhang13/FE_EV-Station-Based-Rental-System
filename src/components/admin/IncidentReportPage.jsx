// components/admin/IncidentReportPage.jsx
import React, { useEffect, useState } from "react";
import { incidentReportService } from "../../services/incidentReportService";
import { getVehicles } from "../../services/vehicleService";
import "./IncidentReportPage.css";

const IncidentReportPage = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filters, setFilters] = useState({
    severity: "",
    search: ""
  });
  const [vehiclesMap, setVehiclesMap] = useState(new Map()); // Cache vehicles để tránh gọi API nhiều lần

  useEffect(() => {
    fetchIncidents();
  }, []);

  // Fetch tất cả vehicles một lần và cache lại
  const fetchAllVehicles = async () => {
    try {
      const vehicles = await getVehicles();
      const map = new Map();
      vehicles.forEach(vehicle => {
        const id = vehicle.vehicleId || vehicle.id || vehicle.vehicle_id;
        if (id) {
          map.set(Number(id), vehicle);
        }
      });
      setVehiclesMap(map);
      console.log("✅ Cached vehicles:", map.size, "xe");
      return map;
    } catch (error) {
      console.warn("⚠️ Không thể lấy danh sách vehicles:", error);
      return new Map();
    }
  };

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      
      // Fetch vehicles trước để cache
      const vehiclesCache = await fetchAllVehicles();
      
      const data = await incidentReportService.getAll();
      console.log(" Raw data from API:", data);
      
      const incidentsList = Array.isArray(data) ? data : (data?.data || []);
      console.log(" Processed incidents list:", incidentsList);
      
      // Map dữ liệu và lấy thông tin vehicle từ cache
      const mappedIncidents = incidentsList.map((incident) => {
        const vehicleId = incident.vehicleId;
        let vehicleInfo = null;
        
        // Nếu có vehicle object trong response thì dùng
        if (incident.vehicle && typeof incident.vehicle === 'object') {
          vehicleInfo = incident.vehicle;
        } else if (vehicleId && vehiclesCache.has(Number(vehicleId))) {
          // Lấy từ cache
          vehicleInfo = vehiclesCache.get(Number(vehicleId));
        }
        
        // Lấy tên người báo cáo từ fullName
        const reporterName = incident.fullName || incident.reportedBy || incident.reportedByName || incident.reporterName || incident.reporter || "N/A";
        
        // Lấy thông tin trạm từ vehicle hoặc từ incident
        const stationName = vehicleInfo?.stationName || 
                          vehicleInfo?.rentalStation?.name || 
                          vehicleInfo?.station?.name ||
                          incident.station?.name || 
                          incident.stationName || 
                          null;
        
        const stationId = vehicleInfo?.stationId || 
                         vehicleInfo?.rentalStation?.stationId ||
                         vehicleInfo?.station?.stationId ||
                         incident.station?.stationId ||
                         incident.stationId ||
                         null;
        
        const station = incident.station || 
                       (stationName ? { name: stationName, stationId: stationId } : {}) ||
                       (vehicleInfo?.rentalStation ? vehicleInfo.rentalStation : {}) ||
                       (vehicleInfo?.station ? vehicleInfo.station : {}) ||
                       {};
        
        return {
          ...incident,
          incidentId: incident.incidentId || incident.id || incident.incidentReportId,
          id: incident.incidentId || incident.id || incident.incidentReportId,
          vehicleId: vehicleId,
          vehicle: vehicleInfo ? {
            vehicleName: vehicleInfo.vehicleName || vehicleInfo.name || vehicleInfo.vehicle_name,
            plateNumber: vehicleInfo.plateNumber || vehicleInfo.plate_number,
            carmodel: vehicleInfo.carmodel || vehicleInfo.carModel || vehicleInfo.car_model,
            brand: vehicleInfo.brand,
            vehicleId: vehicleInfo.vehicleId || vehicleInfo.vehicle_id || vehicleId,
            stationId: stationId,
            stationName: stationName
          } : {
            vehicleId: vehicleId,
            vehicleName: null,
            plateNumber: null,
            carmodel: null,
            brand: null
          },
          vehicleName: vehicleInfo?.vehicleName || vehicleInfo?.name || vehicleInfo?.vehicle_name || null,
          plateNumber: vehicleInfo?.plateNumber || vehicleInfo?.plate_number || null,
          carmodel: vehicleInfo?.carmodel || vehicleInfo?.carModel || vehicleInfo?.car_model || null,
          // ✅ API không trả về severity, mặc định là MEDIUM
          severity: incident.severity || incident.severityLevel || "MEDIUM",
          description: incident.description || incident.incidentDescription || "",
          occurredOn: incident.occurredOn || incident.occurredOnDate || incident.occurredAt || incident.createdAt,
          occurredOnDate: incident.occurredOn || incident.occurredOnDate || incident.occurredAt || incident.createdAt,
          reportedBy: reporterName,
          reportedByName: reporterName,
          fullName: reporterName,
          reportedAt: incident.reportedAt || incident.createdAt,
          createdAt: incident.createdAt || incident.reportedAt,
          station: station,
          stationName: stationName,
          stationId: stationId,
          resolutionNotes: incident.resolutionNotes || incident.notes || incident.resolution || ""
        };
      });
      
      console.log("✅ Mapped incidents:", mappedIncidents);
      setIncidents(mappedIncidents);
    } catch (error) {
      console.error("❌ Lỗi tải danh sách sự cố:", error);
      console.error("❌ Error details:", error.response?.data || error.message);
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      // Format: "HH:mm:ss DD/MM/YYYY" (ví dụ: "21:16:54 26/11/2025")
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  };

  const getSeverityLabel = (severity) => {
    const map = {
      LOW: "Thấp",
      MEDIUM: "Trung bình",
      HIGH: "Cao",
      CRITICAL: "Nghiêm trọng"
    };
    return map[severity?.toUpperCase()] || severity || "N/A";
  };

  const getSeverityClass = (severity) => {
    const s = (severity || "").toUpperCase();
    if (s === "CRITICAL") return "severity-critical";
    if (s === "HIGH") return "severity-high";
    if (s === "MEDIUM") return "severity-medium";
    return "severity-low";
  };

  const handleViewDetail = async (incident) => {
    try {
      // ✅ Ưu tiên dùng dữ liệu từ danh sách vì đã được map đầy đủ
      // Chỉ gọi getById nếu cần thông tin bổ sung (như resolutionNotes)
      let detailData = { ...incident }; // Copy để không mutate state
      
      const incidentId = incident.incidentId || incident.id;
      if (incidentId) {
        try {
          // Gọi API để lấy thông tin chi tiết đầy đủ (có thể có thêm resolutionNotes)
          const apiResponse = await incidentReportService.getById(incidentId);
          const rawData = apiResponse?.data || apiResponse;
          
          // Nếu vehiclesMap trống, fetch lại
          let currentVehiclesMap = vehiclesMap;
          if (currentVehiclesMap.size === 0) {
            currentVehiclesMap = await fetchAllVehicles();
          }
          
          // Map lại dữ liệu giống như trong fetchIncidents
          const vehicleId = rawData.vehicleId || incident.vehicleId;
          let vehicleInfo = null;
          
          // Nếu có vehicle object trong response thì dùng
          if (rawData.vehicle && typeof rawData.vehicle === 'object') {
            vehicleInfo = rawData.vehicle;
          } else if (vehicleId && currentVehiclesMap.has(Number(vehicleId))) {
            // Lấy từ cache
            vehicleInfo = currentVehiclesMap.get(Number(vehicleId));
          } else if (incident.vehicle) {
            // Fallback: dùng vehicle từ incident (đã được map)
            vehicleInfo = incident.vehicle;
          }
          
          // Lấy tên người báo cáo từ fullName
          const reporterName = rawData.fullName || rawData.reportedBy || rawData.reportedByName || rawData.reporterName || rawData.reporter || incident.fullName || incident.reportedBy || "N/A";
          
          // Lấy thông tin trạm từ vehicle hoặc từ incident hoặc từ rawData
          const stationName = vehicleInfo?.stationName || 
                              vehicleInfo?.rentalStation?.name || 
                              vehicleInfo?.station?.name ||
                              rawData.station?.name ||
                              rawData.stationName ||
                              incident.stationName ||
                              incident.station?.name ||
                              null;
          
          const stationId = vehicleInfo?.stationId || 
                           vehicleInfo?.rentalStation?.stationId ||
                           vehicleInfo?.station?.stationId ||
                           rawData.station?.stationId ||
                           rawData.stationId ||
                           incident.stationId ||
                           incident.station?.stationId ||
                           null;
          
          const station = rawData.station || 
                         incident.station ||
                         (stationName ? { name: stationName, stationId: stationId } : {}) ||
                         (vehicleInfo?.rentalStation ? vehicleInfo.rentalStation : {}) ||
                         (vehicleInfo?.station ? vehicleInfo.station : {}) ||
                         {};
          
          // Merge dữ liệu: ưu tiên dữ liệu từ danh sách, chỉ override nếu API có thông tin mới
          detailData = {
            ...incident, // Giữ nguyên dữ liệu đã map từ danh sách
            ...rawData,  // Override với dữ liệu từ API nếu có
            incidentId: rawData.incidentId || rawData.id || rawData.incidentReportId || incidentId,
            id: rawData.incidentId || rawData.id || rawData.incidentReportId || incidentId,
            vehicleId: vehicleId || incident.vehicleId,
            vehicle: vehicleInfo ? {
              vehicleName: vehicleInfo.vehicleName || vehicleInfo.name || vehicleInfo.vehicle_name,
              plateNumber: vehicleInfo.plateNumber || vehicleInfo.plate_number,
              carmodel: vehicleInfo.carmodel || vehicleInfo.carModel || vehicleInfo.car_model,
              brand: vehicleInfo.brand,
              vehicleId: vehicleInfo.vehicleId || vehicleInfo.vehicle_id || vehicleId,
              stationId: stationId,
              stationName: stationName
            } : incident.vehicle || {
              vehicleId: vehicleId || incident.vehicleId,
              vehicleName: null,
              plateNumber: null,
              carmodel: null,
              brand: null
            },
            vehicleName: vehicleInfo?.vehicleName || vehicleInfo?.name || vehicleInfo?.vehicle_name || incident.vehicleName || null,
            plateNumber: vehicleInfo?.plateNumber || vehicleInfo?.plate_number || incident.plateNumber || null,
            carmodel: vehicleInfo?.carmodel || vehicleInfo?.carModel || vehicleInfo?.car_model || incident.carmodel || null,
            severity: rawData.severity || rawData.severityLevel || incident.severity || "MEDIUM",
            description: rawData.description || rawData.incidentDescription || incident.description || "",
            occurredOn: rawData.occurredOn || rawData.occurredOnDate || rawData.occurredAt || rawData.createdAt || incident.occurredOn || incident.occurredOnDate || incident.createdAt,
            occurredOnDate: rawData.occurredOn || rawData.occurredOnDate || rawData.occurredAt || rawData.createdAt || incident.occurredOnDate || incident.createdAt,
            reportedBy: reporterName,
            reportedByName: reporterName,
            fullName: reporterName,
            reportedAt: rawData.reportedAt || rawData.createdAt || incident.reportedAt || incident.createdAt,
            createdAt: rawData.createdAt || rawData.reportedAt || incident.createdAt,
            station: station,
            stationName: stationName,
            stationId: stationId,
            resolutionNotes: rawData.resolutionNotes || rawData.notes || rawData.resolution || incident.resolutionNotes || ""
          };
        } catch (apiError) {
          console.warn("⚠️ Không thể lấy chi tiết từ API, dùng dữ liệu từ danh sách:", apiError);
          // Nếu lỗi API, dùng dữ liệu từ danh sách (đã được map đầy đủ)
          detailData = incident;
        }
      }
      
      console.log("📋 Detail data for modal:", detailData);
      setSelectedIncident(detailData);
      setShowDetailModal(true);
    } catch (error) {
      console.error("❌ Lỗi tải chi tiết sự cố:", error);
      // Nếu lỗi, vẫn hiển thị dữ liệu từ danh sách
      setSelectedIncident(incident);
      setShowDetailModal(true);
    }
  };

  // Lọc sự cố
  const filteredIncidents = incidents.filter((incident) => {
    if (filters.severity && (incident.severity || "").toUpperCase() !== filters.severity.toUpperCase()) {
      return false;
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        (incident.vehicle?.plateNumber || "").toLowerCase().includes(searchLower) ||
        (incident.vehicle?.vehicleName || "").toLowerCase().includes(searchLower) ||
        (incident.description || "").toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  if (loading) {
    return <div className="incident-loading">⏳ Đang tải danh sách sự cố...</div>;
  }

  return (
    <div className="incident-page">
      <div className="incident-header">
        <h1 className="incident-title">BÁO CÁO SỰ CỐ</h1>
      </div>

      {/* Bộ lọc và thống kê */}
      <div className="incident-filters">
        <div className="filter-group">
          <label>Mức độ</label>
          <select
            value={filters.severity}
            onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
          >
            <option value="">Tất cả</option>
            <option value="LOW">Thấp</option>
            <option value="MEDIUM">Trung bình</option>
            <option value="HIGH">Cao</option>
            <option value="CRITICAL">Nghiêm trọng</option>
          </select>
        </div>

        <div className="filter-group stat-box-inline">
          <label className="stat-label">Tổng sự cố</label>
          <span className="stat-value">{incidents.length}</span>
        </div>

        <div className="filter-group filter-search">
          <label>Tìm kiếm</label>
          <input
            type="text"
            placeholder="Biển số, tên xe, mô tả..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
      </div>

      {/* Bảng danh sách sự cố */}
      <div className="incident-table-container">
        {filteredIncidents.length === 0 ? (
          <div className="incident-empty">
            <div style={{ fontSize: 48 }}>📭</div>
            <p>Không có sự cố nào</p>
          </div>
        ) : (
          <table className="incident-table">
            <thead>
              <tr>
                <th>Mã sự cố</th>
                <th>Xe</th>
                <th>Biển số</th>
                <th>Loại xe</th>
                <th>Mô tả</th>
                <th>Mức độ</th>
                <th>Thời gian xảy ra</th>
                <th>Người báo cáo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncidents.map((incident) => (
                <tr key={incident.incidentId || incident.id}>
                  <td>#{incident.incidentId || incident.id}</td>
                  <td>{incident.vehicle?.vehicleName || incident.vehicleName || "N/A"}</td>
                  <td>{incident.vehicle?.plateNumber || incident.plateNumber || "N/A"}</td>
                  <td>{incident.vehicle?.carmodel || incident.vehicle?.carModel || "N/A"}</td>
                  <td className="description-cell">
                    {(incident.description || "").substring(0, 50)}
                    {(incident.description || "").length > 50 ? "..." : ""}
                  </td>
                  <td>
                    <span className={`severity-badge ${getSeverityClass(incident.severity)}`}>
                      {getSeverityLabel(incident.severity)}
                    </span>
                  </td>
                  <td>{formatDate(incident.occurredOn || incident.occurredOnDate)}</td>
                  <td>{incident.fullName || incident.reportedBy || incident.reportedByName || "N/A"}</td>
                  <td>
                    <button
                      className="btn-view-detail"
                      onClick={() => handleViewDetail(incident)}
                    >
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal chi tiết sự cố */}
      {showDetailModal && selectedIncident && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content incident-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi tiết sự cố #{selectedIncident.incidentId || selectedIncident.id}</h2>
              <button className="modal-close-btn" onClick={() => setShowDetailModal(false)}>×</button>
            </div>

            <div className="incident-detail-content">
              <div className="detail-section">
                <h3>Thông tin xe</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Tên xe:</label>
                    <span>{selectedIncident.vehicle?.vehicleName || selectedIncident.vehicleName || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <label>Biển số:</label>
                    <span>{selectedIncident.vehicle?.plateNumber || selectedIncident.plateNumber || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <label>Loại xe:</label>
                    <span>{selectedIncident.vehicle?.carmodel || selectedIncident.vehicle?.carModel || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <label>Hãng:</label>
                    <span>{selectedIncident.vehicle?.brand || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <label>Trạm:</label>
                    <span>{selectedIncident.station?.name || selectedIncident.stationName || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Thông tin sự cố</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Mức độ:</label>
                    <span className={`severity-badge ${getSeverityClass(selectedIncident.severity)}`}>
                      {getSeverityLabel(selectedIncident.severity)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Thời gian xảy ra:</label>
                    <span>{formatDate(selectedIncident.occurredOn || selectedIncident.occurredOnDate)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Thời gian báo cáo:</label>
                    <span>{formatDate(selectedIncident.reportedAt || selectedIncident.createdAt)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Người báo cáo:</label>
                    <span>
                      {selectedIncident.fullName || selectedIncident.reportedBy || selectedIncident.reportedByName || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Mô tả sự cố</h3>
                <div className="description-box">
                  {selectedIncident.description || "Không có mô tả"}
                </div>
              </div>

              {(selectedIncident.resolutionNotes || selectedIncident.notes) && (
                <div className="detail-section">
                  <h3>Ghi chú xử lý</h3>
                  <div className="description-box">
                    {selectedIncident.resolutionNotes || selectedIncident.notes}
                  </div>
                </div>
              )}

              <div className="modal-actions">
                <button
                  className="btn-cancel"
                  onClick={() => setShowDetailModal(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentReportPage;

