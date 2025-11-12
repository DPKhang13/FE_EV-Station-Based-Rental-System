import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("PENDING");

  useEffect(() => {
    // ✅ Đọc trực tiếp kết quả từ URL (do PaymentCallbackPage redirect sang)
    const responseCode = searchParams.get("responseCode");
    if (responseCode === "00") setStatus("SUCCESS");
    else setStatus("FAILED");
  }, [searchParams]);

  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");
  const txnRef = searchParams.get("txnRef");
  const method = searchParams.get("method");

  return (
    <div className="payment-success-page" style={{ textAlign: "center", padding: "40px" }}>
      <h1 style={{ color: status === "SUCCESS" ? "green" : "red" }}>
        {status === "SUCCESS" ? "✅ Thanh toán thành công!" : "❌ Thanh toán thất bại"}
      </h1>

      <p><strong>Mã đơn hàng:</strong> {orderId || "N/A"}</p>
      <p><strong>Mã giao dịch:</strong> {txnRef || "N/A"}</p>
      <p>
        <strong>Số tiền:</strong>{" "}
        {amount
          ? (Number(amount) / 100).toLocaleString("vi-VN") + " VNĐ"
          : "N/A"}
      </p>
      <p><strong>Phương thức:</strong> {method || "VNPay"}</p>
      <p><strong>Trạng thái:</strong> {status === "SUCCESS" ? "Thành công" : "Thất bại"}</p>

      <div style={{ marginTop: "20px" }}>
        <button
          onClick={() => navigate("/my-bookings")}
          style={{ marginRight: "10px", padding: "10px 16px" }}
        >
          🔙 Về danh sách đơn
        </button>
        <button
          onClick={() => navigate("/")}
          style={{ padding: "10px 16px" }}
        >
          🏠 Trang chủ
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
