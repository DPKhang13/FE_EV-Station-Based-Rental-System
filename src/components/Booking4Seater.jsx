import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useVehicles } from "../hooks/useVehicles";
import { useVehicleTimelines } from "../hooks/useVehicleTimelines";
import { AuthContext } from "../context/AuthContext";
import { validateVehicleForBooking } from "../utils/vehicleValidator";
import { orderService } from "../services";

import "./Booking4Seater.css";
import "./BookingCalendar.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import car4SeatBlack from "../assets/4seatblack.png";
import car4SeatBlue from "../assets/4seatblue.png";
import car4SeatRed from "../assets/4seatred.png";
import car4SeatSilver from "../assets/4seatsilver.png";
import car4SeatWhite from "../assets/4seatwhite.png";

const Booking4Seater = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { vehicles: cars, loading } = useVehicles();

  const preSelectedCar = location.state?.car;
  const gradeFilter = location.state?.gradeFilter;

  // ✅ Sử dụng hook mới để fetch timeline cho tất cả xe
  const { 
    getVehicleTimeline, 
    hasBookedSlots, 
    hasOverlap, 
    getTimelineMessage,
    loading: timelinesLoading 
  } = useVehicleTimelines(cars);

  const [bookedSlots, setBookedSlots] = useState([]);
  const [selectedCarId, setSelectedCarId] = useState(preSelectedCar?.vehicleId || "");
  const [selectedCar, setSelectedCar] = useState(preSelectedCar || null);
  const [selectedColor, setSelectedColor] = useState("");
  const [hasActiveRental, setHasActiveRental] = useState(false);
  const [checkingRental, setCheckingRental] = useState(true);
  const [formData, setFormData] = useState({
    startTime: "",
    endTime: "",
    couponCode: "",
  });

  const getCarImageByColor = (color) => {
    if (!color) return car4SeatSilver;
    const c = color.toLowerCase();
    if (c.includes("black") || c.includes("đen")) return car4SeatBlack;
    if (c.includes("blue") || c.includes("xanh")) return car4SeatBlue;
    if (c.includes("red") || c.includes("đỏ")) return car4SeatRed;
    if (c.includes("silver") || c.includes("bạc")) return car4SeatSilver;
    if (c.includes("white") || c.includes("trắng")) return car4SeatWhite;
    return car4SeatSilver;
  };

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
    // ✅ HIỂN THỊ TẤT CẢ XE (kể cả BOOKED/RENTAL/CHECKING)
    // Timeline sẽ được check để disable các khung giờ đã book
    const matchesGrade = gradeFilter ? car.grade === gradeFilter : true;
    const matchesColor = selectedColor ? car.color === selectedColor : true;
    return isFourSeater && matchesGrade && matchesColor;
  });

  const availableColors = [
    ...new Set(
      cars
        .filter(
          (car) =>
            car.type === "4-seater" &&
            car.color &&
            car.color !== "N/A" &&
            car.color !== "null" &&
            (!gradeFilter || car.grade === gradeFilter)
        )
        .map((car) => car.color)
    ),
  ].sort();

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
      const timeline = getVehicleTimeline(carId);
      console.log("📦 Timeline từ hook:", timeline);
      setBookedSlots(timeline);
    } else {
      setBookedSlots([]);
    }
  };

  function isBooked(date) {
    return bookedSlots.some((slot) => date >= slot.start && date <= slot.end);
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
    const hasOverlap = bookedSlots.some((slot) => {
      // Overlap condition: (start1 < end2) AND (end1 > start2)
      return start < slot.end && end > slot.start;
    });

    if (hasOverlap) {
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
            {!preSelectedCar && availableColors.length > 0 && (
              <div className="form-group">
                <label>Chọn Màu</label>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  {availableColors.map((color) => (
                    <div
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      style={{
                        width: 50,
                        height: 50,
                        backgroundColor: color.toLowerCase(),
                        border:
                          selectedColor === color
                            ? "3px solid #667eea"
                            : "1px solid #ccc",
                        borderRadius: 8,
                        cursor: "pointer",
                      }}
                    ></div>
                  ))}
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
              >
                <option value="">Chọn một xe</option>
                {availableCars.map((car) => {
                  const vehicleId = car.vehicleId || car.id;
                  const timelineMsg = getTimelineMessage(vehicleId);
                  const displayName = car.vehicle_name || car.vehicleName || car.plateNumber;
                  
                  return (
                    <option
                      key={vehicleId}
                      value={vehicleId}
                    >
                      {displayName}
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

            {/* ✅ Hiển thị timeline đã book (nếu có) - Cải tiến với status */}
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
                  if (isBooked(date)) {
                    alert("Xe này đã được đặt trong thời gian này!");
                    return;
                  }
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
                  if (isBooked(date)) {
                    alert("Xe này đã được đặt trong thời gian này!");
                    return;
                  }
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
