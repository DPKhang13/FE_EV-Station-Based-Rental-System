import React, { useState, useEffect, useContext } from "react";
import "./GiaoTraXe.css";
import vehicleService from "../services/vehicleService";
import { orderService } from "../services";

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
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // 🔍 Thêm state tìm kiếm

  // 🌀 Load dữ liệu khi có user
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        setLoading(true);

        // 🚗 Lấy danh sách xe
        const vehicles = await vehicleService.fetchAndTransformVehicles();
        const STATION_ID = user?.stationId || 1;
        const filtered = vehicles.filter(
          (v) => Number(v.stationId) === Number(STATION_ID)
        );

        const transformed = filtered
          .map((v) => ({
            id: v.id || v.vehicleId,
            ten: v.vehicle_name || v.vehicleName,
            bienSo: v.plate_number || v.plateNumber,
            pin: v.battery_status
              ? parseInt(v.battery_status.replace("%", ""))
              : 100,
            trangThai:
              v.status === "Available"
                ? "Có sẵn"
                : v.status === "Rented" || v.status === "RENTAL"
                ? "Đang cho thuê"
                : v.status === "Maintenance"
                ? "Bảo trì"
                : v.status === "Checking" || v.status === "CHECKING"
                ? "Đang kiểm tra"
                : v.status === "Reserved"
                ? "Đã đặt trước"
                : "Không xác định",
            mau: v.color,
            hang: v.brand,
            nam: v.year_of_manufacture || v.year,
            bienThe: v.variant,
            congSuatPin: v.battery_capacity || v.batteryCapacity,
            quangDuong: v.range_km || v.rangeKm,
            tram: v.stationName,
            hinhAnh: v.image,
          }))
          .sort((a, b) => a.id - b.id);

        setDanhSachXe(transformed);

        // 📦 Lấy danh sách order
        const res = await orderService.getAll();
        const data = res?.data || res;
        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          console.error("⚠️ Dữ liệu trả về không phải là mảng:", data);
        }
      } catch (error) {
        console.error("❌ Lỗi khi load dữ liệu:", error);
        setDanhSachXe([]);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // 🧭 Khi nhấn nút hành động
  const handleAction = (xe) => {
    if (xe.trangThai === "Có sẵn") {
      setSelectedXe(xe);
      setPopupType("chothue");
    } else if (xe.trangThai === "Đang cho thuê") {
      const order = orders.find(
        (o) => Number(o.vehicleId) === Number(xe.id) && o.status === "RENTAL"
      );
      if (order) {
        setSelectedXe({ ...xe, order });
        setPopupType("nhanxe");
      } else {
        alert("⚠️ Không tìm thấy đơn thuê xe tương ứng!");
      }
    } else if (xe.trangThai === "Bảo trì") {
      setSelectedXe(xe);
      setPopupType("xacthuc");
    } else if (xe.trangThai === "Đang kiểm tra") {
      setSelectedXe(xe);
      alert("🧾 Xe này đang được kiểm tra, vui lòng chờ xác nhận!");
    }
  };

  if (!user) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <p>Đang tải dữ liệu người dùng...</p>
      </div>
    );
  }

  // ⚙️ Lọc xe theo tab + tìm kiếm theo biển số
  const STATION_ID = user?.stationId || 1;
  const locXe = danhSachXe.filter((xe) => {
    const matchSearch = xe.bienSo
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    if (tab === "tatca") return matchSearch;
    if (tab === "cosan") return xe.trangThai === "Có sẵn" && matchSearch;
    if (tab === "dangchothue") return xe.trangThai === "Đang cho thuê" && matchSearch;
    if (tab === "baotri") return xe.trangThai === "Bảo trì" && matchSearch;
    if (tab === "dangkiemtra") return xe.trangThai === "Đang kiểm tra" && matchSearch;
    if (tab === "dadattruoc") return xe.trangThai === "Đã đặt trước" && matchSearch;
    return matchSearch;
  });

  return (
    <div className="giaoTraXe-container">
      <h1 className="title">Quản lý giao - nhận xe (Trạm ID {STATION_ID})</h1>

      {/* 🔍 Thanh tìm kiếm theo biển số */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Tìm theo biển số..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <div className="tabs">
        {[
          { key: "tatca", label: "Tất cả" },
          { key: "cosan", label: "Có sẵn" },
          { key: "dangchothue", label: "Đang cho thuê" },
          { key: "baotri", label: "Bảo trì" },
          { key: "dangkiemtra", label: "Đang kiểm tra" },
          { key: "dadattruoc", label: "Đã đặt trước" },
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

      {/* Danh sách xe */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p>Đang tải dữ liệu xe...</p>
        </div>
      ) : locXe.length === 0 ? (
        <p style={{ textAlign: "center", padding: "40px" }}>
          Không có xe phù hợp.
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
                    : xe.trangThai === "Đang kiểm tra"
                    ? "status-purple"
                    : xe.trangThai === "Đã đặt trước"
                    ? "status-orange"
                    : ""
                }`}
              >
                {xe.trangThai}
              </p>

              {/* Hành động tùy theo trạng thái */}
              {xe.trangThai === "Đang cho thuê" && (
                <button className="btn-action" onClick={() => handleAction(xe)}>
                  Nhận xe trả
                </button>
              )}

              {xe.trangThai === "Đang kiểm tra" && (
                <button className="btn-disabled" disabled>
                  🔧 Đang kiểm tra
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
