import { useState } from "react";
import orderService from "../../services/orderService";
import rentalStationService from "../../services/rentalStationService"; // ✅ import service
import "./PopupNhanXe.css";

const PopupNhanXe = ({ xe, onClose }) => {
  const [orderInfo, setOrderInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [readyToCheck, setReadyToCheck] = useState(false);

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
      setReadyToCheck(true);
    } catch (error) {
      console.error("❌ Lỗi khi gọi API trả xe:", error);
      alert("Không thể lấy thông tin trả xe!");
    } finally {
      setLoading(false);
    }
  };

  // 🚘 Gọi API cập nhật trạng thái xe thành CHECKING
  const handleCheckCar = async () => {
    try {
      setChecking(true);
      alert("🔧 Đang tiến hành kiểm tra xe...");

      // Gọi API cập nhật status
      await rentalStationService.updateVehicleStatus(xe.vehicleId || xe.id, {
        status: "CHECKING",
        battery: xe.pin || "100", // ✅ dùng battery từ xe, nếu chưa có thì mặc định 100%
      });

      alert("✅ Xe đã được cập nhật trạng thái CHECKING!");
      setReadyToCheck(false);
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật trạng thái xe:", error);
      alert("Không thể cập nhật trạng thái xe!");
    } finally {
      setChecking(false);
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

            {/* 🚘 Nút kiểm tra xe */}
            {readyToCheck && (
              <button
                onClick={handleCheckCar}
                className="btn-check"
                disabled={checking}
              >
                {checking ? "🔄 Đang cập nhật..." : "🚘 Tiến hành kiểm tra xe"}
              </button>
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
