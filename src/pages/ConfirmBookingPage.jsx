import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { orderService } from '../services';
import { validateVehicleForBooking } from '../utils/vehicleValidator';
import './ConfirmBookingPage.css';

import car4SeatBlack from '../assets/4seatblack.png';
import car4SeatBlue from '../assets/4seatblue.png';
import car4SeatRed from '../assets/4seatred.png';
import car4SeatSilver from '../assets/4seatsilver.png';
import car4SeatWhite from '../assets/4seatwhite.png';

const ConfirmBookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const bookingData = location.state?.bookingData;

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (!bookingData) {
      alert("Không tìm thấy dữ liệu đặt xe!");
      navigate("/");
    }
  }, [bookingData, navigate]);

  // -----------------------
  // FIX QUAN TRỌNG NHẤT!
  // Format datetime chuẩn backend: yyyy-MM-dd HH:mm:ss
  // -----------------------
  const formatDateTimeForBackend = (dateStr) => {
    if (!dateStr) return null;

    const d = new Date(dateStr);
    const yyyy = d.getFullYear();
    const MM = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");

    return `${yyyy}-${MM}-${dd} ${hh}:${mm}:00`;   // <--- CHUẨN BACKEND
  };

  // -----------------------
  // Handle booking
  // -----------------------
  const handleConfirmBooking = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const car = bookingData.car;

      // Lấy vehicleId CHUẨN từ backend
      const vehicleId = Number(
        bookingData.orderData.vehicleId ??
        bookingData.car?.vehicleId
      );

      if (!vehicleId || isNaN(vehicleId)) {
        throw new Error("vehicleId bị lỗi!");
      }

      const startTime = formatDateTimeForBackend(bookingData.startTime);
      const endTime = formatDateTimeForBackend(bookingData.endTime);

      if (!startTime || !endTime)
        throw new Error("Thời gian gửi backend bị lỗi!");

      // Validate vehicle
      const validation = validateVehicleForBooking(car);
      if (!validation.valid) {
        alert(validation.errors.join("\n"));
        return;
      }

      // Payload SẠCH – ĐÚNG – KHÔNG THỪA
      const payload = {
        vehicleId,
        startTime,
        endTime,
        holiday: false,
      };

      if (bookingData.orderData.couponCode?.trim()) {
        payload.couponCode = bookingData.orderData.couponCode.trim();
      }

      console.log("🚀 Payload gửi backend:", payload);

      const res = await orderService.create(payload);

      alert("🎉 Đặt xe thành công!");
      navigate("/my-bookings");
    } catch (error) {
      console.error("❌ Lỗi booking:", error);

      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!bookingData) return null;

  const car = bookingData.car;

  const getCarImageByColor = (color) => {
    if (!color) return car4SeatSilver;
    const c = color.toLowerCase();
    if (c.includes("đen") || c.includes("black")) return car4SeatBlack;
    if (c.includes("xanh") || c.includes("blue")) return car4SeatBlue;
    if (c.includes("đỏ") || c.includes("red")) return car4SeatRed;
    if (c.includes("trắng") || c.includes("white")) return car4SeatWhite;
    return car4SeatSilver;
  };

  return (
    <div className="confirm-booking-page">
      <div className="confirm-container">
        <h1 className="confirm-title">Xác Nhận Đặt Xe</h1>
        <p className="confirm-subtitle">Kiểm tra thông tin trước khi xác nhận</p>

        <div className="confirm-content">
          <div className="confirm-section car-details">
            <h2>Thông Tin Xe</h2>
            <div className="car-info-grid">
              <img
                src={getCarImageByColor(car.color)}
                alt="Xe"
                className="car-image"
              />
              
              {/* Khung thông tin xe đẹp giống Booking4Seater */}
              <div className="vehicle-info-box">
                <h3 className="vehicle-info-title">
                  {car.vehicle_name || car.vehicleName}
                </h3>
                
                <div className="vehicle-info-grid">
                  {/* Hàng 1 */}
                  <div className="vehicle-info-item">
                    <svg className="vehicle-info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1" />
                      <path d="M12 15l-3-3H7a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2l-3 3z" />
                    </svg>
                    <span className="vehicle-info-text">
                      {car.plateNumber || car.plate_number || 'N/A'}
                    </span>
                  </div>
                  
                  <div className="vehicle-info-item">
                    <svg className="vehicle-info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <span className="vehicle-info-text">
                      {car.seatCount || car.seat_count || 4} chỗ
                    </span>
                  </div>
                  
                  <div className="vehicle-info-item">
                    <svg className="vehicle-info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 17h14l-1-7H6l-1 7z" />
                      <path d="M7 17v-5" />
                      <path d="M17 17v-5" />
                      <path d="M5 10h14" />
                      <path d="M9 10V7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v3" />
                    </svg>
                    <span className="vehicle-info-text">
                      {car.carmodel || car.carModel || 'N/A'}
                    </span>
                  </div>
                  
                  {/* Hàng 2 */}
                  <div className="vehicle-info-item">
                    <svg className="vehicle-info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="1" y="6" width="18" height="12" rx="2" ry="2" />
                      <line x1="23" y1="10" x2="23" y2="14" />
                    </svg>
                    <span className="vehicle-info-text">
                      {car.batteryStatus || car.battery_status || 'N/A'}
                    </span>
                  </div>
                  
                  <div className="vehicle-info-item">
                    <svg className="vehicle-info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                    <span className="vehicle-info-text">
                      {car.variant || car.grade || 'N/A'}
                    </span>
                  </div>
                  
                  <div className="vehicle-info-item">
                    <svg className="vehicle-info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                    </svg>
                    <span className="vehicle-info-text">
                      {car.color || 'N/A'}
                      {car.color && car.color !== 'N/A' && (
                        <span 
                          className="vehicle-color-swatch"
                          style={{ 
                            backgroundColor: car.color === 'Red' || car.color === 'Đỏ' ? '#FF0000' :
                                           car.color === 'Blue' || car.color === 'Xanh dương' ? '#0000FF' :
                                           car.color === 'White' || car.color === 'Trắng' ? '#FFFFFF' :
                                           car.color === 'Black' || car.color === 'Đen' ? '#000000' :
                                           car.color === 'Silver' || car.color === 'Bạc' ? '#C0C0C0' : '#CCCCCC',
                            border: (car.color === 'White' || car.color === 'Trắng') ? '1px solid #E5E5E5' : 'none'
                          }}
                        ></span>
                      )}
                    </span>
                  </div>
                  
                  {/* Thông tin trạm */}
                  <div className="vehicle-info-item vehicle-info-item-full">
                    <svg className="vehicle-info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className="vehicle-info-text">
                      Trạm: {car.stationName || car.station_name || car.rentalStationName || car.rental_station_name || car.station?.name || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="confirm-section booking-details">
            <h2>Thông Tin Đặt Xe</h2>

            <div className="booking-info-box">
              <div className="booking-info-grid">
                {/* Tên khách hàng */}
                <div className="booking-info-item">
                  <svg className="booking-info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <div className="booking-info-content">
                    <span className="booking-info-label">Tên khách hàng</span>
                    <span className="booking-info-value">
                      {bookingData.customerName || 
                       user?.fullname || 
                       user?.fullName || 
                       user?.username || 
                       user?.name || 
                       'N/A'}
                    </span>
                  </div>
                </div>

                {/* Số điện thoại */}
                <div className="booking-info-item">
                  <svg className="booking-info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <div className="booking-info-content">
                    <span className="booking-info-label">Số điện thoại</span>
                    <span className="booking-info-value">
                      {bookingData.customerPhone || 
                       user?.phonenumber || 
                       user?.phoneNumber || 
                       user?.phone || 
                       'N/A'}
                    </span>
                  </div>
                </div>

                {/* Email */}
                <div className="booking-info-item">
                  <svg className="booking-info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <div className="booking-info-content">
                    <span className="booking-info-label">Email</span>
                    <span className="booking-info-value">
                      {user?.email || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Ngày đặt */}
                <div className="booking-info-item">
                  <svg className="booking-info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <div className="booking-info-content">
                    <span className="booking-info-label">Ngày đặt</span>
                    <span className="booking-info-value">
                      {new Date().toLocaleDateString('vi-VN', { 
                        year: 'numeric', 
                        month: '2-digit', 
                        day: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>

                {/* Ngày nhận xe */}
                <div className="booking-info-item">
                  <svg className="booking-info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <div className="booking-info-content">
                    <span className="booking-info-label">Ngày nhận xe</span>
                    <span className="booking-info-value">
                      {bookingData.startTime 
                        ? (() => {
                            const date = new Date(bookingData.startTime);
                            const day = String(date.getDate()).padStart(2, '0');
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const year = date.getFullYear();
                            const hours = String(date.getHours()).padStart(2, '0');
                            const minutes = String(date.getMinutes()).padStart(2, '0');
                            return `${day}/${month}/${year} ${hours}:${minutes}`;
                          })()
                        : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Ngày trả xe */}
                <div className="booking-info-item">
                  <svg className="booking-info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <div className="booking-info-content">
                    <span className="booking-info-label">Ngày trả xe</span>
                    <span className="booking-info-value">
                      {bookingData.endTime 
                        ? (() => {
                            const date = new Date(bookingData.endTime);
                            const day = String(date.getDate()).padStart(2, '0');
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const year = date.getFullYear();
                            const hours = String(date.getHours()).padStart(2, '0');
                            const minutes = String(date.getMinutes()).padStart(2, '0');
                            return `${day}/${month}/${year} ${hours}:${minutes}`;
                          })()
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mã giảm giá nếu có */}
              {bookingData.orderData?.couponCode && (
                <div className="booking-coupon-section">
                  <svg className="booking-info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12c0 1.66-1.34 3-3 3h-4v-2h4c.55 0 1-.45 1-1s-.45-1-1-1h-4V8h4c1.66 0 3 1.34 3 3z" />
                    <path d="M3 12c0-1.66 1.34-3 3-3h4v2H6c-.55 0-1 .45-1 1s.45 1 1 1h4v2H6c-1.66 0-3-1.34-3-3z" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                  </svg>
                  <div className="booking-info-content">
                    <span className="booking-info-label">Mã giảm giá</span>
                    <span className="booking-info-value booking-coupon-code">
                      {bookingData.orderData.couponCode}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="confirm-actions">
            <button className="btn-confirm" onClick={handleConfirmBooking} disabled={loading}>
              {loading ? "Đang xử lý..." : "Xác nhận đặt xe"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmBookingPage;
