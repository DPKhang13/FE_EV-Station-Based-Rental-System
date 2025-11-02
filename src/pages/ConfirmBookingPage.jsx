import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { orderService } from '../services';
import './ConfirmBookingPage.css';

const ConfirmBookingPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const bookingData = location.state?.bookingData;
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Redirect nếu không có booking data
        if (!bookingData) {
            alert('No booking data found. Redirecting...');
            navigate('/');
        }
    }, [bookingData, navigate]);

    const handleConfirmBooking = async () => {
        setLoading(true);
        try {
            // Get customerId as UUID string (don't parse to int!)
            const customerId = bookingData.orderData.customerId;
            const vehicleId = parseInt(bookingData.orderData.vehicleId);
            const plannedHours = parseInt(bookingData.orderData.plannedHours);

            // Validate required fields
            // ✅ KHÔNG cần validate customerId - Backend lấy từ JWT token
            if (!vehicleId || isNaN(vehicleId)) {
                throw new Error('Invalid vehicle ID');
            }
            if (!plannedHours || isNaN(plannedHours) || plannedHours <= 0) {
                throw new Error('Invalid planned hours');
            }

            // ⚠️ IMPORTANT: Backend KHÔNG cần customerId và endTime
            // Backend lấy customerId từ JWT token
            // Backend tự tính endTime = startTime + plannedHours

            // ✅ FIX: Dùng startTime đã được format sẵn từ Booking4Seater
            // Format: "2025-11-03 07:11:00" (có dấu SPACE, có giây)
            const startTimeFormatted = bookingData.startTime || bookingData.orderData.startTime;

            console.log('🕐 DateTime data:');
            console.log('  bookingData.startTime:', bookingData.startTime);
            console.log('  orderData.startTime:', bookingData.orderData.startTime);
            console.log('  ✅ Using:', startTimeFormatted);

            // ✅ PAYLOAD - Backend lấy customerId từ JWT token
            const cleanedOrderData = {
                // ❌ KHÔNG gửi customerId - Backend tự lấy từ JWT
                vehicleId: vehicleId,
                startTime: startTimeFormatted,  // ✅ "2025-11-03 07:11:00" (dấu space)
                plannedHours: plannedHours,
                // ❌ KHÔNG gửi endTime - Backend tự tính
            };

            // Only include couponCode if it has a value
            if (bookingData.orderData.couponCode && bookingData.orderData.couponCode.trim() !== '') {
                cleanedOrderData.couponCode = bookingData.orderData.couponCode.trim();
            }

            console.log('📤 Creating order with cleaned data:');
            console.log('  vehicleId:', cleanedOrderData.vehicleId, '(type:', typeof cleanedOrderData.vehicleId + ')');
            console.log('  startTime:', cleanedOrderData.startTime, '(format: YYYY-MM-DD HH:mm:ss)');
            console.log('  plannedHours:', cleanedOrderData.plannedHours, '(type:', typeof cleanedOrderData.plannedHours + ')');
            console.log('  couponCode:', cleanedOrderData.couponCode || '(null)');
            console.log('Full JSON:', JSON.stringify(cleanedOrderData, null, 2));
            console.log('✅ Backend sẽ tự động:');
            console.log('  - Lấy customerId từ JWT token (SecurityContext)');
            console.log('  - Tính endTime = startTime + plannedHours');

            const response = await orderService.create(cleanedOrderData);
            console.log('✅ Order created successfully:', response);

            // Show success message with order details
            const successMessage = `Booking confirmed successfully! 🎉

Order ID: ${response.orderId || 'N/A'}
Vehicle ID: ${response.vehicleId || vehicleId}
Status: ${response.status || 'PENDING'}
Total Price: ${response.totalPrice ? response.totalPrice.toLocaleString() + ' VND' : 'To be calculated'}

You can view and manage your booking in "My Bookings" page.`;

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

            let errorMsg = 'Failed to create booking. Please try again.';

            // Extract meaningful error message
            if (error.message?.includes('Invalid')) {
                errorMsg = error.message;
            } else if (error.message?.includes('HTTP 500')) {
                errorMsg = `Server error occurred. This could be due to:
- Customer ID (${bookingData.orderData.customerId}) not found in database
- Vehicle ID (${bookingData.orderData.vehicleId}) not available
- Invalid coupon code
- Database connection issue

Please contact support or try again later.`;
            } else if (error.response?.data?.message) {
                errorMsg = error.response.data.message;
            } else if (error.message) {
                errorMsg = error.message;
            }

            alert(`❌ ${errorMsg}\n\nPlease check the console for more details.`);
        } finally {
            setLoading(false);
        }
    };

    if (!bookingData) {
        return (
            <div style={{ padding: '100px 20px', textAlign: 'center' }}>
                <p>Loading...</p>
            </div>
        );
    }

    const { car, orderData, plannedHours } = bookingData;

    return (
        <div className="confirm-booking-page">
            <div className="confirm-container">
                <h1 className="confirm-title">Confirm Your Booking</h1>
                <p className="confirm-subtitle">Please review all details before confirming</p>

                <div className="confirm-content">
                    {/* Car Details */}
                    <div className="confirm-section car-details">
                        <h2>🚗 Vehicle Information</h2>
                        <div className="car-info-grid">
                            <img src={car.image} alt={car.vehicle_name} className="car-image" />
                            <div className="car-info">
                                <h3>{car.vehicle_name}</h3>
                                <div className="info-row">
                                    <span className="label">Brand:</span>
                                    <span className="value">{car.brand}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Type:</span>
                                    <span className="value">{car.type}</span>
                                </div>
                                {car.grade && (
                                    <div className="info-row">
                                        <span className="label">Grade:</span>
                                        <span className="value">{car.grade}</span>
                                    </div>
                                )}
                                <div className="info-row">
                                    <span className="label">Color:</span>
                                    <span className="value">{car.color}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Plate Number:</span>
                                    <span className="value">{car.plate_number}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Seats:</span>
                                    <span className="value">{car.seat_count} seats</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Battery:</span>
                                    <span className="value">{car.battery_status} ({car.battery_capacity})</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Range:</span>
                                    <span className="value">{car.range_km} km</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Booking Details */}
                    <div className="confirm-section booking-details">
                        <h2>📅 Booking Details</h2>
                        <div className="details-grid">
                            <div className="detail-item">
                                <span className="label">Pick-up Date & Time:</span>
                                <span className="value highlight">
                                    {bookingData.startTime || 'N/A'}
                                </span>
                            </div>
                            <div className="detail-item">
                                <span className="label">Return Date & Time:</span>
                                <span className="value highlight">
                                    {bookingData.endTime || 'N/A'}
                                </span>
                            </div>
                            <div className="detail-item">
                                <span className="label">Planned Duration:</span>
                                <span className="value">{plannedHours} hours</span>
                            </div>
                            {orderData.couponCode && (
                                <div className="detail-item">
                                    <span className="label">Coupon Code:</span>
                                    <span className="value coupon">{orderData.couponCode}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="confirm-section customer-info">
                        <h2>👤 Customer Information</h2>
                        <div className="details-grid">
                            <div className="detail-item">
                                <span className="label">Customer Name:</span>
                                <span className="value">{bookingData.customerName || user?.fullName || user?.username || 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="label">Phone Number:</span>
                                <span className="value">{bookingData.customerPhone || user?.phoneNumber || user?.phone || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="confirm-section summary">
                        <h2>💰 Booking Summary</h2>
                        <div className="summary-item">
                            <span className="label">Rental Duration:</span>
                            <span className="value">{plannedHours} hours</span>
                        </div>
                        <div className="summary-item">
                            <span className="label">Status:</span>
                            <span className="value status-pending">PENDING</span>
                        </div>
                        <p className="summary-note">
                            💡 <strong>Note:</strong> The final price will be calculated by the system based on rental duration, vehicle type, and any applicable discounts.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="confirm-actions">
                        <button
                            onClick={() => navigate(-1)}
                            className="btn-back"
                            disabled={loading}
                        >
                            ← Back to Edit
                        </button>
                        <button
                            onClick={handleConfirmBooking}
                            className="btn-confirm"
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Confirm Booking ✓'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmBookingPage;
