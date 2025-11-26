import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { orderService } from '../services';
import { pricingRuleService } from '../services/pricingRuleService';
import photoService from '../services/photoService';
import { validateVehicleForBooking } from '../utils/vehicleValidator';
import './ConfirmBookingPage.css';

// Assets
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
  const [pricingRules, setPricingRules] = useState([]);

  // ================================
  // Load bảng giá
  // ================================
  useEffect(() => {
    (async () => {
      try {
        const res = await pricingRuleService.getAll();
        setPricingRules(Array.isArray(res) ? res : res?.data || []);
      } catch (e) {
        console.error('❌ Lỗi tải pricing rules:', e);
      }
    })();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    if (!bookingData) {
      alert('Không tìm thấy dữ liệu đặt xe!');
      navigate('/');
    }
  }, [bookingData, navigate]);

  // ================================
  // Helper
  // ================================
  const getUserId = () => user?.id || user?.userId || user?.data?.id || null;

  const formatDateTimeForBackend = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:00`;
  };

  const normalizePhotoArray = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (raw.data && Array.isArray(raw.data)) return raw.data;
    if (typeof raw === 'object') return Object.values(raw).filter(v => v && typeof v === 'object');
    return [];
  };

  // ================================
  // Kiểm tra ảnh giấy tờ
  // ================================
  const checkUserPhotos = async (userId) => {
    try {
      const res = await photoService.getPhotos(userId);
      const photos = normalizePhotoArray(res).map(p => ({
        type: (p.type || '').toUpperCase(),
        url: p.photo_url || p.photoUrl || p.url || p.imageUrl || null,
      }));

      const hasCCCD = photos.some(p => ['CCCD', 'ID_CARD', 'IDCARD'].includes(p.type) && p.url);
      const hasGPLX = photos.some(p => ['GPLX', 'DRIVER_LICENSE', 'LICENSE'].includes(p.type) && p.url);

      console.log('📸 [Check Photos] Found:', { photos, hasCCCD, hasGPLX });
      return { hasCCCD, hasGPLX };
    } catch (err) {
      console.error('❌ [Check Photos] Error:', err);
      return { hasCCCD: false, hasGPLX: false };
    }
  };

  // ================================
  // Xử lý đặt xe
  // ================================
  const handleConfirmBooking = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const userId = getUserId();
      if (!userId) throw new Error('Không tìm thấy thông tin người dùng.');

      // ✅ Kiểm tra ảnh
      const { hasCCCD, hasGPLX } = await checkUserPhotos(userId);

      let finalHasCCCD = hasCCCD;
      let finalHasGPLX = hasGPLX;

      // fallback kiểm tra context
      if (!finalHasCCCD) {
        const cccd = user?.cccdImageUrl || user?.idCardUrl || user?.cccdUrl;
        if (cccd) finalHasCCCD = true;
      }
      if (!finalHasGPLX) {
        const gplx = user?.driverLicenseImageUrl || user?.driverLicenseUrl || user?.licenseUrl;
        if (gplx) finalHasGPLX = true;
      }

      if (!finalHasCCCD || !finalHasGPLX) {
        const missing = [];
        if (!finalHasCCCD) missing.push('CCCD/CMND');
        if (!finalHasGPLX) missing.push('Bằng lái xe');
        const msg = `Bạn chưa upload ${missing.join(' và ')}.\n\nVui lòng upload ảnh trong trang cá nhân trước khi đặt xe.\n\nBạn có muốn chuyển đến trang cá nhân để upload ảnh không?`;
        if (window.confirm(msg)) navigate('/profile');
        setLoading(false);
        return;
      }

      // ================================
      // Chuẩn bị dữ liệu
      // ================================
      const vehicleId = Number(bookingData.orderData?.vehicleId ?? bookingData.car?.vehicleId);
      if (!vehicleId) throw new Error('Không xác định được vehicleId.');

      const startTime = formatDateTimeForBackend(bookingData.startTime);
      const endTime = formatDateTimeForBackend(bookingData.endTime);
      if (!startTime || !endTime) throw new Error('Thời gian gửi backend không hợp lệ.');

      const validation = validateVehicleForBooking(bookingData.car);
      if (!validation.valid) {
        alert(validation.errors.join('\n'));
        return;
      }

      const payload = {
        vehicleId,
        startTime,
        endTime,
        holiday: false,
        ...(bookingData.orderData?.couponCode?.trim()
          ? { couponCode: bookingData.orderData.couponCode.trim() }
          : {}),
      };

      console.log('🚀 Gửi booking payload:', payload);
      await orderService.create(payload);

      alert('🎉 Đặt xe thành công!');
      navigate('/my-bookings');
    } catch (err) {
      alert(err.message || 'Đặt xe thất bại.');
      console.error('❌ Booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // Tính giá & hiển thị
  // ================================
  const car = bookingData?.car;
  const getCarImageByColor = (color) => {
    if (!color) return car4SeatSilver;
    const c = color.toLowerCase();
    if (c.includes('đen') || c.includes('black')) return car4SeatBlack;
    if (c.includes('xanh') || c.includes('blue')) return car4SeatBlue;
    if (c.includes('đỏ') || c.includes('red')) return car4SeatRed;
    if (c.includes('trắng') || c.includes('white')) return car4SeatWhite;
    return car4SeatSilver;
  };

  const isWeekend = (date) => [0, 6].includes(date.getDay());

  const calculateRentalPrice = (car, start, end) => {
    if (!car || !pricingRules.length) return { total: 0, days: 0, daily: 0 };
    let rule =
      pricingRules.find((r) => Number(r.pricingRuleId) === Number(car.pricingRuleId)) ||
      pricingRules.find((r) => (r.carmodel || '').toUpperCase() === (car.carmodel || car.carModel || '').toUpperCase());
    if (!rule) return { total: 0, days: 0, daily: 0 };

    const s = new Date(start);
    const e = new Date(end);
    let days = 0,
      total = 0;
    for (let d = new Date(s); d < e; d.setDate(d.getDate() + 1)) {
      days++;
      total += isWeekend(d) && rule.holidayPrice ? rule.holidayPrice : rule.dailyPrice;
    }
    return { total, days, daily: rule.dailyPrice, weekend: rule.holidayPrice };
  };

  const priceInfo = calculateRentalPrice(car, bookingData.startTime, bookingData.endTime);
  const coupon = bookingData.orderData?.couponCode?.trim();
  const discount = coupon === 'EV20' ? 20 : coupon === 'EV10' ? 10 : 0;
  const finalTotal = discount ? priceInfo.total * (1 - discount / 100) : priceInfo.total;

  // ================================
  // Render
  // ================================
  if (!bookingData) return null;

  const formatCurrency = (v) =>
    v.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });

  return (
    <div className="confirm-booking-page">
      <div className="confirm-container">
        <h1 className="confirm-title">Xác Nhận Đặt Xe</h1>
        <p className="confirm-subtitle">Kiểm tra thông tin trước khi xác nhận</p>

        <div className="confirm-content">
          {/* THÔNG TIN XE */}
          <div className="confirm-section">
            <h2>Thông Tin Xe</h2>
            <div className="car-info-grid">
              <img src={getCarImageByColor(car.color)} alt="Xe" className="car-image" />
              <div className="vehicle-info-box">
                <h3>{car.vehicle_name || car.vehicleName}</h3>
                <p>Biển số: {car.plateNumber || 'N/A'}</p>
                <p>Số chỗ: {car.seatCount || 4}</p>
                <p>Model: {car.carmodel || car.carModel}</p>
                <p>Màu: {car.color}</p>
                <p>Trạm: {car.stationName || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* THÔNG TIN KHÁCH */}
          <div className="confirm-section">
            <h2>Thông Tin Đặt Xe</h2>
            <p>Tên: {user?.fullName || user?.name}</p>
            <p>Điện thoại: {user?.phoneNumber || user?.phone}</p>
            <p>Email: {user?.email}</p>
            <p>Ngày nhận: {new Date(bookingData.startTime).toLocaleString('vi-VN')}</p>
            <p>Ngày trả: {new Date(bookingData.endTime).toLocaleString('vi-VN')}</p>
            {coupon && <p>Mã giảm giá: <b>{coupon}</b></p>}
            <p>
              Tổng tiền:{' '}
              <b style={{ color: '#059669' }}>
                {formatCurrency(finalTotal)}{' '}
                {discount > 0 && <span style={{ textDecoration: 'line-through', color: '#999' }}>{formatCurrency(priceInfo.total)}</span>}
              </b>
            </p>
          </div>

          {/* Nút hành động */}
          <div className="confirm-actions">
            <button className="btn-confirm" onClick={handleConfirmBooking} disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Xác nhận đặt xe'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmBookingPage;
