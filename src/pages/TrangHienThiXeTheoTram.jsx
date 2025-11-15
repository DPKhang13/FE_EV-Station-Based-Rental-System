// pages/TrangHienThiXeTheoTram.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./TrangHienThiXeTheoTram.css";

// Import ảnh 4 chỗ từ các thư mục riêng
// BMW 4 chỗ
import BMW4_Red from "../assets/BMW4/red.png";
import BMW4_White from "../assets/BMW4/white.jpg";
import BMW4_Blue from "../assets/BMW4/blue.jpg";
import BMW4_Black from "../assets/BMW4/black.png";
import BMW4_Silver from "../assets/BMW4/silver.jpg";

// Tesla 4 chỗ
import Tesla4_Red from "../assets/Tes4/red.jpg";
import Tesla4_White from "../assets/Tes4/white.jpg";
import Tesla4_Blue from "../assets/Tes4/blue.jpg";
import Tesla4_Black from "../assets/Tes4/black.jpg";
import Tesla4_Silver from "../assets/Tes4/silver.jpg";

// VinFast 4 chỗ
import VinFast4_Red from "../assets/Vin4/red.png";
import VinFast4_White from "../assets/Vin4/white.jpg";
import VinFast4_Blue from "../assets/Vin4/blue.jpg";
import VinFast4_Black from "../assets/Vin4/black.png";
import VinFast4_Silver from "../assets/Vin4/silver.png";

// Import ảnh 7 chỗ từ các thư mục riêng
// BMW 7 chỗ
import BMW7_Red from "../assets/BMW7/red.jpg";
import BMW7_White from "../assets/BMW7/white.jpg";
import BMW7_Blue from "../assets/BMW7/blue.jpg";
import BMW7_Black from "../assets/BMW7/black.jpg";
import BMW7_Silver from "../assets/BMW7/silver.jpg";

// Tesla 7 chỗ
import Tesla7_Red from "../assets/Tes7/red.jpg";
import Tesla7_White from "../assets/Tes7/white.jpg";
import Tesla7_Blue from "../assets/Tes7/blue.jpg";
import Tesla7_Black from "../assets/Tes7/black.jpg";
import Tesla7_Silver from "../assets/Tes7/silver.jpg";

// VinFast 7 chỗ
import VinFast7_Red from "../assets/Vin7/red.jpg";
import VinFast7_White from "../assets/Vin7/white.jpg";
import VinFast7_Blue from "../assets/Vin7/blue.jpg";
import VinFast7_Black from "../assets/Vin7/black.jpg";
import VinFast7_Silver from "../assets/Vin7/silver.jpg";

import DefaultCar from "../assets/4standard.jpg";

