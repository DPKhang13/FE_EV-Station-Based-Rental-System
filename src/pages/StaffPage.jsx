import React from 'react'
import Sidebar from '../components/staff/SideBar'
import { Outlet } from 'react-router-dom'
import './StaffPage.css'

export default function StaffPage() {
  return (
    <div className="staff-wrap">
      <Sidebar />
      <main className="staff-main">
        <Outlet />
      </main>
    </div>
  );
}
