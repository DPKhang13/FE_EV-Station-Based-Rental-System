import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useVehicleTimelines } from "../hooks/useVehicleTimelines";
import { AuthContext } from "../context/AuthContext";
import { validateVehicleForBooking } from "../utils/vehicleValidator";
import { getSimilarVehicles } from "../services/vehicleService";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import "./Booking4Seater.css";
import "./BookingCalendar.css";

import car4SeatBlack from "../assets/4seatblack.png";
import car4SeatBlue from "../assets/4seatblue.png";
import car4SeatRed from "../assets/4seatred.png";
import car4SeatSilver from "../assets/4seatsilver.png";
import car4SeatWhite from "../assets/4seatwhite.png";

const Booking4Seater = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // ⚡ LẤY XE TRUYỀN TỪ CarFilter
  const preSelectedCar = location.state?.car || null;
  console.log("🔥 XE TRUYỀN SANG BOOK:", preSelectedCar);

  const gradeFilter = location.state?.gradeFilter || null;

  // ⚡ CHỈ DÙNG 1 xe → không load lại API get-all-vehicles
  const cars = preSelectedCar ? [preSelectedCar] : [];
  const loading = false;
  
  // State cho xe tương tự
  const [similarCars, setSimilarCars] = useState([]);
  const [loadingSimilarCars, setLoadingSimilarCars] = useState(false);

  // ⚡ Tạo timeline cho xe truyền sang
  const { getVehicleTimeline, getTimelineMessage, loading: timelinesLoading, timelines } =
    useVehicleTimelines(cars);

  const [bookedSlots, setBookedSlots] = useState([]);
  const [selectedCar, setSelectedCar] = useState(preSelectedCar || null);
  const [selectedCarId, setSelectedCarId] = useState(
    preSelectedCar
      ? String(preSelectedCar.vehicleId || preSelectedCar.id)
      : ""
  );

  const [selectedColor, setSelectedColor] = useState(
    preSelectedCar?.color || ""
  );

  const [formData, setFormData] = useState({
    startTime: "",
    endTime: "",
    couponCode: "",
  });

  // 🖼 Chọn ảnh theo màu
  const getCarImageByColor = (color) => {
    if (!color) return car4SeatSilver;
    const c = color.toLowerCase();
    if (c.includes("đen") || c.includes("black")) return car4SeatBlack;
    if (c.includes("blue") || c.includes("xanh")) return car4SeatBlue;
    if (c.includes("đỏ") || c.includes("red")) return car4SeatRed;
    if (c.includes("white") || c.includes("trắng")) return car4SeatWhite;
    if (c.includes("silver") || c.includes("bạc")) return car4SeatSilver;
    return car4SeatSilver;
  };

  // 🗂 Format gửi backend
  const formatDateTimeForBackend = (str, isStart) => {
    if (!str) return null;
    const date = new Date(str);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    return `${y}-${m}-${d} ${hh}:${mm}:00`;
  };

  // Load xe tương tự khi có selectedCar
  useEffect(() => {
    const loadSimilarCars = async () => {
      if (!selectedCar) {
        setSimilarCars([]);
        return;
      }

      const vehicleId = selectedCar.vehicleId || selectedCar.id || selectedCar.vehicle_id;
      if (!vehicleId) {
        setSimilarCars([]);
        return;
      }

      try {
        setLoadingSimilarCars(true);
        const similar = await getSimilarVehicles(vehicleId);
        // Chỉ lấy 2 xe đầu tiên
        setSimilarCars(similar.slice(0, 2));
      } catch (error) {
        console.error('❌ Lỗi khi load xe tương tự:', error);
        setSimilarCars([]);
      } finally {
        setLoadingSimilarCars(false);
      }
    };

    loadSimilarCars();
  }, [selectedCar]);

  // ⚡ Khi page load → set timeline
  useEffect(() => {
    if (!preSelectedCar || !timelines) return;
    
    const id =
      preSelectedCar.vehicleId ||
      preSelectedCar.id ||
      preSelectedCar.vehicle_id;
    
    if (!id) return;
    
    // Sử dụng timelines trực tiếp thay vì function để tránh vòng lặp
    const timeline = timelines[id] || [];
    
    // Chỉ set nếu có timeline mới (tránh set lại cùng giá trị)
    setBookedSlots(prev => {
      // So sánh nhanh: nếu length khác hoặc có slot mới
      if (prev.length !== timeline.length) {
        return timeline;
      }
      // Nếu length giống, so sánh từng slot
      const hasChanged = timeline.some((slot, idx) => {
        const prevSlot = prev[idx];
        return !prevSlot || 
               slot.start.getTime() !== prevSlot.start.getTime() ||
               slot.end.getTime() !== prevSlot.end.getTime();
      });
      return hasChanged ? timeline : prev;
    });
  }, [preSelectedCar, timelines]);

  // 🟡 Kiểm tra slot đã book
  const isBooked = (date) => {
    return bookedSlots.some((slot) => date >= slot.start && date <= slot.end);
  };

  // 📝 Change field
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 📌 Submit booking
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedCar) return alert("Vui lòng chọn xe.");

    if (!formData.startTime || !formData.endTime)
      return alert("Vui lòng chọn thời gian.");

    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);

    if (end <= start)
      return alert("Thời gian trả xe phải sau thời gian nhận xe.");

    // ⚠ Kiểm tra timeline trùng
    const hasOverlap = bookedSlots.some(
      (slot) => start < slot.end && end > slot.start
    );
    if (hasOverlap)
      return alert("Xe đã được đặt trong thời gian bạn chọn!");

    if (!user) {
      navigate("/login");
      return;
    }

    const validation = validateVehicleForBooking(selectedCar);
    if (!validation.valid) return alert(validation.errors.join("\n"));

    const startTimeFormatted = formatDateTimeForBackend(formData.startTime, true);
    const endTimeFormatted = formatDateTimeForBackend(formData.endTime, false);

    const bookingData = {
      car: selectedCar,
      orderData: {
        vehicleId: Number(
          selectedCar.vehicleId ??
          selectedCar.id ??
          selectedCar.vehicle_id ??
          selectedCar.vehicleID ??
          selectedCar.vehicle_id_pk ??
          selectedCar.vehicleIdFromFilter
        ),
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
    
    // ❗ Chặn lỗi trước khi navigate
    if (!bookingData.orderData.vehicleId || isNaN(bookingData.orderData.vehicleId)) {
      console.error("❌ ERROR: Missing vehicleId in selectedCar:", selectedCar);
      alert("Xe không có vehicleId hợp lệ. Vui lòng chọn xe khác!");
      return;
    }
    
    navigate("/confirm-booking", { state: { bookingData } });
    
  };

  return (
    <div className="booking-container">
      <h1 className="booking-title">Đặt Xe 4 Chỗ</h1>

      <div className="booking-content">
        {/* Form */}
        <div className="booking-form-section">
          <form onSubmit={handleSubmit} className="booking-form">
            {/* Ngày/giờ pickup */}
            <div className="form-group">
              <label>Ngày & Giờ Nhận Xe *</label>
              <DatePicker
                selected={
                  formData.startTime ? new Date(formData.startTime) : null
                }
                onChange={(date) => {
                  if (!date) return;
                  if (isBooked(date)) return alert("Thời gian đã bị đặt.");
                  setFormData({
                    ...formData,
                    startTime: date.toISOString(),
                  });
                }}
                showTimeSelect
                dateFormat="yyyy-MM-dd HH:mm"
                minDate={new Date()}
              />
            </div>

            {/* Trả xe */}
            <div className="form-group">
              <label>Ngày & Giờ Trả Xe *</label>
              <DatePicker
                selected={formData.endTime ? new Date(formData.endTime) : null}
                onChange={(date) => {
                  if (!date) return;
                  if (isBooked(date)) return alert("Thời gian đã bị đặt.");
                  setFormData({
                    ...formData,
                    endTime: date.toISOString(),
                  });
                }}
                showTimeSelect
                dateFormat="yyyy-MM-dd HH:mm"
                minDate={
                  formData.startTime ? new Date(formData.startTime) : new Date()
                }
              />
            </div>

            {/* Mã giảm giá */}
            <div className="form-group">
              <label>Mã giảm giá</label>
              <input
                type="text"
                name="couponCode"
                value={formData.couponCode}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="submit-button">
              XÁC NHẬN ĐẶT XE
            </button>
          </form>

          {/* Điều kiện thuê xe - Sang trái */}
          <div className="rental-conditions-container">
            <div className="rental-condition-box">
              <h3 className="rental-condition-box-title">Điều kiện thuê xe</h3>
              
              <div className="rental-condition-subsection">
                <h4 className="rental-condition-subtitle">Thông tin cần có khi nhận xe</h4>
                <ul className="rental-condition-list">
                  <li>CCCD hoặc Hộ chiếu còn thời hạn</li>
                  <li>Bằng lái hợp lệ, còn thời hạn</li>
                </ul>
              </div>

              <div className="rental-condition-subsection">
                <h4 className="rental-condition-subtitle">Hình thức thanh toán</h4>
                <ul className="rental-condition-list">
                  <li>Trả trước</li>
                  <li>Thời hạn thanh toán: đặt cọc giữ xe thanh toán 100% khi kí hợp đồng và nhận xe</li>
                </ul>
              </div>

              <div className="rental-condition-subsection">
                <h4 className="rental-condition-subtitle">Chính sách đặt cọc (thế chân)</h4>
                <ul className="rental-condition-list">
                  <li>Khách hàng phải thanh toán số tiền cọc là 5.000.000₫</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Car Display and Similar Cars */}
        <div className="booking-right-column">
          {/* Hiển thị xe */}
          <div className="booking-car-display">
            <h2>Xe Đã Chọn</h2>

            {!selectedCar ? (
              <p>Không tìm thấy xe.</p>
            ) : (
              <>
                <img
                  src={getCarImageByColor(selectedCar.color)}
                  className="car-display-image"
                />
                <div className="car-display-details">
                  <h3>{selectedCar.vehicle_name || selectedCar.vehicleName}</h3>
                  <div className="car-specs-grid">
                    <div className="car-spec-item">
                      <svg className="car-spec-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1" />
                        <path d="M12 15l-3-3H7a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2l-3 3z" />
                      </svg>
                      <span className="car-spec-text">{selectedCar.plateNumber || selectedCar.plate_number || 'N/A'}</span>
                    </div>
                    <div className="car-spec-item">
                      <svg className="car-spec-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      <span className="car-spec-text">{selectedCar.seatCount || selectedCar.seat_count || 4} chỗ</span>
                    </div>
                    <div className="car-spec-item">
                      <svg className="car-spec-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 17h14l-1-7H6l-1 7z" />
                        <path d="M7 17v-5" />
                        <path d="M17 17v-5" />
                        <path d="M5 10h14" />
                        <path d="M9 10V7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v3" />
                      </svg>
                      <span className="car-spec-text">{selectedCar.carmodel || selectedCar.carModel || 'N/A'}</span>
                    </div>
                    <div className="car-spec-item">
                      <svg className="car-spec-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="1" y="6" width="18" height="12" rx="2" ry="2" />
                        <line x1="23" y1="10" x2="23" y2="14" />
                      </svg>
                      <span className="car-spec-text">{selectedCar.batteryStatus || selectedCar.battery_status || 'N/A'}</span>
                    </div>
                    <div className="car-spec-item">
                      <svg className="car-spec-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5" />
                        <path d="M2 12l10 5 10-5" />
                      </svg>
                      <span className="car-spec-text">{selectedCar.variant || selectedCar.grade || 'N/A'}</span>
                    </div>
                    <div className="car-spec-item">
                      <svg className="car-spec-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                      </svg>
                      <span className="car-spec-text">
                        {selectedCar.color || 'N/A'}
                        {selectedCar.color && selectedCar.color !== 'N/A' && (
                          <span 
                            className="car-color-swatch-inline"
                            style={{ 
                              backgroundColor: selectedCar.color === 'Red' || selectedCar.color === 'Đỏ' ? '#FF0000' :
                                             selectedCar.color === 'Blue' || selectedCar.color === 'Xanh dương' ? '#0000FF' :
                                             selectedCar.color === 'White' || selectedCar.color === 'Trắng' ? '#FFFFFF' :
                                             selectedCar.color === 'Black' || selectedCar.color === 'Đen' ? '#000000' :
                                             selectedCar.color === 'Silver' || selectedCar.color === 'Bạc' ? '#C0C0C0' : '#CCCCCC',
                              border: (selectedCar.color === 'White' || selectedCar.color === 'Trắng') ? '1px solid #E5E5E5' : 'none'
                            }}
                          ></span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Xe tương tự - Sang phải */}
          {selectedCar && (
            <div className="similar-cars-section">
              <h3 className="similar-cars-title">Xe tương tự</h3>
              {loadingSimilarCars ? (
                <p className="loading-similar-cars">Đang tải xe tương tự...</p>
              ) : (
                <div className="similar-cars-grid">
                  {similarCars.length > 0 ? (
                    similarCars.map(car => (
                      <div key={car.vehicleId || car.id || car.vehicle_id} className="similar-car-card">
                        <img
                          src={getCarImageByColor(car.color)}
                          alt={car.vehicleName || car.vehicle_name}
                          className="similar-car-image"
                        />
                        <div className="similar-car-info">
                          <h4 className="similar-car-name">{car.vehicleName || car.vehicle_name}</h4>
                          <p className="similar-car-price">Giá thuê theo ngày</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-similar-cars">Không có xe tương tự</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Booking4Seater;
