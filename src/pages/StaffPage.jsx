import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/staff/SideBar";
import "./StaffPage.css";

export default function StaffPage() {
  const navigate = useNavigate();

  /*
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    
    if (!accessToken) {
      navigate("/login", { replace: true });
    }
  }, [navigate]); 
  
  */

  return (
    <div className="staff-wrap">
      <Sidebar />
      <main className="staff-main">
        <Outlet />
      </main>
    </div>
  );
}
