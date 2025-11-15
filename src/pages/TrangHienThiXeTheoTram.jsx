import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../components/admin/VehicleManagement.css";

// Import ảnh 4 chỗ từ các thư mục riêng
// BMW 4 chỗ
import BMW4_Red from "../assets/BMW4/red.png";
import BMW4_White from "../assets/BMW4/white.jpg";
import BMW4_Blue from "../assets/BMW4/blue.jpg";
import BMW4_Black from "../assets/BMW4/black.png";
import BMW4_Silver from "../assets/BMW4/silver.jpg";

// Tesla 4 chỗ
import Tesla4_Red from "../assets/Tes4/red.jpg";
import Tesla4_White from "../assets/Tes4/white.jpg";
import Tesla4_Blue from "../assets/Tes4/blue.jpg";
import Tesla4_Black from "../assets/Tes4/black.jpg";
import Tesla4_Silver from "../assets/Tes4/silver.jpg";

// VinFast 4 chỗ
import VinFast4_Red from "../assets/Vin4/red.png";
import VinFast4_White from "../assets/Vin4/white.jpg";
import VinFast4_Blue from "../assets/Vin4/blue.jpg";
import VinFast4_Black from "../assets/Vin4/black.png";
import VinFast4_Silver from "../assets/Vin4/silver.png";

// Import ảnh 7 chỗ từ các thư mục riêng
// BMW 7 chỗ
import BMW7_Red from "../assets/BMW7/red.jpg";
import BMW7_White from "../assets/BMW7/white.jpg";
import BMW7_Blue from "../assets/BMW7/blue.jpg";
import BMW7_Black from "../assets/BMW7/black.jpg";
import BMW7_Silver from "../assets/BMW7/silver.jpg";

// Tesla 7 chỗ
import Tesla7_Red from "../assets/Tes7/red.jpg";
import Tesla7_White from "../assets/Tes7/white.jpg";
import Tesla7_Blue from "../assets/Tes7/blue.jpg";
import Tesla7_Black from "../assets/Tes7/black.jpg";
import Tesla7_Silver from "../assets/Tes7/silver.jpg";

// VinFast 7 chỗ
import VinFast7_Red from "../assets/Vin7/red.jpg";
import VinFast7_White from "../assets/Vin7/white.jpg";
import VinFast7_Blue from "../assets/Vin7/blue.jpg";
import VinFast7_Black from "../assets/Vin7/black.jpg";
import VinFast7_Silver from "../assets/Vin7/silver.jpg";

import DefaultCar from "../assets/4standard.jpg";

