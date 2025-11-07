import React, { useEffect, useState } from "react";
import "./AdminDashBoardPage.css";
import { adminService } from "../services/adminService";

const AdminDashBoardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Lấy dữ liệu dashboard
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await adminService.getDashboardStats();
        setData(res.data || res);
      } catch (err) {
        console.error("❌ Lỗi tải dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading)
    return <div className="dashboard-container">⏳ Đang tải dữ liệu...</div>;
  if (!data)
    return (
      <div className="dashboard-container">⚠️ Không có dữ liệu hiển thị!</div>
    );

  // 🎯 Trích xuất dữ liệu chính
  const kpi = data.kpi || {};
  const vehicles = data.vehiclesByStation || [];
  const revenue = data.revenueByStation || [];
  const incidents = data.recentIncidents || [];
  const peak = data.peakHourWindow || {};

  // 🧮 Tổng quan
  const summary = {
    revenue: `${kpi.revenueInRange?.toLocaleString("vi-VN")} đ`,
    totalCars: kpi.totalVehicles || 0,
    usageRate: `${Math.round((kpi.rentedVehicles / (kpi.totalVehicles || 1)) * 100)}%`,
    activeCars: kpi.rentedVehicles || 0,
  };

  // 💰 Doanh thu theo trạm
  // 💰 Doanh thu theo trạm (chuẩn với JSON)
const branches = (data.revenueByStationAnalysis || []).map((st) => ({
  name: st.stationName,
  avgPerDay: `${st.avgPerDay?.toLocaleString("vi-VN")} đ`,
  today: `${st.todayRevenue?.toLocaleString("vi-VN")} đ`,
  week: `${st.weekRevenue?.toLocaleString("vi-VN")} đ`,
  month: `${st.monthRevenue?.toLocaleString("vi-VN")} đ`,
  growthDay: st.growthDay ?? 0,
  growthWeek: st.growthWeek ?? 0,
  growthMonth: st.growthMonth ?? 0,
}));

  // 🚗 Tỷ lệ sử dụng xe theo trạm (lấy đúng từ API)
  const usage = vehicles.map((s) => ({
    name: s.stationName,
    used: s.rented || 0,
    total: s.total || 0,
    rate: s.utilization || 0,
  }));

  // 📊 Xu hướng thuê xe (mock)
  const trends = [
    { type: "Thuê theo giờ", percent: 60, color: "blue" },
    { type: "Thuê theo ngày", percent: 30, color: "green" },
    { type: "Thuê dài hạn", percent: 10, color: "purple" },
  ];

  // ⏰ Giờ cao điểm
  const peakTimes = [
    {
      branch: "Toàn hệ thống",
      times: [`${peak.startHour}:00 - ${peak.endHour}:00`],
      efficiency: summary.usageRate,
    },
  ];

  // 🔧 Tình hình sự cố
  const incidentStats = data.incidentKpi || {};

  return (
    <div className="dashboard-container">
      <h1>Báo cáo & Phân tích hệ thống</h1>
      <p className="subtitle">Tổng quan hoạt động và hiệu suất các trạm EV</p>

      {/* Tổng quan */}
      <div className="summary">
        <div className="card blue">
          <h2>Tổng doanh thu</h2>
          <p className="value">{summary.revenue}</p>
          <span>Trong kỳ</span>
        </div>
        <div className="card green">
          <h2>Tổng số xe</h2>
          <p className="value">{summary.totalCars}</p>
          <span>Trên toàn hệ thống</span>
        </div>
        <div className="card purple">
          <h2>Tỷ lệ sử dụng</h2>
          <p className="value">{summary.usageRate}</p>
          <span>Xe đang thuê</span>
        </div>
        <div className="card orange">
          <h2>Xe đang thuê</h2>
          <p className="value">{summary.activeCars}</p>
          <span>Đang hoạt động</span>
        </div>
      </div>

     {/* 💰 Phân tích doanh thu theo trạm */}
<div className="section">
  <h2>💰 Phân tích doanh thu theo trạm</h2>
  <table>
    <thead>
      <tr>
        <th>Trạm</th>
        <th>Doanh thu hôm nay</th>
        <th>Tăng trưởng ngày</th>
        <th>Tuần này</th>
        <th>Tăng trưởng tuần</th>
        <th>Tháng này</th>
        <th>Tăng trưởng tháng</th>
      </tr>
    </thead>
    <tbody>
      {branches.map((b, i) => (
        <tr key={i}>
          <td>{b.name}</td>
          <td>{b.today}</td>
          <td className={b.growthDay >= 0 ? "up" : "down"}>
            {b.growthDay >= 0 ? `+${b.growthDay}%` : `${b.growthDay}%`}
          </td>
          <td>{b.week}</td>
          <td className={b.growthWeek >= 0 ? "up" : "down"}>
            {b.growthWeek >= 0 ? `+${b.growthWeek}%` : `${b.growthWeek}%`}
          </td>
          <td>{b.month}</td>
          <td className={b.growthMonth >= 0 ? "up" : "down"}>
            {b.growthMonth >= 0 ? `+${b.growthMonth}%` : `${b.growthMonth}%`}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

      {/* 🚗 Sử dụng xe & xu hướng */}
      <div className="usage-trend">
        <div className="usage">
          <h2>🚗 Tỷ lệ sử dụng xe</h2>
          {usage.map((u, i) => (
            <div key={i} className="usage-item">
              <p>
                {u.name} ({u.used}/{u.total} xe)
              </p>
              <div className="bar">
                <div
                  className={`fill ${u.rate >= 80 ? "high" : u.rate >= 40 ? "medium" : "low"}`}
                  style={{ width: `${u.rate}%` }}
                ></div>
              </div>
              <span>{u.rate}%</span>
            </div>
          ))}
        </div>

        <div className="trends">
          <h2>📈 Xu hướng thuê xe</h2>
          <div className="trend-cards">
            {trends.map((t, i) => (
              <div key={i} className={`trend ${t.color}`}>
                <p className="percent">{t.percent}%</p>
                <p>{t.type}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ⚠️ Báo cáo sự cố */}
      <div className="section incident">
        <h2>⚠️ Báo cáo sự cố</h2>
        <div className="incident-summary">
          <div className="card red">
            <h3>Tổng sự cố</h3>
            <p>{incidentStats.totalIncidentsInRange || 0}</p>
          </div>
          <div className="card orange">
            <h3>Đang mở</h3>
            <p>{incidentStats.openIncidents || 0}</p>
          </div>
          <div className="card yellow">
            <h3>Chi phí thiệt hại</h3>
            <p>{incidentStats.incidentCostInRange?.toLocaleString("vi-VN")} đ</p>
          </div>
        </div>

        <h3>🔍 Chi tiết sự cố gần đây</h3>
        <table>
          <thead>
            <tr>
              <th>Mã</th>
              <th>Xe</th>
              <th>Mô tả</th>
              <th>Mức độ</th>
              <th>Ngày</th>
              <th>Chi phí</th>
            </tr>
          </thead>
          <tbody>
            {incidents.slice(0, 5).map((i) => (
              <tr key={i.incidentId}>
                <td>#{i.incidentId}</td>
                <td>{i.vehicleName}</td>
                <td>{i.description}</td>
                <td>{i.severity}</td>
                <td>{i.occurredOn}</td>
                <td>{i.cost.toLocaleString("vi-VN")} đ</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ⏰ Giờ cao điểm */}
      <div className="peak-time">
        <h2>⏰ Phân tích giờ cao điểm</h2>
        <div className="peak-time-container">
          {peakTimes.map((p, i) => (
            <div key={i} className="peak-time-branch">
              <h3>{p.branch}</h3>
              <div className="peak-times">
                {p.times.map((t, idx) => (
                  <span key={idx} className="time-slot">
                    {t}
                  </span>
                ))}
              </div>
              <p className="peak-usage">Hiệu suất trung bình: {p.efficiency}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashBoardPage;
