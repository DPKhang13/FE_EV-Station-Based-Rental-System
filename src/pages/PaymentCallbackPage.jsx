import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { paymentService } from "../services/paymentService";
import "./PaymentCallback.css";

const PaymentCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      handleMoMoCallback();
    }, 500); 
  }, []);

  const handleMoMoCallback = async () => {
    try {
      console.log("📞 [MoMoCallback] Processing callback...");

      const momoParams = {};
      for (let [key, value] of searchParams.entries()) {
        momoParams[key] = value;
      }

      console.log("📦 [MoMoCallback] Params:", momoParams);

      // Không có resultCode => lỗi ngay
      if (!momoParams.resultCode) {
        navigate("/payment-failed?error=no-resultCode");
        return;
      }

      let verifyResult = null;

      try {
        console.log("📤 [MoMoCallback] Sending verify request...");
        verifyResult = await paymentService.verifyMoMoPayment(momoParams);
        console.log("🎯 [Verified from BE]:", verifyResult);
      } catch (err) {
        console.error("❌ Backend verify error:", err);

        // ⭐⭐ PARSE ERROR MESSAGE TỪ BACKEND ⭐⭐
        let errorMessage = err?.message || err?.raw?.message || "";
        let parsedMessage = null;
        let errorDetails = null;

        // Thử parse JSON từ error message (format: "HTTP 500: {...}")
        try {
          const jsonMatch = errorMessage.match(/\{.*\}/);
          if (jsonMatch) {
            const jsonStr = jsonMatch[0];
            const parsed = JSON.parse(jsonStr);
            parsedMessage = parsed.message;
            errorDetails = parsed;
          }
        } catch (e) {
          // Nếu không parse được, thử tìm message trong error message string
          const messageMatch = errorMessage.match(/message["\s:]+([^"}\s]+)/i);
          if (messageMatch) {
            parsedMessage = messageMatch[1];
          }
        }

        // ⭐⭐ XỬ LÝ CÁC TRƯỜNG HỢP LỖI CỤ THỂ ⭐⭐
        const orderId = momoParams.orderId || errorDetails?.orderId || "unknown";
        
        // Kiểm tra nếu là PAYMENT_FAILED
        const isPaymentFailed = parsedMessage === "PAYMENT_FAILED" ||
                                errorMessage.includes("PAYMENT_FAILED") || 
                                errorMessage.includes('"message":"PAYMENT_FAILED"');

        // Kiểm tra nếu là PICKUP detail not found
        const isPickupNotFound = parsedMessage?.includes("PICKUP detail not found") ||
                                 errorMessage.includes("PICKUP detail not found") ||
                                 errorMessage.includes("Please create payment URL first");

        if (isPaymentFailed) {
          console.log("⚠️ [MoMoCallback] Payment failed from backend, redirecting to failed page");
          navigate(`/payment-failed?orderId=${orderId}&status=FAILED&reason=PAYMENT_FAILED`);
          return;
        }

        if (isPickupNotFound) {
          console.log("⚠️ [MoMoCallback] PICKUP detail not found, redirecting to failed page");
          navigate(`/payment-failed?orderId=${orderId}&status=FAILED&reason=PICKUP_NOT_FOUND&message=${encodeURIComponent("Đơn hàng chưa sẵn sàng để thanh toán. Vui lòng tạo lại thanh toán.")}`);
          return;
        }

        // ⭐⭐ NẾU LÀ LỖI KHÁC → HIỂN THỊ ERROR MESSAGE ⭐⭐
        const backendMsg = parsedMessage || 
                          errorMessage ||
                          "Máy chủ đang bận hoặc gặp lỗi khi xác minh thanh toán.";

        setError(backendMsg);
        setProcessing(false);
        return;
      }

      // Nếu BE không trả orderId => fallback an toàn
      const orderId = verifyResult?.orderId || momoParams.orderId || "unknown";

      // ==== SUCCESS ====
      const successFromMoMo = momoParams.resultCode === "0";
      const successFromBE = verifyResult?.message === "PAYMENT_SUCCESS";

     if (successFromMoMo || successFromBE) {
 navigate(
  `/payment-success` +
    `?orderId=${orderId}` +
    `&amount=${verifyResult?.amount || momoParams.amount || ""}` +
    `&txnRef=${verifyResult?.transId || momoParams.transId || ""}` +
    `&method=${verifyResult?.method || momoParams.payType || "MoMo"}` +
    `&orderInfo=${encodeURIComponent(momoParams.orderInfo || "")}` +
    `&payType=${momoParams.payType || ""}` +
    `&status=SUCCESS`
);
  return;
}

      // ==== FAILED ====
      navigate(`/payment-failed?orderId=${orderId}&status=FAILED`);
    } catch (err) {
      console.error("❌ [MoMoCallback] Error:", err);

      const msg =
        err?.message ||
        err?.raw?.message ||
        "Có lỗi xảy ra khi xử lý thanh toán MoMo.";

      setError(msg);
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
          <button onClick={() => navigate("/my-bookings")}>
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
        <h2>Đang xử lý thanh toán MoMo...</h2>
        <p>Vui lòng đợi vài giây</p>
      </div>
    </div>
  );
};

export default PaymentCallbackPage;