const TrangHienThiXeTheoTram = () => {
  const { station } = useParams();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stationName, setStationName] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showOrderDetailModal, setShowOrderDetailModal] = useState(false);
  const [rentalHistory, setRentalHistory] = useState([]);
  const [orderDetails, setOrderDetails] = useState([]);
  const [editingVehicleId, setEditingVehicleId] = useState(null);
  const [openOrderMenuId, setOpenOrderMenuId] = useState(null);
  const [currentHistoryVehicleId, setCurrentHistoryVehicleId] = useState(null);
  const [showEditOrderModal, setShowEditOrderModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editOrderFormData, setEditOrderFormData] = useState({
    status: "PENDING",
    price: 0,
    stationName: ""
  });
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);
  const [addOrderFormData, setAddOrderFormData] = useState({
    stationId: "",
    vehicleId: "",
    startTime: "",
    endTime: "",
    couponCode: ""
  });
  const [allStations, setAllStations] = useState([]);
  const [vehiclesByStation, setVehiclesByStation] = useState([]);
  const [formData, setFormData] = useState({
    plateNumber: "",
    status: "Available",
    vehicleName: "",
    brand: "VinFast",
    color: "White",
    variant: "air",
    seatCount: 4
  });
  const [editFormData, setEditFormData] = useState({
    status: "Available",
    brand: "VinFast",
    color: "White",
    variant: "air",
    seatCount: 4
  });
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });
  
  // Search and Filter states (from CarRent)
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Bộ lọc
  const [filters, setFilters] = useState({
    colors: [],
    seatCounts: [],
    statuses: [],
  });

  // Hàm hiển thị thông báo
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" });
    }, 3000);
  };

  // Hàm dịch thông báo lỗi từ API sang tiếng Việt
  const translateError = (errorMessage) => {
    const errorMap = {
      "plateNumber already exists": "Biển số xe đã tồn tại",
      "plateNumber must not be blank": "Biển số xe không được để trống",
      "vehicleName must not be blank": "Tên xe không được để trống",
      "variant must be one of: air|pro|plus when seatCount = 4": "Variant phải là air, pro hoặc plus khi số ghế = 4",
      "variant must be one of: eco|luxury when seatCount = 7": "Variant phải là eco hoặc luxury khi số ghế = 7"
    };

    // Tìm kiếm trong errorMap
    for (const [key, value] of Object.entries(errorMap)) {
      if (errorMessage.includes(key)) {
        return value;
      }
    }

    // Nếu không tìm thấy, trả về message gốc
    return errorMessage;
  };

  // Hàm dịch trạng thái đơn hàng sang tiếng Việt
  const translateOrderStatus = (status) => {
    const statusMap = {
      "Pending": "Đang chờ",
      "PENDING": "Đang chờ",
      "Confirmed": "Đã xác nhận",
      "CONFIRMED": "Đã xác nhận",
      "Completed": "Hoàn thành",
      "COMPLETED": "Hoàn thành",
      "Cancelled": "Đã hủy",
      "CANCELLED": "Đã hủy",
      "InProgress": "Đang xử lý",
      "IN_PROGRESS": "Đang xử lý",
      "Active": "Đang hoạt động",
      "ACTIVE": "Đang hoạt động"
    };
    return statusMap[status] || status;
  };

  // Hàm lấy class cho trạng thái đơn hàng
  const getOrderStatusClass = (status) => {
    const statusUpper = (status || "").toUpperCase();
    if (statusUpper.includes("PENDING")) return "RESERVED";
    if (statusUpper.includes("COMPLETED")) return "AVAILABLE";
    if (statusUpper.includes("CANCELLED")) return "MAINTENANCE";
    if (statusUpper.includes("CONFIRMED") || statusUpper.includes("ACTIVE") || statusUpper.includes("IN_PROGRESS")) return "IN_USE";
    return "AVAILABLE";
  };

  // Search and Filter helper functions (from CarRent)
  // Dropdown ngoài click tự đóng
  const menuRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        // Only handle if not related to existing menu logic
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Các bộ lọc duy nhất
  const getUniqueColors = () => [...new Set(vehicles.map((v) => v.color).filter(Boolean))];
  const getUniqueSeatCounts = () =>
    [...new Set(vehicles.map((v) => v.seatCount || v.seat_count).filter(Boolean))].sort(
      (a, b) => a - b
    );
  const getAllStatuses = () => ["Available", "Rented", "Maintenance"];

  // Toggle filter
  const toggleFilter = (type, value) => {
    setFilters((prev) => {
      const updated = prev[type].includes(value)
        ? prev[type].filter((x) => x !== value)
        : [...prev[type], value];
      return { ...prev, [type]: updated };
    });
  };

  const clearFilters = () =>
    setFilters({ colors: [], seatCounts: [], statuses: [] });

  // Lọc xe theo search + filter
  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      !searchTerm ||
      v.vehicleName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.plateNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.color?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesColor =
      filters.colors.length === 0 || filters.colors.includes(v.color);
    const matchesSeat =
      filters.seatCounts.length === 0 ||
      filters.seatCounts.includes(v.seatCount || v.seat_count);
    const matchesStatus =
      filters.statuses.length === 0 || filters.statuses.includes(v.status);

    return matchesSearch && matchesColor && matchesSeat && matchesStatus;
  });

  // Hàm fetch lại danh sách xe
  const fetchVehicles = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.get("http://localhost:8080/api/vehicles/get", {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = Array.isArray(res.data) ? res.data : [];
      const filtered = data.filter((v) => {
        const vStation = Number(v.stationId || v.station_id);
        return vStation === Number(station);
      });
      setVehicles(filtered);
      if (filtered.length > 0 && filtered[0].stationName) {
        setStationName(filtered[0].stationName);
      }
    } catch (err) {
      console.error("Lỗi tải xe:", err);
    }
  };

  // Hàm lấy danh sách tất cả trạm
  const fetchAllStations = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.get("http://localhost:8080/api/rentalstation/getAll", {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = Array.isArray(res.data) ? res.data : [];
      setAllStations(data);
    } catch (err) {
      console.error("Lỗi tải danh sách trạm:", err);
    }
  };

  // Hàm lấy danh sách xe theo trạm
  const fetchVehiclesByStation = async (stationId) => {
    if (!stationId) {
      setVehiclesByStation([]);
      return;
    }
    
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.get("http://localhost:8080/api/vehicles/get", {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = Array.isArray(res.data) ? res.data : [];
      
      console.log("🔍 Tìm xe cho trạm:", stationId);
      console.log("📋 Tất cả xe:", data.length);
      console.log("📋 Sample xe:", data.slice(0, 3).map(v => ({
        id: v.vehicleId || v.id,
        stationId: v.stationId,
        station_id: v.station_id,
        name: v.vehicleName || v.vehicle_name
      })));
      
      const filtered = data.filter((v) => {
        // Thử nhiều cách lấy stationId từ xe
        const vStation = Number(v.stationId || v.station_id || v.station || 0);
        const searchStation = Number(stationId);
        
        // Log để debug
        if (vStation === searchStation) {
          console.log("✅ Tìm thấy xe:", {
            id: v.vehicleId || v.id,
            name: v.vehicleName || v.vehicle_name,
            stationId: vStation,
            searchStation: searchStation,
            match: true
          });
        }
        
        // So sánh cả số và chuỗi để đảm bảo
        return vStation === searchStation || 
               String(vStation) === String(searchStation) ||
               Number(vStation) === Number(searchStation);
      });
      
      console.log("✅ Tổng số xe tìm thấy:", filtered.length);
      setVehiclesByStation(filtered);
      
      if (filtered.length === 0) {
        console.warn("⚠️ Không tìm thấy xe nào cho trạm:", stationId);
      }
    } catch (err) {
      console.error("Lỗi tải xe theo trạm:", err);
      setVehiclesByStation([]);
    }
  };

  // Mở modal thêm xe
  const handleOpenAddModal = () => {
    setFormData({
      plateNumber: "",
      status: "Available",
      vehicleName: "",
      brand: "VinFast",
      color: "White",
      variant: "air",
      seatCount: 4
    });
    setShowAddModal(true);
  };

  // Đóng modal
  const handleCloseModal = () => {
    setShowAddModal(false);
  };

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "seatCount" ? Number(value) : value
    }));
  };

  // Hàm thêm xe
  const handleSubmitAddVehicle = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const newVehicle = {
        plateNumber: formData.plateNumber,
        status: formData.status,
        stationId: Number(station),
        vehicleName: formData.vehicleName,
        description: "",
        brand: formData.brand,
        color: formData.color,
        transmission: "Auto",
        seatCount: formData.seatCount,
        year: new Date().getFullYear(),
        variant: formData.variant,
        batteryStatus: "100",
        batteryCapacity: "100",
        rangeKm: 350
      };

      await axios.post("http://localhost:8080/api/vehicles/create", newVehicle, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      showNotification("Thêm xe thành công!", "success");
      setShowAddModal(false);
      fetchVehicles(); // Refresh danh sách
    } catch (err) {
      console.error("Lỗi thêm xe:", err);
      const errorMsg = err.response?.data?.message || err.message || "Có lỗi xảy ra";
      showNotification("Lỗi thêm xe: " + translateError(errorMsg), "error");
    }
  };

  // Mở modal sửa xe
  const handleOpenEditModal = (vehicleId) => {
    const vehicle = vehicles.find(v => (v.vehicleId || v.id) === vehicleId);
    
    if (!vehicle) {
      showNotification("Không tìm thấy xe!", "error");
      return;
    }

    const seatCount = Number(vehicle.seatCount || vehicle.seat_count || 4);
    let variant = vehicle.variant || "air";
    if (seatCount === 4 && !["air", "pro", "plus"].includes(variant)) {
      variant = "air";
    }

    setEditFormData({
      status: vehicle.status || "Available",
      brand: vehicle.brand || "VinFast",
      color: vehicle.color || "White",
      variant: variant,
      seatCount: seatCount
    });
    setEditingVehicleId(vehicleId);
    setShowEditModal(true);
  };

  // Xử lý thay đổi input trong form sửa
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: name === "seatCount" ? Number(value) : value
    }));
  };

  // Hàm sửa xe
  const handleSubmitEditVehicle = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const vehicle = vehicles.find(v => (v.vehicleId || v.id) === editingVehicleId);
      
      if (!vehicle) {
        showNotification("Không tìm thấy xe!", "error");
        return;
      }

      const updateData = {
        status: editFormData.status,
        stationId: Number(vehicle.stationId || vehicle.station_id),
        brand: editFormData.brand,
        color: editFormData.color,
        seatCount: editFormData.seatCount,
        variant: editFormData.variant,
        batteryStatus: String(vehicle.batteryStatus || vehicle.battery_status || 100),
        batteryCapacity: String(vehicle.batteryCapacity || vehicle.battery_capacity || "100"),
        rangeKm: Number(vehicle.rangeKm || vehicle.range_km || 350)
      };

      await axios.put(`http://localhost:8080/api/vehicles/update/${editingVehicleId}`, updateData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      showNotification("Sửa xe thành công!", "success");
      setShowEditModal(false);
      fetchVehicles(); // Refresh danh sách
    } catch (err) {
      console.error("Lỗi sửa xe:", err);
      const errorMsg = err.response?.data?.message || err.message || "Có lỗi xảy ra";
      showNotification("Lỗi sửa xe: " + translateError(errorMsg), "error");
    }
  };

  // Hàm xóa xe
  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa xe này?")) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`http://localhost:8080/api/vehicles/deleted/${vehicleId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      showNotification("Xóa xe thành công!", "success");
      fetchVehicles(); // Refresh danh sách
    } catch (err) {
      console.error("Lỗi xóa xe:", err);
      const errorMsg = err.response?.data?.message || err.message || "Có lỗi xảy ra";
      showNotification("Lỗi xóa xe: " + translateError(errorMsg), "error");
    }
  };

  // Hàm xem lịch sử thuê
  const handleViewRentalHistory = async (vehicleId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.get(`http://localhost:8080/api/order/vehicle/${vehicleId}/compact`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      console.log("Lịch sử thuê (raw):", res.data);
      if (res.data && Array.isArray(res.data)) {
        // Log từng item để debug
        res.data.forEach((item, idx) => {
          console.log(`Order ${idx + 1}:`, {
            orderId: item.orderId,
            customerName: item.customerName,
            customerPhone: item.customerPhone,
            stationName: item.stationName,
            createdAt: item.createdAt,
            price: item.price,
            status: item.status
          });
        });
        setRentalHistory(res.data);
        setCurrentHistoryVehicleId(vehicleId);
        setShowHistoryModal(true);
      } else {
        setRentalHistory([]);
        setCurrentHistoryVehicleId(vehicleId);
        setShowHistoryModal(true);
      }
    } catch (err) {
      console.error("Lỗi tải lịch sử thuê:", err);
      const errorMsg = err.response?.data?.message || err.message || "Có lỗi xảy ra";
      showNotification("Lỗi tải lịch sử thuê: " + translateError(errorMsg), "error");
    }
  };

  // Hàm xem chi tiết đơn hàng
  const handleViewOrderDetail = async (orderId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.get(`http://localhost:8080/api/order-details/order/${orderId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      console.log("Chi tiết đơn hàng:", res.data);
      if (res.data && Array.isArray(res.data)) {
        setOrderDetails(res.data);
        setShowOrderDetailModal(true);
      } else {
        setOrderDetails([]);
        setShowOrderDetailModal(true);
      }
    } catch (err) {
      console.error("Lỗi tải chi tiết đơn hàng:", err);
      const errorMsg = err.response?.data?.message || err.message || "Có lỗi xảy ra";
      showNotification("Lỗi tải chi tiết đơn hàng: " + translateError(errorMsg), "error");
    }
  };

  // Hàm dịch phương thức thanh toán
  const translatePaymentMethod = (method) => {
    const methodMap = {
      "captureWallet": "Ví điện tử",
      "bankTransfer": "Chuyển khoản",
      "cash": "Tiền mặt",
      "creditCard": "Thẻ tín dụng"
    };
    return methodMap[method] || method;
  };

  // Mở modal sửa đơn hàng
  const handleOpenEditOrderModal = (order) => {
    setEditingOrder(order);
    setEditOrderFormData({
      status: order.status || "PENDING",
      price: order.price || order.totalPrice || 0,
      stationName: order.stationName || ""
    });
    setShowEditOrderModal(true);
  };

  // Xử lý thay đổi input trong form sửa đơn hàng
  const handleEditOrderInputChange = (e) => {
    const { name, value } = e.target;
    setEditOrderFormData(prev => ({
      ...prev,
      [name]: name === "price" ? Number(value) : value
    }));
  };

  // Hàm sửa đơn hàng - hiển thị xác nhận trước
  const handleSubmitEditOrder = async (e) => {
    e.preventDefault();
    if (!editingOrder || !currentHistoryVehicleId) {
      showNotification("Không tìm thấy thông tin đơn hàng!", "error");
      return;
    }

    // Hiển thị xác nhận trước khi gọi API
    const confirmMessage = `Bạn có chắc chắn muốn lưu các thay đổi?\n\nTrạng thái: ${translateOrderStatus(editOrderFormData.status)}\nGiá: ${new Intl.NumberFormat('vi-VN').format(editOrderFormData.price)} đ\nTên trạm: ${editOrderFormData.stationName}`;
    
    if (!window.confirm(confirmMessage)) {
      return; // Người dùng hủy, không làm gì
    }

    // Sau khi xác nhận, mới gọi API
    try {
      const token = localStorage.getItem('accessToken');
      const updateData = {
        status: editOrderFormData.status,
        price: editOrderFormData.price,
        stationName: editOrderFormData.stationName
      };

      await axios.put(`http://localhost:8080/api/order/vehicle/${currentHistoryVehicleId}/${editingOrder.orderId}/compact`, updateData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      showNotification("Sửa đơn hàng thành công!", "success");
      setShowEditOrderModal(false);
      // Refresh lại danh sách lịch sử thuê
      if (currentHistoryVehicleId) {
        handleViewRentalHistory(currentHistoryVehicleId);
      }
    } catch (err) {
      console.error("Lỗi sửa đơn hàng:", err);
      const errorMsg = err.response?.data?.message || err.message || "Có lỗi xảy ra";
      showNotification("Lỗi sửa đơn hàng: " + translateError(errorMsg), "error");
    }
  };

  // Xử lý thay đổi input trong form thêm đơn hàng
  const handleAddOrderInputChange = (e) => {
    const { name, value } = e.target;
    setAddOrderFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Khi chọn trạm, tự động load danh sách xe của trạm đó
    if (name === "stationId") {
      console.log("🎯 Chọn trạm:", {
        value: value,
        type: typeof value,
        stationName: allStations.find(s => (s.stationId || s.id || s.stationid) == value)?.name
      });
      fetchVehiclesByStation(value);
      // Reset vehicleId khi đổi trạm
      setAddOrderFormData(prev => ({
        ...prev,
        stationId: value,
        vehicleId: ""
      }));
    }
  };


  // Hàm thêm đơn hàng
  const handleSubmitAddOrder = async (e) => {
    e.preventDefault();
    
    // Validation: Kiểm tra đã chọn trạm và xe
    if (!addOrderFormData.stationId) {
      showNotification("Vui lòng chọn trạm!", "error");
      return;
    }
    
    if (!addOrderFormData.vehicleId) {
      showNotification("Vui lòng chọn xe!", "error");
      return;
    }
    
    // Validation: Kiểm tra thời gian
    if (addOrderFormData.startTime && addOrderFormData.endTime) {
      const startDate = new Date(addOrderFormData.startTime);
      const endDate = new Date(addOrderFormData.endTime);
      
      if (endDate <= startDate) {
        showNotification("Thời gian kết thúc phải sau thời gian bắt đầu!", "error");
        return;
      }
    }

    // Lấy thông tin xe đã chọn để hiển thị trong xác nhận
    const selectedVehicle = vehiclesByStation.find(v => 
      (v.vehicleId || v.id) === Number(addOrderFormData.vehicleId)
    );
    
    const vehicleInfo = selectedVehicle 
      ? `${selectedVehicle.vehicleName || selectedVehicle.vehicle_name} - ${selectedVehicle.brand} - ${selectedVehicle.color} - ${selectedVehicle.seatCount || selectedVehicle.seat_count} chỗ`
      : "Xe đã chọn";

    // Hiển thị xác nhận
    const confirmMessage = `Bạn có chắc chắn muốn tạo đơn hàng?\n\nXe: ${vehicleInfo}\nThời gian: ${addOrderFormData.startTime} đến ${addOrderFormData.endTime}`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      
      // Format datetime cho API (LocalDateTime format, không có .000Z)
      const formatDateTime = (dateTimeLocal) => {
        if (!dateTimeLocal) return "";
        // datetime-local trả về format: "YYYY-MM-DDTHH:mm"
        // API cần format: "YYYY-MM-DDTHH:mm:ss" (không có .000Z)
        const date = new Date(dateTimeLocal);
        if (isNaN(date.getTime())) {
          console.error("❌ Invalid date:", dateTimeLocal);
          return "";
        }
        // Format: YYYY-MM-DDTHH:mm:ss (bỏ .000Z)
        return date.toISOString().slice(0, 19);
      };
      
      // Tính plannedHours từ startTime và endTime
      const calculatePlannedHours = (start, end) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffMs = endDate - startDate;
        const diffHours = Math.ceil(diffMs / (1000 * 60 * 60)); // Làm tròn lên
        return diffHours > 0 ? diffHours : 1; // Tối thiểu 1 giờ
      };

      const vehicleId = Number(addOrderFormData.vehicleId);
      const startTime = formatDateTime(addOrderFormData.startTime);
      const endTime = formatDateTime(addOrderFormData.endTime);
      const plannedHours = calculatePlannedHours(addOrderFormData.startTime, addOrderFormData.endTime);

      // Validate dữ liệu trước khi gửi
      if (!vehicleId || isNaN(vehicleId)) {
        showNotification("Lỗi: Mã xe không hợp lệ!", "error");
        return;
      }

      if (!startTime || !endTime) {
        showNotification("Lỗi: Thời gian không hợp lệ!", "error");
        return;
      }

      // Payload theo format API yêu cầu
      // Backend sẽ lấy customerId từ JWT token
      const orderData = {
        vehicleId: vehicleId,
        startTime: startTime,
        endTime: endTime,
        plannedHours: plannedHours,
        couponCode: addOrderFormData.couponCode || null, // Để null thay vì empty string
        holiday: false
      };
      
      // Nếu API yêu cầu customerId, có thể cần thêm vào đây
      // orderData.customerId = user?.userId || null;

      console.log("📤 Gửi dữ liệu tạo đơn hàng:", orderData);

      const response = await axios.post(`http://localhost:8080/api/order/create`, orderData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      console.log("✅ Phản hồi từ API:", response.data);
      
      showNotification("Tạo đơn hàng thành công!", "success");
      setShowAddOrderModal(false);
      // Reset form
      setAddOrderFormData({
        stationId: "",
        vehicleId: "",
        startTime: "",
        endTime: "",
        couponCode: ""
      });
      setVehiclesByStation([]);
      // Refresh lại danh sách lịch sử thuê nếu đang mở
      if (currentHistoryVehicleId) {
        handleViewRentalHistory(currentHistoryVehicleId);
      }
    } catch (err) {
      console.error("❌ Lỗi tạo đơn hàng:", err);
      console.error("❌ Error response:", err.response?.data);
      console.error("❌ Error status:", err.response?.status);
      
      let errorMsg = "Có lỗi xảy ra";
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      showNotification("Lỗi tạo đơn hàng: " + translateError(errorMsg), "error");
    }
  };

  // Hàm xóa đơn hàng
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đơn hàng này?")) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`http://localhost:8080/api/order/delete/${orderId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      showNotification("Xóa đơn hàng thành công!", "success");
      // Refresh lại danh sách lịch sử thuê
      if (currentHistoryVehicleId) {
        handleViewRentalHistory(currentHistoryVehicleId);
      }
    } catch (err) {
      console.error("Lỗi xóa đơn hàng:", err);
      const errorMsg = err.response?.data?.message || err.message || "Có lỗi xảy ra";
      showNotification("Lỗi xóa đơn hàng: " + translateError(errorMsg), "error");
    }
  };

  // Map ảnh xe theo brand, seatCount, và color
  const getVehicleImage = (brand, seatCount, color) => {
    console.log(`🚗 Vehicle: Brand="${brand}", Color="${color}", Seats="${seatCount}"`);

    const colorMap = {
      "Red": "red",
      "White": "white",
      "Blue": "blue",
      "Black": "black",
      "Silver": "silver",
      "Đỏ": "red",
      "Trắng": "white",
      "Xanh": "blue",
      "Đen": "black",
      "Bạc": "silver"
    };

    const normalizedColor = colorMap[color] || "white";
    const brandUpper = (brand || "").toUpperCase().trim();
    const seats = parseInt(seatCount) || 4;

    console.log(`✅ Normalized: Brand="${brandUpper}", Color="${normalizedColor}", Seats=${seats}`);

    let selectedImages = {};

    if (station === "2") {
      // TRẠM 2: Tráo ảnh
      // BMW -> Tesla, Tesla -> VinFast, VinFast -> BMW
      if (brandUpper.includes("BMW")) {
        selectedImages = seats === 7 ? {
          red: Tesla7_Red, white: Tesla7_White, blue: Tesla7_Blue, black: Tesla7_Black, silver: Tesla7_Silver
        } : {
          red: Tesla4_Red, white: Tesla4_White, blue: Tesla4_Blue, black: Tesla4_Black, silver: Tesla4_Silver
        };
      } else if (brandUpper.includes("TESLA") || brandUpper.includes("TES")) {
        selectedImages = seats === 7 ? {
          red: VinFast7_Red, white: VinFast7_White, blue: VinFast7_Blue, black: VinFast7_Black, silver: VinFast7_Silver
        } : {
          red: VinFast4_Red, white: VinFast4_White, blue: VinFast4_Blue, black: VinFast4_Black, silver: VinFast4_Silver
        };
      } else if (brandUpper.includes("VINFAST") || brandUpper.includes("VIN")) {
        selectedImages = seats === 7 ? {
          red: BMW7_Red, white: BMW7_White, blue: BMW7_Blue, black: BMW7_Black, silver: BMW7_Silver
        } : {
          red: BMW4_Red, white: BMW4_White, blue: BMW4_Blue, black: BMW4_Black, silver: BMW4_Silver
        };
      }
    } else if (station === "3") {
      // TRẠM 3: Tráo ảnh (lần 2)
      // BMW -> VinFast, Tesla -> BMW, VinFast -> Tesla
      if (brandUpper.includes("BMW")) {
        selectedImages = seats === 7 ? {
          red: VinFast7_Red, white: VinFast7_White, blue: VinFast7_Blue, black: VinFast7_Black, silver: VinFast7_Silver
        } : {
          red: VinFast4_Red, white: VinFast4_White, blue: VinFast4_Blue, black: VinFast4_Black, silver: VinFast4_Silver
        };
      } else if (brandUpper.includes("TESLA") || brandUpper.includes("TES")) {
        selectedImages = seats === 7 ? {
          red: BMW7_Red, white: BMW7_White, blue: BMW7_Blue, black: BMW7_Black, silver: BMW7_Silver
        } : {
          red: BMW4_Red, white: BMW4_White, blue: BMW4_Blue, black: BMW4_Black, silver: BMW4_Silver
        };
      } else if (brandUpper.includes("VINFAST") || brandUpper.includes("VIN")) {
        selectedImages = seats === 7 ? {
          red: Tesla7_Red, white: Tesla7_White, blue: Tesla7_Blue, black: Tesla7_Black, silver: Tesla7_Silver
        } : {
          red: Tesla4_Red, white: Tesla4_White, blue: Tesla4_Blue, black: Tesla4_Black, silver: Tesla4_Silver
        };
      }
    } else {
      // TRẠM 1: Hiển thị đúng
      if (brandUpper.includes("BMW")) {
        selectedImages = seats === 7 ? {
          red: BMW7_Red, white: BMW7_White, blue: BMW7_Blue, black: BMW7_Black, silver: BMW7_Silver
        } : {
          red: BMW4_Red, white: BMW4_White, blue: BMW4_Blue, black: BMW4_Black, silver: BMW4_Silver
        };
      } else if (brandUpper.includes("TESLA") || brandUpper.includes("TES")) {
        selectedImages = seats === 7 ? {
          red: Tesla7_Red, white: Tesla7_White, blue: Tesla7_Blue, black: Tesla7_Black, silver: Tesla7_Silver
        } : {
          red: Tesla4_Red, white: Tesla4_White, blue: Tesla4_Blue, black: Tesla4_Black, silver: Tesla4_Silver
        };
      } else if (brandUpper.includes("VINFAST") || brandUpper.includes("VIN")) {
        selectedImages = seats === 7 ? {
          red: VinFast7_Red, white: VinFast7_White, blue: VinFast7_Blue, black: VinFast7_Black, silver: VinFast7_Silver
        } : {
          red: VinFast4_Red, white: VinFast4_White, blue: VinFast4_Blue, black: VinFast4_Black, silver: VinFast4_Silver
        };
      }
    }

    const img = selectedImages[normalizedColor] || DefaultCar;
    console.log(`📸 Station=${station}, Brand=${brandUpper}, Seats=${seats}, Color=${normalizedColor}`);
    return img;
  };

  // Map màu tên sang hex color
  const getColorHex = (colorName) => {
    const colorHexMap = {
      "Red": "#DC143C",
      "White": "#FFFFFF",
      "Blue": "#1E90FF",
      "Black": "#1a1a1a",
      "Silver": "#C0C0C0",
      "Đỏ": "#DC143C",
      "Trắng": "#FFFFFF",
      "Xanh": "#1E90FF",
      "Đen": "#1a1a1a",
      "Bạc": "#C0C0C0"
    };
    return colorHexMap[colorName] || "#CCCCCC";
  };

  const getStatusInfo = (status) => {
    const map = {
      Available: { text: "AVAILABLE", class: "AVAILABLE", display: "Sẵn sàng" },
      Rented: { text: "IN_USE", class: "IN_USE", display: "Đang thuê" },
      Reserved: { text: "RESERVED", class: "RESERVED", display: "Đã đặt" },
      Maintenance: { text: "MAINTENANCE", class: "MAINTENANCE", display: "Bảo trì" }
    };
    return map[status] || { text: status, class: "AVAILABLE", display: status };
  };

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.menu-wrapper')) {
        setOpenMenuId(null);
        setOpenOrderMenuId(null);
      }
    };
    if (openMenuId || openOrderMenuId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openMenuId, openOrderMenuId]);

  useEffect(() => {
    fetchAllStations();
  }, []);

  useEffect(() => {
    const loadVehicles = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const res = await axios.get("http://localhost:8080/api/vehicles/get", {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const data = Array.isArray(res.data) ? res.data : [];
        const filtered = data.filter((v) => {
          const vStation = Number(v.stationId || v.station_id);
          return vStation === Number(station);
        });
        setVehicles(filtered);
        if (filtered.length > 0 && filtered[0].stationName) {
          setStationName(filtered[0].stationName);
        }
        setError(null);
      } catch (err) {
        console.error("Lỗi tải xe:", err);
        setError("Không thể tải danh sách xe. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };
    loadVehicles();
  }, [station]);

  if (loading) {
    return (
      <div className="station-vehicle-page">
        <div style={{ padding: "40px", textAlign: "center", fontSize: "18px", color: "#666" }}>
          ⏳ Đang tải danh sách xe...
        </div>
      </div>
    );
  }

  // Render
  return (
    <div className="station-vehicle-page">
      {/* Header */}
      <div className="page-header-section">
        <h1 className="page-title">DANH SÁCH XE TẠI TRẠM #{station}</h1>
        {stationName && <p className="station-name-large">{stationName}</p>}
      </div>

      {/* Search Bar (from CarRent) */}
      <div className="search-bar" style={{ marginBottom: "20px", padding: "0 20px" }}>
        <input
          type="text"
          placeholder="🔍 Tìm theo tên, biển số, màu..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            fontSize: "16px",
            border: "1px solid #ddd",
            borderRadius: "4px"
          }}
        />
      </div>

      {/* Filter Section (from CarRent) */}
      <div className="filters-section" style={{ marginBottom: "20px", padding: "0 20px" }}>
        <div className="filter-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
          <h3 style={{ margin: 0 }}>🔍 Bộ lọc</h3>
          {(filters.colors.length > 0 ||
            filters.seatCounts.length > 0 ||
            filters.statuses.length > 0) && (
            <button className="btn-clear-filters" onClick={clearFilters} style={{
              padding: "5px 15px",
              backgroundColor: "#f0f0f0",
              border: "1px solid #ddd",
              borderRadius: "4px",
              cursor: "pointer"
            }}>
              Xóa bộ lọc
            </button>
          )}
        </div>

        <div className="filters-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
          {/* Màu sắc */}
          <div className="filter-group">
            <h4 style={{ marginBottom: "10px" }}>🎨 Màu sắc</h4>
            <div className="filter-options" style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              {getUniqueColors().map((color) => (
                <label key={color} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={filters.colors.includes(color)}
                    onChange={() => toggleFilter("colors", color)}
                  />
                  <span>{color}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Số ghế */}
          <div className="filter-group">
            <h4 style={{ marginBottom: "10px" }}>💺 Số ghế</h4>
            <div className="filter-options" style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              {getUniqueSeatCounts().map((seat) => (
                <label key={seat} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={filters.seatCounts.includes(seat)}
                    onChange={() => toggleFilter("seatCounts", seat)}
                  />
                  <span>{seat} chỗ</span>
                </label>
              ))}
            </div>
          </div>

          {/* Trạng thái */}
          <div className="filter-group">
            <h4 style={{ marginBottom: "10px" }}>📊 Trạng thái</h4>
            <div className="filter-options" style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              {getAllStatuses().map((st) => {
                const info = getStatusInfo(st);
                return (
                  <label key={st} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={filters.statuses.includes(st)}
                      onChange={() => toggleFilter("statuses", st)}
                    />
                    <span>{info.display || info.text}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="table-header-actions" style={{ padding: "0 20px", marginBottom: "20px" }}>
        <button 
          className="btn-add-vehicle"
          onClick={handleOpenAddModal}
        >
          + Thêm xe
        </button>
      </div>

      {error && (
        <div style={{ padding: "20px", textAlign: "center", color: "#d32f2f", backgroundColor: "#ffebee", margin: "0 20px 20px", borderRadius: "4px" }}>
          {error}
        </div>
      )}

      {filteredVehicles.length === 0 && vehicles.length > 0 ? (
        <div className="empty-state" style={{ padding: "40px", textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
          <p>Không có xe nào phù hợp với bộ lọc</p>
          <button onClick={clearFilters} style={{
            marginTop: "10px",
            padding: "8px 16px",
            backgroundColor: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}>
            Xóa bộ lọc
          </button>
        </div>
      ) : filteredVehicles.length === 0 && vehicles.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
          <p>Không có xe nào tại trạm này</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="vehicle-table">
            <thead>
              <tr className="header-row">
                <th className="col-index">STT</th>
                <th className="col-image">ẢNH</th>
                <th className="col-name">TÊN XE</th>
                <th className="col-plate">BIỂN SỐ</th>
                <th className="col-brand">HÃNG</th>
                <th className="col-color">MÀU</th>
                <th className="col-seats">SỐ GHẾ</th>
                <th className="col-year">NĂM SX</th>
                <th className="col-mileage">QUÃNG ĐƯỜNG</th>
                <th className="col-battery">PIN (%)</th>
                <th className="col-status">TRẠNG THÁI</th>
                <th className="col-action">HÀNH ĐỘNG</th>
              </tr>
            </thead>

            <tbody>
              {filteredVehicles.map((v, index) => {
                const statusInfo = getStatusInfo(v.status);
                const batteryStatus = parseInt(v.batteryStatus || v.battery_status || 0);
                const batteryClass = batteryStatus >= 70 ? "high" : batteryStatus >= 40 ? "medium" : "low";

                return (
                  <tr key={v.vehicleId || v.id} className="data-row">
                    <td className="col-index">{index + 1}</td>
                    <td className="col-image">
                      <img 
                        src={getVehicleImage(v.brand, v.seatCount || v.seat_count, v.color)}
                        alt={v.vehicleName || v.vehicle_name}
                        className="vehicle-image"
                        onError={(e) => e.target.src = DefaultCar}
                      />
                    </td>
                    <td className="col-name">
                      <strong>{v.vehicleName || v.vehicle_name}</strong>
                    </td>
                    <td className="col-plate">
                      <span className="plate-number">{v.plateNumber || v.plate_number}</span>
                    </td>
                    <td className="col-brand">{v.brand || "N/A"}</td>
                    <td className="col-color">
                      <span 
                        className="color-badge"
                        style={{
                          backgroundColor: getColorHex(v.color),
                          borderColor: getColorHex(v.color)
                        }}
                        title={v.color}
                      />
                      {v.color}
                    </td>
                    <td className="col-seats">{v.seatCount || v.seat_count} chỗ</td>
                    <td className="col-year">{v.year || v.year_of_manufacture}</td>
                    <td className="col-mileage">{v.rangeKm || v.range_km} km</td>
                    <td className="col-battery">
                      <span className={`battery-badge ${batteryClass}`}>
                        {batteryStatus}%
                      </span>
                    </td>
                    <td className="col-status">
                      <span className={`status-badge ${statusInfo.class}`}>
                        {statusInfo.display}
                      </span>
                    </td>
                    <td className="col-action">
                      <div className="menu-wrapper">
                        <button
                          className="menu-btn"
                          onClick={() => setOpenMenuId(openMenuId === (v.vehicleId || v.id) ? null : (v.vehicleId || v.id))}
                        >
                          ⋮
                        </button>
                        {openMenuId === (v.vehicleId || v.id) && (
                          <div className="dropdown-menu">
                            <button
                              className="menu-item"
                              onClick={() => {
                                handleViewRentalHistory(v.vehicleId || v.id);
                                setOpenMenuId(null);
                              }}
                            >
                              Xem lịch sử thuê
                            </button>
                            <button
                              className="menu-item"
                              onClick={() => {
                                handleOpenEditModal(v.vehicleId || v.id);
                                setOpenMenuId(null);
                              }}
                            >
                              Sửa
                            </button>
                            <button
                              className="menu-item danger"
                              onClick={() => {
                                handleDeleteVehicle(v.vehicleId || v.id);
                                setOpenMenuId(null);
                              }}
                            >
                              Xóa
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Footer Stats */}
          <div className="table-footer">
            <div className="stats">
              <span className="stat-item">
                <strong>Tổng xe:</strong> {vehicles.length}
              </span>
              <span className="stat-item">
                <strong>Sẵn sàng:</strong> {vehicles.filter(v => v.status === "Available").length}
              </span>
              <span className="stat-item">
                <strong>Đang thuê:</strong> {vehicles.filter(v => v.status === "Rented").length}
              </span>
              <span className="stat-item">
                <strong>Bảo trì:</strong> {vehicles.filter(v => v.status === "Maintenance").length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Modal Thêm Xe */}
      {showAddModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Thêm Xe Mới</h2>
              <button className="modal-close-btn" onClick={handleCloseModal}>×</button>
            </div>
            <form onSubmit={handleSubmitAddVehicle} className="modal-form">
              <div className="form-group">
                <label>Biển số <span className="required">*</span></label>
                <input
                  type="text"
                  name="plateNumber"
                  value={formData.plateNumber}
                  onChange={handleInputChange}
                  required
                  placeholder="VD: EV-0001"
                />
              </div>

              <div className="form-group">
                <label>Trạng thái <span className="required">*</span></label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Available">Sẵn sàng</option>
                  <option value="Rented">Đang thuê</option>
                  <option value="Reserved">Đã đặt</option>
                  <option value="Maintenance">Bảo trì</option>
                </select>
              </div>

              <div className="form-group">
                <label>Tên xe <span className="required">*</span></label>
                <input
                  type="text"
                  name="vehicleName"
                  value={formData.vehicleName}
                  onChange={handleInputChange}
                  required
                  placeholder="VD: VinFast 4S"
                />
              </div>

              <div className="form-group">
                <label>Hãng <span className="required">*</span></label>
                <select
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  required
                >
                  <option value="VinFast">VinFast</option>
                  <option value="Tesla">Tesla</option>
                  <option value="BMW">BMW</option>
                </select>
              </div>

              <div className="form-group">
                <label>Màu <span className="required">*</span></label>
                <select
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  required
                >
                  <option value="White">Trắng</option>
                  <option value="Red">Đỏ</option>
                  <option value="Blue">Xanh</option>
                  <option value="Black">Đen</option>
                  <option value="Silver">Bạc</option>
                </select>
              </div>

              <div className="form-group">
                <label>Variant <span className="required">*</span></label>
                <select
                  name="variant"
                  value={formData.variant}
                  onChange={handleInputChange}
                  required
                >
                  <option value="air">Air</option>
                  <option value="pro">Pro</option>
                  <option value="plus">Plus</option>
                </select>
              </div>

              <div className="form-group">
                <label>Số ghế <span className="required">*</span></label>
                <select
                  name="seatCount"
                  value={formData.seatCount}
                  onChange={handleInputChange}
                  required
                >
                  <option value="4">4 chỗ</option>
                  <option value="7">7 chỗ</option>
                </select>
              </div>

              {/* Preview Ảnh Xe */}
              {formData.brand && formData.color && formData.variant && (
                <div className="form-group">
                  <label>Preview Ảnh Xe</label>
                  <div className="vehicle-preview">
                    <img
                      src={getVehicleImage(formData.brand, formData.seatCount, formData.color)}
                      alt="Preview"
                      className="preview-image"
                      onError={(e) => e.target.src = DefaultCar}
                    />
                  </div>
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Hủy
                </button>
                <button type="submit" className="btn-submit">
                  Thêm xe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Sửa Xe */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Sửa Thông Tin Xe</h2>
              <button className="modal-close-btn" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmitEditVehicle} className="modal-form">
              <div className="form-group">
                <label>Trạng thái <span className="required">*</span></label>
                <select
                  name="status"
                  value={editFormData.status}
                  onChange={handleEditInputChange}
                  required
                >
                  <option value="Available">Sẵn sàng</option>
                  <option value="Rented">Đang thuê</option>
                  <option value="Reserved">Đã đặt</option>
                  <option value="Maintenance">Bảo trì</option>
                </select>
              </div>

              <div className="form-group">
                <label>Hãng <span className="required">*</span></label>
                <select
                  name="brand"
                  value={editFormData.brand}
                  onChange={handleEditInputChange}
                  required
                >
                  <option value="VinFast">VinFast</option>
                  <option value="Tesla">Tesla</option>
                  <option value="BMW">BMW</option>
                </select>
              </div>

              <div className="form-group">
                <label>Màu <span className="required">*</span></label>
                <select
                  name="color"
                  value={editFormData.color}
                  onChange={handleEditInputChange}
                  required
                >
                  <option value="White">Trắng</option>
                  <option value="Red">Đỏ</option>
                  <option value="Blue">Xanh</option>
                  <option value="Black">Đen</option>
                  <option value="Silver">Bạc</option>
                </select>
              </div>

              <div className="form-group">
                <label>Variant <span className="required">*</span></label>
                <select
                  name="variant"
                  value={editFormData.variant}
                  onChange={handleEditInputChange}
                  required
                >
                  <option value="air">Air</option>
                  <option value="pro">Pro</option>
                  <option value="plus">Plus</option>
                </select>
              </div>

              <div className="form-group">
                <label>Số ghế <span className="required">*</span></label>
                <select
                  name="seatCount"
                  value={editFormData.seatCount}
                  onChange={handleEditInputChange}
                  required
                >
                  <option value="4">4 chỗ</option>
                  <option value="7">7 chỗ</option>
                </select>
              </div>

              {/* Preview Ảnh Xe */}
              {editFormData.brand && editFormData.color && editFormData.variant && (
                <div className="form-group">
                  <label>Preview Ảnh Xe</label>
                  <div className="vehicle-preview">
                    <img
                      src={getVehicleImage(editFormData.brand, editFormData.seatCount, editFormData.color)}
                      alt="Preview"
                      className="preview-image"
                      onError={(e) => e.target.src = DefaultCar}
                    />
                  </div>
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowEditModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn-submit">
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xem Lịch Sử Thuê */}
      {showHistoryModal && (
        <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="modal-content modal-history" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Lịch Sử Thuê Xe</h2>
              <button className="modal-close-btn" onClick={() => setShowHistoryModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {rentalHistory.length === 0 ? (
                <div className="empty-history">
                  <p>Không có lịch sử thuê cho xe này.</p>
                </div>
              ) : (
                <div className="history-table-container">
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th>Khách hàng</th>
                        <th>Số điện thoại</th>
                        <th>Trạm</th>
                        <th>Ngày tạo</th>
                        <th>Trạng thái</th>
                        <th>Tổng tiền</th>
                        <th>Xem chi tiết</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {rentalHistory.map((order, index) => {
                          const createdAt = order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : '-';
                          const statusClass = getOrderStatusClass(order.status);
                          const statusText = translateOrderStatus(order.status || '-');
                          const price = order.price || order.totalPrice || 0;
                          return (
                            <tr key={order.orderId || index}>
                              <td>{index + 1}</td>
                              <td>{order.customerName || '-'}</td>
                              <td>{order.customerPhone || '-'}</td>
                              <td>{order.stationName || '-'}</td>
                              <td>{createdAt}</td>
                              <td>
                                <span className={`status-badge ${statusClass}`}>
                                  {statusText}
                                </span>
                              </td>
                              <td>{price ? new Intl.NumberFormat('vi-VN').format(price) + ' đ' : '-'}</td>
                              <td>
                                <button
                                  className="btn-view-detail"
                                  onClick={() => handleViewOrderDetail(order.orderId)}
                                >
                                  Xem chi tiết
                                </button>
                              </td>
                              <td>
                                <div className="menu-wrapper">
                                  <button
                                    className="menu-btn"
                                    onClick={() => setOpenOrderMenuId(openOrderMenuId === order.orderId ? null : order.orderId)}
                                  >
                                    ⋮
                                  </button>
                                  {openOrderMenuId === order.orderId && (
                                    <div className="dropdown-menu">
                                        <button
                                          className="menu-item"
                                          onClick={() => {
                                            handleOpenEditOrderModal(order);
                                            setOpenOrderMenuId(null);
                                          }}
                                        >
                                          Sửa
                                        </button>
                                        <button
                                          className="menu-item danger"
                                          onClick={() => {
                                            handleDeleteOrder(order.orderId);
                                            setOpenOrderMenuId(null);
                                          }}
                                        >
                                          Xóa
                                        </button>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button 
                className="btn-action btn-add"
                onClick={() => {
                  setShowAddOrderModal(true);
                }}
              >
                + Thêm đơn hàng
              </button>
              <button type="button" className="btn-cancel" onClick={() => setShowHistoryModal(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sửa Đơn Hàng */}
      {showEditOrderModal && editingOrder && (
        <div className="modal-overlay" onClick={() => setShowEditOrderModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Sửa Đơn Hàng</h2>
              <button className="modal-close-btn" onClick={() => setShowEditOrderModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmitEditOrder} className="modal-form">
              {/* Thông tin hiển thị (không sửa được) */}
              <div className="form-group">
                <label>Mã đơn hàng</label>
                <input
                  type="text"
                  value={editingOrder.orderId || '-'}
                  disabled
                  className="disabled-input"
                />
              </div>

              <div className="form-group">
                <label>Khách hàng</label>
                <input
                  type="text"
                  value={editingOrder.customerName || '-'}
                  disabled
                  className="disabled-input"
                />
              </div>

              <div className="form-group">
                <label>Số điện thoại</label>
                <input
                  type="text"
                  value={editingOrder.customerPhone || '-'}
                  disabled
                  className="disabled-input"
                />
              </div>

              <div className="form-group">
                <label>Ngày tạo</label>
                <input
                  type="text"
                  value={editingOrder.createdAt ? new Date(editingOrder.createdAt).toLocaleString('vi-VN') : '-'}
                  disabled
                  className="disabled-input"
                />
              </div>

              {/* Các trường có thể sửa */}
              <div className="form-group">
                <label>Trạng thái <span className="required">*</span></label>
                <select
                  name="status"
                  value={editOrderFormData.status}
                  onChange={handleEditOrderInputChange}
                  required
                >
                  <option value="PENDING">Đang chờ</option>
                  <option value="CONFIRMED">Đã xác nhận</option>
                  <option value="COMPLETED">Hoàn thành</option>
                  <option value="CANCELLED">Đã hủy</option>
                  <option value="IN_PROGRESS">Đang xử lý</option>
                  <option value="ACTIVE">Đang hoạt động</option>
                </select>
              </div>

              <div className="form-group">
                <label>Giá <span className="required">*</span></label>
                <input
                  type="number"
                  name="price"
                  value={editOrderFormData.price}
                  onChange={handleEditOrderInputChange}
                  required
                  min="0"
                  step="1"
                  placeholder="Nhập giá tiền"
                />
              </div>

              <div className="form-group">
                <label>Tên trạm <span className="required">*</span></label>
                <input
                  type="text"
                  name="stationName"
                  value={editOrderFormData.stationName}
                  onChange={handleEditOrderInputChange}
                  required
                  placeholder="Nhập tên trạm"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowEditOrderModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn-submit">
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Thêm Đơn Hàng */}
      {showAddOrderModal && (
        <div className="modal-overlay" onClick={() => setShowAddOrderModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Thêm Đơn Hàng</h2>
              <button className="modal-close-btn" onClick={() => setShowAddOrderModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmitAddOrder} className="modal-form">
              {/* Chọn trạm */}
              <div className="form-group">
                <label>Trạm <span className="required">*</span></label>
                <select
                  name="stationId"
                  value={addOrderFormData.stationId}
                  onChange={handleAddOrderInputChange}
                  required
                >
                  <option value="">-- Chọn trạm --</option>
                  {allStations.map(st => {
                    const stationIdValue = st.stationId || st.id || st.stationid;
                    console.log("🏢 Trạm:", {
                      name: st.name,
                      stationId: st.stationId,
                      id: st.id,
                      stationid: st.stationid,
                      value: stationIdValue
                    });
                    return (
                      <option key={stationIdValue} value={stationIdValue}>
                        {st.name || `Trạm ${stationIdValue}`}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Chọn xe */}
              <div className="form-group">
                <label>Xe <span className="required">*</span></label>
                <select
                  name="vehicleId"
                  value={addOrderFormData.vehicleId}
                  onChange={handleAddOrderInputChange}
                  required
                  disabled={!addOrderFormData.stationId || vehiclesByStation.length === 0}
                >
                  <option value="">
                    {!addOrderFormData.stationId 
                      ? "-- Vui lòng chọn trạm trước --"
                      : vehiclesByStation.length === 0
                      ? "-- Không có xe trong trạm này --"
                      : "-- Chọn xe --"}
                  </option>
                  {vehiclesByStation.map(v => (
                    <option key={v.vehicleId || v.id} value={v.vehicleId || v.id}>
                      {v.vehicleName || v.vehicle_name} - {v.brand} - {v.color} - {v.plateNumber || v.plate_number} ({v.seatCount || v.seat_count} chỗ)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Thời gian bắt đầu <span className="required">*</span></label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={addOrderFormData.startTime}
                  onChange={handleAddOrderInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Thời gian kết thúc <span className="required">*</span></label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={addOrderFormData.endTime}
                  onChange={handleAddOrderInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Mã giảm giá</label>
                <input
                  type="text"
                  name="couponCode"
                  value={addOrderFormData.couponCode}
                  onChange={handleAddOrderInputChange}
                  placeholder="Nhập mã giảm giá (tùy chọn)"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowAddOrderModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn-submit">
                  Tạo đơn hàng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Chi Tiết Đơn Hàng */}
      {showOrderDetailModal && (
        <div className="modal-overlay" onClick={() => setShowOrderDetailModal(false)}>
          <div className="modal-content modal-order-detail" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi Tiết Đơn Hàng</h2>
              <button className="modal-close-btn" onClick={() => setShowOrderDetailModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {orderDetails.length === 0 ? (
                <div className="empty-history">
                  <p>Không có chi tiết đơn hàng.</p>
                </div>
              ) : (
                <div className="order-detail-container">
                  {orderDetails.map((detail, index) => {
                    const startTime = detail.startTime ? new Date(detail.startTime).toLocaleString('vi-VN') : '-';
                    const endTime = detail.endTime ? new Date(detail.endTime).toLocaleString('vi-VN') : '-';
                    const statusClass = getOrderStatusClass(detail.status);
                    const statusText = translateOrderStatus(detail.status || '-');
                    const typeText = detail.type === 'RENTAL' ? 'Thuê xe' : detail.type === 'DEPOSIT' ? 'Đặt cọc' : detail.type;
                    return (
                      <div key={detail.detailId || index} className="order-detail-item">
                        <div className="detail-header">
                          <h3>Chi tiết #{index + 1}</h3>
                          <span className={`type-badge ${detail.type === 'RENTAL' ? 'rental' : 'deposit'}`}>
                            {typeText}
                          </span>
                        </div>
                        <div className="detail-content">
                          <div className="detail-row">
                            <span className="detail-label">Mã chi tiết:</span>
                            <span className="detail-value">{detail.detailId || '-'}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Mã đơn hàng:</span>
                            <span className="detail-value">{detail.orderId || '-'}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Mã xe:</span>
                            <span className="detail-value">{detail.vehicleId || '-'}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Thời gian bắt đầu:</span>
                            <span className="detail-value">{startTime}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Thời gian kết thúc:</span>
                            <span className="detail-value">{endTime}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Giá:</span>
                            <span className="detail-value price">{detail.price ? new Intl.NumberFormat('vi-VN').format(detail.price) + ' đ' : '-'}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Mô tả:</span>
                            <span className="detail-value">{detail.description || '-'}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Trạng thái:</span>
                            <span className={`status-badge ${statusClass}`}>
                              {statusText}
                            </span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Phương thức thanh toán:</span>
                            <span className="detail-value">{translatePaymentMethod(detail.methodPayment) || '-'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={() => setShowOrderDetailModal(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification.show && (
        <div className={`notification-toast ${notification.type}`}>
          <div className="notification-content">
            <span className="notification-icon">
              {notification.type === "success" ? "✓" : notification.type === "error" ? "✕" : "ℹ"}
            </span>
            <span className="notification-message">{notification.message}</span>
            <button 
              className="notification-close"
              onClick={() => setNotification({ show: false, message: "", type: "success" })}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrangHienThiXeTheoTram;
