import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api"; // axios instance

const OrderDetailCusPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [orderDetails, setOrderDetails] = useState([]);
  const [orderStatus, setOrderStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [showPopup, setShowPopup] = useState(false); // ✅ popup state

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/order-details/order/${orderId}`);
      const details = Array.isArray(res)
        ? res
        : Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];

      console.log("✅ Parsed order details:", details);
      setOrderDetails(details);

      if (details.length > 0 && details[0].status) {
        setOrderStatus(details[0].status.toUpperCase());
      }
    } catch (err) {
      console.error("❌ Lỗi khi tải chi tiết đơn:", err);
      setError("Không thể tải thông tin chi tiết đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  // ✅ Gọi API thanh toán
    const handlePayment = async (paymentType) => {
    if (!orderId) return alert("Không tìm thấy mã đơn hàng!");

    try {
      setProcessing(true);
      console.log("💳 Bắt đầu thanh toán:", { orderId, paymentType });

      const payload = {
        orderId,
        method: "VNPay",
        paymentType,
      };

      const res = await api.post("/payment/url", payload);
      console.log("✅ Kết quả API:", res);

      // ✅ Trường hợp interceptor đã unwrap => res chính là data
      const paymentUrl =
        res?.paymentUrl || // interceptor trả data
        res?.data?.paymentUrl || // axios gốc
        "";

      if (paymentUrl && typeof paymentUrl === "string") {
        console.log("🌍 Redirecting to:", paymentUrl);
        window.location.href = paymentUrl;
 // ✅ mở tab mới (hoặc dùng location.href nếu muốn)
      } else {
        console.warn("⚠️ Không tìm thấy paymentUrl trong response:", res);
        alert("Không nhận được link thanh toán từ server!");
      }
    } catch (err) {
      console.error("❌ Lỗi khi tạo thanh toán:", err);
      alert("Không thể tạo thanh toán. Vui lòng thử lại sau.");
    } finally {
      setProcessing(false);
      setShowPopup(false);
    }
  };


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

  // ✅ Giả sử đơn hàng có 1 chi tiết xe (có thể điều chỉnh)
  const detail = orderDetails[0] || {};
  const totalPrice = detail.price || 0;
  const deposit = totalPrice * 0.3; // ví dụ tiền cọc = 30%

  return (
    <div className="order-detail-page">
      <h1>Chi tiết đơn hàng</h1>
      <p><strong>Mã đơn hàng:</strong> {orderId}</p>
      <p><strong>Trạng thái:</strong> {orderStatus || "N/A"}</p>

      {orderDetails.length === 0 ? (
        <p>Không có dữ liệu chi tiết cho đơn hàng này.</p>
      ) : (
        <table className="order-detail-table">
          <thead>
            <tr>
              <th>Mã chi tiết</th>
              <th>Xe</th>
              <th>Loại</th>
              <th>Thời gian thuê</th>
              <th>Giá</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {orderDetails.map((d) => (
              <tr key={d.detailId}>
                <td>{d.detailId}</td>
                <td>{d.vehicleId}</td>
                <td>{d.type}</td>
                <td>
                  {new Date(d.startTime).toLocaleString("vi-VN")} -{" "}
                  {new Date(d.endTime).toLocaleString("vi-VN")}
                </td>
                <td>{d.price?.toLocaleString("vi-VN")} VND</td>
                <td>{d.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* --- Nút mở popup --- */}
      <div style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
        <button className="btn-back" onClick={() => navigate(-1)}>⬅ Quay lại</button>
        <button
          onClick={() => setShowPopup(true)}
          disabled={processing}
          style={{
            background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
            color: "white",
            border: "none",
            padding: "12px 20px",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Thanh toán ngay
        </button>
      </div>

      {/* --- Popup xác nhận thanh toán --- */}
      {showPopup && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "12px",
              width: "400px",
              boxShadow: "0 0 10px rgba(0,0,0,0.3)",
              textAlign: "center",
            }}
          >
            <h2>🧾 Xác nhận thanh toán</h2>
            <p><strong>Xe:</strong> {detail.vehicleId || "N/A"}</p>
            <p><strong>Ngày bắt đầu:</strong> {detail.startTime ? new Date(detail.startTime).toLocaleString("vi-VN") : "N/A"}</p>
            <p><strong>Ngày trả dự kiến:</strong> {detail.endTime ? new Date(detail.endTime).toLocaleString("vi-VN") : "N/A"}</p>
            <p><strong>Tiền cọc:</strong> {deposit.toLocaleString("vi-VN")} VND</p>
            <p><strong>Tổng tiền:</strong> {totalPrice.toLocaleString("vi-VN")} VND</p>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
              <button
                onClick={() => handlePayment(1)}
                style={{
                  flex: 1,
                  marginRight: "8px",
                  background: "#f59e0b",
                  color: "white",
                  border: "none",
                  padding: "10px",
                  borderRadius: "8px",
                  fontWeight: "600",
                }}
              >
                💰 Thanh toán cọc
              </button>
              <button
                onClick={() => handlePayment(2)}
                style={{
                  flex: 1,
                  marginLeft: "8px",
                  background: "#16a34a",
                  color: "white",
                  border: "none",
                  padding: "10px",
                  borderRadius: "8px",
                  fontWeight: "600",
                }}
              >
                💳 Thanh toán toàn bộ
              </button>
            </div>

            <button
              onClick={() => setShowPopup(false)}
              style={{
                marginTop: "16px",
                background: "transparent",
                border: "none",
                color: "#555",
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              Huỷ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailCusPage;
