import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { orderService, vehicleService, notificationService } from '../services';
import './MyBookingsPage.css';

const MyBookingsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelOrderId, setCancelOrderId] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [searchOrderId, setSearchOrderId] = useState('');

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });

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

        if (location.state?.highlightOrderId) {
            setTimeout(() => {
                const element = document.getElementById(`order-${location.state.highlightOrderId}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.classList.add('highlight-order');
                    setTimeout(() => element.classList.remove('highlight-order'), 3000);
                }
            }, 500);
        }
    }, [navigate, location]);

    const loadMyBookings = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('📥 [MyBookings] Fetching orders...');

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

                if (apiErr.response?.status >= 500 ||
                    apiErr.message?.includes('500') ||
                    apiErr.message?.includes('Internal Server Error')) {
                    console.warn('⚠️ Server error detected, showing empty bookings');
                    setBookings([]);
                    setLoading(false);
                    return;
                }

                if (apiErr.response?.status === 401 || apiErr.response?.status === 403) {
                    alert('Session expired. Please login again.');
                    localStorage.clear();
                    navigate('/login');
                    return;
                }

                throw apiErr;
            }

            if (!orders || !Array.isArray(orders)) {
                console.warn('⚠️ [MyBookings] Invalid response format:', orders);
                setBookings([]);
                setLoading(false);
                return;
            }

            // ✅ Fetch thêm thông tin xe (tên xe, biển số) từ vehicle API
            try {
                console.log('🚗 [MyBookings] Fetching vehicle details...');
                const vehicles = await vehicleService.getVehicles();
                console.log('📦 [MyBookings] Vehicles loaded:', vehicles.length);

                // Map vehicle info vào orders
                const enrichedOrders = orders.map(order => {
                    const vehicle = vehicles.find(v => v.vehicleId === order.vehicleId);
                    if (vehicle) {
                        return {
                            ...order,
                            vehicleName: vehicle.vehicleName,
                            plateNumber: vehicle.plateNumber,
                            vehicleColor: vehicle.color,
                            vehicleType: vehicle.seatCount >= 7 ? '7-seater' : '4-seater'
                        };
                    }
                    return order;
                });

                const sortedOrders = enrichedOrders.sort((a, b) => {
                    const dateA = new Date(a.createdAt || a.startTime);
                    const dateB = new Date(b.createdAt || b.startTime);
                    return dateB - dateA;
                });

                setBookings(sortedOrders);
                console.log('✅ [MyBookings] Loaded bookings with vehicle info:', sortedOrders.length, 'orders');
            } catch (vehicleErr) {
                console.error('⚠️ [MyBookings] Failed to load vehicle details:', vehicleErr);
                // Fallback: Vẫn hiển thị orders nhưng không có thông tin xe
                const sortedOrders = orders.sort((a, b) => {
                    const dateA = new Date(a.createdAt || a.startTime);
                    const dateB = new Date(b.createdAt || b.startTime);
                    return dateB - dateA;
                });
                setBookings(sortedOrders);
                console.log('[MyBookings] Loaded bookings (without vehicle details):', sortedOrders.length, 'orders');
            }
        } catch (err) {
            console.error('[MyBookings] Unexpected error:', err);
            setBookings([]);
            console.warn('Showing empty bookings due to error');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (booking) => {
        console.log('👁️ [MyBookings] View details:', booking);
        setSelectedBooking(booking);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedBooking(null);
    };

    const getStatusColor = (status) => {
        const colors = {
            'PENDING': '#f59e0b',
            'PENDING_DEPOSIT': '#f59e0b',
            'DEPOSITED': '#3b82f6',
            'CONFIRMED': '#3b82f6',
            'PAID': '#10b981',
            'COMPLETED': '#10b981',
            'CANCELLED': '#ef4444',
            'PAYMENT_FAILED': '#ef4444',
            'IN_PROGRESS': '#8b5cf6'
        };
        return colors[status] || '#6b7280';
    };

    const getStatusIcon = (status) => {
        const icons = {
            'PENDING': '',
            'PENDING_DEPOSIT': '',
            'DEPOSITED': '',
            'CONFIRMED': '',
            'PAID': '',
            'COMPLETED': '',
            'CANCELLED': '',
            'PAYMENT_FAILED': '',
            'IN_PROGRESS': ''
        };
        return icons[status] || '';
    };

    const getStatusText = (status) => {
        const statusTexts = {
            'PENDING': 'CHỜ XỬ LÝ',
            'PENDING_DEPOSIT': 'CHỜ ĐẶT CỌC',
            'DEPOSITED': 'ĐÃ ĐẶT CỌC',
            'CONFIRMED': 'ĐÃ XÁC NHẬN',
            'PAID': 'ĐÃ THANH TOÁN',
            'COMPLETED': 'HOÀN THÀNH',
            'CANCELLED': 'ĐÃ HỦY',
            'PAYMENT_FAILED': 'THANH TOÁN THẤT BẠI',
            'IN_PROGRESS': 'ĐANG THỰC HIỆN'
        };
        return statusTexts[status] || status;
    };

    const checkExpiry = (createdAt) => {
        const created = new Date(createdAt);
        const now = new Date();
        const diffMinutes = Math.floor((now - created) / (1000 * 60));

        if (diffMinutes >= 10) {
            return null;
        }

        const remainingMinutes = 10 - diffMinutes;
        return `${remainingMinutes} phút`;
    };

    const handlePayment = (orderId) => {
        console.log('Navigating to payment page for order:', orderId);
        navigate(`/payment/${orderId}`);
    };

    const handleCancelOrder = (orderId) => {
        setCancelOrderId(orderId);
        setCancelReason('');
        setShowCancelModal(true);
    };

    const confirmCancelOrder = async () => {
        if (!cancelReason.trim()) {
            alert('Vui lòng nhập lý do hủy đơn!');
            return;
        }

        try {
            console.log('🗑️ Cancelling order:', cancelOrderId);

            // 1. Gọi API xóa đơn hàng
            await orderService.delete(cancelOrderId);

            // 2. Lấy userId từ localStorage
            const userStr = localStorage.getItem('user');
            let userId = null;
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    userId = user.userId;
                } catch (e) {
                    console.error('Failed to parse user:', e);
                }
            }

            // 3. Gửi notification với lý do hủy
            if (userId) {
                try {
                    await notificationService.create({
                        userId: userId,
                        message: cancelReason
                    });
                    console.log('✅ Notification sent successfully');
                } catch (notifErr) {
                    console.error('⚠️ Failed to send notification:', notifErr);
                    // Không block việc hủy đơn nếu notification fail
                }
            }

            alert('Đơn hàng đã được hủy thành công!');
            setShowCancelModal(false);
            setCancelOrderId(null);
            setCancelReason('');
            loadMyBookings();
        } catch (err) {
            console.error('Error cancelling order:', err);
            alert('Không thể hủy đơn hàng: ' + (err.message || 'Unknown error'));
        }
    };

    const filteredBookings = bookings.filter(booking => {
        // Filter by status
        const matchesStatus = filter === 'all' || booking.status?.toUpperCase() === filter.toUpperCase();

        // Filter by search order ID
        const matchesSearch = searchOrderId.trim() === '' ||
            booking.orderId?.toLowerCase().includes(searchOrderId.toLowerCase());

        return matchesStatus && matchesSearch;
    });

    if (loading) {
        return (
            <div className="my-bookings-page">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Đang tải đơn đặt xe của bạn...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="my-bookings-page">
                <div className="error-container">
                    <h2>Lỗi</h2>
                    <p>{error}</p>
                    <button onClick={loadMyBookings} className="btn-retry">
                        Thử Lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="my-bookings-page">
            <div className="bookings-container">
                <div className="page-header">
                    <h1>📋 Đơn Đặt Xe Của Tôi</h1>
                    <p className="subtitle">
                        Tổng số đơn: <strong>{bookings.length}</strong>
                    </p>
                </div>

                {/* Search Box */}
                <div className="search-container">
                    <div className="search-box">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Tìm kiếm theo mã đơn hàng..."
                            value={searchOrderId}
                            onChange={(e) => setSearchOrderId(e.target.value)}
                        />
                        {searchOrderId && (
                            <button
                                className="clear-search"
                                onClick={() => setSearchOrderId('')}
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="filter-tabs">
                    <button
                        className={filter === 'all' ? 'tab active' : 'tab'}
                        onClick={() => setFilter('all')}
                    >
                        Tất Cả ({bookings.length})
                    </button>
                    <button
                        className={filter === 'pending' ? 'tab active' : 'tab'}
                        onClick={() => setFilter('pending')}
                    >
                        Chờ Xử Lý ({bookings.filter(b => ['PENDING', 'PENDING_DEPOSIT'].includes(b.status?.toUpperCase())).length})
                    </button>
                    <button
                        className={filter === 'deposited' ? 'tab active' : 'tab'}
                        onClick={() => setFilter('deposited')}
                    >
                        Đã Đặt Cọc ({bookings.filter(b => b.status?.toUpperCase() === 'DEPOSITED').length})
                    </button>
                    <button
                        className={filter === 'completed' ? 'tab active' : 'tab'}
                        onClick={() => setFilter('completed')}
                    >
                        Hoàn Thành ({bookings.filter(b => b.status?.toUpperCase() === 'COMPLETED').length})
                    </button>
                </div>

                {/* Bookings List */}
                {filteredBookings.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon"></div>
                        <h2>Không tìm thấy đơn đặt xe</h2>
                        <p>Bắt đầu hành trình của bạn bằng cách đặt xe ngay!</p>
                        <button onClick={() => navigate('/location-select')} className="btn-book-now">
                            Đặt Xe Ngay
                        </button>
                    </div>
                ) : (
                    <div className="bookings-list">
                        {filteredBookings.map((booking) => (
                            <div
                                key={booking.orderId}
                                id={`order-${booking.orderId}`}
                                className="booking-card"
                            >
                                {/* Header với Order ID và Status */}
                                <div className="booking-header">
                                    <div className="booking-id">
                                        <strong>Mã đơn hàng: </strong> {booking.orderId}
                                    </div>
                                    <span
                                        className="status-badge"
                                        style={{ background: getStatusColor(booking.status) }}
                                    >
                                        {getStatusIcon(booking.status)} {getStatusText(booking.status)}
                                    </span>
                                </div>

                                {/* Thông Tin Đơn Hàng - Grid 3x2 */}
                                <div className="order-details-grid">
                                    {/* Hàng 1 - 3 cột */}
                                    <div className="detail-box">
                                        <div className="detail-label">Hãng Xe</div>
                                        <div className="detail-value">{booking.vehicleName || 'Đang cập nhật'}</div>
                                    </div>

                                    <div className="detail-box">
                                        <div className="detail-label">Biển Số Xe</div>
                                        <div className="detail-value plate-number">{booking.plateNumber || 'EV-0046'}</div>
                                    </div>

                                    <div className="detail-box">
                                        <div className="detail-label">Thời Gian Thuê</div>
                                        <div className="detail-value">{booking.plannedHours || 0} giờ</div>
                                    </div>

                                    {/* Hàng 2 - 3 cột */}
                                    <div className="detail-box">
                                        <div className="detail-label">Ngày Trả Xe</div>
                                        <div className="detail-value">
                                            {new Date(booking.endTime).toLocaleDateString('vi-VN', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric'
                                            })}
                                        </div>
                                    </div>

                                    <div className="detail-box">
                                        <div className="detail-label">Thời Gian Thuê</div>
                                        <div className="detail-value">{booking.plannedHours || 0} giờ</div>
                                    </div>

                                    <div className="detail-box highlight-box">
                                        <div className="detail-label">Tổng Tiền</div>
                                        <div className="detail-value price-highlight">
                                            {booking.totalPrice?.toLocaleString('vi-VN')} <span className="currency">VND</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer với Actions và Time */}
                                <div className="booking-footer">
                                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                        <button
                                            onClick={() => handleViewDetails(booking)}
                                            className="view-details-btn"
                                        >
                                            Xem chi tiết
                                        </button>

                                        {['PENDING', 'PENDING_DEPOSIT'].includes(booking.status) && (
                                            <>
                                                <button
                                                    onClick={() => handlePayment(booking.orderId)}
                                                    className="btn-payment"
                                                    style={{
                                                        background: '#10b981',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '10px 20px',
                                                        borderRadius: '8px',
                                                        fontSize: '14px',
                                                        fontWeight: '600',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Đặt Cọc
                                                </button>
                                                <button
                                                    onClick={() => handleCancelOrder(booking.orderId)}
                                                    className="btn-cancel"
                                                    style={{
                                                        background: '#ef4444',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '10px 20px',
                                                        borderRadius: '8px',
                                                        fontSize: '14px',
                                                        fontWeight: '600',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Hủy
                                                </button>
                                            </>
                                        )}

                                        {['DEPOSITED', 'CONFIRMED', 'PAID'].includes(booking.status) && (
                                            <span style={{
                                                color: '#10b981',
                                                fontWeight: '600',
                                                padding: '10px 16px',
                                                background: '#d1fae5',
                                                borderRadius: '8px',
                                                fontSize: '14px'
                                            }}>
                                                Đã đặt cọc - Chờ nhận xe
                                            </span>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                        {booking.createdAt && (
                                            <span className="created-time">
                                                Tạo lúc: {new Date(booking.createdAt).toLocaleString('vi-VN')}
                                            </span>
                                        )}
                                        {['PENDING', 'PENDING_DEPOSIT'].includes(booking.status) &&
                                            booking.createdAt && checkExpiry(booking.createdAt) && (
                                                <span style={{
                                                    fontSize: '12px',
                                                    color: '#ef4444',
                                                    fontWeight: '600',
                                                    background: '#fee2e2',
                                                    padding: '4px 8px',
                                                    borderRadius: '4px'
                                                }}>
                                                    ⏰ Còn {checkExpiry(booking.createdAt)} để thanh toán
                                                </span>
                                            )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ✅ THÊM: Modal chi tiết đơn hàng */}
            {showModal && selectedBooking && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>📋 Chi tiết đơn hàng</h2>
                            <button className="modal-close" onClick={handleCloseModal}>✕</button>
                        </div>

                        <div className="modal-body">
                            {/* Order Info */}
                            <div className="detail-section">
                                <h3>Thông tin đơn hàng</h3>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <span className="label">Order ID:</span>
                                        <span className="value">{selectedBooking.orderId}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">Trạng thái:</span>
                                        <span
                                            className="value status-badge-inline"
                                            style={{ background: getStatusColor(selectedBooking.status) }}
                                        >
                                            {getStatusIcon(selectedBooking.status)} {getStatusText(selectedBooking.status)}
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">Ngày tạo:</span>
                                        <span className="value">
                                            {new Date(selectedBooking.createdAt).toLocaleString('vi-VN')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Vehicle Info */}
                            <div className="detail-section">
                                <h3>Thông tin xe</h3>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <span className="label">Tên xe:</span>
                                        <span className="value">{selectedBooking.vehicleName || 'Đang cập nhật'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">Biển số:</span>
                                        <span className="value">{selectedBooking.plateNumber || 'Đang cập nhật'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Rental Period */}
                            <div className="detail-section">
                                <h3>Thời gian thuê</h3>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <span className="label">Nhận xe:</span>
                                        <span className="value">
                                            {new Date(selectedBooking.startTime).toLocaleString('vi-VN')}
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">Trả xe:</span>
                                        <span className="value">
                                            {new Date(selectedBooking.endTime).toLocaleString('vi-VN')}
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">Giờ dự kiến:</span>
                                        <span className="value">{selectedBooking.plannedHours} giờ</span>
                                    </div>
                                    {selectedBooking.actualHours > 0 && (
                                        <div className="detail-item">
                                            <span className="label">Giờ thực tế:</span>
                                            <span className="value">{selectedBooking.actualHours} giờ</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Payment Details */}
                            <div className="detail-section">
                                <h3>Chi tiết thanh toán</h3>
                                <div className="detail-grid payment-details">
                                    <div className="detail-item">
                                        <span className="label">Tổng tiền:</span>
                                        <span className="value price-large">
                                            {selectedBooking.totalPrice?.toLocaleString()} VND
                                        </span>
                                    </div>
                                    {selectedBooking.depositAmount > 0 && (
                                        <div className="detail-item">
                                            <span className="label">Tiền cọc (50%):</span>
                                            <span className="value">
                                                {selectedBooking.depositAmount?.toLocaleString()} VND
                                            </span>
                                        </div>
                                    )}
                                    {selectedBooking.remainingAmount > 0 && (
                                        <div className="detail-item">
                                            <span className="label">Còn lại:</span>
                                            <span className="value">
                                                {selectedBooking.remainingAmount?.toLocaleString()} VND
                                            </span>
                                        </div>
                                    )}
                                    {selectedBooking.penaltyFee > 0 && (
                                        <div className="detail-item">
                                            <span className="label">Phí phạt:</span>
                                            <span className="value penalty">
                                                {selectedBooking.penaltyFee?.toLocaleString()} VND
                                            </span>
                                        </div>
                                    )}
                                    {selectedBooking.couponCode && (
                                        <div className="detail-item">
                                            <span className="label">Mã giảm giá:</span>
                                            <span className="value coupon">
                                                {selectedBooking.couponCode}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button onClick={handleCloseModal} className="btn-close-modal">
                                Đóng
                            </button>
                            {['PENDING', 'PENDING_DEPOSIT'].includes(selectedBooking.status) && (
                                <button
                                    onClick={() => {
                                        handleCloseModal();
                                        handlePayment(selectedBooking.orderId);
                                    }}
                                    className="btn-payment-modal"
                                >
                                    Thanh toán ngay
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Hủy Đơn Hàng */}
            {showCancelModal && (
                <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
                    <div className="modal-content cancel-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>❌ Hủy Đơn Hàng</h2>
                            <button className="modal-close" onClick={() => setShowCancelModal(false)}>✕</button>
                        </div>

                        <div className="modal-body">
                            <p style={{ marginBottom: '16px', color: '#6b7280', fontSize: '15px' }}>
                                Vui lòng cho chúng tôi biết lý do bạn muốn hủy đơn hàng này:
                            </p>
                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="Nhập lý do hủy đơn hàng..."
                                style={{
                                    width: '100%',
                                    minHeight: '120px',
                                    padding: '12px',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '15px',
                                    fontFamily: 'inherit',
                                    resize: 'vertical',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#dc2626'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                            />
                            <p style={{ marginTop: '8px', fontSize: '13px', color: '#ef4444' }}>
                                * Lưu ý: Đơn hàng sau khi hủy sẽ không thể khôi phục.
                            </p>
                        </div>

                        <div className="modal-footer">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="btn-close-modal"
                            >
                                Đóng
                            </button>
                            <button
                                onClick={confirmCancelOrder}
                                style={{
                                    padding: '12px 24px',
                                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            >
                                Xác nhận hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyBookingsPage;