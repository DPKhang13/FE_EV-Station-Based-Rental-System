import React, { useEffect,useContext } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/staff/SideBar";
import "./StaffPage.css";
import { AuthContext } from "../context/AuthContext";

export default function StaffPage() {
  const navigate = useNavigate();
 const {user,loading} = useContext(AuthContext)
  
  useEffect(() => {
    if(loading) return;
    const accessToken = localStorage.getItem("accessToken");
    
    if (!accessToken|| user?.role !== "staff") {
      navigate("/login", { replace: true });
    }
  }, [navigate,user,loading]); 
  
  

  return (
    <div className="staff-wrap">
      <Sidebar />
      <main className="staff-main">
        <Outlet />
      </main>
    </div>
  );
}
