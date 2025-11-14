// pages/ChiTietKhachHang.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ChiTietKhachHang.css";

const ChiTietKhachHang = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/auth/getUser/${id}`);
        setUser(res.data);
      } catch (err) {
        console.error("❌ Lỗi tải thông tin khách hàng:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  if (loading) {
    return <div className="ct-loading">⏳ Đang tải thông tin khách hàng...</div>;
  }

  if (!user) {
    return <div className="ct-error">⚠️ Không tìm thấy thông tin khách hàng!</div>;
  }

  return (
    <div className="ct-container">

      

      <h1 className="ct-title">Chi tiết khách hàng</h1>

      <div className="ct-card">

        <div className="ct-row">
          <span className="ct-label">Họ và tên:</span>
          <span className="ct-value">{user.fullName}</span>
        </div>

        <div className="ct-row">
          <span className="ct-label">Email:</span>
          <span className="ct-value">{user.email}</span>
        </div>

        <div className="ct-row">
          <span className="ct-label">Số điện thoại:</span>
          <span className="ct-value">{user.phone}</span>
        </div>

        <div className="ct-row">
          <span className="ct-label">Trạng thái:</span>
          <span className={`ct-badge status-${user.status}`}>
            {user.status}
          </span>
        </div>

        {/* 🔥 Nút xem lịch sử thuê (bên trong khung) */}
        <div className="ct-actions">
          <button
            className="btn-history"
            onClick={() => navigate(`/admin/lichsu-thue/${user.userId}`)}
          >
            📘 Xem lịch sử thuê xe
          </button>
        </div>

      </div>
      {/* 🔙 Nút quay lại ngoài khung */}
      <button className="btn-back" onClick={() => navigate(-1)}>
        ⬅ Quay lại
      </button>
    </div>
    
  );
};

export default ChiTietKhachHang;
