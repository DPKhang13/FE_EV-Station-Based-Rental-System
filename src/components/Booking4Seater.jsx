import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useVehicles } from '../hooks/useVehicles';
import { AuthContext } from '../context/AuthContext';
import { validateVehicleForBooking } from '../utils/vehicleValidator';
import { orderService } from '../services';
import './Booking4Seater.css';
import car4SeatBlack from '../assets/4seatblack.png';
import car4SeatBlue from '../assets/4seatblue.png';
import car4SeatRed from '../assets/4seatred.png';
import car4SeatSilver from '../assets/4seatsilver.png';
import car4SeatWhite from '../assets/4seatwhite.png';

const Booking4Seater = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { vehicles: cars, loading } = useVehicles();
  const preSelectedCar = location.state?.car;
  const gradeFilter = location.state?.gradeFilter;

  const getCarImageByColor = (color) => {
    if (!color) return car4SeatSilver;
    const c = color.toLowerCase();
    if (c.includes('black') || c.includes('đen')) return car4SeatBlack;
    if (c.includes('blue') || c.includes('xanh')) return car4SeatBlue;
    if (c.includes('red') || c.includes('đỏ')) return car4SeatRed;
    if (c.includes('silver') || c.includes('bạc')) return car4SeatSilver;
    if (c.includes('white') || c.includes('trắng')) return car4SeatWhite;
    return car4SeatSilver;
  };

  const [selectedCarId, setSelectedCarId] = useState(preSelectedCar?.id || '');
  const [selectedCar, setSelectedCar] = useState(preSelectedCar || null);
  const [selectedColor, setSelectedColor] = useState('');
  const [hasActiveRental, setHasActiveRental] = useState(false);
  const [checkingRental, setCheckingRental] = useState(true);
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    couponCode: '',
  });

  // ✅ Format thời gian đúng "yyyy-MM-dd HH:mm:ss"
  const formatDateTimeForBackend = (dateStr, isStart = true) => {
    if (!dateStr) return null;
    if (dateStr.includes('T')) {
      const [date, time] = dateStr.split('T');
      const formatted = time.length === 5 ? `${time}:00` : time;
      return `${date} ${formatted}`;
    }
    if (dateStr.length === 10)
      return isStart ? `${dateStr} 00:00:00` : `${dateStr} 23:59:59`;
    return dateStr;
  };

  const availableCars = cars.filter((car) => {
    const isFourSeater = car.type === '4-seater';
    const isAvailable = car.status === 'Available';
    const matchesGrade = gradeFilter ? car.grade === gradeFilter : true;
    const matchesColor = selectedColor ? car.color === selectedColor : true;
    return isFourSeater && isAvailable && matchesGrade && matchesColor;
  });

  const availableColors = [
    ...new Set(
      cars
        .filter(
          (car) =>
            car.type === '4-seater' &&
            car.status === 'Available' &&
            car.color &&
            car.color !== 'N/A' &&
            car.color !== 'null' &&
            (!gradeFilter || car.grade === gradeFilter)
        )
        .map((car) => car.color)
    ),
  ].sort();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    const checkActiveRental = async () => {
      try {
        setCheckingRental(true);
        const orders = await orderService.getMyOrders();
        if (!Array.isArray(orders)) {
          setCheckingRental(false);
          return;
        }
        for (const order of orders) {
          try {
            const preview = await orderService.getReturnPreview(order.orderId);
            if (preview.status === 'RENTAL') {
              setHasActiveRental(true);
              break;
            }
          } catch {
            if (order.status === 'RENTAL') {
              setHasActiveRental(true);
              break;
            }
          }
        }
      } finally {
        setCheckingRental(false);
      }
    };
    if (user) checkActiveRental();
    else setCheckingRental(false);
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCarSelect = (e) => {
    const carId = e.target.value;
    setSelectedCarId(carId);
    setSelectedCar(carId ? availableCars.find((c) => c.id === parseInt(carId)) : null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedCar) {
      alert('Vui lòng chọn xe trước khi xác nhận đặt xe.');
      return;
    }

    if (!formData.startTime) {
      alert('Vui lòng chọn ngày & giờ nhận xe.');
      return;
    }

    if (!formData.endTime) {
      alert('Vui lòng chọn ngày & giờ trả xe.');
      return;
    }

    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);
    const now = new Date();
    if (start < now) {
      alert('Thời gian nhận xe phải là thời điểm trong tương lai!');
      return;
    }
    if (end <= start) {
      alert('Thời gian trả xe phải sau thời gian nhận xe!');
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('Vui lòng đăng nhập để tiếp tục.');
      navigate('/login');
      return;
    }

    const validation = validateVehicleForBooking(selectedCar);
    if (!validation.valid) {
      alert(`Xe không đủ thông tin để đặt:\n${validation.errors.join('\n')}`);
      return;
    }

    const startTimeFormatted = formatDateTimeForBackend(formData.startTime, true);
    const endTimeFormatted = formatDateTimeForBackend(formData.endTime, false);

    const bookingData = {
      car: selectedCar,
      orderData: {
        vehicleId: selectedCar.id,
        startTime: startTimeFormatted,
        endTime: endTimeFormatted,
        couponCode: formData.couponCode || null,
        holiday: false,
      },
      startTime: startTimeFormatted,
      endTime: endTimeFormatted,
      customerName:
        user?.fullname || user?.fullName || user?.username || user?.name || 'N/A',
      customerPhone: user?.phonenumber || user?.phoneNumber || user?.phone || 'N/A',
    };

    navigate('/confirm-booking', { state: { bookingData } });
  };

  if (loading) return <div className="booking-container">Đang tải dữ liệu xe...</div>;
  if (checkingRental)
    return (
      <div className="booking-container">
        <p>Đang kiểm tra trạng thái thuê xe...</p>
      </div>
    );
  if (hasActiveRental)
    return (
      <div className="booking-container">
        <p>Bạn đang có đơn thuê xe đang hoạt động. Hãy hoàn thành trước khi đặt xe mới.</p>
        <button onClick={() => navigate('/my-bookings')}>Xem đơn đặt xe</button>
      </div>
    );

  return (
    <div className="booking-container">
      <h1 className="booking-title">Đặt Xe 4 Chỗ</h1>
      <div className="booking-content">
        <div className="booking-form-section">
          <form onSubmit={handleSubmit} className="booking-form">
            {!preSelectedCar && availableColors.length > 0 && (
              <div className="form-group">
                <label>Chọn Màu</label>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {availableColors.map((color) => (
                    <div
                      key={color}
                      onClick={() => {
                        setSelectedColor(color);
                        setSelectedCarId('');
                        setSelectedCar(null);
                      }}
                      style={{
                        width: 50,
                        height: 50,
                        backgroundColor: color.toLowerCase(),
                        border:
                          selectedColor === color ? '3px solid #667eea' : '1px solid #ccc',
                        borderRadius: 8,
                        cursor: 'pointer',
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="carSelect">Chọn Xe *</label>
              <select
                id="carSelect"
                value={selectedCarId}
                onChange={handleCarSelect}
                required
              >
                <option value="">Chọn một xe</option>
                {availableCars.map((car) => (
                  <option key={car.id} value={car.id}>
                    {car.vehicle_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="startTime">Ngày & Giờ Nhận Xe *</label>
              <input
                type="datetime-local"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                min={new Date().toISOString().slice(0, 16)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endTime">Ngày & Giờ Trả Xe *</label>
              <input
                type="datetime-local"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="couponCode">Mã Giảm Giá (Không bắt buộc)</label>
              <input
                type="text"
                id="couponCode"
                name="couponCode"
                value={formData.couponCode}
                onChange={handleChange}
                placeholder="Nhập mã giảm giá nếu có"
              />
            </div>

            <button type="submit" className="submit-button">
              XÁC NHẬN ĐẶT XE
            </button>
          </form>
        </div>

        <div className="booking-car-display">
          <h2>Xe Đã Chọn</h2>
          {!selectedCar ? (
            <p>Vui lòng chọn xe từ danh sách để xem chi tiết.</p>
          ) : (
            <>
              <img
                src={getCarImageByColor(selectedCar.color)}
                alt={selectedCar.vehicle_name}
                className="car-display-image"
              />
              <div className="car-display-details">
                <h3>{selectedCar.vehicle_name}</h3>
                <p>Hãng: {selectedCar.brand}</p>
                <p>Màu: {selectedCar.color}</p>
                <p>Số chỗ: {selectedCar.seat_count}</p>
                <p>Biển số: {selectedCar.plate_number}</p>
                <p>Pin: {selectedCar.battery_status}</p>
                <p>Quãng đường: {selectedCar.range_km} km</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Booking4Seater;
