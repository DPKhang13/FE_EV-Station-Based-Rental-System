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
  const [selectedCoupon, setSelectedCoupon] = useState(""); // Coupon đã chọn (chỉ 1)

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

  // 🎫 Tính số ngày đặt xe
  const calculateDays = (startTime, endTime) => {
    if (!startTime || !endTime) return 0;
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // 🎫 Lấy danh sách coupon có thể áp dụng dựa trên số ngày
  const getAvailableCoupons = () => {
    if (!formData.startTime || !formData.endTime) return [];
    const days = calculateDays(formData.startTime, formData.endTime);
    const available = [];
    
    if (days > 5) {
      available.push({ code: "EV20", discount: 20, description: "Giảm 20% (đặt trên 5 ngày)" });
      available.push({ code: "EV10", discount: 10, description: "Giảm 10% (đặt trên 3 ngày)" });
    } else if (days > 3) {
      available.push({ code: "EV10", discount: 10, description: "Giảm 10% (đặt trên 3 ngày)" });
    }
    
    return available;
  };

  // 🎫 Xử lý chọn/bỏ chọn coupon (chỉ 1)
  const handleCouponSelect = (couponCode) => {
    if (selectedCoupon === couponCode) {
      // Bỏ chọn nếu đã chọn rồi
      setSelectedCoupon("");
      setFormData(prev => ({
        ...prev,
        couponCode: ""
      }));
    } else {
      // Chọn coupon mới
      setSelectedCoupon(couponCode);
      setFormData(prev => ({
        ...prev,
        couponCode: couponCode
      }));
    }
  };

  // 🎫 Reset selectedCoupon khi thời gian thay đổi
  useEffect(() => {
    if (formData.startTime && formData.endTime) {
      const available = getAvailableCoupons();
      const availableCodes = available.map(c => c.code);
      // Xóa coupon nếu không còn phù hợp
      if (selectedCoupon && !availableCodes.includes(selectedCoupon)) {
        setSelectedCoupon("");
        setFormData(prev => ({
          ...prev,
          couponCode: ""
        }));
      }
    } else {
      setSelectedCoupon("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.startTime, formData.endTime]);

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

    // Lấy coupon code đã chọn hoặc từ input thủ công
    const finalCouponCode = selectedCoupon || (formData.couponCode?.trim() || null);

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
        couponCode: finalCouponCode,
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
                  Xe này đã được đặt trong các khung giờ sau:
                </p>
                <ul style={{ margin: "0", paddingLeft: "20px", color: "#856404" }}>
                  {bookedSlots.map((slot, idx) => {
                    const statusLabel = slot.status === 'MAINTENANCE' 
                      ? 'Bảo trì' 
                      : slot.status === 'CHECKING' 
                      ? 'Kiểm tra' 
                      : slot.status === 'RENTAL'
                      ? 'Đang thuê'
                      : 'Đã đặt';
                    
                    // Lọc bỏ mã đơn hàng khỏi note (nếu có)
                    const cleanNote = slot.note ? slot.note.replace(/\(Xe được đặt cho đơn thuê #.*?\)/gi, '').replace(/đơn thuê #.*/gi, '').trim() : null;
                    
                    return (
                      <li key={idx} style={{ marginBottom: "4px" }}>
                        <strong>{statusLabel}:</strong>{" "}
                        {new Date(slot.start).toLocaleString("vi-VN")} → {new Date(slot.end).toLocaleString("vi-VN")}
                        {cleanNote && cleanNote.length > 0 && <em style={{ fontSize: "11px", display: "block", marginTop: "2px" }}>({cleanNote})</em>}
                      </li>
                    );
                  })}
                </ul>
                <p style={{ margin: "8px 0 0", fontSize: "13px", color: "#856404" }}>
                  Vui lòng chọn thời gian khác để đặt xe.
                </p>
              </div>
            )}

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
                dayClassName={(date) =>
                  isBooked(date) ? "booked-day" : undefined
                }
                placeholderText="Chọn ngày & giờ nhận xe"
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
                dayClassName={(date) =>
                  isBooked(date) ? "booked-day" : undefined
                }
                placeholderText="Chọn ngày & giờ trả xe"
              />
            </div>

            {/* Mã giảm giá */}
            <div className="form-group">
              <label>Mã giảm giá</label>
              
              {/* Input để nhập mã thủ công (nếu muốn) */}
              <input
                type="text"
                name="couponCode"
                value={formData.couponCode}
                onChange={handleChange}
                placeholder="Nhập mã giảm giá hoặc chọn bên dưới"
                style={{ marginBottom: '12px' }}
              />
              
              {/* Khung hiển thị danh sách coupon có thể chọn */}
              {formData.startTime && formData.endTime && getAvailableCoupons().length > 0 && (
                <div style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '12px',
                  backgroundColor: '#f9f9f9',
                  marginTop: '8px'
                }}>
                  <label style={{ 
                    display: 'block', 
                    fontWeight: '600', 
                    marginBottom: '10px',
                    color: '#333'
                  }}>
                    Mã giảm giá khuyến mãi (chọn 1):
                  </label>
                  {getAvailableCoupons().map((coupon) => (
                    <div 
                      key={coupon.code}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '10px',
                        marginBottom: '8px',
                        backgroundColor: selectedCoupon === coupon.code ? '#e8f5e9' : '#fff',
                        border: selectedCoupon === coupon.code ? '2px solid #4caf50' : '1px solid #ddd',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => handleCouponSelect(coupon.code)}
                    >
                      <input
                        type="radio"
                        name="couponSelection"
                        checked={selectedCoupon === coupon.code}
                        onChange={() => handleCouponSelect(coupon.code)}
                        style={{
                          marginRight: '10px',
                          width: '18px',
                          height: '18px',
                          cursor: 'pointer'
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontWeight: '600', 
                          color: '#1976d2',
                          marginBottom: '4px'
                        }}>
                          {coupon.code}
                        </div>
                        <div style={{ 
                          fontSize: '13px', 
                          color: '#666'
                        }}>
                          {coupon.description}
                        </div>
                      </div>
                    </div>
                  ))}
                  {selectedCoupon && (
                    <div style={{
                      marginTop: '10px',
                      padding: '8px',
                      backgroundColor: '#e3f2fd',
                      borderRadius: '4px',
                      fontSize: '13px',
                      color: '#1976d2'
                    }}>
                      Đã chọn: {selectedCoupon}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button type="submit" className="submit-button">
              XÁC NHẬN ĐẶT XE
            </button>
          </form>

          {/* Điều kiện thuê xe - Sang trái */}
          <div className="rental-conditions-container">
            <div className="rental-condition-box-wrapper">
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
                
                {/* Khung thông tin xe đẹp */}
                <div className="vehicle-info-box">
                  <h3 className="vehicle-info-title">
                    {selectedCar.vehicle_name || selectedCar.vehicleName}
                  </h3>
                  
                  <div className="vehicle-info-grid">
                    {/* Hàng 1 */}
                    <div className="vehicle-info-item">
                      <svg className="vehicle-info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1" />
                        <path d="M12 15l-3-3H7a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2l-3 3z" />
                      </svg>
                      <span className="vehicle-info-text">
                        {selectedCar.plateNumber || selectedCar.plate_number || 'N/A'}
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
                        {selectedCar.seatCount || selectedCar.seat_count || 4} chỗ
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
                        {selectedCar.carmodel || selectedCar.carModel || 'N/A'}
                      </span>
                    </div>
                    
                    {/* Hàng 2 */}
                    <div className="vehicle-info-item">
                      <svg className="vehicle-info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="1" y="6" width="18" height="12" rx="2" ry="2" />
                        <line x1="23" y1="10" x2="23" y2="14" />
                      </svg>
                      <span className="vehicle-info-text">
                        {selectedCar.batteryStatus || selectedCar.battery_status || 'N/A'}
                      </span>
                    </div>
                    
                    <div className="vehicle-info-item">
                      <svg className="vehicle-info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5" />
                        <path d="M2 12l10 5 10-5" />
                      </svg>
                      <span className="vehicle-info-text">
                        {selectedCar.variant || selectedCar.grade || 'N/A'}
                      </span>
                    </div>
                    
                    <div className="vehicle-info-item">
                      <svg className="vehicle-info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                      </svg>
                      <span className="vehicle-info-text">
                        {selectedCar.color || 'N/A'}
                        {selectedCar.color && selectedCar.color !== 'N/A' && (
                          <span 
                            className="vehicle-color-swatch"
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
            <div className="similar-cars-section-wrapper">
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Booking4Seater;
