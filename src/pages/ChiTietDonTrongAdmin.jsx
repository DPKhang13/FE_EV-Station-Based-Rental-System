// pages/ChiTietDonTrongAdmin.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ChiTietDonTrongAdmin.css";

const ChiTietDonTrongAdmin = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/api/order-details/order/${orderId}`
        );
        setDetails(res.data || []);
      } catch (err) {
        console.error("❌ Lỗi tải chi tiết đơn:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [orderId]);

  if (loading) {
    return <div className="od-loading">⏳ Đang tải chi tiết đơn hàng...</div>;
  }

  return (
    <div className="od-container">

      {/* Nút quay lại */}
      <button className="od-back-btn" onClick={() => navigate(-1)}>
        ⬅ Quay lại
      </button>

      <h1 className="od-title">Chi tiết đơn hàng</h1>

      <div className="od-card">
        {details.length === 0 ? (
          <div className="od-empty">📭 Không có dữ liệu chi tiết đơn hàng</div>
        ) : (
          <table className="od-table">
            <thead>
              <tr>
                <th>Detail ID</th>
                <th>Loại dịch vụ</th>
                <th>Mô tả</th>
                <th>Giá</th>
                <th>Thời gian bắt đầu</th>
                <th>Thời gian kết thúc</th>
                <th>Trạng thái</th>
              </tr>
            </thead>

            <tbody>
              {details.map((d) => (
                <tr key={d.detailId}>
                  <td>{d.detailId}</td>
                  <td>{d.type}</td>
                  <td>{d.description}</td>
                  <td className="od-money">
                    {d.price.toLocaleString()} VNĐ
                  </td>
                  <td>{new Date(d.startTime).toLocaleString()}</td>
                  <td>{new Date(d.endTime).toLocaleString()}</td>

                  <td>
                    <span className={`od-badge status-${d.status}`}>
                      {d.status}
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

export default ChiTietDonTrongAdmin;
