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

  // ========================
  // ⭐ RETURN PREVIEW
  // ========================
  const [returnPreview, setReturnPreview] = useState(null);
  const [returnTime, setReturnTime] = useState("");
  const [showReturnModal, setShowReturnModal] = useState(false);

  // ========================
  // ⭐ ADD SERVICE STATES
  // ========================
  const [service, setService] = useState({
    serviceType: "",
    cost: 0,
    description: ""
  });

  // ========================
  // ⭐ TOAST
  // ========================
  const [toast, setToast] = useState(null);
  const showToast = (type, text, ms = 4000) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), ms);
  };

  // ========================
  // ⭐ PARSE API ERROR
  // ========================
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

  // ========================
  // ⭐ REFRESH DETAILS
  // ========================
  const refetchDetails = async () => {
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
  };

  // ========================
  // ⭐ HANDLE PREVIEW RETURN
  // ========================
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

  // ========================
  // ⭐ HANDLE CONFIRM RETURN
  // ========================
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
      refetchDetails();
    } catch (err) {
      console.error(err);
      showToast("error", "Trả xe thất bại!");
    }
  };

  // ========================
  // ⭐ HANDLE ADD SERVICE
  // ========================
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

  // ========================
  // ⭐ HANDLE HANDOVER
  // ========================
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

      showToast("success", "❌ Đã hủy bàn giao / hủy đơn!");
      refetchDetails();
    } catch (err) {
      console.error(err);
      showToast("error", getApiMessage(err));
    }
  };

  // ========================
  // ⭐ INITIAL FETCH
  // ========================
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
        }
      } catch (err) {
        console.error(err);
        setError("Không thể tải dữ liệu!");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orderId, userId]);

  const fmtVN = (d) =>
    d ? new Date(d).toLocaleString("vi-VN") : "N/A";

  const depositedOK = orderDetails.some(
    (d) => d.type === "DEPOSIT" && d.status === "SUCCESS"
  );
  const pickupOK = orderDetails.some(
    (d) => d.type === "PICKUP" && d.status === "SUCCESS"
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

      {/* ======================== */}
      {/* ⭐ CUSTOMER */}
      {/* ======================== */}
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

      {/* ======================== */}
      {/* ⭐ VEHICLE INFO */}
      {/* ======================== */}
      {vehicle && (
        <div className="info-card">
          <h2>Thông tin xe</h2>

          <p>
            <strong>{vehicle.vehicleName}</strong> ({vehicle.plateNumber}) –{" "}
            {vehicle.color}
          </p>

          <p>
            <span>Trạng thái:&nbsp;</span>
            <span className={`pill pill-${vehicle.status.toLowerCase()}`}>
              {vehicle.status}
            </span>
          </p>

          <p>
            <span>Trạm hiện tại:&nbsp;</span>
            <strong>{vehicle.stationName}</strong>
          </p>
        </div>
      )}

      {/* ======================== */}
      {/* ⭐ ORDER DETAILS */}
      {/* ======================== */}
      <div className="info-card">
        <h2>Các giao dịch trong đơn hàng</h2>

        {orderDetails.map((detail) => (
          <div key={detail.detailId} className="detail-card">
            <div className="detail-header">
              <span className={`status-tag ${detail.status.toLowerCase()}`}>
                {detail.status === "SUCCESS"
                  ? "Thành công"
                  : detail.status === "FAILED"
                  ? "Thất bại"
                  : detail.status === "PENDING"
                  ? "Đang chờ"
                  : detail.status}
              </span>
            </div>

            <div className="detail-grid">
              <p><span>Thời gian bắt đầu:</span> {fmtVN(detail.startTime)}</p>
              <p><span>Thời gian kết thúc:</span> {fmtVN(detail.endTime)}</p>
              <p><span>Số tiền:</span> {Number(detail.price).toLocaleString("vi-VN")} VND</p>
              <p><span>Mô tả:</span> {detail.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ======================== */}
{/* ⭐ SERVICE FORM — FIXED */}
{/* ======================== */}
<div className="info-card">
  <h2>Dịch vụ phát sinh</h2>

  {/* --- Danh sách dịch vụ cố định --- */}
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
                serviceType: "SERVICE",      // 🔥 luôn SERVICE
                cost: sv.defaultCost,
                description: sv.label        // 🔥 mô tả = tên dịch vụ
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

  {/* --- Thêm dịch vụ khác --- */}
  <h3>➕ Thêm dịch vụ khác</h3>

  <div className="service-form">
    <label>Loại dịch vụ</label>
    <input
      type="text"
      value={service.description}
      placeholder="Nhập tên dịch vụ"
      onChange={(e) =>
        setService({
          ...service,
          description: e.target.value,
          serviceType: "SERVICE"          // 🔥 luôn SERVICE
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

    <button className="btn btn-add-service" onClick={async () => {
      if (!service.description.trim()) {
        return showToast("error", "Vui lòng nhập tên dịch vụ!");
      }

      try {
        const payload = {
          orderId,
          serviceType: "SERVICE",            // 🔥 cố định
          cost: Number(service.cost) || 0,
          description: service.description   // 🔥 mô tả dịch vụ
        };

        await fetch("http://localhost:8080/api/order-services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        showToast("success", "➕ Đã thêm dịch vụ!");

        // Reset
        setService({
          serviceType: "SERVICE",
          cost: 0,
          description: ""
        });

        refetchDetails();
      } catch (err) {
        console.error(err);
        showToast("error", "Không thể thêm dịch vụ!");
      }
    }}>
      ➕ Thêm dịch vụ
    </button>
  </div>
</div>


      {/* ======================== */}
      {/* ⭐ HANDOVER */}
      {/* ======================== */}
      <div className="info-card">
        <h2>Hành động bàn giao</h2>

        <div className="handover-actions">
          {vehicle?.status === "RENTAL" ? (
            <button className="btn-receive" onClick={handlePreviewReturn}>
              🚗 Nhận xe
            </button>
          ) : (
            <>
              <button
                className="btn btn-primary"
                onClick={handleConfirmHandover}
                disabled={!depositedOK || !pickupOK}
              >
                ✅ Xác nhận bàn giao
              </button>

              <button
                className="btn btn-danger"
                onClick={handleCancelHandover}
                disabled={pickupOK}
              >
                ❌ Hủy bàn giao
              </button>
            </>
          )}
        </div>
      </div>

      {/* ======================== */}
      {/* ⭐ BACK BUTTON */}
      {/* ======================== */}
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Quay lại
      </button>

      {/* ======================== */}
      {/* ⭐ RETURN MODAL */}
      {/* ======================== */}
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
