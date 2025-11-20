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
              <div className="car-info">
                <h3>{car.vehicleName}</h3>
                <p>Hãng: {car.brand}</p>
                <p>Màu: {car.color}</p>
                <p>Biển số: {car.plateNumber}</p>
                <p>Số chỗ: {car.seatCount}</p>
              </div>
            </div>
          </div>

          <div className="confirm-section booking-details">
            <h2>Chi Tiết Đặt Xe</h2>

            <p><strong>Nhận xe:</strong> {bookingData.startTime}</p>
            <p><strong>Trả xe:</strong> {bookingData.endTime}</p>

            {bookingData.orderData.couponCode && (
              <p><strong>Mã giảm giá:</strong> {bookingData.orderData.couponCode}</p>
            )}
          </div>

          <div className="confirm-actions">
            <button className="btn-back" onClick={() => navigate(-1)} disabled={loading}>
              Quay lại
            </button>

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
