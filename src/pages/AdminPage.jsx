// /src/pages/AdminPage.jsx
import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import SideBarAdmin from "../components/admin/SideBarAdmin";
import "./AdminPage.css";

export default function AdminPage() {
  const navigate = useNavigate();

  // ✅ Kiểm tra token (chặn nếu chưa đăng nhập)
  React.useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="admin-wrap">
      <SideBarAdmin />
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
