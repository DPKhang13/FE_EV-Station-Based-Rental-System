import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { orderService } from '../services';
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

  // --- Chọn ảnh xe theo màu ---
  const getCarImageByColor = (color, seatCount) => {
    if (!color || seatCount !== 4) return null;
    const c = color.toLowerCase();
    if (c.includes('black') || c.includes('đen')) return car4SeatBlack;
    if (c.includes('blue') || c.includes('xanh')) return car4SeatBlue;
    if (c.includes('red') || c.includes('đỏ')) return car4SeatRed;
    if (c.includes('silver') || c.includes('bạc')) return car4SeatSilver;
    if (c.includes('white') || c.includes('trắng')) return car4SeatWhite;
    return null;
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (!bookingData) {
      alert('Không tìm thấy dữ liệu đặt xe. Đang chuyển hướng...');
      navigate('/');
    }
  }, [bookingData, navigate]);

  // --- Chuẩn hóa format thời gian ---
 // --- Giữ đúng định dạng "yyyy-MM-dd HH:mm:ss"
const formatDateTimeForBackend = (dateStr, isStart = true) => {
  if (!dateStr) return null;

  // nếu là ISO string từ DatePicker hoặc toISOString()
  const date = new Date(dateStr);

  // đảm bảo lấy đúng local time, không bị +7 hoặc -7
  const yyyy = date.getFullYear();
  const MM = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const HH = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const ss = "00";

  return `${yyyy}-${MM}-${dd} ${HH}:${mm}:${ss}`;
};

  const handleConfirmBooking = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      // ✅ Lấy vehicleId chuẩn từ dữ liệu (dù backend trả id hay vehicleId)
      const vehicleId = Number(
        bookingData.orderData.vehicleId ??
        bookingData.car?.vehicleId ??
        bookingData.car?.id ??
        bookingData.car?.vehicle_id
      );

      const startDateRaw = bookingData.startTime || bookingData.orderData.startTime;
      const endDateRaw = bookingData.endTime || bookingData.orderData.endTime;

      const startTimeFormatted = formatDateTimeForBackend(startDateRaw, true);
      const endTimeFormatted = formatDateTimeForBackend(endDateRaw, false);

      if (!vehicleId || isNaN(vehicleId)) throw new Error('Mã xe không hợp lệ');
      if (!startTimeFormatted) throw new Error('Ngày nhận xe không được để trống');
      if (!endTimeFormatted) throw new Error('Ngày trả xe không được để trống');

      // --- Payload gửi backend ---
      const cleanedOrderData = {
        vehicleId,
        startTime: startTimeFormatted,
        endTime: endTimeFormatted,
        holiday: false,
      };

      if (bookingData.orderData.couponCode?.trim()) {
        cleanedOrderData.couponCode = bookingData.orderData.couponCode.trim();
      }

      console.log('📦 Payload gửi backend:', cleanedOrderData);

      const response = await orderService.create(cleanedOrderData);

      alert(
        `🎉 Đặt xe thành công!\n\n` +
          `Mã đơn hàng: ${response.orderId || 'N/A'}\n` +
          `Mã xe: ${response.vehicleId || vehicleId}\n` +
          `Trạng thái: ${response.status || 'CHỜ XỬ LÝ'}\n` +
          `Tổng giá: ${
            response.totalPrice
              ? response.totalPrice.toLocaleString() + ' VND'
              : 'Đang tính toán'
          }\n\n` +
          `Bạn có thể xem và quản lý đơn đặt xe trong trang "Đơn Đặt Xe".`
      );

      navigate('/my-bookings');
    } catch (error) {
      console.error('❌ Lỗi khi tạo đơn:', error);
      alert(error.message || 'Không thể tạo đơn đặt xe. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (!bookingData) {
    return (
      <div style={{ padding: '100px 20px', textAlign: 'center' }}>
        <p>Đang tải...</p>
      </div>
    );
  }

  const { car, orderData } = bookingData;

  return (
    <div className="confirm-booking-page">
      <div className="confirm-container">
        <h1 className="confirm-title">Xác Nhận Đặt Xe</h1>
        <p className="confirm-subtitle">Kiểm tra thông tin trước khi xác nhận</p>

        <div className="confirm-content">
          {/* Thông tin xe */}
          <div className="confirm-section car-details">
            <h2>Thông Tin Xe</h2>
            <div className="car-info-grid">
              <img
                src={getCarImageByColor(car.color, car.seat_count) || car.image}
                alt={car.vehicle_name}
                className="car-image"
              />
              <div className="car-info">
                <h3>{car.vehicle_name}</h3>
                <div className="info-row"><span className="label">Hãng:</span><span className="value">{car.brand}</span></div>
                <div className="info-row"><span className="label">Loại:</span><span className="value">{car.type}</span></div>
                {car.grade && <div className="info-row"><span className="label">Hạng:</span><span className="value">{car.grade}</span></div>}
                <div className="info-row"><span className="label">Màu:</span><span className="value">{car.color}</span></div>
                <div className="info-row"><span className="label">Biển số:</span><span className="value">{car.plate_number}</span></div>
                <div className="info-row"><span className="label">Số chỗ:</span><span className="value">{car.seat_count} chỗ</span></div>
                <div className="info-row"><span className="label">Pin:</span><span className="value">{car.battery_status} ({car.battery_capacity})</span></div>
                <div className="info-row"><span className="label">Quãng đường:</span><span className="value">{car.range_km} km</span></div>
              </div>
            </div>
          </div>

          {/* Chi tiết đặt xe */}
          <div className="confirm-section booking-details">
            <h2>Chi Tiết Đặt Xe</h2>
            <div className="details-grid">
              <div className="detail-item">
                <span className="label">Ngày & Giờ Nhận Xe:</span>
                <span className="value highlight">{bookingData.startTime || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="label">Ngày & Giờ Trả Xe:</span>
                <span className="value highlight">{bookingData.endTime || 'N/A'}</span>
              </div>
              {orderData.couponCode && (
                <div className="detail-item">
                  <span className="label">Mã Giảm Giá:</span>
                  <span className="value coupon">{orderData.couponCode}</span>
                </div>
              )}
            </div>
          </div>

          {/* Thông tin khách hàng */}
          <div className="confirm-section customer-info">
            <h2>Thông Tin Khách Hàng</h2>
            <div className="details-grid">
              <div className="detail-item">
                <span className="label">Tên Khách Hàng:</span>
                <span className="value">
                  {bookingData.customerName || user?.fullName || user?.username || 'N/A'}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Số Điện Thoại:</span>
                <span className="value">
                  {bookingData.customerPhone || user?.phoneNumber || user?.phone || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="confirm-actions">
            <button onClick={() => navigate(-1)} className="btn-back" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Quay Lại'}
            </button>
            <button onClick={handleConfirmBooking} className="btn-confirm" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Xác Nhận Đặt Xe'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmBookingPage;
