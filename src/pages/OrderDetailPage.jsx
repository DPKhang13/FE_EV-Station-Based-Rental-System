import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authService, orderService, vehicleService } from "../services";
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
  const [returnLoading, setReturnLoading] = useState(false);

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
  const [currentRentalOrderId, setCurrentRentalOrderId] = useState(null); // OrderId đang thuê xe hiện tại
  
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
      setOrderStatus(status); // Lưu order status vào state
    } catch (err) {
      setOrderStatus("");
    }
  }, [orderId]);

  // ⭐⭐ KIỂM TRA ĐƠN ĐANG THUÊ XE - Tìm orderId đang thuê xe hiện tại ⭐⭐
  const checkCurrentRentalOrder = useCallback(async (vehicleId) => {
    if (!vehicleId) {
      setCurrentRentalOrderId(null);
      return;
    }

    try {
      const allOrders = await orderService.getAll();
      const ordersData = Array.isArray(allOrders) ? allOrders : (allOrders?.data || []);
      
      // Tìm order có cùng vehicleId và status RENTAL
      const rentalOrder = ordersData.find(order => {
        const orderVehicleId = order.vehicleId || order.vehicle_id;
        const orderStatus = String(order.status || "").toUpperCase();
        const isSameVehicle = orderVehicleId && Number(orderVehicleId) === Number(vehicleId);
        const isRental = orderStatus === "RENTAL";
        return isSameVehicle && isRental;
      });

      if (rentalOrder) {
        const rentalOrderId = rentalOrder.orderId || rentalOrder.order_id;
        setCurrentRentalOrderId(String(rentalOrderId));
      } else {
        setCurrentRentalOrderId(null);
      }
    } catch (err) {
      setCurrentRentalOrderId(null);
    }
  }, []);

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

    const first = details?.[0];
   
    if (first) {
      
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
      
      // ⭐⭐ KIỂM TRA ĐƠN ĐANG THUÊ XE ⭐⭐
      await checkCurrentRentalOrder(first.vehicleId);
    }
    
    // Fetch order status
    await fetchOrderStatus();
    // Fetch payments
    await fetchPayments();
  }, [orderId, fetchOrderStatus, fetchPayments, checkCurrentRentalOrder]);

  const handlePreviewReturn = async () => {
    // ⭐⭐ VALIDATION: Kiểm tra nếu xe đang được thuê bởi order khác ⭐⭐
    if (currentRentalOrderId && String(currentRentalOrderId) !== String(orderId)) {
      showToast("error", `⚠️ Xe này đang được thuê bởi đơn hàng #${currentRentalOrderId}. Chỉ đơn hàng đang thuê xe mới có thể trả xe.`);
      return;
    }

    // ⭐⭐ VALIDATION: Kiểm tra vehicle status - chỉ cho phép khi RENTAL và orderId khớp ⭐⭐
    const backendVehicleStatus = orderDetails[0]?.vehicleStatus || orderDetails[0]?.vehicle_status || orderStatus;
    const vehicleStatus = String(backendVehicleStatus || "").toUpperCase();
    
    if (vehicleStatus !== "RENTAL") {
      showToast("error", `⚠️ Xe không đang ở trạng thái thuê (RENTAL). Không thể trả xe.`);
      return;
    }

    if (vehicleStatus === "RENTAL" && String(currentRentalOrderId) !== String(orderId)) {
      showToast("error", `⚠️ Xe đang được thuê bởi đơn hàng khác. Chỉ đơn hàng đang thuê xe mới có thể trả xe.`);
      return;
    }

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
    // ⭐⭐ VALIDATION: Kiểm tra nếu xe đang được thuê bởi order khác ⭐⭐
    if (currentRentalOrderId && String(currentRentalOrderId) !== String(orderId)) {
      showToast("error", `⚠️ Xe này đang được thuê bởi đơn hàng #${currentRentalOrderId}. Chỉ đơn hàng đang thuê xe mới có thể trả xe.`);
      setShowReturnModal(false);
      return;
    }

    // ⭐⭐ VALIDATION: Kiểm tra vehicle status - chỉ cho phép khi RENTAL và orderId khớp ⭐⭐
    const backendVehicleStatus = orderDetails[0]?.vehicleStatus || orderDetails[0]?.vehicle_status || orderStatus;
    const vehicleStatus = String(backendVehicleStatus || "").toUpperCase();
    
    if (vehicleStatus !== "RENTAL") {
      showToast("error", `⚠️ Xe không đang ở trạng thái thuê (RENTAL). Không thể trả xe.`);
      setShowReturnModal(false);
      return;
    }

    if (vehicleStatus === "RENTAL" && String(currentRentalOrderId) !== String(orderId)) {
      showToast("error", `⚠️ Xe đang được thuê bởi đơn hàng khác. Chỉ đơn hàng đang thuê xe mới có thể trả xe.`);
      setShowReturnModal(false);
      return;
    }

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
        fetchOrderStatus(),
        checkCurrentRentalOrder(vehicle?.vehicleId) // Refresh lại để cập nhật currentRentalOrderId
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

      const response = await fetch("http://localhost:8080/api/order-services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      await response.json();

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
    // ⭐⭐ VALIDATION: Kiểm tra nếu xe đang được thuê bởi order khác ⭐⭐
    if (currentRentalOrderId && String(currentRentalOrderId) !== String(orderId)) {
      showToast("error", `⚠️ Xe này đang được thuê bởi đơn hàng #${currentRentalOrderId}. Không thể bàn giao cho đơn hàng hiện tại. Vui lòng đợi xe được trả về và có trạng thái BOOKED.`);
      return;
    }

    // ⭐⭐ VALIDATION: Kiểm tra vehicle status - chỉ cho phép khi BOOKED hoặc AVAILABLE ⭐⭐
    const backendVehicleStatus = orderDetails[0]?.vehicleStatus || orderDetails[0]?.vehicle_status || orderStatus;
    const vehicleStatus = String(backendVehicleStatus || "").toUpperCase();
    
    if (vehicleStatus === "RENTAL" && String(currentRentalOrderId) !== String(orderId)) {
      showToast("error", `⚠️ Xe đang được thuê bởi đơn hàng khác. Không thể bàn giao cho đơn hàng hiện tại.`);
      return;
    }

    const ok = window.confirm("Xác nhận bàn giao xe cho khách?");
    if (!ok) return;

    try {
      setHandoverLoading(true);
      await orderService.pickup(orderId);
      showToast("success", "✅ Đã xác nhận bàn giao!");
      // Refresh lại để cập nhật currentRentalOrderId
      await Promise.all([
        refetchDetails(),
        checkCurrentRentalOrder(vehicle?.vehicleId)
      ]);
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

  const handleSuggestAlternativeVehicle = () => {
    navigate("/staff/quan-ly-giao-nhan-xe");
  };

  const renderVehicleRentedWarning = (conflictOrderId) => (
    <div className="handover-warning handover-warning-with-actions">
      <p>
        ⚠️ Xe này đang được thuê bởi đơn hàng #{conflictOrderId}. Chỉ đơn hàng đang thuê xe mới có thể trả xe.
      </p>
      <div className="handover-warning-actions">
        <button
          className="btn btn-suggest-vehicle"
          onClick={handleSuggestAlternativeVehicle}
        >
          Thay thế xe tương tự
        </button>
        <button
          className="btn btn-danger"
          onClick={handleCancelHandover}
          disabled={handoverLoading}
        >
          Hủy đơn
        </button>
      </div>
    </div>
  );
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
          
          // ⭐⭐ KIỂM TRA ĐƠN ĐANG THUÊ XE ⭐⭐
          await checkCurrentRentalOrder(first.vehicleId);
          
          setOtherOrders([]);
        }
      } catch (err) {
        console.error(err);
        setError("Không thể tải dữ liệu!");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orderId, userId, fetchOrderStatus, fetchPayments, fetchPriceList, checkCurrentRentalOrder]);

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
      // ✅ Gọi các API song song để tăng tốc độ
      await Promise.all([
        fetchPayments(),
        refetchDetails(),
        fetchOrderStatus()
      ]);
      
      // ⭐⭐ ĐỢI MỘT CHÚT RỒI REFRESH LẠI ĐỂ ĐẢM BẢO PICKUP DETAIL ĐƯỢC HIỂN THỊ ⭐⭐
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh lại một lần nữa để đảm bảo PICKUP detail được hiển thị
      await refetchDetails();
      
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
      "DEPOSITED": "Đã đặt cọc",
      "BOOKED": "Đã đặt",
      "RENTAL": "Đang thuê",
      "WAITING_FOR_VEHICLE": "Chờ xe",
      "WAITING": "Chờ xe",
      "CONFIRMED": "Đã xác nhận",
      "COMPLETED": "Đã hoàn thành",
      "AWAITING": "Chờ nhận xe",
      "PENDING_FINAL_PAYMENT": "Chờ thanh xác nhận",
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
        <svg className="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    }
    
    // Icon checkmark cho các trạng thái thành công
    if (["PAID", "COMPLETED", "CONFIRMED", "DEPOSITED", "BOOKED"].includes(statusUpper)) {
      return (
        <svg className="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      );
    }
    
    // Icon X cho các trạng thái thất bại/hủy
    if (["FAILED", "PAYMENT_FAILED", "CANCELLED"].includes(statusUpper)) {
      return (
        <svg className="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      );
    }
    
    // Icon mặc định (xe) cho các trạng thái khác
    return (
      <svg className="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

  const hasPendingCashPaymentGlobal = payments.some((p) => {
    const method = String(p.method || "").toUpperCase();
    const status = String(p.status || "").toUpperCase();
    return method === "CASH" && status === "PENDING";
  });

  const hasPendingServiceDetail = orderDetails.some((d) => {
    const type = String(d.type || "").toUpperCase();
    const status = String(d.status || "").toUpperCase();
    return (type === "SERVICE" || type === "SERVICE_SERVICE") && status === "PENDING";
  });

  const isOrderCompleted = String(orderStatus || "").toUpperCase() === "COMPLETED";

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
        <div className="order-status-header">
          {getStatusIcon(orderStatus)}
          <p className="order-status-text">
            <strong className="order-status-label">Trạng thái: </strong>
            <span className="order-status-value">{getOrderStatusText(orderStatus)}</span>
          </p>
        </div>
      )}

      {/* CUSTOMER */}
      {customer && (
        <div className="info-card">
          <h2>Thông tin khách hàng</h2>

          <div className="customer-info-grid">
            <div className="customer-info-item">
              <svg className="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <p className="customer-info-text">
                <span className="customer-info-label">Họ tên:</span> 
                <span>{customer.fullName}</span>
              </p>
            </div>
            
            <div className="customer-info-item">
              <svg className="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <p className="customer-info-text">
                <span className="customer-info-label">Email:</span> 
                <span>{customer.email}</span>
              </p>
            </div>
            
            <div className="customer-info-item">
              <svg className="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <p className="customer-info-text">
                <span className="customer-info-label">Số điện thoại:</span> 
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
            
            <div className="vehicle-info-grid">
              {/* Biển số */}
              <div className="vehicle-info-item">
                <svg className="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1" />
                  <path d="M12 15l-3-3H7a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2l-3 3z" />
                </svg>
                <span className="vehicle-info-text">
                  {vehicle.plateNumber || "N/A"}
                </span>
              </div>
              
              {/* Số chỗ */}
              <div className="vehicle-info-item">
                <svg className="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span className="vehicle-info-text">
                  {seatCount} chỗ
                </span>
              </div>
              
              {/* Loại xe */}
              <div className="vehicle-info-item">
                <svg className="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                  <path d="M8 4v6M16 4v6" />
                </svg>
                <span className="vehicle-info-text">
                  {variant}
                </span>
              </div>
              
              {/* Variant/Grade */}
              <div className="vehicle-info-item">
                <svg className="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
                <span className="vehicle-info-text">
                  {variant}
                </span>
              </div>
              
              {/* Màu sắc */}
              <div className="vehicle-info-item">
                <svg className="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                </svg>
                <span className="vehicle-info-text">
                  {vehicle.color || "N/A"}
                </span>
                {vehicle.color && vehicle.color !== "N/A" && (
                  <span className={`color-swatch ${vehicle.color.toLowerCase()}`}></span>
                )}
              </div>
              
              {/* Trạm hiện tại */}
              <div className="vehicle-info-item">
                <svg className="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span className="vehicle-info-text">
                  {vehicle.stationName || "N/A"}
                </span>
              </div>
            </div>
            
            {/* Trạng thái - Ẩn khi đơn hàng đã hoàn thành */}
            {orderStatus !== "COMPLETED" && (
              <div className="vehicle-status-container">
                <svg className="icon-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <p>
                  <span className="vehicle-status-label">Trạng thái:&nbsp;</span>
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
        <div className="order-details-header">
          <h2 className="order-details-title">Các giao dịch trong đơn hàng</h2>
          <button 
            className="btn btn-add-service" 
            onClick={() => {
              if (isOrderCompleted) return;
              setService({ serviceType: "", cost: 0, description: "" });
              setSelectedServiceList([]);
              setShowServiceModal(true);
            }}
            disabled={isOrderCompleted}
            title={isOrderCompleted ? "Đơn hàng đã hoàn tất, không thể thêm dịch vụ." : undefined}
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
              <div className="detail-header detail-header-flex">
                {/* Loại - Góc trên bên trái */}
                <span className="status-tag type-tag">
                  {getTypeLabel(detail.type)}
                </span>
                
                {/* Nút Xác nhận đã thanh toán hoặc Menu 3 chấm - Góc trên bên phải */}
                <div className="detail-actions">
                  {/* Menu 3 chấm - Chỉ hiển thị cho SERVICE */}
                  {isService && (
                    <div className="menu-container" data-menu-container>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuDetailId(openMenuDetailId === detail.detailId ? null : detail.detailId);
                        }}
                        disabled={processing}
                        className="menu-button"
                      >
                        ⋯
                      </button>
                      
                      {/* Dropdown menu */}
                      {openMenuDetailId === detail.detailId && (
                        <div
                          className="menu-dropdown"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => {
                              handleEditService(detail);
                            }}
                            className="menu-item-edit"
                          >
                             Sửa
                          </button>
                          <button
                            onClick={() => {
                              handleDeleteService(detail.detailId);
                              setOpenMenuDetailId(null);
                            }}
                            className="menu-item-delete"
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
                      className="btn-confirm-payment"
                    >
                      {processing ? "Đang xử lý..." : "Xác nhận đã thanh toán"}
                    </button>
                  )}
                </div>
              </div>

              <div className="detail-grid">
                {/* Cột 1: Thời gian nhận xe và Thời gian trả xe */}
                <div className="detail-grid-column">
                  <p><span>Thời gian nhận xe:</span> {fmtVN(detail.startTime)}</p>
                  <p><span>Thời gian trả xe:</span> {fmtVN(detail.endTime)}</p>
                </div>
                
                {/* Cột 2: Số tiền và Tình trạng thanh toán */}
                <div className="detail-grid-column">
                  <p><span>Số tiền:</span> {Number(detail.price).toLocaleString("vi-VN")} VND</p>
                  <p><span>Tình trạng thanh toán:</span> <span className="status-underline">{getStatusText()}</span></p>
                </div>
                
                {/* Cột 3: Phương thức thanh toán và Mô tả */}
                <div className="detail-grid-column">
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
            <div className="info-card service-banner">
              <div className="service-banner-content">
                <div className="service-banner-header-flex">
                  <div className="service-banner-header-content">
                    <h3 className="service-banner-title-text">
                      Chưa thanh toán số tiền dịch vụ
                    </h3>
                    <p className="service-banner-description">
                      Tổng tiền dịch vụ chưa thanh toán: <strong className="service-banner-amount-strong">{totalUnpaidServiceAmount.toLocaleString("vi-VN")} VND</strong>
                    </p>
                  </div>
                </div>
                
                {/* ⭐⭐ CHỈ HIỂN THỊ NÚT KHI CÓ PAYMENT CASH PENDING ⭐⭐ */}
                {hasServicePendingPayment && (
                  <div className="service-banner-actions-right">
                    <button
                      onClick={() => {
                        handleStaffConfirmPayment();
                      }}
                      disabled={processing}
                      className="btn-service-confirm"
                    >
                      {processing ? "Đang xử lý..." : "✅ Xác nhận đã thanh toán"}
                    </button>
                  </div>
                )}
                
                {/* ⭐⭐ THÔNG BÁO KHI CHƯA CÓ PAYMENT PENDING ⭐⭐ */}
                {!hasServicePendingPayment && (
                  <div className="service-banner-notice">
                    <p className="service-banner-notice-text">
                      ⏳ Đang chờ khách hàng thanh toán. Nút xác nhận sẽ hiển thị sau khi khách hàng tạo thanh toán tiền mặt.
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        }
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
        return shouldShowWaitingBanner ? (
          <div className="info-card waiting-banner">
            <div className="waiting-banner-content-flex">
              <span className="waiting-banner-icon">⚠️</span>
              <div>
                <h3 className="waiting-banner-title-text">
                  Xe này đã được khách hàng khác thuê
                </h3>
                <p className="waiting-banner-description">
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
        <div className="info-card confirmed-banner">
          <div className="confirmed-banner-content-flex">
            <span className="confirmed-banner-icon">✅</span>
            <div>
              <h3 className="confirmed-banner-title-text">
                Xe đã có sẵn! Bạn có thể đến nhận xe
              </h3>
              <p className="confirmed-banner-description">
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
            // ⭐ NEW RULE: Nếu xe RENTAL bởi order khác → không được bàn giao

            
  if (otherOrders.length > 0) {
    const otherRental = otherOrders.find(o => 
      String(o.status).toUpperCase() === "RENTAL"
    );

    if (otherRental && String(otherRental.orderId) !== String(orderId)) {
      return renderVehicleRentedWarning(otherRental.orderId);
    }
  }

if (hasPendingServiceDetail) {
  return (
    <div className="handover-warning">
      ⚠️ Vui lòng chờ khách hàng thanh toán phí phát sinh và dịch vụ trước khi hoàn tất bàn giao.
    </div>
  );
}

            // ⭐⭐ KIỂM TRA ĐẦU TIÊN: Nếu đơn đã hoàn thành (COMPLETED) → hiển thị thông báo ⭐⭐
            const isCompleted = orderStatus === "COMPLETED";
            const isAwaiting = orderStatus === "AWAITING";
            const isPaid = orderStatus === "PAID"; // Status mới: đã thanh toán hết dịch vụ
            const isPendingFinalPayment = orderStatus === "PENDING_FINAL_PAYMENT";
            // ⭐⭐ NEW: Nếu chỉ có đặt cọc thành công → KHÔNG render nút, chỉ báo chờ thanh toán ⭐⭐
if (depositedOK && !pickupOK && !fullOK) {
  return (
    <div className="handover-warning">
      ⚠️ Vui lòng chờ khách hàng thanh toán toàn bộ để tiến hành bàn giao
    </div>
  );
}

            if (isCompleted) {
              return (
                <p className="handover-status-success">
                  ✅ Đơn hàng đã hoàn thành. Khách hàng đã trả xe.
                </p>
              );
            }
            
            // ⭐⭐ DEBUG: Log order status để kiểm tra ⭐⭐
            // ⭐⭐ KIỂM TRA PAID TRƯỚC → Hiển thị nút "Xác nhận hoàn tất đơn hàng" ⭐⭐
            // PAID: đã thanh toán hết dịch vụ → hiển thị nút hoàn tất
            // AWAITING: đã thanh toán đặt cọc, chờ nhận xe → hiển thị nút bàn giao (không phải hoàn tất)
            const orderStatusUpper = String(orderStatus || "").toUpperCase();
            const completionEligibleStatuses = ["PAID", "CHECKING", "PENDING_FINAL_PAYMENT"];
            const isReadyForCompletion =
              completionEligibleStatuses.includes(orderStatusUpper) &&
              !hasPendingServiceDetail &&
              !hasPendingCashPaymentGlobal;
            
            if (isReadyForCompletion) {
              const statusMessage =
                orderStatusUpper === "PAID"
                  ? "✅ Đơn hàng đã thanh toán đầy đủ (bao gồm dịch vụ) và đã nhận xe. Vui lòng xác nhận hoàn tất đơn hàng."
                  : "✅ Khách hàng đã trả xe đúng hạn, không phát sinh phí. Vui lòng xác nhận hoàn tất đơn hàng.";
              
              return (
                <div className="handover-info-box-content">
                  <p className="handover-info-text-content">
                    {statusMessage}
                  </p>
                  <button
                    className="btn-complete-order"
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
              // ⭐ NEW: Nếu PICKUP thành công nhưng xe CHƯA bàn giao thật sự → vẫn phải BÀN GIAO XE
              // ⭐⭐ VALIDATION: Kiểm tra nếu xe đang được thuê bởi order khác ⭐⭐
if (pickupDetail && vehicleStatus !== "RENTAL") {
    const isVehicleRentedByOther = currentRentalOrderId && String(currentRentalOrderId) !== String(orderId);
    
    if (isVehicleRentedByOther) {
        return renderVehicleRentedWarning(currentRentalOrderId);
    }

    const readyStatuses = ["BOOKED", "AVAILABLE"];
    if (!readyStatuses.includes(vehicleStatus)) {
        return (
            <div className="handover-warning">
                ⚠️ Xe đang ở trạng thái {getVehicleStatusText(vehicleStatus)?.toLowerCase() || "chưa sẵn sàng"}. Vui lòng chờ xe hoàn tất kiểm tra trước khi bàn giao.
            </div>
        );
    }
    
    return (
        <>
            <button 
                className="btn btn-primary"
                onClick={handleConfirmHandover}
                disabled={handoverLoading}
            >
                {handoverLoading ? "Đang xử lý..." : "✅ Xác nhận bàn giao xe"}
            </button>

            <button 
                className="btn btn-danger"
                onClick={handleCancelHandover}
                disabled={handoverLoading}
            >
                ❌ Hủy bàn giao
            </button>
        </>
    );
}

// ⭐ Nếu xe thực sự đang được thuê → mới hiển thị "NHẬN XE"
// ⭐⭐ VALIDATION: Chỉ cho phép nếu orderId khớp với đơn đang thuê xe ⭐⭐
if (vehicleStatus === "RENTAL") {
    const isCurrentOrderRenting = !currentRentalOrderId || String(currentRentalOrderId) === String(orderId);
    
    if (!isCurrentOrderRenting) {
        return renderVehicleRentedWarning(currentRentalOrderId);
    }
    
    return (
        <button 
            className="btn-receive-car"
            onClick={handlePreviewReturn}
            disabled={handoverLoading || loading}
        >
            {handoverLoading || loading ? "Đang xử lý..." : "NHẬN XE"}
        </button>
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
              
              // ⭐⭐ VALIDATION: Kiểm tra nếu xe đang được thuê bởi order khác ⭐⭐
              const isVehicleRentedByOther = currentRentalOrderId && String(currentRentalOrderId) !== String(orderId);
              
              if (canHandOver && vehicleReady) {
                if (isVehicleRentedByOther) {
                  return renderVehicleRentedWarning(currentRentalOrderId);
                }
                
                return (
                  <>
                    <button
                      className="btn btn-primary"
                      onClick={handleConfirmHandover}
                      disabled={handoverLoading}
                    >
                      {handoverLoading ? "Đang xử lý..." : "✅ Xác nhận bàn giao"}
                    </button>

                    <button
                      className="btn btn-danger"
                      onClick={handleCancelHandover}
                      disabled={pickupOK || fullOK || handoverLoading}
                    >
                      ❌ Hủy bàn giao
                    </button>
                  </>
                );
              }
              
if (canHandOver && !vehicleReady && !isVehicleRentedByOther) {
  const humanStatus = getVehicleStatusText(vehicleStatus) || "chưa sẵn sàng";
  return (
    <div className="handover-warning">
      ⚠️ Xe đang ở trạng thái {humanStatus.toLowerCase()}. Vui lòng chờ xe sẵn sàng trước khi bàn giao.
    </div>
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
                <div className="handover-warning">
                  {hasUnpaidServices 
                    ? "⚠️ Vui lòng chờ khách hàng trả phí dịch vụ và phát sinh"
                    : "⚠️ Vui lòng chờ khách hàng thanh toán toàn bộ để tiến hành bàn giao"
                  }
                </div>
              );
            }
            
            if (isPendingFinalPayment) {
              return (
                <p className="handover-status-warning">
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
            // ⭐⭐ VALIDATION: Chỉ cho phép nếu orderId khớp với đơn đang thuê xe ⭐⭐
            if (backendVehicleStatusForHandover === "RENTAL") {
              const isCurrentOrderRenting = !currentRentalOrderId || String(currentRentalOrderId) === String(orderId);
              
              if (!isCurrentOrderRenting) {
                return renderVehicleRentedWarning(currentRentalOrderId);
              }
              
              return (
                <>
                  <button
                    className="btn-receive-car"
                    onClick={handlePreviewReturn}
                    disabled={hasPendingOrderDetail || handoverLoading || loading}
                  >
                    <svg className="icon-md margin-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
            
            // ⭐⭐ VALIDATION: Kiểm tra nếu xe đang được thuê bởi order khác ⭐⭐
            const isVehicleRentedByOther = currentRentalOrderId && String(currentRentalOrderId) !== String(orderId);
            
            if (canHandOver && vehicleReady && !isWaiting) {
              if (isVehicleRentedByOther) {
                return renderVehicleRentedWarning(currentRentalOrderId);
              }
              
              return (
                <>
                  <button
                    className="btn btn-primary"
                    onClick={handleConfirmHandover}
                    disabled={handoverLoading}
                  >
                    {handoverLoading ? "Đang xử lý..." : "✅ Xác nhận bàn giao"}
                  </button>

                  <button
                    className="btn btn-danger"
                    onClick={handleCancelHandover}
                    disabled={pickupOK || fullOK || handoverLoading}
                  >
                    ❌ Hủy bàn giao
                  </button>
                </>
              );
            }

            if (canHandOver && !vehicleReady && !isWaiting && !isVehicleRentedByOther) {
              const humanVehicleStatus = getVehicleStatusText(backendVehicleStatusForHandover) || "chưa sẵn sàng";
              return (
                <div className="handover-warning">
                  ⚠️ Xe đang ở trạng thái {humanVehicleStatus.toLowerCase()}. Vui lòng chờ xe sẵn sàng trước khi bàn giao.
                </div>
              );
            }
            
            // Hiển thị lý do không thể bàn giao
            return (
              <div className="handover-error-container">
                {!canHandOver && (
                  <p className="handover-error-item">
                    ❌ Chưa đủ điều kiện bàn giao. 
                    {!depositedOK && " Thiếu đặt cọc."}
                    {!fullOK && " Thiếu thanh toán toàn bộ."}
                  </p>
                )}
                {canHandOver && !vehicleReady && (
                  <p className="handover-error-item">
                    {vehicle?.status === "RENTAL" 
                      ? "⚠️ Xe đang được khách hàng khác thuê. Vui lòng đợi xe được trả về."
                      : "⚠️ Vui lòng chờ khách hàng thanh toán đầy đủ để bàn giao xe."}
                  </p>
                )}
                {canHandOver && vehicleReady && (
                  <p className="handover-error-item">
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
              className="modal-text-input-field"
            />
            <p className="return-modal-time-hint">
              (Bỏ trống = thời gian hiện tại)
            </p>

            <div className="modal-actions">
              <button 
                className="btn btn-confirm-return" 
                onClick={handleConfirmReturn}
                disabled={returnLoading}
              >
                <svg className="icon-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
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
                <svg className="icon-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
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
          <div className="modal-content modal-content-wrapper" onClick={(e) => e.stopPropagation()}>
            <h2>Thêm dịch vụ</h2>
            
            <div className="modal-section-spacing">
              <label className="modal-label-block">Loại dịch vụ</label>
              <div className="modal-options-column">
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
                    className={`modal-option-item ${service.serviceType === option.value ? "selected" : ""}`}
                  >
                    <span className={service.serviceType === option.value ? "modal-option-text-selected" : "modal-option-text-normal"}>
                      {option.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Danh sách dịch vụ theo loại đã chọn - Chỉ hiện khi không phải OTHER */}
            {service.serviceType && service.serviceType !== "OTHER" && (
              <div className="modal-section-spacing">
                <label className="modal-label-block">Chọn dịch vụ</label>
                {loadingServiceList ? (
                  <p className="modal-loading-text">Đang tải danh sách dịch vụ...</p>
                ) : selectedServiceList.length === 0 ? (
                  <p className="modal-empty-text">Không có dịch vụ nào cho loại này.</p>
                ) : (
                  <div className="modal-service-list-scroll">
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
                          className={`modal-service-item-row ${isSelected ? "selected" : ""}`}
                        >
                          <div className="modal-service-name-wrapper">
                            <div className={isSelected ? "modal-service-name-selected" : "modal-service-name-normal"}>
                              {sv.description || sv.serviceType || "Dịch vụ"}
                            </div>
                          </div>
                          <div className="modal-service-price-wrapper">
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
                              className="modal-price-input-field"
                            />
                            <span className="modal-price-label-text">VND</span>
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
                <div className="modal-section-spacing">
                  <label className="modal-label-block-small">Tên dịch vụ</label>
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
                    className="modal-text-input-field"
                  />
                </div>

                <div className="modal-section-spacing">
                  <label className="modal-label-block-small">Giá tiền (VND)</label>
                  <input
                    type="number"
                    value={service.cost}
                    onChange={(e) =>
                      setService({
                        ...service,
                        cost: Number(e.target.value) || 0
                      })
                    }
                    className="modal-number-input-field"
                  />
                </div>
              </>
            )}

            <div className="modal-actions">
              <button 
                className="btn btn-primary" 
                onClick={handleAddService}
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
          <div className="modal-content modal-content-wrapper" onClick={(e) => e.stopPropagation()}>
            <h2>Sửa dịch vụ</h2>
            
            <div className="modal-section-spacing">
              <label className="modal-label-block-small">
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
                className="modal-input-readonly"
              />
            </div>

            <div className="modal-section-spacing">
              <label className="modal-label-block-small">
                Giá dịch vụ (VND) <span className="required-asterisk">*</span>
              </label>
              <input
                type="number"
                value={editServiceData.price}
                onChange={(e) => setEditServiceData({ ...editServiceData, price: e.target.value })}
                min="0"
                step="1000"
                className="modal-number-input-field"
                disabled={processing}
                placeholder="Nhập giá dịch vụ"
              />
            </div>

            <div className="modal-section-spacing">
              <label className="modal-label-block-small">
                Mô tả <span className="required-asterisk">*</span>
              </label>
              <textarea
                value={editServiceData.description}
                onChange={(e) => setEditServiceData({ ...editServiceData, description: e.target.value })}
                rows="4"
                className="modal-textarea-field"
                disabled={processing}
                placeholder="Nhập mô tả dịch vụ"
              />
            </div>

            <div className="modal-actions">
              <button 
                className="btn btn-primary" 
                onClick={handleUpdateService}
                disabled={processing}
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