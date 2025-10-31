import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Offers from './components/Offers';
import Testimonials from './components/Testimonials';
import Stats from './components/Stats';
import Contact from './components/Contact';
import Footer from './components/Footer';
import ListCarPage from './components/ListCarPage';
import LocationSelect from './components/LocationSelect';
import Booking4Seater from './components/Booking4Seater';
import Booking7Seater from './components/Booking7Seater';
import LoginPage from './pages/LoginPage.jsx';
import { AuthProvider } from './context/AuthContext';
import StaffPage from './pages/StaffPage.jsx';
import APIStatusChecker from './components/APIStatusChecker';

import RegisterPage from './pages/RegisterPage.jsx';
import GiaoTraXe from './pages/GiaoTraXe.jsx';
import XacThucKhachHangPage from './pages/XacThucKhachHangPage.jsx';
import ThanhToanPage from './pages/ThanhToanPage.jsx';
import QuanLyXePage from './pages/QuanLyXePage.jsx';
import VerifyOtpPage from './pages/VerifyOtpPage.jsx';
const HomePage = () => (
  <ScrollToSectionWrapper>
    <Hero />
    <Offers />
    <Testimonials />
    <Stats />
    <Contact />
  </ScrollToSectionWrapper>
);

function ScrollToSectionWrapper({ children }) {
  const location = useLocation();
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const scrollId = params.get('scroll');
    if (scrollId) {
      setTimeout(() => {
        const el = document.getElementById(scrollId);
        if (el) {
          const yOffset = -100;
          const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 350);
    }
  }, [location.search]);
  return <>{children}</>;
}

// ✅ Tạo wrapper để điều kiện hiển thị layout
function LayoutWrapper({ children }) {
  const location = useLocation();
  const hideLayout = (location.pathname === '/login') || (location.pathname === '/register') || (location.pathname.startsWith('/staff')||(location.pathname.startsWith('/verify-otp'))); // 🔹 Kiểm tra nếu đang ở /login

  return (
    <>
      {!hideLayout && <Header />}
      {!hideLayout && <Navbar />}

      {children}

      {!hideLayout && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <APIStatusChecker />
        <LayoutWrapper>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/location-select" element={<LocationSelect />} />
            <Route path="/listcar" element={<ListCarPage />} />
            <Route path="/booking-4seater" element={<Booking4Seater />} />
            <Route path="/booking-7seater" element={<Booking7Seater />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/staff" element={<StaffPage />} >
              {/* Các route con của StaffPage sẽ được định nghĩa ở đây */}
              <Route index element={<Navigate to="/staff/giaotraxe" replace={true} />} />
              <Route path="/staff/giaotraxe" element={<GiaoTraXe />} />
              <Route path="/staff/xacthuc" element={<XacThucKhachHangPage />} />
              <Route path="/staff/thanhtoan" element={<ThanhToanPage />} />
              <Route path="/staff/quanlyxe" element={<QuanLyXePage />} />
            
            </Route>
            <Route path="/verify-otp" element={<VerifyOtpPage />} />


          </Routes>
        </LayoutWrapper>
      </AuthProvider>
    </Router>
  );
}

export default App;
