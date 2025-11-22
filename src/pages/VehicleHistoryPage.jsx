// pages/VehicleHistoryPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./VehicleHistoryPage.css";

const VehicleHistoryPage = () => {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vehicleInfo, setVehicleInfo] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken");

        // Lấy lịch sử giao dịch
        const res = await axios.get(
          `http://localhost:8080/api/order/vehicle/${vehicleId}/compact`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );

        const data = Array.isArray(res.data) ? res.data : [];
        setHistory(data);

        // Lấy thông tin xe
        if (data.length > 0) {
          setVehicleInfo({
            plateNumber: data[0].plateNumber,
            brand: data[0].brand,
            variant: data[0].variant
          });
        }
      } catch (err) {
        console.error("Lỗi tải lịch sử:", err);
      } finally {
        setLoading(false);
      }
    };

    if (vehicleId) {
      fetchHistory();
    }
  }, [vehicleId]);

  const formatMoney = (number) => {
    if (!number) return "0₫";
    return number.toLocaleString("vi-VN") + "₫";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN");
  };

  const translateStatus = (status) => {
    const map = {
      PENDING: "Đang chờ",
      CONFIRMED: "Đã xác nhận",
      COMPLETED: "Hoàn thành",
      CANCELLED: "Đã hủy",
      IN_PROGRESS: "Đang xử lý",
      ACTIVE: "Đang hoạt động"
    };
    return map[status] || status;
  };

  if (loading) {
    return <div className="vh-loading">⏳ Đang tải lịch sử giao dịch...</div>;
  }

  return (
    <div className="vh-container">
      <div className="vh-header">
        <button className="vh-back-btn" onClick={() => navigate(-1)}>
          ⬅ Quay lại
        </button>
        <h1 className="vh-title">Lịch sử giao dịch</h1>
        {vehicleInfo && (
          <div className="vh-vehicle-info">
            <p><strong>Biển số:</strong> {vehicleInfo.plateNumber}</p>
            <p><strong>Xe:</strong> {vehicleInfo.brand} - {vehicleInfo.variant}</p>
          </div>
        )}
      </div>

      <div className="vh-content">
        {history.length === 0 ? (
          <div className="vh-empty">
            <div style={{ fontSize: 48 }}>📭</div>
            <p>Không có lịch sử giao dịch nào</p>
          </div>
        ) : (
          <table className="vh-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Mã đơn</th>
                <th>Thời gian bắt đầu</th>
                <th>Thời gian kết thúc</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, index) => (
                <tr key={item.orderId}>
                  <td>{index + 1}</td>
                  <td>{item.orderId}</td>
                  <td>{formatDate(item.startTime)}</td>
                  <td>{formatDate(item.endTime)}</td>
                  <td>{formatMoney(item.price || item.totalPrice)}</td>
                  <td>
                    <span className={`vh-status vh-status-${(item.status || "").toLowerCase()}`}>
                      {translateStatus(item.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default VehicleHistoryPage;

