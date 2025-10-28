import React from "react";
import "./PopupXacThucHoSoCaNhan.css";

export default function PopupXacThucHoSoCaNhan({ row, onClose }) {
  if (!row) return null; // tránh lỗi khi row chưa có dữ liệu

  return (
    <div className="popup-overlay">
      <div className="popup">
        <div className="popup-header">
          <h2>Xác thực hồ sơ cá nhân</h2>
          <button className="close-btn" onClick={onClose}>
            ✖
          </button>
        </div>

        {/* Thông tin khách hàng */}
        <div className="section">
          <h3>Thông tin khách hàng</h3>
          <div className="info-grid">
            <div className="info-item">
              <strong>Họ tên:</strong> {row.ten}
            </div>
            <div className="info-item">
              <strong>Số điện thoại:</strong> {row.sdt}
            </div>
            <div className="info-item">
              <strong>Email:</strong> {row.email}
            </div>
            <div className="info-item">
              <strong>Mã đơn:</strong> {row.id}
            </div>
          </div>
        </div>

        {/* Giấy tờ xác thực */}
        <div className="section">
          <div className="info-grid">
            <div>
              <label>
                <strong>CMND/CCCD *</strong>
              </label>
              <div className="upload-area">📷 Chụp / Tải lên CMND/CCCD</div>
              <input
                type="text"
                placeholder={`Số CMND/CCCD: ${row.cccd}`}
                defaultValue={row.cccd}
              />
            </div>
            <div>
              <label>
                <strong>Giấy phép lái xe *</strong>
              </label>
              <div className="upload-area">📷 Chụp / Tải lên GPLX</div>
              <input
                type="text"
                placeholder={`Số GPLX: ${row.gplx}`}
                defaultValue={row.gplx}
              />
            </div>
          </div>
        </div>

        {/* Ghi chú */}
        <div className="section">
          <label>
            <strong>Ghi chú xác thực</strong>
          </label>
          <textarea placeholder="Ghi chú về quá trình xác thực (nếu có)..."></textarea>
        </div>

        {/* Nút hành động */}
        <div className="button-group">
          <button className="btn btn-cancel" onClick={onClose}>
            Hủy
          </button>
          <button className="btn btn-confirm">Xác nhận xác thực hồ sơ</button>
        </div>
      </div>
    </div>
  );
}
