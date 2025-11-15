import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useVehicles } from '../hooks/useVehicles';
import { useVehicleTimelines } from '../hooks/useVehicleTimelines';
import { AuthContext } from '../context/AuthContext';
import { validateVehicleForBooking } from '../utils/vehicleValidator';
import { orderService } from '../services';
import './Booking7Seater.css';
import './BookingCalendar.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Booking7Seater = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { vehicles: cars, loading } = useVehicles();
    const preSelectedCar = location.state?.car;
    const gradeFilter = location.state?.gradeFilter; // For filtering by grade from Offers

    // ✅ Sử dụng hook mới để fetch timeline cho tất cả xe
    const { 
        getVehicleTimeline, 
        hasBookedSlots, 
        hasOverlap, 
        getTimelineMessage,
        loading: timelinesLoading 
    } = useVehicleTimelines(cars);

    const [selectedCarId, setSelectedCarId] = useState(preSelectedCar?.vehicleId || preSelectedCar?.id || '');
    const [selectedCar, setSelectedCar] = useState(preSelectedCar || null);
    const [selectedColor, setSelectedColor] = useState('');
    const [hasActiveRental, setHasActiveRental] = useState(false);
    const [checkingRental, setCheckingRental] = useState(true);
    const [bookedSlots, setBookedSlots] = useState([]);

    const [formData, setFormData] = useState({
        startTime: '',
        plannedHours: '',
        couponCode: ''
    });

    // Filter 7-seater available cars, optionally by grade and color
    const availableCars = cars.filter(car => {
        const isSevenSeater = car.type === '7-seater';
        // ✅ HIỂN THỊ TẤT CẢ XE (kể cả BOOKED/RENTAL/CHECKING)
        // Timeline sẽ được check để disable các khung giờ đã book
        const matchesGrade = gradeFilter ? car.grade === gradeFilter : true;
        const matchesColor = selectedColor ? car.color === selectedColor : true;
        return isSevenSeater && matchesGrade && matchesColor;
    });

    // Get unique colors from 7-seater available cars
    const availableColors = [...new Set(
        cars.filter(car =>
            car.type === '7-seater' &&
            car.color &&
            car.color !== 'N/A' &&
            car.color !== 'null' &&
            (!gradeFilter || car.grade === gradeFilter)
        ).map(car => car.color)
    )].sort();

    // Format datetime for backend
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

    // Check if date is booked
    function isBooked(date) {
        return bookedSlots.some((slot) => date >= slot.start && date <= slot.end);
    }

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
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleCarSelect = (e) => {
        const carId = e.target.value;
        console.log('🚗 Đã chọn xe ID:', carId);
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
            console.log('📦 Timeline từ hook:', timeline);
            setBookedSlots(timeline);
        } else {
            setBookedSlots([]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // 1. Validate car selection
        if (!selectedCar) {
            alert('Vui lòng chọn xe trước khi xác nhận đặt xe.');
            return;
        }

        // 2. Validate dates and hours
        if (!formData.startTime) {
            alert('Vui lòng chọn ngày và giờ nhận xe.');
            return;
        }

        if (!formData.plannedHours || formData.plannedHours < 1) {
            alert('Vui lòng nhập số giờ thuê (tối thiểu 1 giờ).');
            return;
        }

        // ✅ Validate vehicle has all required data for backend
        console.log('🔍 [Booking7Seater] Validating vehicle before booking:', {
            id: selectedCar.id,
            vehicle_id: selectedCar.vehicle_id,
            vehicle_name: selectedCar.vehicle_name,
            status: selectedCar.status,
            seatCount: selectedCar.seatCount || selectedCar.seat_count,
            variant: selectedCar.variant || selectedCar.grade,
            stationId: selectedCar.stationId,
            pricingRuleId: selectedCar.pricingRuleId
        });

        const validation = validateVehicleForBooking(selectedCar);

        if (!validation.valid) {
            console.error('❌ Vehicle validation failed:', validation.errors);
            console.error('❌ Full vehicle object:', selectedCar);
            alert(
                `❌ Xe này không thể đặt do thiếu thông tin:\n\n${validation.errors.join('\n')}\n\n` +
                `Vui lòng chọn xe khác hoặc liên hệ hỗ trợ.\n\n` +
                `Vehicle ID: ${selectedCar.id || selectedCar.vehicleId}\n` +
                `Vehicle Name: ${selectedCar.vehicle_name}\n` +
                `Status: ${selectedCar.status}\n\n` +
                `Chi tiết lỗi đã được log ra console.`
            );
            return;
        }

        console.log('✅ Vehicle validation passed:', selectedCar.id, selectedCar.vehicle_name);

        const start = new Date(formData.startTime);
        const now = new Date();

        if (start < now) {
            alert('Thời gian nhận xe phải trong tương lai!');
            return;
        }

        // Calculate end time from start time + planned hours
        const plannedHours = parseInt(formData.plannedHours);
        if (!plannedHours || plannedHours < 1) {
            alert('Vui lòng nhập số giờ thuê (tối thiểu 1 giờ).');
            return;
        }

        const end = new Date(start.getTime() + (plannedHours * 60 * 60 * 1000));

        // ✅ VALIDATE: Kiểm tra overlap với timeline đã book
        const hasOverlap = bookedSlots.some((slot) => {
            // Overlap condition: (start1 < end2) AND (end1 > start2)
            return start < slot.end && end > slot.start;
        });

        if (hasOverlap) {
            alert(
                '⚠️ Xe này đã được đặt trong khoảng thời gian bạn chọn!\n\n' +
                'Vui lòng chọn thời gian khác hoặc chọn xe khác.'
            );
            return;
        }

        // 5. Get user ID and token
        const token = localStorage.getItem('accessToken');

        let customerId = user?.userId;

        // Fallback: try to get from localStorage if user context not available
        if (!customerId) {
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                try {
                    const parsedUser = JSON.parse(savedUser);
                    customerId = parsedUser.userId;
                } catch (e) {
                    console.error('Failed to parse user from localStorage:', e);
                }
            }
        }

        console.log('🔍 [Booking] Checking auth:', {
            hasUser: !!user,
            userId: user?.userId,
            customerId: customerId,
            hasToken: !!token
        });

        if (!customerId || !token) {
            navigate('/login');
            return;
        }

        const startTimeFormatted = formatDateTimeForBackend(formData.startTime, true);
        const endTimeFormatted = formatDateTimeForBackend(
            end.toISOString().slice(0, 19).replace('T', ' '),
            false
        );

        console.log('📅 Formatted times:', {
            start: startTimeFormatted,
            end: endTimeFormatted,
            plannedHours: plannedHours
        });

        // 8. Prepare booking data
        const bookingData = {
            car: selectedCar,
            orderData: {
                customerId: customerId, // Keep as UUID string, don't parse to int!
                vehicleId: selectedCar.id,
                startTime: startTimeFormatted,
                endTime: endTimeFormatted,
                plannedHours: plannedHours,
                couponCode: formData.couponCode || null,
                actualHours: null
            },
            plannedHours: plannedHours,
            startTime: startTimeFormatted,
            endTime: endTimeFormatted,
            customerName: user?.fullname || user?.fullName || user?.username || user?.name || 'N/A',
            customerPhone: user?.phonenumber || user?.phoneNumber || user?.phone || 'N/A'
        };

        console.log('📦 Navigating to confirm page with data:', bookingData);
        console.log('👤 Customer info being sent:', {
            customerName: bookingData.customerName,
            customerPhone: bookingData.customerPhone,
            userObject: user
        });

        // 9. Navigate to Confirm Booking Page
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
                <p>Bạn đang có đơn thuê xe đang hoạt động. Hoàn thành trước khi đặt xe mới.</p>
                <button onClick={() => navigate('/my-bookings')}>Xem đơn đặt xe</button>
            </div>
        );

    return (
        <div className="booking-container">
            <h1 className="booking-title">Đặt Xe 7 Chỗ</h1>

            <div className="booking-content">
                {/* Left side - Booking Form */}
                <div className="booking-form-section">
                    <form onSubmit={handleSubmit} className="booking-form">
                        {!preSelectedCar && availableColors.length > 0 && (
                            <div className="form-group">
                                <label>Chọn Màu</label>
                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
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
                                                        ? '3px solid #667eea'
                                                        : '1px solid #ccc',
                                                borderRadius: 8,
                                                cursor: 'pointer',
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
                                        alert('Xe này đã được đặt trong thời gian này!');
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
                                    isBooked(date) ? 'booked-day' : undefined
                                }
                                placeholderText="Chọn ngày & giờ nhận xe"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="plannedHours">Số Giờ Thuê *</label>
                            <input
                                type="number"
                                id="plannedHours"
                                name="plannedHours"
                                value={formData.plannedHours}
                                onChange={handleChange}
                                min="1"
                                step="1"
                                placeholder="Nhập số giờ (ví dụ: 24)"
                                required
                            />
                            <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                                Thời gian thuê tối thiểu là 1 giờ
                            </small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="couponCode">Mã Giảm Giá (Không bắt buộc)</label>
                            <input
                                type="text"
                                id="couponCode"
                                name="couponCode"
                                value={formData.couponCode}
                                onChange={handleChange}
                                placeholder="Nhập mã giảm giá nếu bạn có"
                            />
                            <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                                Để trống nếu bạn không có mã giảm giá
                            </small>
                        </div>

                        <button type="submit" className="submit-button">
                            XÁC NHẬN ĐẶT XE
                        </button>
                    </form>
                </div>

                {/* Right side - Selected Car Display */}
                <div className="booking-car-display">
                    <h2 className="car-display-title">Xe Đã Chọn</h2>

                    {!selectedCar ? (
                        <div className="no-car-selected">
                            <p>Vui lòng chọn xe từ danh sách để xem chi tiết</p>
                        </div>
                    ) : (
                        <>
                            <img
                                src={selectedCar.image}
                                alt={selectedCar.vehicle_name}
                                className="car-display-image"
                            />

                            <div className="car-display-details">
                                <h3 className="car-name">{selectedCar.vehicle_name}</h3>

                                {selectedCar.grade && (
                                    <div className="car-grade-badge">
                                        Hạng: {selectedCar.grade}
                                    </div>
                                )}

                                <div className="car-info-grid">
                                    <div className="car-info-item">
                                        <span className="info-label">Mã Xe:</span>
                                        <span className="info-value">{selectedCar.vehicle_id}</span>
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
                                        <span className="info-value">{selectedCar.seat_count} chỗ</span>
                                    </div>

                                    <div className="car-info-item">
                                        <span className="info-label">Năm SX:</span>
                                        <span className="info-value">{selectedCar.year_of_manufacture}</span>
                                    </div>

                                    <div className="car-info-item">
                                        <span className="info-label">Biển số:</span>
                                        <span className="info-value">{selectedCar.plate_number}</span>
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
                                        <span className={`info-value status ${selectedCar.status === 'Available' ? 'available' : 'unavailable'}`}>
                                            {selectedCar.status === 'Available' ? 'Có sẵn' : selectedCar.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="car-description">
                                    <span className="info-label">Mô tả:</span>
                                    <p>{selectedCar.description}</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Booking7Seater;