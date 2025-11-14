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
    const [orderStatuses, setOrderStatuses] = useState({}); // Store status của từng order
    const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);


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

    try {
      console.log("🚗 [MyBookings] Fetching vehicle details...");
      const vehicles = await vehicleService.getVehicles();

      finalOrders = orders.map((order) => {
        const vehicle = vehicles.find((v) => v.vehicleId === order.vehicleId);

        // Ưu tiên dữ liệu từ backend (nếu đã có)
        if (order.vehicleName || order.plateNumber) return order;

        // Ghép thêm thông tin xe nếu có
        return vehicle
          ? {
              ...order,
              vehicleName: vehicle.vehicleName,
              plateNumber: vehicle.plateNumber,
              vehicleColor: vehicle.color,
              vehicleType: vehicle.seatCount >= 7 ? "7-seater" : "4-seater",
            }
          : {
              ...order,
              vehicleName: "Chưa cập nhật",
              plateNumber: "Chưa cập nhật",
            };
      });
    } catch (vehicleErr) {
      console.warn("⚠️ Vehicle API failed:", vehicleErr);
    }

    // Sort theo thời gian tạo
    finalOrders.sort(
      (a, b) =>
        new Date(b.createdAt || b.startTime) -
        new Date(a.createdAt || a.startTime)
    );

    setBookings(finalOrders);
  } catch (err) {
    console.error("[MyBookings] Unexpected error:", err);
    setBookings([]);
  } finally {
    setLoading(false);
  }
};



    const handleViewDetails = (booking) => {
  navigate(`/order-detail-cus/${booking.orderId}`);
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
            const paymentData = {
                orderId: orderId,
                amount: orderStatus.remainingAmount,
                returnUrl: window.location.origin + '/payment-callback'
            };

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

    // ✅ Mở trang feedback cho COMPLETED
    const handleFeedback = (orderId) => {
        console.log('Opening feedback for order:', orderId);
        navigate('/feedback', { state: { orderId } });
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
            console.log(' Cancelling order:', cancelOrderId);

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
            console.error('Error cancelling order:', err);
            alert('Không thể hủy đơn hàng: ' + (err.message || 'Unknown error'));
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
        <div className="search-box">
          <input
            type="text"
            className="search-input"
            placeholder="Tìm kiếm theo mã đơn hàng..."
            value={searchOrderId}
            onChange={(e) => setSearchOrderId(e.target.value)}
          />
          {searchOrderId && (
            <button className="clear-search" onClick={() => setSearchOrderId("")}>
              ✕
            </button>
          )}
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
                    {booking.vehicleName || "Đang cập nhật"}
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
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <button
                    onClick={() => handleViewDetails(booking)}
                    className="view-details-btn"
                  >
                    Xem chi tiết
                  </button>

                  {/* Hiển thị trạng thái phù hợp */}
                  {["PENDING", "PENDING_DEPOSIT"].includes(booking.status) && (
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

                  {["DEPOSITED", "CONFIRMED", "PAID"].includes(booking.status) && (
                    <span
                      style={{
                        color: "#10b981",
                        fontWeight: "600",
                        padding: "10px 16px",
                        background: "#d1fae5",
                        borderRadius: "8px",
                        fontSize: "14px",
                      }}
                    >
                      Đã đặt cọc - Chờ nhận xe
                    </span>
                  )}

                  {booking.status === "COMPLETED" && (
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
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

};

export default MyBookingsPage;