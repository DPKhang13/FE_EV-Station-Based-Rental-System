import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import CarShowcase from './components/CarShowcase';
import Offers from './components/Offers';
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
import StationManagement from './components/admin/StationManagement.jsx';
import CustomerManagement from './components/admin/CustomerManagement.jsx';
import ConfirmBookingPage from './pages/ConfirmBookingPage.jsx';
import MyBookingsPage from './pages/MyBookingsPage.jsx';
import PaymentPage from './pages/PaymentPage.jsx';
import PaymentCallbackPage from './pages/PaymentCallbackPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import PaymentSuccessPage from './pages/PaymentSuccess.jsx';
import PaymentFailedPage from './pages/PaymentFailedPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import FeedbackPage from './pages/FeedbackPage.jsx';
import BangGiaPage from './pages/BangGiaPage.jsx';
import AdminBangGiaPage from './components/admin/AdminBangGiaPage.jsx';
import DichVuPage from './pages/DichVuPage.jsx';
import OrderDetailPage from './pages/OrderDetailPage.jsx'; 
import  ForgotPage from './pages/ForgotPage.jsx'
import OrderDetailCusPage from './pages/OrderDetailCusPage.jsx';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage.jsx';
import QuanLiXeTaiTram from './pages/QuanLiXeTaiTram.jsx';
import TrangHienThiXeTheoTram from './pages/TrangHienThiXeTheoTram.jsx';
import ChiTietKhachHang from './pages/ChiTietKhachHang.jsx';
import LichSuThue from './pages/LichSuThue.jsx';
import ChiTietDonTrongAdmin from './pages/ChiTietDonTrongAdmin.jsx';
import VehicleHistoryPage from './pages/VehicleHistoryPage.jsx';
import AdminQuanLyDonHangPage from './components/admin/AdminQuanLyDonHangPage.jsx';
import IncidentReportPage from './components/admin/IncidentReportPage.jsx';

const HomePage = () => (
  <ScrollToSectionWrapper>
    <CarShowcase />
    <Offers />
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
    location.pathname.startsWith('/payment-failed')||    // ✅ Thêm
    location.pathname ==='/forgot-password';

  return (
    <>
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

            {/* 🔒 Protected Booking Routes - Require login */}
            <Route path="/booking-4seater" element={
              <ProtectedRoute>
                <Booking4Seater />
              </ProtectedRoute>
            } />
            
             <Route path="/order-detail-cus/:orderId" element={
              <ProtectedRoute>
                <OrderDetailCusPage />
              </ProtectedRoute>
            } />
            
            <Route path="/booking-7seater" element={
              <ProtectedRoute>
                <Booking7Seater />
              </ProtectedRoute>
            } />
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

            {/* ✅ Payment routes */}
            <Route path="/payment-callback" element={<PaymentCallbackPage />} />
            <Route path="/payment-success" element={<PaymentSuccessPage />} />
            <Route path="/payment-failed" element={<PaymentFailedPage />} />

            {/* ✅ Feedback route */}
            <Route path="/feedback" element={
              <ProtectedRoute>
                <FeedbackPage />
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-otp" element={<VerifyOtpPage />} />
            <Route path="/forgot-password" element={<ForgotPage/>}/>

            {/* Staff Routes */}
            <Route path="/staff" element={<StaffPage />}>
              <Route index element={<Navigate to="/staff/giaotraxe" replace={true} />} />
              <Route path="giaotraxe" element={<GiaoTraXe />} />
              <Route path="xacthuc" element={<XacThucKhachHangPage />} />
              <Route path="thanhtoan" element={<ThanhToanPage />} />
              <Route path="quanlyxe" element={<QuanLyXePage />} />
              <Route path="banggia" element={<BangGiaPage />} />
            
            <Route path="/staff/chitiet/:orderId/:userId" element={<OrderDetailPage />} />


            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminPage />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashBoardPage />} />
              <Route path="employees" element={<EmployeesPage />} />
             
              <Route path="quanlyxetaitram" element={<QuanLiXeTaiTram />} />
              <Route path="locations" element={<StationManagement />} />
              <Route path="customers" element={<CustomerManagement />} />
             
              <Route path="hienthiXe/:station" element={<TrangHienThiXeTheoTram/>}/>
              <Route path="chitiet/:id" element={<ChiTietKhachHang/>}/>
              <Route path="lichsu-thue/:userId" element={<LichSuThue/>}/>
              <Route path="order-detail/:orderId" element={<ChiTietDonTrongAdmin/>}/>
              <Route path="banggia" element={<AdminBangGiaPage/>}/>
              <Route path="vehicle-history/:vehicleId" element={<VehicleHistoryPage/>}/>
              <Route path="incident-reports" element={<IncidentReportPage/>}/>
              <Route path="quanlydonhang" element={<AdminQuanLyDonHangPage/>}/>
            </Route>
          </Routes >
        </LayoutWrapper >
      </AuthProvider >
    </Router >
  );
}

export default App;
