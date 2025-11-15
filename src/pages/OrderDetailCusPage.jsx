import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api"; // axios instance
import { AuthContext } from "../context/AuthContext";
import "./OrderDetailCusPage.css";

const OrderDetailCusPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [orderDetails, setOrderDetails] = useState([]);
  const [payments, setPayments] = useState([]);
  const [orderStatus, setOrderStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState(null); // 1: đặt cọc, 3: toàn bộ
  const [selectedMethod, setSelectedMethod] = useState(null); // 'CASH' hoặc 'captureWallet'
  
  const isStaff = user?.role === "staff" || user?.role === "admin";
  
  // Debug: Log user role
  useEffect(() => {
    console.log("👤 USER INFO:", {
      userId: user?.userId,
      role: user?.role,
      isStaff: isStaff,
      email: user?.email
    });
  }, [user, isStaff]);

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

  // ============================
  // FETCH PAYMENTS
  // ============================
  const fetchPayments = async () => {
    try {
      const res = await api.get(`/payment/order/${orderId}`);
      const paymentList = Array.isArray(res)
        ? res
        : Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];
      
      console.log("💰 PAYMENTS:", paymentList);
      console.log("💰 PAYMENTS COUNT:", paymentList.length);
      paymentList.forEach((p, idx) => {
        console.log(`💰 Payment ${idx + 1}:`, {
          paymentId: p.paymentId,
          status: p.status,
          method: p.method,
          paymentType: p.paymentType,
          amount: p.amount
        });
      });
      setPayments(paymentList);
    } catch (err) {
      console.error("❌ Lỗi khi tải payments:", err);
      // Không set error vì có thể endpoint chưa tồn tại
      setPayments([]);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  // ============================
  // HANDLE PAYMENT
  // ============================
  const handlePayment = async (paymentType, method = "captureWallet") => {
    try {
      setProcessing(true);

      const payload = {
        orderId,
        method: method,
        paymentType,
      };

      if (method === "CASH") {
        // Gọi API tạo payment tiền mặt với status PENDING (chờ staff xác nhận)
        console.log("[CASH] Creating cash payment request:", payload);
        
        const res = await api.post("/payment/cash", payload);
        
        const responseData = res?.data || res;
        
        // Kiểm tra nếu có lỗi từ backend
        if (responseData?.status === "ERROR" || responseData?.error) {
          throw new Error(responseData?.message || responseData?.error || "Không thể tạo yêu cầu thanh toán");
        }
        
        // Payment được tạo với status PENDING - chờ staff xác nhận
        console.log("[CASH] Payment request created (PENDING):", responseData);
        
        // Refresh order details và payments để hiển thị payment mới
        await fetchOrderDetails();
        await fetchPayments();
        
        // Hiển thị thông báo đã gửi yêu cầu (không phải thành công)
        alert(
          `📋 Yêu cầu thanh toán tiền mặt đã được gửi!\n\n` +
          `Số tiền: ${responseData.amount?.toLocaleString("vi-VN") || "N/A"} VND\n` +
          `Mã thanh toán: ${responseData.paymentId || "N/A"}\n\n` +
          `Yêu cầu của bạn đang chờ nhân viên xác nhận.\n` +
          `Vui lòng thanh toán khi nhận xe tại cửa hàng.`
        );
        
        // Đóng modal và reset state
        setShowPaymentModal(false);
        setSelectedAmount(null);
        setSelectedMethod(null);
        setProcessing(false);
        return;
      }

      // Xử lý MoMo payment (giữ nguyên logic cũ)
      const res = await api.post("/payment/url", payload);

      const paymentUrl = res?.paymentUrl || res?.data?.paymentUrl || "";

      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        alert("Không nhận được link thanh toán từ server!");
      }
    } catch (err) {
      console.error("Thanh toán lỗi:", err);
      const errorMsg = 
        err?.response?.data?.message || 
        err?.message || 
        "Không thể xử lý thanh toán. Vui lòng thử lại sau.";
      alert(`Lỗi: ${errorMsg}`);
    } finally {
      setProcessing(false);
      // Chỉ đóng modal nếu chưa đóng (CASH đã đóng ở trên)
      if (method !== "CASH") {
        setShowPaymentModal(false);
        setSelectedAmount(null);
        setSelectedMethod(null);
      }
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
  // HANDLE CONFIRM PAYMENT (from modal)
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
  // HANDLE STAFF CONFIRM PAYMENT (approve PENDING payment)
  // ============================
  const handleStaffConfirmPayment = async () => {
    if (!window.confirm("Xác nhận thanh toán này đã được khách hàng thanh toán bằng tiền mặt?")) {
      return;
    }

    try {
      setProcessing(true);
      
      // Backend endpoint: PUT /payment/cash/approve/order/{orderId}
      await api.put(`/payment/cash/approve/order/${orderId}`);
      
      alert("✅ Đã xác nhận thanh toán thành công!");
      
      // Refresh payments và order details để hiển thị status mới
      await fetchPayments();
      await fetchOrderDetails();
    } catch (err) {
      console.error("Lỗi xác nhận thanh toán:", err);
      const errorMsg = 
        err?.response?.data?.message || 
        err?.response?.data?.error ||
        err?.message || 
        "Không thể xác nhận thanh toán. Vui lòng thử lại sau.";
      alert(`Lỗi: ${errorMsg}`);
    } finally {
      setProcessing(false);
    }
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
                {isStaff && <th>Hành động</th>}
              </tr>
            </thead>
            <tbody>
              {orderDetails.map((d) => {
                const type = String(d.type).toUpperCase();
                const status = String(d.status).toUpperCase();
                const methodPayment = String(d.methodPayment || "").toUpperCase();
                
                // Map order detail type to payment type
                const getPaymentTypeFromDetailType = (detailType) => {
                  const typeMap = {
                    "DEPOSIT": 1,
                    "PICKUP": 2,
                    "FULL_PAYMENT": 3,
                    "RENTAL": 3, // RENTAL có thể là full payment hoặc deposit
                    "SERVICE": 5,
                    "SERVICE_SERVICE": 5
                  };
                  return typeMap[detailType] || null;
                };
                
                const paymentType = getPaymentTypeFromDetailType(type);
                
                // Tìm payment CASH PENDING tương ứng với order detail này
                // Tìm theo paymentType hoặc tìm bất kỳ payment CASH PENDING nào của order này
                const relatedPayment = paymentType 
                  ? payments.find(
                      (p) => 
                        String(p.status || "").toUpperCase() === "PENDING" &&
                        String(p.method || "").toUpperCase() === "CASH" &&
                        p.paymentType === paymentType
                    )
                  : payments.find(
                      (p) => 
                        String(p.status || "").toUpperCase() === "PENDING" &&
                        String(p.method || "").toUpperCase() === "CASH"
                    );
                
                // Kiểm tra xem có payment PENDING với method CASH không
                // Nếu có payment CASH PENDING, thì order detail phải hiển thị PENDING
                const hasPendingCashPayment = payments.some(
                  (p) => 
                    String(p.status || "").toUpperCase() === "PENDING" &&
                    String(p.method || "").toUpperCase() === "CASH"
                );
                
                // Nếu có payment CASH PENDING, hiển thị PENDING
                // Nếu không, dùng status từ order detail
                const displayStatus = hasPendingCashPayment ? "PENDING" : status;
                const isPaid = displayStatus === "SUCCESS" && !hasPendingCashPayment;
                const isPending = displayStatus === "PENDING" || hasPendingCashPayment;
                
                // Hiển thị nút xác nhận nếu:
                // - Chỉ staff/admin mới thấy nút (khách hàng không thể tự xác nhận)
                // - methodPayment = "CASH" (từ order detail)
                // - Status là PENDING
                const showConfirmButton = isStaff && 
                                         methodPayment === "CASH" && 
                                         isPending;
                
                console.log("🔍 Order Detail Check:", {
                  detailId: d.detailId,
                  type,
                  status,
                  methodPayment,
                  isPending,
                  hasPendingCashPayment,
                  relatedPayment: relatedPayment ? relatedPayment.paymentId : null,
                  showConfirmButton
                });

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
                      ) : isPending ? (
                        <span
                          style={{
                            background: "#fef3c7",
                            color: "#92400e",
                            padding: "6px 10px",
                            borderRadius: "6px",
                            fontWeight: "600",
                          }}
                        >
                          Chờ xử lý
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
                    {/* Cột Hành động - Chỉ hiển thị cho staff/admin */}
                    {isStaff && (
                      <td>
                        {showConfirmButton ? (
                        <button
                          onClick={() => {
                            // Gọi API với orderId (không cần paymentId nữa)
                            handleStaffConfirmPayment();
                          }}
                          disabled={processing}
                          style={{
                            padding: "10px 20px",
                            background: "#000000",
                            color: "#FFFFFF",
                            border: "2px solid #000000",
                            borderRadius: "0",
                            fontSize: "13px",
                            fontWeight: "600",
                            cursor: processing ? "not-allowed" : "pointer",
                            letterSpacing: "0.5px",
                            textTransform: "uppercase",
                            transition: "all 0.3s ease",
                            opacity: processing ? 0.6 : 1,
                            minWidth: "180px"
                          }}
                          onMouseEnter={(e) => {
                            if (!processing) {
                              e.target.style.background = "#DC0000";
                              e.target.style.borderColor = "#DC0000";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!processing) {
                              e.target.style.background = "#000000";
                              e.target.style.borderColor = "#000000";
                            }
                          }}
                        >
                          {processing ? "Đang xử lý..." : "✅ Xác nhận đã thanh toán"}
                        </button>
                        ) : (
                          <span style={{ color: "#999", fontStyle: "italic" }}>-</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}

      {/* ==============================
          PHẦN HIỂN THỊ PAYMENTS (GIAO DỊCH)
         ============================== */}
      <div style={{ marginTop: "40px" }}>
        <h2 style={{ 
          fontSize: "20px", 
          fontWeight: "600", 
          marginBottom: "20px",
          color: "#000000",
          borderBottom: "2px solid #DC0000",
          paddingBottom: "10px"
        }}>
          Các giao dịch trong đơn hàng
        </h2>

        {payments.length === 0 ? (
          <p style={{ color: "#666", fontStyle: "italic" }}>Chưa có giao dịch nào.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {payments.map((payment) => {
              const status = String(payment.status || "").toUpperCase();
              const method = String(payment.method || "").toUpperCase();
              const isPending = status === "PENDING" || status === "ĐANG KIỂM TRA" || status === "CHECKING";
              const isSuccess = status === "SUCCESS";
              const isCash = method === "CASH";
              
              // Debug: Log chi tiết cho mỗi payment
              console.log("🔍 Payment Check:", {
                paymentId: payment.paymentId,
                rawStatus: payment.status,
                status: status,
                rawMethod: payment.method,
                method: method,
                isPending,
                isCash,
                isStaff,
                shouldShow: isStaff && isPending && isCash
              });
              
              // Debug: Log để kiểm tra điều kiện
              const shouldShowButton = isStaff && isPending && isCash;
              if (shouldShowButton) {
                console.log("✅ Nút xác nhận sẽ hiển thị:", {
                  paymentId: payment.paymentId,
                  status,
                  method,
                  isStaff,
                  isPending,
                  isCash
                });
              } else {
                console.log("❌ Nút KHÔNG hiển thị vì:", {
                  paymentId: payment.paymentId,
                  isStaff: isStaff ? "✅" : "❌",
                  isPending: isPending ? "✅" : "❌",
                  isCash: isCash ? "✅" : "❌"
                });
              }
              
              // Lấy mô tả dựa vào paymentType
              const getPaymentDescription = (type) => {
                const typeMap = {
                  1: "Đặt cọc",
                  2: "Thanh toán phần còn lại",
                  3: "Thanh toán toàn bộ đơn",
                  5: "Thanh toán dịch vụ"
                };
                return typeMap[type] || "Thanh toán";
              };

              return (
                <div
                  key={payment.paymentId}
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #E0E0E0",
                    borderRadius: "0",
                    padding: "20px",
                    position: "relative"
                  }}
                >
                  {/* Status Badge và Nút Xác nhận */}
                  <div style={{ 
                    marginBottom: "16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "16px",
                    flexWrap: "wrap"
                  }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "6px 16px",
                        borderRadius: "0",
                        fontSize: "12px",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        background: isSuccess 
                          ? "#10b981" 
                          : isPending 
                          ? "#facc15" 
                          : "#ef4444",
                        color: isPending ? "#1e293b" : "#FFFFFF"
                      }}
                    >
                      {isSuccess 
                        ? "THÀNH CÔNG" 
                        : isPending 
                        ? "ĐANG CHỜ XÁC NHẬN" 
                        : status}
                    </span>
                    
                    {/* Nút Xác nhận - Chỉ hiển thị cho staff/admin khi: isPending && isCash */}
                    {isStaff && isPending && isCash && (
                      <button
                        onClick={() => {
                          console.log("🔘 Click xác nhận payment cho order:", orderId);
                          handleStaffConfirmPayment();
                        }}
                        disabled={processing}
                        style={{
                          padding: "8px 20px",
                          background: "#000000",
                          color: "#FFFFFF",
                          border: "2px solid #000000",
                          borderRadius: "0",
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor: processing ? "not-allowed" : "pointer",
                          letterSpacing: "0.5px",
                          textTransform: "uppercase",
                          transition: "all 0.3s ease",
                          whiteSpace: "nowrap",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          zIndex: 10
                        }}
                        onMouseEnter={(e) => {
                          if (!processing) {
                            e.target.style.background = "#DC0000";
                            e.target.style.borderColor = "#DC0000";
                            e.target.style.transform = "translateY(-2px)";
                            e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!processing) {
                            e.target.style.background = "#000000";
                            e.target.style.borderColor = "#000000";
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                          }
                        }}
                      >
                        {processing ? "Đang xử lý..." : "✅ Xác nhận đã thanh toán"}
                      </button>
                    )}
                    
                  </div>

                  {/* Payment Info Grid */}
                  <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "1fr 1fr", 
                    gap: "12px 24px" 
                  }}>
                    <p style={{ margin: 0 }}>
                      <span style={{ fontWeight: "600", color: "#666" }}>
                        Thời gian bắt đầu:
                      </span>{" "}
                      {payment.createdAt 
                        ? new Date(payment.createdAt).toLocaleString("vi-VN", {
                            hour12: false,
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit"
                          })
                        : "N/A"}
                    </p>
                    <p style={{ margin: 0 }}>
                      <span style={{ fontWeight: "600", color: "#666" }}>
                        Thời gian kết thúc:
                      </span>{" "}
                      {payment.updatedAt && payment.updatedAt !== payment.createdAt
                        ? new Date(payment.updatedAt).toLocaleString("vi-VN", {
                            hour12: false,
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit"
                          })
                        : "N/A"}
                    </p>
                    <p style={{ margin: 0 }}>
                      <span style={{ fontWeight: "600", color: "#666" }}>
                        Số tiền:
                      </span>{" "}
                      <strong style={{ color: "#000" }}>
                        {payment.amount?.toLocaleString("vi-VN") || "N/A"} VND
                      </strong>
                    </p>
                    <p style={{ margin: 0 }}>
                      <span style={{ fontWeight: "600", color: "#666" }}>
                        Mô tả:
                      </span>{" "}
                      {getPaymentDescription(payment.paymentType)}
                      {payment.method === "CASH" && " (Tiền mặt)"}
                      {payment.method === "captureWallet" && " (MoMo)"}
                    </p>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

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
