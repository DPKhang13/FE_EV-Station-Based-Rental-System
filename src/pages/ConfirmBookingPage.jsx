import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { orderService } from '../services';
import './ConfirmBookingPage.css';

// Import car images by color
import car4SeatBlack from '../assets/4seatblack.png';
import car4SeatBlue from '../assets/4seatblue.png';
import car4SeatRed from '../assets/4seatred.png';
import car4SeatSilver from '../assets/4seatsilver.png';
import car4SeatWhite from '../assets/4seatwhite.png';

const ConfirmBookingPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const bookingData = location.state?.bookingData;
    const [loading, setLoading] = useState(false);

    // Function to get car image based on color
    const getCarImageByColor = (color, seatCount) => {
        if (!color || seatCount !== 4) return null; // Only apply for 4-seater

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
        }
        return null; // Use default car.image if no match
    };

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Redirect nếu không có booking data
        if (!bookingData) {
            alert('Không tìm thấy dữ liệu đặt xe. Đang chuyển hướng...');
            navigate('/');
        }
    }, [bookingData, navigate]);

    const handleConfirmBooking = async () => {
        setLoading(true);
        try {
            // ✅ Kiểm tra JWT token trước khi gửi request
            const token = localStorage.getItem('accessToken');
            console.log('🔑 [ConfirmBooking] Checking auth:');
            console.log('  - Has token:', !!token);
            console.log('  - Token length:', token ? token.length : 0);
            console.log('  - User from context:', user);

            if (!token) {
                alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                navigate('/login');
                return;
            }

            // ✅ Decode JWT để kiểm tra exp time
            try {
                const tokenParts = token.split('.');
                if (tokenParts.length === 3) {
                    const payload = JSON.parse(atob(tokenParts[1]));
                    const exp = payload.exp;
                    const now = Math.floor(Date.now() / 1000);
                    const timeLeft = exp - now;

                    console.log('🔍 [JWT] Token info:');
                    console.log('  - Subject:', payload.sub);
                    console.log('  - Expires at:', new Date(exp * 1000).toLocaleString());
                    console.log('  - Time left:', timeLeft, 'seconds');
                    console.log('  - Is expired:', timeLeft <= 0);

                    if (timeLeft <= 0) {
                        alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                        navigate('/login');
                        return;
                    }
                }
            } catch (e) {
                console.error('❌ Failed to decode JWT:', e);
            }

            // ✅ Extract và validate các fields cần thiết
            const vehicleIdRaw = bookingData.orderData.vehicleId;
            const plannedHoursRaw = bookingData.orderData.plannedHours;
            const startTimeRaw = bookingData.startTime || bookingData.orderData.startTime;

            console.log('🔍 [ConfirmBooking] RAW booking data:');
            console.log('  - vehicleId:', vehicleIdRaw, '| type:', typeof vehicleIdRaw);
            console.log('  - plannedHours:', plannedHoursRaw, '| type:', typeof plannedHoursRaw);
            console.log('  - startTime:', startTimeRaw, '| type:', typeof startTimeRaw);

            // ✅ Parse số an toàn
            const vehicleId = Number(vehicleIdRaw);
            const plannedHours = Number(plannedHoursRaw);

            console.log('✅ [ConfirmBooking] PARSED values:');
            console.log('  - vehicleId:', vehicleId, '| type:', typeof vehicleId, '| valid:', !isNaN(vehicleId));
            console.log('  - plannedHours:', plannedHours, '| type:', typeof plannedHours, '| valid:', !isNaN(plannedHours));

            // Validate required fields
            if (!vehicleId || isNaN(vehicleId)) {
                throw new Error('Mã xe không hợp lệ');
            }
            if (!plannedHours || isNaN(plannedHours) || plannedHours <= 0) {
                throw new Error('Số giờ thuê không hợp lệ');
            }
            if (!startTimeRaw) {
                throw new Error('Thời gian nhận xe không được để trống');
            }

            // ✅ THÊM: Verify vehicle data
            console.log('✅ [ConfirmBooking] Vehicle validation passed:');
            console.log('  - Vehicle ID:', vehicleId);
            console.log('  - Vehicle Name:', bookingData.car.vehicle_name);
            console.log('  - Vehicle Status:', bookingData.car.status);
            console.log('  - Plate Number:', bookingData.car.plate_number);

            let startTimeFormatted = startTimeRaw;

            // ✅ SAFETY: Nếu vẫn còn 'T' trong string, tự động fix
            if (startTimeFormatted.includes('T')) {
                console.warn('⚠️ startTime contains "T", auto-fixing to space format');
                startTimeFormatted = startTimeFormatted.replace('T', ' ');

                // Thêm giây nếu chưa có
                if (!startTimeFormatted.match(/:\d{2}:\d{2}$/)) {
                    startTimeFormatted = startTimeFormatted + ':00';
                }
            }

            console.log('🕐 DateTime data:');
            console.log('  Raw:', startTimeRaw);
            console.log('  ✅ Formatted:', startTimeFormatted);

            const cleanedOrderData = {
                vehicleId: vehicleId,
                startTime: startTimeFormatted,
                plannedHours: plannedHours  // ✅ FIX: Thêm plannedHours vào payload
            };

            // Only include couponCode if it has a value
            if (bookingData.orderData.couponCode && bookingData.orderData.couponCode.trim() !== '') {
                cleanedOrderData.couponCode = bookingData.orderData.couponCode.trim();
            }

            console.log('✅ NOT sending customerId - backend extracts it from JWT token');

            console.log('📤 [ConfirmBooking] FINAL payload to send:');
            console.log('  vehicleId:', cleanedOrderData.vehicleId, '| type:', typeof cleanedOrderData.vehicleId);
            console.log('  startTime:', cleanedOrderData.startTime, '| type:', typeof cleanedOrderData.startTime);
            console.log('  plannedHours:', cleanedOrderData.plannedHours, '| type:', typeof cleanedOrderData.plannedHours);
            console.log('  couponCode:', cleanedOrderData.couponCode || '(not included)');
            console.log('📋 Full JSON:', JSON.stringify(cleanedOrderData, null, 2));

            // ✅ VALIDATE: Đảm bảo tất cả types đúng
            if (typeof cleanedOrderData.vehicleId !== 'number' || isNaN(cleanedOrderData.vehicleId)) {
                console.error('❌ vehicleId validation failed:', cleanedOrderData.vehicleId);
                throw new Error(`Mã xe không hợp lệ. Vui lòng thử lại.`);
            }
            if (typeof cleanedOrderData.plannedHours !== 'number' || isNaN(cleanedOrderData.plannedHours)) {
                console.error('❌ plannedHours validation failed:', cleanedOrderData.plannedHours);
                throw new Error(`Số giờ thuê không hợp lệ. Vui lòng thử lại.`);
            }
            if (typeof cleanedOrderData.startTime !== 'string' || !cleanedOrderData.startTime.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
                console.error('❌ startTime validation failed:', cleanedOrderData.startTime);
                console.error('❌ Expected format: "YYYY-MM-DD HH:mm:ss"');
                console.error('❌ Got:', cleanedOrderData.startTime);
                throw new Error(`Thời gian không đúng định dạng. Định dạng yêu cầu: "YYYY-MM-DD HH:mm:ss", nhưng nhận được: "${cleanedOrderData.startTime}"`);
            }

            console.log('✅ All field types validated successfully!');

            const response = await orderService.create(cleanedOrderData);
            console.log('✅ Order created successfully:', response);

            // Show success message with order details
            const successMessage = `Đặt xe thành công! 🎉

Mã đơn hàng: ${response.orderId || 'N/A'}
Mã xe: ${response.vehicleId || vehicleId}
Trạng thái: ${response.status || 'CHỜ XỬ LÝ'}
Tổng giá: ${response.totalPrice ? response.totalPrice.toLocaleString() + ' VND' : 'Đang tính toán'}

Bạn có thể xem và quản lý đơn đặt xe trong trang "Đơn Đặt Xe".`;

            alert(successMessage);

            // Navigate to My Bookings
            navigate('/my-bookings');
        } catch (error) {
            console.error('❌ Booking error:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response,
                data: error.response?.data
            });

            let errorMsg = 'Không thể tạo đơn đặt xe. Vui lòng thử lại.';

            // Extract meaningful error message
            if (error.message?.includes('Invalid')) {
                errorMsg = error.message;
            } else if (error.message?.includes('HTTP 500')) {
                // ✅ IMPROVED: More detailed error info
                console.error('🔴 [ConfirmBooking] 500 Error Details:');
                console.error('  Response:', error.response?.data);
                console.error('  Status:', error.response?.status);
                console.error('  Headers:', error.response?.headers);

                const backendError = error.response?.data;

                errorMsg = `❌ Lỗi từ server (500 Internal Server Error)

📋 Dữ liệu đã gửi:
- Vehicle ID: ${bookingData.orderData.vehicleId}
- Vehicle Name: ${bookingData.car.vehicle_name}
- Plate: ${bookingData.car.plate_number}
- Start Time: ${bookingData.orderData.startTime}
- Planned Hours: ${bookingData.orderData.plannedHours}
${bookingData.orderData.couponCode ? `- Coupon: ${bookingData.orderData.couponCode}` : ''}

🔴 Backend Error:
${backendError?.message || 'Unknown error'}

⚠️ Nguyên nhân có thể:
${backendError?.message === 'Unexpected error' ? `
🔸 JWT Token không hợp lệ hoặc hết hạn
🔸 Backend không thể extract customer từ token
🔸 Xe ID ${bookingData.orderData.vehicleId} không tồn tại
🔸 Database connection error
🔸 Backend thiếu configuration

💡 Giải pháp:
1. Thử ĐĂNG XUẤT và ĐĂNG NHẬP lại
2. Clear cache và cookies của trình duyệt
3. Kiểm tra backend console log để xem chi tiết lỗi
4. Thử chọn xe khác
5. Liên hệ admin nếu vấn đề vẫn còn` : `
1. Xe đã được đặt bởi người khác
2. Trạng thái xe không "Available"
3. Coupon không hợp lệ
4. Thời gian đặt không hợp lệ`}`;
            } else if (error.response?.data?.message) {
                errorMsg = error.response.data.message;
            } else if (error.message) {
                errorMsg = error.message;
            }

            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (!bookingData) {
        return (
            <div style={{ padding: '100px 20px', textAlign: 'center' }}>
                <p>Đang tải...</p>
            </div>
        );
    }

    const { car, orderData, plannedHours } = bookingData;

    return (
        <div className="confirm-booking-page">
            <div className="confirm-container">
                <h1 className="confirm-title">Xác Nhận Đặt Xe</h1>
                <p className="confirm-subtitle">Vui lòng kiểm tra tất cả thông tin trước khi xác nhận</p>

                <div className="confirm-content">
                    {/* Car Details */}
                    <div className="confirm-section car-details">
                        <h2>🚗 Thông Tin Xe</h2>
                        <div className="car-info-grid">
                            <img
                                src={getCarImageByColor(car.color, car.seat_count) || car.image}
                                alt={car.vehicle_name}
                                className="car-image"
                            />
                            <div className="car-info">
                                <h3>{car.vehicle_name}</h3>
                                <div className="info-row">
                                    <span className="label">Hãng:</span>
                                    <span className="value">{car.brand}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Loại:</span>
                                    <span className="value">{car.type}</span>
                                </div>
                                {car.grade && (
                                    <div className="info-row">
                                        <span className="label">Hạng:</span>
                                        <span className="value">{car.grade}</span>
                                    </div>
                                )}
                                <div className="info-row">
                                    <span className="label">Màu:</span>
                                    <span className="value">{car.color}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Biển số:</span>
                                    <span className="value">{car.plate_number}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Số chỗ:</span>
                                    <span className="value">{car.seat_count} chỗ</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Pin:</span>
                                    <span className="value">{car.battery_status} ({car.battery_capacity})</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Quãng đường:</span>
                                    <span className="value">{car.range_km} km</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Booking Details */}
                    <div className="confirm-section booking-details">
                        <h2>📅 Chi Tiết Đặt Xe</h2>
                        <div className="details-grid">
                            <div className="detail-item">
                                <span className="label">Ngày & Giờ Nhận Xe:</span>
                                <span className="value highlight">
                                    {bookingData.startTime || 'N/A'}
                                </span>
                            </div>
                            <div className="detail-item">
                                <span className="label">Ngày & Giờ Trả Xe:</span>
                                <span className="value highlight">
                                    {bookingData.endTime || 'N/A'}
                                </span>
                            </div>
                            <div className="detail-item">
                                <span className="label">Thời Gian Thuê:</span>
                                <span className="value">{plannedHours} giờ</span>
                            </div>
                            {orderData.couponCode && (
                                <div className="detail-item">
                                    <span className="label">Mã Giảm Giá:</span>
                                    <span className="value coupon">{orderData.couponCode}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="confirm-section customer-info">
                        <h2>👤 Thông Tin Khách Hàng</h2>
                        <div className="details-grid">
                            <div className="detail-item">
                                <span className="label">Tên Khách Hàng:</span>
                                <span className="value">{bookingData.customerName || user?.fullName || user?.username || 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="label">Số Điện Thoại:</span>
                                <span className="value">{bookingData.customerPhone || user?.phoneNumber || user?.phone || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="confirm-section summary">
                        <h2>💰 Tóm Tắt Đặt Xe</h2>
                        <div className="summary-item">
                            <span className="label">Thời Gian Thuê:</span>
                            <span className="value">{plannedHours} giờ</span>
                        </div>
                        <div className="summary-item">
                            <span className="label">Trạng Thái:</span>
                            <span className="value status-pending">CHỜ XỬ LÝ</span>
                        </div>
                        <div className="summary-note">
                            <div className="note-icon">💡</div>
                            <div className="note-content">
                                <strong>Lưu ý:</strong> Giá cuối cùng sẽ được hệ thống tính toán dựa trên thời gian thuê, loại xe và các ưu đãi áp dụng.
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="confirm-actions">
                        <button
                            onClick={() => navigate(-1)}
                            className="btn-back"
                            disabled={loading}
                        >
                            ← Quay Lại Chỉnh Sửa
                        </button>
                        <button
                            onClick={handleConfirmBooking}
                            className="btn-confirm"
                            disabled={loading}
                        >
                            {loading ? 'Đang xử lý...' : 'Xác Nhận Đặt Xe ✓'}
                        </button>
                    </div>

                    {/* Debug Info */}
                    <div style={{ marginTop: '20px', padding: '15px', background: '#f0f0f0', borderRadius: '8px', fontSize: '13px' }}>
                        <strong>🔍 Thông Tin Debug:</strong><br />
                        - Có Token: {!!localStorage.getItem('accessToken') ? '✅ CÓ' : '❌ KHÔNG - CẦN ĐĂNG NHẬP'}<br />
                        - Người dùng: {user ? `${user.name} (${user.role})` : '❌ Chưa đăng nhập'}<br />
                        - ID Người dùng: {user?.userId || 'N/A'}<br />
                        {!localStorage.getItem('accessToken') && (
                            <div style={{ marginTop: '10px', padding: '10px', background: '#ffebee', borderRadius: '4px' }}>
                                <strong style={{ color: '#c62828' }}>⚠️ BẠN CHƯA ĐĂNG NHẬP!</strong><br />
                                <button
                                    onClick={() => navigate('/login')}
                                    style={{ marginTop: '8px', padding: '8px 16px', background: '#1976d2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    Đi đến Trang Đăng Nhập
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmBookingPage;
