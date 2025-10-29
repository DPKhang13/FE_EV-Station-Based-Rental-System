import React, { useState, useEffect } from "react";
import "./GiaoTraXe.css";
import vehicleService from "../services/vehicleService";
import PopupChoThue from "../components/staff/PopUpChoThue";
import PopupXacThuc from "../components/staff/PopUpXacThuc";
import PopupNhanXe from "../components/staff/PopUpNhanXe";
import PopupDaXacThuc from "../components/staff/PopUpDaXacThuc";

const GiaoTraXe = () => {
  const [tab, setTab] = useState("tatca");
  const [popupType, setPopupType] = useState(null);
  const [selectedXe, setSelectedXe] = useState(null);
  const [danhSachXe, setDanhSachXe] = useState([]);
  const [loading, setLoading] = useState(true);

  const STATION_ID = 1; // ✅ chỉ hiển thị xe của trạm ID = 1

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log("🚗 Đang tải danh sách xe từ API...");

        const vehicles = await vehicleService.fetchAndTransformVehicles();
        console.log("✅ Tổng số xe từ API:", vehicles.length);

        // 🔹 Lọc xe theo trạm
        const filtered = vehicles.filter(
          (v) => Number(v.stationId) === STATION_ID
        );

        console.log(`📍 Số xe thuộc trạm ${STATION_ID}:`, filtered.length);

        // 🔹 Chuẩn hóa dữ liệu cho UI
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
              : v.status === "Rented"
              ? "Đang cho thuê"
              : v.status === "Maintenance"
              ? "Bảo trì"
              : "Không xác định",
          mau: v.color,
          hang: v.brand,
          nam: v.year_of_manufacture,
          bienThe: v.variant,
          congSuatPin: v.battery_capacity,
          quangDuong: v.range_km,
          tram: v.stationName,
          hinhAnh: v.image,
        }));

        setDanhSachXe(transformed);
      } catch (error) {
        console.error("❌ Lỗi khi load dữ liệu xe:", error);
        setDanhSachXe([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Lọc theo trạng thái
  const locXe = danhSachXe.filter((xe) => {
    if (tab === "tatca") return true;
    if (tab === "cosan") return xe.trangThai === "Có sẵn";
    if (tab === "dangchothue") return xe.trangThai === "Đang cho thuê";
    if (tab === "baotri") return xe.trangThai === "Bảo trì";
    return true;
  });

  const handleAction = (xe) => {
    setSelectedXe(xe);
    if (xe.trangThai === "Có sẵn") setPopupType("chothue");
    else if (xe.trangThai === "Đang cho thuê") setPopupType("nhanxe");
    else if (xe.trangThai === "Bảo trì") setPopupType("xacthuc");
  };

  return (
    <div className="giaoTraXe-container">
      <h1 className="title">Quản lý giao - nhận xe (Trạm ID {STATION_ID})</h1>

      {/* Tabs lọc trạng thái */}
      <div className="tabs">
        {[
          { key: "tatca", label: "Tất cả" },
          { key: "cosan", label: "Có sẵn" },
          { key: "dangchothue", label: "Đang cho thuê" },
          { key: "baotri", label: "Bảo trì" },
        ].map((t) => (
          <button
            key={t.key}
            className={tab === t.key ? "active" : ""}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Nội dung */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p>Đang tải dữ liệu xe...</p>
        </div>
      ) : locXe.length === 0 ? (
        <p style={{ textAlign: "center", padding: "40px" }}>
          Không có xe nào thuộc trạm này.
        </p>
      ) : (
        <div className="xe-grid">
          {locXe.map((xe) => (
            <div className="xe-card" key={xe.id}>
              <img
                src={
                  xe.hinhAnh ||
                  "https://live.staticflickr.com/65535/49932658111_30214a4229_b.jpg"
                }
                alt={xe.ten}
                className="xe-img"
              />
              <h3 className="xe-name">{xe.ten}</h3>
              <p>Biển số: {xe.bienSo}</p>
              <p>Pin: {xe.pin}%</p>
              <p>Hãng: {xe.hang}</p>
              <p>Trạm: {xe.tram}</p>

              <p
                className={`xe-status ${
                  xe.trangThai === "Có sẵn"
                    ? "status-green"
                    : xe.trangThai === "Đang cho thuê"
                    ? "status-blue"
                    : "status-yellow"
                }`}
              >
                {xe.trangThai}
              </p>

              {/* ✅ Chỉ hiển thị nút nếu xe “Đang cho thuê” */}
              {xe.trangThai === "Đang cho thuê" && (
                <button className="btn-action" onClick={() => handleAction(xe)}>
                  Nhận xe trả
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Popup */}
      {popupType === "chothue" && (
        <PopupChoThue xe={selectedXe} onClose={() => setPopupType(null)} />
      )}
      {popupType === "xacthuc" && (
        <PopupXacThuc xe={selectedXe} onClose={() => setPopupType(null)} />
      )}
      {popupType === "nhanxe" && (
        <PopupNhanXe xe={selectedXe} onClose={() => setPopupType(null)} />
      )}
      {popupType === "daXacThuc" && (
        <PopupDaXacThuc xe={selectedXe} onClose={() => setPopupType(null)} />
      )}
    </div>
  );
};

export default GiaoTraXe;
