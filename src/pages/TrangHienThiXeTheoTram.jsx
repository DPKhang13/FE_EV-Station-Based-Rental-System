// pages/TrangHienThiXeTheoTram.jsx
import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./TrangHienThiXeTheoTram.css";
import { AuthContext } from "../context/AuthContext";

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
  const navigate = useNavigate();
  const { user, loading: authLoading } = useContext(AuthContext);
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
  const [vehiclesByStation, setVehiclesByStation] = useState([]);

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

  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success"
  });

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    colors: [],
    seatCounts: [],
    statuses: []
  });

  // Toast
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" });
    }, 3000);
  };

  // Dịch lỗi API
  const translateError = (errorMessage) => {
    const errorMap = {
      "plateNumber already exists": "Biển số xe đã tồn tại",
      "plateNumber must not be blank": "Biển số xe không được để trống",
      "vehicleName must not be blank": "Tên xe không được để trống",
      "variant must be one of: air|pro|plus when seatCount = 4":
        "Variant phải là air, pro hoặc plus khi số ghế = 4",
      "variant must be one of: eco|luxury when seatCount = 7":
        "Variant phải là eco hoặc luxury khi số ghế = 7"
    };

    for (const [key, value] of Object.entries(errorMap)) {
      if (errorMessage.includes(key)) return value;
    }
    return errorMessage;
  };

  // Dịch trạng thái order
  const translateOrderStatus = (status) => {
    const map = {
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
    return map[status] || status;
  };

  // Class trạng thái order
  const getOrderStatusClass = (status) => {
    const s = (status || "").toUpperCase();
    if (s.includes("PENDING")) return "RESERVED";
    if (s.includes("COMPLETED")) return "AVAILABLE";
    if (s.includes("CANCELLED")) return "MAINTENANCE";
    if (s.includes("CONFIRMED") || s.includes("ACTIVE") || s.includes("IN_PROGRESS"))
      return "IN_USE";
    return "AVAILABLE";
  };

  // API mới — lấy xe theo trạm
  const fetchVehicles = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(
        `http://localhost:8080/api/vehicles/station/${station}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      const data = Array.isArray(res.data) ? res.data : [];
      setVehicles(data);

      if (data.length > 0 && data[0].stationName) {
        setStationName(data[0].stationName);
      }
    } catch (err) {
      console.error("Lỗi tải xe:", err);
    }
  };
  // API lấy tất cả trạm
  const fetchAllStations = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(
        "http://localhost:8080/api/rentalstation/getAll",
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      const data = Array.isArray(res.data) ? res.data : [];
      setAllStations(data);
    } catch (err) {
      console.error("Lỗi tải danh sách trạm:", err);
    }
  };

  // Lấy xe theo ID trạm khi thêm order
  const fetchVehiclesByStation = async (stationId) => {
    if (!stationId) return setVehiclesByStation([]);

    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(
        `http://localhost:8080/api/vehicles/station/${stationId}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      const data = Array.isArray(res.data) ? res.data : [];
      setVehiclesByStation(data);
    } catch (err) {
      console.error("Lỗi tải xe theo trạm:", err);
      setVehiclesByStation([]);
    }
  };

  // ==== Modal thêm xe ====
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

  const handleCloseModal = () => {
    setShowAddModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "seatCount" ? Number(value) : value
    }));
  };

  // ==== Thêm xe ====
  const handleSubmitAddVehicle = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");

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

      await axios.post(
        "http://localhost:8080/api/vehicles/create",
        newVehicle,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );

      showNotification("Thêm xe thành công!");
      setShowAddModal(false);
      fetchVehicles();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || "Có lỗi xảy ra";
      showNotification("Lỗi thêm xe: " + translateError(errorMsg), "error");
    }
  };

  // ==== Mở modal sửa xe ====
  const handleOpenEditModal = (vehicleId) => {
    const vehicle = vehicles.find(
      (v) => (v.vehicleId || v.id) === vehicleId
    );

    if (!vehicle) return showNotification("Không tìm thấy xe!", "error");

    let seatCount = Number(vehicle.seatCount || vehicle.seat_count || 4);
    let variant = vehicle.variant || "air";
    if (seatCount === 4 && !["air", "pro", "plus"].includes(variant))
      variant = "air";

    setEditFormData({
      status: vehicle.status || "Available",
      brand: vehicle.brand || "VinFast",
      color: vehicle.color || "White",
      variant,
      seatCount
    });

    setEditingVehicleId(vehicleId);
    setShowEditModal(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: name === "seatCount" ? Number(value) : value
    }));
  };

  // ==== Sửa xe ====
  const handleSubmitEditVehicle = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      const vehicle = vehicles.find(
        (v) => (v.vehicleId || v.id) === editingVehicleId
      );

      if (!vehicle)
        return showNotification("Không tìm thấy xe!", "error");

      const updateData = {
        status: editFormData.status,
        stationId: Number(vehicle.stationId || vehicle.station_id),
        brand: editFormData.brand,
        color: editFormData.color,
        seatCount: editFormData.seatCount,
        variant: editFormData.variant,
        batteryStatus: String(vehicle.batteryStatus ?? vehicle.battery_status ?? "100"),
batteryCapacity: String(vehicle.batteryCapacity ?? vehicle.battery_capacity ?? "100"),

        rangeKm: Number(
          vehicle.rangeKm || vehicle.range_km || 350
        )
      };

      await axios.put(
        `http://localhost:8080/api/vehicles/update/${editingVehicleId}`,
        updateData,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      showNotification("Sửa xe thành công!");
      setShowEditModal(false);
      fetchVehicles();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || "Có lỗi xảy ra";
      showNotification("Lỗi sửa xe: " + translateError(errorMsg), "error");
    }
  };

  // ==== Xóa xe ====
  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa xe này?")) return;

    try {
      const token = localStorage.getItem("accessToken");

      await axios.delete(
        `http://localhost:8080/api/vehicles/deleted/${vehicleId}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      showNotification("Xóa xe thành công!");
      fetchVehicles();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || "Có lỗi xảy ra";
      showNotification("Lỗi xóa xe: " + translateError(errorMsg), "error");
    }
  };

  // ==== Lịch sử thuê xe ====
  const handleViewRentalHistory = async (vehicleId) => {
    try {
      const token = localStorage.getItem("accessToken");

      const res = await axios.get(
        `http://localhost:8080/api/order/vehicle/${vehicleId}/compact`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      const data = Array.isArray(res.data) ? res.data : [];
      setRentalHistory(data);
      setCurrentHistoryVehicleId(vehicleId);
      setShowHistoryModal(true);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || "Có lỗi xảy ra";
      showNotification(
        "Lỗi tải lịch sử thuê: " + translateError(errorMsg),
        "error"
      );
    }
  };

  // ==== Chi tiết đơn hàng ====
  const handleViewOrderDetail = async (orderId) => {
    try {
      const token = localStorage.getItem("accessToken");

      const res = await axios.get(
        `http://localhost:8080/api/order-details/order/${orderId}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      setOrderDetails(Array.isArray(res.data) ? res.data : []);
      setShowOrderDetailModal(true);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || "Có lỗi xảy ra";
      showNotification(
        "Lỗi tải chi tiết đơn hàng: " + translateError(errorMsg),
        "error"
      );
    }
  };
  // Dịch phương thức thanh toán
  const translatePaymentMethod = (method) => {
    const map = {
      captureWallet: "Ví điện tử",
      bankTransfer: "Chuyển khoản",
      cash: "Tiền mặt",
      creditCard: "Thẻ tín dụng"
    };
    return map[method] || method;
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

  // Xử lý input sửa đơn hàng
  const handleEditOrderInputChange = (e) => {
    const { name, value } = e.target;
    setEditOrderFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? Number(value) : value
    }));
  };

  // Lưu sửa đơn hàng
  const handleSubmitEditOrder = async (e) => {
    e.preventDefault();
    if (!editingOrder || !currentHistoryVehicleId)
      return showNotification("Không tìm thấy thông tin đơn hàng!", "error");

    // Hiển thị xác nhận
    const confirmMsg = `Bạn có chắc lưu thay đổi?\nTrạng thái: ${translateOrderStatus(
      editOrderFormData.status
    )}\nGiá: ${editOrderFormData.price.toLocaleString("vi-VN")} đ\nTên trạm: ${
      editOrderFormData.stationName
    }`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const token = localStorage.getItem("accessToken");

      const updateData = {
        status: editOrderFormData.status,
        price: editOrderFormData.price,
        stationName: editOrderFormData.stationName
      };

      await axios.put(
        `http://localhost:8080/api/order/vehicle/${currentHistoryVehicleId}/${editingOrder.orderId}/compact`,
        updateData,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      showNotification("Sửa đơn hàng thành công!");
      setShowEditOrderModal(false);
      handleViewRentalHistory(currentHistoryVehicleId);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || "Có lỗi xảy ra";
      showNotification("Lỗi sửa đơn hàng: " + translateError(errorMsg), "error");
    }
  };

  // Xử lý input thêm đơn hàng
  const handleAddOrderInputChange = (e) => {
    const { name, value } = e.target;

    setAddOrderFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    // load xe theo trạm
    if (name === "stationId") {
      fetchVehiclesByStation(value);
      setAddOrderFormData((prev) => ({
        ...prev,
        stationId: value,
        vehicleId: ""
      }));
    }
  };

  // Thêm đơn hàng
  const handleSubmitAddOrder = async (e) => {
    e.preventDefault();

    if (!addOrderFormData.stationId)
      return showNotification("Vui lòng chọn trạm!", "error");

    if (!addOrderFormData.vehicleId)
      return showNotification("Vui lòng chọn xe!", "error");

    // Kiểm tra thời gian
    if (addOrderFormData.startTime && addOrderFormData.endTime) {
      const s = new Date(addOrderFormData.startTime);
      const e2 = new Date(addOrderFormData.endTime);
      if (e2 <= s)
        return showNotification(
          "Thời gian kết thúc phải sau thời gian bắt đầu!",
          "error"
        );
    }

    // Format date
    const formatDate = (dt) => {
      if (!dt) return "";
      return new Date(dt).toISOString().slice(0, 19);
    };

    // Tính giờ thuê
    const getHours = (s, e) => {
      const diff = new Date(e) - new Date(s);
      return Math.max(1, Math.ceil(diff / (1000 * 60 * 60)));
    };

    const orderData = {
      vehicleId: Number(addOrderFormData.vehicleId),
      startTime: formatDate(addOrderFormData.startTime),
      endTime: formatDate(addOrderFormData.endTime),
      plannedHours: getHours(addOrderFormData.startTime, addOrderFormData.endTime),
      couponCode: addOrderFormData.couponCode || null,
      holiday: false
    };

    try {
      const token = localStorage.getItem("accessToken");

      await axios.post(
        "http://localhost:8080/api/order/create",
        orderData,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      showNotification("Tạo đơn hàng thành công!");
      setShowAddOrderModal(false);
      setAddOrderFormData({
        stationId: "",
        vehicleId: "",
        startTime: "",
        endTime: "",
        couponCode: ""
      });
      setVehiclesByStation([]);

      if (currentHistoryVehicleId)
        handleViewRentalHistory(currentHistoryVehicleId);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Có lỗi xảy ra";

      showNotification("Lỗi tạo đơn hàng: " + translateError(msg), "error");
    }
  };

  // Xóa đơn hàng
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc muốn xóa đơn hàng này?")) return;

    try {
      const token = localStorage.getItem("accessToken");

      await axios.delete(
        `http://localhost:8080/api/order/delete/${orderId}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      showNotification("Xóa đơn hàng thành công!");
      if (currentHistoryVehicleId)
        handleViewRentalHistory(currentHistoryVehicleId);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Có lỗi xảy ra";
      showNotification("Lỗi xóa đơn hàng: " + translateError(msg), "error");
    }
  };

  // Map ảnh xe
  const getVehicleImage = (brand, seatCount, color) => {
    const mapColor = {
      Red: "red",
      White: "white",
      Blue: "blue",
      Black: "black",
      Silver: "silver",
      Đỏ: "red",
      Trắng: "white",
      Xanh: "blue",
      Đen: "black",
      Bạc: "silver"
    };

    const c = mapColor[color] || "white";
    const b = (brand || "").toUpperCase();
    const s = Number(seatCount) || 4;

    let img = DefaultCar;

    const choose = (obj) => obj[c] || DefaultCar;

    // Trạm 1: ảnh đúng
    if (station === "1") {
      if (b.includes("BMW"))
        img = choose(
          s === 7
            ? { red: BMW7_Red, white: BMW7_White, blue: BMW7_Blue, black: BMW7_Black, silver: BMW7_Silver }
            : { red: BMW4_Red, white: BMW4_White, blue: BMW4_Blue, black: BMW4_Black, silver: BMW4_Silver }
        );
      else if (b.includes("TES"))
        img = choose(
          s === 7
            ? { red: Tesla7_Red, white: Tesla7_White, blue: Tesla7_Blue, black: Tesla7_Black, silver: Tesla7_Silver }
            : { red: Tesla4_Red, white: Tesla4_White, blue: Tesla4_Blue, black: Tesla4_Black, silver: Tesla4_Silver }
        );
      else if (b.includes("VIN"))
        img = choose(
          s === 7
            ? { red: VinFast7_Red, white: VinFast7_White, blue: VinFast7_Blue, black: VinFast7_Black, silver: VinFast7_Silver }
            : { red: VinFast4_Red, white: VinFast4_White, blue: VinFast4_Blue, black: VinFast4_Black, silver: VinFast4_Silver }
        );
    }

    // Trạm 2: tráo lần 1
    else if (station === "2") {
      if (b.includes("BMW"))
        img = choose(
          s === 7
            ? { red: Tesla7_Red, white: Tesla7_White, blue: Tesla7_Blue, black: Tesla7_Black, silver: Tesla7_Silver }
            : { red: Tesla4_Red, white: Tesla4_White, blue: Tesla4_Blue, black: Tesla4_Black, silver: Tesla4_Silver }
        );
      else if (b.includes("TES"))
        img = choose(
          s === 7
            ? { red: VinFast7_Red, white: VinFast7_White, blue: VinFast7_Blue, black: VinFast7_Black, silver: VinFast7_Silver }
            : { red: VinFast4_Red, white: VinFast4_White, blue: VinFast4_Blue, black: VinFast4_Black, silver: VinFast4_Silver }
        );
      else if (b.includes("VIN"))
        img = choose(
          s === 7
            ? { red: BMW7_Red, white: BMW7_White, blue: BMW7_Blue, black: BMW7_Black, silver: BMW7_Silver }
            : { red: BMW4_Red, white: BMW4_White, blue: BMW4_Blue, black: BMW4_Black, silver: BMW4_Silver }
        );
    }

    // Trạm 3: tráo lần 2
    else if (station === "3") {
      if (b.includes("BMW"))
        img = choose(
          s === 7
            ? { red: VinFast7_Red, white: VinFast7_White, blue: VinFast7_Blue, black: VinFast7_Black, silver: VinFast7_Silver }
            : { red: VinFast4_Red, white: VinFast4_White, blue: VinFast4_Blue, black: VinFast4_Black, silver: VinFast4_Silver }
        );
      else if (b.includes("TES"))
        img = choose(
          s === 7
            ? { red: BMW7_Red, white: BMW7_White, blue: BMW7_Blue, black: BMW7_Black, silver: BMW7_Silver }
            : { red: BMW4_Red, white: BMW4_White, blue: BMW4_Blue, black: BMW4_Black, silver: BMW4_Silver }
        );
      else if (b.includes("VIN"))
        img = choose(
          s === 7
            ? { red: Tesla7_Red, white: Tesla7_White, blue: Tesla7_Blue, black: Tesla7_Black, silver: Tesla7_Silver }
            : { red: Tesla4_Red, white: Tesla4_White, blue: Tesla4_Blue, black: Tesla4_Black, silver: Tesla4_Silver }
        );
    }

    return img;
  };

  const getColorHex = (color) => {
    const map = {
      Red: "#DC143C",
      White: "#FFFFFF",
      Blue: "#1E90FF",
      Black: "#1a1a1a",
      Silver: "#C0C0C0",
      Đỏ: "#DC143C",
      Trắng: "#FFFFFF",
      Xanh: "#1E90FF",
      Đen: "#1a1a1a",
      Bạc: "#C0C0C0"
    };
    return map[color] || "#CCCCCC";
  };

  const getStatusInfo = (status) => {
    const s = (status || "").toUpperCase();

    const map = {
      AVAILABLE: { text: "AVAILABLE", class: "AVAILABLE", display: "Sẵn sàng" },
      RENTED: { text: "IN_USE", class: "IN_USE", display: "Đang thuê" },
      RENTAL: { text: "IN_USE", class: "IN_USE", display: "Đang thuê" },
      ON_RENT: { text: "IN_USE", class: "IN_USE", display: "Đang thuê" },
      IN_USE: { text: "IN_USE", class: "IN_USE", display: "Đang thuê" },
      BOOKED: { text: "RESERVED", class: "RESERVED", display: "Đã đặt trước" },
      RESERVED: { text: "RESERVED", class: "RESERVED", display: "Đã đặt trước" },
      CHECKING: { text: "CHECKING", class: "CHECKING", display: "Đang kiểm tra" },
      MAINTENANCE: { text: "MAINTENANCE", class: "MAINTENANCE", display: "Bảo trì" }
    };

    return map[s] || { text: status, class: "AVAILABLE", display: status };
  };

  // Filter functions
  const getUniqueColors = () => [...new Set(vehicles.map(v => v.color).filter(Boolean))];
  const getUniqueSeatCounts = () => [...new Set(vehicles.map(v => v.seatCount || v.seat_count).filter(Boolean))].sort((a, b) => a - b);
  const getAllStatuses = () => {
    const allStatuses = new Set();
    vehicles.forEach(v => {
      if (v.status) allStatuses.add(v.status);
    });
    return Array.from(allStatuses);
  };

  // Toggle filter
  const toggleFilter = (filterType, value) => {
    setFilters(prev => {
      const current = prev[filterType];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [filterType]: updated };
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      colors: [],
      seatCounts: [],
      statuses: []
    });
  };

  // Filter vehicles
  const filteredVehicles = vehicles.filter(vehicle => {
    // Filter by color
    const matchesColor = filters.colors.length === 0 || filters.colors.includes(vehicle.color);
    
    // Filter by seat count
    const seatCount = vehicle.seatCount || vehicle.seat_count;
    const matchesSeatCount = filters.seatCounts.length === 0 || filters.seatCounts.includes(seatCount);
    
    // Filter by status
    const matchesStatus = filters.statuses.length === 0 || filters.statuses.includes(vehicle.status);
    
    return matchesColor && matchesSeatCount && matchesStatus;
  });

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const close = (e) => {
      if (!e.target.closest(".menu-wrapper")) {
        setOpenMenuId(null);
        setOpenOrderMenuId(null);
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  // Check quyền admin
  useEffect(() => {
    if (authLoading) return;
    const token = localStorage.getItem("accessToken");
    if (!token || user?.role !== "admin")
      navigate("/login", { replace: true });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    fetchAllStations();
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchVehicles().finally(() => setLoading(false));
  }, [station]);

  // ==== RENDER ====
  if (loading)
    return (
      <div className="station-vehicle-page">
        <div style={{ padding: 40, textAlign: "center", color: "#666" }}>
          ⏳ Đang tải danh sách xe...
        </div>
      </div>
    );

  return (
    <div className="station-vehicle-page">
      <div className="page-header-section">
        <h1 className="page-title">DANH SÁCH XE TẠI TRẠM #{station}</h1>
        {stationName && <p className="station-name-large">{stationName}</p>}
      </div>

      <div className="table-header-actions">
        <button className="btn-add-vehicle" onClick={handleOpenAddModal}>
          + Thêm xe
        </button>
      </div>

      {/* Filters Section */}
      <div
        className={`filters-section ${showFilters ? 'open' : ''}`}
        onMouseEnter={() => setShowFilters(true)}
        onMouseLeave={() => setShowFilters(false)}
      >
        <div className="filter-header">
          <h3>BỘ LỌC {!showFilters && '(Di chuột vào để mở)'}</h3>
          {(filters.colors.length > 0 || filters.seatCounts.length > 0 || filters.statuses.length > 0) && (
            <button className="btn-clear-filters" onClick={clearFilters}>
              Xóa bộ lọc
            </button>
          )}
        </div>

        <div className="filters-grid">
          {/* Color Filter */}
          <div className="filter-group">
            <h4>🎨 MÀU SẮC</h4>
            <div className="filter-options">
              {getUniqueColors().map(color => (
                <label key={color} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.colors.includes(color)}
                    onChange={() => toggleFilter('colors', color)}
                  />
                  <span>{color}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Seat Count Filter */}
          <div className="filter-group">
            <h4>💺 SỐ GHẾ</h4>
            <div className="filter-options">
              {getUniqueSeatCounts().map(count => (
                <label key={count} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.seatCounts.includes(count)}
                    onChange={() => toggleFilter('seatCounts', count)}
                  />
                  <span>{count} CHỖ</span>
                </label>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div className="filter-group">
            <h4>📊 TRẠNG THÁI</h4>
            <div className="filter-options">
              {getAllStatuses().map(status => {
                const statusInfo = getStatusInfo(status);
                return (
                  <label key={status} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={filters.statuses.includes(status)}
                      onChange={() => toggleFilter('statuses', status)}
                    />
                    <span>{statusInfo.display || status}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {filteredVehicles.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 48 }}>📭</div>
          <p>
            {vehicles.length === 0 
              ? "Không có xe nào tại trạm này"
              : "Không tìm thấy xe nào phù hợp với bộ lọc"}
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="vehicle-table">
            <thead>
              <tr className="header-row">
                <th>STT</th>
                <th>ẢNH</th>
                <th>TÊN XE</th>
                <th>BIỂN SỐ</th>
                <th>HÃNG</th>
                <th>MÀU</th>
                <th>SỐ GHẾ</th>
                <th>NĂM SX</th>
               
                <th>PIN (%)</th>
                <th>TRẠNG THÁI</th>
                <th>HÀNH ĐỘNG</th>
              </tr>
            </thead>

            <tbody>
              {filteredVehicles.map((v, index) => {
                const info = getStatusInfo(v.status);
              const rawBattery = v.batteryStatus || v.battery_status || "0";
const battery = Number(String(rawBattery).replace("%", "").trim());

                const batteryClass =
                  battery >= 70 ? "high" : battery >= 40 ? "medium" : "low";

                return (
                  <tr key={v.vehicleId || v.id}>
                    <td>{index + 1}</td>

                    <td>
                      <img
                        src={getVehicleImage(
                          v.brand,
                          v.seatCount || v.seat_count,
                          v.color
                        )}
                        alt={v.vehicleName}
                        className="vehicle-image"
                        onError={(e) => (e.target.src = DefaultCar)}
                      />
                    </td>

                    <td><strong>{v.vehicleName}</strong></td>
                    <td>{v.plateNumber}</td>
                    <td>{v.brand}</td>

                    <td>
                      <span
                        className="color-badge"
                        style={{
                          backgroundColor: getColorHex(v.color),
                          borderColor: getColorHex(v.color)
                        }}
                      ></span>
                      {v.color}
                    </td>

                    <td>{v.seatCount} chỗ</td>
                    <td>{v.year}</td>
                   

                    <td>
                      <span className={`battery-badge ${batteryClass}`}>
                        {battery}%
                      </span>
                    </td>

                    <td>
                      <span className={`status-badge ${info.class}`}>
                        {info.display}
                      </span>
                    </td>

                    <td>
                      <div className="menu-wrapper">
                        <button
                          className="menu-btn"
                          onClick={() =>
                            setOpenMenuId(
                              openMenuId === (v.vehicleId || v.id)
                                ? null
                                : v.vehicleId || v.id
                            )
                          }
                          aria-label="Hành động"
                        >
                        </button>

                        {openMenuId === (v.vehicleId || v.id) && (
                          <div className="dropdown-menu">
                            <button
                              className="menu-item"
                              onClick={() => {
                                handleViewRentalHistory(v.vehicleId);
                                setOpenMenuId(null);
                              }}
                            >
                              Xem lịch sử thuê
                            </button>
                            <button
                              className="menu-item"
                              onClick={() => {
                                handleOpenEditModal(v.vehicleId);
                                setOpenMenuId(null);
                              }}
                            >
                              Sửa
                            </button>
                            <button
                              className="menu-item danger"
                              onClick={() => {
                                handleDeleteVehicle(v.vehicleId);
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

          {/* Footer Thống kê */}
          <div className="table-footer">
            <div className="stats">
              <span><strong>Tổng xe:</strong> {vehicles.length}</span>
              {filteredVehicles.length !== vehicles.length && (
                <span><strong>Hiển thị:</strong> {filteredVehicles.length}</span>
              )}
              <span>
                <strong>Sẵn sàng:</strong>{" "}
                {vehicles.filter((v) =>
                  ["AVAILABLE", "Available"].includes(v.status)
                ).length}
              </span>
              <span>
                <strong>Đang thuê:</strong>{" "}
                {vehicles.filter((v) =>
                  ["RENTED", "RENTAL", "ON_RENT", "IN_USE"].includes(
                    (v.status || "").toUpperCase()
                  )
                ).length}
              </span>
              <span>
                <strong>Đã đặt trước:</strong>{" "}
                {vehicles.filter((v) =>
                  ["BOOKED", "RESERVED"].includes(
                    (v.status || "").toUpperCase()
                  )
                ).length}
              </span>
              <span>
                <strong>Đang kiểm tra:</strong>{" "}
                {vehicles.filter((v) =>
                  ["CHECKING"].includes((v.status || "").toUpperCase())
                ).length}
              </span>
              <span>
                <strong>Bảo trì:</strong>{" "}
                {vehicles.filter((v) =>
                  ["MAINTENANCE"].includes((v.status || "").toUpperCase())
                ).length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========== MODAL CÁC LOẠI ========== */}
      {/* (Toàn bộ phần modal thêm xe, sửa xe, thêm đơn hàng, sửa đơn hàng, xem lịch sử, xem chi tiết...) */}
      {/* Bạn giữ nguyên như phần trước, vì nội dung đó không liên quan API thay đổi */}

      {/* ----- Notification ----- */}
      {notification.show && (
        <div className={`notification-toast ${notification.type}`}>
          <div className="notification-content">
            <span className="notification-icon">
              {notification.type === "success" ? "✓" : notification.type === "error" ? "✕" : "ℹ"}
            </span>
            <span className="notification-message">{notification.message}</span>
            <button
              className="notification-close"
              onClick={() =>
                setNotification({ show: false, message: "", type: "success" })
              }
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
