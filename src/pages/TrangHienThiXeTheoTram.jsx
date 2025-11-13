// pages/TrangHienThiXeTheoTram.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./TrangHienThiXeTheoTram.css";

const TrangHienThiXeTheoTram = () => {
  const { station } = useParams();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const getStatusInfo = (status) => {
    const map = {
      Available: { text: "Sẵn sàng", class: "AVAILABLE" },
      Rented: { text: "Đang thuê", class: "IN_USE" },
      Reserved: { text: "Đã đặt", class: "RESERVED" },
      Maintenance: { text: "Bảo trì", class: "MAINTENANCE" }
    };
    return map[status] || { text: status, class: "AVAILABLE" };
  };

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/vehicles/get");
        const data = Array.isArray(res.data) ? res.data : [];

        // 🎯 Lọc theo stationId hoặc station_id
        const filtered = data.filter((v) => {
          const vStation = Number(v.stationId || v.station_id);
          return vStation === Number(station);
        });

        setVehicles(filtered);
      } catch (err) {
        console.error("Lỗi tải xe:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [station]);

  if (loading) return <div style={{ padding: 20 }}>⏳ Đang tải danh sách xe...</div>;

  return (
    <div className="station-vehicle-page">
      <h1 className="title">Danh sách xe tại trạm #{station}</h1>

      {vehicles.length === 0 ? (
        <div className="empty">📭 Không có xe nào tại trạm này</div>
      ) : (
        <table className="vehicle-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Tên xe</th>
              <th>Biển số</th>
              <th>Hãng</th>
              <th>Màu</th>
              <th>Số ghế</th>
              <th>Năm SX</th>
              <th>Pin (%)</th>
              <th>Quãng đường</th>
              <th>Trạng thái</th>
            </tr>
          </thead>

          <tbody>
            {vehicles.map((v, index) => {
              const statusInfo = getStatusInfo(v.status);

              return (
                <tr key={v.vehicleId || v.id}>
                  <td>{index + 1}</td>

                  <td><strong>{v.vehicleName || v.vehicle_name}</strong></td>
                  <td className="plate">{v.plateNumber || v.plate_number}</td>
                  <td>{v.brand}</td>
                  <td>{v.color}</td>
                  <td>{v.seatCount || v.seat_count} chỗ</td>
                  <td>{v.year || v.year_of_manufacture}</td>
                  <td>{v.batteryStatus || v.battery_status}%</td>
                  <td>{v.rangeKm || v.range_km} km</td>

                  <td>
                    <span className={`status-badge ${statusInfo.class}`}>
                      {statusInfo.text}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TrangHienThiXeTheoTram;
