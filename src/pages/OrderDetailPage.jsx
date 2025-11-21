import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authService, vehicleService, orderService } from "../services";
import api from "../services/api";
import "./OrderDetailPage.css";

export default function OrderDetailPage() {
  const { orderId, userId } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [returnPreview, setReturnPreview] = useState(null);
  const [returnTime, setReturnTime] = useState("");
  const [showReturnModal, setShowReturnModal] = useState(false);

  const [service, setService] = useState({
    serviceType: "",
    cost: 0,
    description: ""
  });

  const [toast, setToast] = useState(null);
  const [payments, setPayments] = useState([]); // Used for payment status checks
  const [processing, setProcessing] = useState(false);
  const [otherOrders, setOtherOrders] = useState([]); // Các order khác cùng vehicleId
  const [orderStatus, setOrderStatus] = useState(""); // Order status để kiểm tra đơn đã hoàn thành chưa
  
  const showToast = useCallback((type, text, ms = 4000) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), ms);
  }, []);

  const getApiMessage = (err) => {
    if (!err) return "Đã có lỗi xảy ra.";
    if (err.message) {
      const s = err.message;
      const i = s.indexOf("{");
      if (i !== -1) {
        try {
          const obj = JSON.parse(s.slice(i));
          return obj?.message || obj?.error || s;
        } catch {
          return s;
        }
      }
      return s;
    }
    return String(err);
  };

  // Fetch order status để kiểm tra đơn đã hoàn thành chưa
  const fetchOrderStatus = useCallback(async () => {
    try {
      const preview = await orderService.getReturnPreview(orderId);
      const status = String(preview?.status || "").toUpperCase();
      console.log("📋 Order status:", status);
      setOrderStatus(status); // Lưu order status vào state
    } catch (err) {
      console.warn("⚠️ Cannot fetch order status:", err);
      setOrderStatus("");
    }
  }, [orderId]);

  // Fetch payments
  const fetchPayments = useCallback(async () => {
    try {
      const res = await api.get(`/payment/order/${orderId}`);
      const paymentList = Array.isArray(res)
        ? res
        : Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];
      setPayments(paymentList);
    } catch (err) {
      console.error("Lỗi khi tải payments:", err);
      setPayments([]);
    }
  }, [orderId]);

  const refetchDetails = useCallback(async () => {
    const res = await fetch(
      `http://localhost:8080/api/order-details/order/${orderId}`
    );
    const details = await res.json();
    setOrderDetails(details || []);

    const first = details?.[0];
    if (first?.vehicleId) {
      const resVehicles = await vehicleService.getVehicles();
      const vehicles = resVehicles.data || resVehicles || [];
      const foundVehicle = vehicles.find(
        (v) => Number(v.vehicleId) === Number(first.vehicleId)
      );
      if (foundVehicle) setVehicle(foundVehicle);
    }
    
    // Fetch order status
    await fetchOrderStatus();
    // Fetch payments
    await fetchPayments();
  }, [orderId, fetchOrderStatus, fetchPayments]);

  const handlePreviewReturn = async () => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/order/${orderId}/preview-return`
      );
      const data = await res.json();

      setReturnPreview(data);
      setShowReturnModal(true);
    } catch (err) {
      console.error(err);
      showToast("error", "Không thể load thông tin trả xe!");
    }
  };

  const handleConfirmReturn = async () => {
    const time =
      returnTime.trim() !== ""
        ? returnTime
        : new Date().toISOString().slice(0, 19).replace("T", " ");

    try {
      await fetch(`http://localhost:8080/api/order/${orderId}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actualReturnTime: time })
      });

      showToast("success", "🚗 Đã trả xe thành công!");
      setShowReturnModal(false);
      await refetchDetails(); // Refresh order status để ẩn nút bàn giao 
      await fetchOrderStatus(); //  Đảm bảo order status được cập nhật 
    } catch (err) {
      console.error(err);
      showToast("error", "Trả xe thất bại!");
    }
  };

  const handleAddService = async () => {
    if (!service.serviceType.trim()) {
      return showToast("error", "Vui lòng nhập loại dịch vụ!");
    }

    try {
      const payload = {
        orderId,
        serviceType: service.serviceType,
        cost: Number(service.cost) || 0,
        description: service.description
      };

      await fetch("http://localhost:8080/api/order-services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      showToast("success", "➕ Đã thêm dịch vụ!");
      setService({ serviceType: "", cost: 0, description: "" });

      refetchDetails();
    } catch (err) {
      console.error(err);
      showToast("error", "Không thể thêm dịch vụ!");
    }
  };

  const handleConfirmHandover = async () => {
    const ok = window.confirm("Xác nhận bàn giao xe cho khách?");
    if (!ok) return;

    try {
      await orderService.pickup(orderId);
      showToast("success", "✅ Đã xác nhận bàn giao!");
      await refetchDetails();
    } catch (e) {
      console.error(e);
      showToast("error", getApiMessage(e));
    }
  };

  const handleCancelHandover = async () => {
    const ok = window.confirm("Hủy bàn giao và hủy đơn?");
    if (!ok) return;

    try {
      const vehicleId = orderDetails?.[0]?.vehicleId;

      await orderService.update(orderId, {
        status: "CANCELLED",
        vehicleId,
        couponCode: ""
      });

      showToast("success", " Đã hủy bàn giao / hủy đơn!");
      refetchDetails();
    } catch (err) {
      console.error(err);
      showToast("error", getApiMessage(err));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resCus = await authService.getAllCustomer();
        const customers = resCus.data || resCus || [];
        const foundCustomer = customers.find(
          (c) =>
            String(c.userId).toLowerCase() === String(userId).toLowerCase()
        );
        setCustomer(foundCustomer || null);

        const res = await fetch(
          `http://localhost:8080/api/order-details/order/${orderId}`
        );
        const details = await res.json();
        setOrderDetails(details);

        const first = details[0];
        if (first?.vehicleId) {
          const resVehicles = await vehicleService.getVehicles();
          const vehicles = resVehicles.data || resVehicles || [];
          const foundVehicle = vehicles.find(
            (v) => Number(v.vehicleId) === Number(first.vehicleId)
          );
          setVehicle(foundVehicle);
          
          // ⭐⭐ KIỂM TRA: Nếu xe đang RENTAL, kiểm tra xem có order khác đang thuê không ⭐⭐
          if (foundVehicle?.status === "RENTAL") {
            try {
              // Lấy tất cả orders để tìm order khác cùng vehicleId đang RENTAL
              const allOrders = await orderService.getAll();
              const ordersData = Array.isArray(allOrders) ? allOrders : (allOrders?.data || []);
              
              // Tìm order khác cùng vehicleId có status RENTAL (không phải order hiện tại)
              const otherRentalOrders = ordersData.filter(order => {
                const orderVehicleId = order.vehicleId || order.vehicle_id;
                const orderStatus = String(order.status || "").toUpperCase();
                const isSameVehicle = orderVehicleId && Number(orderVehicleId) === Number(first.vehicleId);
                const isRental = orderStatus === "RENTAL";
                const isNotCurrentOrder = String(order.orderId || order.order_id) !== String(orderId);
                
                return isSameVehicle && isRental && isNotCurrentOrder;
              });
              
              setOtherOrders(otherRentalOrders);
              console.log("🔍 [Other Orders Check]:", {
                vehicleId: first.vehicleId,
                vehicleStatus: foundVehicle.status,
                otherRentalOrdersCount: otherRentalOrders.length,
                otherRentalOrders: otherRentalOrders.map(o => ({ orderId: o.orderId || o.order_id, status: o.status }))
              });
            } catch (err) {
              console.warn(" Cannot fetch other orders:", err);
              setOtherOrders([]);
            }
          } else {
            setOtherOrders([]);
          }
        }
        
        // Fetch payments
        await fetchPayments();
        
        // Fetch order status (optional, for logging)
        await fetchOrderStatus();
      } catch (err) {
        console.error(err);
        setError("Không thể tải dữ liệu!");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orderId, userId, fetchOrderStatus, fetchPayments]);

  // Handle confirm payment
  const handleStaffConfirmPayment = useCallback(async () => {
    if (!window.confirm("Xác nhận thanh toán này đã được khách hàng thanh toán bằng tiền mặt?")) {
      return;
    }

    try {
      setProcessing(true);
      await api.put(`/payment/cash/approve/order/${orderId}`);
      showToast("success", " Đã xác nhận thanh toán thành công!");
      await fetchPayments();
      await refetchDetails();
      await fetchOrderStatus(); //Đảm bảo order status được cập nhật ⭐⭐
    } catch (err) {
      console.error("Lỗi xác nhận thanh toán:", err);
      const errorMsg = 
        err?.response?.data?.message || 
        err?.response?.data?.error ||
        err?.message || 
        "Không thể xác nhận thanh toán. Vui lòng thử lại sau.";
      showToast("error", errorMsg);
    } finally {
      setProcessing(false);
    }
  }, [orderId, fetchPayments, fetchOrderStatus, showToast, refetchDetails]);

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

  const depositedOK = orderDetails.some(
    (d) => d.type === "DEPOSIT" && d.status === "SUCCESS"
  );
  const pickupOK = orderDetails.some(
    (d) => d.type === "PICKUP" && d.status === "SUCCESS"
  );
  const fullOK = orderDetails.some(
    (d) => d.type === "FULL_PAYMENT" && d.status === "SUCCESS"
  );

  // ⭐⭐ NƠI THÊM MỚI — CHECK GIAO DỊCH PENDING ⭐⭐
  const hasPendingOrderDetail = orderDetails.some(
    (d) => String(d.status).toUpperCase() === "PENDING"
  );

  if (loading)
    return (
      <div className="order-detail-page">
        <div className="loading">Đang tải dữ liệu...</div>
      </div>
    );

  if (error)
    return (
      <div className="order-detail-page">
        <div className="error">{error}</div>
      </div>
    );

  return (
    <div className="order-detail-page">
      {toast && <div className={`toast ${toast.type}`}>{toast.text}</div>}

      <div className="header">
        <h1>Chi tiết đơn hàng</h1>
      </div>

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
        <div className="info-card">
          <h2>Thông tin khách hàng</h2>

          <div className="info-grid">
            <p><span>Họ tên:</span> {customer.fullName}</p>
            <p><span>Email:</span> {customer.email}</p>
            <p><span>Số điện thoại:</span> {customer.phone}</p>
          </div>
        </div>
      )}

      {/* VEHICLE */}
      {vehicle && (() => {
        // ⭐⭐ HARDCODE: Nếu có order detail WAITING HOẶC xe đang được khách khác thuê, hiển thị WAITING ⭐⭐
        const hasWaitingDetail = orderDetails.some(d => String(d.status || "").toUpperCase() === "WAITING");
        const vehicleRentedByOther = vehicle.status === "RENTAL" && otherOrders.length > 0;
        const shouldDisplayWaiting = hasWaitingDetail || vehicleRentedByOther;
        
        const displayStatus = shouldDisplayWaiting ? "WAITING" : vehicle.status;
        const displayStatusText = shouldDisplayWaiting ? "Đang chờ xe" : vehicle.status;
        
        return (
          <div className="info-card">
            <h2>Thông tin xe</h2>

            <p>
              <strong>{vehicle.vehicleName}</strong> ({vehicle.plateNumber}) –{" "}
              {vehicle.color}
            </p>

            <p>
              <span>Trạng thái:&nbsp;</span>
              <span className={`pill pill-${displayStatus.toLowerCase()}`}>
                {displayStatusText}
              </span>
            </p>

            <p>
              <span>Trạm hiện tại:&nbsp;</span>
              <strong>{vehicle.stationName}</strong>
            </p>
          </div>
        );
      })()}

      {/* ORDER DETAILS */}
      <div className="info-card">
        <h2>Các giao dịch trong đơn hàng</h2>

        {orderDetails.map((detail) => {
          const methodPayment = String(detail.methodPayment || "").toUpperCase();
          let status = String(detail.status || "").toUpperCase();
          
          // ⭐⭐ HARDCODE: Nếu xe đang được khách khác thuê và detail type = RENTAL → hiển thị WAITING ⭐⭐
          const vehicleRentedByOther = vehicle?.status === "RENTAL" && otherOrders.length > 0;
          if (vehicleRentedByOther && detail.type === "RENTAL") {
            status = "WAITING"; // Hardcode status để hiển thị đúng
          }
          
          // ⭐⭐ NÚT "XÁC NHẬN ĐÃ THANH TOÁN" - Kiểm tra điều kiện: CASH + PENDING ⭐⭐
          // Điều kiện 1: methodPayment phải là "CASH"
          const isCashPayment = methodPayment === "CASH";
          
          // Điều kiện 2: Tìm payment CASH PENDING tương ứng với detail này (theo paymentType)
          const detailType = detail.type;
          let paymentType = null;
          if (detailType === "DEPOSIT") paymentType = 1;
          else if (detailType === "PICKUP") paymentType = 2;
          else if (detailType === "FULL_PAYMENT") paymentType = 3;
          
          // Tìm payment CASH PENDING có cùng paymentType (nếu có paymentType)
          // Hoặc tìm bất kỳ payment CASH PENDING nào nếu detail type không có paymentType
          const pendingCashPayment = paymentType !== null 
            ? payments.find(p => 
                String(p.method || "").toUpperCase() === "CASH" && 
                String(p.status || "").toUpperCase() === "PENDING" &&
                p.paymentType === paymentType
              )
            : payments.find(p => 
                String(p.method || "").toUpperCase() === "CASH" && 
                String(p.status || "").toUpperCase() === "PENDING"
              ); // Nếu không có paymentType, tìm bất kỳ payment CASH PENDING nào
          
          // Điều kiện 3: Kiểm tra xem payment có đã SUCCESS chưa (nếu có payment tương ứng)
          // Tìm payment tương ứng (không phân biệt status) để kiểm tra
          const relatedPayment = paymentType !== null 
            ? payments.find(p => 
                String(p.method || "").toUpperCase() === "CASH" && 
                p.paymentType === paymentType
              )
            : payments.find(p => 
                String(p.method || "").toUpperCase() === "CASH"
              );
          
          const isPaymentSuccess = relatedPayment && String(relatedPayment.status || "").toUpperCase() === "SUCCESS";
          
          // ⭐⭐ HIỂN THỊ NÚT KHI: CASH + CÓ PENDING + CHƯA SUCCESS ⭐⭐
          // ⭐⭐ ẨN NÚT KHI: KHÔNG CASH HOẶC KHÔNG CÓ PENDING HOẶC ĐÃ SUCCESS ⭐⭐
          const showConfirmButton = isCashPayment && 
                                   pendingCashPayment !== null && 
                                   !isPaymentSuccess;
          
          // Debug log cho TẤT CẢ details
          console.log("💰 [Detail Check]:", {
            detailId: detail.detailId,
            type: detail.type,
            status,
            methodPayment,
            isCashPayment,
            paymentType,
            pendingCashPayment: pendingCashPayment ? { 
              paymentId: pendingCashPayment.paymentId, 
              status: pendingCashPayment.status,
              method: pendingCashPayment.method,
              paymentType: pendingCashPayment.paymentType
            } : null,
            relatedPayment: relatedPayment ? {
              paymentId: relatedPayment.paymentId,
              status: relatedPayment.status,
              method: relatedPayment.method
            } : null,
            isPaymentSuccess,
            showConfirmButton,
            paymentsCount: payments.length,
            allPayments: payments.map(p => ({ 
              paymentId: p.paymentId, 
              method: p.method, 
              status: p.status, 
              paymentType: p.paymentType 
            }))
          });
          
          return (
            <div key={detail.detailId} className="detail-card">
              <div className="detail-header" style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                gap: "16px"
              }}>
                <span className={`status-tag ${status.toLowerCase()}`}>
                  {(() => {
                    // Sử dụng status đã được hardcode ở trên (có thể là WAITING nếu xe đang được khách khác thuê)
                    if (status === "SUCCESS") return "Thành công";
                    if (status === "FAILED") return "Thất bại";
                    if (status === "PENDING") return "Chờ xử lý";
                    if (status === "CONFIRMED") return "Đã xác nhận";
                    if (status === "WAITING") return "Đang chờ xe";
                    if (status === "CHECKING") return "Đang kiểm tra";
                    if (status === "RENTAL") return "Đang thuê";
                    return detail.status || "N/A";
                  })()}
                </span>
                
                {/* Nút Xác nhận đã thanh toán */}
                {showConfirmButton && (
                  <button
                    onClick={() => {
                      // Gọi API với orderId (không cần paymentId nữa)
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
                      whiteSpace: "nowrap"
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
                )}
              </div>

              <div className="detail-grid">
                <p><span>Thời gian bắt đầu:</span> {fmtVN(detail.startTime)}</p>
                <p><span>Thời gian kết thúc:</span> {fmtVN(detail.endTime)}</p>
                <p><span>Số tiền:</span> {Number(detail.price).toLocaleString("vi-VN")} VND</p>
                <p><span>Mô tả:</span> {detail.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ======================== */}
      {/* ======================== */}
      {/* ⭐ SERVICE FORM — FIX FOR SERVICE_SERVICE */}
      {/* ======================== */}
      <div className="info-card">
        <h2>Dịch vụ phát sinh</h2>

        {/* ==== DANH SÁCH DỊCH VỤ ==== */}
        <div style={{ marginBottom: "16px" }}>
          <h3 style={{ marginBottom: "8px" }}>Danh sách dịch vụ đã tạo</h3>

          {orderDetails.filter(d => d.type === "SERVICE_SERVICE").length === 0 ? (
            <p style={{ color: "#777" }}>Chưa có dịch vụ nào.</p>
          ) : (
            orderDetails
              .filter(d => d.type === "SERVICE_SERVICE")
              .map((sv) => (
                <div key={sv.detailId} className="detail-card">
                  <div className="detail-grid">
                    <p><span>Dịch vụ:</span> {sv.description}</p>
                    <p><span>Giá:</span> {Number(sv.price).toLocaleString("vi-VN")} VND</p>
                    <p><span>Trạng thái:</span> {sv.status}</p>
                  </div>
                </div>
              ))
          )}
        </div>

        <hr />

        {/* ==== TICK DỊCH VỤ CỐ ĐỊNH ==== */}
        <h3>Chọn dịch vụ cố định</h3>
        <div className="fixed-services">
          {[
            { label: "Giao thông", defaultCost: 50000 },
            { label: "Sửa chữa", defaultCost: 150000 },
            { label: "Bảo dưỡng", defaultCost: 100000 },
            { label: "Vệ sinh", defaultCost: 30000 }
          ].map((sv) => (
            <div key={sv.label} className="service-row">
              <label className="checkbox-line">
                <input
                  type="checkbox"
                  checked={service.description === sv.label}
                  onChange={() =>
                    setService({
                      serviceType: "SERVICE",
                      cost: sv.defaultCost,
                      description: sv.label
                    })
                  }
                />
                {sv.label}
              </label>

              <input
                type="number"
                className="service-price-input"
                value={
                  service.description === sv.label ? service.cost : sv.defaultCost
                }
                onChange={(e) => {
                  if (service.description === sv.label) {
                    setService({
                      ...service,
                      cost: Number(e.target.value)
                    });
                  }
                }}
              />

              <span>VND</span>
            </div>
          ))}
        </div>

        <hr />

        {/* ==== DỊCH VỤ TÙY CHỈNH ==== */}
        <h3>➕ Thêm dịch vụ khác</h3>

        <div className="service-form">
          <label>Loại dịch vụ</label>
          <input
            type="text"
            value={service.description}
            placeholder="Tên dịch vụ"
            onChange={(e) =>
              setService({
                ...service,
                description: e.target.value,
                serviceType: "SERVICE"
              })
            }
          />

          <label>Giá tiền (VND)</label>
          <input
            type="number"
            value={service.cost}
            onChange={(e) =>
              setService({
                ...service,
                cost: Number(e.target.value)
              })
            }
          />

          <button className="btn btn-add-service" onClick={handleAddService}>
            ➕ Thêm dịch vụ
          </button>
        </div>
      </div>

      {/* ⭐⭐ BANNER THÔNG BÁO WAITING - Khi detail status là WAITING HOẶC xe đang được khách khác thuê ⭐⭐ */}
      {(() => {
        const hasWaitingDetail = orderDetails.some(d => String(d.status || "").toUpperCase() === "WAITING");
        const waitingDetail = orderDetails.find(d => String(d.status || "").toUpperCase() === "WAITING");
        
        // ⭐⭐ KIỂM TRA THÊM: Nếu xe đang RENTAL và có order khác đang thuê → coi như WAITING ⭐⭐
        const vehicleRentedByOther = vehicle?.status === "RENTAL" && otherOrders.length > 0;
        const shouldShowWaitingBanner = hasWaitingDetail || vehicleRentedByOther;
        
        // Debug log
        console.log("🔍 [WAITING Banner Check]:", {
          hasWaitingDetail,
          vehicleRentedByOther,
          shouldShowWaitingBanner,
          vehicleStatus: vehicle?.status,
          otherOrdersCount: otherOrders.length,
          waitingDetail: waitingDetail ? { detailId: waitingDetail.detailId, type: waitingDetail.type, status: waitingDetail.status } : null,
          allDetails: orderDetails.map(d => ({ detailId: d.detailId, type: d.type, status: d.status }))
        });
        
        return shouldShowWaitingBanner ? (
          <div className="info-card" style={{
            backgroundColor: "#FFF3CD",
            border: "2px solid #FFC107",
            borderRadius: "8px",
            padding: "20px",
            marginBottom: "20px"
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
        ) : null;
      })()}

      {/* ⭐⭐ BANNER THÔNG BÁO CONFIRMED - Xe đã có sẵn ⭐⭐ */}
      {orderDetails.some(d => String(d.status || "").toUpperCase() === "CONFIRMED") && 
       vehicle?.status === "BOOKED" && (
        <div className="info-card" style={{
          backgroundColor: "#D1FAE5",
          border: "2px solid #10B981",
          borderRadius: "8px",
          padding: "20px",
          marginBottom: "20px"
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

      {/* HANDOVER */}
      <div className="info-card">
        <h2>Hành động bàn giao</h2>

        <div className="handover-actions">
          {(() => {
            // ⭐⭐ KIỂM TRA ĐẦU TIÊN: Nếu đơn đã hoàn thành (COMPLETED) hoặc đang chờ thanh toán cuối → KHÔNG hiển thị nút ⭐⭐
            const isCompleted = orderStatus === "COMPLETED";
            const isPendingFinalPayment = orderStatus === "PENDING_FINAL_PAYMENT";
            const isOrderFinished = isCompleted || isPendingFinalPayment;
            
            if (isOrderFinished) {
              console.log("✅ [Handover Check] Đơn đã hoàn thành hoặc đang chờ thanh toán cuối:", {
                orderStatus,
                isCompleted,
                isPendingFinalPayment
              });
              return (
                <p style={{ 
                  color: "#10B981", 
                  fontSize: "14px", 
                  fontStyle: "italic", 
                  padding: "12px", 
                  backgroundColor: "#D1FAE5", 
                  borderRadius: "6px" 
                }}>
                  {isCompleted 
                    ? "✅ Đơn hàng đã hoàn thành. Khách hàng đã trả xe." 
                    : "💰 Đơn hàng đang chờ thanh toán dịch vụ cuối cùng."}
                </p>
              );
            }
            
            // Kiểm tra xem có detail status WAITING không HOẶC xe đang được khách khác thuê
            const mainDetail = orderDetails.find(d => d.type === "RENTAL");
            const detailStatus = mainDetail ? String(mainDetail.status || "").toUpperCase() : "";
            const hasWaitingDetail = detailStatus === "WAITING";
            const vehicleRentedByOther = vehicle?.status === "RENTAL" && otherOrders.length > 0;
            const isWaiting = hasWaitingDetail || vehicleRentedByOther;
            
            // ⭐⭐ NẾU ĐANG WAITING HOẶC XE ĐANG ĐƯỢC KHÁCH KHÁC THUÊ, KHÔNG HIỂN THỊ NÚT ⭐⭐
            if (isWaiting) {
              return null; // Banner đã hiển thị thông báo, không cần hiển thị nút
            }
            
            // Nếu vehicle status = RENTAL và không phải WAITING, hiển thị nút nhận xe
            if (vehicle?.status === "RENTAL") {
              return (
                <>
                  <button
                    className="btn-receive"
                    onClick={handlePreviewReturn}
                    disabled={hasPendingOrderDetail}
                    style={{
                      opacity: hasPendingOrderDetail ? 0.5 : 1,
                      cursor: hasPendingOrderDetail ? "not-allowed" : "pointer"
                    }}
                  >
                    🚗 Nhận xe
                  </button>

                  {hasPendingOrderDetail && (
                    <p style={{ color: "red", marginTop: 8, fontWeight: "600" }}>
                      ⚠ Vui lòng chờ khách hàng thanh toán các giao dịch đang chờ xử lý!
                    </p>
                  )}
                </>
              );
            }
            
            // Trường hợp khác (xe chưa RENTAL) - hiển thị nút bàn giao
            return (
            <>
              {/* ⭐⭐ CHỈ HIỂN THỊ NÚT BÀN GIAO KHI đã thanh toán đầy đủ ⭐⭐ */}
              {(() => {
                const mainDetail = orderDetails.find(d => d.type === "RENTAL");
                const detailStatus = mainDetail ? String(mainDetail.status || "").toUpperCase() : "";
                const hasWaitingDetail = detailStatus === "WAITING";
                const vehicleRentedByOther = vehicle?.status === "RENTAL" && otherOrders.length > 0;
                const isWaiting = hasWaitingDetail || vehicleRentedByOther;
                
                // Debug log
                console.log("🔍 [Handover Debug]:", {
                  mainDetail: mainDetail ? { type: mainDetail.type, status: mainDetail.status } : null,
                  detailStatus,
                  hasWaitingDetail,
                  vehicleRentedByOther,
                  isWaiting,
                  vehicleStatus: vehicle?.status,
                  otherOrdersCount: otherOrders.length,
                  depositedOK,
                  pickupOK,
                  fullOK,
                  hasPaidAll: fullOK || (depositedOK && pickupOK)
                });
                
                if (isWaiting) {
                  return (
                    <p style={{ color: "#856404", fontSize: "14px", fontStyle: "italic", padding: "12px", backgroundColor: "#FFF3CD", borderRadius: "6px" }}>
                      ⏳ Đơn hàng đang trong hàng chờ. Xe sẽ được bàn giao khi có sẵn.
                    </p>
                  );
                }
                
                // Điều kiện bàn giao: 
                // 1. Đã thanh toán đầy đủ (FULL_PAYMENT hoặc DEPOSIT + PICKUP)
                // 2. Xe sẵn sàng (chỉ AVAILABLE hoặc BOOKED, KHÔNG phải RENTAL - vì RENTAL là xe đang được khách khác thuê)
                // 3. Detail status không phải WAITING (đã check ở trên)
                const hasPaidAll = fullOK || (depositedOK && pickupOK);
                // ⭐⭐ QUAN TRỌNG: Nếu vehicle.status = "RENTAL" → xe đang được khách khác thuê → KHÔNG được bàn giao ⭐⭐
                const vehicleReady = !vehicle || vehicle.status === "BOOKED" || vehicle.status === "AVAILABLE";
                // KHÔNG cho phép vehicle.status === "RENTAL" vì đó là xe đang được khách khác thuê
                
                // Cho phép bàn giao chỉ khi:
                // - Đã thanh toán đầy đủ
                // - Xe AVAILABLE hoặc BOOKED (không phải RENTAL)
                // - Detail status không phải WAITING
                if (hasPaidAll && vehicleReady && !isWaiting) {
                  return (
                    <>
                      <button
                        className="btn btn-primary"
                        onClick={handleConfirmHandover}
                        disabled={false}
                      >
                        ✅ Xác nhận bàn giao
                      </button>

                      <button
                        className="btn btn-danger"
                        onClick={handleCancelHandover}
                        disabled={pickupOK || fullOK}
                      >
                        ❌ Hủy bàn giao
                      </button>
                    </>
                  );
                }
                
                // Hiển thị lý do không thể bàn giao
                return (
                  <div style={{ color: "#666", fontSize: "14px" }}>
                    {!hasPaidAll && (
                      <p style={{ margin: "4px 0", fontStyle: "italic" }}>
                        ❌ Chưa thanh toán đầy đủ. 
                        {!depositedOK && " Thiếu đặt cọc."}
                        {!pickupOK && !fullOK && " Thiếu thanh toán phần còn lại."}
                      </p>
                    )}
                    {hasPaidAll && !vehicleReady && (
                      <p style={{ margin: "4px 0", fontStyle: "italic" }}>
                        {vehicle?.status === "RENTAL" 
                          ? "⚠️ Xe đang được khách hàng khác thuê. Vui lòng đợi xe được trả về."
                          : `⚠️ Xe chưa sẵn sàng: ${vehicle?.status || "N/A"}`}
                      </p>
                    )}
                    {hasPaidAll && vehicleReady && (
                      <p style={{ margin: "4px 0", fontStyle: "italic" }}>
                        Trạng thái chi tiết: {detailStatus || "N/A"}. Chờ điều kiện bàn giao.
                      </p>
                    )}
                  </div>
                );
              })()}
            </>
            );
          })()}
        </div>
      </div>

      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Quay lại
      </button>

      {showReturnModal && returnPreview && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Thông tin trả xe</h2>

            <p><strong>Trạm trả:</strong> {returnPreview.stationName}</p>
            <p><strong>Bắt đầu thuê:</strong> {returnPreview.startTime}</p>
            <p><strong>Kết thúc dự kiến:</strong> {returnPreview.endTime}</p>

            <label>Thời gian trả thực tế:</label>
            <input
              type="text"
              placeholder="YYYY-MM-DD HH:mm:ss (bỏ trống = hiện tại)"
              value={returnTime}
              onChange={(e) => setReturnTime(e.target.value)}
            />

            <div className="modal-actions">
              <button className="btn btn-primary" onClick={handleConfirmReturn}>
                ✔ Xác nhận trả xe
              </button>
              <button
                className="btn btn-danger"
                onClick={() => setShowReturnModal(false)}
              >
                ✖ Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}