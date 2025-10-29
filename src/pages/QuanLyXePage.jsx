import React, { useState, useEffect } from "react";
import vehicleService from "../services/vehicleService";
import maintenanceService from "../services/maintenanceService";
import "./QuanLyXePage.css";

const QuanLyXePage = () => {
  const [danhSachXe, setDanhSachXe] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popupType, setPopupType] = useState(null);
  const [selectedXeId, setSelectedXeId] = useState("");
  const [pinValue, setPinValue] = useState("");
  const [issueText, setIssueText] = useState("");

  const STATION_ID = 1;

  // 📦 Lấy danh sách xe từ API
  useEffect(() => {
    const loadData = async () => {
      try {
        const vehicles = await vehicleService.fetchAndTransformVehicles();

        // Chỉ lấy xe của trạm hiện tại
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

  // ⚡ Cập nhật pin (chưa có API thật)
  const handleUpdatePin = () => {
    if (!selectedXeId || !pinValue) {
      alert("⚠️ Vui lòng chọn xe và nhập phần trăm pin!");
      return;
    }
    alert(`✅ Đã cập nhật pin xe ${selectedXeId} thành ${pinValue}%`);
    setPopupType(null);
    setPinValue("");
    setSelectedXeId("");
  };

  // 🧰 Báo cáo sự cố - gọi API /maintanences/create
  const handleReportIssue = async () => {
    if (!selectedXeId || !issueText.trim()) {
      alert("⚠️ Vui lòng chọn xe và nhập mô tả sự cố!");
      return;
    }

    try {
      const payload = {
        vehicleId: selectedXeId,
        description: issueText,
        date: new Date().toISOString().split("T")[0],
        cost: 0, // báo cáo sự cố chưa có chi phí
      };

      await maintenanceService.create(payload);
      alert("📩 Báo cáo sự cố đã được gửi lên hệ thống!");
      setPopupType(null);
      setIssueText("");
      setSelectedXeId("");
    } catch (err) {
      console.error("❌ Lỗi báo cáo sự cố:", err);
      alert("Không thể gửi báo cáo, vui lòng thử lại!");
    }
  };

  // 🛠️ Đưa xe đi bảo trì - gọi API /maintanences/create
  const handleSendMaintenance = async () => {
    if (!selectedXeId) {
      alert("⚠️ Vui lòng chọn xe cần đem bảo trì!");
      return;
    }

    try {
      const payload = {
        vehicleId: selectedXeId,
        description: "Đưa xe đi bảo trì định kỳ",
        date: new Date().toISOString().split("T")[0],
        cost: 0,
      };

      await maintenanceService.create(payload);
      alert(`🛠️ Xe ${selectedXeId} đã được đưa vào danh sách bảo trì!`);
      setPopupType(null);
      setSelectedXeId("");
    } catch (err) {
      console.error("❌ Lỗi đem xe bảo trì:", err);
      alert("Không thể đưa xe vào bảo trì!");
    }
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
