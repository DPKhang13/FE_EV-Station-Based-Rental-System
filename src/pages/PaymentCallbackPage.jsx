import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { paymentService } from '../services/paymentService';
import './PaymentCallback.css';

const PaymentCallbackPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [processing, setProcessing] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        handleCallback();
    }, []);

    const handleCallback = async () => {
        try {
            console.log('📞 [PaymentCallback] Processing VNPay callback...');

            // ✅ Lấy tất cả params từ VNPay
            const vnpParams = {};
            for (let [key, value] of searchParams.entries()) {
                vnpParams[key] = value;
            }

            console.log('📦 [PaymentCallback] VNPay params:', vnpParams);
            console.log('🔍 [PaymentCallback] Response Code:', vnpParams.vnp_ResponseCode);

            // ✅ Gọi API Backend để verify và xử lý payment
            const response = await paymentService.verifyVNPayPayment(vnpParams);

            console.log('✅ [PaymentCallback] Backend response:', response);
            console.log('✅ [PaymentCallback] Backend response.message:', response.message);

            // ✅ Kiểm tra kết quả thanh toán từ responseCode
            const responseCode = vnpParams.vnp_ResponseCode;

            console.log('🎯 [PaymentCallback] DECISION LOGIC:');
            console.log('  - responseCode:', responseCode);
            console.log('  - responseCode === "00"?', responseCode === '00');
            console.log('  - typeof responseCode:', typeof responseCode);

            // ✅ CHECK: Nếu không có responseCode → redirect failed
            if (!responseCode) {
                console.error('❌ [PaymentCallback] NO RESPONSE CODE - Redirect to failed');
                navigate('/payment-failed?error=no-response-code', { replace: true });
                return;
            }

            if (responseCode === '00') {
                // ✅ Thanh toán thành công
                console.log('✅✅✅ [PaymentCallback] CODE 00 - GOING TO SUCCESS');

                const queryParams = new URLSearchParams({
                    orderId: response.orderId,
                    amount: vnpParams.vnp_Amount,
                    method: 'VNPAY',
                    txnRef: vnpParams.vnp_TxnRef,
                    responseCode: responseCode
                }).toString();

                navigate(`/payment-success?${queryParams}`, { replace: true });
            } else {
                // ❌ Thanh toán thất bại
                console.log('❌❌❌ [PaymentCallback] CODE ' + responseCode + ' - GOING TO FAILED');

                const queryParams = new URLSearchParams({
                    orderId: response.orderId || 'unknown',
                    responseCode: responseCode,
                    txnRef: vnpParams.vnp_TxnRef
                }).toString();

                navigate(`/payment-failed?${queryParams}`, { replace: true });
            }

        } catch (err) {
            console.error('❌ [PaymentCallback] Error:', err);
            setError(err.message || 'Có lỗi xảy ra khi xử lý thanh toán');
            setProcessing(false);
        }
    };

    if (error) {
        return (
            <div className="payment-callback-page">
                <div className="callback-container error">
                    <div className="error-icon">❌</div>
                    <h2>Lỗi xử lý thanh toán</h2>
                    <p>{error}</p>
                    <button onClick={() => navigate('/my-bookings')}>
                        Quay lại đơn hàng
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="payment-callback-page">
            <div className="callback-container">
                <div className="spinner"></div>
                <h2>Đang xử lý thanh toán...</h2>
                <p>Vui lòng chờ trong giây lát</p>
            </div>
        </div>
    );
};

export default PaymentCallbackPage;