const TrangHienThiXeTheoTram = () => {
  const { station } = useParams();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stationName, setStationName] = useState("");

  // Map ảnh xe theo brand, seatCount, và color
  const getVehicleImage = (brand, seatCount, color) => {
    console.log(`🚗 Vehicle: Brand="${brand}", Color="${color}", Seats="${seatCount}"`);

    const colorMap = {
      "Red": "red",
      "White": "white",
      "Blue": "blue",
      "Black": "black",
      "Silver": "silver",
      "Đỏ": "red",
      "Trắng": "white",
      "Xanh": "blue",
      "Đen": "black",
      "Bạc": "silver"
    };

    const normalizedColor = colorMap[color] || "white";
    const brandUpper = (brand || "").toUpperCase().trim();
    const seats = parseInt(seatCount) || 4;

    console.log(`✅ Normalized: Brand="${brandUpper}", Color="${normalizedColor}", Seats=${seats}`);

    let selectedImages = {};

    if (station === "2") {
      // TRẠM 2: Tráo ảnh
      // BMW -> Tesla, Tesla -> VinFast, VinFast -> BMW
      if (brandUpper.includes("BMW")) {
        selectedImages = seats === 7 ? {
          red: Tesla7_Red, white: Tesla7_White, blue: Tesla7_Blue, black: Tesla7_Black, silver: Tesla7_Silver
        } : {
          red: Tesla4_Red, white: Tesla4_White, blue: Tesla4_Blue, black: Tesla4_Black, silver: Tesla4_Silver
        };
      } else if (brandUpper.includes("TESLA") || brandUpper.includes("TES")) {
        selectedImages = seats === 7 ? {
          red: VinFast7_Red, white: VinFast7_White, blue: VinFast7_Blue, black: VinFast7_Black, silver: VinFast7_Silver
        } : {
          red: VinFast4_Red, white: VinFast4_White, blue: VinFast4_Blue, black: VinFast4_Black, silver: VinFast4_Silver
        };
      } else if (brandUpper.includes("VINFAST") || brandUpper.includes("VIN")) {
        selectedImages = seats === 7 ? {
          red: BMW7_Red, white: BMW7_White, blue: BMW7_Blue, black: BMW7_Black, silver: BMW7_Silver
        } : {
          red: BMW4_Red, white: BMW4_White, blue: BMW4_Blue, black: BMW4_Black, silver: BMW4_Silver
        };
      }
    } else if (station === "3") {
      // TRẠM 3: Tráo ảnh (lần 2)
      // BMW -> VinFast, Tesla -> BMW, VinFast -> Tesla
      if (brandUpper.includes("BMW")) {
        selectedImages = seats === 7 ? {
          red: VinFast7_Red, white: VinFast7_White, blue: VinFast7_Blue, black: VinFast7_Black, silver: VinFast7_Silver
        } : {
          red: VinFast4_Red, white: VinFast4_White, blue: VinFast4_Blue, black: VinFast4_Black, silver: VinFast4_Silver
        };
      } else if (brandUpper.includes("TESLA") || brandUpper.includes("TES")) {
        selectedImages = seats === 7 ? {
          red: BMW7_Red, white: BMW7_White, blue: BMW7_Blue, black: BMW7_Black, silver: BMW7_Silver
        } : {
          red: BMW4_Red, white: BMW4_White, blue: BMW4_Blue, black: BMW4_Black, silver: BMW4_Silver
        };
      } else if (brandUpper.includes("VINFAST") || brandUpper.includes("VIN")) {
        selectedImages = seats === 7 ? {
          red: Tesla7_Red, white: Tesla7_White, blue: Tesla7_Blue, black: Tesla7_Black, silver: Tesla7_Silver
        } : {
          red: Tesla4_Red, white: Tesla4_White, blue: Tesla4_Blue, black: Tesla4_Black, silver: Tesla4_Silver
        };
      }
    } else {
      // TRẠM 1: Hiển thị đúng
      if (brandUpper.includes("BMW")) {
        selectedImages = seats === 7 ? {
          red: BMW7_Red, white: BMW7_White, blue: BMW7_Blue, black: BMW7_Black, silver: BMW7_Silver
        } : {
          red: BMW4_Red, white: BMW4_White, blue: BMW4_Blue, black: BMW4_Black, silver: BMW4_Silver
        };
      } else if (brandUpper.includes("TESLA") || brandUpper.includes("TES")) {
        selectedImages = seats === 7 ? {
          red: Tesla7_Red, white: Tesla7_White, blue: Tesla7_Blue, black: Tesla7_Black, silver: Tesla7_Silver
        } : {
          red: Tesla4_Red, white: Tesla4_White, blue: Tesla4_Blue, black: Tesla4_Black, silver: Tesla4_Silver
        };
      } else if (brandUpper.includes("VINFAST") || brandUpper.includes("VIN")) {
        selectedImages = seats === 7 ? {
          red: VinFast7_Red, white: VinFast7_White, blue: VinFast7_Blue, black: VinFast7_Black, silver: VinFast7_Silver
        } : {
          red: VinFast4_Red, white: VinFast4_White, blue: VinFast4_Blue, black: VinFast4_Black, silver: VinFast4_Silver
        };
      }
    }

    const img = selectedImages[normalizedColor] || DefaultCar;
    console.log(`📸 Station=${station}, Brand=${brandUpper}, Seats=${seats}, Color=${normalizedColor}`);
    return img;
  };

  // Map màu tên sang hex color
  const getColorHex = (colorName) => {
    const colorHexMap = {
      "Red": "#DC143C",
      "White": "#FFFFFF",
      "Blue": "#1E90FF",
      "Black": "#1a1a1a",
      "Silver": "#C0C0C0",
      "Đỏ": "#DC143C",
      "Trắng": "#FFFFFF",
      "Xanh": "#1E90FF",
      "Đen": "#1a1a1a",
      "Bạc": "#C0C0C0"
    };
    return colorHexMap[colorName] || "#CCCCCC";
  };

  const getStatusInfo = (status) => {
    const map = {
      Available: { text: "AVAILABLE", class: "AVAILABLE", display: "Sẵn sàng" },
      Rented: { text: "IN_USE", class: "IN_USE", display: "Đang thuê" },
      Reserved: { text: "RESERVED", class: "RESERVED", display: "Đã đặt" },
      Maintenance: { text: "MAINTENANCE", class: "MAINTENANCE", display: "Bảo trì" }
    };
    return map[status] || { text: status, class: "AVAILABLE", display: status };
  };

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await axios.get("http://localhost:8080/api/vehicles/get", {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const data = Array.isArray(res.data) ? res.data : [];

        // 🎯 Lọc theo stationId hoặc station_id
        const filtered = data.filter((v) => {
          const vStation = Number(v.stationId || v.station_id);
          return vStation === Number(station);
        });

        // Debug: Log 3 xe đầu tiên để xem cấu trúc dữ liệu
        if (filtered.length > 0) {
          console.log("📋 Sample vehicles data for Station", station);
          filtered.slice(0, 5).forEach((v, idx) => {
            console.log(`Vehicle ${idx + 1}:`, {
              vehicleName: v.vehicleName || v.vehicle_name,
              brand: v.brand,
              color: v.color,
              seatCount: v.seatCount || v.seat_count,
              plateNumber: v.plateNumber || v.plate_number
            });
          });
        }

        setVehicles(filtered);

        // 📍 Lấy tên trạm từ xe đầu tiên nếu có
        if (filtered.length > 0 && filtered[0].stationName) {
          setStationName(filtered[0].stationName);
        }
      } catch (err) {
        console.error("Lỗi tải xe:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [station]);

  if (loading) {
    return (
      <div className="station-vehicle-page">
        <div style={{ padding: "40px", textAlign: "center", fontSize: "18px", color: "#666" }}>
          ⏳ Đang tải danh sách xe...
        </div>
      </div>
    );
  }

  return (
    <div className="station-vehicle-page">
      {/* Header */}
      <div className="page-header-section">
        <h1 className="page-title">DANH SÁCH XE TẠI TRẠM #{station}</h1>
        {stationName && <p className="station-name-large">{stationName}</p>}
      </div>

      {vehicles.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
          <p>Không có xe nào tại trạm này</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="vehicle-table">
            <thead>
              <tr className="header-row">
                <th className="col-index">STT</th>
                <th className="col-image">ẢNH</th>
                <th className="col-name">TÊN XE</th>
                <th className="col-plate">BIỂN SỐ</th>
                <th className="col-brand">HÃNG</th>
                <th className="col-color">MÀU</th>
                <th className="col-seats">SỐ GHẾ</th>
                <th className="col-year">NĂM SX</th>
                <th className="col-mileage">QUÃNG ĐƯỜNG</th>
                <th className="col-battery">PIN (%)</th>
                <th className="col-status">TRẠNG THÁI</th>
              </tr>
            </thead>

            <tbody>
              {vehicles.map((v, index) => {
                const statusInfo = getStatusInfo(v.status);
                const batteryStatus = parseInt(v.batteryStatus || v.battery_status || 0);
                const batteryClass = batteryStatus >= 70 ? "high" : batteryStatus >= 40 ? "medium" : "low";

                return (
                  <tr key={v.vehicleId || v.id} className="data-row">
                    <td className="col-index">{index + 1}</td>
                    <td className="col-image">
                      <img 
                        src={getVehicleImage(v.brand, v.seatCount || v.seat_count, v.color)}
                        alt={v.vehicleName || v.vehicle_name}
                        className="vehicle-image"
                        onError={(e) => e.target.src = DefaultCar}
                      />
                    </td>
                    <td className="col-name">
                      <strong>{v.vehicleName || v.vehicle_name}</strong>
                    </td>
                    <td className="col-plate">
                      <span className="plate-number">{v.plateNumber || v.plate_number}</span>
                    </td>
                    <td className="col-brand">{v.brand || "N/A"}</td>
                    <td className="col-color">
                      <span 
                        className="color-badge"
                        style={{
                          backgroundColor: getColorHex(v.color),
                          borderColor: getColorHex(v.color)
                        }}
                        title={v.color}
                      />
                      {v.color}
                    </td>
                    <td className="col-seats">{v.seatCount || v.seat_count} chỗ</td>
                    <td className="col-year">{v.year || v.year_of_manufacture}</td>
                    <td className="col-mileage">{v.rangeKm || v.range_km} km</td>
                    <td className="col-battery">
                      <span className={`battery-badge ${batteryClass}`}>
                        {batteryStatus}%
                      </span>
                    </td>
                    <td className="col-status">
                      <span className={`status-badge ${statusInfo.class}`}>
                        {statusInfo.display}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Footer Stats */}
          <div className="table-footer">
            <div className="stats">
              <span className="stat-item">
                <strong>Tổng xe:</strong> {vehicles.length}
              </span>
              <span className="stat-item">
                <strong>Sẵn sàng:</strong> {vehicles.filter(v => v.status === "Available").length}
              </span>
              <span className="stat-item">
                <strong>Đang thuê:</strong> {vehicles.filter(v => v.status === "Rented").length}
              </span>
              <span className="stat-item">
                <strong>Bảo trì:</strong> {vehicles.filter(v => v.status === "Maintenance").length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrangHienThiXeTheoTram;
