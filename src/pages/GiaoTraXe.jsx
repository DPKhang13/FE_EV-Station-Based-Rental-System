import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./GiaoTraXe.css";

import vehicleService from "../services/vehicleService";
import { orderService } from "../services";
import { AuthContext } from "../context/AuthContext";

// Popups
import PopupDatTruoc from "../components/staff/PopupDatTruoc";
import PopupNhanXe from "../components/staff/PopUpNhanXe";
import PopupXacThuc from "../components/staff/PopUpXacThuc";
import PopupDaXacThuc from "../components/staff/PopUpDaXacThuc";

const GiaoTraXe = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // 🔹 State
  const [currentTab, setCurrentTab] = useState("tatca");
  const [searchTerm, setSearchTerm] = useState("");
  const [vehicleList, setVehicleList] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [popupType, setPopupType] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  /** ================================
   * 🚀 Lấy dữ liệu khi có user đăng nhập
   * ================================ */
  useEffect(() => {
    if (!user) return;
    const stationId = user.stationId || 1;

    const fetchData = async () => {
      try {
        setLoading(true);

        const vehicles = await vehicleService.fetchAndTransformVehicles();
        const ordersRes = await orderService.getAll();

        const vehiclesAtStation = vehicles
          .filter((v) => Number(v.stationId) === Number(stationId))
          .map((v) => ({
            id: v.id || v.vehicleId,
            ten: v.vehicle_name || v.vehicleName,
            bienSo: v.plate_number || v.plateNumber,
            pin: parseInt(v.battery_status?.replace("%", "") || "100"),
            trangThai: formatStatus(v.status),
            mau: v.color,
            hang: v.brand,
            nam: v.year_of_manufacture || v.year,
            tram: v.stationName,
            hinhAnh: v.image,
          }))
          .sort((a, b) => a.id - b.id);

        setVehicleList(vehiclesAtStation);
        setOrders(Array.isArray(ordersRes?.data) ? ordersRes.data : ordersRes);
      } catch (err) {
        console.error("❌ Lỗi khi tải dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  /** ================================
   * 🧾 Chuyển trạng thái xe sang tiếng Việt
   * ================================ */
  const formatStatus = (status) => {
    const map = {
      Available: "Có sẵn",
      Rented: "Đang cho thuê",
      RENTAL: "Đang cho thuê",
      Maintenance: "Bảo trì",
      Checking: "Đang kiểm tra",
      CHECKING: "Đang kiểm tra",
      Reserved: "Đã đặt trước",
    };
    return map[status] || "Không xác định";
  };

  /** ================================
   * 🎨 Màu trạng thái
   * ================================ */
  const getStatusColor = (status) => {
    const colorMap = {
      "Có sẵn": "green",
      "Đang cho thuê": "blue",
      "Bảo trì": "yellow",
      "Đang kiểm tra": "purple",
      "Đã đặt trước": "orange",
    };
    return colorMap[status] || "";
  };

  /** ================================
   * 🎬 Hành động theo trạng thái xe
   * ================================ */
  const handleVehicleAction = (xe) => {
    switch (xe.trangThai) {
      case "Có sẵn":
        setSelectedVehicle(xe);
        setPopupType("xacthuc"); // có thể là popup cho thuê hoặc xác thực giao
        break;

      case "Đã đặt trước":
        setSelectedVehicle(xe);
        setPopupType("datTruoc");
        break;

      case "Đang cho thuê": {
        const rentalOrder = orders.find(
          (o) =>
            Number(o.vehicleId) === Number(xe.id) &&
            ["RENTAL", "Rented", "ON_RENT", "IN_USE"].includes(o.status)
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
        setPopupType("daXacThuc");
        break;

      case "Đang kiểm tra":
        alert("🧾 Xe này đang được kiểm tra, vui lòng chờ xác nhận!");
        break;

      default:
        break;
    }
  };

  /** ================================
   * 🔍 Lọc xe theo tab + tìm kiếm
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

      {/* Tìm kiếm */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="🔍 Tìm theo biển số..."
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
        ].map((tab) => (
          <button
            key={tab.key}
            className={currentTab === tab.key ? "active" : ""}
            onClick={() => setCurrentTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Danh sách xe */}
      {loading ? (
        <div className="loading">Đang tải dữ liệu xe...</div>
      ) : filteredVehicles.length === 0 ? (
        <p className="empty">Không có xe phù hợp.</p>
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
              <h3>{xe.ten}</h3>
              <p>Biển số: {xe.bienSo}</p>
              <p>Pin: {xe.pin}%</p>
              <p>Hãng: {xe.hang}</p>
              <p>Trạm: {xe.tram}</p>

              <p className={`xe-status status-${getStatusColor(xe.trangThai)}`}>
                {xe.trangThai}
              </p>

         {/* Nút hành động */}
{xe.trangThai === "Đang cho thuê" && (
  <button className="btn-action" onClick={() => handleVehicleAction(xe)}>
    Nhận xe trả
  </button>
)}

{xe.trangThai === "Đã đặt trước" && (
  <button className="btn-action" onClick={() => handleVehicleAction(xe)}>
    Đang chờ bàn giao
  </button>
)}

            </div>
          ))}
        </div>
      )}

      {/* Popups */}
      {popupType === "datTruoc" && (
        <PopupDatTruoc xe={selectedVehicle} onClose={() => setPopupType(null)} />
      )}
      {popupType === "nhanxe" && (
        <PopupNhanXe xe={selectedVehicle} onClose={() => setPopupType(null)} />
      )}
      {popupType === "xacthuc" && (
        <PopupXacThuc xe={selectedVehicle} onClose={() => setPopupType(null)} />
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

export default GiaoTraXe;
