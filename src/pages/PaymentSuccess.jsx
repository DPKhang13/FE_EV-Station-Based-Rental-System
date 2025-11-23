import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./PaymentSuccess.css";

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("PENDING");

  // Get params from URL
  const orderId = searchParams.get("orderId") || "N/A";
  const amount = searchParams.get("amount");
  const txnRef = searchParams.get("txnRef");
  const method = searchParams.get("method") || "captureWallet";
  const orderInfo = searchParams.get("orderInfo");
  const payType = searchParams.get("payType");

  useEffect(() => {
    const statusParam = searchParams.get("status");
    setStatus(statusParam === "SUCCESS" ? "SUCCESS" : "FAILED");
  }, [searchParams]);

  const formatMethod = (method) => {
    if (method === "captureWallet") return "MoMo";
    if (method === "CASH") return "Tiền mặt";
    return method;
  };

  const formatDate = (dateString) => {
    if (!dateString) return new Date().toLocaleDateString("vi-VN");
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="payment-success-page">
      <div className="success-card">
        {/* Header with Title and Icon */}
        <div className="success-header">
          <h1 className="success-title">Đã thanh toán!</h1>
          <div className="success-icon-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M5 12l5 5l10 -10" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Confirmation Message */}
        <div className="confirmation-message">
          <p>
            Giao dịch của bạn đã được xác nhận và số tiền{" "}
            <span className="highlight-amount">
              {amount ? Number(amount).toLocaleString("vi-VN") + " VNĐ" : "N/A"}
            </span>{" "}
            đã được thanh toán thành công.
          </p>
        </div>

        {/* Dashed Separator */}
        <div className="dashed-separator"></div>

        {/* Transaction Details - Receipt Style */}
        <div className="receipt-details">
          <div className="receipt-item">
            <span className="receipt-label">NGÀY:</span>
            <span className="receipt-value">{formatDate(new Date())}</span>
          </div>
          <div className="receipt-item">
            <span className="receipt-label">GIỜ:</span>
            <span className="receipt-value">{formatTime(new Date())}</span>
          </div>
          <div className="receipt-item">
            <span className="receipt-label">MÃ ĐƠN HÀNG:</span>
            <span className="receipt-value">{orderId}</span>
          </div>
          {txnRef && (
            <div className="receipt-item">
              <span className="receipt-label">MÃ GIAO DỊCH:</span>
              <span className="receipt-value">{txnRef}</span>
            </div>
          )}
          <div className="receipt-item">
            <span className="receipt-label">PHƯƠNG THỨC:</span>
            <span className="receipt-value">{formatMethod(method)}</span>
          </div>
          <div className="receipt-item">
            <span className="receipt-label">TRẠNG THÁI:</span>
            <span className="receipt-value status-badge" style={{ background: 'none', border: 'none', padding: 0, borderRadius: 0, boxShadow: 'none' }}>Thành công</span>
          </div>
        </div>

        {/* Total Amount */}
        <div className="total-section">
          <div className="perforated-border"></div>
          <div className="total-amount">
            <span className="total-label">Tổng tiền:</span>
            <span className="total-value">
              {amount ? Number(amount).toLocaleString("vi-VN") + " VNĐ" : "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={() => navigate("/my-bookings")}
        className="btn-continue"
      >
        Tiếp tục
      </button>
    </div>
  );
};

export default PaymentSuccessPage;
