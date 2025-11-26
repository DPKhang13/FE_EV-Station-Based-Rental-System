import React, { useEffect, useContext, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/staff/SideBar";
import "./StaffPage.css";
import { AuthContext } from "../context/AuthContext";

export default function StaffPage() {
  const navigate = useNavigate();
  const { user, loading } = useContext(AuthContext);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  
  useEffect(() => {
    if(loading) return;
    const accessToken = localStorage.getItem("accessToken");
    
    if (!accessToken|| user?.role !== "staff") {
      navigate("/login", { replace: true });
    }
  }, [navigate, user, loading]); 

  return (
    <div className="staff-wrap">
      <div 
        className="sidebar-hover-area"
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
      >
        <Sidebar isOpen={sidebarHovered} />
      </div>
      <main className={`staff-main ${!sidebarHovered ? 'staff-main-expanded' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
}
