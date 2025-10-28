import { NavLink, useNavigate } from "react-router-dom";
import { FaMotorcycle, FaCashRegister } from "react-icons/fa6";
import { FaSignOutAlt } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import { IoReturnDownBack } from "react-icons/io5";
import "./SideBar.css";

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Xóa token đăng nhập (nếu có)
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    // Điều hướng về trang đăng nhập
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
            <IoReturnDownBack />
            <span>Quản lí giao và nhận xe</span>
          </NavLink>

          <NavLink
            to="/staff/xacthuc"
            className={({ isActive }) =>
              isActive ? "sidebar__btn active" : "sidebar__btn"
            }
          >
            <MdVerified />
            <span>Xác thực khách hàng</span>
          </NavLink>

          <NavLink
            to="/staff/thanhtoan"
            className={({ isActive }) =>
              isActive ? "sidebar__btn active" : "sidebar__btn"
            }
          >
            <FaCashRegister />
            <span>Thanh toán</span>
          </NavLink>

          <NavLink
            to="/staff/quanlyxe"
            className={({ isActive }) =>
              isActive ? "sidebar__btn active" : "sidebar__btn"
            }
          >
            <FaMotorcycle />
            <span>Quản lí xe tại trạm</span>
          </NavLink>
        </nav>
      </div>

      <div className="sidebar__footer">
        <div className="sidebar__user">
          <div className="sidebar__avatar">S</div>
          <div>
            <p className="sidebar__user-name">Nguyễn Văn A</p>
            <p className="sidebar__user-role">Front Desk</p>
          </div>
        </div>

        {/* 🔹 Nút đăng xuất */}
        <button className="sidebar__logout" onClick={handleLogout}>
          <FaSignOutAlt />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
