import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useVehicles } from '../hooks/useVehicles';
import { useVehicleTimelines } from '../hooks/useVehicleTimelines';
import { AuthContext } from '../context/AuthContext';
import { validateVehicleForBooking } from '../utils/vehicleValidator';
import { orderService } from '../services';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './Booking4Seater.css';
import './BookingCalendar.css';

// Import ảnh xe theo brand và màu
// BMW 4-seater
import bmw4Black from '../assets/BMW4/black.png';
import bmw4White from '../assets/BMW4/white.jpg';
import bmw4Silver from '../assets/BMW4/silver.jpg';
import bmw4Blue from '../assets/BMW4/blue.jpg';
import bmw4Red from '../assets/BMW4/red.png';

// Tesla 4-seater
import tesla4Black from '../assets/Tes4/black.jpg';
import tesla4White from '../assets/Tes4/white.jpg';
import tesla4Silver from '../assets/Tes4/silver.jpg';
import tesla4Blue from '../assets/Tes4/blue.jpg';
import tesla4Red from '../assets/Tes4/red.jpg';

// VinFast 4-seater
import vinfast4Black from '../assets/Vin4/black.png';
import vinfast4White from '../assets/Vin4/white.jpg';
import vinfast4Silver from '../assets/Vin4/silver.png';
import vinfast4Blue from '../assets/Vin4/blue.jpg';
import vinfast4Red from '../assets/Vin4/red.png';

// Images
import car4SeatDefault from '../assets/4seatsilver.png';

