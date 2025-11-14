import React, { useState, useEffect, useContext } from "react";
// import { useNavigate } from "react-router-dom";
import "./GiaoTraXe.css";

import vehicleService from "../services/vehicleService";
import { orderService } from "../services";
import { AuthContext } from "../context/AuthContext";

// Popups
import PopupDatTruoc from "../components/staff/PopupDatTruoc";
import PopupNhanXe from "../components/staff/PopUpNhanXe";
import PopupXacThuc from "../components/staff/PopUpXacThuc";
import PopupDaXacThuc from "../components/staff/PopUpDaXacThuc";
import PopupNhanChecking from "../components/staff/PopupNhanChecking";

const GiaoTraXe = () => {
  const { user } = useContext(AuthContext);
  // const navigate = useNavigate();

  const [currentTab, setCurrentTab] = useState("tatca");
  const [searchTerm, setSearchTerm] = useState("");
  const [vehicleList, setVehicleList] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popupType, setPopupType] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  /** ================================
   * 🚀 Lấy dữ liệu xe và đơn hàng
   * ================================ */
  const fetchData = async () => {
    if (!user) {
      console.warn("⚠️ User chưa đăng nhập, không thể load dữ liệu");
      setLoading(false);
      return;
    }
    const stationId = user.stationId || 1;

    try {
      setLoading(true);

      console.log("🔄 Bắt đầu fetch vehicles...");
      const vehicles = await vehicleService.fetchAndTransformVehicles();
      console.log("✅ Vehicles loaded:", vehicles?.length || 0);

      console.log("🔄 Bắt đầu fetch orders...");
      const ordersRes = await orderService.getAll();
      console.log("✅ Orders loaded:", ordersRes?.data?.length || ordersRes?.length || 0);

      const vehiclesAtStation = (vehicles || [])
        .filter((v) => Number(v.stationId) === Number(stationId))
        .map((v) => {
          const seatCount = v.seatCount || v.seat_count || 4;
          return {
            id: v.id || v.vehicleId,
            ten: v.vehicle_name || v.vehicleName || v.name || "Xe điện",
            bienSo: v.plate_number || v.plateNumber || "N/A",
            pin: parseInt(v.battery_status?.replace("%", "") || v.batteryStatus?.replace("%", "") || "100"),
            trangThai: formatStatus(v.status),
            mau: v.color || "White",
            hang: v.brand || "VinFast",
            nam: v.year_of_manufacture || v.year || 2024,
            tram: v.stationName || user?.stationName || `Trạm ${stationId}`,
            seatCount: seatCount,
            hinhAnh: getCarImage(v.brand || "VinFast", v.color || "White", seatCount),
          };
        })
        .sort((a, b) => a.id - b.id);

      console.log("✅ Vehicles at station:", vehiclesAtStation.length);

      setVehicleList(vehiclesAtStation);
      setOrders(Array.isArray(ordersRes?.data) ? ordersRes.data : (Array.isArray(ordersRes) ? ordersRes : []));
    } catch (err) {
      console.error("❌ Lỗi khi tải dữ liệu:", err);
      console.error("❌ Chi tiết lỗi:", err.message);
      
      // Set empty data để tránh crash
      setVehicleList([]);
      setOrders([]);
      
      // Hiển thị thông báo lỗi cho user
      alert("⚠️ Không thể tải dữ liệu xe. Vui lòng kiểm tra kết nối backend hoặc thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  /** ================================
   * 🧾 Chuyển trạng thái xe sang tiếng Việt
   * ================================ */
const formatStatus = (status) => {
  const s = status?.toUpperCase?.() || "";

  const map = {
    "AVAILABLE": "Có sẵn",
    "RENTED": "Đang cho thuê",
    "RENTAL": "Đang cho thuê",
    "ON_RENT": "Đang cho thuê",
    "IN_USE": "Đang cho thuê",

    "MAINTENANCE": "Bảo trì",
    "CHECKING": "Đang kiểm tra",

    "BOOKED": "Đã đặt trước",
    "RESERVED": "Đã đặt trước",
  };

  return map[s] || "Không xác định";
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
        setPopupType("xacthuc");
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

      case "Đang kiểm tra": {
        const relatedOrder = orders.find(
          (o) => Number(o.vehicleId) === Number(xe.id)
        );
        if (!relatedOrder) {
          alert("⚠️ Không tìm thấy đơn hàng liên quan đến xe này!");
          return;
        }
        setSelectedVehicle({ ...xe, order: relatedOrder });
        setPopupType("nhanChecking");
        break;
      }

      default:
        break;
    }
  };

  /** ================================
   * 🔍 Lọc xe theo tab + tìm kiếm
   * ================================ */
  const stationId = user?.stationId || 1;
  const stationName = user?.stationName || vehicleList[0]?.tram || `Trạm ${stationId}`;
  
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
  // Map ảnh theo hãng + màu + loại xe
const getCarImage = (brand, color, seatCount) => {
  const base = "https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar";
  const seatType = seatCount > 4 ? "7_Cho" : "4_Cho";
  const brandKey = brand?.toLowerCase();

  // Chuẩn hóa màu về tiếng Việt
  const colorMap = {
    white: "trắng",
    silver: "bạc",
    black: "đen",
    red: "đỏ",
    blue: "xanh",
  };
  const colorKey = colorMap[color?.toLowerCase()] || "trắng"; // fallback trắng nếu không match

  const imgMap = {
    vinfast: {
      "7_Cho": {
        trắng: `${base}/7_Cho/Vinfast/unnamed.jpg`,
        bạc: `${base}/7_Cho/Vinfast/unnamed%20(4).jpg`,
        đen: `${base}/7_Cho/Vinfast/unnamed%20(3).jpg`,
        đỏ: `${base}/7_Cho/Vinfast/unnamed%20(2).jpg`,
        xanh: `${base}/7_Cho/Vinfast/unnamed%20(1).jpg`,
      },
      "4_Cho": {
        trắng: `${base}/4_Cho/Vinfast/unnamed.jpg`,
        bạc: `${base}/4_Cho/Vinfast/b76c51c2-6e69-491c-ae83-0d36ff93cdff.png`,
        đen: `${base}/4_Cho/Vinfast/e88bd242-3df4-48a7-8fe2-a9a3466f939f.png`,
        đỏ: `${base}/4_Cho/Vinfast/e420cb1b-1710-4dbe-a5e3-e1285c690b6e.png`,
        xanh: `${base}/4_Cho/Vinfast/a80cae76-5c8a-4226-ac85-116ba2da7a3a.png`,
      },
    },
    bmw: {
      "7_Cho": {
        trắng: `${base}/7_Cho/BMW/unnamed.jpg`,
        bạc: `${base}/7_Cho/BMW/unnamed%20(3).jpg`,
        đen: `${base}/7_Cho/BMW/unnamed%20(4).jpg`,
        đỏ: `${base}/7_Cho/BMW/unnamed%20(1).jpg`,
        xanh: `${base}/7_Cho/BMW/unnamed%20(2).jpg`,
      },
      "4_Cho": {
        trắng: `${base}/4_Cho/BMW/white.jpg`,
        bạc: `${base}/4_Cho/BMW/unnamed%20(1).jpg`,
        đen: `${base}/4_Cho/BMW/8f9f3e31-0c04-4441-bb40-97778c9824e0.png`,
        đỏ: `${base}/4_Cho/BMW/7f3edc23-30ba-4e84-83a9-c8c418f2362d.png`,
        xanh: `${base}/4_Cho/BMW/blue.jpg`,
      },
    },
    tesla: {
      "7_Cho": {
        trắng: `${base}/7_Cho/Tesla/unnamed.jpg`,
        bạc: `${base}/7_Cho/Tesla/unnamed%20(4).jpg`,
        đen: `${base}/7_Cho/Tesla/unnamed%20(3).jpg`,
        đỏ: `${base}/7_Cho/Tesla/unnamed%20(2).jpg`,
        xanh: `${base}/7_Cho/Tesla/unnamed%20(1).jpg`,
      },
      "4_Cho": {
        trắng: `${base}/4_Cho/Tesla/unnamed%20(2).jpg`,
        bạc: `${base}/4_Cho/Tesla/unnamed4.jpg`,
        đen: `${base}/4_Cho/Tesla/unnamed%20(3).jpg`,
        đỏ: `${base}/4_Cho/Tesla/unnamed%20(1).jpg`,
        xanh: `${base}/4_Cho/Tesla/unnamed.jpg`,
      },
    },
  };

  return (
    imgMap[brandKey]?.[seatType]?.[colorKey] ||
    "https://live.staticflickr.com/65535/49932658111_30214a4229_b.jpg"
  );
};



  /** ================================
   * 🧱 JSX giao diện chính
   * ================================ */
  return (
    <div className="giaoTraXe-container">
      <h1 className="title">Quản lý giao - nhận xe ({stationName})</h1>

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
  src={xe.hinhAnh}
  alt={`${xe.hang} ${xe.mau}`}
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
                <button
                  className="btn-action"
                  onClick={() => handleVehicleAction(xe)}
                >
                  Nhận xe trả
                </button>
              )}

              {xe.trangThai === "Đã đặt trước" && (
                <button
                  className="btn-action"
                  onClick={() => handleVehicleAction(xe)}
                >
                  Đang chờ bàn giao
                </button>
              )}

              {xe.trangThai === "Đang kiểm tra" && (
                <button
                  className="btn-action checking"
                  onClick={() => handleVehicleAction(xe)}
                >
                  Nhận Checking
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
        <PopupNhanXe xe={selectedVehicle} onClose={() => setPopupType(null)} 
        onReload={fetchData}/>
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
      {popupType === "nhanChecking" && (
        <PopupNhanChecking
          xe={selectedVehicle}
          onClose={() => setPopupType(null)}
          onReload={fetchData} // ✅ callback reload
        />
      )}
    </div>
  );
};

export default GiaoTraXe;
