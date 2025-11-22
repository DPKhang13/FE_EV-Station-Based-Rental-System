import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { orderService, notificationService, feedbackService } from '../services';
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
    const [orderStatuses, setOrderStatuses] = useState({}); // Store status của từng order
    const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [orderFeedbacks, setOrderFeedbacks] = useState({}); // Store feedback của từng order
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [isEditingFeedback, setIsEditingFeedback] = useState(false);
    const [editRating, setEditRating] = useState(5);
    const [editComment, setEditComment] = useState('');
    const [updatingFeedback, setUpdatingFeedback] = useState(false);


    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        const user = localStorage.getItem('user');

        console.log('🔍 [MyBookings] Checking auth:', {
            hasToken: !!token,
            hasUser: !!user
        });

        if (!token || !user) {
            navigate('/login', { replace: true });
            return;
        }

        window.scrollTo({ top: 0, behavior: 'instant' });
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

        // ✅ Reload feedbacks nếu có orderId trong location.state (quay lại từ trang feedback)
        if (location.state?.orderId) {
            setTimeout(async () => {
                try {
                    // Reload lại toàn bộ feedbacks để đảm bảo có feedback mới nhất
                    const orders = await orderService.getMyOrders();
                    if (orders && Array.isArray(orders)) {
                        await fetchOrderFeedbacks(orders);
                        console.log('✅ Feedbacks reloaded after feedback submission');
                    }
                } catch (err) {
                    console.warn('⚠️ Cannot reload feedbacks:', err);
                }
            }, 1500);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate, location]);

    // ✅ Fetch status chi tiết từ preview-return API
    const fetchOrderStatuses = async (orders) => {
        const statusMap = {};

        for (const order of orders) {
            try {
                const preview = await orderService.getReturnPreview(order.orderId);
                statusMap[order.orderId] = {
                    status: preview.status || order.status,
                    remainingAmount: preview.remainingAmount || 0,
                    penaltyFee: preview.penaltyFee || 0,
                    actualHours: preview.actualHours || 0
                };
            } catch (err) {
                console.warn(`⚠️ Cannot fetch status for order ${order.orderId}:`, err);
                // Fallback to original status
                statusMap[order.orderId] = {
                    status: order.status,
                    remainingAmount: 0,
                    penaltyFee: 0,
                    actualHours: 0
                };
            }
        }

        setOrderStatuses(statusMap);
        console.log('Order statuses loaded:', statusMap);
    };

   const loadMyBookings = async () => {
  try {
    setLoading(true);
    setError(null);

    console.log("📥 [MyBookings] Fetching orders...");
    const orders = await orderService.getMyOrders();
    console.log("[MyBookings] Orders from API:", orders);

    if (!orders || !Array.isArray(orders)) {
      setBookings([]);
      setLoading(false);
      return;
    }

    let finalOrders = [...orders];

    // Sort theo thời gian tạo
    finalOrders.sort(
      (a, b) =>
        new Date(b.createdAt || b.startTime) -
        new Date(a.createdAt || a.startTime)
    );

    setBookings(finalOrders);

    // ✅ Fetch feedback cho các order đã hoàn thành
    await fetchOrderFeedbacks(finalOrders);
  } catch (err) {
    console.error("[MyBookings] Unexpected error:", err);
    setBookings([]);
  } finally {
    setLoading(false);
  }
};

    // ✅ Fetch feedback cho các order
    const fetchOrderFeedbacks = async (orders) => {
        const feedbackMap = {};
        
        for (const order of orders) {
            // Chỉ fetch feedback cho các order đã hoàn thành
            if (order.status?.toUpperCase() === 'COMPLETED') {
                try {
                    const feedback = await feedbackService.getByOrderId(order.orderId);
                    if (feedback) {
                        // Xử lý cả trường hợp API trả về array hoặc object
                        if (Array.isArray(feedback)) {
                            if (feedback.length > 0) {
                                feedbackMap[order.orderId] = feedback[0];
                            }
                        } else if (feedback && typeof feedback === 'object') {
                            // Nếu là object, lưu trực tiếp
                            feedbackMap[order.orderId] = feedback;
                        }
                    }
                    // Nếu feedback là null (order chưa có feedback), không làm gì
                } catch (err) {
                    // Chỉ log warning cho lỗi không phải 500/404 (network, etc.)
                    const statusCode = err?.response?.status || err?.status;
                    if (statusCode && statusCode !== 500 && statusCode !== 404) {
                        console.warn(`⚠️ [MyBookings] Cannot fetch feedback for order ${order.orderId}:`, err);
                    }
                    // Bỏ qua lỗi - tiếp tục với order tiếp theo
                }
            }
        }
        
        setOrderFeedbacks(feedbackMap);
        console.log('Order feedbacks loaded:', feedbackMap);
    };



    const handleViewDetails = (booking) => {
  navigate(`/order-detail-cus/${booking.orderId}`);
};


    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedBooking(null);
    };

    const getStatusColor = (status) => {
        if (!status) return '#6b7280';
        const statusUpper = String(status).toUpperCase();
        const colors = {
            'PENDING': '#f59e0b',
            'PENDING_DEPOSIT': '#f59e0b',
            'PENDING_FULL_PAYMENT': '#f59e0b',
            'DEPOSITED': '#3b82f6',
            'BOOKED': '#3b82f6',
            'RENTAL': '#8b5cf6',
            'WAITING_FOR_VEHICLE': '#f59e0b',
            'WAITING': '#f59e0b',
            'CONFIRMED': '#3b82f6',
            'CHECKING': '#3b82f6',
            'AWAITING': '#f59e0b',
            'PAID': '#10b981',
            'SUCCESS': '#10b981',
            'COMPLETED': '#10b981',
            'CANCELLED': '#ef4444',
            'FAILED': '#ef4444',
            'PAYMENT_FAILED': '#ef4444',
            'IN_PROGRESS': '#8b5cf6'
        };
        return colors[statusUpper] || '#6b7280';
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
        if (!status) return "N/A";
        const statusUpper = String(status).toUpperCase();
        const statusTexts = {
            'PENDING': 'CHƯA THANH TOÁN',
            'PENDING_DEPOSIT': 'CHỜ ĐẶT CỌC',
            'PENDING_FINAL_PAYMENT': 'CHỜ THANH TOÁN CUỐI',
            'PENDING_FULL_PAYMENT': 'CHỜ THANH TOÁN ',
            'DEPOSITED': 'ĐÃ ĐẶT CỌC',
            'BOOKED': 'ĐÃ ĐẶT',
            'RENTAL': 'ĐANG THUÊ',
            'WAITING_FOR_VEHICLE': 'CHỜ XE',
            'WAITING': 'CHỜ XE',
            'CONFIRMED': 'ĐÃ XÁC NHẬN',
            'CHECKING': 'ĐANG KIỂM TRA',
            'AWAITING': 'CHỜ NHẬN XE',
            'PAID': 'ĐÃ THANH TOÁN',
            'SUCCESS': 'THÀNH CÔNG',
            'COMPLETED': 'HOÀN THÀNH',
            'CANCELLED': 'ĐÃ HỦY',
            'FAILED': 'ĐÃ HỦY',
            'PAYMENT_FAILED': 'THANH TOÁN THẤT BẠI',
            'IN_PROGRESS': 'ĐANG THỰC HIỆN'
        };
        return statusTexts[statusUpper] || status;
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
        console.log('🟢 [MyBookings] Mở lựa chọn thanh toán cho đơn:', orderId);
        setSelectedOrderId(orderId);
        setShowPaymentMethodModal(true);
    };
    const handleSelectPaymentMethod = async (method) => {
        try {
            if (method === 'CASH') {
                alert('Bạn đã chọn thanh toán bằng tiền mặt khi nhận xe.');
                setShowPaymentMethodModal(false);
                return;
            }

            if (method === 'VNPay') {
                console.log('💳 [VNPay] Tạo link thanh toán cho đơn:', selectedOrderId);
                const payload = {
                    orderId: selectedOrderId,
                    method: 'VNPay',
                    paymentType: 1
                };

                const response = await fetch('http://localhost:8080/api/payment/vnpay', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                const data = await response.json();
                console.log('✅ [VNPay] Payment link:', data.paymentUrl);

                if (data.paymentUrl) {
                    window.location.href = data.paymentUrl;
                } else {
                    alert('Không nhận được link thanh toán từ server.');
                }
            }
        } catch (err) {
            console.error('❌ [Payment] Error:', err);
            alert('Không thể xử lý thanh toán. Vui lòng thử lại sau.');
        } finally {
            setShowPaymentMethodModal(false);
            setSelectedOrderId(null);
        }
    };


    // ✅ Thanh toán phần còn lại cho AWAIT_FINAL
    const handleFinalPayment = async (orderId) => {
        try {
            const orderStatus = orderStatuses[orderId];
            if (!orderStatus || orderStatus.remainingAmount <= 0) {
                alert('Không có số tiền cần thanh toán!');
                return;
            }

            console.log(' Processing final payment for order:', orderId);
            console.log('Amount to pay:', orderStatus.remainingAmount);

            // Gọi VNPay payment API
            // const paymentData = {
            const _paymentData = {
                orderId: orderId,
                amount: orderStatus.remainingAmount,
                returnUrl: window.location.origin + '/payment-callback'
            };
            console.log('Payment data:', _paymentData);

            // TODO: Call your VNPay API here
            // const response = await paymentService.createPayment(paymentData);
            // window.location.href = response.paymentUrl;

            // Temporary: Navigate to payment page
            navigate(`/payment/${orderId}`, {
                state: {
                    isFinalPayment: true,
                    remainingAmount: orderStatus.remainingAmount
                }
            });

        } catch (err) {
            console.error(' Final payment error:', err);
            alert('Không thể xử lý thanh toán: ' + err.message);
        }
    };

    // ✅ Mở trang feedback cho COMPLETED (chưa có feedback)
    const handleFeedback = (orderId) => {
        console.log('Opening feedback for order:', orderId);
        navigate('/feedback', { state: { orderId } });
    };

    // ✅ Xem feedback đã đánh giá
    const handleViewFeedback = async (orderId) => {
        try {
            // Nếu đã có trong state thì dùng luôn
            if (orderFeedbacks[orderId]) {
                setSelectedFeedback(orderFeedbacks[orderId]);
                setEditRating(orderFeedbacks[orderId].rating || 5);
                setEditComment(orderFeedbacks[orderId].comment || '');
                setIsEditingFeedback(false);
                setShowFeedbackModal(true);
                return;
            }

            // Nếu chưa có thì fetch lại
            console.log('📝 [MyBookings] Fetching feedback for order:', orderId);
            const feedback = await feedbackService.getByOrderId(orderId);
            if (feedback) {
                // Xử lý cả trường hợp API trả về array hoặc object
                let feedbackData;
                if (Array.isArray(feedback)) {
                    feedbackData = feedback.length > 0 ? feedback[0] : null;
                } else if (feedback && typeof feedback === 'object') {
                    feedbackData = feedback;
                } else {
                    feedbackData = null;
                }
                
                if (feedbackData) {
                    setSelectedFeedback(feedbackData);
                    setEditRating(feedbackData.rating || 5);
                    setEditComment(feedbackData.comment || '');
                    setIsEditingFeedback(false);
                    setOrderFeedbacks(prev => ({ ...prev, [orderId]: feedbackData }));
                    setShowFeedbackModal(true);
                } else {
                    alert('Không tìm thấy đánh giá cho đơn hàng này.');
                }
            } else {
                alert('Đơn hàng này chưa có đánh giá.');
            }
        } catch (err) {
            // Xử lý lỗi khi fetch feedback
            const statusCode = err?.response?.status || err?.status;
            if (statusCode === 500 || statusCode === 404) {
                // Lỗi 500 hoặc 404 có thể là do order chưa có feedback - bình thường
                console.log(`ℹ️ [MyBookings] Order ${orderId} chưa có feedback (status: ${statusCode})`);
                alert('Đơn hàng này chưa có đánh giá.');
            } else {
                // Lỗi khác (network, etc.)
                console.error('❌ [MyBookings] Error fetching feedback:', err);
                alert('Không thể tải đánh giá. Vui lòng thử lại sau.');
            }
        }
    };

    // ✅ Chỉnh sửa feedback
    const handleEditFeedback = () => {
        setIsEditingFeedback(true);
    };

    // ✅ Hủy chỉnh sửa
    const handleCancelEdit = () => {
        setIsEditingFeedback(false);
        setEditRating(selectedFeedback?.rating || 5);
        setEditComment(selectedFeedback?.comment || '');
    };

    // ✅ Lưu chỉnh sửa feedback
    const handleUpdateFeedback = async () => {
        if (!selectedFeedback?.feedbackId) {
            alert('Không tìm thấy ID đánh giá.');
            return;
        }

        try {
            setUpdatingFeedback(true);
            const feedbackData = {
                comment: editComment
            };
            
            console.log('📝 [MyBookings] Updating feedback:', selectedFeedback.feedbackId, feedbackData);
            await feedbackService.update(selectedFeedback.feedbackId, feedbackData);
            
            // Cập nhật lại feedback trong state
            const updatedFeedback = {
                ...selectedFeedback,
                comment: editComment
            };
            setSelectedFeedback(updatedFeedback);
            setOrderFeedbacks(prev => ({ ...prev, [selectedFeedback.orderId]: updatedFeedback }));
            setIsEditingFeedback(false);
            
            alert('✅ Đã cập nhật đánh giá thành công!');
        } catch (err) {
            console.error('❌ [MyBookings] Error updating feedback:', err);
            const errorMsg = err?.response?.data?.message || err?.message || 'Không thể cập nhật đánh giá. Vui lòng thử lại sau.';
            alert(errorMsg);
        } finally {
            setUpdatingFeedback(false);
        }
    };

    // ✅ Xóa đơn hàng
    const handleDeleteOrder = async (orderId) => {
        if (!orderId) {
            alert('Không tìm thấy mã đơn hàng!');
            return;
        }

        const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này? Hành động này không thể hoàn tác.');
        if (!confirmDelete) {
            return;
        }

        try {
            console.log('🗑️ [MyBookings] Deleting order:', orderId);
            await orderService.delete(orderId);
            console.log('✅ [MyBookings] Order deleted successfully');
            alert('Đơn hàng đã được xóa thành công!');
            loadMyBookings(); // Reload danh sách
        } catch (err) {
            console.error('❌ Error deleting order:', err);
            const errorMessage = err?.response?.data?.message || 
                                err?.message || 
                                'Không thể xóa đơn hàng. Vui lòng thử lại sau.';
            alert(`Không thể xóa đơn hàng:\n${errorMessage}`);
        }
    };

    const handleCancelOrder = (orderId) => {
        setCancelOrderId(orderId);
        setCancelReason('');
        setShowCancelModal(true);
    };

    const confirmCancelOrder = async () => {
        if (!cancelOrderId) {
            alert('Không tìm thấy mã đơn hàng!');
            return;
        }

        try {
            // Giới hạn độ dài lý do hủy để tránh lỗi backend
            let trimmedReason = cancelReason.trim() || "";
            if (trimmedReason.length > 500) {
                trimmedReason = trimmedReason.substring(0, 500);
                console.warn('⚠️ [MyBookings] Cancellation reason truncated to 500 characters');
            }
            console.log('🚀 [MyBookings] Cancelling order:', cancelOrderId);
            console.log('📝 [MyBookings] Cancellation reason:', trimmedReason || '(Không có)');

            // 1. Gọi API hủy đơn hàng (có thể không có lý do)
            const result = await orderService.cancel(cancelOrderId, trimmedReason);
            console.log('✅ [MyBookings] Cancel result:', result);

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
                    console.error(' Failed to send notification:', notifErr);
                    // Không block việc hủy đơn nếu notification fail
                }
            }

            alert('Đơn hàng đã được hủy thành công!');
            setShowCancelModal(false);
            setCancelOrderId(null);
            setCancelReason('');
            loadMyBookings();
        } catch (err) {
            console.error('❌ Error cancelling order:', err);
            const errorMessage = err?.response?.data?.message || 
                                err?.message || 
                                'Không thể hủy đơn hàng. Vui lòng thử lại sau.';
            alert(`Không thể hủy đơn hàng:\n${errorMessage}`);
        }
    };

    const filteredBookings = bookings.filter(booking => {
        // Filter by statusAQ
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
        <h1>Đơn Đặt Xe Của Tôi</h1>
        <p className="subtitle">
          Tổng số đơn: <strong>{bookings.length}</strong>
        </p>
      </div>

      {/* Search Box */}
      <div className="search-container">
        <div className="search-box-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Tìm kiếm theo mã đơn hàng..."
            value={searchOrderId}
            onChange={(e) => setSearchOrderId(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && setSearchOrderId(searchOrderId)}
          />
          <button
            className="btn-search"
            onClick={() => setSearchOrderId(searchOrderId)}
          >
            TÌM KIẾM
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={filter === "all" ? "tab active" : "tab"}
          onClick={() => setFilter("all")}
        >
          Tất Cả ({bookings.length})
        </button>
        <button
          className={filter === "pending" ? "tab active" : "tab"}
          onClick={() => setFilter("pending")}
        >
          Chờ Xử Lý (
          {
            bookings.filter((b) =>
              ["PENDING", "PENDING_DEPOSIT"].includes(b.status?.toUpperCase())
            ).length
          }
          )
        </button>
        <button
          className={filter === "deposited" ? "tab active" : "tab"}
          onClick={() => setFilter("deposited")}
        >
          Đã Đặt Cọc (
          {bookings.filter((b) => b.status?.toUpperCase() === "DEPOSITED").length}
          )
        </button>
        <button
          className={filter === "completed" ? "tab active" : "tab"}
          onClick={() => setFilter("completed")}
        >
          Hoàn Thành (
          {bookings.filter((b) => b.status?.toUpperCase() === "COMPLETED").length}
          )
        </button>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"></div>
          <h2>Không tìm thấy đơn đặt xe</h2>
          <p>Bắt đầu hành trình của bạn bằng cách đặt xe ngay!</p>
          <button
            onClick={() => navigate("/location-select")}
            className="btn-book-now"
          >
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
              {/* Header */}
              <div className="booking-header">
                <div className="booking-id">
                  <strong>Mã đơn hàng: </strong> {booking.orderId}
                </div>
                <span
                  className="status-badge"
                  style={{ background: getStatusColor(booking.status) }}
                >
                  {getStatusText(booking.status)}
                </span>
              </div>

              {/* Grid 3x2 */}
              <div className="order-details-grid">
                <div className="detail-box">
                  <div className="detail-label">Hãng Xe</div>
                  <div className="detail-value">
                    {booking.brand || "Đang cập nhật"}
                  </div>
                </div>

                <div className="detail-box">
                  <div className="detail-label">Biển Số Xe</div>
                  <div className="detail-value plate-number">
                    {booking.plateNumber || "Chưa cập nhật"}
                  </div>
                </div>

                <div className="detail-box">
                  <div className="detail-label">Trạm Thuê</div>
                  <div className="detail-value">
                    {booking.stationName || "Đang cập nhật"}
                  </div>
                </div>

                <div className="detail-box">
                  <div className="detail-label">Ngày Nhận Xe</div>
                  <div className="detail-value">
                    {new Date(booking.startTime).toLocaleString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </div>
                </div>

                <div className="detail-box">
                  <div className="detail-label">Ngày Trả Xe</div>
                  <div className="detail-value">
                    {new Date(booking.endTime).toLocaleString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </div>
                </div>

                <div className="detail-box highlight-box">
                  <div className="detail-label">Tổng Tiền</div>
                  <div className="detail-value price-highlight">
                    {booking.totalPrice?.toLocaleString("vi-VN")}{" "}
                    <span className="currency">VND</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="booking-footer">
                {["DEPOSITED", "CONFIRMED", "PAID", "AWAITING"].includes(booking.status) ? (
                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
                    <button
                      onClick={() => handleViewDetails(booking)}
                      className="view-details-btn"
                    >
                      Xem chi tiết
                    </button>
                    <button
                      onClick={() => handleCancelOrder(booking.orderId)}
                      className="btn-cancel"
                      style={{
                        background: "#ef4444",
                        color: "white",
                        border: "none",
                        padding: "10px 20px",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      Hủy đơn hàng
                    </button>
                    <span
                      style={{
                        color: "#856404",
                        fontWeight: "500",
                        padding: "10px 16px",
                        background: "#FFF3CD",
                        border: "1px solid #FFC107",
                        borderRadius: "8px",
                        fontSize: "13px",
                        flex: 1,
                        maxWidth: "100%",
                      }}
                    >
                      ⚠️ Vui lòng nếu đến nhận xe thì phải thanh toán số tiền còn lại
                    </span>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <button
                      onClick={() => handleViewDetails(booking)}
                      className="view-details-btn"
                    >
                      Xem chi tiết
                    </button>

                    {/* Hiển thị trạng thái phù hợp */}
                    {["PENDING", "PENDING_DEPOSIT", "PENDING_FULL_PAYMENT"].includes(booking.status) && (
                      <button
                        onClick={() => handleCancelOrder(booking.orderId)}
                        className="btn-cancel"
                        style={{
                          background: "#ef4444",
                          color: "white",
                          border: "none",
                          padding: "10px 20px",
                          borderRadius: "8px",
                          fontSize: "14px",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        Hủy đơn hàng
                      </button>
                    )}

                    {booking.status === "COMPLETED" && (
                      <>
                        {orderFeedbacks[booking.orderId] ? (
                          <button
                            onClick={() => handleViewFeedback(booking.orderId)}
                            style={{
                              background:
                                "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                              color: "white",
                              border: "none",
                              padding: "10px 20px",
                              borderRadius: "8px",
                              fontSize: "14px",
                              fontWeight: "600",
                              cursor: "pointer",
                            }}
                          >
                            Xem đánh giá
                          </button>
                        ) : (
                          <button
                            onClick={() => handleFeedback(booking.orderId)}
                            style={{
                              background:
                                "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                              color: "white",
                              border: "none",
                              padding: "10px 20px",
                              borderRadius: "8px",
                              fontSize: "14px",
                              fontWeight: "600",
                              cursor: "pointer",
                            }}
                          >
                            Đánh giá
                          </button>
                        )}
                      </>
                    )}

                    {/* Nút xóa đơn hàng - chỉ hiển thị khi đã hủy hoặc hoàn thành */}
                    {["CANCELLED", "COMPLETED", "FAILED"].includes(booking.status?.toUpperCase()) && (
                      <button
                        onClick={() => handleDeleteOrder(booking.orderId)}
                        style={{
                          background: "#6b7280",
                          color: "white",
                          border: "none",
                          padding: "10px 20px",
                          borderRadius: "8px",
                          fontSize: "14px",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "all 0.3s",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = "#4b5563";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = "#6b7280";
                        }}
                      >
                        Xóa đơn hàng
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: "4px",
                }}
              >
                {booking.createdAt && (
                  <span className="created-time">
                    Tạo lúc:{" "}
                    {new Date(booking.createdAt).toLocaleString("vi-VN")}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal hủy đơn hàng */}
      {showCancelModal && (
        <div 
          className="modal-overlay" 
          onClick={() => setShowCancelModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
        >
          <div 
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              padding: '24px',
              borderRadius: '8px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: '16px' }}>Hủy đơn hàng</h2>
            <p style={{ marginBottom: '16px', color: '#666' }}>
              Lý do hủy đơn hàng (tùy chọn):
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Nhập lý do hủy đơn hàng..."
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                marginBottom: '20px',
                fontFamily: 'inherit'
              }}
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                  setCancelOrderId(null);
                }}
                style={{
                  padding: '10px 20px',
                  background: '#f3f4f6',
                  color: '#333',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Hủy
              </button>
              <button
                onClick={confirmCancelOrder}
                style={{
                  padding: '10px 20px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal hiển thị feedback */}
      {showFeedbackModal && selectedFeedback && (
        <div 
          className="modal-overlay" 
          onClick={() => {
            setShowFeedbackModal(false);
            setSelectedFeedback(null);
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
        >
          <div 
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              padding: '32px',
              borderRadius: '8px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, textAlign: 'center', flex: 1 }}>
                Đánh giá của bạn
              </h2>
              {!isEditingFeedback && (
                <button
                  onClick={handleEditFeedback}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: '12px'
                  }}
                  title="Chỉnh sửa đánh giá"
                >
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    style={{ color: '#666' }}
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
              )}
            </div>
            
            {isEditingFeedback ? (
              // ⭐⭐ CHẾ ĐỘ CHỈNH SỬA ⭐⭐
              <div style={{ marginBottom: '20px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ display: 'block', marginBottom: '8px' }}>Đánh giá:</strong>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        style={{
                          fontSize: '24px',
                          color: star <= (selectedFeedback.rating || 0) ? '#FFD700' : '#E5E5E5'
                        }}
                      >
                        ★
                      </span>
                    ))}
                    <span style={{ marginLeft: '8px', fontWeight: '600' }}>
                      {selectedFeedback.rating || 0}/5
                    </span>
                  </div>
                  <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                    (Không thể thay đổi đánh giá)
                  </p>
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ display: 'block', marginBottom: '8px' }}>Nhận xét:</strong>
                  <textarea
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    placeholder="Nhập nhận xét của bạn..."
                    style={{
                      width: '100%',
                      minHeight: '100px',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button
                    onClick={handleCancelEdit}
                    disabled={updatingFeedback}
                    style={{
                      padding: '10px 24px',
                      background: '#f3f4f6',
                      color: '#374151',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: updatingFeedback ? 'not-allowed' : 'pointer',
                      opacity: updatingFeedback ? 0.6 : 1
                    }}
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleUpdateFeedback}
                    disabled={updatingFeedback}
                    style={{
                      padding: '10px 24px',
                      background: '#000000',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: updatingFeedback ? 'not-allowed' : 'pointer',
                      opacity: updatingFeedback ? 0.6 : 1
                    }}
                  >
                    {updatingFeedback ? 'Đang lưu...' : 'Lưu'}
                  </button>
                </div>
              </div>
            ) : (
              // ⭐⭐ CHẾ ĐỘ XEM ⭐⭐
              <div style={{ marginBottom: '20px' }}>
                <div style={{ 
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <strong>Đánh giá:</strong>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        style={{
                          fontSize: '24px',
                          color: star <= (selectedFeedback.rating || 0) ? '#FFD700' : '#E5E5E5'
                        }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span style={{ marginLeft: '8px', fontWeight: '600' }}>
                    {selectedFeedback.rating || 0}/5
                  </span>
                </div>
                
                {selectedFeedback.comment && (
                  <div style={{ marginTop: '16px' }}>
                    <strong style={{ display: 'block', marginBottom: '8px' }}>Nhận xét:</strong>
                    <div style={{
                      padding: '12px',
                      background: '#f9fafb',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      minHeight: '60px',
                      lineHeight: '1.6'
                    }}>
                      {selectedFeedback.comment}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!isEditingFeedback && (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setSelectedFeedback(null);
                    setIsEditingFeedback(false);
                  }}
                  style={{
                    padding: '10px 24px',
                    background: '#000000',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#333333';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#000000';
                  }}
                >
                  Đóng
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  </div>
);

};

export default MyBookingsPage;