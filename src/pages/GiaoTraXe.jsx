import React, { useState, useEffect, useContext } from "react";
import "./GiaoTraXe.css";

import vehicleService from "../services/vehicleService";
import { orderService } from "../services";

import PopupXacThuc from "../components/staff/PopUpXacThuc";
import PopupNhanXe from "../components/staff/PopUpNhanXe";
import PopupDaXacThuc from "../components/staff/PopUpDaXacThuc";
import { AuthContext } from "../context/AuthContext";

/**
 * 🧭 Component: GiaoTraXe
 * Quản lý xe theo từng trạm:
 *  - Xem danh sách xe tại trạm
 *  - Lọc theo trạng thái (Có sẵn, Bảo trì, Đang cho thuê,...)
 *  - Tìm kiếm theo biển số
 *  - Giao/nhận xe & xác thực
 */
const GiaoTraXe = () => {
  const { user } = useContext(AuthContext);

  // State giao diện
  const [currentTab, setCurrentTab] = useState("tatca");
  const [searchTerm, setSearchTerm] = useState("");

  // Dữ liệu chính
  const [vehicleList, setVehicleList] = useState([]); // danh sách xe của trạm
  const [orders, setOrders] = useState([]);           // danh sách đơn thuê xe

  // Quản lý popup
  const [popupType, setPopupType] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Trạng thái tải
  const [loading, setLoading] = useState(true);

  /** ================================
   * 🚀 Lấy dữ liệu khi có user đăng nhập
   * ================================ */
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const stationId = user.stationId || 1;

        // 1️⃣ Lấy danh sách xe
        const vehicles = await vehicleService.fetchAndTransformVehicles();
        const vehiclesAtStation = vehicles.filter(
          (v) => Number(v.stationId) === Number(stationId)
        );

        // 2️⃣ Chuẩn hoá dữ liệu xe
        const formattedVehicles = vehiclesAtStation
          .map((v) => ({
            id: v.id || v.vehicleId,
            ten: v.vehicle_name || v.vehicleName,
            bienSo: v.plate_number || v.plateNumber,
            pin: v.battery_status
              ? parseInt(v.battery_status.replace("%", ""))
              : 100,
            trangThai: formatVehicleStatus(v.status),
            mau: v.color,
            hang: v.brand,
            nam: v.year_of_manufacture || v.year,
            tram: v.stationName,
            hinhAnh: v.image,
          }))
          .sort((a, b) => a.id - b.id);

        setVehicleList(formattedVehicles);

        // 3️⃣ Lấy danh sách đơn thuê xe
        const orderRes = await orderService.getAll();
        const data = orderRes?.data || orderRes;
        setOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("❌ Lỗi khi tải dữ liệu:", error);
        setVehicleList([]);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  /** ================================
   * 🧾 Xử lý trạng thái xe hiển thị tiếng Việt
   * ================================ */
  const formatVehicleStatus = (status) => {
    switch (status) {
      case "Available":
        return "Có sẵn";
      case "Rented":
      case "RENTAL":
        return "Đang cho thuê";
      case "Maintenance":
        return "Bảo trì";
      case "Checking":
      case "CHECKING":
        return "Đang kiểm tra";
      case "Reserved":
        return "Đã đặt trước";
      default:
        return "Không xác định";
    }
  };

  /** ================================
   * 🎬 Xử lý khi nhấn nút hành động trên thẻ xe
   * ================================ */
  const handleVehicleAction = (xe) => {
    switch (xe.trangThai) {
      case "Có sẵn":
        setSelectedVehicle(xe);
        setPopupType("chothue");
        break;

      case "Đang cho thuê": {
        const rentalOrder = orders.find(
          (o) => Number(o.vehicleId) === Number(xe.id) && o.status === "RENTAL"
        );
        if (rentalOrder) {
          setSelectedVehicle({ ...xe, order: rentalOrder });
          setPopupType("nhanxe");
        } else {
          alert("⚠️ Không tìm thấy đơn thuê xe tương ứng!");
        }
        break;
      }

      case "Bảo trì":
        setSelectedVehicle(xe);
        setPopupType("xacthuc");
        break;

      case "Đang kiểm tra":
        alert("🧾 Xe này đang được kiểm tra, vui lòng chờ xác nhận!");
        break;

      default:
        break;
    }
  };

  /** ================================
   * 🔍 Lọc xe theo tab + tìm kiếm biển số
   * ================================ */
  const stationId = user?.stationId || 1;
  const filteredVehicles = vehicleList.filter((xe) => {
    const matchSearch = xe.bienSo
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchTab =
      currentTab === "tatca" ||
      (currentTab === "cosan" && xe.trangThai === "Có sẵn") ||
      (currentTab === "dangchothue" && xe.trangThai === "Đang cho thuê") ||
      (currentTab === "baotri" && xe.trangThai === "Bảo trì") ||
      (currentTab === "dangkiemtra" && xe.trangThai === "Đang kiểm tra") ||
      (currentTab === "dadattruoc" && xe.trangThai === "Đã đặt trước");

    return matchTab && matchSearch;
  });

  /** ================================
   * 🧱 JSX giao diện chính
   * ================================ */
  return (
    <div className="giaoTraXe-container">
      <h1 className="title">Quản lý giao - nhận xe (Trạm ID {stationId})</h1>

      {/* Ô tìm kiếm */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Tìm theo biển số..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabs lọc xe */}
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
            className={currentTab === t.key ? "active" : ""}
            onClick={() => setCurrentTab(t.key)}
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
      ) : filteredVehicles.length === 0 ? (
        <p style={{ textAlign: "center", padding: "40px" }}>
          Không có xe phù hợp.
        </p>
      ) : (
        <div className="xe-grid">
          {filteredVehicles.map((xe) => (
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

              <p className={`xe-status status-${getStatusColor(xe.trangThai)}`}>
                {xe.trangThai}
              </p>

              {/* Nút hành động */}
              {xe.trangThai === "Đang cho thuê" && (
                <button
                  className="btn-action"
                  onClick={() => handleVehicleAction(xe)}
                >
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

      {/* Popups */}
      {popupType === "chothue" && (
        <PopupChoThue xe={selectedVehicle} onClose={() => setPopupType(null)} />
      )}
      {popupType === "xacthuc" && (
        <PopupXacThuc xe={selectedVehicle} onClose={() => setPopupType(null)} />
      )}
      {popupType === "nhanxe" && (
        <PopupNhanXe xe={selectedVehicle} onClose={() => setPopupType(null)} />
      )}
      {popupType === "daXacThuc" && (
        <PopupDaXacThuc
          xe={selectedVehicle}
          onClose={() => setPopupType(null)}
        />
      )}
    </div>
  );
};

/** Helper: chuyển trạng thái sang class màu */
const getStatusColor = (status) => {
  if (status === "Có sẵn") return "green";
  if (status === "Đang cho thuê") return "blue";
  if (status === "Bảo trì") return "yellow";
  if (status === "Đang kiểm tra") return "purple";
  if (status === "Đã đặt trước") return "orange";
  return "";
};

export default GiaoTraXe;
