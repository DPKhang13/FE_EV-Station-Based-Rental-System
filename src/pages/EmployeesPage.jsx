import React, { useState } from "react";
import "./EmployeesPage.css";

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([
    {
      name: "Lê Thị Mai",
      email: "lopezmichellefdgbw2500@gmail.com",
      position: "Nhân viên",
      location: "Quận 1",
      performance: "Tốt",
      deliveries: 142,
      status: "Đang làm việc",
      rating: 4.7,
    },
    {
      name: "Nguyễn Thị Hoa",
      email: "taylorbettytjvc4233@gmail.com",
      position: "Nhân viên",
      location: "Quận 3",
      performance: "Trung bình",
      deliveries: 98,
      status: "Đang làm việc",
      rating: 4.5,
    },
    {
      name: "Trần Văn Minh",
      email: "jonesjosephltgsg1493@gmail.com",
      position: "Nhân viên",
      location: "Quận 7",
      performance: "Xuất sắc",
      deliveries: 156,
      status: "Đang làm việc",
      rating: 4.9,
    },
    {
      name: "Phạm Quốc Huy",
      email: "swp391@gmail.com",
      position: "Nhân viên",
      location: "Quận 1",
      performance: "Trung bình",
      deliveries: 89,
      status: "Đang làm việc",
      rating: 4.6,
    },
  ]);

  // ➕ Thêm nhân viên mới
  const handleAddEmployee = () => {
    const newEmployee = {
      name: "Nhân viên mới",
      email: "newemployee@example.com",
      position: "Nhân viên",
      location: "Quận 10",
      performance: "Mới",
      deliveries: 0,
      status: "Đang làm việc",
      rating: 4.0,
    };
    setEmployees([...employees, newEmployee]);
  };

  // 🗑️ Xóa nhân viên
  const handleDelete = (index) => {
    if (window.confirm("Bạn có chắc muốn xóa nhân viên này không?")) {
      setEmployees(employees.filter((_, i) => i !== index));
    }
  };

  const topEmployees = [...employees]
    .sort((a, b) => b.deliveries - a.deliveries)
    .slice(0, 3);

  return (
    <div className="container">
      <h2>Quản lý nhân viên</h2>

      {/* 🔘 Nút thêm nhân viên */}
      <div className="actions">
        <button className="add-btn" onClick={handleAddEmployee}>
          ➕ Thêm nhân viên
        </button>
      </div>

      {/* 📊 Thống kê tổng quan */}
      <div className="stats-grid">
        <div className="stat-card">
          <p>Tổng nhân viên</p>
          <h3>{employees.length}</h3>
        </div>
        <div className="stat-card">
          <p>Đang làm việc</p>
          <h3>{employees.filter(e => e.status === "Đang làm việc").length}</h3>
        </div>
        <div className="stat-card">
          <p>Tổng giao nhận</p>
          <h3>{employees.reduce((a, b) => a + b.deliveries, 0)}</h3>
        </div>
      </div>

      {/* 📋 Bảng danh sách nhân viên */}
      <div className="employee-table">
        <h3>Danh sách nhân viên</h3>
        <table>
          <thead>
            <tr>
              <th>Nhân viên</th>
              <th>Vị trí</th>
              <th>Điểm làm việc</th>
              <th>Hiệu suất</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((e, index) => (
              <tr key={index}>
                <td>
                  <div className="employee-info">
                    <div className="avatar">{e.name[0]}</div>
                    <div>
                      <strong>{e.name}</strong>
                      <p className="email">{e.email}</p>
                    </div>
                  </div>
                </td>
                <td>{e.position}</td>
                <td>{e.location}</td>
                <td>
                  <span className="tag">{e.performance}</span>
                  <p className="small-text">{e.deliveries} lần giao nhận</p>
                </td>
                <td>
                  <span className="status active">{e.status}</span>
                </td>
                <td>
                  <button
                    className="delete-btn"
                    title="Xóa nhân viên"
                    onClick={() => handleDelete(index)}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔹 Giữ lại hai mục dưới */}
      
      <div className="bottom-section">
        <div className="performance-card">
          <h3>Hiệu suất theo điểm</h3>
          <ul>
            <li>Quận 1: 231 giao nhận | 2 nhân viên</li>
            <li>Quận 3: 98 giao nhận | 1 nhân viên</li>
            <li>Quận 7: 156 giao nhận | 1 nhân viên</li>
          </ul>
        </div>

        <div className="top-employee-card">
          <h3>Top nhân viên xuất sắc</h3>
          <ol>
            {topEmployees.map((e, index) => (
              <li key={index}>
                <span className="rank">#{index + 1}</span> {e.name} – {e.location} ({e.deliveries} lần giao)
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default EmployeesPage;
