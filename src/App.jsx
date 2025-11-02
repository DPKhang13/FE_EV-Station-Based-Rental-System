import React, { useEffect } from 'react';
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
import { setAuthToken } from './services/api';

// ✅ Restore cookie from localStorage on app initialization
const initializeAuth = () => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    setAuthToken(token);
    console.log('✅ Cookie restored from localStorage on app load');
  }
};

// Run auth initialization immediately
initializeAuth();

import RegisterPage from './pages/RegisterPage.jsx';
import GiaoTraXe from './pages/GiaoTraXe.jsx';
import XacThucKhachHangPage from './pages/XacThucKhachHangPage.jsx';
import ThanhToanPage from './pages/ThanhToanPage.jsx';
import QuanLyXePage from './pages/QuanLyXePage.jsx';
import VerifyOtpPage from './pages/VerifyOtpPage.jsx';
import ConfirmBookingPage from './pages/ConfirmBookingPage.jsx';
import MyBookingsPage from './pages/MyBookingsPage.jsx';
import PaymentPage from './pages/PaymentPage.jsx';
import PaymentCallbackPage from './pages/PaymentCallbackPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
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
  const hideLayout = (location.pathname === '/login') || (location.pathname === '/register') || (location.pathname.startsWith('/staff') || (location.pathname.startsWith('/verify-otp'))); // 🔹 Kiểm tra nếu đang ở /login

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
        <LayoutWrapper>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/location-select" element={
              <ProtectedRoute>
                <LocationSelect />
              </ProtectedRoute>
            } />
            <Route path="/listcar" element={
              <ProtectedRoute>
                <ListCarPage />
              </ProtectedRoute>
            } />
            <Route path="/booking-4seater" element={
              <ProtectedRoute>
                <Booking4Seater />
              </ProtectedRoute>
            } />
            <Route path="/booking-7seater" element={
              <ProtectedRoute>
                <Booking7Seater />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/confirm-booking" element={
              <ProtectedRoute>
                <ConfirmBookingPage />
              </ProtectedRoute>
            } />
            <Route path="/my-bookings" element={
              <ProtectedRoute>
                <MyBookingsPage />
              </ProtectedRoute>
            } />
            <Route path="/payment/:orderId" element={
              <ProtectedRoute>
                <PaymentPage />
              </ProtectedRoute>
            } />
            <Route path="/payment-callback" element={<PaymentCallbackPage />} />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/about" element={<AboutPage />} />
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
