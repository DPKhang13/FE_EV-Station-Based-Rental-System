import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useVehicles } from "../hooks/useVehicles";
import { useVehicleTimelines } from "../hooks/useVehicleTimelines";
import { AuthContext } from "../context/AuthContext";
import { validateVehicleForBooking } from "../utils/vehicleValidator";
import { orderService } from "../services";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Booking7Seater.css";
import "./BookingCalendar.css";

// BMW 7-seater
import bmw7Black from "../assets/BMW7/black.jpg";
import bmw7White from "../assets/BMW7/white.jpg";
import bmw7Silver from "../assets/BMW7/silver.jpg";
import bmw7Blue from "../assets/BMW7/blue.jpg";
import bmw7Red from "../assets/BMW7/red.jpg";

// Tesla 7-seater
import tesla7Black from "../assets/Tes7/black.jpg";
import tesla7White from "../assets/Tes7/white.jpg";
import tesla7Silver from "../assets/Tes7/silver.jpg";
import tesla7Blue from "../assets/Tes7/blue.jpg";
import tesla7Red from "../assets/Tes7/red.jpg";

// VinFast 7-seater
import vinfast7Black from "../assets/Vin7/black.jpg";
import vinfast7White from "../assets/Vin7/white.jpg";
import vinfast7Silver from "../assets/Vin7/silver.jpg";
import vinfast7Blue from "../assets/Vin7/blue.jpg";
import vinfast7Red from "../assets/Vin7/red.jpg";

