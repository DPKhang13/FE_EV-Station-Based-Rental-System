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
import RegisterPage from './pages/RegisterPage.jsx';
import GiaoTraXe from './pages/GiaoTraXe.jsx';
import XacThucKhachHangPage from './pages/XacThucKhachHangPage.jsx';
import ThanhToanPage from './pages/ThanhToanPage.jsx';
import QuanLyXePage from './pages/QuanLyXePage.jsx';
import VerifyOtpPage from './pages/VerifyOtpPage.jsx';
import AdminDashBoardPage from './pages/AdminDashBoardPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import EmployeesPage from './pages/EmployeesPage.jsx';
import VehicleManagement from './components/admin/VehicleManagement.jsx';
import StationManagement from './components/admin/StationManagement.jsx';
import ConfirmBookingPage from './pages/ConfirmBookingPage.jsx';
import MyBookingsPage from './pages/MyBookingsPage.jsx';
import PaymentPage from './pages/PaymentPage.jsx';
import PaymentCallbackPage from './pages/PaymentCallbackPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import PaymentSuccessPage from './pages/PaymentSuccess.jsx';
import PaymentFailedPage from './pages/PaymentFailedPage.jsx';

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

  // ✅ Thêm các payment routes vào danh sách ẩn layout
  const hideLayout =
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/verify-otp' ||
    location.pathname.startsWith('/staff') ||
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/payment-callback') || // ✅ Thêm
    location.pathname.startsWith('/payment-success') ||  // ✅ Thêm
    location.pathname.startsWith('/payment-failed');     // ✅ Thêm

  return (
    <>
      {!hideLayout && <Header />}
      {!hideLayout && <Navbar />}
      {children}
      {!hideLayout && <Footer />}
    </>
  );
}

// ...existing code...

function App() {
  return (
    <Router>
      <AuthProvider>
        <LayoutWrapper>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/location-select" element={<LocationSelect />} />
            <Route path="/listcar" element={<ListCarPage />} />
            <Route path="/booking-4seater" element={<Booking4Seater />} />
            <Route path="/booking-7seater" element={<Booking7Seater />} />
            <Route path="/confirm-booking" element={<ConfirmBookingPage />} />
            <Route path="/my-bookings" element={<MyBookingsPage />} />
            <Route path="/payment/:orderId" element={<PaymentPage />} />

            {/* ✅ Payment routes */}
            <Route path="/payment-callback" element={<PaymentCallbackPage />} />
            <Route path="/payment-success" element={<PaymentSuccessPage />} />
            <Route path="/payment-failed" element={<PaymentFailedPage />} />

            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-otp" element={<VerifyOtpPage />} />

            {/* Staff Routes */}
            <Route path="/staff" element={<StaffPage />}>
              <Route index element={<Navigate to="/staff/giaotraxe" replace={true} />} />
              <Route path="giaotraxe" element={<GiaoTraXe />} />
              <Route path="xacthuc" element={<XacThucKhachHangPage />} />
              <Route path="thanhtoan" element={<ThanhToanPage />} />
              <Route path="quanlyxe" element={<QuanLyXePage />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminPage />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashBoardPage />} />
              <Route path="employees" element={<EmployeesPage />} />
              <Route path="vehicles" element={<VehicleManagement />} />
              <Route path="locations" element={<StationManagement />} />
            </Route>
          </Routes >
        </LayoutWrapper >
      </AuthProvider >
    </Router >
  );
}

export default App;