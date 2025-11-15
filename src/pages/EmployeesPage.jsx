import React, { useState, useEffect } from "react";
import "./EmployeesPage.css";
import { adminService } from "../services/adminService";

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStaff, setNewStaff] = useState({
    fullName: "", // ✅ đổi từ fullname → fullName
    email: "",
    phone: "",
    stationId: "",
    password: ""
  });
  const [errors, setErrors] = useState({});

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

  // 🪟 Mở modal thêm nhân viên
  const handleAddEmployee = () => {
    setShowAddModal(true);
  };

  // 🔁 Xử lý nhập form + reset lỗi khi gõ lại
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewStaff({ ...newStaff, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // 🔎 Kiểm tra dữ liệu nhập
  const validateForm = () => {
    const { fullName, email, phone, stationId, password } = newStaff;
    let newErrors = {};

    if (!fullName.trim()) newErrors.fullName = "Vui lòng nhập họ tên";
    if (!email.endsWith("@gmail.com")) newErrors.email = "Email phải có dạng @gmail.com";
    if (!/^0[0-9]{9}$/.test(phone))
      newErrors.phone = "Số điện thoại không hợp lệ (phải là đầu số Việt Nam 10 chữ số)";
    if (!stationId) newErrors.stationId = "Vui lòng nhập mã trạm";
    if (password.length < 6) newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🚀 Gọi API tạo nhân viên mới
  const handleCreateStaff = async () => {
    if (!validateForm()) return;

    try {
      const res = await fetch("http://localhost:8080/api/staffschedule/createStaff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: newStaff.fullName, // ✅ key đúng theo backend yêu cầu
          email: newStaff.email,
          phone: newStaff.phone,
          stationId: Number(newStaff.stationId),
          password: newStaff.password
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        console.error("📩 Backend trả lỗi:", errData);
        throw new Error(errData?.message || "Tạo tài khoản thất bại");
      }

      alert("✅ Tạo tài khoản nhân viên thành công!");
      setShowAddModal(false);
      setNewStaff({ fullName: "", email: "", phone: "", stationId: "", password: "" });
      setErrors({});
      getEmployees();
    } catch (err) {
      console.error("❌ Lỗi tạo tài khoản:", err);
      alert(`Không thể tạo tài khoản: ${err.message}`);
    }
  };

  // 🔁 Chuyển trạng thái tài khoản
  const handleToggleStatus = async (staff) => {
    if (!staff?.staffId) {
      alert("Không tìm thấy mã nhân viên!");
      return;
    }

    try {
      await fetch(`http://localhost:8080/api/staffschedule/staff/${staff.staffId}/toggle`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      alert("✅ Đã chuyển trạng thái tài khoản!");
      getEmployees();
    } catch (error) {
      console.error("❌ Lỗi khi chuyển trạng thái:", error);
      alert("Không thể đổi trạng thái. Vui lòng thử lại!");
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

      {/* 🔘 Nút thao tác */}
      <div className="actions">
        <button className="add-btn" onClick={handleAddEmployee}>
          ➕ Thêm nhân viên
        </button>

        <button
          className="update-btn"
          onClick={() => alert("🔄 Đang cập nhật thông tin nhân viên...")}
        >
          🧾 Cập nhật thông tin
        </button>

        <button
          className="delete-all-btn"
          onClick={() => {
            if (
              window.confirm("⚠️ Bạn có chắc muốn xóa vĩnh viễn tất cả tài khoản nhân viên không?")
            ) {
              alert("🗑️ Toàn bộ tài khoản đã bị xóa (mô phỏng).");
            }
          }}
        >
          ❌ Xóa tài khoản vĩnh viễn
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
                        className={`status ${
                          e.status === "ACTIVE" ? "active" : "inactive"
                        }`}
                      >
                        {e.status === "ACTIVE" ? "Hoạt động" : "Ngưng hoạt động"}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`toggle-btn ${
                          e.status === "ACTIVE" ? "deactivate" : "activate"
                        }`}
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

      {/* 🪟 Modal thêm nhân viên */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>➕ Tạo tài khoản nhân viên</h2>

            <label>Họ tên</label>
            <input
              type="text"
              name="fullName" // ✅ đổi name
              value={newStaff.fullName}
              onChange={handleChange}
              placeholder="VD: Nguyễn Văn A"
              className={errors.fullName ? "input-error" : ""}
            />
            {errors.fullName && <p className="error-text">{errors.fullName}</p>}

            <label>Email</label>
            <input
              type="email"
              name="email"
              value={newStaff.email}
              onChange={handleChange}
              placeholder="abc@gmail.com"
              className={errors.email ? "input-error" : ""}
            />
            {errors.email && <p className="error-text">{errors.email}</p>}

            <label>Số điện thoại</label>
            <input
              type="text"
              name="phone"
              value={newStaff.phone}
              onChange={handleChange}
              placeholder="VD: 0987654321"
              className={errors.phone ? "input-error" : ""}
            />
            {errors.phone && <p className="error-text">{errors.phone}</p>}

            <label>Mã trạm (Station ID)</label>
            <input
              type="number"
              name="stationId"
              value={newStaff.stationId}
              onChange={handleChange}
              placeholder="VD: 1"
              className={errors.stationId ? "input-error" : ""}
            />
            {errors.stationId && <p className="error-text">{errors.stationId}</p>}

            <label>Mật khẩu</label>
            <input
              type="password"
              name="password"
              value={newStaff.password}
              onChange={handleChange}
              placeholder="Tối thiểu 6 ký tự"
              className={errors.password ? "input-error" : ""}
            />
            {errors.password && <p className="error-text">{errors.password}</p>}

            <div className="modal-actions">
              <button className="btn btn-primary" onClick={handleCreateStaff}>
                ✅ Đồng ý tạo
              </button>
              <button className="btn btn-danger" onClick={() => setShowAddModal(false)}>
                ✖ Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesPage;
