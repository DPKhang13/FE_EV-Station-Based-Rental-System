import React, { useState, useEffect } from "react";
import "./EmployeesPage.css";
import { adminService } from "../services/adminService";

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);

  // 🔹 Lấy danh sách nhân viên khi load trang
  useEffect(() => {
    getEmployees();
  }, []);

  // 🔹 Gọi API lấy danh sách nhân viên
  const getEmployees = async () => {
    try {
      const res = await adminService.getStaffs();
      const data = Array.isArray(res?.data) ? res.data : res;
      setEmployees(data || []);
    } catch (error) {
      console.error("❌ Lỗi tải danh sách nhân viên:", error);
      setEmployees([]);
    }
  };

  // 🔹 Map role sang tiếng Việt
  const hienThiChucVu = (role) => {
    switch (role?.toLowerCase()) {
      case "staff":
        return "Nhân viên";
      default:
        return "Không rõ";
    }
  };

  // ➕ Thêm nhân viên mẫu (client-side)
  const handleAddEmployee = () => {
    const newEmployee = {
      staffName: "Nhân viên mới",
      staffEmail: "newemployee@example.com",
      role: "staff",
      stationName: "Trạm Quận 10",
      pickupCount: 0,
      returnCount: 0,
      status: "ACTIVE",
    };
    setEmployees([...employees, newEmployee]);
  };



  // 🔁 Chuyển đổi trạng thái tài khoản
  const handleToggleStatus = async (staff) => {
    if (!staff?.staffId) {
      alert("Không tìm thấy mã nhân viên!");
      return;
    }

    try {
      await fetch(`http://localhost:8080/api/staffschedule/staff/${staff.staffId}/toggle`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }
      });

      alert("✅ Đã chuyển trạng thái tài khoản!");
      getEmployees(); // reload lại danh sách
    } catch (error) {
      console.error("❌ Lỗi khi chuyển trạng thái:", error);
      const msg = error?.response?.data?.message || error.message;
      alert(`⚠️ Không thể đổi trạng thái: ${msg}`);
    }
  };

  // 🏆 Đánh giá hiệu suất
  const danhGia = (e) => {
    const tong = (e.pickupCount || 0) + (e.returnCount || 0);
    if (tong >= 100) return "Xuất sắc";
    if (tong >= 50) return "Tốt";
    if (tong > 0) return "Khá";
    return "Mới";
  };

  // 🥇 Top nhân viên
  const topEmployees = [...employees]
    .sort(
      (a, b) =>
        (b.pickupCount + b.returnCount) - (a.pickupCount + a.returnCount)
    )
    .slice(0, 3);

  return (
    <div className="container">
      <h2>QUẢN LÝ NHÂN VIÊN</h2>

      {/* 🔘 Nút thêm nhân viên */}
      <div className="actions">
        <button className="add-btn" onClick={handleAddEmployee}>
          ➕ Thêm nhân viên
        </button>
      </div>

      {/* 📊 Thống kê tổng quan */}
      <div className="stats-grid">
        <div className="stat-card">
          <p>TỔNG NHÂN VIÊN</p>
          <h3>{employees.length}</h3>
        </div>
        <div className="stat-card">
          <p>ĐANG LÀM VIỆC</p>
          <h3>{employees.filter((e) => e.status === "ACTIVE").length}</h3>
        </div>
        <div className="stat-card">
          <p>TỔNG GIAO NHẬN</p>
          <h3>
            {employees.reduce(
              (a, e) => a + (e.pickupCount || 0) + (e.returnCount || 0),
              0
            )}
          </h3>
        </div>
      </div>

      {/* 📋 Bảng danh sách nhân viên */}
      <div className="employee-table">
        <h3>Danh sách nhân viên</h3>
        <div className="employee-table-container">
          <table>
            <thead>
              <tr>
                <th>NHÂN VIÊN</th>
                <th>CHỨC VỤ</th>
                <th>ĐIỂM LÀM VIỆC</th>
                <th>HIỆU SUẤT</th>
                <th>TRẠNG THÁI TÀI KHOẢN</th>
                <th>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">
                    Chưa có nhân viên nào
                  </td>
                </tr>
              ) : (
                employees.map((e, index) => (
                  <tr key={index}>
                    <td>
                      <div className="employee-info">
                        <div className="avatar">{e.staffName?.[0] || "?"}</div>
                        <div>
                          <strong>{e.staffName}</strong>
                          <p className="email">{e.staffEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td>{hienThiChucVu(e.role)}</td>
                    <td>{e.stationName || "Không rõ trạm"}</td>
                    <td>
                      <span className="tag">{danhGia(e)}</span>
                      <p className="small-text">
                        {(e.pickupCount || 0) + (e.returnCount || 0)} lần giao nhận
                      </p>
                    </td>
                    <td>
                      <span
                        className={`status ${e.status === "ACTIVE" ? "active" : "inactive"
                          }`}
                      >
                        {e.status === "ACTIVE"
                          ? "Hoạt động"
                          : "Ngưng hoạt động"}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`toggle-btn ${e.status === "ACTIVE" ? "deactivate" : "activate"}`}
                        onClick={() => handleToggleStatus(e)}
                      >
                        {e.status === "ACTIVE" ? "🟢 Hoạt động" : "🔴 Ngưng"}
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔹 Thống kê theo trạm và top nhân viên */}
      <div className="bottom-section">
        <div className="performance-card">
          <h3>Hiệu suất theo điểm</h3>
          <ul>
            {Object.entries(
              employees.reduce((acc, e) => {
                const station = e.stationName || "Không rõ trạm";
                const total = (e.pickupCount || 0) + (e.returnCount || 0);
                if (!acc[station]) acc[station] = { deliveries: 0, staffCount: 0 };
                acc[station].deliveries += total;
                acc[station].staffCount += 1;
                return acc;
              }, {})
            ).map(([station, stats]) => (
              <li key={station}>
                {station}: {stats.deliveries} giao nhận | {stats.staffCount} nhân viên
              </li>
            ))}
          </ul>
        </div>

        <div className="top-employee-card">
          <h3>Top nhân viên xuất sắc</h3>
          <ol>
            {topEmployees.map((e, index) => (
              <li key={index}>
                <span className="rank">#{index + 1}</span> {e.staffName} –{" "}
                {e.stationName} (
                {(e.pickupCount || 0) + (e.returnCount || 0)} lần giao)
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default EmployeesPage;
