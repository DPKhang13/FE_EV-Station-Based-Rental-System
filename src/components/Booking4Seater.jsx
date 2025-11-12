import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useVehicles } from '../hooks/useVehicles';
import { AuthContext } from '../context/AuthContext';
import { validateVehicleForBooking } from '../utils/vehicleValidator';
import { orderService } from '../services';
import './Booking4Seater.css';

// Import ảnh xe theo brand và màu
// BMW 4-seater
import bmw4Black from '../assets/BMW4/đen.png';
import bmw4White from '../assets/BMW4/trắng.jpg';
import bmw4Silver from '../assets/BMW4/bạc.jpg';
import bmw4Blue from '../assets/BMW4/xanh.jpg';
import bmw4Red from '../assets/BMW4/đỏ.png';

// Tesla 4-seater
import tesla4Black from '../assets/Tes4/đen.jpg';
import tesla4White from '../assets/Tes4/trắng.jpg';
import tesla4Silver from '../assets/Tes4/bạc.jpg';
import tesla4Blue from '../assets/Tes4/xanh.jpg';
import tesla4Red from '../assets/Tes4/đỏ.jpg';

// VinFast 4-seater
import vinfast4Black from '../assets/Vin4/đen.png';
import vinfast4White from '../assets/Vin4/trắng.jpg';
import vinfast4Silver from '../assets/Vin4/bạc.png';
import vinfast4Blue from '../assets/Vin4/xanh.jpg';
import vinfast4Red from '../assets/Vin4/đỏ.png';

// Images
import car4SeatDefault from '../assets/4seatsilver.png';

