import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./GiaoTraXe.css";

import vehicleService from "../services/vehicleService";
import { orderService } from "../services";
import { AuthContext } from "../context/AuthContext";

// Import ảnh 4 chỗ
import BMW4_Red from "../assets/BMW4/red.png";
import BMW4_White from "../assets/BMW4/white.jpg";
import BMW4_Blue from "../assets/BMW4/blue.jpg";
import BMW4_Black from "../assets/BMW4/black.png";
import BMW4_Silver from "../assets/BMW4/silver.jpg";

import Tesla4_Red from "../assets/Tes4/red.jpg";
import Tesla4_White from "../assets/Tes4/white.jpg";
import Tesla4_Blue from "../assets/Tes4/blue.jpg";
import Tesla4_Black from "../assets/Tes4/black.jpg";
import Tesla4_Silver from "../assets/Tes4/silver.jpg";

import VinFast4_Red from "../assets/Vin4/red.png";
import VinFast4_White from "../assets/Vin4/white.jpg";
import VinFast4_Blue from "../assets/Vin4/blue.jpg";
import VinFast4_Black from "../assets/Vin4/black.png";
import VinFast4_Silver from "../assets/Vin4/silver.png";

// Import ảnh 7 chỗ
import BMW7_Red from "../assets/BMW7/red.jpg";
import BMW7_White from "../assets/BMW7/white.jpg";
import BMW7_Blue from "../assets/BMW7/blue.jpg";
import BMW7_Black from "../assets/BMW7/black.jpg";
import BMW7_Silver from "../assets/BMW7/silver.jpg";

import Tesla7_Red from "../assets/Tes7/red.jpg";
import Tesla7_White from "../assets/Tes7/white.jpg";
import Tesla7_Blue from "../assets/Tes7/blue.jpg";
import Tesla7_Black from "../assets/Tes7/black.jpg";
import Tesla7_Silver from "../assets/Tes7/silver.jpg";

import VinFast7_Red from "../assets/Vin7/red.jpg";
import VinFast7_White from "../assets/Vin7/white.jpg";
import VinFast7_Blue from "../assets/Vin7/blue.jpg";
import VinFast7_Black from "../assets/Vin7/black.jpg";
import VinFast7_Silver from "../assets/Vin7/silver.jpg";

import DefaultCar from "../assets/4standard.jpg";

// Popups
import PopupDatTruoc from "../components/staff/PopupDatTruoc";
import PopupNhanXe from "../components/staff/PopUpNhanXe";
import PopupXacThuc from "../components/staff/PopUpXacThuc";
import PopupDaXacThuc from "../components/staff/PopUpDaXacThuc";
import PopupNhanChecking from "../components/staff/PopupNhanChecking";
import PopupXemChiTietXe from "../components/staff/PopupXemChiTietXe";

