import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './PaymentFailed.css';

const PaymentFailedPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // ✅ Lấy params từ URL
    const orderId = searchParams.get('orderId');
    const responseCode = searchParams.get('responseCode');
    const txnRef = searchParams.get('txnRef');
    const error = searchParams.get('error');

    // Map response code to Vietnamese message
    const getErrorMessage = (code) => {
        const errorMessages = {
            '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
            '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
            '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
            '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
            '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
            '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).',
            '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
            '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
            '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
            '75': 'Ngân hàng thanh toán đang bảo trì.',
            '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.',
            'processing': 'Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại sau.'
        };
        return errorMessages[code] || 'Giao dịch không thành công. Vui lòng thử lại sau.';
    };

    useEffect(() => {
        console.log('❌ [PaymentFailed] Params:', {
            orderId,
            responseCode,
            txnRef,
            error
        });
    }, [orderId, responseCode, txnRef, error]);

    return (
        <div className="payment-failed-page">
            <div className="failed-container">
                {/* Failed Icon */}
                <div className="failed-icon-wrapper">
                    <div className="failed-icon">
                        <div className="cross-mark">✕</div>
                    </div>
                </div>

                {/* Failed Message */}
                <h1 className="failed-title">Thanh toán thất bại</h1>
                <p className="failed-subtitle">
                    Rất tiếc, giao dịch của bạn không thành công
                </p>

                {/* Error Details */}
                <div className="error-details">
                    <div className="error-message">
                        <svg className="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                            <path d="M12 9v4" />
                            <path d="M12 17h.01" />
                        </svg>
                        <p>{getErrorMessage(responseCode || error)}</p>
                    </div>

                    {orderId && (
                        <div className="detail-item">
                            <span className="detail-label">Mã đơn hàng:</span>
                            <span className="detail-value">{orderId}</span>
                        </div>
                    )}
                    {txnRef && (
                        <div className="detail-item">
                            <span className="detail-label">Mã giao dịch:</span>
                            <span className="detail-value">{txnRef}</span>
                        </div>
                    )}
                    {responseCode && (
                        <div className="detail-item">
                            <span className="detail-label">Mã lỗi:</span>
                            <span className="detail-value error-code">{responseCode}</span>
                        </div>
                    )}
                    <div className="detail-item">
                        <span className="detail-label">Thời gian:</span>
                        <span className="detail-value">
                            {new Date().toLocaleString('vi-VN')}
                        </span>
                    </div>
                </div>

                {/* Next Steps */}
                <div className="next-steps">
                    <h3>Bạn có thể:</h3>
                    <ul>
                        <li>Thử lại thanh toán với phương thức khác</li>
                        <li>Kiểm tra số dư tài khoản</li>
                        <li>Liên hệ ngân hàng nếu vấn đề vẫn tiếp diễn</li>
                        <li>Thanh toán bằng tiền mặt tại điểm thuê</li>
                    </ul>
                </div>

                {/* Action Buttons */}
                <div className="action-buttons">
                    <button
                        onClick={() => navigate('/my-bookings')}
                        className="btn-primary"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
                        </svg>
                        <span>Về trang đơn hàng</span>
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
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.35-4.35" />
                            </svg>
                            <span>Xem chi tiết đơn hàng</span>
                        </button>
                    )}
                    {orderId && (
                        <button
                            onClick={() => navigate(`/payment/${orderId}`)}
                            className="btn-retry"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                                <path d="M21 3v5h-5" />
                                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                                <path d="M3 21v-5h5" />
                            </svg>
                            <span>Thử lại thanh toán</span>
                        </button>
                    )}
                    <button
                        onClick={() => navigate('/')}
                        className="btn-secondary"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                        <span>Về trang chủ</span>
                    </button>
                </div>

                {/* Support */}
                <div className="support-info">
                    <p>
                        Cần hỗ trợ? Liên hệ hotline: <strong>1900-xxxx</strong>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentFailedPage;
