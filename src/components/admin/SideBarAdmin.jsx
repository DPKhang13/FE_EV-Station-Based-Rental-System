import { NavLink, useNavigate } from "react-router-dom";
import { FaChartPie, FaUsers, FaSignOutAlt } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import "./SideBarAdmin.css";
import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function SideBarAdmin() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  if (!user) return <p>Đang tải dữ liệu người dùng...</p>;

  const name = user.name || "Admin";

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar__title">Bảng điều khiển</div>

        <nav className="sidebar__nav" aria-label="Thanh điều hướng quản trị">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              isActive ? "sidebar__btn active" : "sidebar__btn"
            }
          >
            <FaChartPie />
            <span>Thống kê tổng quan</span>
          </NavLink>

          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              isActive ? "sidebar__btn active" : "sidebar__btn"
            }
          >
            <FaUsers />
            <span>Quản lý người dùng</span>
          </NavLink>

          <NavLink
            to="/admin/verify"
            className={({ isActive }) =>
              isActive ? "sidebar__btn active" : "sidebar__btn"
            }
          >
            <MdVerified />
            <span>Duyệt xác minh</span>
          </NavLink>
        </nav>
      </div>

      <div className="sidebar__footer">
        <div className="sidebar__user">
          <div className="sidebar__avatar">A</div>
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