const GiaoTraXe = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

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

      console.log("🔄 Bắt đầu fetch vehicles cho trạm:", stationId);
      // ✅ Gọi API theo stationId (không load tất cả 120 xe)
      const vehicles = await vehicleService.fetchAndTransformVehicles(stationId);
      console.log("✅ Vehicles loaded:", vehicles?.length || 0);

      // ✅ Không fetch orders ở đây - chỉ fetch khi cần thiết (khi bấm quản lý đơn hàng)

      // ✅ API đã trả về xe của trạm rồi, không cần filter nữa
      const vehiclesAtStation = (vehicles || []).map((v) => {
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
      // ✅ Không set orders ở đây - chỉ fetch khi cần thiết
    } catch (err) {
      console.error("❌ Lỗi khi tải dữ liệu:", err);
      console.error("❌ Chi tiết lỗi:", err.message);
      
      // Set empty data để tránh crash
      setVehicleList([]);
      // ✅ Không set orders ở đây
      
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
   * 🔄 Fetch orders khi cần thiết
   * ================================ */
  const fetchOrdersIfNeeded = async () => {
    if (orders.length === 0) {
      try {
        console.log("🔄 Fetching orders on-demand...");
        const ordersRes = await orderService.getAll();
        const ordersList = Array.isArray(ordersRes?.data) ? ordersRes.data : (Array.isArray(ordersRes) ? ordersRes : []);
        setOrders(ordersList);
        console.log("✅ Orders loaded:", ordersList.length);
        return ordersList;
      } catch (err) {
        console.error("❌ Lỗi khi fetch orders:", err);
        return [];
      }
    }
    return orders;
  };

  /** ================================
   * 🎬 Hành động theo trạng thái xe
   * ================================ */
  const handleVehicleAction = async (xe) => {
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
        // ✅ Fetch orders nếu chưa có
        const currentOrders = await fetchOrdersIfNeeded();
        const rentalOrder = currentOrders.find(
          (o) =>
            Number(o.vehicleId) === Number(xe.id) &&
            ["RENTAL", "Rented", "ON_RENT", "IN_USE"].includes(o.status)
        );
        if (rentalOrder) {
          // ✅ Điều hướng tới trang xác thực khách hàng và tự động mở chi tiết
          navigate("/staff/xacthuc", {
            state: {
              autoOpenOrderDetail: rentalOrder.orderId,
              userId: rentalOrder.userId,
              fromGiaoTraXe: true
            }
          });
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
        // ✅ Fetch orders nếu chưa có
        const currentOrders = await fetchOrdersIfNeeded();
        const relatedOrder = currentOrders.find(
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
  // Map ảnh theo hãng + màu + loại xe - Sử dụng ảnh từ assets
const getCarImage = (brand, color, seatCount) => {
  const seatType = seatCount > 4 ? "7" : "4";
  const brandKey = brand?.toLowerCase()?.trim();
  const colorKey = color?.toLowerCase()?.trim() || "white";

  // Map ảnh theo brand và seatType
  const imageMap = {
    vinfast: {
      "4": {
        red: VinFast4_Red,
        white: VinFast4_White,
        blue: VinFast4_Blue,
        black: VinFast4_Black,
        silver: VinFast4_Silver,
      },
      "7": {
        red: VinFast7_Red,
        white: VinFast7_White,
        blue: VinFast7_Blue,
        black: VinFast7_Black,
        silver: VinFast7_Silver,
      },
    },
    tesla: {
      "4": {
        red: Tesla4_Red,
        white: Tesla4_White,
        blue: Tesla4_Blue,
        black: Tesla4_Black,
        silver: Tesla4_Silver,
      },
      "7": {
        red: Tesla7_Red,
        white: Tesla7_White,
        blue: Tesla7_Blue,
        black: Tesla7_Black,
        silver: Tesla7_Silver,
      },
    },
    bmw: {
      "4": {
        red: BMW4_Red,
        white: BMW4_White,
        blue: BMW4_Blue,
        black: BMW4_Black,
        silver: BMW4_Silver,
      },
      "7": {
        red: BMW7_Red,
        white: BMW7_White,
        blue: BMW7_Blue,
        black: BMW7_Black,
        silver: BMW7_Silver,
      },
    },
  };

  // Tìm ảnh phù hợp
  const image = imageMap[brandKey]?.[seatType]?.[colorKey];
  
  if (!image) {
    console.warn(`⚠️ [getCarImage] Không tìm thấy ảnh cho:`, {
      brand: brand,
      brandKey: brandKey,
      color: color,
      colorKey: colorKey,
      seatCount: seatCount,
      seatType: seatType
    });
  }

  return image || DefaultCar;
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
              <div className="xe-img-wrapper">
                <img
                  src={xe.hinhAnh}
                  alt={`${xe.hang} ${xe.mau}`}
                  className="xe-img"
                />
                {/* Badge "Đang chờ bàn giao" ở phía dưới trong ảnh */}
                {xe.trangThai === "Đã đặt trước" && (
                  <div className="xe-badge awaiting-delivery">
                    Đang chờ bàn giao
                  </div>
                )}
              </div>

              <h3>{xe.ten}</h3>
              <p><strong>Biển số:</strong> {xe.bienSo}</p>
              <p><strong>Trạng thái:</strong> <span className={`xe-status status-${getStatusColor(xe.trangThai)}`}>{xe.trangThai}</span></p>
              <p><strong>Màu sắc:</strong> {xe.mau}</p>

              {/* Nút hành động */}
              {xe.trangThai === "Đang cho thuê" && (
                <button
                  className="btn-action"
                  onClick={() => handleVehicleAction(xe)}
                  style={{ marginTop: '10px' }}
                >
                  Nhận xe trả
                </button>
              )}

              {xe.trangThai === "Đang kiểm tra" && (
                <button
                  className="btn-action checking"
                  onClick={() => handleVehicleAction(xe)}
                  style={{ marginTop: '10px' }}
                >
                  Nhận Checking
                </button>
              )}

              {/* Nút Xem chi tiết - Hiển thị cho TẤT CẢ các xe */}
              <button
                className="btn-action-compact btn-secondary"
                onClick={() => {
                  // Mở popup xem chi tiết xe với API
                  setSelectedVehicle(xe);
                  setPopupType("xemChiTiet");
                }}
                style={{ marginTop: '10px', width: '100%' }}
              >
                Xem chi tiết
              </button>
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
      {popupType === "xemChiTiet" && selectedVehicle && (
        <PopupXemChiTietXe
          vehicleId={selectedVehicle.id}
          onClose={() => setPopupType(null)}
          onReload={fetchData}
        />
      )}
    </div>
  );
};

export default GiaoTraXe;
