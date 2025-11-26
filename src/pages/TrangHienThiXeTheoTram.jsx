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
    status: "AVAILABLE",
    vehicleName: "",
    brand: "VinFast",
    color: "White",
    variant: "air",
    seatCount: 4,
    description: "",
    transmission: "Auto",
    year: new Date().getFullYear(),
    batteryStatus: "100",
    batteryCapacity: "100",
    rangeKm: 350
  });

  // State cho modal thêm xe mới với model selection
  const [selectedModel, setSelectedModel] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Danh sách models - Dựa trên database backend
  // B-SUV: 4 chỗ, variant Air/Plus/Pro
  // C-SUV: 4 chỗ, variant Plus
  // D-SUV: 4 chỗ, variant Pro
  // E-SUV: 7 chỗ, variant Air
  // F-SUV: 7 chỗ, variant Plus
  // G-SUV: 7 chỗ, variant Pro
  const vehicleModels = [
    {
      id: "B-SUV",
      name: "B-SUV",
      description: "Xe SUV cỡ nhỏ - 4 chỗ",
      seatCount: 4,
      variant: "air", // Mặc định Air, có thể chọn Plus/Pro
      variants: ["air", "plus", "pro"],
      carmodel: "B-SUV"
    },
    {
      id: "C-SUV",
      name: "C-SUV",
      description: "Xe SUV cỡ trung - 4 chỗ",
      seatCount: 4,
      variant: "plus",
      variants: ["plus"],
      carmodel: "C-SUV"
    },
    {
      id: "D-SUV",
      name: "D-SUV",
      description: "Xe SUV cỡ lớn - 4 chỗ",
      seatCount: 4,
      variant: "pro",
      variants: ["pro"],
      carmodel: "D-SUV"
    },
    {
      id: "E-SUV",
      name: "E-SUV",
      description: "Xe SUV cỡ nhỏ - 7 chỗ",
      seatCount: 7,
      variant: "air",
      variants: ["air"],
      carmodel: "E-SUV"
    },
    {
      id: "F-SUV",
      name: "F-SUV",
      description: "Xe SUV cỡ trung - 7 chỗ",
      seatCount: 7,
      variant: "plus",
      variants: ["plus"],
      carmodel: "F-SUV"
    },
    {
      id: "G-SUV",
      name: "G-SUV",
      description: "Xe SUV cỡ lớn - 7 chỗ",
      seatCount: 7,
      variant: "pro",
      variants: ["pro"],
      carmodel: "G-SUV"
    }
  ];

  const [editFormData, setEditFormData] = useState({
    status: "Available",
    stationId: "",
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
      status: "AVAILABLE",
      vehicleName: "",
      brand: "VinFast",
      color: "White",
      variant: "air",
      seatCount: 4,
      description: "",
      transmission: "Automatic",
      year: new Date().getFullYear(),
      batteryStatus: "100%",
      batteryCapacity: "100 kWh",
      rangeKm: 350
    });
    setSelectedModel(null);
    setUploadedImages([]);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setSelectedModel(null);
    setUploadedImages([]);
    setFormData({
      plateNumber: "",
      status: "AVAILABLE",
      vehicleName: "",
      brand: "VinFast",
      color: "White",
      variant: "air",
      seatCount: 4,
      description: "",
      transmission: "Automatic",
      year: new Date().getFullYear(),
      batteryStatus: "100%",
      batteryCapacity: "100 kWh",
      rangeKm: 350
    });
  };

  // Xử lý chọn model - Tự động generate tên xe, hãng xe và năm sản xuất
  const handleSelectModel = (model) => {
    setSelectedModel(model);
    
    // Tự động generate hãng xe (random giữa VinFast, BMW, Tesla)
    const brands = ["VinFast", "BMW", "Tesla"];
    const randomBrand = brands[Math.floor(Math.random() * brands.length)];
    
    // Tự động generate năm sản xuất (random từ 2022 đến năm hiện tại)
    const currentYear = new Date().getFullYear();
    const randomYear = Math.floor(Math.random() * (currentYear - 2021 + 1)) + 2022;
    
    // Tự động generate tên xe: "Brand 4S/7S Variant" (ví dụ: "VinFast 4S Air", "BMW 7S Plus")
    const seatLabel = model.seatCount === 4 ? "4S" : "7S";
    const variantLabel = model.variant.charAt(0).toUpperCase() + model.variant.slice(1);
    const generatedVehicleName = `${randomBrand} ${seatLabel} ${variantLabel}`;
    
    setFormData(prev => ({
      ...prev,
      seatCount: model.seatCount,
      variant: model.variant,
      brand: randomBrand, // Tự động generate hãng xe
      vehicleName: generatedVehicleName, // Tự động generate tên xe
      year: randomYear // Tự động generate năm sản xuất
    }));
  };

  // Xử lý upload ảnh
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setUploadedImages(files);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "seatCount" ? Number(value) : value
    }));
  };

  // ==== Thêm xe với multipart/form-data ====
  const handleSubmitAddVehicle = async (e) => {
    e.preventDefault();
    
    if (!selectedModel) {
      showNotification("Vui lòng chọn model xe!", "error");
      return;
    }

    // Validate biển số xe
    if (!formData.plateNumber || formData.plateNumber.trim() === "") {
      showNotification("Vui lòng nhập biển số xe!", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("accessToken");

      // Tạo FormData cho multipart/form-data
      const formDataToSend = new FormData();

      // Validate required fields
      if (!formData.plateNumber || formData.plateNumber.trim() === "") {
        showNotification("Vui lòng nhập biển số xe!", "error");
        setIsSubmitting(false);
        return;
      }

      if (!formData.vehicleName || formData.vehicleName.trim() === "") {
        showNotification("Vui lòng nhập tên xe!", "error");
        setIsSubmitting(false);
        return;
      }

      // Backend DTO: VehicleCreateRequest với field plateNumber (camelCase)
      const vehicleData = {
        plateNumber: formData.plateNumber.trim(), // ✅ Đúng tên field: plateNumber (không phải plate_number)
        status: formData.status || "AVAILABLE",
        stationId: Number(station),
        vehicleName: formData.vehicleName.trim(),
        description: formData.description || "",
        brand: formData.brand || "VinFast",
        color: formData.color || "White",
        transmission: formData.transmission || "Automatic",
        seatCount: Number(formData.seatCount),
        year: Number(formData.year || new Date().getFullYear()),
        variant: formData.variant || "air",
        batteryStatus: formData.batteryStatus || "100%",
        batteryCapacity: formData.batteryCapacity || "100 kWh",
        rangeKm: Number(formData.rangeKm || 350),
        carmodel: selectedModel.carmodel
      };

      // Validate plateNumber trước khi gửi
      if (!vehicleData.plateNumber || vehicleData.plateNumber.length === 0) {
        showNotification("Biển số xe không được để trống!", "error");
        setIsSubmitting(false);
        return;
      }

      // Tạo JSON string - Đảm bảo plateNumber có trong JSON
      const vehicleJsonString = JSON.stringify(vehicleData);
      console.log("[Create Vehicle] JSON String:", vehicleJsonString);
      console.log("[Create Vehicle] JSON String length:", vehicleJsonString.length);
      console.log("[Create Vehicle] JSON includes 'plateNumber':", vehicleJsonString.includes('"plateNumber"'));
      console.log("[Create Vehicle] JSON includes plateNumber value:", vehicleJsonString.includes(vehicleData.plateNumber));
      
      // Parse lại để verify
      try {
        const parsed = JSON.parse(vehicleJsonString);
        console.log(" [Create Vehicle] Parsed JSON.plateNumber:", parsed.plateNumber);
        console.log(" [Create Vehicle] Parsed JSON.plateNumber type:", typeof parsed.plateNumber);
        if (!parsed.plateNumber) {
          console.error(" [Create Vehicle] ERROR: plateNumber is missing after parsing!");
        }
      } catch (e) {
        console.error(" [Create Vehicle] ERROR parsing JSON:", e);
      }

      // Backend Spring Boot @RequestPart("vehicle") yêu cầu Blob với Content-Type header
      // Tạo Blob với Content-Type application/json để backend parse đúng
      console.log("[Create Vehicle] Using Blob with Content-Type application/json");
      const vehicleBlob = new Blob([vehicleJsonString], { 
        type: 'application/json' 
      });
      
      // Thêm Blob vào FormData với tên "vehicle" và filename
      // Spring Boot cần Content-Type trong multipart để parse JSON
      formDataToSend.append("vehicle", vehicleBlob, "vehicle.json");
      
      // Debug: Kiểm tra FormData
      const formDataVehicle = formDataToSend.get("vehicle");
      console.log("[Create Vehicle] FormData.get('vehicle') type:", typeof formDataVehicle);
      console.log("[Create Vehicle] FormData.get('vehicle') is Blob:", formDataVehicle instanceof Blob);
      
      // Đọc nội dung Blob để verify
      if (formDataVehicle instanceof Blob) {
        formDataVehicle.text().then(text => {
          console.log("[Create Vehicle] FormData Blob content:", text);
          console.log("[Create Vehicle] FormData Blob includes 'plateNumber':", text.includes('"plateNumber"'));
          try {
            const parsed = JSON.parse(text);
            console.log("[Create Vehicle] FormData Blob parsed.plateNumber:", parsed.plateNumber);
          } catch (e) {
            console.error("[Create Vehicle] ERROR parsing FormData Blob:", e);
          }
        });
      }
      
      console.log(" [Create Vehicle] ============================");

      // Thêm images vào FormData (nếu có)
      if (uploadedImages && uploadedImages.length > 0) {
        uploadedImages.forEach((image) => {
          formDataToSend.append("images", image);
        });
      }

      // Gọi API với multipart/form-data
      // Lưu ý: Không set Content-Type header, để axios tự động set với boundary
      console.log("[Create Vehicle] ========== SENDING REQUEST ==========");
      console.log("[Create Vehicle] URL: http://localhost:8080/api/vehicles/create");
      console.log("[Create Vehicle] Method: POST");
      console.log("[Create Vehicle] Has token:", !!token);
      
      // Log FormData entries để debug
      console.log("[Create Vehicle] FormData entries:");
      for (const [key, value] of formDataToSend.entries()) {
        if (value instanceof File || value instanceof Blob) {
          console.log(`  - ${key}: [Blob/File] size=${value.size}, type=${value.type}`);
          if (key === 'vehicle') {
            value.text().then(text => {
              console.log(`  - ${key} content:`, text);
            });
          }
        } else {
          console.log(`  - ${key}:`, value);
        }
      }
      
      const response = await axios.post(
        "http://localhost:8080/api/vehicles/create",
        formDataToSend,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
            // Không set Content-Type, axios sẽ tự động set với boundary cho multipart/form-data
          }
        }
      );
      
      console.log("[Create Vehicle] ========== RESPONSE RECEIVED ==========");
      console.log("[Create Vehicle] Response status:", response.status);
      console.log("[Create Vehicle] Response data:", response.data);

      showNotification("Thêm xe thành công!");
      handleCloseModal();
      fetchVehicles();
    } catch (err) {
      console.error("Lỗi thêm xe:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      console.error("Error headers:", err.response?.headers);
      
      // Lấy thông báo lỗi chi tiết từ backend
      let errorMsg = "Có lỗi xảy ra";
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMsg = err.response.data;
        } else if (err.response.data.message) {
          errorMsg = err.response.data.message;
        } else if (err.response.data.error) {
          errorMsg = err.response.data.error;
        } else {
          errorMsg = JSON.stringify(err.response.data);
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      showNotification("Lỗi thêm xe: " + translateError(errorMsg), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==== Mở modal sửa xe ====
  const handleOpenEditModal = async (vehicleId) => {
    const vehicle = vehicles.find(
      (v) => (v.vehicleId || v.id) === vehicleId
    );

    if (!vehicle) return showNotification("Không tìm thấy xe!", "error");

    // Load danh sách trạm nếu chưa có
    if (allStations.length === 0) {
      await fetchAllStations();
    }

    let seatCount = Number(vehicle.seatCount || vehicle.seat_count || 4);
    let variant = vehicle.variant || "air";
    if (seatCount === 4 && !["air", "pro", "plus"].includes(variant))
      variant = "air";

    setEditFormData({
      status: vehicle.status || "AVAILABLE",
      stationId: String(vehicle.stationId || vehicle.station_id || station || ""),
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

      // Kiểm tra nếu xe đang ở trạng thái RENTED hoặc BOOKED, không cho phép thay đổi trạng thái và trạm
      const currentStatus = (vehicle.status || "").toUpperCase();
      const newStatus = (editFormData.status || "").toUpperCase();
      
      // Nếu xe đang ở trạng thái RENTED hoặc BOOKED, không cho phép thay đổi trạm
      if (currentStatus === "RENTED" || currentStatus === "RENTAL" || currentStatus === "BOOKED") {
        const currentStationId = String(vehicle.stationId || vehicle.station_id || "");
        const newStationId = String(editFormData.stationId || "");
        
        // Kiểm tra nếu cố gắng thay đổi trạm
        if (newStationId && newStationId !== currentStationId) {
          const statusMessage = (currentStatus === "BOOKED") 
            ? "Không thể chuyển trạm khi xe đang ở trạng thái 'Đã đặt trước'. Vui lòng hủy đặt trước hoặc đợi khách hàng hoàn tất giao dịch trước khi chuyển trạm."
            : "Không thể chuyển trạm khi xe đang ở trạng thái 'Đang thuê'. Vui lòng đợi khách hàng trả xe trước khi chuyển trạm.";
          return showNotification(statusMessage, "error");
        }
      }
      
      // Kiểm tra pin trước khi cho phép chuyển sang trạng thái Sẵn sàng
      if (newStatus === "AVAILABLE") {
        // Lấy pin từ editFormData (nếu đã thay đổi) hoặc từ vehicle (pin hiện tại)
        const batteryStatus = editFormData.batteryStatus || vehicle.batteryStatus || vehicle.battery_status || "0";
        const batteryPercent = Number(String(batteryStatus).replace("%", "").trim());
        
        if (isNaN(batteryPercent) || batteryPercent <= 60) {
          return showNotification("Không thể chuyển sang trạng thái 'Sẵn sàng'. Pin phải trên 60%. Pin hiện tại: " + (isNaN(batteryPercent) ? "N/A" : batteryPercent) + "%.", "error");
        }
      }

      // Nếu xe đang ở trạng thái RENTED, giữ nguyên trạng thái
      let finalStatus = editFormData.status;
      if (currentStatus === "RENTED" || currentStatus === "RENTAL") {
        // Giữ nguyên trạng thái RENTED, không cho phép thay đổi
        finalStatus = vehicle.status;
      } else if (newStatus === "RENTED" || newStatus === "RENTAL") {
        // Nếu cố gắng chuyển sang trạng thái RENTED, từ chối
        return showNotification("Không thể chuyển sang trạng thái 'Đang thuê'. Trạng thái này chỉ được thay đổi tự động khi khách hàng cọc và bàn giao xe.", "error");
      } else if (newStatus === "BOOKED") {
        // Admin không có quyền chuyển xe sang trạng thái "Đã đặt trước" - chỉ tự động khi customer đặt xe
        return showNotification("Không thể chuyển sang trạng thái 'Đã đặt trước'. Trạng thái này chỉ được thay đổi tự động khi khách hàng đặt xe.", "error");
      }

      // Chuyển đổi status sang lowercase để khớp với backend (available|rental|maintenance|checking)
      const statusMap = {
        "AVAILABLE": "available",
        "RENTED": "rental",
        "RENTAL": "rental",
        "MAINTENANCE": "maintenance",
        "CHECKING": "checking", // Backend đã hỗ trợ trạng thái checking
        "BOOKED": "available" // BOOKED không được backend hỗ trợ, map về available
      };
      const normalizedStatus = statusMap[finalStatus?.toUpperCase()] || finalStatus?.toLowerCase() || "available";

      // Nếu xe đang ở trạng thái RENTED hoặc BOOKED, giữ nguyên trạm
      let finalStationId = Number(editFormData.stationId || vehicle.stationId || vehicle.station_id);
      if (currentStatus === "RENTED" || currentStatus === "RENTAL" || currentStatus === "BOOKED") {
        finalStationId = Number(vehicle.stationId || vehicle.station_id);
      }

      // ⭐⭐ VALIDATION: Kiểm tra lại pin một lần nữa trước khi gửi API (phòng trường hợp có thay đổi) ⭐⭐
      if (normalizedStatus === "available") {
        const batteryStatus = editFormData.batteryStatus || vehicle.batteryStatus || vehicle.battery_status || "0";
        const batteryPercent = Number(String(batteryStatus).replace("%", "").trim());
        if (isNaN(batteryPercent) || batteryPercent <= 60) {
          return showNotification("Không thể chuyển sang trạng thái 'Sẵn sàng'. Pin phải trên 60%. Pin hiện tại: " + (isNaN(batteryPercent) ? "N/A" : batteryPercent) + "%.", "error");
        }
      }

      const updateData = {
        status: normalizedStatus,
        stationId: finalStationId,
        brand: editFormData.brand,
        color: editFormData.color,
        seatCount: editFormData.seatCount,
        variant: editFormData.variant,
        batteryStatus: String(editFormData.batteryStatus || (vehicle.batteryStatus ?? vehicle.battery_status ?? "100")),
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
                <th>LOẠI XE</th>
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
                    <td>{v.carmodel || v.carModel || "N/A"}</td>

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
                                navigate(`/admin/vehicle-history/${v.vehicleId || v.id}`);
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

      {/* ========== MODAL THÊM XE MỚI ========== */}
      {showAddModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content modal-add-vehicle" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Thêm xe mới</h2>
              <button className="modal-close-btn" onClick={handleCloseModal}>×</button>
            </div>

            <form onSubmit={handleSubmitAddVehicle}>
              {/* Bước 1: Chọn Model */}
              <div className="modal-section">
                <h3 className="section-title">1. Chọn Model Xe</h3>
                <div className="model-grid">
                  {vehicleModels.map((model) => (
                    <div
                      key={model.id}
                      className={`model-card ${selectedModel?.id === model.id ? 'selected' : ''}`}
                      onClick={() => handleSelectModel(model)}
                    >
                      <div className="model-info">
                        <h4>{model.name}</h4>
                        <p>{model.description}</p>
                        <span className="model-seats">{model.seatCount} chỗ</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bước 2: Thông tin xe */}
              {selectedModel && (
                <div className="modal-section">
                  <h3 className="section-title">2. Thông tin xe</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Biển số xe <span className="required">*</span></label>
                      <input
                        type="text"
                        name="plateNumber"
                        value={formData.plateNumber}
                        onChange={handleInputChange}
                        required
                        placeholder="VD: 30A-12345"
                      />
                    </div>

                    {/* Tên xe và hãng xe tự động generate - Có thể chỉnh sửa */}
                    <div className="form-group">
                      <label>Hãng xe</label>
                      <select
                        name="brand"
                        value={formData.brand}
                        onChange={(e) => {
                          handleInputChange(e);
                          // Khi đổi hãng, tự động update lại tên xe
                          if (selectedModel) {
                            const seatLabel = selectedModel.seatCount === 4 ? "4S" : "7S";
                            const variantLabel = formData.variant.charAt(0).toUpperCase() + formData.variant.slice(1);
                            setFormData(prev => ({
                              ...prev,
                              brand: e.target.value,
                              vehicleName: `${e.target.value} ${seatLabel} ${variantLabel}`
                            }));
                          }
                        }}
                      >
                        <option value="VinFast">VinFast</option>
                        <option value="BMW">BMW</option>
                        <option value="Tesla">Tesla</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Tên xe</label>
                      <input
                        type="text"
                        name="vehicleName"
                        value={formData.vehicleName || ""}
                        onChange={handleInputChange}
                        placeholder="VD: VinFast 4S Air"
                      />
                    </div>

                    <div className="form-group">
                      <label>Màu sắc</label>
                      <select
                        name="color"
                        value={formData.color}
                        onChange={handleInputChange}
                      >
                        <option value="White">Trắng</option>
                        <option value="Black">Đen</option>
                        <option value="Red">Đỏ</option>
                        <option value="Blue">Xanh dương</option>
                        <option value="Silver">Bạc</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Variant</label>
                      <select
                        name="variant"
                        value={formData.variant}
                        onChange={(e) => {
                          handleInputChange(e);
                          // Khi đổi variant, tự động update lại tên xe
                          if (selectedModel) {
                            const seatLabel = selectedModel.seatCount === 4 ? "4S" : "7S";
                            const variantLabel = e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1);
                            setFormData(prev => ({
                              ...prev,
                              variant: e.target.value,
                              vehicleName: `${prev.brand} ${seatLabel} ${variantLabel}`
                            }));
                          }
                        }}
                      >
                        {selectedModel?.variants?.map((v) => (
                          <option key={v} value={v}>
                            {v.charAt(0).toUpperCase() + v.slice(1)}
                          </option>
                        )) || (
                          formData.seatCount === 4 ? (
                            <>
                              <option value="air">Air</option>
                              <option value="plus">Plus</option>
                              <option value="pro">Pro</option>
                            </>
                          ) : (
                            <>
                              <option value="air">Air</option>
                              <option value="plus">Plus</option>
                              <option value="pro">Pro</option>
                            </>
                          )
                        )}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Năm sản xuất</label>
                      <input
                        type="number"
                        name="year"
                        value={formData.year || new Date().getFullYear()}
                        onChange={handleInputChange}
                        min="2020"
                        max={new Date().getFullYear() + 1}
                      />
                    </div>

                    <div className="form-group">
                      <label>Pin hiện tại (%)</label>
                      <input
                        type="text"
                        name="batteryStatus"
                        value={formData.batteryStatus || "100%"}
                        onChange={handleInputChange}
                        placeholder="VD: 100%"
                      />
                    </div>

                    <div className="form-group">
                      <label>Phạm vi (km)</label>
                      <input
                        type="number"
                        name="rangeKm"
                        value={formData.rangeKm || 350}
                        onChange={handleInputChange}
                        placeholder="VD: 350"
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Mô tả</label>
                      <textarea
                        name="description"
                        value={formData.description || ""}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Mô tả về xe..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Bước 3: Upload ảnh */}
              {selectedModel && (
                <div className="modal-section">
                  <h3 className="section-title">3. Upload ảnh xe (tùy chọn)</h3>
                  <div className="form-group">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="file-input"
                    />
                    {uploadedImages.length > 0 && (
                      <div className="uploaded-images">
                        <p>Đã chọn {uploadedImages.length} ảnh:</p>
                        <ul>
                          {uploadedImages.map((img, idx) => (
                            <li key={idx}>{img.name}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Nút submit */}
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={!selectedModel || isSubmitting}
                >
                  {isSubmitting ? "Đang thêm..." : "Thêm xe"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========== MODAL SỬA XE ========== */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chỉnh sửa thông tin xe</h2>
              <button className="modal-close-btn" onClick={() => setShowEditModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmitEditVehicle}>
              <div className="form-group">
                <label>Trạng thái <span className="required">*</span></label>
                {(() => {
                  const vehicle = vehicles.find(v => (v.vehicleId || v.id) === editingVehicleId);
                  const batteryStatus = vehicle?.batteryStatus || vehicle?.battery_status || "0";
                  const batteryPercent = Number(String(batteryStatus).replace("%", "").trim());
                  const isBatteryLow = batteryPercent <= 60;
                  
                  return ((editFormData.status || "").toUpperCase() === "RENTED" || 
                    (editFormData.status || "").toUpperCase() === "RENTAL") ? (
                    <div style={{ 
                      padding: "12px", 
                      background: "#FFF3CD", 
                      border: "1px solid #FFC107",
                      borderRadius: "4px",
                      color: "#856404",
                      fontSize: "14px"
                    }}>
                      <strong>Đang thuê</strong> - Trạng thái này chỉ được thay đổi tự động khi khách hàng cọc và bàn giao xe. Admin không thể chỉnh sửa.
                    </div>
                  ) : (
                    <div className="status-buttons-container">
                      <button
                        type="button"
                        className={`status-button ${(editFormData.status || "").toUpperCase() === "AVAILABLE" ? "active" : ""} ${isBatteryLow ? "disabled" : ""}`}
                        onClick={() => {
                          if (isBatteryLow) {
                            showNotification("Không thể chuyển sang trạng thái 'Sẵn sàng'. Pin phải trên 60%. Pin hiện tại: " + batteryPercent + "%.", "error");
                            return;
                          }
                          handleEditInputChange({ target: { name: "status", value: "AVAILABLE" } });
                        }}
                        disabled={isBatteryLow}
                        title={isBatteryLow ? `Pin hiện tại: ${batteryPercent}%. Cần trên 60% để chuyển sang trạng thái 'Sẵn sàng'.` : ""}
                      >
                        <span className="status-button-label">Có sẵn</span>
                        <span className="status-button-switch">
                          <span className="status-button-handle"></span>
                        </span>
                      </button>
                    {/* Admin không có quyền chuyển xe sang trạng thái "Đã đặt trước" - chỉ tự động khi customer đặt xe */}
                    <button
                      type="button"
                      className={`status-button ${(editFormData.status || "").toUpperCase() === "CHECKING" ? "active" : ""}`}
                      onClick={() => handleEditInputChange({ target: { name: "status", value: "CHECKING" } })}
                    >
                      <span className="status-button-label">Đang kiểm tra</span>
                      <span className="status-button-switch">
                        <span className="status-button-handle"></span>
                      </span>
                    </button>
                    <button
                      type="button"
                      className={`status-button ${(editFormData.status || "").toUpperCase() === "MAINTENANCE" ? "active" : ""}`}
                      onClick={() => handleEditInputChange({ target: { name: "status", value: "MAINTENANCE" } })}
                    >
                      <span className="status-button-label">Bảo trì</span>
                      <span className="status-button-switch">
                        <span className="status-button-handle"></span>
                      </span>
                    </button>
                  </div>
                  );
                })()}
              </div>

              <div className="form-group">
                <label>Trạm <span className="required">*</span></label>
                {((editFormData.status || "").toUpperCase() === "RENTED" || 
                  (editFormData.status || "").toUpperCase() === "RENTAL" ||
                  (editFormData.status || "").toUpperCase() === "BOOKED") ? (
                  <div>
                    <select
                      name="stationId"
                      value={editFormData.stationId}
                      disabled
                      style={{ 
                        opacity: 0.6, 
                        cursor: "not-allowed",
                        background: "#f5f5f5"
                      }}
                    >
                      <option value={editFormData.stationId}>
                        {allStations.find(st => 
                          String(st.stationId || st.stationid || st.id) === String(editFormData.stationId)
                        )?.name || "Đang tải..."} - {
                          allStations.find(st => 
                            String(st.stationId || st.stationid || st.id) === String(editFormData.stationId)
                          )?.city || ""
                        }
                      </option>
                    </select>
                    <div style={{ 
                      marginTop: "8px",
                      padding: "8px", 
                      background: "#FFF3CD", 
                      border: "1px solid #FFC107",
                      borderRadius: "4px",
                      color: "#856404",
                      fontSize: "12px"
                    }}>
                      {((editFormData.status || "").toUpperCase() === "RENTED" || 
                        (editFormData.status || "").toUpperCase() === "RENTAL") 
                        ? "Không thể chuyển trạm khi xe đang ở trạng thái 'Đang thuê'"
                        : "Không thể chuyển trạm khi xe đang ở trạng thái 'Đã đặt trước'"
                      }
                    </div>
                  </div>
                ) : (
                  <select
                    name="stationId"
                    value={editFormData.stationId}
                    onChange={handleEditInputChange}
                    required
                  >
                    <option value="">-- Chọn trạm --</option>
                    {allStations.map((st) => (
                      <option key={st.stationId || st.stationid || st.id} value={String(st.stationId || st.stationid || st.id)}>
                        {st.name} - {st.city}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowEditModal(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========== MODAL CÁC LOẠI KHÁC ========== */}
      {/* (Toàn bộ phần modal thêm đơn hàng, sửa đơn hàng, xem lịch sử, xem chi tiết...) */}

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