// pages/IncidentReportPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { maintenanceService } from "../services/maintenanceService";
import "./IncidentReportPage.css";

const IncidentReportPage = () => {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filters, setFilters] = useState({
    severity: "",
    search: ""
  });

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const data = await maintenanceService.getAllIncidents();
      const incidentsList = Array.isArray(data) ? data : (data?.data || []);
      setIncidents(incidentsList);
    } catch (error) {
      console.error("Lỗi tải danh sách sự cố:", error);
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("vi-VN");
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

  const handleViewDetail = (incident) => {
    setSelectedIncident(incident);
    setShowDetailModal(true);
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
        <div className="incident-stats">
          <div className="stat-box">
            <span className="stat-label">Tổng sự cố</span>
            <span className="stat-value">{incidents.length}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Nghiêm trọng</span>
            <span className="stat-value severity-critical">
              {incidents.filter(i => (i.severity || "").toUpperCase() === "CRITICAL").length}
            </span>
          </div>
        </div>
      </div>

      {/* Bộ lọc */}
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

        <div className="filter-group">
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
                  <td>{incident.reportedBy || incident.reportedByName || "N/A"}</td>
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
                    <span>{selectedIncident.reportedBy || selectedIncident.reportedByName || "N/A"}</span>
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

