import { NavLink, useNavigate } from "react-router-dom";
import { FaChartPie, FaUsers, FaSignOutAlt, FaCar, FaMapMarkerAlt, FaUserTie, FaClipboardList } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import "./SideBarAdmin.css";

export default function SideBarAdmin() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  if (!user) return <p>Đang tải dữ liệu người dùng...</p>;

  const name = user.name || "Admin";
  const handleNavigateToVehicles = () => {
    console.log('🚗 Navigating to Vehicle Management');
    navigate('/admin/vehicles');
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar__title">Bảng điều khiển</div>

        <nav className="sidebar__nav">
          {/* --- Nhóm a. Quản lý đội xe & điểm thuê --- */}
          <p className="sidebar__section-title">🚗 Đội xe & Điểm thuê</p>
          <NavLink to="/admin/vehicles" className="sidebar__btn">
            <FaCar />
            <span>Quản lý xe</span>
          </NavLink>
          <NavLink to="/admin/quanlixe" className="sidebar__btn">
            <FaCar />
            <span>Quản lý xe tại trạm</span>
          </NavLink>
          
          
          


          <NavLink to="/admin/locations" className="sidebar__btn">
            <FaMapMarkerAlt />
            <span>Điểm thuê</span>
          </NavLink>

          {/* --- Nhóm b. Quản lý khách hàng --- */}
          <p className="sidebar__section-title">👥 Khách hàng</p>
          <NavLink to="/admin/customers" className="sidebar__btn">
            <FaUsers />
            <span>Danh sách khách hàng</span>
          </NavLink>


          {/* --- Nhóm c. Quản lý nhân viên --- */}
          <p className="sidebar__section-title">🧑‍💼 Nhân viên</p>
          <NavLink to="/admin/employees" className="sidebar__btn">
            <FaUserTie />
            <span>Danh sách nhân viên</span>
          </NavLink>


          {/* --- Nhóm d. Báo cáo & phân tích --- */}
          <p className="sidebar__section-title">📊 Báo cáo & Phân tích</p>
          <NavLink to="/admin/dashboard" className="sidebar__btn">
            <FaChartPie />
            <span>Thống kê tổng quan</span>
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
          <FaSignOutAlt />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
