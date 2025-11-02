import React from "react";
import "./EmployeesPage.css";

const EmployeesPage = () => {
  const employees = [
    {
      name: "Lê Thị Mai",
      email: "lopezmichellefdgbw2500@gmail.com",
      position: "Nhân viên giao nhận",
      location: "Điểm A - Quận 1",
      performance: "Tốt",
      rating: 4.7,
      deliveries: 142,
      status: "Đang làm việc",
    },
    {
      name: "Nguyễn Thị Hoa",
      email: "taylorbettytjvc4233@gmail.com",
      position: "Trưởng điểm",
      location: "Điểm B - Quận 3",
      performance: "Trung bình",
      rating: 4.9,
      deliveries: 98,
      status: "Đang làm việc",
    },
    {
      name: "Trần Văn Minh",
      email: "jonesjosephltgsg1493@gmail.com",
      position: "Nhân viên giao nhận",
      location: "Điểm C - Quận 7",
      performance: "Xuất sắc",
      rating: 4.8,
      deliveries: 156,
      status: "Đang làm việc",
    },
    {
      name: "Phạm Quốc Huy",
      email: "swp391@gmail.com",
      position: "Nhân viên kỹ thuật",
      location: "Điểm A - Quận 1",
      performance: "Trung bình",
      rating: 4.6,
      deliveries: 89,
      status: "Đang làm việc",
    },
  ];

  const topEmployees = employees
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  return (
    <div className="container">
      <h2>Quản lý nhân viên</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <p>Tổng nhân viên</p>
          <h3>4</h3>
        </div>
        <div className="stat-card">
          <p>Đang làm việc</p>
          <h3>4</h3>
        </div>
        <div className="stat-card">
          <p>Đánh giá TB</p>
          <h3>4.8</h3>
        </div>
        <div className="stat-card">
          <p>Tổng giao nhận</p>
          <h3>485</h3>
        </div>
      </div>

      <div className="employee-table">
        <h3>Danh sách nhân viên</h3>
        <table>
          <thead>
            <tr>
              <th>Nhân viên</th>
              <th>Vị trí</th>
              <th>Điểm làm việc</th>
              <th>Hiệu suất</th>
              <th>Đánh giá KH</th>
              <th>Trạng thái</th>
              <th>Thao tác</th> {/* 🆕 thêm cột thao tác */}
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
                <td>⭐ {e.rating}</td>
                <td>
                  <span className="status active">{e.status}</span>
                </td>
                <td>
                  <button className="delete-btn" title="Xóa nhân viên">
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bottom-section">
        <div className="performance-card">
          <h3>Hiệu suất theo điểm</h3>
          <ul>
            <li>Điểm A - Quận 1: ⭐ 4.7 | 231 giao nhận | 2 nhân viên</li>
            <li>Điểm B - Quận 3: ⭐ 4.9 | 98 giao nhận | 1 nhân viên</li>
            <li>Điểm C - Quận 7: ⭐ 4.8 | 156 giao nhận | 1 nhân viên</li>
          </ul>
        </div>

        <div className="top-employee-card">
          <h3>Top nhân viên xuất sắc</h3>
          <ol>
            {topEmployees.map((e, index) => (
              <li key={index}>
                <span className="rank">#{index + 1}</span> {e.name} – {e.location} ⭐ {e.rating}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default EmployeesPage;
