import React, { useState, useEffect } from "react";
import vehicleService from "../../services/vehicleService";
import { api } from "../../services/api";
import "./PopupCapNhatXe.css";

const PopupCapNhatXe = ({ vehicle, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    status: "",
    batteryStatus: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [incidentDescription, setIncidentDescription] = useState("");
  const [incidentReports, setIncidentReports] = useState([]);
  const [loadingIncidents, setLoadingIncidents] = useState(false);
  const [editingIncidentId, setEditingIncidentId] = useState(null);
  const [editDescription, setEditDescription] = useState("");

  // Khởi tạo giá trị mặc định từ vehicle
  useEffect(() => {
    if (vehicle) {
      // Map trạng thái tiếng Việt về tiếng Anh cho API
      const statusMap = {
        "Có sẵn": "AVAILABLE",
        "Đang cho thuê": "RENTAL",
        "Bảo trì": "MAINTENANCE",
        "Đang kiểm tra": "CHECKING",
        "Đã đặt trước": "BOOKED",
      };

      setFormData({
        status: statusMap[vehicle.trangThai] || vehicle.status || "",
        batteryStatus: `${vehicle.pin}%` || "",
      });
    }
  }, [vehicle]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ⭐⭐ FETCH DANH SÁCH BÁO CÁO SỰ CỐ ⭐⭐
  const fetchIncidentReports = async () => {
    try {
      setLoadingIncidents(true);
      
      // ⭐⭐ API GET /api/incident-reports/getByVehicleId/{vehicleId} ⭐⭐
      const data = await api.get(`/incident-reports/getByVehicleId/${vehicle.id}`);
      
      // API trả về object hoặc array, xử lý cả 2 trường hợp
      const reports = Array.isArray(data) ? data : (data.data || (data.incidentId ? [data] : []));
      setIncidentReports(reports);
      console.log("✅ Danh sách báo cáo sự cố:", reports);
    } catch (err) {
      console.error("❌ Lỗi khi lấy danh sách báo cáo sự cố:", err);
      // Nếu API không tồn tại hoặc lỗi, set mảng rỗng
      setIncidentReports([]);
    } finally {
      setLoadingIncidents(false);
    }
  };

  // ⭐⭐ TẠO BÁO CÁO SỰ CỐ MỚI ⭐⭐
  const handleCreateIncident = async () => {
    if (!incidentDescription.trim()) {
      alert("Vui lòng nhập mô tả sự cố!");
      return;
    }

    try {
      setLoadingIncidents(true);
      
      // ⭐⭐ API POST /api/incident-reports/create - chỉ truyền description ⭐⭐
      const result = await api.post(`/incident-reports/create`, {
        vehicleId: vehicle.id,
        description: incidentDescription.trim()
      });
      
      console.log("✅ Tạo báo cáo sự cố thành công:", result);
      alert("✅ Đã tạo báo cáo sự cố thành công!");
      
      // Reset và refresh danh sách
      setIncidentDescription("");
      await fetchIncidentReports();
    } catch (err) {
      console.error("❌ Lỗi khi tạo báo cáo sự cố:", err);
      const errorMessage = err.response?.data?.message || err.message || "Không thể tạo báo cáo sự cố. Vui lòng thử lại.";
      alert(`Lỗi: ${errorMessage}`);
    } finally {
      setLoadingIncidents(false);
    }
  };

  // ⭐⭐ CẬP NHẬT BÁO CÁO SỰ CỐ ⭐⭐
  const handleUpdateIncident = async (incidentId) => {
    if (!editDescription.trim()) {
      alert("Vui lòng nhập mô tả sự cố!");
      return;
    }

    try {
      setLoadingIncidents(true);
      
      // ⭐⭐ API PUT /api/incident-reports/update/{incidentId} - chỉ update description ⭐⭐
      const result = await api.put(`/incident-reports/update/${incidentId}`, {
        description: editDescription.trim()
      });
      
      console.log("✅ Cập nhật báo cáo sự cố thành công:", result);
      alert("✅ Đã cập nhật báo cáo sự cố thành công!");
      
      // Reset và refresh danh sách
      setEditingIncidentId(null);
      setEditDescription("");
      await fetchIncidentReports();
    } catch (err) {
      console.error("❌ Lỗi khi cập nhật báo cáo sự cố:", err);
      const errorMessage = err.response?.data?.message || err.message || "Không thể cập nhật báo cáo sự cố. Vui lòng thử lại.";
      alert(`Lỗi: ${errorMessage}`);
    } finally {
      setLoadingIncidents(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log("🚀 Đang cập nhật xe ID:", vehicle.id);
      console.log("📦 Dữ liệu gửi:", formData);

      // ⭐⭐ RÀNG BUỘC: Nếu xe đang "Đã đặt trước" và muốn đổi sang trạng thái khác ⭐⭐
      const statusMap = {
        "Có sẵn": "AVAILABLE",
        "Đang cho thuê": "RENTAL",
        "Bảo trì": "MAINTENANCE",
        "Đang kiểm tra": "CHECKING",
        "Đã đặt trước": "BOOKED",
      };
      const currentStatus = statusMap[vehicle?.trangThai] || vehicle?.status || "";
      const newStatus = formData.status && formData.status.trim() ? formData.status.trim() : null;
      
      // ⭐⭐ KHÔNG CHO PHÉP ĐỔI TRẠNG THÁI KHI XE ĐANG "ĐÃ ĐẶT TRƯỚC" (TRỪ KHI ĐANG "ĐANG KIỂM TRA") ⭐⭐
      // Nếu xe đang CHECKING, cho phép đổi trạng thái bình thường (không cần kiểm tra BOOKED)
      if (currentStatus !== "CHECKING" && currentStatus === "BOOKED" && newStatus && newStatus !== "BOOKED") {
        setLoading(false);
        setShowWarningModal(true);
        setPendingStatusChange(newStatus);
        return;
      }

      // Chuẩn bị payload - chỉ gửi field nào có giá trị
      const payload = {};
      if (formData.status && formData.status.trim()) {
        payload.status = formData.status.trim();
      }
      if (formData.batteryStatus && formData.batteryStatus.trim()) {
        payload.batteryStatus = formData.batteryStatus.trim();
      }

      // Gọi API cập nhật
      await vehicleService.updateVehicleStatus(vehicle.id, payload);

      console.log("✅ Cập nhật thành công!");
      alert("✅ Cập nhật xe thành công!");

      // Callback để reload dữ liệu
      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (err) {
      console.error("❌ Lỗi khi cập nhật xe:", err);
      setError(err.message || "Không thể cập nhật xe. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content-update" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header-update">
          <h2>Cập nhật trạng thái hoặc pin</h2>
          <button className="close-btn-update" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="popup-body-update">
          {/* Thông tin xe */}
          <div className="vehicle-info-box">
            {/* Cột trái: Xe và Biển số */}
            <div className="vehicle-info-item">
              <p><strong>Xe:</strong> {vehicle?.ten || "N/A"}</p>
            </div>
            <div className="vehicle-info-item">
              <p><strong>Carmodel:</strong> {vehicle?.carmodel || "N/A"}</p>
            </div>
            {/* Cột phải: Carmodel và Màu sắc */}
            <div className="vehicle-info-item">
              <p><strong>Biển số:</strong> {vehicle?.bienSo || "N/A"}</p>
            </div>
            <div className="vehicle-info-item">
              <p><strong>Màu sắc:</strong> {vehicle?.color || "N/A"}</p>
            </div>
          </div>

          {/* Trạng thái - Toggle Switches cho các trạng thái */}
          <div className="form-group-update">
            <label htmlFor="status" style={{ fontWeight: '600', marginBottom: '12px', display: 'block' }}>
              TRẠNG THÁI <span style={{ color: '#DC0000' }}>*</span>
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              {(() => {
                // ⭐⭐ LẤY TRẠNG THÁI HIỆN TẠI CỦA XE ⭐⭐
                const statusMap = {
                  "Có sẵn": "AVAILABLE",
                  "Đang cho thuê": "RENTAL",
                  "Bảo trì": "MAINTENANCE",
                  "Đang kiểm tra": "CHECKING",
                  "Đã đặt trước": "BOOKED",
                };
                const currentStatus = statusMap[vehicle?.trangThai] || vehicle?.status || "";
                
                // ⭐⭐ DANH SÁCH TRẠNG THÁI MẶC ĐỊNH ⭐⭐
                const allStatusOptions = [
                  { value: "AVAILABLE", label: "Có sẵn", bgColor: "#D1FAE5" }, // Light green
                  { value: "BOOKED", label: "Đã đặt trước", bgColor: "#FEE2E2" }, // Light red
                  { value: "CHECKING", label: "Đang kiểm tra", bgColor: "#FFFFFF" }, // White
                  { value: "MAINTENANCE", label: "Bảo trì", bgColor: "#FFFFFF" } // White
                ];
                
                // ⭐⭐ NẾU XE ĐANG "ĐANG KIỂM TRA", LOẠI BỎ "ĐÃ ĐẶT TRƯỚC" KHỎI DANH SÁCH ⭐⭐
                const statusOptions = currentStatus === "CHECKING" 
                  ? allStatusOptions.filter(opt => opt.value !== "BOOKED")
                  : allStatusOptions;
                
                return statusOptions;
              })().map((statusOption) => {
                const isChecked = formData.status === statusOption.value;
                // Nếu toggle ON, dùng màu background của option, nếu OFF thì dùng white
                const barBgColor = isChecked ? statusOption.bgColor : "#FFFFFF";
                
                return (
                  <div 
                    key={statusOption.value} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      backgroundColor: barBgColor,
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>
                      {statusOption.label}
                    </span>
                    <label className="toggle-switch" style={{ margin: 0 }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          // ⭐⭐ NGĂN CHECKBOX TỰ ĐỘNG BẬT NẾU CẦN HIỂN THỊ POPUP CẢNH BÁO ⭐⭐
                          if (e.target.checked) {
                            // ⭐⭐ RÀNG BUỘC: Kiểm tra nếu xe đang "Đã đặt trước" và muốn đổi sang trạng thái khác ⭐⭐
                            const statusMap = {
                              "Có sẵn": "AVAILABLE",
                              "Đang cho thuê": "RENTAL",
                              "Bảo trì": "MAINTENANCE",
                              "Đang kiểm tra": "CHECKING",
                              "Đã đặt trước": "BOOKED",
                            };
                            const currentStatus = statusMap[vehicle?.trangThai] || vehicle?.status || "";
                            
                            // ⭐⭐ Nếu xe đang "Đã đặt trước" và muốn đổi sang trạng thái khác (TRỪ KHI ĐANG "ĐANG KIỂM TRA") ⭐⭐
                            // Nếu xe đang CHECKING, cho phép đổi trạng thái bình thường (không cần kiểm tra BOOKED)
                            if (currentStatus !== "CHECKING" && currentStatus === "BOOKED" && statusOption.value !== "BOOKED") {
                              // ⭐⭐ NGĂN CHECKBOX BẬT NGAY, HIỂN THỊ POPUP CẢNH BÁO ⭐⭐
                              e.preventDefault();
                              setPendingStatusChange(statusOption.value);
                              setShowWarningModal(true);
                              return;
                            }
                            
                            // ⭐⭐ Khi bật một toggle, set trạng thái đó (các toggle khác sẽ tự động tắt vì checked dựa trên formData.status) ⭐⭐
                            setFormData(prev => ({
                              ...prev,
                              status: statusOption.value
                            }));
                          } else {
                            // ⭐⭐ Khi tắt toggle đang được chọn, reset về trạng thái ban đầu của xe ⭐⭐
                            const statusMap = {
                              "Có sẵn": "AVAILABLE",
                              "Đang cho thuê": "RENTAL",
                              "Bảo trì": "MAINTENANCE",
                              "Đang kiểm tra": "CHECKING",
                              "Đã đặt trước": "BOOKED",
                            };
                            const currentStatus = statusMap[vehicle?.trangThai] || vehicle?.status || "";
                            setFormData(prev => ({
                              ...prev,
                              status: currentStatus || ""
                            }));
                          }
                        }}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pin */}
          <div className="form-group-update">
            <label htmlFor="batteryStatus">Tình trạng pin:</label>
            <input
              type="text"
              id="batteryStatus"
              name="batteryStatus"
              value={formData.batteryStatus}
              onChange={handleChange}
              placeholder="VD: 85%, 100%"
              className="form-control-update"
            />
            <small className="form-hint">Bỏ trống để giữ nguyên pin hiện tại</small>
          </div>

          {/* Error message */}
          {error && (
            <div className="error-box-update">
              ⚠️ {error}
            </div>
          )}

          {/* Buttons */}
          <div className="popup-footer-update">
            <button
              type="button"
              onClick={() => {
                setShowIncidentModal(true);
                fetchIncidentReports();
              }}
              style={{
                padding: '10px 20px',
                background: '#EF4444',
                border: 'none',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                borderRadius: '6px',
                marginRight: 'auto'
              }}
            >
              Báo cáo sự cố
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-cancel-update"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn-submit-update"
              disabled={loading}
            >
              {loading ? "Đang cập nhật..." : "✓ Đồng ý cập nhật"}
            </button>
          </div>
        </form>
      </div>

      {/* ⭐⭐ POPUP CẢNH BÁO: Xe đang "Đã đặt trước" ⭐⭐ */}
      {showWarningModal && (
        <div 
          className="popup-overlay" 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={() => {
            setShowWarningModal(false);
            setPendingStatusChange(null);
          }}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '450px',
              width: '90%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              border: '2px solid #000000'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
              <div style={{
                fontSize: '32px',
                flexShrink: 0
              }}>
                ⚠️
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ 
                  margin: '0 0 12px 0', 
                  fontSize: '18px', 
                  fontWeight: '700',
                  color: '#1F2937'
                }}>
                  Cảnh báo
                </h3>
                <p style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: '14px', 
                  color: '#374151',
                  lineHeight: '1.6'
                }}>
                  Xe này đã có đơn đặt.
                </p>
                <p style={{ 
                  margin: '0', 
                  fontSize: '14px', 
                  color: '#374151',
                  lineHeight: '1.6'
                }}>
                  Không thể chuyển trạng thái.
                </p>
              </div>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: '12px',
              marginTop: '24px'
            }}>
              <button
                onClick={() => {
                  setShowWarningModal(false);
                  setPendingStatusChange(null);
                }}
                style={{
                  padding: '10px 24px',
                  background: '#10B981',
                  border: '1px solid #10B981',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#059669';
                  e.target.style.borderColor = '#059669';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#10B981';
                  e.target.style.borderColor = '#10B981';
                }}
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⭐⭐ POPUP BÁO CÁO SỰ CỐ ⭐⭐ */}
      {showIncidentModal && (
        <div 
          className="popup-overlay" 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => {
            setShowIncidentModal(false);
            setIncidentDescription("");
            setEditingIncidentId(null);
            setEditDescription("");
          }}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '0',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              border: '2px solid #000000',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              background: '#000000',
              color: 'white',
              padding: '20px 24px',
              borderRadius: '12px 12px 0 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>
                Báo cáo sự cố
              </h2>
              <button
                onClick={() => {
                  setShowIncidentModal(false);
                  setIncidentDescription("");
                  setEditingIncidentId(null);
                  setEditDescription("");
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: 'white',
                  fontSize: '24px',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div style={{
              padding: '24px',
              overflowY: 'auto',
              flex: 1
            }}>
              {/* Form tạo mới */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600' }}>
                  Tạo báo cáo sự cố mới
                </h3>
                <textarea
                  value={incidentDescription}
                  onChange={(e) => setIncidentDescription(e.target.value)}
                  placeholder="Nhập mô tả sự cố..."
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    padding: '12px',
                    border: '2px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
                <button
                  onClick={handleCreateIncident}
                  disabled={loadingIncidents || !incidentDescription.trim()}
                  style={{
                    marginTop: '12px',
                    padding: '10px 20px',
                    background: loadingIncidents || !incidentDescription.trim() ? '#9CA3AF' : '#EF4444',
                    border: 'none',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: loadingIncidents || !incidentDescription.trim() ? 'not-allowed' : 'pointer',
                    borderRadius: '6px',
                    width: '100%'
                  }}
                >
                  {loadingIncidents ? "Đang tạo..." : "Tạo báo cáo"}
                </button>
              </div>

              {/* Danh sách báo cáo sự cố */}
              <div>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600' }}>
                  Danh sách báo cáo sự cố
                </h3>
                {loadingIncidents ? (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <p>Đang tải...</p>
                  </div>
                ) : incidentReports.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#6B7280' }}>
                    <p>Chưa có báo cáo sự cố nào.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {incidentReports.map((report) => (
                      <div
                        key={report.incidentId || report.id}
                        style={{
                          padding: '16px',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          backgroundColor: '#F9FAFB'
                        }}
                      >
                        {editingIncidentId === (report.incidentId || report.id) ? (
                          <div>
                            <textarea
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              style={{
                                width: '100%',
                                minHeight: '80px',
                                padding: '12px',
                                border: '2px solid #E5E7EB',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontFamily: 'inherit',
                                resize: 'vertical'
                              }}
                            />
                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                              <button
                                onClick={() => handleUpdateIncident(report.incidentId || report.id)}
                                disabled={loadingIncidents || !editDescription.trim()}
                                style={{
                                  padding: '8px 16px',
                                  background: loadingIncidents || !editDescription.trim() ? '#9CA3AF' : '#10B981',
                                  border: 'none',
                                  color: 'white',
                                  fontSize: '13px',
                                  fontWeight: '600',
                                  cursor: loadingIncidents || !editDescription.trim() ? 'not-allowed' : 'pointer',
                                  borderRadius: '6px'
                                }}
                              >
                                Lưu
                              </button>
                              <button
                                onClick={() => {
                                  setEditingIncidentId(null);
                                  setEditDescription("");
                                }}
                                disabled={loadingIncidents}
                                style={{
                                  padding: '8px 16px',
                                  background: 'transparent',
                                  border: '1px solid #E5E7EB',
                                  color: '#374151',
                                  fontSize: '13px',
                                  fontWeight: '600',
                                  cursor: loadingIncidents ? 'not-allowed' : 'pointer',
                                  borderRadius: '6px'
                                }}
                              >
                                Hủy
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
                              {report.description || "N/A"}
                            </p>
                            {report.createdAt && (
                              <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#6B7280' }}>
                                {new Date(report.createdAt).toLocaleString("vi-VN")}
                              </p>
                            )}
                            <button
                              onClick={() => {
                                setEditingIncidentId(report.incidentId || report.id);
                                setEditDescription(report.description || "");
                              }}
                              style={{
                                padding: '6px 12px',
                                background: 'transparent',
                                border: '1px solid #E5E7EB',
                                color: '#374151',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                borderRadius: '6px'
                              }}
                            >
                              ✏️ Chỉnh sửa
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PopupCapNhatXe;
