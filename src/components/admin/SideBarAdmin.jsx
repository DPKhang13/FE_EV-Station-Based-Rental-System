// Import các thư viện và component cần thiết
// NavLink: Component từ react-router-dom để tạo link điều hướng với style active
// useNavigate: Hook để điều hướng programmatically (không dùng link)
// useContext: Hook để lấy dữ liệu từ Context API
import { NavLink, useNavigate } from "react-router-dom";
import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import "./SideBarAdmin.css";

// Component Sidebar cho trang Admin
// Đây là component hiển thị menu điều hướng bên trái màn hình
export default function SideBarAdmin() {
  // useNavigate: Hook để điều hướng đến trang khác bằng code (không dùng link)
  // Ví dụ: navigate("/login") sẽ chuyển đến trang login
  const navigate = useNavigate();
  
  // useContext: Lấy dữ liệu user từ AuthContext
  // AuthContext là nơi lưu trữ thông tin user đã đăng nhập
  const { user, logout } = useContext(AuthContext);

  // Early return: Nếu chưa có user thì hiển thị loading
  // Đây là pattern phổ biến để tránh render khi chưa có dữ liệu
  if (!user) return <p>Đang tải dữ liệu người dùng...</p>;

  // Lấy tên user, nếu không có thì dùng "Admin" làm mặc định
  // Toán tử || (OR) sẽ trả về giá trị đầu tiên truthy
  const name = user.name || "Admin";

  // Hàm xử lý đăng xuất
  // Khi user click nút đăng xuất:
  // 1. Gọi hàm logout từ AuthContext để xóa tất cả thông tin (token, user, role, cookies)
  // 2. Điều hướng về trang home
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar__title">Bảng điều khiển</div>

        <nav className="sidebar__nav">
          {/* --- Nhóm a. Quản lý đội xe & điểm thuê --- */}
          <p className="sidebar__section-title">Đội xe & Điểm thuê</p>
          <NavLink to="/admin/quanlyxetaitram" className="sidebar__btn">
            <span>Quản lý xe tại trạm</span>
          </NavLink>
         
          
          
          


          <NavLink to="/admin/locations" className="sidebar__btn">
            <span>Điểm thuê</span>
          </NavLink>

          {/* --- Nhóm b. Quản lý khách hàng --- */}
          <p className="sidebar__section-title"> Khách hàng</p>
          <NavLink to="/admin/customers" className="sidebar__btn">
            <span>Danh sách khách hàng</span>
          </NavLink>

          {/* --- Nhóm f. Quản lý đơn hàng --- */}
          <p className="sidebar__section-title"> Quản lý đơn hàng</p>
          <NavLink to="/admin/quanlydonhang" className="sidebar__btn">
            <span>Quản lý đơn hàng</span>
          </NavLink>


          {/* --- Nhóm c. Quản lý nhân viên --- */}
          <p className="sidebar__section-title"> Nhân viên</p>
          <NavLink to="/admin/employees" className="sidebar__btn">
            <span>Danh sách nhân viên</span>
          </NavLink>


          {/* --- Nhóm d. Báo cáo & phân tích --- */}
          <p className="sidebar__section-title"> Báo cáo & Phân tích</p>
          <NavLink to="/admin/dashboard" className="sidebar__btn">
            <span>Thống kê tổng quan</span>
          </NavLink>
          <NavLink to="/admin/incident-reports" className="sidebar__btn">
            <span>Báo cáo sự cố</span>
          </NavLink>

          {/* --- Nhóm e. Bảng giá --- */}
          <p className="sidebar__section-title"> Bảng giá</p>
          <NavLink to="/admin/banggia" className="sidebar__btn">
            <span>Bảng giá</span>
          </NavLink>

        </nav>
      </div>

      {/* --- Footer --- */}
      <div className="sidebar__footer">
        <div className="sidebar__user">
          <div className="sidebar__avatar">{name[0]}</div>
          <div>
            <p className="sidebar__user-name">{name}</p>
            <p className="sidebar__user-role">Quản trị viên</p>
          </div>
        </div>

        <button className="sidebar__logout" onClick={handleLogout}>
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