import car7Default from "../assets/7standard.jpg";
const Booking7Seater = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { vehicles: cars, loading } = useVehicles();

  const preSelectedCar = location.state?.car;
  const gradeFilter = location.state?.gradeFilter;

  const {
    getVehicleTimeline,
    hasOverlap,
    getTimelineMessage,
    loading: timelinesLoading,
  } = useVehicleTimelines(cars);

  const getCarImageByBrandAndColor = (brand, color) => {
    if (!brand || !color) return car7Default;
    const brandLower = brand.toLowerCase();
    const colorLower = color.toLowerCase();

    const carImages = {
      bmw: {
        black: bmw7Black,
        white: bmw7White,
        silver: bmw7Silver,
        blue: bmw7Blue,
        red: bmw7Red,
      },
      tesla: {
        black: tesla7Black,
        white: tesla7White,
        silver: tesla7Silver,
        blue: tesla7Blue,
        red: tesla7Red,
      },
      vinfast: {
        black: vinfast7Black,
        white: vinfast7White,
        silver: vinfast7Silver,
        blue: vinfast7Blue,
        red: vinfast7Red,
      },
    };

    return carImages[brandLower]?.[colorLower] || car7Default;
  };

  const [bookedSlots, setBookedSlots] = useState([]);
  const [selectedCarId, setSelectedCarId] = useState(preSelectedCar?.id || "");
  const [selectedCar, setSelectedCar] = useState(preSelectedCar || null);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [formData, setFormData] = useState({
    startTime: "",
    endTime: "",
    couponCode: "",
  });

  // format datetime kiểu yyyy-MM-dd HH:mm:ss
  const formatDateTimeForBackend = (dateStr, isStart = true) => {
    if (!dateStr) return null;
    if (dateStr.includes("T")) {
      const [date] = dateStr.split("T");
      return isStart ? `${date} 00:00:00` : `${date} 23:59:59`;
    }
    return isStart ? `${dateStr} 00:00:00` : `${dateStr} 23:59:59`;
  };

  const availableCars = cars.filter((car) => {
    const isSeven = car.type === "7-seater";
    const isAvailable = car.status === "Available";
    const matchesGrade = gradeFilter ? car.grade === gradeFilter : true;
    const matchesColor = selectedColor ? car.color === selectedColor : true;
    const matchesBrand = selectedBrand
      ? car.brand?.toLowerCase().trim() === selectedBrand.toLowerCase().trim()
      : true;

    return isSeven && isAvailable && matchesGrade && matchesColor && matchesBrand;
  });

  const availableColors = [
    ...new Set(
      cars
      .filter(
        (car) => {
          const isSevenSeater = car.type === '7-seater';
          const isAvailable = car.status === 'Available';
          const hasValidColor = car.color && car.color !== 'N/A' && car.color !== 'null';
          
          let matchesBrand = true;
          if (selectedBrand) {
            const carBrandLower = (car.brand || '').toLowerCase().trim();
            const selectedBrandLower = selectedBrand.toLowerCase().trim();
            matchesBrand = carBrandLower === selectedBrandLower;
          }

          const passes = isSevenSeater && isAvailable && hasValidColor && matchesBrand;
          return passes;
        }
      )
      .map((car) => car.color)
  ),
].sort();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    setSelectedCarId("");
    setSelectedCar(null);
    setBookedSlots([]);
  }, [selectedBrand]);

  useEffect(() => {
    if (selectedColor && selectedBrand) {
      const matchingCars = cars.filter((car) => {
        const isSeven = car.type === "7-seater";
        const isAvailable = car.status === "Available";
        const matchesColor = car.color === selectedColor;
        const matchesBrand =
          car.brand?.toLowerCase().trim() === selectedBrand.toLowerCase().trim();
        return isSeven && isAvailable && matchesColor && matchesBrand;
      });

      if (matchingCars.length > 0) {
        const firstCar = matchingCars[0];
        const vehicleId = firstCar.vehicleId || firstCar.id;
        setSelectedCarId(vehicleId);
        setSelectedCar(firstCar);
        setBookedSlots(getVehicleTimeline(vehicleId));
      } else {
        setSelectedCarId("");
        setSelectedCar(null);
        setBookedSlots([]);
      }
    }
  }, [selectedColor, selectedBrand, cars, getVehicleTimeline]);

  const handleCarSelect = (e) => {
    const carId = e.target.value;
    setSelectedCarId(carId);
    const car = availableCars.find(
      (c) => c.vehicleId === parseInt(carId) || c.id === parseInt(carId)
    );
    setSelectedCar(car);
    if (car) setBookedSlots(getVehicleTimeline(car.vehicleId || car.id));
  };

  const isBooked = (date) => {
    return bookedSlots.some((slot) => date >= slot.start && date <= slot.end);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedCar) {
      alert("Vui lòng chọn xe trước khi xác nhận đặt xe.");
      return;
    }

    const startTimeFormatted = formatDateTimeForBackend(formData.startTime, true);
    const endTimeFormatted = formatDateTimeForBackend(formData.endTime, false);

    const vehicleId = selectedCar.vehicleId || selectedCar.id;

    if (hasOverlap(vehicleId, startTimeFormatted, endTimeFormatted)) {
      alert(
        "⚠️ Xe này đã được đặt trong khoảng thời gian bạn chọn!\nVui lòng chọn thời gian khác."
      );
      return;
    }

    const bookingData = {
      car: selectedCar,
      orderData: {
        vehicleId,
        startTime: startTimeFormatted,
        endTime: endTimeFormatted,
        holiday: false,
        couponCode: formData.couponCode || null,
      },
      startTime: startTimeFormatted,
      endTime: endTimeFormatted,
      customerName:
        user?.fullname || user?.fullName || user?.username || user?.name || "N/A",
      customerPhone:
        user?.phonenumber || user?.phoneNumber || user?.phone || "N/A",
    };

    console.log("🚀 bookingData:", bookingData);
    navigate("/confirm-booking", { state: { bookingData } });
  };

  if (loading) return <div className="booking-container">Đang tải dữ liệu xe...</div>;

  return (
    <div className="booking-container">
      <h1 className="booking-title">Đặt Xe 7 Chỗ</h1>

      <div className="booking-content">
        <div className="booking-form-section">
          <form onSubmit={handleSubmit} className="booking-form">
            <div className="form-group">
              <label>Chọn Hãng Xe *</label>
              <select
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

            <div className="form-group">
              <label>Chọn Màu</label>
              <div className="color-options">
                {availableColors.map((color) => {
                  const isSelected = selectedColor === color;
                  return (
                    <div
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`color-box ${isSelected ? "selected" : ""}`}
                      style={{
                        backgroundColor:
                          color.toLowerCase() === "white" ? "#fff" : color.toLowerCase(),
                        border: color === "White" ? "1px solid #ccc" : "none",
                      }}
                    ></div>
                  );
                })}
              </div>
            </div>

            <div className="form-group">
              <label>Chọn Xe *</label>
              <select
                value={selectedCarId}
                onChange={handleCarSelect}
                disabled={!selectedBrand || !selectedColor}
                required
              >
                <option value="">
                  {!selectedColor || !selectedBrand
                    ? "Vui lòng chọn màu và hãng xe trước"
                    : "Chọn một xe"}
                </option>
                {availableCars.map((car) => {
                  const vehicleId = car.vehicleId || car.id;
                  const timelineMsg = getTimelineMessage(vehicleId);
                  return (
                    <option key={vehicleId} value={vehicleId}>
                      {car.brand} - {car.plate_number} ({car.color})
                      {timelineMsg ? ` ⚠️ (${timelineMsg.summary})` : " ✅ (Trống lịch)"}
                    </option>
                  );
                })}
              </select>
            </div>

            {selectedCar && bookedSlots.length > 0 && (
              <div className="booked-slots-warning">
                <p>⚠️ Xe này đã được đặt trong các ngày sau:</p>
                <ul>
                  {bookedSlots.map((slot, i) => (
                    <li key={i}>
                      {new Date(slot.start).toLocaleDateString("vi-VN")} →
                      {new Date(slot.end).toLocaleDateString("vi-VN")}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="form-group">
              <label>Ngày Nhận Xe *</label>
              <DatePicker
                selected={formData.startTime ? new Date(formData.startTime) : null}
                onChange={(date) =>
                  setFormData({ ...formData, startTime: date.toISOString() })
                }
                dateFormat="yyyy-MM-dd"
                minDate={new Date()}
                dayClassName={(d) => (isBooked(d) ? "booked-day" : undefined)}
                placeholderText="Chọn ngày nhận xe"
              />
            </div>

            <div className="form-group">
              <label>Ngày Trả Xe *</label>
              <DatePicker
                selected={formData.endTime ? new Date(formData.endTime) : null}
                onChange={(date) =>
                  setFormData({ ...formData, endTime: date.toISOString() })
                }
                dateFormat="yyyy-MM-dd"
                minDate={
                  formData.startTime ? new Date(formData.startTime) : new Date()
                }
                dayClassName={(d) => (isBooked(d) ? "booked-day" : undefined)}
                placeholderText="Chọn ngày trả xe"
              />
            </div>

            <div className="form-group">
              <label>Mã Giảm Giá (Không bắt buộc)</label>
              <input
                type="text"
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
            <p>Vui lòng chọn xe từ danh sách để xem chi tiết</p>
          ) : (
            <>
              <img
                src={getCarImageByBrandAndColor(selectedCar.brand, selectedCar.color)}
                alt={selectedCar.vehicle_name}
                className="car-display-image"
              />
              <div className="car-display-details">
                <p>Hãng: {selectedCar.brand}</p>
                <p>Màu: {selectedCar.color}</p>
                <p>Biển số: {selectedCar.plate_number}</p>
                <p>Số chỗ: {selectedCar.seat_count}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Booking7Seater;
