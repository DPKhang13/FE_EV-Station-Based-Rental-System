// pages/QuanLiXeTaiTram.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./QuanLiXeTaiTram.css";

const QuanLiXeTaiTram = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          "http://localhost:8080/api/rentalstation/getAll"
        );
        const data = Array.isArray(res.data) ? res.data : [];
        setStations(data);
      } catch (err) {
        console.error("Lỗi tải trạm:", err);
        setError("Không thể tải danh sách trạm.");
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, []);

  const handleViewDetail = (stationId) => {
    navigate(`/admin/hienthiXe/${stationId}`);
};
  if (loading) {
    return <div className="station-loading">Đang tải danh sách trạm...</div>;
  }

  return (
    <div className="station-page">
      <h1 className="station-title">Quản lý xe tại trạm</h1>

      {error && <p className="station-error">{error}</p>}

      <div className="station-grid">
        {stations.map((st) => (
          <div key={st.stationId} className="station-card">
            <h2 className="station-name">{st.name}</h2>

            <p className="station-address">
              {st.street}, {st.ward}, {st.district}, {st.city}
            </p>

            <button
              className="btn-station-detail"
              onClick={() => handleViewDetail(st.stationid)}
            >
              Xem chi tiết
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuanLiXeTaiTram;
