import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("PENDING");

  // Get params from URL
  const orderId = searchParams.get("orderId") || "N/A";
  const amount = searchParams.get("amount");
  const txnRef = searchParams.get("txnRef");
  const method = searchParams.get("method") || "MoMo";

  useEffect(() => {
    const statusParam = searchParams.get("status");
    setStatus(statusParam === "SUCCESS" ? "SUCCESS" : "FAILED");
  }, [searchParams]);

  return (
    <div className="payment-success-page" style={{ textAlign: "center", padding: "40px" }}>
      <h1 style={{ color: status === "SUCCESS" ? "green" : "red" }}>
        {status === "SUCCESS" ? "✅ Thanh toán thành công!" : "❌ Thanh toán thất bại"}
      </h1>

      <p><strong>Mã đơn hàng:</strong> {orderId}</p>

      <p><strong>Mã giao dịch:</strong> {txnRef || "Không có"}</p>

      <p>
        <strong>Số tiền:</strong>{" "}
        {amount
          ? Number(amount).toLocaleString("vi-VN") + " VNĐ"
          : "Không có"}
      </p>

      <p><strong>Phương thức:</strong> {method}</p>

      <p><strong>Trạng thái:</strong> {status === "SUCCESS" ? "Thành công" : "Thất bại"}</p>
      <p><strong>Order Info:</strong> {searchParams.get("orderInfo")}</p>
      <p><strong>Pay Type:</strong> {searchParams.get("payType")}</p>

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
