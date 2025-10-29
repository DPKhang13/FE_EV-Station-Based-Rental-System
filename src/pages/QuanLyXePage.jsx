import React, { useState, useEffect } from "react";
import vehicleService from "../services/vehicleService";
import "./QuanLyXePage.css";

const QuanLyXePage = () => {
  const [danhSachXe, setDanhSachXe] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popupType, setPopupType] = useState(null);
  const [selectedXeId, setSelectedXeId] = useState("");
  const [pinValue, setPinValue] = useState("");
  const [issueText, setIssueText] = useState("");

  const STATION_ID = 1;

  useEffect(() => {
    const loadData = async () => {
      try {
        const vehicles = await vehicleService.fetchAndTransformVehicles();

        // Chỉ lấy xe có sẵn và bảo trì
        const filtered = vehicles.filter(
          (v) =>
            Number(v.stationId) === STATION_ID &&
            (v.status === "Available" || v.status === "Maintenance")
        );

        const transformed = filtered.map((v) => ({
          id: v.id,
          ten: v.vehicle_name || v.name,
          bienSo: v.plate_number,
          pin: v.battery_status
            ? parseInt(v.battery_status.replace("%", ""))
            : 100,
          trangThai:
            v.status === "Available"
              ? "Có sẵn"
              : v.status === "Maintenance"
              ? "Bảo trì"
              : "Không xác định",
          hang: v.brand,
          tram: v.stationName,
          hinhAnh: v.image,
        }));

        setDanhSachXe(transformed);
      } catch (err) {
        console.error("❌ Lỗi tải xe:", err);
        setDanhSachXe([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Cập nhật pin
  const handleUpdatePin = () => {
    alert(`✅ Đã cập nhật pin xe ${selectedXeId} thành ${pinValue}%`);
    setPopupType(null);
  };

  // Báo cáo sự cố
  const handleReportIssue = () => {
    alert(`📩 Báo cáo sự cố cho xe ${selectedXeId}: ${issueText}`);
    setPopupType(null);
  };

  // Đưa xe đi bảo trì
  const handleSendMaintenance = () => {
    alert(`🛠️ Xe ${selectedXeId} đã được chuyển sang trạng thái bảo trì!`);
    setPopupType(null);
  };

  return (
    <div className="quanlyxe-container">
      <h1>Quản lý xe tại trạm</h1>

      {/* Nút thao tác */}
      <div className="button-group">
        <button className="btn-update" onClick={() => setPopupType("pin")}>
          ⚡ Cập nhật pin
        </button>
        <button className="btn-report" onClick={() => setPopupType("issue")}>
          🧰 Báo cáo sự cố
        </button>
        <button className="btn-maintain" onClick={() => setPopupType("maintain")}>
          🛠️ Đem bảo trì
        </button>
      </div>

      {/* Danh sách xe */}
      {loading ? (
        <p className="loading">Đang tải danh sách xe...</p>
      ) : (
        <div className="xe-grid">
          {danhSachXe.map((xe) => (
            <div className="xe-card" key={xe.id}>
              <img
                src={
                  xe.hinhAnh ||
                  "https://live.staticflickr.com/65535/49932658111_30214a4229_b.jpg"
                }
                alt={xe.ten}
                className="xe-img"
              />
              <h3>{xe.ten}</h3>
              <p>Biển số: {xe.bienSo}</p>
              <p>Pin: {xe.pin}%</p>
              <p>Hãng: {xe.hang}</p>
              <p
                className={`status ${
                  xe.trangThai === "Có sẵn" ? "green" : "yellow"
                }`}
              >
                {xe.trangThai}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Popup Cập nhật pin */}
      {popupType === "pin" && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h2>⚡ Cập nhật tình trạng pin</h2>
            <label>Chọn xe:</label>
            <select
              value={selectedXeId}
              onChange={(e) => setSelectedXeId(e.target.value)}
            >
              <option value="">-- Chọn xe --</option>
              {danhSachXe.map((xe) => (
                <option key={xe.id} value={xe.id}>
                  {xe.ten} ({xe.bienSo})
                </option>
              ))}
            </select>

            <label>Nhập phần trăm pin mới:</label>
            <input
              type="number"
              placeholder="VD: 80"
              value={pinValue}
              onChange={(e) => setPinValue(e.target.value)}
            />

            <div className="popup-buttons">
              <button onClick={() => setPopupType(null)}>Hủy</button>
              <button className="btn-confirm" onClick={handleUpdatePin}>
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup Báo cáo sự cố */}
      {popupType === "issue" && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h2>🧰 Báo cáo sự cố</h2>
            <label>Chọn xe bị sự cố:</label>
            <select
              value={selectedXeId}
              onChange={(e) => setSelectedXeId(e.target.value)}
            >
              <option value="">-- Chọn xe --</option>
              {danhSachXe.map((xe) => (
                <option key={xe.id} value={xe.id}>
                  {xe.ten} ({xe.bienSo})
                </option>
              ))}
            </select>

            <label>Mô tả sự cố:</label>
            <textarea
              rows="3"
              placeholder="Nhập mô tả chi tiết..."
              value={issueText}
              onChange={(e) => setIssueText(e.target.value)}
            ></textarea>

            <div className="popup-buttons">
              <button onClick={() => setPopupType(null)}>Hủy</button>
              <button className="btn-confirm" onClick={handleReportIssue}>
                Gửi báo cáo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup Đem bảo trì */}
      {popupType === "maintain" && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h2>🛠️ Đem xe đi bảo trì</h2>
            <label>Chọn xe cần đem bảo trì:</label>
            <select
              value={selectedXeId}
              onChange={(e) => setSelectedXeId(e.target.value)}
            >
              <option value="">-- Chọn xe --</option>
              {danhSachXe
                .filter((xe) => xe.trangThai === "Có sẵn")
                .map((xe) => (
                  <option key={xe.id} value={xe.id}>
                    {xe.ten} ({xe.bienSo})
                  </option>
                ))}
            </select>

            <p className="warning-text">
              ⚠️ Xe sau khi chuyển sang “Bảo trì” sẽ không thể cho thuê!
            </p>

            <div className="popup-buttons">
              <button onClick={() => setPopupType(null)}>Hủy</button>
              <button className="btn-confirm" onClick={handleSendMaintenance}>
                Xác nhận đem bảo trì
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuanLyXePage;