const Booking4Seater = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { vehicles: cars, loading } = useVehicles();

  const preSelectedCar = location.state?.car;
  const gradeFilter = location.state?.gradeFilter;

  // ✅ Sử dụng hook để fetch timeline cho tất cả xe
  const { 
    getVehicleTimeline, 
    hasOverlap, 
    getTimelineMessage,
    loading: timelinesLoading 
  } = useVehicleTimelines(cars);

  // Mapping ảnh xe theo brand và màu
  const getCarImageByBrandAndColor = (brand, color) => {
    console.log(' [getCarImage] Input - Brand:', brand, 'Color:', color);
    
    if (!brand || !color) {
      console.log(' [getCarImage] Missing brand or color, using default');
      return car4SeatDefault;
    }

    const brandLower = brand.toLowerCase().trim();
    const colorLower = color.toLowerCase().trim();
    
    console.log('🔍 [getCarImage] Input after trim/lower - Brand:', brandLower, 'Color:', colorLower);

    
    const carImages = {
      tesla: {
        black: tesla4Black,
        white: tesla4White,
        silver: tesla4Silver,
        blue: tesla4Blue,
        red: tesla4Red, 
      },
      bmw: {
        black: bmw4Black,
        white: bmw4White,
        silver: bmw4Silver, 
        blue: bmw4Blue, 
        red: bmw4Red, 
      },
      vinfast: {
        black: vinfast4Black,
        white: vinfast4White, 
        silver: vinfast4Silver, 
        blue: vinfast4Blue, 
        red: vinfast4Red, 
      },
    };

    // Normalize color name - DB stores "Black", "White", "Red", "Blue", "Silver"
    const normalizedColor = colorLower; // Already lowercase from DB colors

    console.log('🎨 [getCarImage] Looking for image:', brandLower, normalizedColor);

    // Return image based on brand and color
    if (carImages[brandLower] && carImages[brandLower][normalizedColor]) {
      console.log('✅ [getCarImage] Found image for', brandLower, normalizedColor);
      return carImages[brandLower][normalizedColor];
    }

    console.log('⚠️ [getCarImage] No image found for', brandLower, normalizedColor, '- using default');
    return car4SeatDefault;
  };

  const [bookedSlots, setBookedSlots] = useState([]);
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
    if (dateStr.includes("T")) {
      const [date, time] = dateStr.split("T");
      const formatted = time.length === 5 ? `${time}:00` : time;
      return `${date} ${formatted}`;
    }
    if (dateStr.length === 10)
      return isStart ? `${dateStr} 00:00:00` : `${dateStr} 23:59:59`;
    return dateStr;
  };

  const availableCars = cars.filter((car) => {
    const isFourSeater = car.type === "4-seater";
    const isAvailable = car.status === 'Available';
    // ✅ HIỂN THỊ TẤT CẢ XE (kể cả BOOKED/RENTAL/CHECKING)
    // Timeline sẽ được check để disable các khung giờ đã book
    const matchesGrade = gradeFilter ? car.grade === gradeFilter : true;
    const matchesColor = selectedColor ? car.color === selectedColor : true;
    
    // Case-insensitive brand matching
    const matchesBrand = selectedBrand 
      ? (car.brand?.toLowerCase().trim() === selectedBrand.toLowerCase().trim() || 
         car.vehicle_name?.toLowerCase().includes(selectedBrand.toLowerCase()))
      : true;
    
    return isFourSeater && isAvailable && matchesGrade && matchesColor && matchesBrand;
  });

  console.log('🚗 [Booking4Seater] Selected Brand:', selectedBrand);
  console.log('🎨 [Booking4Seater] Selected Color:', selectedColor);
  console.log('📋 [Booking4Seater] Available Cars:', availableCars.length, availableCars.map(c => ({ id: c.id, brand: c.brand, color: c.color, name: c.vehicle_name })));
  console.log('📦 [Booking4Seater] Total cars from API/sample:', cars.length);
  console.log('🔎 [Booking4Seater] All cars brands:', [...new Set(cars.map(c => c.brand))]);
  console.log('🔎 [Booking4Seater] 4-seater cars:', cars.filter(c => c.type === '4-seater').map(c => ({ brand: c.brand, color: c.color, name: c.vehicle_name })));

  // Filter available colors based on selected brand (KHÔNG filter theo grade để hiển thị tất cả màu)
  const availableColors = [
    ...new Set(
      cars
        .filter(
          (car) => {
            const isFourSeater = car.type === '4-seater';
            const isAvailable = car.status === 'Available';
            const hasValidColor = car.color && car.color !== 'N/A' && car.color !== 'null';
            // REMOVED: const matchesGrade = !gradeFilter || car.grade === gradeFilter;
            
            // Match brand - simplified: if selectedBrand exists, check if car.brand matches
            let matchesBrand = true;
            if (selectedBrand) {
              const carBrandLower = (car.brand || '').toLowerCase().trim();
              const selectedBrandLower = selectedBrand.toLowerCase().trim();
              matchesBrand = carBrandLower === selectedBrandLower;
              
              console.log(`🔍 Checking car: ${car.vehicle_name} | car.brand: "${car.brand}" (${carBrandLower}) vs selected: "${selectedBrand}" (${selectedBrandLower}) = ${matchesBrand}`);
            }
            
            const passes = isFourSeater && isAvailable && hasValidColor && matchesBrand;
            return passes;
          }
        )
        .map((car) => car.color)
    ),
  ].sort();
  
  console.log('🎨 [Booking4Seater] Available Colors for brand', selectedBrand, ':', availableColors);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
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
            if (preview.status === "RENTAL") {
              setHasActiveRental(true);
              break;
            }
          } catch {
            if (order.status === "RENTAL") {
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

  // Reset selected car when brand changes
  useEffect(() => {
    setSelectedCarId('');
    setSelectedCar(null);
    setBookedSlots([]);
  }, [selectedBrand]);

  // Auto-select car when both color and brand are selected
  useEffect(() => {
    if (selectedColor && selectedBrand) {
      // Filter cars inside useEffect to avoid dependency
      const matchingCars = cars.filter((car) => {
        const isFourSeater = car.type === '4-seater';
        const isAvailable = car.status === 'Available';
        const matchesGrade = gradeFilter ? car.grade === gradeFilter : true;
        const matchesColor = car.color === selectedColor;
        const matchesBrand = car.brand?.toLowerCase().trim() === selectedBrand.toLowerCase().trim() ||
                           car.vehicle_name?.toLowerCase().includes(selectedBrand.toLowerCase());
        return isFourSeater && isAvailable && matchesGrade && matchesColor && matchesBrand;
      });

      if (matchingCars.length > 0) {
        const firstMatchingCar = matchingCars[0];
        const vehicleId = firstMatchingCar.vehicleId || firstMatchingCar.id;
        setSelectedCarId(vehicleId);
        setSelectedCar(firstMatchingCar);
        
        // ✅ Lấy timeline từ hook khi auto-select
        const timeline = getVehicleTimeline(vehicleId);
        setBookedSlots(timeline);
        
        console.log('✅ Auto-selected car:', firstMatchingCar.vehicle_name, firstMatchingCar.brand, firstMatchingCar.color);
      } else {
        setSelectedCarId('');
        setSelectedCar(null);
        setBookedSlots([]);
        console.log('⚠️ No matching cars found');
      }
    } else if (!selectedColor || !selectedBrand) {
      setSelectedCarId('');
      setSelectedCar(null);
      setBookedSlots([]);
    }
  }, [selectedColor, selectedBrand, cars, gradeFilter, getVehicleTimeline]);

  const handleCarSelect = (e) => {
    const carId = e.target.value;
    console.log("🚗 Đã chọn xe ID:", carId);
    setSelectedCarId(carId);

    const car = carId
      ? availableCars.find(
          (c) => c.vehicleId === parseInt(carId) || c.id === parseInt(carId)
        )
      : null;

    setSelectedCar(car);

    // ✅ Lấy timeline từ hook (đã được fetch sẵn)
    if (carId) {
      const vehicleId = car?.vehicleId || car?.id || carId;
      const timeline = getVehicleTimeline(vehicleId);
      console.log("📦 Timeline từ hook:", timeline);
      setBookedSlots(timeline);
    } else {
      setBookedSlots([]);
    }
  };

  function isBooked(date) {
    return bookedSlots.some((slot) => date >= slot.start && date <= slot.end);
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedCar) {
      alert("Vui lòng chọn xe trước khi xác nhận đặt xe.");
      return;
    }
    if (!formData.startTime || !formData.endTime) {
      alert("Vui lòng chọn thời gian nhận và trả xe.");
      return;
    }

    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);
    const now = new Date();

    if (start < now) {
      alert("Thời gian nhận xe phải trong tương lai!");
      return;
    }
    if (end <= start) {
      alert("Thời gian trả xe phải sau thời gian nhận xe!");
      return;
    }

    // ✅ VALIDATE: Kiểm tra overlap với timeline đã book
    const vehicleId = selectedCar.vehicleId || selectedCar.id;
    const hasOverlapWithTimeline = hasOverlap(vehicleId, formData.startTime, formData.endTime);

    if (hasOverlapWithTimeline) {
      alert(
        "⚠️ Xe này đã được đặt trong khoảng thời gian bạn chọn!\n\n" +
        "Vui lòng chọn thời gian khác hoặc chọn xe khác."
      );
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("Vui lòng đăng nhập để tiếp tục.");
      navigate("/login");
      return;
    }

    const validation = validateVehicleForBooking(selectedCar);
    if (!validation.valid) {
      alert(`Xe không đủ thông tin:\n${validation.errors.join("\n")}`);
      return;
    }

    const startTimeFormatted = formatDateTimeForBackend(formData.startTime, true);
    const endTimeFormatted = formatDateTimeForBackend(formData.endTime, false);

    const bookingData = {
      car: selectedCar,
      orderData: {
        vehicleId:
          selectedCar.vehicleId ?? selectedCar.id ?? selectedCar.vehicle_id,
        startTime: startTimeFormatted,
        endTime: endTimeFormatted,
        couponCode: formData.couponCode || null,
        holiday: false,
      },
      startTime: startTimeFormatted,
      endTime: endTimeFormatted,
      customerName:
        user?.fullname ||
        user?.fullName ||
        user?.username ||
        user?.name ||
        "N/A",
      customerPhone:
        user?.phonenumber || user?.phoneNumber || user?.phone || "N/A",
    };

    console.log("🚀 bookingData gửi sang Confirm:", bookingData);
    navigate("/confirm-booking", { state: { bookingData } });
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
        <p>Bạn đang có đơn thuê xe đang hoạt động. Hoàn thành trước khi đặt xe mới.</p>
        <button onClick={() => navigate("/my-bookings")}>Xem đơn đặt xe</button>
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
                            setBookedSlots([]);
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

            {/* ✅ Chọn xe với thông báo timeline */}
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
                  const vehicleId = car.vehicleId || car.id;
                  const timelineMsg = getTimelineMessage(vehicleId);
                  const brand = car.brand || car.vehicle_name?.split(' ')[0] || '';
                  
                  return (
                    <option
                      key={vehicleId}
                      value={vehicleId}
                    >
                      {brand} - {car.plate_number} ({car.color})
                      {timelineMsg ? ` ⚠️ (${timelineMsg.summary})` : ' ✅ (Trống lịch)'}
                    </option>
                  );
                })}
              </select>
              {timelinesLoading && (
                <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                  🔄 Đang tải thông tin lịch đặt xe...
                </small>
              )}
            </div>

            {/* ✅ Hiển thị timeline đã book (nếu có) */}
            {selectedCar && bookedSlots.length > 0 && (
              <div style={{
                padding: "12px",
                background: "#fff3cd",
                border: "1px solid #ffc107",
                borderRadius: "8px",
                marginBottom: "16px"
              }}>
                <p style={{ margin: "0 0 8px", fontWeight: "600", color: "#856404" }}>
                  ⚠️ Xe này đã được đặt trong các khung giờ sau:
                </p>
                <ul style={{ margin: "0", paddingLeft: "20px", color: "#856404" }}>
                  {bookedSlots.map((slot, idx) => {
                    const statusLabel = slot.status === 'MAINTENANCE' 
                      ? '🔧 Bảo trì' 
                      : slot.status === 'CHECKING' 
                      ? '🔍 Kiểm tra' 
                      : slot.status === 'RENTAL'
                      ? '🚗 Đang thuê'
                      : '📅 Đã đặt';
                    
                    return (
                      <li key={idx} style={{ marginBottom: "4px" }}>
                        <strong>{statusLabel}:</strong>{" "}
                        {new Date(slot.start).toLocaleString("vi-VN")} → {new Date(slot.end).toLocaleString("vi-VN")}
                        {slot.note && <em style={{ fontSize: "11px", display: "block", marginTop: "2px" }}>({slot.note})</em>}
                      </li>
                    );
                  })}
                </ul>
                <p style={{ margin: "8px 0 0", fontSize: "13px", color: "#856404" }}>
                  💡 Vui lòng chọn thời gian khác để đặt xe.
                </p>
              </div>
            )}

            {/* ✅ Ngày & giờ nhận xe */}
            <div className="form-group">
              <label>Ngày & Giờ Nhận Xe *</label>
              <DatePicker
                selected={formData.startTime ? new Date(formData.startTime) : null}
                onChange={(date) => {
                  if (!date) return;
                  setFormData({
                    ...formData,
                    startTime: date.toISOString(),
                  });
                }}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={30}
                dateFormat="yyyy-MM-dd HH:mm"
                minDate={new Date()}
                dayClassName={(date) =>
                  isBooked(date) ? "booked-day" : undefined
                }
                placeholderText="Chọn ngày & giờ nhận xe"
              />
            </div>

            {/* ✅ Ngày & giờ trả xe */}
            <div className="form-group">
              <label>Ngày & Giờ Trả Xe *</label>
              <DatePicker
                selected={formData.endTime ? new Date(formData.endTime) : null}
                onChange={(date) => {
                  if (!date) return;
                  setFormData({
                    ...formData,
                    endTime: date.toISOString(),
                  });
                }}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={30}
                dateFormat="yyyy-MM-dd HH:mm"
                minDate={formData.startTime ? new Date(formData.startTime) : new Date()}
                dayClassName={(date) =>
                  isBooked(date) ? "booked-day" : undefined
                }
                placeholderText="Chọn ngày & giờ trả xe"
              />
            </div>

            {/* ✅ Mã giảm giá */}
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

        {/* ✅ Hiển thị xe đã chọn */}
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
