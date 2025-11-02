import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService, paymentService } from '../services';
import './PaymentPage.css';

const PaymentPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState(''); // 'CASH' or 'VNPAY'

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        loadOrderDetails();
    }, [orderId]);

    const loadOrderDetails = async () => {
        try {
            setLoading(true);
            console.log('📥 Loading order details for:', orderId);

            // Get all user orders and find the specific one
            const orders = await orderService.getMyOrders();
            // orderId is UUID string, compare directly
            const foundOrder = orders.find(o => o.orderId === orderId || String(o.orderId) === String(orderId));

            if (!foundOrder) {
                alert('❌ Không tìm thấy đơn hàng!');
                navigate('/my-bookings');
                return;
            }

            // Check if order can be paid
            if (foundOrder.status !== 'PENDING') {
                alert(`⚠️ Đơn hàng này không thể thanh toán.\nTrạng thái: ${foundOrder.status}`);
                navigate('/my-bookings');
                return;
            }

            setOrder(foundOrder);
            console.log('✅ Order loaded:', foundOrder);
        } catch (err) {
            console.error('❌ Error loading order:', err);
            alert('Không thể tải thông tin đơn hàng: ' + (err.message || 'Lỗi không xác định'));
            navigate('/my-bookings');
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async () => {
        if (!paymentMethod) {
            alert('⚠️ Vui lòng chọn phương thức thanh toán!');
            return;
        }

        setProcessing(true);
        try {
            // Prepare payment data
            const paymentData = {
                orderId: orderId, // Keep as UUID string
                method: paymentMethod, // 'CASH' or 'VNPAY'
                paymentType: 1 // 1 = Deposit payment (thanh toán đặt cọc)
            };

            console.log('💳 Processing payment:', paymentData);

            if (paymentMethod === 'CASH') {
                // For cash payment, call API to record payment method
                console.log('💵 Cash payment selected');

                alert(`✅ Đã chọn thanh toán bằng tiền mặt!

📍 Vui lòng mang tiền đến cửa hàng khi nhận xe.
💰 Số tiền cần thanh toán: ${order.totalPrice ? order.totalPrice.toLocaleString() : 'N/A'} VND

Đơn hàng của bạn đã được xác nhận và đang chờ nhận xe.`);

                navigate('/my-bookings');

            } else if (paymentMethod === 'VNPAY') {
                // Call VNPay payment URL API
                paymentData.method = 'VNPay'; // Backend expects 'VNPay' (capital P)

                console.log('🏦 Calling VNPay API with:', paymentData);
                const response = await paymentService.createPaymentUrl(paymentData);

                console.log('✅ VNPay URL response:', response);

                // Check for payment URL in response
                const vnpayUrl = response.paymentUrl || response.url || response.vnpayUrl;

                if (vnpayUrl) {
                    console.log('🔄 Redirecting to VNPay:', vnpayUrl);
                    // Redirect to VNPay payment page
                    window.location.href = vnpayUrl;
                } else {
                    console.error('❌ No payment URL in response:', response);
                    throw new Error('Không nhận được link thanh toán từ server');
                }
            }
        } catch (err) {
            console.error('❌ Payment error:', err);

            let errorMsg = 'Thanh toán thất bại!';
            if (err.message.includes('HTTP 500')) {
                errorMsg = 'Lỗi server. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.';
            } else if (err.message) {
                errorMsg = err.message;
            }

            alert(`❌ ${errorMsg}\n\nVui lòng thử lại hoặc chọn phương thức thanh toán khác.`);
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="payment-page">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Đang tải thông tin đơn hàng...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="payment-page">
                <div className="error-container">
                    <h2>❌ Order not found</h2>
                    <button onClick={() => navigate('/my-bookings')} className="btn-back">
                        Back to My Bookings
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="payment-page">
            <div className="payment-container">
                <div className="page-header">
                    <h1>💳 Thanh Toán Đơn Hàng</h1>
                    <p className="subtitle">Order #{order.orderId}</p>
                </div>

                {/* Order Summary */}
                <div className="payment-section order-summary">
                    <h2>📋 Thông Tin Đơn Hàng</h2>
                    <div className="summary-grid">
                        <div className="summary-item">
                            <span className="label">Mã đơn hàng:</span>
                            <span className="value">#{order.orderId}</span>
                        </div>
                        <div className="summary-item">
                            <span className="label">Xe:</span>
                            <span className="value">Vehicle ID: {order.vehicleId}</span>
                        </div>
                        <div className="summary-item">
                            <span className="label">Ngày nhận xe:</span>
                            <span className="value">
                                {new Date(order.startTime).toLocaleString('vi-VN')}
                            </span>
                        </div>
                        <div className="summary-item">
                            <span className="label">Ngày trả xe:</span>
                            <span className="value">
                                {new Date(order.endTime).toLocaleString('vi-VN')}
                            </span>
                        </div>
                        <div className="summary-item">
                            <span className="label">Thời gian thuê:</span>
                            <span className="value">{order.plannedHours} giờ</span>
                        </div>
                        <div className="summary-item highlight">
                            <span className="label">Tổng tiền:</span>
                            <span className="value price">
                                {order.totalPrice
                                    ? `${order.totalPrice.toLocaleString()} VND`
                                    : 'Đang tính...'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Payment Method Selection */}
                <div className="payment-section payment-methods">
                    <h2>💰 Chọn Phương Thức Thanh Toán</h2>
                    <div className="methods-grid">
                        <div
                            className={`method-card ${paymentMethod === 'CASH' ? 'selected' : ''}`}
                            onClick={() => setPaymentMethod('CASH')}
                        >
                            <div className="method-icon">💵</div>
                            <h3>Tiền Mặt</h3>
                            <p>Thanh toán trực tiếp tại cửa hàng khi nhận xe</p>
                            {paymentMethod === 'CASH' && (
                                <div className="selected-badge">✓ Đã chọn</div>
                            )}
                        </div>

                        <div
                            className={`method-card ${paymentMethod === 'VNPAY' ? 'selected' : ''}`}
                            onClick={() => setPaymentMethod('VNPAY')}
                        >
                            <div className="method-icon">🏦</div>
                            <h3>VNPay</h3>
                            <p>Thanh toán trực tuyến qua cổng VNPay</p>
                            {paymentMethod === 'VNPAY' && (
                                <div className="selected-badge">✓ Đã chọn</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="payment-actions">
                    <button
                        onClick={() => navigate('/my-bookings')}
                        className="btn-back"
                        disabled={processing}
                    >
                        ← Quay lại
                    </button>
                    <button
                        onClick={handlePayment}
                        className="btn-pay"
                        disabled={processing || !paymentMethod}
                    >
                        {processing ? 'Đang xử lý...' : 'Xác Nhận Thanh Toán'}
                    </button>
                </div>

                {/* Payment Info */}
                <div className="payment-info">
                    <p>
                        💡 <strong>Lưu ý:</strong>
                    </p>
                    <ul>
                        <li>Đơn hàng sẽ tự động hủy nếu không thanh toán trong vòng 10 phút</li>
                        <li>Thanh toán bằng tiền mặt: Vui lòng mang tiền khi đến nhận xe</li>
                        <li>Thanh toán VNPay: Bạn sẽ được chuyển đến trang thanh toán an toàn</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
