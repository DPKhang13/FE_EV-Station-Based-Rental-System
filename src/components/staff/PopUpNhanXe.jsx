import { useState } from "react";
import orderService from "../../services/orderService";
import "./PopupNhanXe.css";

const PopupNhanXe = ({ xe, onClose }) => {
  const [orderInfo, setOrderInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // 💳 Thanh toán (giả lập)
  const handlePayment = async () => {
    try {
      setPaymentLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setIsPaid(true);
      alert("💳 Thanh toán thành công!");
    } catch (error) {
      console.error("❌ Lỗi thanh toán:", error);
      alert("Không thể thực hiện thanh toán!");
    } finally {
      setPaymentLoading(false);
    }
  };

  // 📦 Gọi API lấy thông tin đơn trả xe
const handleGetReturnInfo = async () => {
  try {
    setLoading(true);
    const res = await orderService.get(xe.order.orderId);
    const data = res?.data ?? res;
    console.log("✅ Dữ liệu API:", data);

    if (!data || Object.keys(data).length === 0) {
      alert("⚠️ API không trả về dữ liệu!");
      return;
    }

    setOrderInfo(data);
  } catch (error) {
    console.error("❌ Lỗi khi gọi API trả xe:", error);
    alert("Không thể lấy thông tin trả xe!");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="popup-overlay">
      <div className="popup-content popup-maintenance">
        <h2>🚗 Nhận xe trả: {xe.ten}</h2>
        <p>
          Biển số: <strong>{xe.bienSo}</strong>
        </p>
        <p>
          Hãng: <strong>{xe.hang}</strong>
        </p>
        <hr />

        {/* 📋 Nút lấy thông tin đơn trả xe */}
        <button
          onClick={handleGetReturnInfo}
          className="btn-info"
          disabled={loading}
        >
          {loading ? "Đang tải..." : "📋 Lấy thông tin đơn trả xe"}
        </button>

        {/* Hiển thị thông tin đơn hàng */}
      {orderInfo && (
  <div className="order-info">
    <h3>📦 Thông tin đơn trả xe (chi tiết)</h3>

    {/* Cách 1: hiển thị rõ ràng từng trường chính */}
    <ul>
      <li><strong>Mã đơn:</strong> {orderInfo.orderId}</li>
      <li><strong>Xe ID:</strong> {orderInfo.vehicleId}</li>
      <li><strong>Thời gian bắt đầu:</strong> {orderInfo.startTime}</li>
      <li><strong>Thời gian kết thúc:</strong> {orderInfo.endTime}</li>
      <li><strong>Ngày tạo:</strong> {orderInfo.createdAt}</li>
      <li><strong>Trạng thái:</strong> {orderInfo.status}</li>
      <li><strong>Tổng tiền:</strong> {orderInfo.totalPrice?.toLocaleString()}₫</li>
      <li><strong>Phí phạt:</strong> {orderInfo.penaltyFee?.toLocaleString()}₫</li>
      <li><strong>Tiền cọc:</strong> {orderInfo.depositAmount?.toLocaleString()}₫</li>
      <li><strong>Thời gian dự kiến:</strong> {orderInfo.plannedHours} giờ</li>
      <li><strong>Thời gian thực tế:</strong> {orderInfo.actualHours} giờ</li>
      <li><strong>Mã giảm giá:</strong> {orderInfo.couponCode || "Không có"}</li>
      <li>
        <strong>Còn lại phải trả:</strong>{" "}
        <span style={{ color: "red" }}>
          {orderInfo.remainingAmount?.toLocaleString()}₫
        </span>
      </li>
    </ul>

    {/* Cách 2: nếu muốn xem toàn bộ JSON */}
    <pre style={{
      background: "#f6f8fa",
      padding: "12px",
      borderRadius: "8px",
      overflowX: "auto",
      fontSize: "13px"
    }}>
      {JSON.stringify(orderInfo, null, 2)}
    </pre>

    {/* 💳 Nút thanh toán */}
    <button
      onClick={handlePayment}
      className={`btn-pay ${isPaid ? "paid" : ""}`}
      disabled={paymentLoading || isPaid}
    >
      {isPaid
        ? "✅ Đã thanh toán"
        : paymentLoading
        ? "Đang thanh toán..."
        : "💳 Thanh toán phần còn lại"}
    </button>

    {isPaid && (
      <p style={{ color: "green", marginTop: "10px" }}>
        ✅ Thanh toán hoàn tất!
      </p>
    )}
  </div>
)}


        <div className="popup-buttons">
          <button onClick={onClose} className="btn-cancel">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupNhanXe;
