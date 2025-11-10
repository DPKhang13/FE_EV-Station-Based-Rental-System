import { NavLink, useNavigate } from "react-router-dom";
import { FaMotorcycle, FaCashRegister } from "react-icons/fa6";
import { FaSignOutAlt } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import { IoReturnDownBack } from "react-icons/io5";
import "./SideBar.css";
import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function Sidebar() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  if (!user) return <p>Đang tải dữ liệu người dùng...</p>;

  const name = user.name || "Nhân viên";

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar__title">Quản lý trạm</div>

        <nav className="sidebar__nav" aria-label="Thanh điều hướng quản lý trạm">
          <NavLink
            to="/staff/giaotraxe"
            className={({ isActive }) =>
              isActive ? "sidebar__btn active" : "sidebar__btn"
            }
          >
             <FaMotorcycle />
            <span>Quản lí xe</span>
          </NavLink>

          <NavLink
            to="/staff/xacthuc"
            className={({ isActive }) =>
              isActive ? "sidebar__btn active" : "sidebar__btn"
            }
          >
            <MdVerified />
            <span>Quản lí đơn hàng</span>
          </NavLink>

          <NavLink
            to="/staff/thanhtoan"
            className={({ isActive }) =>
              isActive ? "sidebar__btn active" : "sidebar__btn"
            }
          >
            <FaCashRegister />
            <span>Tra cứu lịch sử giao dịch</span>
          </NavLink>

          {/* ✅ Mục mới: Bảng giá */}
          <NavLink
            to="/staff/banggia"
            className={({ isActive }) =>
              isActive ? "sidebar__btn active" : "sidebar__btn"
            }
          >
            <FaMotorcycle />
            <span>Bảng giá</span>
          </NavLink>

           <NavLink
            to="/staff/dichvu"
            className={({ isActive }) =>
              isActive ? "sidebar__btn active" : "sidebar__btn"
            }
          >
           <IoReturnDownBack />
            <span>Quản lí dịch vụ</span>
          </NavLink>
        </nav>
      </div>

      <div className="sidebar__footer">
        <div className="sidebar__user">
          <div className="sidebar__avatar">S</div>
          <div>
            <p className="sidebar__user-name">{name}</p>
            <p className="sidebar__user-role">Front Desk</p>
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
