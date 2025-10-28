import React, { useState, useEffect } from "react";
import { vehicleService, orderService } from "../services";
import "./GiaoTraXe.css";
import { useNavigate } from "react-router-dom";
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

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log('🚀 Loading vehicles and orders...');

        // Load vehicles và orders song song
        const [vehicles, orders] = await Promise.all([
          vehicleService.getVehicles(),
          orderService.getAll().catch(() => []) // Fallback nếu không có quyền
        ]);

        console.log('✅ Vehicles:', vehicles);
        console.log('✅ Orders:', orders);

        // Transform vehicles data
        const transformedVehicles = vehicles.map(vehicle => {
          // Tìm order đang active cho xe này
          const activeOrder = orders.find(
            order => order.vehicleId === vehicle.vehicleId &&
              ['PENDING', 'CONFIRMED', 'PICKED_UP'].includes(order.status)
          );

          return {
            id: vehicle.vehicleId,
            ten: vehicle.vehicleName || vehicle.name,
            bienSo: vehicle.plateNumber,
            pin: vehicle.batteryStatus ? parseInt(vehicle.batteryStatus) : 100,
            trangThai: vehicle.status === 'AVAILABLE' ? 'Có sẵn' :
              vehicle.status === 'RENTED' ? 'Đang cho thuê' :
                vehicle.status === 'MAINTENANCE' ? 'Bảo trì' : 'Đã đặt trước',
            khachHang: activeOrder?.customerName || activeOrder?.fullName,
            nhanXe: activeOrder?.startTime ? new Date(activeOrder.startTime).toLocaleString('vi-VN') : null,
            traXe: activeOrder?.endTime ? new Date(activeOrder.endTime).toLocaleString('vi-VN') : null,
            xacThuc: activeOrder?.status === 'CONFIRMED' ? 'Đã' : 'Chưa',
            orderId: activeOrder?.orderId
          };
        });

        setDanhSachXe(transformedVehicles);
      } catch (error) {
        console.error('❌ Error loading data:', error);
        // Fallback data
        setDanhSachXe([
          { id: 1, ten: "VinFast Klara S", bienSo: "29A-12345", pin: 95, trangThai: "Có sẵn" },
          { id: 2, ten: "VinFast Evo200", bienSo: "29B-67890", pin: 88, trangThai: "Đã đặt trước", khachHang: "Phạm Thị T", nhanXe: "14:00 - 20/12/2024", xacThuc: "Đã" },
          { id: 3, ten: "VinFast Klara S", bienSo: "29C-11111", pin: 65, trangThai: "Đã đặt trước", khachHang: "Lê Văn C", traXe: "18:00 - 22/12/2024", xacThuc: "Chưa" },
          { id: 4, ten: "VinFast Impes", bienSo: "29D-22222", pin: 100, trangThai: "Có sẵn" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const locXe = danhSachXe.filter((xe) => {
    if (tab === "tatca") return true;
    if (tab === "cosan") return xe.trangThai === "Có sẵn";
    if (tab === "dadattruoc") return xe.trangThai === "Đã đặt trước";
    if (tab === "dangchothue") return xe.trangThai === "Đang cho thuê";
    return true;
  });

  const handleAction = (xe) => {
    setSelectedXe(xe);
    if (xe.trangThai === "Có sẵn") setPopupType("chothue");
    else if (xe.trangThai === "Đã đặt trước") {
      if (xe.xacThuc === "Đã") {
        setPopupType("daXacThuc");
      } else {
        setPopupType("xacthuc");
      }

    }
    else if (xe.trangThai === "Đang cho thuê") setPopupType("nhanxe");
  };

  return (
    <div className="giaoTraXe-container">
      <h1 className="title">Quản lý giao - nhận xe</h1>
      <div className="tabs">
        {["tatca", "cosan", "dadattruoc", "dangchothue"].map((key) => (
          <button key={key} className={tab === key ? "active" : ""} onClick={() => setTab(key)}>
            {key === "tatca" ? "Tất cả" : key === "cosan" ? "Có sẵn" : key === "dadattruoc" ? "Đã đặt trước" : "Đang cho thuê"}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Đang tải dữ liệu xe...</p>
        </div>
      ) : (
        <div className="xe-grid">
          {locXe.map((xe) => (
            <div className="xe-card" key={xe.id}>
              <img src="https://live.staticflickr.com/65535/49932658111_30214a4229_b.jpg" alt={xe.ten} className="xe-img" />
              <h3 className="xe-name">{xe.ten}</h3>
              <p>Biển số: {xe.bienSo}</p>
              <p>Pin: {xe.pin}%</p>
              <p className={`xe-status ${xe.trangThai === "Có sẵn" ? "status-green" :
                  xe.trangThai === "Đã đặt trước" ? "status-yellow" : "status-blue"
                }`}>
                {xe.trangThai}
              </p>

              {xe.khachHang && <p>Khách hàng: <strong>{xe.khachHang}</strong></p>}

              <button className="btn-action" onClick={() => handleAction(xe)}>
                {xe.trangThai === "Có sẵn" ? "Cho thuê xe" :
                  xe.trangThai === "Đã đặt trước" ? "Bàn giao xe" :
                    "Nhận xe trả"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Hiển thị popup phù hợp */}
      {popupType === "chothue" && <PopupChoThue xe={selectedXe} onClose={() => setPopupType(null)} />}
      {popupType === "xacthuc" && <PopupXacThuc xe={selectedXe} onClose={() => setPopupType(null)} />}
      {popupType === "nhanxe" && <PopupNhanXe xe={selectedXe} onClose={() => setPopupType(null)} />}
      {popupType === "daXacThuc" && <PopupDaXacThuc xe={selectedXe} onClose={() => setPopupType(null)} />}
    </div>
  );
};

export default GiaoTraXe;
