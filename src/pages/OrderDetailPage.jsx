import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authService, orderService } from "../services";
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
  const [returnLoading, setReturnLoading] = useState(false); // Loading cho nút xác nhận trả xe

  const [service, setService] = useState({
    serviceType: "",
    cost: 0,
    description: ""
  });
  // const [priceList, setPriceList] = useState([]); // Danh sách dịch vụ từ API price-list - không sử dụng, fetch lại mỗi lần
  // const [loadingPriceList, setLoadingPriceList] = useState(false); // Không sử dụng
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedServiceList, setSelectedServiceList] = useState([]); // Danh sách dịch vụ theo loại đã chọn
  const [loadingServiceList, setLoadingServiceList] = useState(false);

  const [toast, setToast] = useState(null);
  const [payments, setPayments] = useState([]); // Used for payment status checks
  const [processing, setProcessing] = useState(false);
  const [handoverLoading, setHandoverLoading] = useState(false); // Loading cho các nút hành động bàn giao
  const [otherOrders, setOtherOrders] = useState([]); // Các order khác cùng vehicleId
  const [orderStatus, setOrderStatus] = useState(""); // Order status để kiểm tra đơn đã hoàn thành chưa
  const [openMenuDetailId, setOpenMenuDetailId] = useState(null); // ID của detail đang mở menu
  const [showEditServiceModal, setShowEditServiceModal] = useState(false); // Hiển thị modal sửa dịch vụ
  const [editingService, setEditingService] = useState(null); // Dịch vụ đang được sửa
  const [editServiceData, setEditServiceData] = useState({
    price: 0,
    description: ""
  });
  
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

  // Fetch danh sách dịch vụ từ price-list API (không cần lưu vào state, fetch lại mỗi lần cần)
  const fetchPriceList = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:8080/api/order-services/price-list");
      const data = await res.json();
      const priceListData = Array.isArray(data) ? data : (data.data || []);
      console.log("✅ [Price List] Loaded:", priceListData);
      // Không cần setPriceList vì fetchServiceListByType sẽ fetch lại khi cần
    } catch (err) {
      console.error(" Lỗi khi tải price list:", err);
    }
  }, []);

  // Fetch danh sách dịch vụ theo loại
  const fetchServiceListByType = useCallback(async (serviceType) => {
    if (!serviceType) {
      setSelectedServiceList([]);
      return;
    }
    
    try {
      setLoadingServiceList(true);
      const res = await fetch("http://localhost:8080/api/order-services/price-list");
      const data = await res.json();
      const priceListData = Array.isArray(data) ? data : (data.data || []);
      // Lọc danh sách theo serviceType
      const filtered = priceListData.filter(item => 
        String(item.serviceType || "").toUpperCase() === String(serviceType).toUpperCase()
      );
      setSelectedServiceList(filtered);
      console.log("✅ [Service List] Loaded for type", serviceType, ":", filtered);
    } catch (err) {
      console.error("❌ [Fetch Service List] Error:", err);
      setSelectedServiceList([]);
    } finally {
      setLoadingServiceList(false);
    }
  }, []);

  const refetchDetails = useCallback(async () => {
    const res = await fetch(
      `http://localhost:8080/api/order-details/order/${orderId}`
    );
    const details = await res.json();
    const detailsArray = Array.isArray(details) ? details : (details?.data || []);
    setOrderDetails(detailsArray);
    console.log("📋 [Order Details] Refetched:", detailsArray);

    const first = details?.[0];
    // ✅ Dùng thông tin từ order details thay vì gọi API vehicles/get
    if (first) {
      // Order details đã có đầy đủ thông tin xe: vehicleName, plateNumber, brand, carmodel, color, etc.
      setVehicle({
        vehicleId: first.vehicleId,
        vehicleName: first.vehicleName,
        plateNumber: first.plateNumber,
        brand: first.brand,
        carmodel: first.carmodel,
        color: first.color,
        stationId: first.stationId,
        stationName: first.stationName
      });
    }
    
    // Fetch order status
    await fetchOrderStatus();
    // Fetch payments
    await fetchPayments();
  }, [orderId, fetchOrderStatus, fetchPayments]);

  const handlePreviewReturn = async () => {
    try {
      setHandoverLoading(true);
      const res = await fetch(
        `http://localhost:8080/api/order/${orderId}/preview-return`
      );
      const data = await res.json();

      setReturnPreview(data);
      setReturnTime(""); // Reset returnTime khi mở modal
      setShowReturnModal(true);
    } catch (err) {
      console.error(err);
      showToast("error", "Không thể load thông tin trả xe!");
    } finally {
      setHandoverLoading(false);
    }
  };

  const handleConfirmReturn = async () => {
    let time;
    if (returnTime.trim() !== "") {
      // Convert từ datetime-local format (YYYY-MM-DDTHH:mm) sang backend format (YYYY-MM-DD HH:mm:ss)
      // datetime-local trả về format: "YYYY-MM-DDTHH:mm"
      // Cần convert thành: "YYYY-MM-DD HH:mm:ss"
      const dateTime = new Date(returnTime);
      const year = dateTime.getFullYear();
      const month = String(dateTime.getMonth() + 1).padStart(2, "0");
      const day = String(dateTime.getDate()).padStart(2, "0");
      const hours = String(dateTime.getHours()).padStart(2, "0");
      const minutes = String(dateTime.getMinutes()).padStart(2, "0");
      const seconds = String(dateTime.getSeconds()).padStart(2, "0");
      time = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } else {
      // Nếu không chọn, dùng thời gian hiện tại
      time = new Date().toISOString().slice(0, 19).replace("T", " ");
    }

    try {
      setReturnLoading(true);
      await fetch(`http://localhost:8080/api/order/${orderId}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actualReturnTime: time })
      });

      showToast("success", "🚗 Đã trả xe thành công!");
      setShowReturnModal(false);
      setReturnTime(""); // Reset returnTime sau khi submit
      // ✅ Gọi các API song song để tăng tốc độ
      await Promise.all([
        refetchDetails(),
        fetchOrderStatus()
      ]);
    } catch (err) {
      console.error(err);
      showToast("error", "Trả xe thất bại!");
    } finally {
      setReturnLoading(false);
    }
  };

  const handleAddService = async () => {
    if (!service.description || !service.description.trim()) {
      return showToast("error", "Vui lòng nhập tên dịch vụ!");
    }

    try {
      const payload = {
        orderId,
        serviceType: service.serviceType || "OTHER",
        cost: Number(service.cost) || 0,
        description: service.description.trim()
      };

      console.log("🚀 [Add Service] Sending request:", payload);

      const response = await fetch("http://localhost:8080/api/order-services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log("✅ [Add Service] Success:", result);

      showToast("success", "➕ Đã thêm dịch vụ!");
      setService({ serviceType: "", cost: 0, description: "" });
      setShowServiceModal(false);

      refetchDetails();
    } catch (err) {
      console.error("❌ [Add Service] Error:", err);
      showToast("error", `Không thể thêm dịch vụ: ${err.message || "Lỗi không xác định"}`);
    }
  };

  const handleConfirmHandover = async () => {
    const ok = window.confirm("Xác nhận bàn giao xe cho khách?");
    if (!ok) return;

    try {
      setHandoverLoading(true);
      await orderService.pickup(orderId);
      showToast("success", "✅ Đã xác nhận bàn giao!");
      await refetchDetails();
    } catch (e) {
      console.error(e);
      showToast("error", getApiMessage(e));
    } finally {
      setHandoverLoading(false);
    }
  };

  const handleCancelHandover = async () => {
    const ok = window.confirm("Hủy bàn giao và hủy đơn?");
    if (!ok) return;

    try {
      setHandoverLoading(true);
      const vehicleId = orderDetails?.[0]?.vehicleId;

      await orderService.update(orderId, {
        status: "CANCELLED",
        vehicleId,
        couponCode: ""
      });

      showToast("success", " Đã hủy bàn giao / hủy đơn!");
      await refetchDetails();
    } catch (err) {
      console.error(err);
      showToast("error", getApiMessage(err));
    } finally {
      setHandoverLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ✅ Gọi các API song song để tăng tốc độ load (trừ fetchPriceList vì nó chỉ set state)
        const [resCus, resDetails] = await Promise.all([
          authService.getAllCustomer(),
          fetch(`http://localhost:8080/api/order-details/order/${orderId}`).then(r => r.json())
        ]);
        
        // Gọi các API khác song song
        await Promise.all([
          fetchPayments(),
          fetchOrderStatus(),
          fetchPriceList()
        ]);

        // Xử lý customer
        const customers = resCus.data || resCus || [];
        const foundCustomer = customers.find(
          (c) =>
            String(c.userId).toLowerCase() === String(userId).toLowerCase()
        );
        setCustomer(foundCustomer || null);

        // Xử lý order details
        const details = resDetails || [];
        const detailsArray = Array.isArray(details) ? details : (details?.data || []);
        setOrderDetails(detailsArray);
        console.log("📋 [Order Details] Loaded:", detailsArray);

        const first = detailsArray[0];
        // ✅ Dùng thông tin từ order details thay vì gọi API vehicles/get
        if (first) {
          // Order details đã có đầy đủ thông tin xe: vehicleName, plateNumber, brand, carmodel, color, etc.
          const vehicleData = {
            vehicleId: first.vehicleId,
            vehicleName: first.vehicleName,
            plateNumber: first.plateNumber,
            brand: first.brand,
            carmodel: first.carmodel,
            color: first.color,
            stationId: first.stationId,
            stationName: first.stationName
          };
          setVehicle(vehicleData);
          
          // ⭐⭐ TỐI ƯU: Chỉ check other orders khi thực sự cần (lazy load) ⭐⭐
          // Thay vì gọi getAll() ngay, chỉ check khi order status là RENTAL hoặc có dấu hiệu cần check
          // Hoặc có thể bỏ qua check này nếu không quan trọng
          // Nếu cần check, có thể tạo API endpoint mới chỉ lấy orders của vehicleId cụ thể
          setOtherOrders([]); // Tạm thời bỏ qua để tăng tốc độ load
          
          // ⚠️ Nếu thực sự cần check other orders, có thể gọi sau khi page đã load xong:
          // setTimeout(async () => {
          //   try {
          //     const allOrders = await orderService.getAll();
          //     const ordersData = Array.isArray(allOrders) ? allOrders : (allOrders?.data || []);
          //     const otherRentalOrders = ordersData.filter(order => {
          //       const orderVehicleId = order.vehicleId || order.vehicle_id;
          //       const orderStatus = String(order.status || "").toUpperCase();
          //       const isSameVehicle = orderVehicleId && Number(orderVehicleId) === Number(first.vehicleId);
          //       const isRental = orderStatus === "RENTAL";
          //       const isNotCurrentOrder = String(order.orderId || order.order_id) !== String(orderId);
          //       return isSameVehicle && isRental && isNotCurrentOrder;
          //     });
          //     setOtherOrders(otherRentalOrders);
          //   } catch (err) {
          //     console.warn("⚠️ Cannot fetch other orders:", err);
          //   }
          // }, 1000);
        }
      } catch (err) {
        console.error(err);
        setError("Không thể tải dữ liệu!");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orderId, userId, fetchOrderStatus, fetchPayments, fetchPriceList]);

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuDetailId && !event.target.closest('[data-menu-container]')) {
        setOpenMenuDetailId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuDetailId]);

  // Handle confirm payment
  const handleStaffConfirmPayment = useCallback(async () => {
    if (!window.confirm("Xác nhận thanh toán này đã được khách hàng thanh toán bằng tiền mặt?")) {
      return;
    }

    try {
      setProcessing(true);
      await api.put(`/payment/cash/approve/order/${orderId}`);
      showToast("success", "✅ Đã xác nhận thanh toán thành công!");
      
      // ⭐⭐ KHI APPROVE PAYMENT TYPE 2: Backend sẽ tạo PICKUP detail trong finalSuccess() ⭐⭐
      // Cần refresh order details để hiển thị PICKUP detail mới
      console.log("🔄 [Approve Payment] Backend đã tạo PICKUP detail. Refreshing order details...");
      
      // ✅ Gọi các API song song để tăng tốc độ
      await Promise.all([
        fetchPayments(),
        refetchDetails(),
        fetchOrderStatus()
      ]);
      
      // ⭐⭐ ĐỢI MỘT CHÚT RỒI REFRESH LẠI ĐỂ ĐẢM BẢO PICKUP DETAIL ĐƯỢC HIỂN THỊ ⭐⭐
      console.log("⏳ [Approve Payment] Waiting 500ms then refreshing again to ensure PICKUP detail is visible...");
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh lại một lần nữa để đảm bảo PICKUP detail được hiển thị
      await refetchDetails();
      console.log("✅ [Approve Payment] Second refresh completed. PICKUP detail should now be visible in the table.");
      
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

  // Handle edit service - Mở modal sửa dịch vụ
  const handleEditService = useCallback((detail) => {
    setEditingService(detail);
    setEditServiceData({
      price: detail.price || 0,
      description: detail.description || ""
    });
    setShowEditServiceModal(true);
    setOpenMenuDetailId(null); // Đóng menu
  }, []);

  // Handle update service - Gọi API PUT để cập nhật
  const handleUpdateService = useCallback(async () => {
    if (!editingService) return;

    if (!editServiceData.description || !editServiceData.description.trim()) {
      showToast("error", "Vui lòng nhập mô tả dịch vụ!");
      return;
    }

    if (!editServiceData.price || editServiceData.price <= 0) {
      showToast("error", "Vui lòng nhập giá dịch vụ hợp lệ!");
      return;
    }

    try {
      setProcessing(true);
      const payload = {
        orderId: editingService.orderId,
        vehicleId: editingService.vehicleId,
        type: editingService.type, // Lấy từ detail gốc, không cho sửa
        startTime: editingService.startTime, // Giữ nguyên
        endTime: editingService.endTime, // Giữ nguyên
        price: Number(editServiceData.price),
        description: editServiceData.description.trim()
      };

      await api.put(`/order-details/${editingService.detailId}`, payload);
      showToast("success", "✅ Đã cập nhật dịch vụ thành công!");
      
      // ✅ Refresh dữ liệu sau khi cập nhật
      await Promise.all([
        refetchDetails(),
        fetchOrderStatus(),
        fetchPayments()
      ]);

      // Đóng modal
      setShowEditServiceModal(false);
      setEditingService(null);
      setEditServiceData({ price: 0, description: "" });
    } catch (err) {
      console.error("Lỗi cập nhật dịch vụ:", err);
      const errorMsg = 
        err?.response?.data?.message || 
        err?.response?.data?.error ||
        err?.message || 
        "Không thể cập nhật dịch vụ. Vui lòng thử lại sau.";
      showToast("error", errorMsg);
    } finally {
      setProcessing(false);
    }
  }, [editingService, editServiceData, refetchDetails, fetchOrderStatus, fetchPayments, showToast]);

  // Handle delete service
  const handleDeleteService = useCallback(async (detailId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa dịch vụ này?")) {
      return;
    }

    try {
      setProcessing(true);
      await api.delete(`/order-details/${detailId}`);
      showToast("success", "✅ Đã xóa dịch vụ thành công!");
      // ✅ Refresh dữ liệu sau khi xóa
      await Promise.all([
        refetchDetails(),
        fetchOrderStatus(),
        fetchPayments()
      ]);
    } catch (err) {
      console.error("Lỗi xóa dịch vụ:", err);
      const errorMsg = 
        err?.response?.data?.message || 
        err?.response?.data?.error ||
        err?.message || 
        "Không thể xóa dịch vụ. Vui lòng thử lại sau.";
      showToast("error", errorMsg);
    } finally {
      setProcessing(false);
    }
  }, [refetchDetails, fetchOrderStatus, fetchPayments, showToast]);

  const fmtVN = (d) =>
    d ? new Date(d).toLocaleString("vi-VN") : "N/A";

  // Chuyển đổi order status sang tiếng Việt
  const getOrderStatusText = (status) => {
    if (!status) return "N/A";
    const statusUpper = String(status).toUpperCase();
    const statusMap = {
      "PENDING": "Chờ xử lý",
      "PENDING_DEPOSIT": "CHỜ ĐẶT CỌC",
      "DEPOSITED": "Đã đặt cọc",
      "BOOKED": "Đã đặt",
      "RENTAL": "Đang thuê",
      "WAITING_FOR_VEHICLE": "Chờ xe",
      "WAITING": "Chờ xe",
      "CONFIRMED": "Đã xác nhận",
      "COMPLETED": "Đã hoàn thành",
      "AWAITING": "Chờ nhận xe",
      "PENDING_FINAL_PAYMENT": "Chờ thanh toán cuối",
      "CHECKING": "Đang kiểm tra",
      "CANCELLED": "Đã hủy",
      "PAID": "Đã thanh toán",
      "FAILED": "Thất bại",
      "PAYMENT_FAILED": "Thanh toán thất bại"
    };
    return statusMap[statusUpper] || status;
  };

  // Chuyển đổi vehicle status sang tiếng Việt
  const getVehicleStatusText = (status) => {
    if (!status) return "N/A";
    const statusUpper = String(status).toUpperCase();
    const statusMap = {
      "AVAILABLE": "Có sẵn",
      "BOOKED": "Đã đặt",
      "RENTAL": "Đang thuê",
      "MAINTENANCE": "Bảo trì",
      "CHECKING": "Đang kiểm tra",
      "WAITING": "Đang chờ xe",
      "UNAVAILABLE": "Không có sẵn"
    };
    return statusMap[statusUpper] || status;
  };

  // Lấy icon cho trạng thái
  const getStatusIcon = (status) => {
    if (!status) return null;
    const statusUpper = String(status).toUpperCase();
    
    // Icon đồng hồ cho các trạng thái chờ
    if (["PENDING", "WAITING", "WAITING_FOR_VEHICLE", "PENDING_FINAL_PAYMENT", "CHECKING"].includes(statusUpper)) {
      return (
        <svg style={{ width: "20px", height: "20px", flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    }
    
    // Icon checkmark cho các trạng thái thành công
    if (["PAID", "COMPLETED", "CONFIRMED", "DEPOSITED", "BOOKED"].includes(statusUpper)) {
      return (
        <svg style={{ width: "20px", height: "20px", flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      );
    }
    
    // Icon X cho các trạng thái thất bại/hủy
    if (["FAILED", "PAYMENT_FAILED", "CANCELLED"].includes(statusUpper)) {
      return (
        <svg style={{ width: "20px", height: "20px", flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      );
    }
    
    // Icon mặc định (xe) cho các trạng thái khác
    return (
      <svg style={{ width: "20px", height: "20px", flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1" />
        <polygon points="12 15 17 21 7 21 12 15" />
      </svg>
    );
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
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "12px"
        }}>
          {getStatusIcon(orderStatus)}
          <p style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <strong style={{ color: "#DC0000", textTransform: "uppercase" }}>Trạng thái: </strong>
            <span style={{ color: "#333", fontWeight: "500" }}>{getOrderStatusText(orderStatus)}</span>
          </p>
        </div>
      )}

      {/* CUSTOMER */}
      {customer && (
        <div className="info-card">
          <h2>Thông tin khách hàng</h2>

          <div className="info-grid" style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px",
              background: "#f9fafb",
              borderRadius: "8px",
              border: "1px solid #e5e7eb"
            }}>
              <svg style={{ width: "20px", height: "20px", flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <p style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontWeight: "600", color: "#666" }}>Họ tên:</span> 
                <span>{customer.fullName}</span>
              </p>
            </div>
            
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px",
              background: "#f9fafb",
              borderRadius: "8px",
              border: "1px solid #e5e7eb"
            }}>
              <svg style={{ width: "20px", height: "20px", flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <p style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontWeight: "600", color: "#666" }}>Email:</span> 
                <span>{customer.email}</span>
              </p>
            </div>
            
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px",
              background: "#f9fafb",
              borderRadius: "8px",
              border: "1px solid #e5e7eb"
            }}>
              <svg style={{ width: "20px", height: "20px", flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <p style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontWeight: "600", color: "#666" }}>Số điện thoại:</span> 
                <span>{customer.phone}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VEHICLE */}
      {vehicle && (() => {
        // ⭐⭐ HARDCODE: Nếu có order detail WAITING HOẶC xe đang được khách khác thuê, hiển thị WAITING ⭐⭐
        const hasWaitingDetail = orderDetails.some(d => String(d.status || "").toUpperCase() === "WAITING");
        const backendVehicleStatus =
          orderDetails[0]?.vehicleStatus ||
          orderDetails[0]?.vehicle_status ||
          orderStatus;
        const vehicleStatus = (backendVehicleStatus && backendVehicleStatus.toUpperCase()) || vehicle.status || "AVAILABLE"; // Ưu tiên trạng thái xe từ backend
        const vehicleRentedByOther = vehicleStatus === "RENTAL" && otherOrders.length > 0;
        const shouldDisplayWaiting = hasWaitingDetail || vehicleRentedByOther;
        
        const displayStatus = shouldDisplayWaiting ? "WAITING" : vehicleStatus;
        const displayStatusText = getVehicleStatusText(displayStatus);
        
        // Lấy thông tin từ orderDetails[0] nếu có
        const firstDetail = orderDetails[0];
        const seatCount = firstDetail?.seatCount || 4;
        const variant = firstDetail?.carmodel || vehicle.carmodel || "N/A";
        
        return (
          <div className="info-card">
            <h2>{vehicle.vehicleName || "Thông tin xe"}</h2>
            
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "12px",
              marginTop: "16px"
            }}>
              {/* Biển số */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px",
                background: "#f9fafb",
                borderRadius: "8px",
                border: "1px solid #e5e7eb"
              }}>
                <svg style={{ width: "20px", height: "20px", flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1" />
                  <path d="M12 15l-3-3H7a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2l-3 3z" />
                </svg>
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  {vehicle.plateNumber || "N/A"}
                </span>
              </div>
              
              {/* Số chỗ */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px",
                background: "#f9fafb",
                borderRadius: "8px",
                border: "1px solid #e5e7eb"
              }}>
                <svg style={{ width: "20px", height: "20px", flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  {seatCount} chỗ
                </span>
              </div>
              
              {/* Loại xe */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px",
                background: "#f9fafb",
                borderRadius: "8px",
                border: "1px solid #e5e7eb"
              }}>
                <svg style={{ width: "20px", height: "20px", flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                  <path d="M8 4v6M16 4v6" />
                </svg>
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  {variant}
                </span>
              </div>
              
              {/* Variant/Grade */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px",
                background: "#f9fafb",
                borderRadius: "8px",
                border: "1px solid #e5e7eb"
              }}>
                <svg style={{ width: "20px", height: "20px", flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  {variant}
                </span>
              </div>
              
              {/* Màu sắc */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px",
                background: "#f9fafb",
                borderRadius: "8px",
                border: "1px solid #e5e7eb"
              }}>
                <svg style={{ width: "20px", height: "20px", flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                </svg>
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  {vehicle.color || "N/A"}
                </span>
                {vehicle.color && vehicle.color !== "N/A" && (
                  <span style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "4px",
                    backgroundColor: vehicle.color === "Red" ? "#FF0000" :
                                   vehicle.color === "Blue" ? "#0000FF" :
                                   vehicle.color === "White" ? "#FFFFFF" :
                                   vehicle.color === "Black" ? "#000000" :
                                   vehicle.color === "Silver" ? "#C0C0C0" : "#CCCCCC",
                    border: vehicle.color === "White" ? "1px solid #E5E5E5" : "none",
                    display: "inline-block"
                  }}></span>
                )}
              </div>
              
              {/* Trạm hiện tại */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px",
                background: "#f9fafb",
                borderRadius: "8px",
                border: "1px solid #e5e7eb"
              }}>
                <svg style={{ width: "20px", height: "20px", flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  {vehicle.stationName || "N/A"}
                </span>
              </div>
            </div>
            
            {/* Trạng thái - Ẩn khi đơn hàng đã hoàn thành */}
            {orderStatus !== "COMPLETED" && (
              <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <svg style={{ width: "18px", height: "18px", flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <p style={{ margin: 0 }}>
                  <span style={{ fontWeight: "600", color: "#666" }}>Trạng thái:&nbsp;</span>
                  <span className={`pill pill-${(displayStatus || "AVAILABLE").toLowerCase()}`}>
                    {displayStatusText || "Available"}
                  </span>
                </p>
              </div>
            )}
          </div>
        );
      })()}

      {/* ORDER DETAILS */}
      <div className="info-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ margin: 0 }}>Các giao dịch trong đơn hàng</h2>
          <button 
            className="btn btn-add-service" 
            onClick={() => {
              setService({ serviceType: "", cost: 0, description: "" });
              setSelectedServiceList([]);
              setShowServiceModal(true);
            }}
            style={{
              padding: "10px 20px",
              background: "#000000",
              color: "#FFFFFF",
              border: "2px solid #000000",
              borderRadius: "0",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              letterSpacing: "0.5px",
              textTransform: "uppercase"
            }}
          >
            ➕ Thêm dịch vụ
          </button>
        </div>

        {(() => {
          // ⭐⭐ SẮP XẾP: SERVICE hiển thị trước, sau đó mới đến các loại khác ⭐⭐
          const sortedDetails = [...orderDetails].sort((a, b) => {
            const typeA = String(a.type || "").toUpperCase();
            const typeB = String(b.type || "").toUpperCase();
            const isServiceA = typeA === "SERVICE" || typeA === "SERVICE_SERVICE";
            const isServiceB = typeB === "SERVICE" || typeB === "SERVICE_SERVICE";
            
            // SERVICE luôn hiển thị trước
            if (isServiceA && !isServiceB) return -1;
            if (!isServiceA && isServiceB) return 1;
            
            // Nếu cùng loại hoặc không phải SERVICE, giữ nguyên thứ tự
            return 0;
          });
          
          return sortedDetails.map((detail) => {
          let status = String(detail.status || "").toUpperCase();
          
          // ⭐⭐ HARDCODE: Nếu xe đang được khách khác thuê và detail type = RENTAL → hiển thị WAITING ⭐⭐
          const vehicleRentedByOther = vehicle?.status === "RENTAL" && otherOrders.length > 0;
          if (vehicleRentedByOther && detail.type === "RENTAL") {
            status = "WAITING"; // Hardcode status để hiển thị đúng
          }
          
          // Xác định loại detail
          const detailType = detail.type;
          const isService = detailType === "SERVICE" || detailType === "SERVICE_SERVICE";
          
          // ⭐⭐ NÚT "XÁC NHẬN ĐÃ THANH TOÁN" - ĐƠN GIẢN: Tìm BẤT KỲ payment CASH PENDING nào ⭐⭐
          // API approve sẽ xử lý tất cả payments PENDING của order, không cần phân biệt paymentType
          const hasPendingCashPayment = payments.some(p => {
            const method = String(p.method || "").toUpperCase();
            const status = String(p.status || "").toUpperCase();
            return method === "CASH" && status === "PENDING";
          });
          
          // ⭐⭐ HIỂN THỊ NÚT KHI: CÓ BẤT KỲ PAYMENT CASH PENDING NÀO ⭐⭐
          const showConfirmButton = hasPendingCashPayment;
          
          // ⭐⭐ LẤY METHOD PAYMENT TỪ PAYMENT DO CUSTOMER TẠO (KHÔNG TỰ SET) ⭐⭐
          // Logic: Chỉ lấy method từ payment do customer tạo, không tự set
          let displayMethodPayment = detail.methodPayment || "";
          
          // Tìm payment tương ứng với detail này (theo paymentType)
          let paymentType = null;
          if (detailType === "DEPOSIT") paymentType = 1;
          else if (detailType === "PICKUP") paymentType = 2;
          else if (detailType === "FULL_PAYMENT") paymentType = 3;
          else if (isService) paymentType = 5; // SERVICE dùng paymentType = 5 (mới)
          
          // ⭐⭐ TÌM PAYMENT DO CUSTOMER TẠO (theo paymentType) - KHÔNG PHÂN BIỆT CASH HAY MOMO ⭐⭐
          // Ưu tiên: Payment PENDING (đang chờ) > Payment SUCCESS (đã thanh toán) > Payment khác
          let foundPayment = null;
          
          if (paymentType !== null) {
            // Tìm payment với paymentType tương ứng
            // Ưu tiên PENDING trước (payment đang chờ xác nhận)
            foundPayment = payments.find(p => 
              p.paymentType === paymentType && 
              String(p.status || "").toUpperCase() === "PENDING"
            );
            
            // Nếu không có PENDING, tìm SUCCESS (đã thanh toán)
            if (!foundPayment) {
              foundPayment = payments.find(p => 
                p.paymentType === paymentType && 
                String(p.status || "").toUpperCase() === "SUCCESS"
              );
            }
            
            // Nếu vẫn không có, tìm bất kỳ payment nào với paymentType này
            if (!foundPayment) {
              foundPayment = payments.find(p => p.paymentType === paymentType);
            }
          }
          
          // ⭐⭐ CHỈ LẤY METHOD TỪ PAYMENT DO CUSTOMER TẠO - KHÔNG TỰ SET ⭐⭐
          // ⭐⭐ ĐỐI VỚI SERVICE: Nếu chưa có payment và status = PENDING → hiển thị "Chưa có" ⭐⭐
          if (isService && !foundPayment && status === "PENDING") {
            displayMethodPayment = ""; // Để hiển thị "Chưa có"
          } else if (foundPayment && foundPayment.method) {
            const method = String(foundPayment.method || "").toUpperCase();
            // Chuyển đổi method từ backend sang hiển thị
            if (method === "CASH") {
              displayMethodPayment = "CASH";
            } else if (method === "CAPTUREWALLET" || method === "PAYWITHMETHOD" || method === "MOMO") {
              displayMethodPayment = "MoMo";
            } else {
              displayMethodPayment = foundPayment.method;
            }
          }
          
          // Debug log cho TẤT CẢ details - LOG RÕ RÀNG
          console.log("💰 [Detail Check - NEW LOGIC]:", {
            detailId: detail.detailId,
            type: detail.type,
            isService,
            status,
            methodPayment: detail.methodPayment,
            paymentType,
            foundPayment: foundPayment ? {
              paymentId: foundPayment.paymentId,
              method: foundPayment.method,
              status: foundPayment.status,
              paymentType: foundPayment.paymentType
            } : null,
            displayMethodPayment,
            hasPendingCashPayment,
            showConfirmButton,
            paymentsCount: payments.length,
            allPayments: payments.map(p => ({ 
              paymentId: p.paymentId, 
              method: p.method, 
              status: p.status, 
              paymentType: p.paymentType 
            }))
          });
          
          // Xác định loại dịch vụ
          const getTypeLabel = (type) => {
            if (type === "RENTAL") return "Thuê Xe";
            if (type === "DEPOSIT") return "Đặt xe";
            if (type === "SERVICE_SERVICE" || type === "SERVICE") return "Dịch vụ";
            if (type === "PICKUP") return "Nhận xe";
            if (type === "FULL_PAYMENT") return "Nhận xe";
            return type || "N/A";
          };

          // Xác định text tình trạng thanh toán
          const getStatusText = () => {
            if (status === "SUCCESS") return "Thành công";
            if (status === "FAILED") return "Thất bại";
            if (status === "PENDING") return "Chưa thanh toán";
            if (status === "CONFIRMED") return "Đã xác nhận";
            if (status === "WAITING") return "Đang chờ xe";
            if (status === "CHECKING") return "Đang kiểm tra";
            if (status === "RENTAL") return "Đang thuê";
            return detail.status || "N/A";
          };

          // Xác định text phương thức thanh toán
          const getMethodPaymentText = (method) => {
            if (!method || method === "") {
              // Đối với SERVICE chưa có payment → hiển thị "Chưa có"
              if (isService && status === "PENDING") {
                return "Chưa có";
              }
              return "N/A";
            }
            const methodUpper = String(method).toUpperCase();
            if (methodUpper === "CASH") return "Tiền mặt";
            if (methodUpper === "CAPTUREWALLET" || methodUpper === "MOMO") return "MoMo";
            return method;
          };

          return (
            <div key={detail.detailId} className="detail-card">
              <div className="detail-header" style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                gap: "16px"
              }}>
                {/* Loại - Góc trên bên trái */}
                <span className="status-tag type-tag">
                  {getTypeLabel(detail.type)}
                </span>
                
                {/* Nút Xác nhận đã thanh toán hoặc Menu 3 chấm - Góc trên bên phải */}
                <div style={{ display: "flex", gap: "8px", alignItems: "center", position: "relative" }}>
                  {/* Menu 3 chấm - Chỉ hiển thị cho SERVICE */}
                  {isService && (
                    <div style={{ position: "relative" }} data-menu-container>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuDetailId(openMenuDetailId === detail.detailId ? null : detail.detailId);
                        }}
                        disabled={processing}
                        style={{
                          padding: "8px 12px",
                          background: "transparent",
                          color: "#666666",
                          border: "1px solid #E5E5E5",
                          borderRadius: "4px",
                          fontSize: "18px",
                          fontWeight: "600",
                          cursor: processing ? "not-allowed" : "pointer",
                          transition: "all 0.3s ease",
                          lineHeight: "1",
                          opacity: processing ? 0.6 : 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          minWidth: "32px",
                          height: "32px"
                        }}
                        onMouseEnter={(e) => {
                          if (!processing) {
                            e.target.style.background = "#F3F4F6";
                            e.target.style.borderColor = "#D1D5DB";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!processing) {
                            e.target.style.background = "transparent";
                            e.target.style.borderColor = "#E5E5E5";
                          }
                        }}
                      >
                        ⋯
                      </button>
                      
                      {/* Dropdown menu */}
                      {openMenuDetailId === detail.detailId && (
                        <div
                          style={{
                            position: "absolute",
                            top: "100%",
                            right: "0",
                            marginTop: "4px",
                            background: "#FFFFFF",
                            border: "1px solid #E5E5E5",
                            borderRadius: "4px",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                            zIndex: 1000,
                            minWidth: "120px"
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => {
                              handleEditService(detail);
                            }}
                            style={{
                              width: "100%",
                              padding: "10px 16px",
                              background: "transparent",
                              color: "#333333",
                              border: "none",
                              borderBottom: "1px solid #E5E5E5",
                              borderRadius: "4px 4px 0 0",
                              fontSize: "14px",
                              fontWeight: "400",
                              cursor: "pointer",
                              textAlign: "left",
                              transition: "all 0.2s ease"
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = "#F3F4F6";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = "transparent";
                            }}
                          >
                             Sửa
                          </button>
                          <button
                            onClick={() => {
                              handleDeleteService(detail.detailId);
                              setOpenMenuDetailId(null);
                            }}
                            style={{
                              width: "100%",
                              padding: "10px 16px",
                              background: "transparent",
                              color: "#ef4444",
                              border: "none",
                              borderRadius: "0 0 4px 4px",
                              fontSize: "14px",
                              fontWeight: "400",
                              cursor: "pointer",
                              textAlign: "left",
                              transition: "all 0.2s ease"
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = "#FEF2F2";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = "transparent";
                            }}
                          >
                             Xóa
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Nút Xác nhận đã thanh toán - CHỈ hiển thị cho DEPOSIT, PICKUP, FULL_PAYMENT (KHÔNG hiển thị cho SERVICE) */}
                  {/* CHỈ hiển thị khi: có payment PENDING VÀ detail chưa thanh toán (status PENDING) */}
                  {showConfirmButton && !isService && status === "PENDING" && (
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
                      {processing ? "Đang xử lý..." : "Xác nhận đã thanh toán"}
                    </button>
                  )}
                </div>
              </div>

              <div className="detail-grid">
                {/* Cột 1: Thời gian nhận xe và Thời gian trả xe */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <p><span>Thời gian nhận xe:</span> {fmtVN(detail.startTime)}</p>
                  <p><span>Thời gian trả xe:</span> {fmtVN(detail.endTime)}</p>
                </div>
                
                {/* Cột 2: Số tiền và Tình trạng thanh toán */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <p><span>Số tiền:</span> {Number(detail.price).toLocaleString("vi-VN")} VND</p>
                  <p><span>Tình trạng thanh toán:</span> <span style={{ textDecoration: "underline" }}>{getStatusText()}</span></p>
                </div>
                
                {/* Cột 3: Phương thức thanh toán và Mô tả */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {/* ⭐⭐ ĐỐI VỚI SERVICE: Luôn hiển thị phương thức thanh toán (kể cả khi chưa có) ⭐⭐ */}
                  {isService && (
                    <p><span>Phương thức thanh toán:</span> {getMethodPaymentText(displayMethodPayment || "")}</p>
                  )}
                  {/* ⭐⭐ ĐỐI VỚI CÁC LOẠI KHÁC: Chỉ hiển thị khi có payment ⭐⭐ */}
                  {!isService && displayMethodPayment && (
                    <p><span>Phương thức thanh toán:</span> {getMethodPaymentText(displayMethodPayment)}</p>
                  )}
                  {detail.description && <p><span>Mô tả:</span> {detail.description}</p>}
                </div>
              </div>
            </div>
          );
          });
        })()}
      </div>


      {/* ⭐⭐ BANNER THANH TOÁN DỊCH VỤ - Hiển thị tổng tiền dịch vụ chưa thanh toán và nút xác nhận ⭐⭐ */}
      {(() => {
        // Tính tổng tiền dịch vụ chưa thanh toán
        const unpaidServices = orderDetails.filter(d => {
          const type = String(d.type || "").toUpperCase();
          const status = String(d.status || "").toUpperCase();
          const isServiceType = type === "SERVICE" || type === "SERVICE_SERVICE";
          const isUnpaid = status === "PENDING";
          return isServiceType && isUnpaid;
        });
        
        const totalUnpaidServiceAmount = unpaidServices.reduce((sum, d) => {
          return sum + (Number(d.price) || 0);
        }, 0);
        
        // Kiểm tra có payment CASH PENDING cho dịch vụ không
        const hasServicePendingPayment = payments.some(p => 
          String(p.method || "").toUpperCase() === "CASH" && 
          String(p.status || "").toUpperCase() === "PENDING"
        );
        
        // ⭐⭐ HIỂN THỊ BANNER KHI CÓ DỊCH VỤ CHƯA THANH TOÁN (không cần payment PENDING) ⭐⭐
        // ⭐⭐ NÚT CHỈ HIỂN THỊ KHI CÓ PAYMENT PENDING ⭐⭐
        if (unpaidServices.length > 0) {
          return (
            <div className="info-card" style={{
              backgroundColor: "#FFF3CD",
              border: "2px solid #FFC107",
              borderRadius: "8px",
              padding: "20px",
              marginBottom: "20px",
              marginTop: "20px"
            }}>
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px"
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px"
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, color: "#856404", fontSize: "18px", fontWeight: "bold" }}>
                      Chưa thanh toán số tiền dịch vụ
                    </h3>
                    <p style={{ margin: "8px 0 0 0", color: "#856404", fontSize: "14px" }}>
                      Tổng tiền dịch vụ chưa thanh toán: <strong style={{ fontSize: "16px", color: "#DC0000" }}>{totalUnpaidServiceAmount.toLocaleString("vi-VN")} VND</strong>
                    </p>
                  </div>
                </div>
                
                {/* ⭐⭐ CHỈ HIỂN THỊ NÚT KHI CÓ PAYMENT CASH PENDING ⭐⭐ */}
                {hasServicePendingPayment && (
                  <div style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: "8px"
                  }}>
                    <button
                      onClick={() => {
                        handleStaffConfirmPayment();
                      }}
                      disabled={processing}
                      style={{
                        padding: "12px 24px",
                        background: "#000000",
                        color: "#FFFFFF",
                        border: "2px solid #000000",
                        borderRadius: "0",
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor: processing ? "not-allowed" : "pointer",
                        letterSpacing: "0.5px",
                        textTransform: "uppercase",
                        transition: "all 0.3s ease",
                        whiteSpace: "nowrap",
                        opacity: processing ? 0.6 : 1
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
                  </div>
                )}
                
                {/* ⭐⭐ THÔNG BÁO KHI CHƯA CÓ PAYMENT PENDING ⭐⭐ */}
                {!hasServicePendingPayment && (
                  <div style={{
                    marginTop: "8px",
                    padding: "12px",
                    backgroundColor: "#F3F4F6",
                    border: "1px solid #D1D5DB",
                    borderRadius: "6px"
                  }}>
                    <p style={{ 
                      margin: 0, 
                      color: "#6B7280", 
                      fontSize: "13px", 
                      fontStyle: "italic" 
                    }}>
                      ⏳ Đang chờ khách hàng thanh toán.
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        }
        console.log("❌ [Service Banner] NOT RENDERING - unpaidServices:", unpaidServices.length, "totalAmount:", totalUnpaidServiceAmount);
        return null;
      })()}

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
            // ⭐⭐ KIỂM TRA ĐẦU TIÊN: Nếu đơn đã hoàn thành (COMPLETED) → hiển thị thông báo ⭐⭐
            const isCompleted = orderStatus === "COMPLETED";
            const isAwaiting = orderStatus === "AWAITING";
            const isPaid = orderStatus === "PAID"; // Status mới: đã thanh toán hết dịch vụ
            const isPendingFinalPayment = orderStatus === "PENDING_FINAL_PAYMENT";
            
            if (isCompleted) {
              console.log("✅ [Handover Check] Đơn đã hoàn thành:", {
                orderStatus
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
                  ✅ Đơn hàng đã hoàn thành. Khách hàng đã trả xe.
                </p>
              );
            }
            
            // ⭐⭐ DEBUG: Log order status để kiểm tra ⭐⭐
            console.log("🔍 [Handover Logic Check]:", {
              orderStatus,
              isAwaiting,
              isPaid,
              isCompleted,
              isPendingFinalPayment,
              orderDetailsCount: orderDetails.length,
              paymentsCount: payments.length,
              depositedOK,
              pickupOK,
              fullOK,
              allDetailsStatus: orderDetails.map(d => ({ type: d.type, status: d.status }))
            });
            
            // ⭐⭐ KIỂM TRA PAID TRƯỚC → Hiển thị nút "Xác nhận hoàn tất đơn hàng" ⭐⭐
            // PAID: đã thanh toán hết dịch vụ → hiển thị nút hoàn tất
            // AWAITING: đã thanh toán đặt cọc, chờ nhận xe → hiển thị nút bàn giao (không phải hoàn tất)
            const orderStatusUpper = String(orderStatus || "").toUpperCase();
            const isPaidStatus = orderStatusUpper === "PAID";
            
            if (isPaidStatus) {
              // Kiểm tra có payment CASH PENDING không (theo logic backend)
              const hasCashPending = payments.some(p => 
                String(p.method || "").toUpperCase() === "CASH" && 
                String(p.status || "").toUpperCase() === "PENDING"
              );
              
              // Kiểm tra có service chưa thanh toán không
              const unpaidServices = orderDetails.filter(d => {
                const type = String(d.type || "").toUpperCase();
                const status = String(d.status || "").toUpperCase();
                const isServiceType = type === "SERVICE" || type === "SERVICE_SERVICE";
                const isUnpaid = status === "PENDING";
                return isServiceType && isUnpaid;
              });
              
              // Debug log
              console.log("🔍 [AWAITING/PAID Logic]:", {
                hasCashPending,
                unpaidServicesCount: unpaidServices.length,
                unpaidServices: unpaidServices.map(s => ({ detailId: s.detailId, type: s.type, status: s.status })),
                willShowCompleteButton: !(hasCashPending && unpaidServices.length > 0)
              });
              
              // ⭐⭐ ĐỐI VỚI PAID: Nếu có CASH PENDING VÀ có service chưa thanh toán → không hiển thị nút hoàn tất (banner đã có nút xác nhận) ⭐⭐
              if (hasCashPending && unpaidServices.length > 0) {
                console.log("❌ [PAID] Không hiển thị nút hoàn tất - có CASH PENDING và unpaid services");
                return null; // Banner đã hiển thị nút xác nhận thanh toán dịch vụ
              }
              
              // ⭐⭐ PAID: Nếu không còn CASH PENDING hoặc không còn service chưa thanh toán → hiển thị nút "Xác nhận hoàn tất đơn hàng" ⭐⭐
              console.log("✅ [PAID] Hiển thị nút hoàn tất đơn hàng");
              
              // Thông báo cho PAID
              const statusMessage = "✅ Đơn hàng đã thanh toán đầy đủ (bao gồm dịch vụ) và đã nhận xe. Vui lòng xác nhận hoàn tất đơn hàng.";
              
              return (
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  padding: "16px",
                  backgroundColor: "#FFF3CD",
                  border: "2px solid #FFC107",
                  borderRadius: "8px"
                }}>
                  <p style={{ 
                    margin: 0,
                    color: "#856404", 
                    fontSize: "14px", 
                    fontWeight: "600"
                  }}>
                    {statusMessage}
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={async () => {
                      if (!window.confirm("Xác nhận hoàn tất đơn hàng này?")) {
                        return;
                      }
                      
                      try {
                        setProcessing(true);
                        await orderService.complete(orderId);
                        showToast("success", "✅ Đã xác nhận hoàn tất đơn hàng thành công!");
                        // ✅ Refresh dữ liệu
                        await Promise.all([
                          refetchDetails(),
                          fetchOrderStatus(),
                          fetchPayments()
                        ]);
                      } catch (err) {
                        console.error("Lỗi xác nhận hoàn tất đơn hàng:", err);
                        const errorMsg = 
                          err?.response?.data?.message || 
                          err?.response?.data?.error ||
                          err?.message || 
                          "Không thể xác nhận hoàn tất đơn hàng. Vui lòng thử lại sau.";
                        showToast("error", errorMsg);
                      } finally {
                        setProcessing(false);
                      }
                    }}
                    disabled={processing}
                    style={{
                      padding: "12px 24px",
                      background: "#000000",
                      color: "#FFFFFF",
                      border: "2px solid #000000",
                      borderRadius: "0",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: processing ? "not-allowed" : "pointer",
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                      transition: "all 0.3s ease",
                      opacity: processing ? 0.6 : 1
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
                    {processing ? "Đang xử lý..." : "✅ Xác nhận hoàn tất đơn hàng"}
                  </button>
                </div>
              );
            }
            
            // ⭐⭐ KIỂM TRA PICKUP THÀNH CÔNG → HIỂN THỊ THEO THỨ TỰ: Bàn giao → Nhận xe ⭐⭐
            const pickupDetail = orderDetails.find(d => 
              (d.type === "PICKUP" || d.type === "FULL_PAYMENT") && 
              String(d.status || "").toUpperCase() === "SUCCESS"
            );
            
            if (pickupDetail) {
              // Có PICKUP/FULL_PAYMENT thành công
              const backendVehicleStatusForHandover =
                orderDetails[0]?.vehicleStatus ||
                orderDetails[0]?.vehicle_status ||
                orderStatus;
              const vehicleStatus = String(backendVehicleStatusForHandover || "").toUpperCase();
              
              // ⭐⭐ BƯỚC 2: Nếu đã bàn giao (vehicle status = RENTAL) → hiển thị nút "Nhận xe" ⭐⭐
              if (vehicleStatus === "RENTAL") {
                return (
                  <>
                    <button
                      className="btn-receive-car"
                      onClick={handlePreviewReturn}
                      disabled={handoverLoading || loading}
                    >
                      <svg style={{ width: "18px", height: "18px", marginRight: "8px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1"></path>
                        <polygon points="12 15 17 21 7 21 12 15"></polygon>
                      </svg>
                      {handoverLoading || loading ? "Đang xử lý..." : "NHẬN XE"}
                    </button>
                  </>
                );
              }
              
              // ⭐⭐ BƯỚC 1: Nếu chưa bàn giao (vehicle status chưa RENTAL) → hiển thị nút "Bàn giao xe" ⭐⭐
              // Kiểm tra điều kiện bàn giao:
              // 1. Thanh toán toàn bộ (FULL_PAYMENT) có status SUCCESS
              // 2. Hoặc thanh toán từng đợt: cả DEPOSIT và PICKUP đều có status SUCCESS
              const canHandOver = fullOK || (depositedOK && pickupOK);
              const vehicleReady =
                vehicleStatus === "BOOKED" ||
                vehicleStatus === "AVAILABLE";
              
              if (canHandOver && vehicleReady) {
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
              
              // Nếu chưa đủ điều kiện bàn giao - hiển thị banner
              // Kiểm tra xem có dịch vụ chưa thanh toán không
              const unpaidServices = orderDetails.filter(d => {
                const type = String(d.type || "").toUpperCase();
                const status = String(d.status || "").toUpperCase();
                const isServiceType = type === "SERVICE" || type === "SERVICE_SERVICE";
                const isUnpaid = status === "PENDING";
                return isServiceType && isUnpaid;
              });
              
              const hasUnpaidServices = unpaidServices.length > 0;
              
              return (
                <div style={{
                  padding: "12px 16px",
                  backgroundColor: "#fee2e2",
                  border: "1px solid #fca5a5",
                  borderRadius: "8px",
                  color: "#dc2626",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginTop: "12px"
                }}>
                  {hasUnpaidServices 
                    ? "⚠️ Vui lòng chờ khách hàng trả phí dịch vụ và phát sinh"
                    : "⚠️ Vui lòng chờ khách hàng thanh toán toàn bộ để tiến hành bàn giao"
                  }
                </div>
              );
            }
            
            if (isPendingFinalPayment) {
              return (
                <p style={{ 
                  color: "#856404", 
                  fontSize: "14px", 
                  fontStyle: "italic", 
                  padding: "12px", 
                  backgroundColor: "#FFF3CD", 
                  borderRadius: "6px" 
                }}>
                  Đơn hàng đang chờ thanh toán dịch vụ cuối cùng.
                </p>
              );
            }
            
            // ⭐⭐ TRƯỜNG HỢP KHÔNG CÓ PICKUP THÀNH CÔNG: Hiển thị logic bàn giao cũ ⭐⭐
            // Kiểm tra xem có detail status WAITING không HOẶC xe đang được khách khác thuê
            const mainDetail = orderDetails.find(d => d.type === "RENTAL");
            const detailStatus = (
              orderDetails[0]?.vehicleStatus ||
              orderDetails[0]?.vehicle_status ||
              (mainDetail ? mainDetail.status : "")
            ).toUpperCase();
            const hasWaitingDetail = detailStatus === "WAITING";
            const backendVehicleStatusForHandover =
              orderDetails[0]?.vehicleStatus ||
              orderDetails[0]?.vehicle_status ||
              orderStatus;
            const vehicleRentedByOther =
              backendVehicleStatusForHandover === "RENTAL" && otherOrders.length > 0;
            const isWaiting = hasWaitingDetail || vehicleRentedByOther;
            
            // ⭐⭐ NẾU ĐANG WAITING HOẶC XE ĐANG ĐƯỢC KHÁCH KHÁC THUÊ, KHÔNG HIỂN THỊ NÚT ⭐⭐
            if (isWaiting) {
              return null; // Banner đã hiển thị thông báo, không cần hiển thị nút
            }
            
            // Nếu vehicle status = RENTAL và không phải WAITING, hiển thị nút nhận xe
            if (backendVehicleStatusForHandover === "RENTAL") {
              return (
                <>
                  <button
                    className="btn-receive-car"
                    onClick={handlePreviewReturn}
                    disabled={hasPendingOrderDetail || handoverLoading || loading}
                  >
                    <svg style={{ width: "18px", height: "18px", marginRight: "8px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1"></path>
                      <polygon points="12 15 17 21 7 21 12 15"></polygon>
                    </svg>
                    {handoverLoading || loading ? "Đang xử lý..." : "NHẬN XE"}
                  </button>
                </>
              );
            }
            
            // Trường hợp khác (xe chưa RENTAL) - hiển thị nút bàn giao
            const canHandOver = fullOK || depositedOK;
            const vehicleReady =
              backendVehicleStatusForHandover === "BOOKED" ||
              backendVehicleStatusForHandover === "AVAILABLE";
            
            if (canHandOver && vehicleReady && !isWaiting) {
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
                {!canHandOver && (
                  <p style={{ margin: "4px 0", fontStyle: "italic" }}>
                    ❌ Chưa đủ điều kiện bàn giao. 
                    {!depositedOK && " Thiếu đặt cọc."}
                    {!fullOK && " Thiếu thanh toán toàn bộ."}
                  </p>
                )}
                {canHandOver && !vehicleReady && (
                  <p style={{ margin: "4px 0", fontStyle: "italic" }}>
                    {vehicle?.status === "RENTAL" 
                      ? "⚠️ Xe đang được khách hàng khác thuê. Vui lòng đợi xe được trả về."
                      : "⚠️ Vui lòng chờ khách hàng thanh toán đầy đủ để bàn giao xe."}
                  </p>
                )}
                {canHandOver && vehicleReady && (
                  <p style={{ margin: "4px 0", fontStyle: "italic" }}>
                    Trạng thái chi tiết: {detailStatus || "N/A"}. Chờ điều kiện bàn giao.
                  </p>
                )}
              </div>
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
              type="datetime-local"
              value={returnTime}
              onChange={(e) => setReturnTime(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                fontSize: "16px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                marginTop: "8px"
              }}
            />
            <p style={{ 
              fontSize: "12px", 
              color: "#666", 
              marginTop: "4px",
              fontStyle: "italic"
            }}>
              (Bỏ trống = thời gian hiện tại)
            </p>

            <div className="modal-actions">
              <button 
                className="btn btn-confirm-return" 
                onClick={handleConfirmReturn}
                disabled={returnLoading}
              >
                <svg style={{ width: "18px", height: "18px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                {returnLoading ? "Đang xử lý..." : "XÁC NHẬN TRẢ XE"}
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  setShowReturnModal(false);
                  setReturnTime(""); // Reset returnTime khi đóng modal
                }}
              >
                <svg style={{ width: "18px", height: "18px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                ĐÓNG
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Service Modal */}
      {showServiceModal && (
        <div className="modal-overlay" onClick={() => setShowServiceModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "800px", width: "90%" }}>
            <h2>Thêm dịch vụ</h2>
            
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "12px", fontWeight: "600" }}>Loại dịch vụ</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  { value: "TRAFFIC_FEE", label: "Phí giao thông" },
                  { value: "CLEANING", label: "Vệ sinh" },
                  { value: "MAINTENANCE", label: "Bảo trì" },
                  { value: "REPAIR", label: "Sửa chữa" },
                  { value: "OTHER", label: "Khác" }
                ].map((option) => (
                  <div
                    key={option.value}
                    onClick={() => {
                      const selectedType = option.value;
                      setService({
                        ...service,
                        serviceType: selectedType,
                        description: "",
                        cost: 0
                      });
                      if (selectedType !== "OTHER") {
                        fetchServiceListByType(selectedType);
                      } else {
                        setSelectedServiceList([]);
                      }
                    }}
                    style={{
                      padding: "12px 16px",
                      border: service.serviceType === option.value ? "2px solid #000000" : "1px solid #ddd",
                      borderRadius: "4px",
                      cursor: "pointer",
                      backgroundColor: service.serviceType === option.value ? "#f5f5f5" : "#fff",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <span style={{ fontSize: "14px", fontWeight: service.serviceType === option.value ? "600" : "400" }}>
                      {option.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Danh sách dịch vụ theo loại đã chọn - Chỉ hiện khi không phải OTHER */}
            {service.serviceType && service.serviceType !== "OTHER" && (
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "12px", fontWeight: "600" }}>Chọn dịch vụ</label>
                {loadingServiceList ? (
                  <p style={{ color: "#777", fontSize: "14px" }}>Đang tải danh sách dịch vụ...</p>
                ) : selectedServiceList.length === 0 ? (
                  <p style={{ color: "#777", fontSize: "14px" }}>Không có dịch vụ nào cho loại này.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "300px", overflowY: "auto" }}>
                    {selectedServiceList.map((sv) => {
                      const isSelected = service.description === sv.description;
                      const displayCost = isSelected ? service.cost : (sv.cost || 0);
                      
                      return (
                        <div
                          key={sv.serviceId || sv.serviceType}
                          onClick={() => {
                            setService({
                              ...service,
                              serviceType: service.serviceType,
                              description: sv.description || sv.serviceType || "",
                              cost: sv.cost || 0
                            });
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "12px",
                            padding: "12px 16px",
                            border: isSelected ? "2px solid #000000" : "1px solid #ddd",
                            borderRadius: "4px",
                            cursor: "pointer",
                            backgroundColor: isSelected ? "#f5f5f5" : "#fff",
                            transition: "all 0.2s ease"
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "14px", fontWeight: isSelected ? "600" : "400" }}>
                              {sv.description || sv.serviceType || "Dịch vụ"}
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <input
                              type="number"
                              value={displayCost}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                const newCost = Number(e.target.value) || 0;
                                setService({
                                  ...service,
                                  serviceType: service.serviceType,
                                  description: sv.description || sv.serviceType || "",
                                  cost: newCost
                                });
                              }}
                              style={{
                                width: "120px",
                                padding: "6px 10px",
                                border: "1px solid #ddd",
                                borderRadius: "4px",
                                fontSize: "13px",
                                textAlign: "right"
                              }}
                            />
                            <span style={{ fontSize: "12px", color: "#666", whiteSpace: "nowrap" }}>VND</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tên dịch vụ và Giá tiền - Chỉ hiện khi chọn OTHER */}
            {service.serviceType === "OTHER" && (
              <>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Tên dịch vụ</label>
                  <input
                    type="text"
                    value={service.description}
                    placeholder="Nhập tên dịch vụ"
                    onChange={(e) =>
                      setService({
                        ...service,
                        description: e.target.value
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "14px"
                    }}
                  />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Giá tiền (VND)</label>
                  <input
                    type="number"
                    value={service.cost}
                    onChange={(e) =>
                      setService({
                        ...service,
                        cost: Number(e.target.value) || 0
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "14px"
                    }}
                  />
                </div>
              </>
            )}

            <div className="modal-actions">
              <button 
                className="btn btn-primary" 
                onClick={handleAddService}
                style={{ marginRight: "10px" }}
              >
                ➕ Thêm dịch vụ
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  setShowServiceModal(false);
                  setService({ serviceType: "", cost: 0, description: "" });
                  setSelectedServiceList([]);
                }}
              >
                ✖ Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Service Modal */}
      {showEditServiceModal && editingService && (
        <div className="modal-overlay" onClick={() => {
          setShowEditServiceModal(false);
          setEditingService(null);
          setEditServiceData({ price: 0, description: "" });
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px", width: "90%" }}>
            <h2>Sửa dịch vụ</h2>
            
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                Loại dịch vụ
              </label>
              <input
                type="text"
                value={(() => {
                  const type = String(editingService.type || "").toUpperCase();
                  // Check các loại dịch vụ cụ thể
                  if (type.includes("TRAFFIC_FEE")) return "Phí giao thông";
                  if (type.includes("CLEANING")) return "Vệ sinh";
                  if (type.includes("MAINTENANCE")) return "Bảo trì";
                  if (type.includes("REPAIR")) return "Sửa chữa";
                  if (type.includes("OTHER")) return "Khác";
                  // Nếu chỉ là "SERVICE" hoặc "SERVICE_SERVICE", có thể check description hoặc field khác
                  // Hoặc trả về "Dịch vụ" nếu không xác định được loại cụ thể
                  if (type === "SERVICE" || type === "SERVICE_SERVICE") {
                    // Có thể check description hoặc serviceType nếu có
                    const description = String(editingService.description || "").toUpperCase();
                    if (description.includes("GIAO THÔNG") || description.includes("TRAFFIC")) return "Phí giao thông";
                    if (description.includes("VỆ SINH") || description.includes("CLEANING")) return "Vệ sinh";
                    if (description.includes("BẢO TRÌ") || description.includes("MAINTENANCE")) return "Bảo trì";
                    if (description.includes("SỬA CHỮA") || description.includes("REPAIR")) return "Sửa chữa";
                    return "Dịch vụ";
                  }
                  return editingService.type || "N/A";
                })()}
                readOnly
                style={{
                  width: "100%",
                  padding: "10px",
                  fontSize: "14px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  backgroundColor: "#f5f5f5",
                  color: "#666",
                  cursor: "not-allowed"
                }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                Giá dịch vụ (VND) <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="number"
                value={editServiceData.price}
                onChange={(e) => setEditServiceData({ ...editServiceData, price: e.target.value })}
                min="0"
                step="1000"
                style={{
                  width: "100%",
                  padding: "10px",
                  fontSize: "14px",
                  border: "1px solid #ddd",
                  borderRadius: "4px"
                }}
                disabled={processing}
                placeholder="Nhập giá dịch vụ"
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                Mô tả <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <textarea
                value={editServiceData.description}
                onChange={(e) => setEditServiceData({ ...editServiceData, description: e.target.value })}
                rows="4"
                style={{
                  width: "100%",
                  padding: "10px",
                  fontSize: "14px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  resize: "vertical",
                  fontFamily: "inherit"
                }}
                disabled={processing}
                placeholder="Nhập mô tả dịch vụ"
              />
            </div>

            <div className="modal-actions">
              <button 
                className="btn btn-primary" 
                onClick={handleUpdateService}
                disabled={processing}
                style={{ marginRight: "10px" }}
              >
                {processing ? "Đang xử lý..." : "💾 Lưu thay đổi"}
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  setShowEditServiceModal(false);
                  setEditingService(null);
                  setEditServiceData({ price: 0, description: "" });
                }}
                disabled={processing}
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