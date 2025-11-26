// Component Dashboard: Hiển thị thống kê tổng quan hệ thống
// Component này fetch và hiển thị các metrics quan trọng như doanh thu, số xe, tỷ lệ sử dụng
import React, { useEffect, useState } from "react";
import "./AdminDashBoardPage.css";
import { adminService } from "../../services/adminService";

const AdminDashBoardPage = () => {
  // State quản lý dữ liệu dashboard từ API
  // null: Chưa có dữ liệu (chưa fetch hoặc đang fetch)
  const [data, setData] = useState(null);
  
  // State quản lý trạng thái loading
  const [loading, setLoading] = useState(true);

  // useEffect: Fetch dữ liệu dashboard khi component mount
  // Dependency array [] rỗng = chỉ chạy 1 lần
  useEffect(() => {
    // Hàm async bên trong useEffect
    const fetchDashboard = async () => {
      try {
        // Gọi API service để lấy dashboard stats
        const res = await adminService.getDashboardStats();
        
        // Xử lý response: Có thể là { data: {...} } hoặc object trực tiếp
        // Nullish coalescing: Dùng res.data nếu có, không thì dùng res
        setData(res.data || res);
      } catch (err) {
        // Xử lý lỗi: Log error nhưng không crash app
        console.error("Lỗi tải dashboard:", err);
      } finally {
        // finally: Luôn chạy dù có lỗi hay không
        // Tắt loading indicator
        setLoading(false);
      }
    };
    
    // Gọi hàm fetch
    fetchDashboard();
  }, []);

  // Conditional rendering: Early return nếu đang loading
  // Hiển thị loading message thay vì render toàn bộ component
  if (loading)
    return <div className="dashboard-container">Đang tải dữ liệu...</div>;
  
  // Early return nếu không có dữ liệu
  if (!data)
    return (
      <div className="dashboard-container">Không có dữ liệu hiển thị!</div>
    );

  // ====== SAFE PARSE DATA ======
  // Defensive programming: Luôn kiểm tra và có fallback để tránh crash
  
  // KPI (Key Performance Indicators): Các chỉ số hiệu suất chính
  // Fallback với {} nếu data.kpi không tồn tại
  const kpi = data.kpi || {};

  // Danh sách vehicles theo trạm
  // Array.isArray(): Kiểm tra có phải array không
  // Fallback với [] nếu không phải array (tránh lỗi khi map)
  const vehicles = Array.isArray(data.vehiclesByStation)
    ? data.vehiclesByStation
    : [];

  // Phân tích doanh thu theo trạm
  const revenueAnalysis = Array.isArray(data.revenueByStationAnalysis)
    ? data.revenueByStationAnalysis
    : [];

  // Danh sách services gần đây (dịch vụ)
  const services = Array.isArray(data.recentServices)
    ? data.recentServices
    : [];

  // Thống kê services với default values
  // Object với default values: Đảm bảo luôn có các field cần thiết
  const serviceStats = data.serviceKpi || {
    totalServices: 0,
    totalCost: 0,
    servicesByType: {},
    servicesByStatus: {},
  };

  // Giờ cao điểm với default values
  const peak = data.peakHourWindow || { startHour: "--", endHour: "--" };

  // ====== SUMMARY: Tổng hợp các chỉ số chính ======
  const summary = {
    // Doanh thu: Format số theo chuẩn Việt Nam (dấu chấm phân cách hàng nghìn)
    // toLocaleString("vi-VN"): Format 900000 -> "900.000"
    revenue: `${(kpi.revenueInRange || 0).toLocaleString("vi-VN")} đ`,
    
    // Tổng số xe
    totalCars: kpi.totalVehicles || 0,
    
    // Tỷ lệ sử dụng: (Xe đang thuê / Tổng xe) * 100
    // Math.round(): Làm tròn số
    // (kpi.totalVehicles || 1): Tránh chia cho 0 (nếu totalVehicles = 0 thì dùng 1)
    usageRate: `${Math.round(
      (kpi.rentedVehicles / (kpi.totalVehicles || 1)) * 100
    )}%`,
    
    // Số xe đang được thuê
    activeCars: kpi.rentedVehicles || 0,
  };

  // ====== REVENUE BY STATION: Doanh thu theo từng trạm ======
  // Array.map(): Transform mỗi station thành object với format chuẩn
  const branches = revenueAnalysis.map((st) => ({
    name: st.stationName,
    
    // Format tiền cho từng khoảng thời gian
    today: `${(st.todayRevenue || 0).toLocaleString("vi-VN")} đ`,
    week: `${(st.weekRevenue || 0).toLocaleString("vi-VN")} đ`,
    month: `${(st.monthRevenue || 0).toLocaleString("vi-VN")} đ`,
    avgPerDay: `${(st.avgPerDay || 0).toLocaleString("vi-VN")} đ`,
    
    // Tăng trưởng: Dùng nullish coalescing (??) thay vì || để phân biệt 0 và undefined
    // ?? chỉ thay thế nếu null hoặc undefined, không thay thế 0
    growthDay: st.growthDay ?? 0,
    growthWeek: st.growthWeek ?? 0,
    growthMonth: st.growthMonth ?? 0,
  }));

  // ====== VEHICLE USAGE: Tỷ lệ sử dụng xe theo trạm ======
  // Transform data để dễ hiển thị trong UI
  const usage = vehicles.map((s) => ({
    name: s.stationName,
    used: s.rented || 0,      // Số xe đang được thuê
    total: s.total || 0,      // Tổng số xe
    rate: s.utilization || 0, // Tỷ lệ sử dụng (%)
  }));


  const peakTimes = [
    {
      branch: "Toàn hệ thống",
      times: [`${peak.startHour}:00 - ${peak.endHour}:00`],
      efficiency: summary.usageRate,
    },
  ];

  return (
    <div className="dashboard-container">
      <h1>Báo cáo & Phân tích hệ thống</h1>
      <p className="subtitle">Tổng quan hoạt động và hiệu suất các trạm EV</p>

      {/* SUMMARY CARDS - 4 ô riêng biệt trên cùng 1 hàng */}
      <div className="summary-cards-row">
        <div className="summary-card blue">
          <h2>Tổng doanh thu</h2>
          <p className="value">{summary.revenue}</p>
          <span>Trong kỳ</span>
        </div>
        <div className="summary-card green">
          <h2>Tổng số xe</h2>
          <p className="value">{summary.totalCars}</p>
          <span>Trên toàn hệ thống</span>
        </div>
        <div className="summary-card purple">
          <h2>Tỷ lệ sử dụng</h2>
          <p className="value">{summary.usageRate}</p>
          <span>Xe đang thuê</span>
        </div>
        <div className="summary-card orange">
          <h2>Xe đang thuê</h2>
          <p className="value">{summary.activeCars}</p>
          <span>Đang hoạt động</span>
        </div>
      </div>

      {/* REVENUE ANALYSIS */}
      <div className="section">
        <h2>Phân tích doanh thu theo trạm</h2>
        <div style={{ overflowX: 'auto', marginTop: '20px' }}>
          <table>
            <thead>
              <tr>
                <th>Trạm</th>
                <th>Hôm nay</th>
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
                    {b.growthMonth >= 0
                      ? `+${b.growthMonth}%`
                      : `${b.growthMonth}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* USAGE */}
      <div className="section">
        <h2>Tỷ lệ sử dụng xe</h2>
        <div className="usage">
          {usage.map((u, i) => (
            <div key={i} className="usage-item">
              <p>
                {u.name} ({u.used}/{u.total} xe)
              </p>
              <div className="bar">
                <div
                  className={`fill ${
                    u.rate >= 80 ? "high" : u.rate >= 40 ? "medium" : "low"
                  }`}
                  style={{ width: `${u.rate}%` }}
                ></div>
              </div>
              <span>{u.rate}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* SERVICES */}
      <div className="section incident">
        <h2>TỶ LỆ SỬ DỤNG DỊCH VỤ</h2>

        <div className="incident-summary">
          <div className="card red">
            <h3>Tổng dịch vụ</h3>
            <p>{serviceStats.totalServices || 0}</p>
          </div>
          <div className="card orange">
            <h3>Thành công</h3>
            <p>{serviceStats.servicesByStatus?.SUCCESS || 0}</p>
          </div>
          <div className="card yellow">
            <h3>Chi phí dịch vụ</h3>
            <p>
              {(serviceStats.totalCost || 0).toLocaleString(
                "vi-VN"
              )}{" "}
              đ
            </p>
          </div>
        </div>

        {/* Phân loại dịch vụ theo loại */}
        {serviceStats.servicesByType && Object.keys(serviceStats.servicesByType).length > 0 && (
          <div style={{ marginTop: '20px', marginBottom: '20px' }}>
            <h3>Dịch vụ theo loại</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '12px' }}>
              {Object.entries(serviceStats.servicesByType).map(([type, count]) => (
                <div key={type} style={{
                  padding: '12px 16px',
                  background: '#f3f4f6',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <strong>{type}:</strong> {count} dịch vụ
                </div>
              ))}
            </div>
          </div>
        )}

        <h3>Chi tiết dịch vụ gần đây</h3>
        <div style={{ overflowX: 'auto', marginTop: '20px' }}>
          <table>
            <thead>
              <tr>
                <th>Mã</th>
                <th>Xe</th>
                <th>Loại dịch vụ</th>
                <th>Mô tả</th>
                <th>Trạng thái</th>
                <th>Ngày</th>
                <th>Chi phí</th>
              </tr>
            </thead>
            <tbody>
              {services.length === 0 && (
                <tr>
                  <td colSpan="7">Không có dịch vụ</td>
                </tr>
              )}

              {services.slice(0, 5).map((s) => (
                <tr key={s.serviceId}>
                  <td>#{s.serviceId}</td>
                  <td>{s.vehicleName || 'N/A'}</td>
                  <td>{s.serviceType || 'N/A'}</td>
                  <td>{s.description || 'N/A'}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: s.status === 'SUCCESS' ? '#d1fae5' : '#fef3c7',
                      color: s.status === 'SUCCESS' ? '#059669' : '#d97706'
                    }}>
                      {s.status === 'SUCCESS' ? 'Thành công' : s.status || 'N/A'}
                    </span>
                  </td>
                  <td>{s.occurredAt ? new Date(s.occurredAt).toLocaleDateString('vi-VN') : 'N/A'}</td>
                  <td>{(s.cost || 0).toLocaleString("vi-VN")} đ</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PEAK HOURS */}
      <div className="peak-time">
        <h2>Phân tích giờ cao điểm</h2>
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
              <p className="peak-usage">
                Hiệu suất trung bình: {p.efficiency}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashBoardPage;
