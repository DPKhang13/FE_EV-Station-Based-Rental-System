// /src/pages/AdminPage.jsx
import React, {useContext,useEffect} from "react";
import { Outlet, useNavigate } from "react-router-dom";
import SideBarAdmin from "../components/admin/SideBarAdmin";
import "./AdminPage.css";
import { AuthContext } from "../context/AuthContext";

export default function AdminPage() {
  const navigate = useNavigate();
   const { user,loading } = useContext(AuthContext);

  // ✅ Kiểm tra token (chặn nếu chưa đăng nhập)
  useEffect(() => {
  if (loading) return; // ⏳ đợi context load xong
  const token = localStorage.getItem("accessToken");
  if (!token || user?.role !== "admin") {
    navigate("/login", { replace: true });
  }
}, [navigate, user, loading]);

  return (
    <div className="admin-wrap">
      <SideBarAdmin />
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
