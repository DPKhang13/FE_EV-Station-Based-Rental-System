import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './PaymentSuccess.css';

const PaymentSuccessPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // ✅ Lấy params từ URL
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount'); // Đã nhân 100 từ VNPay
    const txnRef = searchParams.get('txnRef');
    const responseCode = searchParams.get('responseCode');

    // Convert amount từ VNPay (đã nhân 100) về VND
    const amountVND = amount ? parseInt(amount) / 100 : 0;

    useEffect(() => {
        console.log('✅ [PaymentSuccess] Params:', {
            orderId,
            amount: amountVND,
            txnRef,
            responseCode
        });

        // Confetti animation
        createConfetti();
    }, [orderId, amountVND, txnRef, responseCode]);

    const createConfetti = () => {
        const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
        const confettiCount = 50;

        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 3 + 's';
            confetti.style.animationDuration = Math.random() * 3 + 2 + 's';
            document.querySelector('.payment-success-page')?.appendChild(confetti);
        }
    };

    return (
        <div className="payment-success-page">
            <div className="success-container">
                {/* Success Icon */}
                <div className="success-icon-wrapper">
                    <div className="success-icon">
                        <div className="checkmark">✓</div>
                    </div>
                </div>

                {/* Success Message */}
                <h1 className="success-title">Thanh toán thành công!</h1>
                <p className="success-subtitle">
                    Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi
                </p>

                {/* Order Details */}
                <div className="order-details">
                    <div className="detail-item">
                        <span className="detail-label">Mã đơn hàng:</span>
                        <span className="detail-value">{orderId || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Mã giao dịch:</span>
                        <span className="detail-value">{txnRef || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Số tiền:</span>
                        <span className="detail-value price">
                            {amountVND.toLocaleString('vi-VN')} VNĐ
                        </span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Phương thức:</span>
                        <span className="detail-value method">
                            VNPay
                        </span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Thời gian:</span>
                        <span className="detail-value">
                            {new Date().toLocaleString('vi-VN')}
                        </span>
                    </div>
                </div>

                {/* Next Steps */}
                <div className="next-steps">
                    <h3>Các bước tiếp theo:</h3>
                    <ul>
                        <li>Đến điểm thuê đúng giờ để nhận xe</li>
                        <li>Mang theo CMND/CCCD và giấy phép lái xe</li>
                        <li>Kiểm tra tình trạng xe trước khi nhận</li>
                    </ul>
                </div>

                {/* Action Buttons */}
                <div className="action-buttons">
                    <button
                        onClick={() => navigate('/my-bookings')}
                        className="btn-primary"
                    >
                        Về trang đơn hàng
                    </button>
                    {orderId && (
                        <button
                            onClick={() => {
                                // Navigate to My Bookings and scroll to this order
                                navigate('/my-bookings', {
                                    state: { highlightOrderId: orderId }
                                });
                            }}
                            className="btn-detail"
                        >
                            Xem chi tiết đơn hàng
                        </button>
                    )}
                    <button
                        onClick={() => navigate('/')}
                        className="btn-secondary"
                    >
                        Về trang chủ
                    </button>
                </div>

                {/* Support */}
                <div className="support-info">
                    <p>
                        Cần hỗ trợ? Liên hệ hotline: <strong>1900-6767</strong>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccessPage;