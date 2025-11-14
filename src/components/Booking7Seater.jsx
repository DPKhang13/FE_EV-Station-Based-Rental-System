import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useVehicles } from '../hooks/useVehicles';
import { useVehicleTimelines } from '../hooks/useVehicleTimelines';
import { AuthContext } from '../context/AuthContext';
import { validateVehicleForBooking } from '../utils/vehicleValidator';
import './Booking7Seater.css';

// Import ảnh xe theo brand và màu
// BMW 7-seater
import bmw7Black from '../assets/BMW7/black.jpg';
import bmw7White from '../assets/BMW7/white.jpg';
import bmw7Silver from '../assets/BMW7/silver.jpg';
import bmw7Blue from '../assets/BMW7/blue.jpg';
import bmw7Red from '../assets/BMW7/red.jpg';

// Tesla 7-seater
import tesla7Black from '../assets/Tes7/black.jpg';
import tesla7White from '../assets/Tes7/white.jpg';
import tesla7Silver from '../assets/Tes7/silver.jpg';
import tesla7Blue from '../assets/Tes7/blue.jpg';
import tesla7Red from '../assets/Tes7/red.jpg';

// VinFast 7-seater
import vinfast7Black from '../assets/Vin7/black.jpg';
import vinfast7White from '../assets/Vin7/white.jpg';
import vinfast7Silver from '../assets/Vin7/silver.jpg';
import vinfast7Blue from '../assets/Vin7/blue.jpg';
import vinfast7Red from '../assets/Vin7/red.jpg';

