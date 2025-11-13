import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authService, vehicleService, orderService } from "../services";
import "./OrderDetailPage.css";

export default function OrderDetailPage() {
  const { orderId, userId } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Toast UI
  const [toast, setToast] = useState(null); // { type: 'success' | 'error' | 'info', text: string }
  const showToast = (type, text, ms = 4000) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), ms);
  };

  // Rút message từ Error("HTTP 400: {...}")
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

  // Refetch chi tiết + xe
  const refetchDetails = async () => {
    const res = await fetch(`http://localhost:8080/api/order-details/order/${orderId}`);
    const details = await res.json();
    setOrderDetails(details || []);

    const first = details?.[0];
    if (first?.vehicleId) {
      const resVehicles = await vehicleService.getVehicles();
      const vehicles = resVehicles.data || resVehicles || [];
      const foundVehicle = vehicles.find(
        (v) => Number(v.vehicleId) === Number(first.vehicleId)
      );
      setVehicle(foundVehicle || null);
    }
  };

  // Xác nhận bàn giao
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

  // Hủy bàn giao / hủy đơn
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
      showToast("success", "❌ Đã hủy bàn giao / hủy đơn!");
      await refetchDetails();
    } catch (e) {
      console.error(e);
      showToast("error", getApiMessage(e));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Khách hàng
        const resCus = await authService.getAllCustomer();
        const customers = resCus.data || resCus || [];
        const foundCustomer = customers.find(
          (c) => String(c.userId).toLowerCase() === String(userId).toLowerCase()
        );
        setCustomer(foundCustomer || null);

        // Chi tiết đơn
        const res = await fetch(`http://localhost:8080/api/order-details/order/${orderId}`);
        const details = await res.json();

        if (!Array.isArray(details) || details.length === 0) {
          setError("Không có chi tiết đơn hàng nào.");
          return;
        }
        setOrderDetails(details);

        // Xe
        const firstDetail = details[0];
        if (firstDetail?.vehicleId) {
          const resVehicles = await vehicleService.getVehicles();
          const vehicles = resVehicles.data || resVehicles || [];
          const foundVehicle = vehicles.find(
            (v) => Number(v.vehicleId) === Number(firstDetail.vehicleId)
          );
          setVehicle(foundVehicle || null);
        }
      } catch (err) {
        console.error("❌ Lỗi tải dữ liệu:", err);
        setError("Không thể tải thông tin đơn hàng hoặc khách hàng.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, userId]);

  const fmtVN = (d) => (d ? new Date(d).toLocaleString("vi-VN") : "N/A");

  if (loading) {
    return (
      <div className="order-detail-page">
        <div className="loading">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-detail-page">
        <div className="error">{error}</div>
      </div>
    );
  }

  const depositedOK = orderDetails.some(
    (d) => d.type === "DEPOSITED" && d.status === "SUCCESS"
  );
  const pickupOK = orderDetails.some(
    (d) => d.type === "PICKUP" && d.status === "SUCCESS"
  );

  return (
    <div className="order-detail-page">
      {toast && <div className={`toast ${toast.type}`}>{toast.text}</div>}

      <div className="header">
        <h1>Chi tiết đơn hàng</h1>
      </div>

      {customer && (
        <div className="info-card">
          <h2>Thông tin khách hàng</h2>
          <div className="info-grid">
            <p><span>Họ tên:</span> {customer.fullName || "Không có dữ liệu"}</p>
            <p><span>Email:</span> {customer.email || "Không có dữ liệu"}</p>
            <p><span>Số điện thoại:</span> {customer.phone || "Không có dữ liệu"}</p>
          </div>
        </div>
      )}

      {vehicle && (
        <div className="info-card">
          <h2>Thông tin xe</h2>
          <p>
            <strong>{vehicle.vehicleName}</strong> ({vehicle.plateNumber}) – {vehicle.color}
          </p>
          <p>
            <span>Trạng thái:&nbsp;</span>
            <span className={`pill pill-${(vehicle.status || "").toLowerCase()}`}>
              {vehicle.status}
            </span>
          </p>
        </div>
      )}



      <div className="info-card">
        <h2>Các giao dịch trong đơn hàng</h2>
        {orderDetails.map((detail) => (
          <div key={detail.detailId} className="detail-card">
            <div className="detail-header">
              <span className={`status-tag ${detail.status.toLowerCase()}`}>
                {detail.status}
              </span>
            </div>
            <div className="detail-grid">
              <p><span>Mã chi tiết:</span> {detail.detailId}</p>
              <p><span>Thời gian bắt đầu:</span> {fmtVN(detail.startTime)}</p>
              <p><span>Thời gian kết thúc:</span> {fmtVN(detail.endTime)}</p>
              <p><span>Số tiền:</span> {Number(detail.price || 0).toLocaleString("vi-VN")} VND</p>
              <p><span>Mô tả:</span> {detail.description}</p>
            </div>
          </div>
        ))}
      </div>
       <div className="info-card">
        <h2>Hành động bàn giao</h2>
        <div className="handover-actions">
          <button
            className="btn btn-primary"
            onClick={handleConfirmHandover}
            disabled={!depositedOK || pickupOK}
            title={!depositedOK ? "Chưa có đặt cọc thành công" : pickupOK ? "Đã bàn giao rồi" : ""}
          >
            ✅ Xác nhận bàn giao
          </button>

          <button
            className="btn btn-danger"
            onClick={handleCancelHandover}
            disabled={pickupOK}
            title={pickupOK ? "Đã bàn giao, không thể hủy" : ""}
          >
            ❌ Hủy bàn giao
          </button>
        </div>
      </div>


      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Quay lại
      </button>
    </div>
  );
}