const Booking4Seater = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { vehicles: cars, loading } = useVehicles();
  const preSelectedCar = location.state?.car;
  const gradeFilter = location.state?.gradeFilter;

  // Mapping ảnh xe theo brand và màu
  const getCarImageByBrandAndColor = (brand, color) => {
    if (!brand || !color) return car4SeatDefault;

    const brandLower = brand.toLowerCase();
    const colorLower = color.toLowerCase();

    // Object chứa mapping ảnh theo brand và color
    const carImages = {
      bmw: {
        black: bmw4Black,
        white: bmw4White,
        silver: bmw4Silver, 
        blue: bmw4Blue, 
        red: bmw4Red, 
      },
      tesla: {
        black: tesla4Black,
        white: tesla4White,
        silver: tesla4Silver,
        blue: tesla4Blue,
        red: tesla4Red, 
      },
      vinfast: {
        black: vinfast4Black,
        white: vinfast4White, 
        silver: vinfast4Silver, 
        blue: vinfast4Blue, 
        red: vinfast4Red, 
      },
    };

    // Normalize color name
    let normalizedColor = 'silver'; // default
    if (colorLower.includes('black') || colorLower.includes('đen')) normalizedColor = 'black';
    else if (colorLower.includes('white') || colorLower.includes('trắng')) normalizedColor = 'white';
    else if (colorLower.includes('silver') || colorLower.includes('bạc')) normalizedColor = 'silver';
    else if (colorLower.includes('blue') || colorLower.includes('xanh')) normalizedColor = 'blue';
    else if (colorLower.includes('red') || colorLower.includes('đỏ')) normalizedColor = 'red';

    // Return image based on brand and color
    if (carImages[brandLower] && carImages[brandLower][normalizedColor]) {
      return carImages[brandLower][normalizedColor];
    }

    return car4SeatDefault;
  };

  const [selectedCarId, setSelectedCarId] = useState(preSelectedCar?.id || '');
  const [selectedCar, setSelectedCar] = useState(preSelectedCar || null);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
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
    const matchesBrand = selectedBrand ? (car.brand === selectedBrand || car.vehicle_name?.includes(selectedBrand)) : true;
    return isFourSeater && isAvailable && matchesGrade && matchesColor && matchesBrand;
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

  // Auto-select car when both color and brand are selected
  useEffect(() => {
    if (selectedColor && selectedBrand && availableCars.length > 0) {
      const firstMatchingCar = availableCars[0];
      setSelectedCarId(firstMatchingCar.id);
      setSelectedCar(firstMatchingCar);
    } else if (!selectedColor || !selectedBrand) {
      setSelectedCarId('');
      setSelectedCar(null);
    }
  }, [selectedColor, selectedBrand, availableCars]);

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
            {!preSelectedCar && (
              <div className="form-group">
                <label htmlFor="brandSelect">Chọn Hãng Xe *</label>
                <select
                  id="brandSelect"
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  required
                >
                  <option value="">-- Chọn hãng xe --</option>
                  <option value="BMW">BMW</option>
                  <option value="Tesla">Tesla</option>
                  <option value="VinFast">VinFast</option>
                </select>
              </div>
            )}

            {!preSelectedCar && availableColors.length > 0 && (
              <div className="form-group">
                <label>Chọn Màu</label>
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  flexWrap: 'wrap',
                  marginTop: '8px'
                }}>
                  {availableColors.map((color) => {
                    const colorMap = {
                      'Black': '#000000',
                      'White': '#FFFFFF',
                      'Red': '#DC2626',
                      'Blue': '#2563EB',
                      'Silver': '#9CA3AF',
                      'Gray': '#6B7280',
                      'Yellow': '#EAB308'
                    };
                    const bgColor = colorMap[color] || '#6B7280';
                    const isSelected = selectedColor === color;

                    return (
                      <div
                        key={color}
                        onClick={() => {
                          // Toggle màu - click lại để bỏ chọn
                          if (selectedColor === color) {
                            setSelectedColor('');
                            setSelectedCarId('');
                            setSelectedCar(null);
                          } else {
                            setSelectedColor(color);
                          }
                        }}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.3s'
                        }}
                      >
                        <div style={{
                          width: '50px',
                          height: '50px',
                          backgroundColor: bgColor,
                          border: color === 'White' ? '2px solid #e5e7eb' : 'none',
                          borderRadius: '8px',
                          boxShadow: isSelected
                            ? '0 0 0 3px #667eea, 0 4px 12px rgba(102, 126, 234, 0.4)'
                            : '0 2px 4px rgba(0,0,0,0.1)',
                          transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                          transition: 'all 0.3s ease'
                        }}
                        />
                        <span style={{
                          fontSize: '13px',
                          fontWeight: isSelected ? 700 : 500,
                          color: isSelected ? '#667eea' : '#6b7280'
                        }}>{color}</span>
                      </div>
                    );
                  })}
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
                disabled={!selectedColor || !selectedBrand}
              >
                <option value="">
                  {!selectedColor || !selectedBrand 
                    ? 'Vui lòng chọn màu và hãng xe trước' 
                    : 'Chọn một xe'}
                </option>
                {availableCars.map((car) => {
                  // Chỉ hiển thị brand chính (BMW, Tesla, VinFast)
                  const brand = car.brand || car.vehicle_name?.split(' ')[0] || '';
                  return (
                    <option key={car.id} value={car.id}>
                      {brand} - {car.plate_number} ({car.color})
                    </option>
                  );
                })}
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
          <h2 className="car-display-title">Xe Đã Chọn</h2>

          {!selectedCar ? (
            <div className="no-car-selected">
              <p>Vui lòng chọn xe từ danh sách để xem chi tiết</p>
            </div>
          ) : (
            <>
              <img
                src={getCarImageByBrandAndColor(selectedCar.brand, selectedCar.color)}
                alt={selectedCar.vehicle_name}
                className="car-display-image"
              />

              <div className="car-display-details">
                <h3 className="car-name">
                  {selectedCar.brand || selectedCar.vehicle_name?.split(' ')[0] || selectedCar.vehicle_name}
                </h3>

                {selectedCar.variant && (
                  <div className="car-grade-badge">
                    Hạng: {selectedCar.variant}
                  </div>
                )}

                <div className="car-info-grid">
                  <div className="car-info-item">
                    <span className="info-label">Biển số:</span>
                    <span className="info-value">{selectedCar.plate_number}</span>
                  </div>

                  <div className="car-info-item">
                    <span className="info-label">Hãng:</span>
                    <span className="info-value">{selectedCar.brand}</span>
                  </div>

                  <div className="car-info-item">
                    <span className="info-label">Màu:</span>
                    <span className="info-value">{selectedCar.color}</span>
                  </div>

                  <div className="car-info-item">
                    <span className="info-label">Số chỗ:</span>
                    <span className="info-value">{selectedCar.seat_count || selectedCar.seatCount} chỗ</span>
                  </div>

                  <div className="car-info-item">
                    <span className="info-label">Năm SX:</span>
                    <span className="info-value">{selectedCar.year_of_manufacture}</span>
                  </div>

                  <div className="car-info-item">
                    <span className="info-label">Hộp số:</span>
                    <span className="info-value">{selectedCar.transmission}</span>
                  </div>

                  <div className="car-info-item">
                    <span className="info-label">Pin:</span>
                    <span className="info-value battery">{selectedCar.battery_status}</span>
                  </div>

                  <div className="car-info-item">
                    <span className="info-label">Dung lượng:</span>
                    <span className="info-value">{selectedCar.battery_capacity}</span>
                  </div>

                  <div className="car-info-item">
                    <span className="info-label">Quãng đường:</span>
                    <span className="info-value">{selectedCar.range_km} km</span>
                  </div>

                  {selectedCar.variant && (
                    <div className="car-info-item">
                      <span className="info-label">Phiên bản:</span>
                      <span className="info-value">{selectedCar.variant}</span>
                    </div>
                  )}

                  <div className="car-info-item full-width">
                    <span className="info-label">Trạng Thái:</span>
                    <span className="info-value status-available">
                      {selectedCar.status === 'Available' ? 'Sẵn sàng' : selectedCar.status}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Booking4Seater;