const Booking7Seater = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { vehicles: cars, loading } = useVehicles();
    const preSelectedCar = location.state?.car;
    const gradeFilter = location.state?.gradeFilter; // For filtering by grade from Offers

    // Mapping ảnh xe theo brand và màu
    const getCarImageByBrandAndColor = (brand, color) => {
        // Nếu xe có sẵn image từ API, dùng luôn
        // if (selectedCar?.image) return selectedCar.image;

        if (!brand || !color) return null; // Hoặc return default image

        const brandLower = brand.toLowerCase();
        const colorLower = color.toLowerCase();

        // Object chứa mapping ảnh theo brand và color
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

        return null; // Hoặc return default image
    };
    // ✅ Sử dụng hook mới để fetch timeline cho tất cả xe
    const { 
        getVehicleTimeline, 
        hasOverlap, 
        getTimelineMessage,
        loading: timelinesLoading 
    } = useVehicleTimelines(cars);

    const [selectedCarId, setSelectedCarId] = useState(preSelectedCar?.id || '');
    const [selectedCar, setSelectedCar] = useState(preSelectedCar || null);
    // const [submitting, setSubmitting] = useState(false);
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');
    const [bookedSlots, setBookedSlots] = useState([]); // ✅ Timeline của xe đã chọn


    const [formData, setFormData] = useState({
        startTime: '',
        plannedHours: '',
        couponCode: ''
    });

    // Filter 7-seater available cars, optionally by grade and color
    const availableCars = cars.filter(car => {
        const isSevenSeater = car.type === '7-seater';
        const isAvailable = car.status === 'Available';
        // ✅ HIỂN THỊ TẤT CẢ XE (kể cả BOOKED/RENTAL/CHECKING)
        // Timeline sẽ được check để disable các khung giờ đã book
        const matchesGrade = gradeFilter ? car.grade === gradeFilter : true;
        const matchesColor = selectedColor ? car.color === selectedColor : true;

        const matchesBrand = selectedBrand ? (car.brand === selectedBrand || car.vehicle_name?.includes(selectedBrand)) : true;
        return isSevenSeater && isAvailable && matchesGrade && matchesColor && matchesBrand;
    });

    // Get unique brands from 7-seater available cars
    const availableBrands = [...new Set(
        cars.filter(car =>
            car.type === '7-seater' &&
            car.status === 'Available' &&
            car.brand &&
            (!gradeFilter || car.grade === gradeFilter)
        ).map(car => car.brand)
    )].filter(brand => ['BMW', 'Tesla', 'VinFast'].includes(brand)).sort();

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

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };


    // Auto-select car when both color and brand are selected
    useEffect(() => {
        if (selectedColor && selectedBrand && availableCars.length > 0) {
            const firstMatchingCar = availableCars[0];
            const vehicleId = firstMatchingCar.vehicleId || firstMatchingCar.id;
            setSelectedCarId(vehicleId);
            setSelectedCar(firstMatchingCar);
            
            // ✅ Lấy timeline từ hook khi auto-select
            const timeline = getVehicleTimeline(vehicleId);
            setBookedSlots(timeline);
        } else if (!selectedColor || !selectedBrand) {
            setSelectedCarId('');
            setSelectedCar(null);
            setBookedSlots([]);
        }
    }, [selectedColor, selectedBrand, availableCars, getVehicleTimeline]);

    const handleCarSelect = (e) => {
        const carId = e.target.value;
        console.log('🚗 Đã chọn xe ID:', carId);
        setSelectedCarId(carId);
        
        if (carId) {
            const car = availableCars.find(c => c.id === parseInt(carId) || c.vehicleId === parseInt(carId));
            setSelectedCar(car);
            
            // ✅ Lấy timeline từ hook (đã được fetch sẵn)
            if (car) {
                const vehicleId = car.vehicleId || car.id || carId;
                const timeline = getVehicleTimeline(vehicleId);
                console.log("📦 Timeline từ hook:", timeline);
                setBookedSlots(timeline);
            }
        } else {
            setSelectedCar(null);
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
                ` Xe này không thể đặt do thiếu thông tin:\n\n${validation.errors.join('\n')}\n\n` +
                `Vui lòng chọn xe khác hoặc liên hệ hỗ trợ.\n\n` +
                `Vehicle ID: ${selectedCar.id || selectedCar.vehicleId}\n` +
                `Vehicle Name: ${selectedCar.vehicle_name}\n` +
                `Status: ${selectedCar.status}\n\n` +
                `Chi tiết lỗi đã được log ra console.`
            );
            return;
        }

        console.log('✅ Vehicle validation passed:', selectedCar.id, selectedCar.vehicle_name);

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

        // ✅ CHECK OVERLAP với timeline (xe đã được book trong khoảng thời gian này)
        const vehicleId = selectedCar.vehicleId || selectedCar.id;
        const hasOverlapWithTimeline = hasOverlap(vehicleId, formData.startTime, end.toISOString());

        if (hasOverlapWithTimeline) {
            alert(
                '⚠️ Xe này đã được đặt trong khoảng thời gian bạn chọn!\n\n' +
                'Vui lòng:\n' +
                '1. Chọn thời gian khác\n' +
                '2. Hoặc chọn xe khác'
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

        // 6. Convert datetime to backend format (add seconds)
        const startTimeFormatted = formData.startTime
            .replace('T', ' ')  // Đổi T thành dấu cách
            + ':00';  // Thêm giây

        // 7. Calculate end time from start time + planned hours
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
            <h1 className="booking-title">Đặt Xe 7 Chỗ</h1>

            <div className="booking-content">
                {/* Left side - Booking Form */}
                <div className="booking-form-section">
                    <form onSubmit={handleSubmit} className="booking-form">
                        {/* Color Filter - Color Boxes */}
                        {!preSelectedCar && availableColors.length > 0 && (
                            <div className="form-group">
                                <label>Chọn Màu</label>
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

                        {/* Brand Selector */}
                        {!preSelectedCar && availableBrands.length > 0 && (
                            <div className="form-group">
                                <label>Chọn Hãng Xe</label>
                                <select
                                    value={selectedBrand}
                                    onChange={(e) => {
                                        const brand = e.target.value;
                                        setSelectedBrand(brand);
                                        if (!brand) {
                                            setSelectedCarId('');
                                            setSelectedCar(null);
                                            setBookedSlots([]);
                                        }
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: '1px solid #e5e7eb',
                                        fontSize: '14px',
                                        marginTop: '8px'
                                    }}
                                >
                                    <option value="">-- Chọn hãng xe --</option>
                                    {availableBrands.map((brand) => (
                                        <option key={brand} value={brand}>
                                            {brand}
                                        </option>
                                    ))}
                                </select>
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
                                {availableCars.map(car => {
                                    const vehicleId = car.vehicleId || car.id;
                                    const timelineMsg = getTimelineMessage(vehicleId);
                                    const brand = car.brand || car.vehicle_name?.split(' ')[0] || '';
                                    
                                    return (
                                        <option key={vehicleId} value={vehicleId}>
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
                                src={getCarImageByBrandAndColor(selectedCar.brand, selectedCar.color) || selectedCar.image}
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
