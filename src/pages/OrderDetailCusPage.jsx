import React, { useState, useEffect, useContext, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api"; // axios instance
import { orderService } from "../services/orderService";
// ✅ Đã xóa import không cần thiết vì API order-details đã trả về đầy đủ thông tin
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
  const [selectedAmount, setSelectedAmount] = useState(null); // 1: đặt cọc, 2: phần còn lại, 3: toàn bộ
  const [selectedMethod, setSelectedMethod] = useState(null); // 'CASH' hoặc 'captureWallet'
  const [isServicePayment, setIsServicePayment] = useState(false); // Đánh dấu thanh toán dịch vụ
  
  const remainingAmountFromDetails = useMemo(() => {
    if (!Array.isArray(orderDetails)) return 0;
    // Backend đã tính sẵn remainingAmount (không cộng SERVICE PENDING vì đã có trong remainingAmount của payment)
    // Backend logic:
    // - DEPOSIT: remainingAmount = total - deposit (cộng thêm dịch vụ khi thêm)
    // - FULL_PAYMENT: remainingAmount = 0 ban đầu (cộng thêm dịch vụ khi thêm)
    // - Phí trễ: Cộng vào remainingAmount của DEPOSIT/FULL_PAYMENT
    // - Không cộng SERVICE PENDING (đã có trong remainingAmount)
    // Frontend chỉ cần lấy remainingAmount từ API, không tự tính thêm
    let maxRemainingAmount = 0;
    for (const detail of orderDetails) {
      const remainingAmount = detail?.remainingAmount !== null && detail?.remainingAmount !== undefined 
        ? Number(detail.remainingAmount) 
        : null;
      
      // Lấy giá trị remainingAmount lớn nhất từ API (backend đã tính đúng)
      if (remainingAmount !== null && remainingAmount > 0) {
        maxRemainingAmount = Math.max(maxRemainingAmount, remainingAmount);
      }
    }
    return maxRemainingAmount;
  }, [orderDetails]);
  
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

      // Order status sẽ được fetch từ API preview-return
    } catch (err) {
      console.error("❌ Lỗi khi tải chi tiết đơn:", err);
      setError("Không thể tải thông tin chi tiết đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // FETCH ORDER STATUS
  // ============================
  const fetchOrderStatus = async () => {
    try {
      const preview = await orderService.getReturnPreview(orderId);
      const status = preview?.status || "";
      setOrderStatus(status.toUpperCase());
      console.log("📋 Order status:", status);
    } catch (err) {
      console.warn("⚠️ Cannot fetch order status:", err);
      // Fallback: try to get from order details
      if (orderDetails && orderDetails.length > 0 && orderDetails[0].status) {
        setOrderStatus(orderDetails[0].status.toUpperCase());
      }
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

  // ✅ Không cần fetch customer và vehicle nữa vì API order-details đã trả về đầy đủ thông tin

  useEffect(() => {
    const loadData = async () => {
      // ✅ Gọi các API song song thay vì tuần tự để tăng tốc độ load
      await Promise.all([
        fetchOrderDetails(),
        fetchPayments(),
        fetchOrderStatus()
      ]);
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  // ============================
  // HANDLE PAYMENT
  // ============================
  const handlePayment = async (paymentType, method = "captureWallet") => {
    try {
      setProcessing(true);

      // Xác định paymentType dựa trên loại thanh toán
      let finalPaymentType = paymentType;
      
      // Logic thanh toán (theo backend mới):
      // 1. Đặt cọc (type 1): vẫn như cũ, số tiền còn lại dựa vào remainingAmount của đơn đặt cọc
      // 2. Thanh toán toàn bộ (type 3): backend sẽ set remainingAmount = 0
      // 3. Thanh toán phần còn lại (type 2): dựa vào remainingAmount của DEPOSIT/FULL_PAYMENT
      //    - Backend sẽ trừ amount đã thanh toán khỏi remainingAmount
      //    - Nếu remainingAmount = 0 → chuyển order status thành PAID và mark service details as SUCCESS
      //    - Nếu còn remainingAmount > 0 → giữ hoặc chuyển order status thành PENDING_FINAL_PAYMENT
      // 4. Thanh toán tiền mặt Type 2: Dựa vào remainingAmount của DEPOSIT/FULL_PAYMENT (giống logic online)
      // 5. Thanh toán dịch vụ (type 5): 
      //    - Lấy remainingAmount từ FULL_PAYMENT (type 3) hoặc DEPOSIT (type 1)
      //    - Ưu tiên FULL_PAYMENT trước, sau đó mới đến DEPOSIT
      //    - Khi thanh toán thành công → cập nhật remainingAmount và mark service details as SUCCESS
      
      if (isServicePayment || paymentType === 5) {
        // Thanh toán dịch vụ: dùng type 5 (SERVICE)
        // Backend sẽ lấy remainingAmount từ FULL_PAYMENT (type 3) hoặc DEPOSIT (type 1)
        // Ưu tiên FULL_PAYMENT trước, sau đó mới đến DEPOSIT
        finalPaymentType = 5;
      } else if (paymentType === 1) {
        // Đặt cọc: type 1 (số tiền còn lại dựa vào remainingAmount của đơn đặt cọc)
        finalPaymentType = 1;
      } else if (paymentType === 3) {
        // Thanh toán toàn bộ: type 3 (backend sẽ set remainingAmount = 0)
        finalPaymentType = 3;
      } else if (paymentType === 2) {
        // Thanh toán phần còn lại: type 2 (dựa vào remainingAmount của đơn đặt cọc)
        finalPaymentType = 2;
      }

      const payload = {
        orderId,
        method: method,
        paymentType: finalPaymentType,
      };

      // Xử lý thanh toán tiền mặt và MoMo giống nhau (cùng logic, cùng paymentType)
      // Thanh toán tiền mặt: tạo payment với status PENDING, chờ staff xác nhận
      // Thanh toán MoMo: redirect đến payment URL
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
        
        // ✅ Refresh order details và payments song song để tăng tốc độ
        await Promise.all([
          fetchOrderDetails(),
          fetchPayments()
        ]);
        
        // Hiển thị thông báo đã gửi yêu cầu
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
        setIsServicePayment(false);
        setProcessing(false);
        return;
      }

      // Xử lý MoMo payment (giống CASH nhưng redirect đến payment URL)
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
        setIsServicePayment(false);
      }
    }
  };

  // ============================
  // CHECK IF HAS PENDING PAYMENT
  // ============================
  const hasPendingPayment = () => {
    // Kiểm tra nếu có status PENDING hoặc có số tiền chưa thanh toán
    const hasPending = orderDetails.some((d) => {
      const status = String(d.status).toUpperCase();
      return status === "PENDING";
    });
    return hasPending || remainingAmountFromDetails > 0;
  };

  // ============================
  // CHECK IF HAS DEPOSIT PAYMENT
  // ============================
  const hasDepositPayment = () => {
    // Kiểm tra xem đã có payment DEPOSIT (paymentType = 1) thành công chưa
    return payments.some((p) => {
      const paymentType = p.paymentType;
      const status = String(p.status || "").toUpperCase();
      return paymentType === 1 && status === "SUCCESS";
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
      setIsServicePayment(false);
      setShowPaymentModal(true);
    } else if (type === "PICKUP") {
      // Thanh toán pickup (type 2)
      setSelectedPaymentType("PICKUP");
      setSelectedAmount(2);
      setSelectedMethod(null);
      setIsServicePayment(false);
      setShowPaymentModal(true);
    } else if (type.startsWith("SERVICE")) {
      // Thanh toán dịch vụ: dùng type 5 (SERVICE)
      // Backend sẽ lấy remainingAmount từ FULL_PAYMENT (type 3) hoặc DEPOSIT (type 1)
      // Ưu tiên FULL_PAYMENT trước, sau đó mới đến DEPOSIT
      // Nếu không có khoản dịch vụ nào → throw exception
      setSelectedPaymentType("SERVICE");
      setSelectedAmount(5); // Type 5: thanh toán dịch vụ
      setSelectedMethod(null);
      setIsServicePayment(true); // Đánh dấu là thanh toán dịch vụ
      setShowPaymentModal(true);
    } else {
      setIsServicePayment(false);
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
      
      // ✅ Refresh tất cả dữ liệu song song để tăng tốc độ
      await Promise.all([
        fetchPayments(),
        fetchOrderDetails(),
        fetchOrderStatus()
      ]);
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
  // Format datetime: ngày trước, giờ sau (dd/MM/yyyy HH:mm)
  const fmtDateTimeVN = (d) => {
    if (!d) return "N/A";
    const date = new Date(d);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  // Chuyển đổi tên màu sang mã màu hex
  const getColorHex = (colorName) => {
    if (!colorName) return "#CCCCCC";
    const colorMap = {
      "RED": "#FF0000",
      "BLUE": "#0000FF",
      "GREEN": "#008000",
      "YELLOW": "#FFFF00",
      "BLACK": "#000000",
      "WHITE": "#FFFFFF",
      "SILVER": "#C0C0C0",
      "GRAY": "#808080",
      "GREY": "#808080",
      "ORANGE": "#FFA500",
      "PURPLE": "#800080",
      "PINK": "#FFC0CB",
      "BROWN": "#A52A2A"
    };
    return colorMap[String(colorName).toUpperCase()] || "#CCCCCC";
  };

  // Chuyển đổi order status sang tiếng Việt
  const getOrderStatusText = (status) => {
    if (!status) return "N/A";
    const statusUpper = String(status).toUpperCase();
    const statusMap = {
      "PENDING": "Chưa thanh toán",
      "DEPOSITED": "Đã đặt cọc",
      "BOOKED": "Đã đặt",
      "RENTAL": "Đang thuê",
      "WAITING_FOR_VEHICLE": "Chờ xe",
      "WAITING": "Chờ xe",
      "CONFIRMED": "Đã xác nhận",
      "COMPLETED": "Đã hoàn thành",
      "PENDING_FINAL_PAYMENT": "Chờ thanh toán ",
      "CHECKING": "Đang kiểm tra",
      "CANCELLED": "Đã hủy",
      "FAILED": "Đã hủy",
      "PAYMENT_FAILED": "Thanh toán thất bại",
      "PAID": "Đã thanh toán",
      "SUCCESS": "Thành công"
    };
    return statusMap[statusUpper] || status;
  };

  return (
    <div className="order-detail-page">
      <h1>Chi tiết đơn hàng</h1>
      
      {/* Trạng thái đơn hàng */}
      {orderStatus && (
        <div style={{
          background: "#F5F5F5",
          borderTop: "2px solid #DC0000",
          padding: "16px 20px",
          marginBottom: "20px"
        }}>
          <p style={{ margin: 0 }}>
            <strong style={{ color: "#DC0000", textTransform: "uppercase" }}>Trạng thái: </strong>
            <span style={{ color: "#333", fontWeight: "500" }}>{getOrderStatusText(orderStatus)}</span>
          </p>
        </div>
      )}

      {/* CUSTOMER - Lấy từ orderDetails */}
      {orderDetails.length > 0 && orderDetails[0] && (
        <div className="order-info-card">
          <div className="order-info-card-header">
            <h2 className="order-info-title">Thông tin khách hàng</h2>
          </div>

          <div className="order-info-grid">
            <div className="order-info-item">
              <div className="order-info-icon-circle">
                <svg style={{ width: "16px", height: "16px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div className="order-info-text">
                <span className="order-info-label">Họ tên</span>
                <span className="order-info-value">
                  {orderDetails[0].customerName || "N/A"}
                </span>
              </div>
            </div>

            <div className="order-info-item">
              <div className="order-info-icon-circle">
                <svg style={{ width: "16px", height: "16px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div className="order-info-text">
                <span className="order-info-label">Email</span>
                <span className="order-info-value">
                  {orderDetails[0].email || "N/A"}
                </span>
              </div>
            </div>

            <div className="order-info-item">
              <div className="order-info-icon-circle">
                <svg style={{ width: "16px", height: "16px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <div className="order-info-text">
                <span className="order-info-label">Số điện thoại</span>
                <span className="order-info-value">
                  {orderDetails[0].phone || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VEHICLE - Lấy từ orderDetails */}
      {orderDetails.length > 0 && orderDetails[0] && (() => {
        const firstDetail = orderDetails[0];
        const startTime = firstDetail?.startTime;
        const endTime = firstDetail?.endTime;
        
        return (
          <div className="vehicle-info-card">
            <div className="vehicle-info-header">
              <h2 className="vehicle-name">
                {firstDetail.vehicleName || "Thông tin xe"}
              </h2>
            </div>

            <div className="vehicle-meta-grid">
              <div className="vehicle-meta-item">
                <div className="vehicle-meta-icon-box">
                  <svg style={{ width: "16px", height: "16px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1" />
                    <polygon points="12 15 17 21 7 21 12 15" />
                  </svg>
                </div>
                <div className="vehicle-meta-text">
                  <span className="vehicle-meta-label">Biển số</span>
                  <span className="vehicle-meta-value">
                    {firstDetail.plateNumber || "N/A"}
                  </span>
                </div>
              </div>

              <div className="vehicle-meta-item">
                <div className="vehicle-meta-icon-box">
                  <svg style={{ width: "16px", height: "16px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="3" y1="9" x2="21" y2="9" />
                    <line x1="9" y1="21" x2="9" y2="9" />
                  </svg>
                </div>
                <div className="vehicle-meta-text">
                  <span className="vehicle-meta-label">Loại xe</span>
                  <span className="vehicle-meta-value">
                    {firstDetail.carmodel || "N/A"}
                  </span>
                </div>
              </div>

              <div className="vehicle-meta-item">
                <div className="vehicle-meta-icon-box">
                  <svg style={{ width: "16px", height: "16px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
                    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
                    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
                    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
                  </svg>
                </div>
                <div className="vehicle-meta-text">
                  <span className="vehicle-meta-label">Màu sắc</span>
                  <span className="vehicle-meta-value" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {firstDetail.color || "N/A"}
                    {firstDetail.color && (
                      <span
                        style={{
                          width: "16px",
                          height: "16px",
                          backgroundColor: getColorHex(firstDetail.color),
                          border: "1px solid #E5E5E5",
                          borderRadius: "3px",
                          display: "inline-block",
                          flexShrink: 0
                        }}
                      />
                    )}
                  </span>
                </div>
              </div>

              <div className="vehicle-meta-item">
                <div className="vehicle-meta-icon-box">
                  <svg style={{ width: "16px", height: "16px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div className="vehicle-meta-text">
                  <span className="vehicle-meta-label">Trạm hiện tại</span>
                  <span className="vehicle-meta-value">
                    {firstDetail.stationName || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div className="vehicle-time-grid">
              {startTime && (
                <div className="vehicle-time-item">
                  <span className="vehicle-time-label">Ngày nhận xe</span>
                  <span className="vehicle-time-value">
                    {fmtDateTimeVN(startTime)}
                  </span>
                </div>
              )}

              {endTime && (
                <div className="vehicle-time-item">
                  <span className="vehicle-time-label">Ngày trả xe</span>
                  <span className="vehicle-time-value">
                    {fmtDateTimeVN(endTime)}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* ⭐⭐ BANNER THÔNG BÁO WAITING - Khi detail status là WAITING ⭐⭐ */}
      {orderDetails.some(d => String(d.status || "").toUpperCase() === "WAITING") && (
        <div style={{
          backgroundColor: "#FFF3CD",
          border: "2px solid #FFC107",
          borderRadius: "8px",
          padding: "20px",
          marginBottom: "20px",
          marginTop: "20px"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>
            <span style={{ fontSize: "24px" }}>⚠️</span>
            <div>
              <h3 style={{ margin: 0, color: "#856404", fontSize: "18px", fontWeight: "bold" }}>
                Xe này đã được khách hàng khác thuê
              </h3>
              <p style={{ margin: "8px 0 0 0", color: "#856404", fontSize: "14px" }}>
                Đơn hàng của bạn đang trong hàng chờ. Chúng tôi sẽ thông báo khi xe có sẵn để bàn giao.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ⭐⭐ BANNER THÔNG BÁO CONFIRMED - Xe đã có sẵn ⭐⭐ */}
      {orderDetails.some(d => String(d.status || "").toUpperCase() === "CONFIRMED") && (
        <div style={{
          backgroundColor: "#D1FAE5",
          border: "2px solid #10B981",
          borderRadius: "8px",
          padding: "20px",
          marginBottom: "20px",
          marginTop: "20px"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>
            <span style={{ fontSize: "24px" }}>✅</span>
            <div>
              <h3 style={{ margin: 0, color: "#065F46", fontSize: "18px", fontWeight: "bold" }}>
                Xe đã có sẵn! Bạn có thể đến nhận xe
              </h3>
              <p style={{ margin: "8px 0 0 0", color: "#065F46", fontSize: "14px" }}>
                Xe đã sẵn sàng để bàn giao. Vui lòng đến trạm để hoàn tất thủ tục nhận xe.
              </p>
            </div>
          </div>
        </div>
      )}

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
                <th>Loại</th>
                <th>Thời gian thuê</th>
                <th>Giá</th>
                <th>Trạng thái</th>
                <th>Phương thức thanh toán</th>
                {isStaff && <th>Hành động</th>}
              </tr>
            </thead>
            <tbody>
              {(() => {
                // ⭐⭐ SẮP XẾP: SERVICE hiển thị trước, sau đó mới đến các loại khác ⭐⭐
                // Trong cùng loại, cái nào tạo trước (detailId nhỏ hơn) lên đầu
                const sortedDetails = [...orderDetails].sort((a, b) => {
                  const typeA = String(a.type || "").toUpperCase();
                  const typeB = String(b.type || "").toUpperCase();
                  const isServiceA = typeA === "SERVICE" || typeA === "SERVICE_SERVICE";
                  const isServiceB = typeB === "SERVICE" || typeB === "SERVICE_SERVICE";
                  
                  // SERVICE luôn hiển thị trước
                  if (isServiceA && !isServiceB) return -1;
                  if (!isServiceA && isServiceB) return 1;
                  
                  // Nếu cùng loại, sắp xếp theo detailId (cái nào tạo trước lên đầu)
                  if (isServiceA === isServiceB) {
                    const idA = a.detailId || a.id || a.orderDetailId || 0;
                    const idB = b.detailId || b.id || b.orderDetailId || 0;
                    return idA - idB;
                  }
                  
                  // Nếu không cùng loại và không phải SERVICE, giữ nguyên thứ tự
                  return 0;
                });
                
                return sortedDetails.map((d, index) => {
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
                    "SERVICE": 5, // SERVICE dùng paymentType = 5 (mới)
                    "SERVICE_SERVICE": 5 // SERVICE dùng paymentType = 5 (mới)
                  };
                  return typeMap[detailType] || null;
                };
                
                const paymentType = getPaymentTypeFromDetailType(type);
                
                // ⭐⭐ Tìm payment CASH PENDING tương ứng với order detail này ⭐⭐
                // Tìm theo paymentType hoặc tìm bất kỳ payment CASH PENDING nào của order này
                const pendingCashPayment = paymentType 
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
                
                // ⭐⭐ Kiểm tra payment tương ứng đã SUCCESS chưa (không phân biệt status) ⭐⭐
                const relatedPayment = paymentType 
                  ? payments.find(
                      (p) => 
                        String(p.method || "").toUpperCase() === "CASH" &&
                        p.paymentType === paymentType
                    )
                  : payments.find(
                      (p) => 
                        String(p.method || "").toUpperCase() === "CASH"
                    );
                
                const isPaymentSuccess = relatedPayment && String(relatedPayment.status || "").toUpperCase() === "SUCCESS";
                
                // Tìm payment method từ order detail hoặc payments array (BACKUP)
                // ⭐⭐ ƯU TIÊN: Payment PENDING (vừa tạo) > methodPayment từ detail > Payment SUCCESS > Payment khác ⭐⭐
                const isService = type === "SERVICE" || type === "SERVICE_SERVICE";
                let paymentMethod = "";
                
                // ⭐⭐ BƯỚC 1: Tìm payment PENDING trước (payment vừa tạo, chưa được xác nhận) ⭐⭐
                // Điều này đảm bảo sau khi bấm chọn phương thức thanh toán, hiển thị ngay lập tức
                let foundPendingPayment = null;
                if (paymentType) {
                  foundPendingPayment = payments.find(p => 
                    p.paymentType === paymentType && 
                    String(p.status || "").toUpperCase() === "PENDING"
                  );
                }
                
                if (foundPendingPayment && foundPendingPayment.method) {
                  // Có payment PENDING → dùng method từ payment vừa tạo
                  paymentMethod = String(foundPendingPayment.method).toUpperCase();
                } else if (methodPayment && methodPayment.trim() !== "") {
                  // Không có payment PENDING → dùng methodPayment từ detail (backend đã cập nhật)
                  paymentMethod = String(methodPayment).toUpperCase();
                } else {
                  // ⭐⭐ ĐỐI VỚI SERVICE: Nếu chưa có payment và status = PENDING → hiển thị "Chưa có" ⭐⭐
                  if (isService && status === "PENDING") {
                    // Kiểm tra lại xem có payment nào không (kể cả SUCCESS)
                    const anyServicePayment = paymentType
                      ? payments.find((p) => p.paymentType === paymentType)
                      : null;
                    
                    if (!anyServicePayment) {
                      paymentMethod = ""; // Để hiển thị "Chưa có"
                    } else {
                      // Có payment nhưng không phải PENDING → dùng method từ payment đó
                      paymentMethod = String(anyServicePayment.method || "").toUpperCase();
                    }
                  } else {
                    // Nếu detail chưa có methodPayment, mới fallback sang payments
                    const foundPayment = paymentType
                      ? payments.find((p) => p.paymentType === paymentType)
                      : payments.find((p) => p); // Tìm payment đầu tiên nếu không có paymentType

                    if (foundPayment && foundPayment.method) {
                      paymentMethod = String(foundPayment.method).toUpperCase();
                    }
                  }
                }
                
                // Chuyển đổi payment method sang tiếng Việt
                const getPaymentMethodText = (method) => {
                  if (!method || method.trim() === "") return "Chưa có";
                  const methodUpper = String(method).toUpperCase();
                  if (methodUpper === "CASH") return "Tiền mặt";
                  if (methodUpper === "CAPTUREWALLET" || methodUpper === "MOMO") return "MoMo";
                  return methodUpper;
                };
                
                // Chuyển đổi type sang tiếng Việt
                const getTypeLabel = (detailType) => {
                  const typeUpper = String(detailType).toUpperCase();
                  if (typeUpper === "DEPOSIT") return "Đặt xe";
                  if (typeUpper === "PICKUP") return "Thuê xe";
                  if (typeUpper === "FULL_PAYMENT") return "Thuê xe";
                  if (typeUpper === "RENTAL") return "Thuê xe";
                  if (typeUpper === "SERVICE" || typeUpper === "SERVICE_SERVICE") return "Dịch vụ";
                  if (typeUpper === "REFUND") return "Hoàn tiền";
                  return detailType;
                };
                
                const paymentMethodText = getPaymentMethodText(paymentMethod);
                const typeLabel = getTypeLabel(type);
                
                // Kiểm tra xem detail hiện tại có payment CASH PENDING tương ứng không
                const hasPendingCashPayment = !!pendingCashPayment;
                
                // Nếu detail này có payment CASH PENDING → hiển thị PENDING
                // Nếu không → dùng status từ order detail (SUCCESS / ... do backend trả về)
                const displayStatus = hasPendingCashPayment ? "PENDING" : status;
                const isPaid = displayStatus === "SUCCESS" && !hasPendingCashPayment;
                const isPending = displayStatus === "PENDING" || hasPendingCashPayment;
                const isFailed = displayStatus === "FAILED" || displayStatus === "CANCELLED" || displayStatus === "PAYMENT_FAILED";
                
                // Lấy text trạng thái bằng tiếng Việt
                const statusText = getOrderStatusText(displayStatus);
                
                // ⭐⭐ HIỂN THỊ NÚT KHI: STAFF + CASH + CÓ PENDING + CHƯA SUCCESS ⭐⭐
                // ⭐⭐ ẨN NÚT KHI: KHÔNG STAFF HOẶC KHÔNG CASH HOẶC KHÔNG CÓ PENDING HOẶC ĐÃ SUCCESS ⭐⭐
                const showConfirmButton = isStaff && 
                                         methodPayment === "CASH" && 
                                         pendingCashPayment !== null &&
                                         !isPaymentSuccess;
                
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
                  <tr key={d.detailId || d.id || d.orderDetailId || index}>
                    <td>{index + 1}</td>
                    <td>{typeLabel}</td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", flexDirection: "column", lineHeight: "1.5" }}>
                        <span>{fmtDateTimeVN(d.startTime)}</span>
                        <span>{fmtDateTimeVN(d.endTime)}</span>
                      </div>
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
                          {statusText}
                        </span>
                      ) : isFailed ? (
                        <span
                          style={{
                            background: "#fee2e2",
                            color: "#991b1b",
                            padding: "6px 10px",
                            borderRadius: "6px",
                            fontWeight: "600",
                          }}
                        >
                          {statusText}
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
                          {statusText}
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
                          {statusText}
                        </span>
                      )}
                    </td>
                    {/* Cột Phương thức thanh toán */}
                    <td style={{
                      whiteSpace: "normal",
                      wordWrap: "break-word",
                      maxWidth: "150px",
                      wordBreak: "break-word"
                    }}>
                      <span style={{
                        fontWeight: "500",
                        color: paymentMethod === "CASH" ? "#DC0000" : "#0066CC",
                        display: "inline-block",
                        maxWidth: "100%"
                      }}>
                        {paymentMethodText}
                      </span>
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
                });
              })()}
            </tbody>
          </table>
        </>
      )}

      {/* Số tiền chưa thanh toán - Nằm dưới bảng, góc bên phải - Chỉ hiển thị khi còn số tiền chưa thanh toán */}
      {remainingAmountFromDetails > 0 && (
        <div style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "20px",
          marginBottom: "20px"
        }}>
          <div style={{
            background: "#FFFFFF",
            border: "1px solid #E0E0E0",
            borderRadius: "8px",
            padding: "20px",
            minWidth: "300px",
            textAlign: "right"
          }}>
            <h2 style={{ 
              fontSize: "18px", 
              fontWeight: "600", 
              marginBottom: "16px",
              color: "#000000",
              borderBottom: "2px solid #DC0000",
              paddingBottom: "10px",
              textAlign: "left"
            }}>
              Số tiền chưa thanh toán
            </h2>
            <div style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "#DC0000",
              textAlign: "right"
            }}>
              {remainingAmountFromDetails.toLocaleString("vi-VN")} VND
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
        {hasPendingPayment() && (
          <button
            className="btn-back"
            onClick={() => {
              // Kiểm tra nếu có số tiền chưa thanh toán
              const remainingAmount = orderDetails.length > 0 && 
                                     orderDetails[0].remainingAmount && 
                                     orderDetails[0].remainingAmount > 0;
              
              if (remainingAmount) {
                // Kiểm tra xem có detail nào là SERVICE chưa thanh toán không
                const unpaidServiceDetails = orderDetails.filter(
                  (d) => {
                    const type = String(d.type || "").toUpperCase();
                    const status = String(d.status || "").toUpperCase();
                    return type.startsWith("SERVICE") && status === "PENDING";
                  }
                );
                
                if (unpaidServiceDetails.length > 0) {
                  // Nếu có dịch vụ chưa thanh toán, dùng type 5 (SERVICE)
                  // Lấy service detail đầu tiên để mở modal
                  const serviceDetail = unpaidServiceDetails[0];
                  handleShowPaymentModal(serviceDetail);
                } else {
                  // Mở modal với 2 lựa chọn: Đặt cọc hoặc Thanh toán toàn bộ
                  setSelectedPaymentType("RENTAL");
                  // Nếu đã có DEPOSIT, tự động set thanh toán phần còn lại (type 2)
                  if (hasDepositPayment()) {
                    setSelectedAmount(2); // Thanh toán phần còn lại (paymentType 2)
                  } else {
                    setSelectedAmount(null); // Để người dùng chọn
                  }
                  setSelectedMethod(null);
                  setIsServicePayment(false);
                  setShowPaymentModal(true);
                }
              } else {
                // Tìm detail có status PENDING
                const pendingDetail = orderDetails.find(
                  (d) => String(d.status).toUpperCase() === "PENDING"
                );
                if (pendingDetail) {
                  // Kiểm tra xem pendingDetail có phải là SERVICE không
                  const isServicePending = String(pendingDetail.type || "").toUpperCase().startsWith("SERVICE");
                  if (isServicePending) {
                    // Nếu là SERVICE PENDING, đảm bảo dùng type 5
                    handleShowPaymentModal(pendingDetail);
                  } else {
                    handleShowPaymentModal(pendingDetail);
                  }
                }
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
            {/* Close button */}
            <button 
              className="modal-close-btn"
              onClick={() => {
                setShowPaymentModal(false);
                setSelectedAmount(null);
                setSelectedMethod(null);
                setIsServicePayment(false);
              }}
            >
              ×
            </button>
            
            <h2>Thanh toán đơn hàng</h2>
            
            {/* Progress indicator */}
            <div className="payment-progress">
              <div className="progress-step active">
                <div className="step-number">1</div>
                <div className="step-label">Thông tin thanh toán</div>
              </div>
              <div className="progress-line"></div>
              <div className="progress-step">
                <div className="step-number">2</div>
                <div className="step-label">Xác nhận</div>
              </div>
            </div>

            {/* Order details summary */}
            <div className="payment-summary-section">
              <div className="summary-row">
                <span className="summary-label">Số tiền chưa thanh toán:</span>
                <span className="summary-value">
                  {remainingAmountFromDetails > 0 
                    ? remainingAmountFromDetails.toLocaleString("vi-VN")
                    : "0"} VND
                </span>
              </div>
              {selectedAmount === 1 && (
                <div className="summary-row">
                  <span className="summary-label">Số tiền đặt cọc:</span>
                  <span className="summary-value">
                    {Math.round(remainingAmountFromDetails / 2).toLocaleString("vi-VN")} VND
                  </span>
                </div>
              )}
            </div>

            {/* Chọn số tiền (hiện với RENTAL và chưa có DEPOSIT, ẩn khi thanh toán dịch vụ) */}
            {selectedPaymentType === "RENTAL" && !hasDepositPayment() && !isServicePayment && (
              <div className="payment-options">
                <h3>Hình thức thanh toán</h3>
                <div className="payment-form-list">
                  <div
                    className={`payment-form-item ${selectedAmount === 3 ? "selected" : ""}`}
                    onClick={() => setSelectedAmount(3)}
                  >
                    <div className="payment-form-content">
                      <div className="payment-form-title">Toàn bộ</div>
                    </div>
                    <div className="payment-form-radio">
                      {selectedAmount === 3 && <div className="radio-dot"></div>}
                    </div>
                  </div>
                  
                  <div
                    className={`payment-form-item ${selectedAmount === 1 ? "selected" : ""}`}
                    onClick={() => setSelectedAmount(1)}
                  >
                    <div className="payment-form-content">
                      <div className="payment-form-title">Đặt cọc</div>
                    </div>
                    <div className="payment-form-radio">
                      {selectedAmount === 1 && <div className="radio-dot"></div>}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Ẩn hình thức thanh toán khi đã có DEPOSIT (thanh toán phần còn lại) */}

            {/* Chọn phương thức thanh toán */}
            <div className="payment-options">
              <h3>Phương thức thanh toán</h3>
              <div className="payment-method-slider">
                <div 
                  className="payment-method-track"
                  onClick={() => {
                    if (selectedMethod === "CASH") {
                      setSelectedMethod("captureWallet");
                    } else {
                      setSelectedMethod("CASH");
                    }
                  }}
                >
                  <div 
                    className={`payment-method-slider-indicator ${selectedMethod === "CASH" ? "slide-left" : "slide-right"}`}
                  ></div>
                  <div className="payment-method-option">
                    <span className={selectedMethod === "CASH" ? "active-text" : ""}>Tiền mặt</span>
                  </div>
                  <div className="payment-method-option">
                    <span className={selectedMethod === "captureWallet" ? "active-text" : ""}>MoMo</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing summary */}
            <div className="pricing-summary">
              <div className="pricing-row">
                <span className="pricing-label">Số tiền:</span>
                <span className="pricing-value">
                  {(() => {
                    const amount = selectedAmount === 1 
                      ? Math.round(remainingAmountFromDetails / 2)
                      : remainingAmountFromDetails;
                    return amount.toLocaleString("vi-VN") + " VND";
                  })()}
                </span>
              </div>
              <div className="pricing-row">
                <span className="pricing-label">Thuế:</span>
                <span className="pricing-value">0 VND</span>
              </div>
              <div className="pricing-row total">
                <span className="pricing-label">Tổng thanh toán:</span>
                <span className="pricing-value total-amount">
                  {(() => {
                    const amount = selectedAmount === 1 
                      ? Math.round(remainingAmountFromDetails / 2)
                      : remainingAmountFromDetails;
                    return amount.toLocaleString("vi-VN") + " VND";
                  })()}
                </span>
              </div>
            </div>

            {/* Action button */}
            <div className="modal-actions-single">
              <button
                className="btn-confirm-large"
                onClick={handleConfirmPayment}
                disabled={processing || !selectedMethod || (selectedPaymentType === "RENTAL" && !selectedAmount && !hasDepositPayment())}
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
