import React, { useState, useEffect, useContext } from "react";
import vehicleService from "../services/vehicleService";
import maintenanceService from "../services/maintenanceService";
import "./QuanLyXePage.css";
import { AuthContext } from "../context/AuthContext";
import { rentalStationService } from "../services";

const QuanLyXePage = () => {
  const { user } = useContext(AuthContext);
  const [danhSachXe, setDanhSachXe] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popupType, setPopupType] = useState(null);
  const [selectedXe, setSelectedXe] = useState(null);
  const [pinValue, setPinValue] = useState("");
  const [issueText, setIssueText] = useState("");
  const [severity, setSeverity] = useState("");

  // ⚙️ Nếu user chưa có, không return ở đây nữa — chỉ báo loading phía dưới
  const STATION_ID = user?.stationId || 1;

  // 📦 Lấy danh sách xe
  const loadVehicles = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const vehicles = await vehicleService.fetchAndTransformVehicles();

      const filtered = vehicles.filter(
        (v) =>
          Number(v.stationId) === Number(STATION_ID) &&
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
        statusRaw: v.status,
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

  useEffect(() => {
    loadVehicles();
  }, [STATION_ID, user]);

  // ⚡ Cập nhật pin
  const handleUpdatePin = async () => {
    if (!selectedXe || !pinValue) {
      alert("⚠️ Vui lòng nhập phần trăm pin!");
      return;
    }

    try {
      await rentalStationService.updateVehicleStatus(selectedXe.id, {
        status: selectedXe.statusRaw,
        battery: pinValue,
      });

      alert(
        `✅ Đã cập nhật pin cho xe ${selectedXe.ten} (${selectedXe.bienSo}) thành ${pinValue}%`
      );

      await loadVehicles();
    } catch (err) {
      console.error("❌ Lỗi khi cập nhật pin:", err);
      alert("Không thể cập nhật pin xe, vui lòng thử lại!");
    }

    setPopupType(null);
    setPinValue("");
    setSelectedXe(null);
  };

  // 🧰 Báo cáo sự cố
  const handleReportIssue = async () => {
    if (!selectedXe || !severity || !issueText.trim()) {
      alert("⚠️ Vui lòng điền đầy đủ thông tin sự cố!");
      return;
    }

    try {
     const payload = {
  vehicleId: Number(selectedXe.id),
  stationId: Number(STATION_ID),
  description: issueText,
  severity: severity.toUpperCase(),
  status: "OPEN",
  occurredOn: new Date().toISOString(), // 👈 full ISO format
  cost: 0,
  reportedBy: user?.userId?.toString() || "3fa85f64-5717-4562-b3fc-2c963f66afa6"
};

console.log("📦 Incident Payload:", payload);
await maintenanceService.createIncident(payload);


      alert(
        `📩 Đã gửi báo cáo sự cố cho xe ${selectedXe.ten} (${selectedXe.bienSo})`
      );

      setPopupType(null);
      setIssueText("");
      setSeverity("");
      setSelectedXe(null);
    } catch (err) {
      console.error("❌ Lỗi báo cáo sự cố:", err);
      alert("Không thể gửi báo cáo, vui lòng thử lại!");
    }
  };

  // 🛠️ Đưa xe đi bảo trì
  const handleSendMaintenance = async () => {
    if (!selectedXe) {
      alert("⚠️ Không tìm thấy xe cần bảo trì!");
      return;
    }

    try {
      const payload = {
        vehicleId: selectedXe.id,
        description: "Đưa xe đi bảo trì định kỳ",
        date: new Date().toISOString().split("T")[0],
        cost: 0,
      };

      await maintenanceService.create(payload);
      alert(
        `🛠️ Xe ${selectedXe.ten} (${selectedXe.bienSo}) đã được đưa vào bảo trì!`
      );
      await rentalStationService.updateVehicleStatus(selectedXe.id, {
        status: "Maintenance",
        battery: `${selectedXe.pin}%`,
      });

      await loadVehicles();
      setPopupType(null);
      setSelectedXe(null);
    } catch (err) {
      console.error("❌ Lỗi đem xe bảo trì:", err);
      alert("Không thể đưa xe vào bảo trì!");
    }
  };

  // 🧠 Render
  if (!user) {
    return (
      <div className="quanlyxe-container">
        <p className="loading">Đang tải dữ liệu người dùng...</p>
      </div>
    );
  }

  return (
    <div className="quanlyxe-container">
      <h1>Quản lý xe tại trạm</h1>

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

              <div className="xe-actions">
                <button
                  className="btn-update"
                  onClick={() => {
                    setSelectedXe(xe);
                    setPopupType("pin");
                  }}
                >
                  ⚡ Pin
                </button>
                <button
                  className="btn-report"
                  onClick={() => {
                    setSelectedXe(xe);
                    setPopupType("issue");
                  }}
                >
                  🧰 Sự cố
                </button>
                <button
                  className="btn-maintain"
                  onClick={() => {
                    setSelectedXe(xe);
                    setPopupType("maintain");
                  }}
                  disabled={xe.trangThai === "Bảo trì"}
                >
                  🛠️ Bảo trì
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ⚡ Popup Cập nhật pin */}
      {popupType === "pin" && selectedXe && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h2>⚡ Cập nhật pin xe</h2>
            <p>
              <strong>{selectedXe.ten}</strong> ({selectedXe.bienSo})
            </p>

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

      {/* 🧰 Popup Báo cáo sự cố */}
      {popupType === "issue" && selectedXe && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h2>🧰 Báo cáo sự cố xe</h2>

            <div className="popup-section">
              <p>
                <strong>{selectedXe.ten}</strong> ({selectedXe.bienSo})
              </p>
              <p>Hãng: {selectedXe.hang}</p>
              <p>Trạm: {selectedXe.tram}</p>
              <p>Pin hiện tại: {selectedXe.pin}%</p>
            </div>

            <hr />

            <label>Mức độ hư tổn:</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="popup-select"
            >
              <option value="">-- Chọn mức độ --</option>
              <option value="low">🟢 Thấp</option>
              <option value="medium">🟡 Trung bình</option>
              <option value="high">🟠 Cao</option>
              <option value="critical">🔴 Nghiêm trọng</option>
            </select>

            <label>Mô tả chi tiết:</label>
            <textarea
              rows="4"
              className="popup-textarea"
              placeholder="Nhập mô tả chi tiết về sự cố..."
              value={issueText}
              onChange={(e) => setIssueText(e.target.value)}
            ></textarea>

            <div className="popup-buttons">
              <button className="btn-cancel" onClick={() => setPopupType(null)}>
                ❌ Hủy
              </button>
              <button
                className="btn-confirm"
                onClick={handleReportIssue}
                disabled={!severity || !issueText.trim()}
              >
                📩 Gửi báo cáo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🛠️ Popup Đưa xe đi bảo trì */}
      {popupType === "maintain" && selectedXe && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h2>🛠️ Đưa xe đi bảo trì</h2>
            <p>
              <strong>{selectedXe.ten}</strong> ({selectedXe.bienSo})
            </p>
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
