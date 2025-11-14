import React, { useState, useEffect } from "react";
import vehicleService from "../../services/vehicleService";
import "./PopupCapNhatXe.css";

const PopupCapNhatXe = ({ vehicle, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    status: "",
    batteryStatus: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log("🚀 Đang cập nhật xe ID:", vehicle.id);
      console.log("📦 Dữ liệu gửi:", formData);

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
          <h2>🔧 Cập nhật trạng thái hoặc pin</h2>
          <button className="close-btn-update" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="popup-body-update">
          {/* Thông tin xe */}
          <div className="vehicle-info-box">
            <p><strong>Xe:</strong> {vehicle?.ten || "N/A"}</p>
            <p><strong>Biển số:</strong> {vehicle?.bienSo || "N/A"}</p>
          </div>

          {/* Trạng thái */}
          <div className="form-group-update">
            <label htmlFor="status">Trạng thái xe:</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="form-control-update"
            >
              <option value="">-- Giữ nguyên --</option>
              <option value="AVAILABLE">Có sẵn</option>
              <option value="BOOKED">Đã đặt trước</option>
              <option value="RENTAL">Đang cho thuê</option>
              <option value="CHECKING">Đang kiểm tra</option>
              <option value="MAINTENANCE">Bảo trì</option>
            </select>
            <small className="form-hint">Bỏ trống để giữ nguyên trạng thái hiện tại</small>
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
    </div>
  );
};

export default PopupCapNhatXe;
