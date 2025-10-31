import React from "react";
import "./PopupXacThucHoSoCaNhan.css";

export default function PopupXacThucHoSoCaNhan({
  row, profile, loading, error, verifying, onVerify, onClose
}) {
  if (!row) return null;

  return (
    <div className="popup-overlay">
      <div className="popup">
        <div className="popup-header">
          <h2>Xác thực hồ sơ cá nhân</h2>
          <button className="close-btn" onClick={onClose}>✖</button>
        </div>

        <div className="section">
          <h3>Thông tin đơn</h3>
          <div className="info-grid">
            <div className="info-item"><strong>Mã đơn:</strong> {row.orderId}</div>
            <div className="info-item"><strong>Khách hàng (đơn):</strong> {row.customerName}</div>
            <div className="info-item"><strong>SĐT (đơn):</strong> {row.phone}</div>
            <div className="info-item"><strong>Xe:</strong> {row.vehicleName} - {row.plateNumber}</div>
          </div>
        </div>

        {loading && <p>Đang tải hồ sơ khách…</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && (
          profile ? (
            <>
              <div className="section">
                <h3>Thông tin hồ sơ</h3>
                <div className="info-grid">
                  <div className="info-item"><strong>Họ tên:</strong> {profile.fullName || "—"}</div>
                  <div className="info-item"><strong>SĐT:</strong> {profile.phone || "—"}</div>
                  <div className="info-item"><strong>Email:</strong> {profile.email || "—"}</div>
                  <div className="info-item">
                    <strong>Trạng thái:</strong> {profile.status || "—"}
                  </div>
                </div>
              </div>

              <div className="section">
                <h3>Giấy tờ xác thực</h3>
                <div className="doc-grid">
                  <div className="doc-card">
                    <strong>CMND/CCCD</strong><br />
                    {profile?.idCardUrl ? (
                      <a href={profile.idCardUrl} target="_blank" rel="noreferrer">
                        <img src={profile.idCardUrl} alt="Ảnh CMND/CCCD" className="doc-img" loading="lazy" />
                      </a>
                    ) : "Chưa cung cấp"}
                  </div>

                  <div className="doc-card">
                    <strong>Giấy phép lái xe</strong><br />
                    {profile?.driverLicenseUrl ? (
                      <a href={profile.driverLicenseUrl} target="_blank" rel="noreferrer">
                        <img src={profile.driverLicenseUrl} alt="Ảnh Giấy phép lái xe" className="doc-img" loading="lazy" />
                      </a>
                    ) : "Chưa cung cấp"}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p>Không tìm thấy hồ sơ chờ xác thực cho khách hàng này.</p>
          )
        )}

        <div className="button-group">
          <button className="btn btn-cancel" onClick={onClose}>Hủy</button>
          <button
            className="btn btn-confirm"
            onClick={onVerify}
            disabled={verifying || !profile}
            title={!profile ? "Không có hồ sơ để xác thực" : ""}
          >
            {verifying ? "Đang xác thực..." : "Xác nhận xác thực hồ sơ"}
          </button>
        </div>
      </div>
    </div>
  );
}
