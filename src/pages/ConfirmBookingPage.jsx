import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { orderService } from '../services';
import './ConfirmBookingPage.css';

const ConfirmBookingPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
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
            // Ensure all numeric fields are proper integers
            const cleanedOrderData = {
                customerId: parseInt(bookingData.orderData.customerId),
                vehicleId: parseInt(bookingData.orderData.vehicleId),
                startTime: bookingData.orderData.startTime,
                endTime: bookingData.orderData.endTime,
                plannedHours: parseInt(bookingData.orderData.plannedHours),
                couponCode: bookingData.orderData.couponCode || null,
                actualHours: null
            };

            console.log('📤 Creating order with cleaned data:');
            console.log('  customerId:', cleanedOrderData.customerId, '(type:', typeof cleanedOrderData.customerId + ')');
            console.log('  vehicleId:', cleanedOrderData.vehicleId, '(type:', typeof cleanedOrderData.vehicleId + ')');
            console.log('  startTime:', cleanedOrderData.startTime);
            console.log('  endTime:', cleanedOrderData.endTime);
            console.log('  plannedHours:', cleanedOrderData.plannedHours, '(type:', typeof cleanedOrderData.plannedHours + ')');
            console.log('  couponCode:', cleanedOrderData.couponCode);
            console.log('  actualHours:', cleanedOrderData.actualHours);
            console.log('Full JSON:', JSON.stringify(cleanedOrderData, null, 2));

            const response = await orderService.create(cleanedOrderData);
            console.log('✅ Order created:', response);

            alert(`Booking confirmed successfully! 
Order ID: ${response.orderId}
Total Price: ${response.totalPrice ? response.totalPrice.toLocaleString() : 'N/A'} VND
Status: ${response.status}`);

            // Navigate to My Bookings
            navigate('/my-bookings');
        } catch (error) {
            console.error('❌ Booking error:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response,
                data: error.response?.data
            });

            const errorMsg = error.response?.data?.message
                || error.message
                || 'Unknown error occurred';

            alert(`Failed to create booking:\n\n${errorMsg}\n\nPlease check console for details.`);
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
                                    {new Date(orderData.startTime).toLocaleString('vi-VN', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                            <div className="detail-item">
                                <span className="label">Return Date & Time:</span>
                                <span className="value highlight">
                                    {new Date(orderData.endTime).toLocaleString('vi-VN', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
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
                                <span className="label">Customer ID:</span>
                                <span className="value">{orderData.customerId}</span>
                            </div>
                            <div className="detail-item">
                                <span className="label">Vehicle ID:</span>
                                <span className="value">{orderData.vehicleId}</span>
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
