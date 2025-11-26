// pages/LichSuThue.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./LichSuThue.css";

const LichSuThue = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(
          `https://be-ev-station-based-rental-system.onrender.com/api/order/customer/${userId}/history`
        );
        setOrders(res.data || []);
      } catch (err) {
        console.error("❌ Lỗi tải lịch sử thuê:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userId]);

  if (loading) {
    return <div className="ls-loading">⏳ Đang tải lịch sử thuê...</div>;
  }

  return (
    <div className="ls-container">

      {/* Nút quay lại */}
      <button className="ls-back-btn" onClick={() => navigate(-1)}>
        ⬅ Quay lại
      </button>

      <h1 className="ls-title">Lịch sử thuê xe</h1>

      <div className="ls-card">

        {orders.length === 0 ? (
          <div className="ls-empty">📭 Khách hàng chưa có lịch sử thuê xe</div>
        ) : (
          <table className="ls-table">
            <thead>
              <tr>
                <th>Xe</th>
                <th>Biển số</th>
                <th>Trạm thuê</th>
                <th>Thời gian bắt đầu</th>
                <th>Thời gian kết thúc</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Chi tiết</th>  {/* 👈 thêm cột */}
              </tr>
            </thead>

            <tbody>
              {orders.map((o) => (
                <tr key={o.orderId}>

                  <td><b>{o.brand}</b> - {o.variant}</td>
                  <td className="ls-plate">{o.plateNumber}</td>
                  <td>{o.stationName}</td>
                  <td>{new Date(o.startTime).toLocaleString()}</td>
                  <td>{new Date(o.endTime).toLocaleString()}</td>
                  <td className="ls-money">{o.totalPrice.toLocaleString()} VNĐ</td>

                  <td>
                    <span className={`ls-badge status-${o.status}`}>
                      {o.status}
                    </span>
                  </td>

                  {/* 🔥 Nút xem chi tiết */}
                  <td>
                    <button
                      className="ls-detail-btn"
                      onClick={() => navigate(`/admin/order-detail/${o.orderId}`)}
                    >
                       Xem chi tiết đơn
                    </button>
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

export default LichSuThue;
