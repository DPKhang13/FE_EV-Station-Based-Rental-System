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
  const [newStatus, setNewStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTab, setFilterTab] = useState("tatca");

  const STATION_ID = user?.stationId;

  // 📦 Lấy danh sách xe
  const loadVehicles = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const vehicles = await vehicleService.fetchAndTransformVehicles();

      const filtered = vehicles.filter(
        (v) =>
          Number(v.stationId) === Number(STATION_ID) &&
          ["AVAILABLE", "MAINTENANCE", "CHECKING"].includes(
            v.status?.toUpperCase()
          )
      );

      const transformed = filtered
  .map((v) => {
    const statusUpper = v.status?.toUpperCase() || "";
    return {
      id: v.id,
      ten: v.vehicle_name || v.name,
      bienSo: v.plate_number,
      carmodel: v.carmodel || v.carModel || v.car_model || "N/A", // ✅ Thêm carmodel
      pin: v.battery_status
        ? parseInt(v.battery_status.replace("%", ""))
        : 100,
      trangThai:
        statusUpper === "AVAILABLE"
          ? "Có sẵn"
          : statusUpper === "MAINTENANCE"
          ? "Bảo trì"
          : statusUpper === "CHECKING"
          ? "Đang kiểm tra"
          : "Không xác định",
      statusRaw: statusUpper,
      hang: v.brand,
      tram: v.stationName,
      hinhAnh: v.image,
    };
  })
  .sort((a, b) => a.id - b.id); //  Sắp xếp tăng dần theo id




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
      alert("Vui lòng nhập phần trăm pin!");
      return;
    }
    try {
      await rentalStationService.updateVehicleStatus(selectedXe.id, {
        status: selectedXe.statusRaw,
        battery: pinValue,
      });
      alert(`✅ Đã cập nhật pin cho xe ${selectedXe.ten} (${selectedXe.bienSo}) thành ${pinValue}%`);
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
      alert("Vui lòng điền đầy đủ thông tin sự cố!");
      return;
    }
    try {
      const payload = {
        vehicleId: Number(selectedXe.id),
        stationId: Number(STATION_ID),
        description: issueText,
        severity: severity.toUpperCase(),
        status: "OPEN",
        occurredOn: new Date().toISOString(),
        cost: 0,
        reportedBy: user?.userId?.toString() || "system",
      };
      await maintenanceService.createIncident(payload);
      alert(`✅ Đã gửi báo cáo sự cố cho xe ${selectedXe.ten} (${selectedXe.bienSo})`);
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
      alert("Không tìm thấy xe cần bảo trì!");
      return;
    }
    try {
      const payload = {
        vehicleId: selectedXe.id,
        description: "Đưa xe đi bảo trì định kỳ",
        date: new Date().toISOString().split("T")[0],
        cost: 0,
      };
      await maintenanceService.createIncident(payload);
      await rentalStationService.updateVehicleStatus(selectedXe.id, {
        status: "MAINTENANCE",
        battery: `${selectedXe.pin}%`,
      });
      alert(`🛠️ Xe ${selectedXe.ten} (${selectedXe.bienSo}) đã được đưa vào bảo trì!`);
      await loadVehicles();
    } catch (err) {
      console.error("❌ Lỗi đem xe bảo trì:", err);
      alert("Không thể đưa xe vào bảo trì!");
    }
    setPopupType(null);
    setSelectedXe(null);
  };

  // ⚙️ Cập nhật khi đang kiểm tra
  const handleFinishChecking = async () => {
    if (!selectedXe) return;
    const finalPin = pinValue || selectedXe.pin;
    const finalStatus = newStatus || selectedXe.statusRaw;
    
    // ⭐⭐ KIỂM TRA PIN TRƯỚC KHI CHO PHÉP CHUYỂN SANG TRẠNG THÁI "SẴN SÀNG" ⭐⭐
    if (finalStatus === "AVAILABLE" && finalPin <= 60) {
      alert(`Không thể chuyển sang trạng thái 'Sẵn sàng'. Pin phải trên 60%. Pin hiện tại: ${finalPin}%.`);
      return;
    }
    
    try {
      await rentalStationService.updateVehicleStatus(selectedXe.id, {
        status: finalStatus,
        battery: finalPin,
      });
      alert(
        `🔄 Xe ${selectedXe.ten} (${selectedXe.bienSo}) đã được cập nhật:\n• Pin: ${finalPin}%\n• Trạng thái: ${
          finalStatus === "AVAILABLE"
            ? "Có sẵn"
            : finalStatus === "MAINTENANCE"
            ? "Bảo trì"
            : "Đang kiểm tra"
        }`
      );
      await loadVehicles();
    } catch (err) {
      console.error("❌ Lỗi cập nhật trạng thái kiểm tra:", err);
      alert("Không thể cập nhật xe, vui lòng thử lại!");
    }
    setPopupType(null);
    setPinValue("");
    setNewStatus("");
    setSelectedXe(null);
  };

  // Bộ lọc & tìm kiếm
  const filteredXe = danhSachXe.filter((xe) => {
    const matchSearch = xe.bienSo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTab =
      filterTab === "tatca"
        ? true
        : filterTab === "cosan"
        ? xe.trangThai === "Có sẵn"
        : filterTab === "baotri"
        ? xe.trangThai === "Bảo trì"
        : filterTab === "kiemtra"
        ? xe.trangThai === "Đang kiểm tra"
        : true;
    return matchSearch && matchTab;
  });

  if (!user) {
    return <p className="loading">Đang tải dữ liệu người dùng...</p>;
  }

  return (
    <div className="quanlyxe-container">
      <h1>Quản lý xe tại trạm</h1>

      {/* 🔍 Thanh tìm kiếm */}
      <input
        type="text"
        placeholder="Tìm theo biển số..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />

      {/* 🧩 Tabs lọc */}
      <div className="tabs">
        {[
          { key: "tatca", label: "Tất cả" },
          { key: "cosan", label: "Có sẵn" },
          { key: "kiemtra", label: "Đang kiểm tra" },
          { key: "baotri", label: "Bảo trì" },
        ].map((tab) => (
          <button
            key={tab.key}
            className={filterTab === tab.key ? "active" : ""}
            onClick={() => setFilterTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 🚗 Danh sách xe */}
      {loading ? (
        <p className="loading">Đang tải danh sách xe...</p>
      ) : filteredXe.length === 0 ? (
        <p className="no-data">Không có xe nào phù hợp.</p>
      ) : (
        <div className="xe-grid">
          {filteredXe.map((xe) => (
            <div className="xe-card" key={xe.id}>
              <img
                src={xe.hinhAnh || "https://live.staticflickr.com/65535/49932658111_30214a4229_b.jpg"}
                alt={xe.ten}
                className="xe-img"
              />
              <h3>{xe.ten}</h3>
              <p>Biển số: {xe.bienSo}</p>
              <p>Loại xe: {xe.carmodel || xe.carModel || "N/A"}</p>
              <p>Pin: {xe.pin}%</p>
              <p>Hãng: {xe.hang}</p>
              <p className="status">{xe.trangThai}</p>

              <div className="xe-actions">
                {xe.trangThai === "Đang kiểm tra" ? (
                  <button className="btn-checking" onClick={() => { setSelectedXe(xe); setPopupType("checking"); }}>
                    Cập nhật
                  </button>
                ) : (
                  <>
                    <button
                      className="btn-update"
                      disabled={xe.trangThai?.toLowerCase().trim() === "bảo trì"}
                      onClick={() => { setSelectedXe(xe); setPopupType("pin"); }}
                    >
                      Cập nhật pin
                    </button>
                    <button
                      className="btn-report"
                      disabled={xe.trangThai?.toLowerCase().trim() === "bảo trì"}
                      onClick={() => { setSelectedXe(xe); setPopupType("issue"); }}
                    >
                      Báo sự cố
                    </button>
                    <button
                      className="btn-maintain"
                      disabled={xe.trangThai?.toLowerCase().trim() === "bảo trì"}
                      onClick={() => { setSelectedXe(xe); setPopupType("maintain"); }}
                    >
                      Bảo trì
                    </button>
                  </>
                )}
              </div>
              <button
                className="btn-view-detail"
                onClick={() => {
                  // TODO: Thêm logic xem chi tiết xe
                  console.log("Xem chi tiết xe:", xe);
                }}
              >
                Xem chi tiết
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Popups */}
      {popupType === "pin" && selectedXe && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h2>Cập nhật pin</h2>
            <p>{selectedXe.ten} ({selectedXe.bienSo})</p>
            <input type="number" placeholder="Nhập phần trăm pin..." value={pinValue}
              onChange={(e) => setPinValue(e.target.value)} />
            <div className="popup-buttons">
              <button onClick={() => setPopupType(null)}>Hủy</button>
              <button onClick={handleUpdatePin}>Lưu</button>
            </div>
          </div>
        </div>
      )}

      {popupType === "issue" && selectedXe && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h2>Báo cáo sự cố</h2>
            <p>{selectedXe.ten} ({selectedXe.bienSo})</p>
            <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
              <option value="">Chọn mức độ</option>
              <option value="LOW">Thấp</option>
              <option value="MEDIUM">Trung bình</option>
              <option value="HIGH">Cao</option>
              <option value="CRITICAL">Nghiêm trọng</option>
            </select>
            <textarea placeholder="Mô tả sự cố..." value={issueText}
              onChange={(e) => setIssueText(e.target.value)} />
            <div className="popup-buttons">
              <button onClick={() => setPopupType(null)}>Hủy</button>
              <button onClick={handleReportIssue}>Gửi</button>
            </div>
          </div>
        </div>
      )}

      {popupType === "maintain" && selectedXe && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h2>Đưa xe vào bảo trì</h2>
            <p>{selectedXe.ten} ({selectedXe.bienSo})</p>
            <p>Xe sẽ tạm ngừng cho thuê và chuyển sang trạng thái “Bảo trì”.</p>
            <div className="popup-buttons">
              <button onClick={() => setPopupType(null)}>Hủy</button>
              <button onClick={handleSendMaintenance}>Xác nhận</button>
            </div>
          </div>
        </div>
      )}

      {popupType === "checking" && selectedXe && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h2>Cập nhật sau khi kiểm tra</h2>
            <p>{selectedXe.ten} ({selectedXe.bienSo})</p>
            <input
              type="number"
              placeholder="Nhập pin mới..."
              value={pinValue}
              onChange={(e) => setPinValue(e.target.value)}
            />
            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
              <option value="">Giữ nguyên</option>
              <option value="AVAILABLE">Có sẵn</option>
              <option value="MAINTENANCE">Bảo trì</option>
            </select>
            <div className="popup-buttons">
              <button onClick={() => setPopupType(null)}>Hủy</button>
              <button onClick={handleFinishChecking}>Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuanLyXePage;
