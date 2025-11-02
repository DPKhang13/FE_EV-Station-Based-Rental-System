import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './PaymentCallbackPage.css';

const PaymentCallbackPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('processing'); // 'processing', 'success', 'failed'
    const [message, setMessage] = useState('Đang xử lý kết quả thanh toán...');

    useEffect(() => {
        // Get VNPay response params
        const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
        const vnp_TxnRef = searchParams.get('vnp_TxnRef');
        const vnp_Amount = searchParams.get('vnp_Amount');
        const vnp_TransactionNo = searchParams.get('vnp_TransactionNo');

        console.log('🔔 VNPay callback received:', {
            responseCode: vnp_ResponseCode,
            txnRef: vnp_TxnRef,
            amount: vnp_Amount,
            transactionNo: vnp_TransactionNo
        });

        // Process payment result
        processPaymentResult(vnp_ResponseCode, vnp_TxnRef, vnp_Amount);
    }, [searchParams]);

    const processPaymentResult = (responseCode, txnRef, amount) => {
        // VNPay response codes:
        // 00: Success
        // Other: Failed

        if (responseCode === '00') {
            setStatus('success');
            setMessage('Thanh toán thành công!');

            // Auto redirect after 3 seconds
            setTimeout(() => {
                navigate('/my-bookings');
            }, 3000);
        } else {
            setStatus('failed');

            // Map error codes to messages
            const errorMessages = {
                '07': 'Giao dịch bị nghi ngờ gian lận',
                '09': 'Thẻ chưa đăng ký dịch vụ Internet Banking',
                '10': 'Xác thực thông tin thẻ không đúng quá 3 lần',
                '11': 'Đã hết hạn chờ thanh toán',
                '12': 'Thẻ bị khóa',
                '13': 'Sai mật khẩu xác thực giao dịch (OTP)',
                '24': 'Khách hàng hủy giao dịch',
                '51': 'Tài khoản không đủ số dư',
                '65': 'Tài khoản vượt quá hạn mức giao dịch trong ngày',
                '75': 'Ngân hàng thanh toán đang bảo trì',
                '79': 'Nhập sai mật khẩu thanh toán quá số lần quy định'
            };

            setMessage(errorMessages[responseCode] || 'Thanh toán thất bại!');
        }
    };

    const getStatusIcon = () => {
        switch (status) {
            case 'processing':
                return '⏳';
            case 'success':
                return '✅';
            case 'failed':
                return '❌';
            default:
                return '⏳';
        }
    };

    const getStatusClass = () => {
        switch (status) {
            case 'success':
                return 'success';
            case 'failed':
                return 'failed';
            default:
                return 'processing';
        }
    };

    return (
        <div className="payment-callback-page">
            <div className="callback-container">
                <div className={`status-card ${getStatusClass()}`}>
                    <div className="status-icon">
                        {getStatusIcon()}
                    </div>
                    <h1 className="status-title">{message}</h1>

                    {status === 'processing' && (
                        <div className="spinner"></div>
                    )}

                    {status === 'success' && (
                        <div className="success-content">
                            <p>✓ Đơn hàng của bạn đã được thanh toán thành công</p>
                            <p>✓ Bạn sẽ được chuyển đến trang lịch sử đơn hàng sau 3 giây...</p>
                        </div>
                    )}

                    {status === 'failed' && (
                        <div className="failed-content">
                            <p>Giao dịch thanh toán không thành công.</p>
                            <p>Vui lòng thử lại hoặc chọn phương thức thanh toán khác.</p>
                        </div>
                    )}

                    <div className="action-buttons">
                        <button
                            onClick={() => navigate('/my-bookings')}
                            className="btn-primary"
                        >
                            Xem Đơn Hàng
                        </button>

                        {status === 'failed' && (
                            <button
                                onClick={() => navigate(-1)}
                                className="btn-secondary"
                            >
                                Thử Lại
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentCallbackPage;
