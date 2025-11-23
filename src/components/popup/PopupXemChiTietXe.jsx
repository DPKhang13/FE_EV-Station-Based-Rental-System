import React, { useState, useEffect } from "react";
import vehicleService from "../../services/vehicleService";
import PopupCapNhatXe from "./PopupCapNhatXe";
import "./PopupXemChiTietXe.css";

const PopupXemChiTietXe = ({ vehicleId, onClose, onReload }) => {
  const [vehicleDetail, setVehicleDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);

  useEffect(() => {
    const fetchVehicleDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(" Đang tải chi tiết xe ID:", vehicleId);
        
        const data = await vehicleService.getVehicleDetail(vehicleId);
        console.log(" Dữ liệu xe nhận được:", data);
        
        setVehicleDetail(data);
      } catch (err) {
        console.error(" Lỗi khi tải chi tiết xe:", err);
        setError("Không thể tải thông tin xe. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    if (vehicleId) {
      fetchVehicleDetail();
    }
  }, [vehicleId]);

  const mapStatusToVietnamese = (status) => {
    const statusMap = {
      "AVAILABLE": "Có sẵn",
      "BOOKED": "Đã đặt trước",
      "RENTAL": "Đang cho thuê",
      "CHECKING": "Đang kiểm tra",
      "MAINTENANCE": "Bảo trì",
    };
    return statusMap[status?.toUpperCase()] || status || "Không xác định";
  };

  const handleUpdateSuccess = () => {
    setShowUpdatePopup(false);
    // Reload lại thông tin xe
    const fetchVehicleDetail = async () => {
      try {
        setLoading(true);
        const data = await vehicleService.getVehicleDetail(vehicleId);
        setVehicleDetail(data);
      } catch (err) {
        console.error(" Lỗi khi tải lại chi tiết xe:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicleDetail();
    
    // Callback để reload dữ liệu ở trang chính (nếu có)
    if (onReload) {
      onReload();
    }
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content-detail" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <h2>Thông tin chi tiết xe</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {loading ? (
          <div className="popup-body">
            <div className="loading-container">
              <div className="spinner"></div>
              <p className="loading-text">Vui lòng chờ trong giây lát</p>
              <p className="loading-subtext">Đang tải thông tin xe...</p>
            </div>
          </div>
        ) : error ? (
          <div className="popup-body">
            <div className="error-message">
              <p>⚠️ {error}</p>
              <button onClick={onClose} className="btn-primary">Đóng</button>
            </div>
          </div>
        ) : vehicleDetail ? (
          <div className="popup-body">
            {/* Thông tin cơ bản */}
            <div className="info-section">
              <h3 className="section-title">Thông tin cơ bản</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Carmodel:</span>
                  <span className="info-value">{vehicleDetail.carmodel || vehicleDetail.carModel || vehicleDetail.car_model || "N/A"}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Biển số:</span>
                  <span className="info-value highlight">{vehicleDetail.plateNumber || "N/A"}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Hãng:</span>
                  <span className="info-value">{vehicleDetail.brand || "N/A"}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Màu sắc:</span>
                  <span className="info-value">{vehicleDetail.color || "N/A"}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Số chỗ:</span>
                  <span className="info-value">{vehicleDetail.seatCount || "N/A"} chỗ</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Năm sản xuất:</span>
                  <span className="info-value">{vehicleDetail.year || "N/A"}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Hộp số:</span>
                  <span className="info-value">{vehicleDetail.transmission || "N/A"}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Phiên bản:</span>
                  <span className="info-value">{vehicleDetail.variant || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Trạng thái */}
            <div className="info-section">
              <h3 className="section-title">Trạng thái</h3>
              <div className="info-grid">
                <div className="info-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span className="info-label">Trạng thái xe:</span>
                    <span className={`status-badge status-${vehicleDetail.status?.toLowerCase()}`}>
                      {mapStatusToVietnamese(vehicleDetail.status)}
                    </span>
                  </div>
                </div>
                <div className="info-item">
                  <span className="info-label">Pin:</span>
                  <span className="info-value battery">{vehicleDetail.batteryStatus || "N/A"}</span>
                </div>
              </div>
            </div>


            {/* Thông tin đặt xe (nếu có) - Chỉ hiển thị khi trạng thái xe không phải "Có sẵn" hoặc "Bảo trì" */}
            {vehicleDetail.hasBooking && 
             vehicleDetail.status?.toUpperCase() !== "AVAILABLE" && 
             vehicleDetail.status?.toUpperCase() !== "MAINTENANCE" && (
              <div className="info-section booking-section">
                <h3 className="section-title">Thông tin đặt xe hiện tại</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Khách hàng:</span>
                    <span className="info-value">{vehicleDetail.customerName || "N/A"}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Số điện thoại:</span>
                    <span className="info-value">{vehicleDetail.customerPhone || "N/A"}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{vehicleDetail.customerEmail || "N/A"}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Tên trạm:</span>
                    <span className="info-value">{vehicleDetail.stationName || "N/A"}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Ngày nhận:</span>
                    <span className="info-value">
                      {vehicleDetail.rentalStartDate 
                        ? (() => {
                            const date = new Date(vehicleDetail.rentalStartDate);
                            const day = String(date.getDate()).padStart(2, "0");
                            const month = String(date.getMonth() + 1).padStart(2, "0");
                            const year = date.getFullYear();
                            const hours = String(date.getHours()).padStart(2, "0");
                            const minutes = String(date.getMinutes()).padStart(2, "0");
                            return `${day}/${month}/${year} ${hours}:${minutes}`;
                          })()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Ngày trả:</span>
                    <span className="info-value">
                      {vehicleDetail.rentalEndDate 
                        ? (() => {
                            const date = new Date(vehicleDetail.rentalEndDate);
                            const day = String(date.getDate()).padStart(2, "0");
                            const month = String(date.getMonth() + 1).padStart(2, "0");
                            const year = date.getFullYear();
                            const hours = String(date.getHours()).padStart(2, "0");
                            const minutes = String(date.getMinutes()).padStart(2, "0");
                            return `${day}/${month}/${year} ${hours}:${minutes}`;
                          })()
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Ghi chú - Chỉ hiển thị khi trạng thái xe không phải "Có sẵn" hoặc "Bảo trì" */}
            {vehicleDetail.bookingNote && 
             vehicleDetail.status?.toUpperCase() !== "AVAILABLE" && 
             vehicleDetail.status?.toUpperCase() !== "MAINTENANCE" && (
              <div className="info-section">
                <h3 className="section-title">Ghi chú</h3>
                <div className="note-box">
                  {(() => {
                    // Format lại ngày trong ghi chú nếu có
                    let note = vehicleDetail.bookingNote;
                    
                    // Tìm và thay thế các pattern ngày ISO (2025-11-26T00:00 hoặc 2025-11-26T00:00:00)
                    note = note.replace(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::\d{2})?/g, (match, year, month, day, hour, minute) => {
                      return `${day}/${month}/${year} ${hour}:${minute}`;
                    });
                    
                    return note;
                  })()}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="popup-body">
            <p>Không tìm thấy thông tin xe.</p>
          </div>
        )}

        <div className="popup-footer">
          <button
            onClick={() => setShowUpdatePopup(true)}
            className="btn-primary"
            style={{ marginRight: 'auto' }}
          >
            Cập nhật
          </button>
          <button onClick={onClose} className="btn-secondary">
            Đóng
          </button>
        </div>
      </div>

      {/* Popup cập nhật xe */}
      {showUpdatePopup && vehicleDetail && (
        <PopupCapNhatXe
          vehicle={{
            id: vehicleDetail.vehicleId,
            ten: vehicleDetail.vehicleName,
            bienSo: vehicleDetail.plateNumber,
            carmodel: vehicleDetail.carmodel || vehicleDetail.carModel || vehicleDetail.car_model || "N/A",
            color: vehicleDetail.color || "N/A",
            pin: parseInt(vehicleDetail.batteryStatus?.replace("%", "") || "100"),
            status: vehicleDetail.status,
            trangThai: mapStatusToVietnamese(vehicleDetail.status),
          }}
          onClose={() => setShowUpdatePopup(false)}
          onSuccess={handleUpdateSuccess}
        />
      )}
    </div>
  );
};

export default PopupXemChiTietXe;
