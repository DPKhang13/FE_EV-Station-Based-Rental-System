import React, { useState, useEffect, useContext } from "react";
import "./GiaoTraXe.css";
import vehicleService from "../services/vehicleService";
import PopupChoThue from "../components/staff/PopUpChoThue";
import PopupXacThuc from "../components/staff/PopUpXacThuc";
import PopupNhanXe from "../components/staff/PopUpNhanXe";
import PopupDaXacThuc from "../components/staff/PopUpDaXacThuc";
import { AuthContext } from "../context/AuthContext";

const GiaoTraXe = () => {
  const { user } = useContext(AuthContext);
  const [tab, setTab] = useState("tatca");
  const [popupType, setPopupType] = useState(null);
  const [selectedXe, setSelectedXe] = useState(null);
  const [danhSachXe, setDanhSachXe] = useState([]);
  const [loading, setLoading] = useState(true);

  const STATION_ID = 1;

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log("🚗 Đang tải danh sách xe từ API...");

        const vehicles = await vehicleService.fetchAndTransformVehicles();
        console.log("✅ Tổng số xe từ API:", vehicles.length);

        const filtered = vehicles.filter(
          (v) => Number(v.stationId) === STATION_ID
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
              : v.status === "Rented"
              ? "Đang cho thuê"
              : v.status === "Maintenance"
              ? "Bảo trì"
              : v.status === "Reserved" // 🆕 Trạng thái mới
              ? "Đã đặt trước"
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

  // 🆕 Bổ sung điều kiện lọc "Đã đặt trước"
  const locXe = danhSachXe.filter((xe) => {
    if (tab === "tatca") return true;
    if (tab === "cosan") return xe.trangThai === "Có sẵn";
    if (tab === "dangchothue") return xe.trangThai === "Đang cho thuê";
    if (tab === "baotri") return xe.trangThai === "Bảo trì";
    if (tab === "dadattruoc") return xe.trangThai === "Đã đặt trước";
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

      {/* 🆕 Tabs thêm “Đã đặt trước” */}
      <div className="tabs">
        {[
          { key: "tatca", label: "Tất cả" },
          { key: "cosan", label: "Có sẵn" },
          { key: "dangchothue", label: "Đang cho thuê" },
          { key: "baotri", label: "Bảo trì" },
          { key: "dadattruoc", label: "Đã đặt trước" }, // 🆕
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
                    : xe.trangThai === "Bảo trì"
                    ? "status-yellow"
                    : xe.trangThai === "Đã đặt trước"
                    ? "status-orange" // 🆕 thêm màu riêng
                    : ""
                }`}
              >
                {xe.trangThai}
              </p>

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
