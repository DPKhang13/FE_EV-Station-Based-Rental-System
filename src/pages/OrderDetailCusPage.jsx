import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api"; // axios instance
import { orderService } from "../services/orderService";
import { authService, vehicleService } from "../services";
import { AuthContext } from "../context/AuthContext";
import "./OrderDetailCusPage.css";

const OrderDetailCusPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [orderDetails, setOrderDetails] = useState([]);
  const [payments, setPayments] = useState([]);
  const [orderStatus, setOrderStatus] = useState("");
  const [customer, setCustomer] = useState(null);
  const [vehicle, setVehicle] = useState(null);
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

  // ============================
  // FETCH CUSTOMER
  // ============================
  const fetchCustomer = async () => {
    try {
      // Lấy userId từ orderDetails hoặc user context
      const firstDetail = orderDetails[0];
      const customerUserId = firstDetail?.customerId || firstDetail?.userId || user?.userId;
      
      if (!customerUserId) {
        console.warn("⚠️ Không tìm thấy userId để fetch customer");
        return;
      }

      const resCus = await authService.getAllCustomer();
      const customers = resCus.data || resCus || [];
      const foundCustomer = customers.find(
        (c) => String(c.userId).toLowerCase() === String(customerUserId).toLowerCase()
      );
      setCustomer(foundCustomer || null);
    } catch (err) {
      console.error("❌ Lỗi khi tải thông tin khách hàng:", err);
    }
  };

  // ============================
  // FETCH VEHICLE
  // ============================
  const fetchVehicle = async () => {
    try {
      const firstDetail = orderDetails[0];
      if (!firstDetail?.vehicleId) {
        console.warn("⚠️ Không tìm thấy vehicleId để fetch vehicle");
        return;
      }

      const resVehicles = await vehicleService.getVehicles();
      const vehicles = resVehicles.data || resVehicles || [];
      const foundVehicle = vehicles.find(
        (v) => Number(v.vehicleId) === Number(firstDetail.vehicleId)
      );
      setVehicle(foundVehicle || null);
    } catch (err) {
      console.error("❌ Lỗi khi tải thông tin xe:", err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchOrderDetails();
      // Fetch customer và vehicle sau khi có orderDetails
      if (orderDetails.length > 0) {
        await fetchCustomer();
        await fetchVehicle();
      }
      await fetchPayments();
      await fetchOrderStatus();
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  // Fetch customer và vehicle khi orderDetails thay đổi
  useEffect(() => {
    if (orderDetails.length > 0) {
      fetchCustomer();
      fetchVehicle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderDetails]);

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
      
      // Refresh payments, order details và order status để hiển thị status mới
      await fetchPayments();
      await fetchOrderDetails();
      await fetchOrderStatus();
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
  // Format datetime helper
  const fmtVN = (d) =>
    d ? new Date(d).toLocaleString("vi-VN") : "N/A";

  // Chuyển đổi order status sang tiếng Việt
  const getOrderStatusText = (status) => {
    if (!status) return "N/A";
    const statusUpper = String(status).toUpperCase();
    const statusMap = {
      "PENDING": "Chờ xử lý",
      "DEPOSITED": "Đã đặt cọc",
      "BOOKED": "Đã đặt",
      "RENTAL": "Đang thuê",
      "WAITING_FOR_VEHICLE": "Chờ xe",
      "WAITING": "Chờ xe",
      "CONFIRMED": "Đã xác nhận",
      "COMPLETED": "Đã hoàn thành",
      "PENDING_FINAL_PAYMENT": "Chờ thanh toán cuối",
      "CHECKING": "Đang kiểm tra",
      "CANCELLED": "Đã hủy"
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

      {/* CUSTOMER */}
      {customer && (
        <div style={{
          background: "#FFFFFF",
          border: "1px solid #E0E0E0",
          borderRadius: "8px",
          padding: "20px",
          marginBottom: "20px",
          marginTop: "20px"
        }}>
          <h2 style={{ 
            fontSize: "18px", 
            fontWeight: "600", 
            marginBottom: "16px",
            color: "#000000",
            borderBottom: "2px solid #DC0000",
            paddingBottom: "10px"
          }}>
            Thông tin khách hàng
          </h2>

          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "1fr 1fr", 
            gap: "12px 24px" 
          }}>
            <p style={{ margin: 0 }}>
              <span style={{ fontWeight: "600", color: "#666" }}>Họ tên:</span>{" "}
              <strong>{customer.fullName || customer.fullname || "N/A"}</strong>
            </p>
            <p style={{ margin: 0 }}>
              <span style={{ fontWeight: "600", color: "#666" }}>Email:</span>{" "}
              <strong>{customer.email || "N/A"}</strong>
            </p>
            <p style={{ margin: 0 }}>
              <span style={{ fontWeight: "600", color: "#666" }}>Số điện thoại:</span>{" "}
              <strong>{customer.phone || customer.phonenumber || customer.phoneNumber || "N/A"}</strong>
            </p>
          </div>
        </div>
      )}

      {/* VEHICLE */}
      {vehicle && (() => {
        // Lấy thông tin ngày nhận, ngày trả từ order detail
        const rentalDetail = orderDetails.find(d => d.type === "RENTAL") || orderDetails[0];
        const startTime = rentalDetail?.startTime || rentalDetail?.rentalStartTime;
        const endTime = rentalDetail?.endTime || rentalDetail?.rentalEndTime;
        
        return (
          <div style={{
            background: "#FFFFFF",
            border: "1px solid #E0E0E0",
            borderRadius: "8px",
            padding: "20px",
            marginBottom: "20px"
          }}>
            <h2 style={{ 
              fontSize: "18px", 
              fontWeight: "600", 
              marginBottom: "16px",
              color: "#000000",
              borderBottom: "2px solid #DC0000",
              paddingBottom: "10px"
            }}>
              Thông tin xe
            </h2>

            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "1fr 1fr", 
              gap: "12px 24px" 
            }}>
              <p style={{ margin: 0 }}>
                <span style={{ fontWeight: "600", color: "#666" }}>Tên xe:</span>{" "}
                <strong>{vehicle.vehicleName || vehicle.vehicle_name || "N/A"}</strong>
              </p>

              <p style={{ margin: 0 }}>
                <span style={{ fontWeight: "600", color: "#666" }}>Biển số:</span>{" "}
                <strong>{vehicle.plateNumber || vehicle.plate_number || "N/A"}</strong>
              </p>

              <p style={{ margin: 0 }}>
                <span style={{ fontWeight: "600", color: "#666" }}>Loại xe:</span>{" "}
                <strong>
                  {vehicle.type === "4-seater" ? "Xe 4 chỗ" : 
                   vehicle.type === "7-seater" ? "Xe 7 chỗ" : 
                   vehicle.type || vehicle.seat_count ? `Xe ${vehicle.seat_count || vehicle.seatCount} chỗ` : 
                   "N/A"}
                </strong>
              </p>

              <p style={{ margin: 0 }}>
                <span style={{ fontWeight: "600", color: "#666" }}>Màu sắc:</span>{" "}
                <strong>{vehicle.color || "N/A"}</strong>
              </p>

              {startTime && (
                <p style={{ margin: 0 }}>
                  <span style={{ fontWeight: "600", color: "#666" }}>Ngày nhận xe:</span>{" "}
                  <strong>{fmtVN(startTime)}</strong>
                </p>
              )}

              {endTime && (
                <p style={{ margin: 0 }}>
                  <span style={{ fontWeight: "600", color: "#666" }}>Ngày trả xe:</span>{" "}
                  <strong>{fmtVN(endTime)}</strong>
                </p>
              )}

              <p style={{ margin: 0 }}>
                <span style={{ fontWeight: "600", color: "#666" }}>Trạm hiện tại:</span>{" "}
                <strong>{vehicle.stationName || vehicle.station_name || "N/A"}</strong>
              </p>
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
                <th>Xe</th>
                <th>Loại</th>
                <th>Thời gian thuê</th>
                <th>Giá</th>
                <th>Trạng thái</th>
                <th>Phương thức thanh toán</th>
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
                
                // Tìm payment method từ payments array hoặc order detail
                // Ưu tiên: tìm payment có cùng paymentType, nếu không có thì tìm bất kỳ payment nào
                const foundPayment = paymentType
                  ? payments.find((p) => p.paymentType === paymentType)
                  : payments.find((p) => p); // Tìm payment đầu tiên nếu không có paymentType
                
                // Lấy payment method từ payment hoặc order detail
                const paymentMethod = foundPayment 
                  ? String(foundPayment.method || "").toUpperCase()
                  : methodPayment || "";
                
                // Chuyển đổi payment method sang tiếng Việt
                const getPaymentMethodText = (method) => {
                  const methodUpper = String(method || "").toUpperCase();
                  if (methodUpper === "CASH") return "Tiền mặt";
                  if (methodUpper === "CAPTUREWALLET" || methodUpper === "MOMO") return "MoMo";
                  if (methodUpper === "") return "-";
                  return methodUpper;
                };
                
                const paymentMethodText = getPaymentMethodText(paymentMethod);
                
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
