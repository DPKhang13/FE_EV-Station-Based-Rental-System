import React, { useState ,useEffect} from "react";
import "./EmployeesPage.css";
import {adminService} from "../services/adminService";

const EmployeesPage = () => {
  /*const [employees, setEmployees] = useState([
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
  ]);*/

  const [employees, setEmployees] = useState([]);
 
  useEffect(() => {
    // gọi api Lấy danh sách nhân viên 
   getEmployees();

  }, []);



  const getEmployees = async () => {
       try {
        const res= await adminService.getStaffs();
        const data = Array.isArray(res?.data) ? res.data : res;
        setEmployees(data || []);
       } catch (error) {
        error.log("❌ Lỗi tải nhân viên:", error);
        setEmployees([]);
       }
  };
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
  // 🏆 Đánh giá hiệu suất nhân viên
  const danhGia = (employee) => {
    const totalDeliveries = employee.pickupCount + employee.returnCount;
    if (totalDeliveries >= 1) return "Xuất sắc";
    if (totalDeliveries === 0) return "Tốt";
    return "Trung bình";
  }

  const topEmployees = [...employees]
    .sort((a, b) => ((b.pickupCount+b.returnCount) - (a.pickupCount+a.returnCount)))
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
          <h3>{employees.filter(e => e.status === "ACTIVE").length}</h3>
        </div>
        <div className="stat-card">
          <p>Tổng giao nhận</p>
          <h3>{employees.reduce((a, b) => a + b.pickupCount + b.returnCount, 0)}</h3>
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
                    <div className="avatar">{e.staffName[0]}</div>
                    <div>
                      <strong>{e.staffName}</strong>
                      <p className="email">{e.staffEmail}</p>
                    </div>
                  </div>
                </td>
                <td>{e.role}</td>
                <td>{e.stationName}</td>
                <td>
                  <span className="tag">{danhGia(e)}</span>
                  <p className="small-text">{e.pickupCount+e.returnCount} lần giao nhận</p>
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
                <span className="rank">#{index + 1}</span> {e.staffName} – {e.stationName} ({e.pickupCount+e.returnCount} lần giao)
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default EmployeesPage;
