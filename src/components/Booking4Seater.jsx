import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useVehicles } from '../hooks/useVehicles';
import { AuthContext } from '../context/AuthContext';
import { validateVehicleForBooking } from '../utils/vehicleValidator';
import './Booking4Seater.css';

// Import car images by color
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
    const gradeFilter = location.state?.gradeFilter; // For filtering by grade from Offers

    // Function to get car image based on color
    const getCarImageByColor = (color) => {
        if (!color) return car4SeatSilver; // Default image

        const colorLower = color.toLowerCase();

        if (colorLower.includes('black') || colorLower.includes('đen')) {
            return car4SeatBlack;
        } else if (colorLower.includes('blue') || colorLower.includes('xanh')) {
            return car4SeatBlue;
        } else if (colorLower.includes('red') || colorLower.includes('đỏ')) {
            return car4SeatRed;
        } else if (colorLower.includes('silver') || colorLower.includes('bạc')) {
            return car4SeatSilver;
        } else if (colorLower.includes('white') || colorLower.includes('trắng')) {
            return car4SeatWhite;
        } else {
            return car4SeatSilver; // Default fallback
        }
    };

    const [selectedCarId, setSelectedCarId] = useState(preSelectedCar?.id || '');
    const [selectedCar, setSelectedCar] = useState(preSelectedCar || null);
    const [submitting, setSubmitting] = useState(false);
    const [selectedColor, setSelectedColor] = useState('');

    const [formData, setFormData] = useState({
        startTime: '',
        plannedHours: '',
        couponCode: ''
    });

    // Filter 4-seater available cars, optionally by grade and color
    const availableCars = cars.filter(car => {
        const isFourSeater = car.type === '4-seater';
        const isAvailable = car.status === 'Available';
        const matchesGrade = gradeFilter ? car.grade === gradeFilter : true;
        const matchesColor = selectedColor ? car.color === selectedColor : true;
        return isFourSeater && isAvailable && matchesGrade && matchesColor;
    });

    // Get unique colors from 4-seater available cars
    const availableColors = [...new Set(
        cars.filter(car =>
            car.type === '4-seater' &&
            car.status === 'Available' &&
            car.color &&
            car.color !== 'N/A' &&
            car.color !== 'null' &&
            (!gradeFilter || car.grade === gradeFilter)
        ).map(car => car.color)
    )].sort();

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleCarSelect = (e) => {
        const carId = e.target.value;
        setSelectedCarId(carId);
        if (carId) {
            const car = availableCars.find(c => c.id === parseInt(carId));
            setSelectedCar(car);
        } else {
            setSelectedCar(null);
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
        console.log('🔍 [DEBUG] Selected car object:', selectedCar);
        console.log('🔍 [DEBUG] Car fields:', Object.keys(selectedCar));

        const validation = validateVehicleForBooking(selectedCar);

        if (!validation.valid) {
            console.error('❌ Vehicle validation failed:', validation.errors);
            alert(
                `❌ Xe này không thể đặt do thiếu thông tin:\n\n${validation.errors.join('\n')}\n\n` +
                `Vui lòng chọn xe khác hoặc liên hệ hỗ trợ.\n\n` +
                `Vehicle ID: ${selectedCar.id || selectedCar.vehicleId}`
            );
            return;
        }

        console.log('✅ Vehicle validation passed');

        // 3. Validate time logic
        const start = new Date(formData.startTime);
        const now = new Date();

        if (start < now) {
            alert('Thời gian nhận xe phải là thời điểm trong tương lai!');
            return;
        }

        // 4. Calculate end time from start time + planned hours
        const plannedHours = parseInt(formData.plannedHours);
        const end = new Date(start.getTime() + (plannedHours * 60 * 60 * 1000));

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
            alert('Vui lòng đăng nhập để tiếp tục!');
            navigate('/login');
            return;
        }

        // 6. Convert datetime to backend format (add seconds)
        const startTimeFormatted = formData.startTime
            .replace('T', ' ')  // Đổi T thành dấu cách
            + ':00';
        const year = end.getFullYear();
        const month = String(end.getMonth() + 1).padStart(2, '0');
        const day = String(end.getDate()).padStart(2, '0');
        const hours = String(end.getHours()).padStart(2, '0');
        const minutes = String(end.getMinutes()).padStart(2, '0');
        const seconds = String(end.getSeconds()).padStart(2, '0');

        // Format end time (calculated from startTime + plannedHours)
        const endTimeFormatted = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        console.log('📅 Formatted times:', {
            start: startTimeFormatted,
            end: endTimeFormatted,
            plannedHours: plannedHours
        });
        // 7. Prepare booking data
        const bookingData = {
            car: selectedCar,
            orderData: {
                customerId: customerId,
                vehicleId: selectedCar.id,
                startTime: startTimeFormatted,
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

        console.log('👤 Customer info being sent:', {
            customerName: bookingData.customerName,
            customerPhone: bookingData.customerPhone,
            userObject: user
        });

        console.log('📦 Navigating to confirm page with data:', bookingData);

        // 8. Navigate to Confirm Booking Page
        navigate('/confirm-booking', { state: { bookingData } });
    };

    // Show loading state
    if (loading) {
        return (
            <div className="booking-container">
                <div style={{ textAlign: 'center', padding: 60, fontSize: 18, color: '#888' }}>
                    Đang tải dữ liệu xe...
                </div>
            </div>
        );
    }

    return (
        <div className="booking-container">
            <h1 className="booking-title">Đặt Xe 4 Chỗ</h1>

            <div className="booking-content">
                {/* Left side - Booking Form */}
                <div className="booking-form-section">
                    <form onSubmit={handleSubmit} className="booking-form">
                        {/* Color Filter - Color Boxes */}
                        {!preSelectedCar && availableColors.length > 0 && (
                            <div className="form-group">
                                <label>🎨 Lọc theo màu sắc</label>
                                <div style={{
                                    display: 'flex',
                                    gap: '12px',
                                    flexWrap: 'wrap',
                                    marginTop: '8px'
                                }}>
                                    {availableColors.map(color => {
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
                                                    setSelectedColor(color);
                                                    setSelectedCarId('');
                                                    setSelectedCar(null);
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
                                {selectedColor && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedColor('');
                                            setSelectedCarId('');
                                            setSelectedCar(null);
                                        }}
                                        style={{
                                            marginTop: 12,
                                            padding: '6px 16px',
                                            background: '#dc2626',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: 6,
                                            fontSize: 13,
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Xóa bộ lọc màu
                                    </button>
                                )}
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
                                {availableCars.map(car => (
                                    <option key={car.id} value={car.id}>
                                        {car.vehicle_name}
                                    </option>
                                ))}
                            </select>
                            {selectedColor && (
                                <small style={{ color: '#dc2626', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                                    Đang lọc xe màu: {selectedColor}
                                </small>
                            )}
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
                            <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                                Chọn thời điểm bạn muốn nhận xe
                            </small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="plannedHours">Số Giờ Thuê * (Thuê 3 giờ giá rẻ hơn)</label>
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
                                src={getCarImageByColor(selectedCar.color)}
                                alt={selectedCar.vehicle_name}
                                className="car-display-image"
                            />

                            <div className="car-display-details">
                                <h3 className="car-name">{selectedCar.vehicle_name}</h3>

                                <div className="car-info-grid">
                                    <div className="car-info-item">
                                        <span className="info-label">Vehicle ID:</span>
                                        <span className="info-value">{selectedCar.vehicle_id}</span>
                                    </div>

                                    <div className="car-info-item">
                                        <span className="info-label">Brand:</span>
                                        <span className="info-value">{selectedCar.brand}</span>
                                    </div>

                                    <div className="car-info-item">
                                        <span className="info-label">Color:</span>
                                        <span className="info-value">{selectedCar.color}</span>
                                    </div>

                                    <div className="car-info-item">
                                        <span className="info-label">Seats:</span>
                                        <span className="info-value">{selectedCar.seat_count} seats</span>
                                    </div>

                                    <div className="car-info-item">
                                        <span className="info-label">Year:</span>
                                        <span className="info-value">{selectedCar.year_of_manufacture}</span>
                                    </div>

                                    <div className="car-info-item">
                                        <span className="info-label">Plate Number:</span>
                                        <span className="info-value">{selectedCar.plate_number}</span>
                                    </div>

                                    <div className="car-info-item">
                                        <span className="info-label">Transmission:</span>
                                        <span className="info-value">{selectedCar.transmission}</span>
                                    </div>

                                    <div className="car-info-item">
                                        <span className="info-label">Battery:</span>
                                        <span className="info-value battery">{selectedCar.battery_status}</span>
                                    </div>

                                    <div className="car-info-item">
                                        <span className="info-label">Capacity:</span>
                                        <span className="info-value">{selectedCar.battery_capacity}</span>
                                    </div>

                                    <div className="car-info-item">
                                        <span className="info-label">Range:</span>
                                        <span className="info-value">{selectedCar.range_km} km</span>
                                    </div>

                                    <div className="car-info-item full-width">
                                        <span className="info-label">Status:</span>
                                        <span className={`info-value status ${selectedCar.status === 'Available' ? 'available' : 'unavailable'}`}>
                                            {selectedCar.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="car-description">
                                    <span className="info-label">Description:</span>
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

export default Booking4Seater;
