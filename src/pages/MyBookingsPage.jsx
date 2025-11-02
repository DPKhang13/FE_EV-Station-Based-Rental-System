import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../services';
import './MyBookingsPage.css';

const MyBookingsPage = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // all, pending, confirmed, completed, cancelled

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Check if user is logged in
        const token = localStorage.getItem('accessToken');
        const user = localStorage.getItem('user');

        console.log('🔍 [MyBookings] Checking auth:', {
            hasToken: !!token,
            hasUser: !!user
        });

        if (!token || !user) {
            alert('Please login to view your bookings');
            navigate('/login');
            return;
        }

        loadMyBookings();
    }, [navigate]);

    const loadMyBookings = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('📥 [MyBookings] Fetching orders...');

            // Try to get orders, handle errors gracefully
            let orders = [];
            try {
                orders = await orderService.getMyOrders();
                console.log('📦 [MyBookings] Raw response:', orders);
            } catch (apiErr) {
                console.error('❌ API Error details:', {
                    message: apiErr.message,
                    response: apiErr.response?.data,
                    status: apiErr.response?.status
                });

                // If HTTP 500 or any server error, show empty bookings
                if (apiErr.response?.status >= 500 ||
                    apiErr.message?.includes('500') ||
                    apiErr.message?.includes('Internal Server Error')) {
                    console.warn('⚠️ Server error detected, showing empty bookings');
                    console.warn('⚠️ This usually means you have no orders yet or backend needs to initialize data');
                    setBookings([]);
                    setLoading(false);
                    // Don't show error - just empty state
                    return;
                }

                // If 401/403, redirect to login
                if (apiErr.response?.status === 401 || apiErr.response?.status === 403) {
                    alert('Session expired. Please login again.');
                    localStorage.clear();
                    navigate('/login');
                    return;
                }

                throw apiErr; // Re-throw other errors
            }

            // Handle empty or null response
            if (!orders || !Array.isArray(orders)) {
                console.warn('⚠️ [MyBookings] Invalid response format:', orders);
                setBookings([]);
                setLoading(false);
                return;
            }

            // Sort by creation date (newest first)
            const sortedOrders = orders.sort((a, b) => {
                const dateA = new Date(a.createdAt || a.startTime);
                const dateB = new Date(b.createdAt || b.startTime);
                return dateB - dateA;
            });

            setBookings(sortedOrders);
            console.log('✅ [MyBookings] Loaded bookings:', sortedOrders.length, 'orders');
        } catch (err) {
            console.error('❌ [MyBookings] Unexpected error:', err);
            // Show empty bookings instead of error for better UX
            setBookings([]);
            console.warn('⚠️ Showing empty bookings due to error');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'PENDING': '#f59e0b',
            'CONFIRMED': '#3b82f6',
            'COMPLETED': '#10b981',
            'CANCELLED': '#ef4444',
            'IN_PROGRESS': '#8b5cf6'
        };
        return colors[status] || '#6b7280';
    };

    const getStatusIcon = (status) => {
        const icons = {
            'PENDING': '⏳',
            'CONFIRMED': '✓',
            'COMPLETED': '✅',
            'CANCELLED': '❌',
            'IN_PROGRESS': '🚗'
        };
        return icons[status] || '📋';
    };

    // Check if order is expiring (10 minutes from creation)
    const checkExpiry = (createdAt) => {
        const created = new Date(createdAt);
        const now = new Date();
        const diffMinutes = Math.floor((now - created) / (1000 * 60));

        if (diffMinutes >= 10) {
            return null; // Already expired
        }

        const remainingMinutes = 10 - diffMinutes;
        return `${remainingMinutes} phút`;
    };

    const handlePayment = (orderId) => {
        console.log('🔄 Navigating to payment page for order:', orderId);
        navigate(`/payment/${orderId}`);
    };

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) {
            return;
        }

        try {
            console.log('🗑️ Cancelling order:', orderId);
            await orderService.delete(orderId);
            alert('Đơn hàng đã được hủy thành công!');
            loadMyBookings(); // Reload bookings
        } catch (err) {
            console.error('❌ Error cancelling order:', err);
            alert('Không thể hủy đơn hàng: ' + (err.message || 'Unknown error'));
        }
    };

    const filteredBookings = bookings.filter(booking => {
        if (filter === 'all') return true;
        return booking.status?.toUpperCase() === filter.toUpperCase();
    });

    if (loading) {
        return (
            <div className="my-bookings-page">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading your bookings...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="my-bookings-page">
                <div className="error-container">
                    <h2>❌ Error</h2>
                    <p>{error}</p>
                    <button onClick={loadMyBookings} className="btn-retry">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="my-bookings-page">
            <div className="bookings-container">
                <div className="page-header">
                    <h1>📋 My Bookings</h1>
                    <p className="subtitle">
                        Total Bookings: <strong>{bookings.length}</strong>
                    </p>
                </div>

                {/* Filter Tabs */}
                <div className="filter-tabs">
                    <button
                        className={filter === 'all' ? 'tab active' : 'tab'}
                        onClick={() => setFilter('all')}
                    >
                        All ({bookings.length})
                    </button>
                    <button
                        className={filter === 'pending' ? 'tab active' : 'tab'}
                        onClick={() => setFilter('pending')}
                    >
                        Pending ({bookings.filter(b => b.status?.toUpperCase() === 'PENDING').length})
                    </button>
                    <button
                        className={filter === 'confirmed' ? 'tab active' : 'tab'}
                        onClick={() => setFilter('confirmed')}
                    >
                        Confirmed ({bookings.filter(b => b.status?.toUpperCase() === 'CONFIRMED').length})
                    </button>
                    <button
                        className={filter === 'completed' ? 'tab active' : 'tab'}
                        onClick={() => setFilter('completed')}
                    >
                        Completed ({bookings.filter(b => b.status?.toUpperCase() === 'COMPLETED').length})
                    </button>
                </div>

                {/* Bookings List */}
                {filteredBookings.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🚗</div>
                        <h2>No bookings found</h2>
                        <p>Start your journey by booking a vehicle!</p>
                        <button onClick={() => navigate('/location-select')} className="btn-book-now">
                            Book a Vehicle
                        </button>
                    </div>
                ) : (
                    <div className="bookings-list">
                        {filteredBookings.map((booking) => (
                            <div key={booking.orderId} className="booking-card">
                                <div className="card-header">
                                    <div className="order-id">
                                        <span className="label">Order #</span>
                                        <span className="value">{booking.orderId}</span>
                                    </div>
                                    <div
                                        className="status-badge"
                                        style={{ background: getStatusColor(booking.status) }}
                                    >
                                        {getStatusIcon(booking.status)} {booking.status}
                                    </div>
                                </div>

                                <div className="card-body">
                                    <div className="info-section">
                                        <h3>🚗 Vehicle Information</h3>
                                        <div className="info-grid">
                                            <div className="info-item">
                                                <span className="label">Vehicle ID:</span>
                                                <span className="value">{booking.vehicleId}</span>
                                            </div>
                                            {booking.vehicleName && (
                                                <div className="info-item">
                                                    <span className="label">Vehicle:</span>
                                                    <span className="value">{booking.vehicleName}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="info-section">
                                        <h3>📅 Rental Period</h3>
                                        <div className="info-grid">
                                            <div className="info-item">
                                                <span className="label">Pick-up:</span>
                                                <span className="value">
                                                    {new Date(booking.startTime).toLocaleString('vi-VN')}
                                                </span>
                                            </div>
                                            <div className="info-item">
                                                <span className="label">Return:</span>
                                                <span className="value">
                                                    {new Date(booking.endTime).toLocaleString('vi-VN')}
                                                </span>
                                            </div>
                                            <div className="info-item">
                                                <span className="label">Duration:</span>
                                                <span className="value">{booking.plannedHours || 0} hours</span>
                                            </div>
                                            {booking.actualHours && (
                                                <div className="info-item">
                                                    <span className="label">Actual Duration:</span>
                                                    <span className="value">{booking.actualHours} hours</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="info-section">
                                        <h3>💰 Payment</h3>
                                        <div className="info-grid">
                                            <div className="info-item">
                                                <span className="label">Total Price:</span>
                                                <span className="value price">
                                                    {booking.totalPrice
                                                        ? `${booking.totalPrice.toLocaleString()} VND`
                                                        : 'Calculating...'}
                                                </span>
                                            </div>
                                            {booking.couponCode && (
                                                <div className="info-item">
                                                    <span className="label">Coupon:</span>
                                                    <span className="value coupon">{booking.couponCode}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="card-actions">
                                        {booking.status === 'PENDING' && (
                                            <>
                                                <button
                                                    onClick={() => handlePayment(booking.orderId)}
                                                    className="btn-payment"
                                                >
                                                    💳 Thanh toán
                                                </button>
                                                <button
                                                    onClick={() => handleCancelOrder(booking.orderId)}
                                                    className="btn-cancel"
                                                >
                                                    ❌ Hủy đặt hàng
                                                </button>
                                            </>
                                        )}
                                        {booking.status === 'CONFIRMED' && (
                                            <span className="status-text">✅ Đã xác nhận - Chờ nhận xe</span>
                                        )}
                                        {booking.status === 'IN_PROGRESS' && (
                                            <span className="status-text">🚗 Đang thuê</span>
                                        )}
                                        {booking.status === 'COMPLETED' && (
                                            <span className="status-text">✅ Hoàn thành</span>
                                        )}
                                        {booking.status === 'CANCELLED' && (
                                            <span className="status-text">❌ Đã hủy</span>
                                        )}
                                    </div>

                                    {booking.createdAt && (
                                        <div className="card-footer">
                                            <span className="created-at">
                                                Created: {new Date(booking.createdAt).toLocaleString('vi-VN')}
                                            </span>
                                            {booking.status === 'PENDING' && checkExpiry(booking.createdAt) && (
                                                <span className="expiry-warning">
                                                    ⚠️ Đơn hàng sẽ hết hạn sau {checkExpiry(booking.createdAt)}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyBookingsPage;
