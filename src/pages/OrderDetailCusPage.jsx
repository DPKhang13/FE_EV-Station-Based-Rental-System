import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api"; // axios instance
import "./OrderDetailCusPage.css";

const OrderDetailCusPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [orderDetails, setOrderDetails] = useState([]);
  const [orderStatus, setOrderStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState(null); // 1: đặt cọc, 3: toàn bộ
  const [selectedMethod, setSelectedMethod] = useState(null); // 'CASH' hoặc 'captureWallet'

  // ============================
  // FETCH ORDER DETAILS
  // ============================
  const fetchOrderDetails = async () => {
    try {
      setLoading(true);

      const res = await api.get(`/order-details/order/${orderId}`);
      const details = Array.isArray(res)
        ? res
        : Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];

      console.log("DETAILS:", details);
      setOrderDetails(details);

      if (details.length > 0 && details[0].status) {
        setOrderStatus(details[0].status.toUpperCase());
      }
    } catch (err) {
      console.error("❌ Lỗi khi tải chi tiết đơn:", err);
      setError("Không thể tải thông tin chi tiết đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  // ============================
  // HANDLE PAYMENT
  // ============================
  const handlePayment = async (paymentType, method = "captureWallet") => {
    try {
      setProcessing(true);

      if (method === "CASH") {
        alert("Bạn đã chọn thanh toán bằng tiền mặt. Vui lòng thanh toán khi nhận xe.");
        setShowPaymentModal(false);
        setSelectedAmount(null);
        setSelectedMethod(null);
        setProcessing(false);
        return;
      }

      const payload = {
        orderId,
        method: method,
        paymentType,
      };

      const res = await api.post("/payment/url", payload);

      const paymentUrl = res?.paymentUrl || res?.data?.paymentUrl || "";

      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        alert("Không nhận được link thanh toán từ server!");
      }
    } catch (err) {
      console.error("❌ Thanh toán lỗi:", err);
      alert("Không thể tạo thanh toán. Vui lòng thử lại sau.");
    } finally {
      setProcessing(false);
      setShowPaymentModal(false);
      setSelectedAmount(null);
      setSelectedMethod(null);
    }
  };

  // ============================
  // CHECK IF HAS PENDING PAYMENT
  // ============================
  const hasPendingPayment = () => {
    return orderDetails.some((d) => {
      const status = String(d.status).toUpperCase();
      return status === "PENDING";
    });
  };

  // ============================
  // HANDLE SHOW PAYMENT MODAL
  // ============================
  const handleShowPaymentModal = (detail) => {
    const type = String(detail.type).toUpperCase();
    
    if (type === "RENTAL") {
      // Show modal chọn toàn bộ hoặc đặt cọc
      setSelectedPaymentType("RENTAL");
      setSelectedAmount(null);
      setSelectedMethod(null);
      setShowPaymentModal(true);
    } else if (type === "PICKUP") {
      // Thanh toán pickup (type 2)
      setSelectedPaymentType("PICKUP");
      setSelectedAmount(2);
      setSelectedMethod(null);
      setShowPaymentModal(true);
    } else if (type.startsWith("SERVICE")) {
      // Thanh toán service (type 5)
      setSelectedPaymentType("SERVICE");
      setSelectedAmount(5);
      setSelectedMethod(null);
      setShowPaymentModal(true);
    }
  };

  // ============================
  // HANDLE CONFIRM PAYMENT
  // ============================
  const handleConfirmPayment = () => {
    if (!selectedMethod) {
      alert("Vui lòng chọn phương thức thanh toán!");
      return;
    }
    if (selectedPaymentType === "RENTAL" && !selectedAmount) {
      alert("Vui lòng chọn hình thức thanh toán!");
      return;
    }
    handlePayment(selectedAmount, selectedMethod);
  };

  // ============================
  // UI LOADING / ERROR
  // ============================
  if (loading) {
    return (
      <div className="order-detail-page">
        <p>Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-detail-page">
        <h2>Lỗi</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>Quay lại</button>
      </div>
    );
  }

  // ============================
  // MAIN UI
  // ============================
  return (
    <div className="order-detail-page">
      <h1>Chi tiết đơn hàng</h1>
      <p>
        <strong>Mã đơn hàng:</strong> {orderId}
      </p>
      <p>
        <strong>Trạng thái:</strong> {orderStatus || "N/A"}
      </p>

      {orderDetails.length === 0 ? (
        <p>Không có dữ liệu chi tiết.</p>
      ) : (
        <>
          {/* ==============================
              BẢNG RENTAL ORDER DETAIL
             ============================== */}
          <table className="order-detail-table">
            <thead>
              <tr>
                <th>Mã chi tiết</th>
                <th>Xe</th>
                <th>Loại</th>
                <th>Thời gian thuê</th>
                <th>Giá</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {orderDetails.map((d) => {
                const type = String(d.type).toUpperCase();
                const status = String(d.status).toUpperCase();
                const isPaid = status === "SUCCESS";

                return (
                  <tr key={d.detailId}>
                    <td>{d.detailId}</td>
                    <td>{d.vehicleId}</td>
                    <td>{type}</td>
                    <td>
                      {new Date(d.startTime).toLocaleString("vi-VN")} -{" "}
                      {new Date(d.endTime).toLocaleString("vi-VN")}
                    </td>
                    <td>{d.price?.toLocaleString("vi-VN")} VND</td>
                    <td>
                      {isPaid ? (
                        <span
                          style={{
                            background: "#dcfce7",
                            color: "#166534",
                            padding: "6px 10px",
                            borderRadius: "6px",
                            fontWeight: "600",
                          }}
                        >
                          Đã thanh toán
                        </span>
                      ) : (
                        <span
                          style={{
                            background: "#fef3c7",
                            color: "#92400e",
                            padding: "6px 10px",
                            borderRadius: "6px",
                            fontWeight: "600",
                          }}
                        >
                          Chờ thanh toán
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}

      <div style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
        {hasPendingPayment() && (
          <button
            className="btn-back"
            onClick={() => {
              const pendingDetail = orderDetails.find(
                (d) => String(d.status).toUpperCase() === "PENDING"
              );
              if (pendingDetail) {
                handleShowPaymentModal(pendingDetail);
              }
            }}
            disabled={processing}
          >
            Thanh toán
          </button>
        )}
        <button className="btn-back" onClick={() => navigate(-1)}>
          Quay lại
        </button>
      </div>

      {/* ==============================
          PAYMENT MODAL - CHỌN LOẠI THANH TOÁN
         ============================== */}
      {showPaymentModal && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Chọn hình thức thanh toán</h2>
            
            {/* Chọn số tiền (chỉ hiện với RENTAL) */}
            {selectedPaymentType === "RENTAL" && (
              <div className="payment-options">
                <h3>Hình thức</h3>
                <div className="option-buttons">
                  <button
                    className={selectedAmount === 3 ? "option-btn active" : "option-btn"}
                    onClick={() => setSelectedAmount(3)}
                  >
                    <div className="option-icon">💰</div>
                    <div className="option-label">Thanh toán toàn bộ</div>
                  </button>
                  <button
                    className={selectedAmount === 1 ? "option-btn active" : "option-btn"}
                    onClick={() => setSelectedAmount(1)}
                  >
                    <div className="option-icon">💳</div>
                    <div className="option-label">Đặt cọc</div>
                  </button>
                </div>
              </div>
            )}

            {/* Chọn phương thức thanh toán */}
            <div className="payment-options">
              <h3>Phương thức thanh toán</h3>
              <div className="option-buttons">
                <button
                  className={selectedMethod === "CASH" ? "option-btn active" : "option-btn"}
                  onClick={() => setSelectedMethod("CASH")}
                >
                  <div className="option-icon">💵</div>
                  <div className="option-label">Tiền mặt</div>
                </button>
                <button
                  className={selectedMethod === "captureWallet" ? "option-btn active" : "option-btn"}
                  onClick={() => setSelectedMethod("captureWallet")}
                >
                  <div className="option-icon">📱</div>
                  <div className="option-label">MoMo</div>
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedAmount(null);
                  setSelectedMethod(null);
                }}
              >
                Hủy
              </button>
              <button
                className="btn-confirm"
                onClick={handleConfirmPayment}
                disabled={processing || !selectedMethod || (selectedPaymentType === "RENTAL" && !selectedAmount)}
              >
                {processing ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailCusPage;
