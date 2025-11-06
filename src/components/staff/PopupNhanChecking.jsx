import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import rentalStationService from "../../services/rentalStationService";
import api from "../../services/api";
import "./PopupNhanXe.css";
import { orderService } from "../../services";

const PopupNhanChecking = ({ xe, onClose }) => {
  const { user } = useContext(AuthContext);
  const [orderInfo, setOrderInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  // 🔹 Lưu state người nhập tạm thời
  const [severity, setSeverity] = useState(() => localStorage.getItem("nhanChecking_severity") || "");
  const [description, setDescription] = useState(() => localStorage.getItem("nhanChecking_description") || "");
  const [cost, setCost] = useState(() => localStorage.getItem("nhanChecking_cost") || "");

  /** ================================
   * 📦 Lấy thông tin đơn hàng từ API preview-return
   * ================================ */
  const fetchOrderPreview = async () => {
    try {
      const orderId = xe.order?.orderId || xe.orderId;
      if (!orderId) {
        console.error("⚠️ Không có orderId hợp lệ:", xe);
        return;
      }

      const res = await api.get(`/order/${orderId}/preview-return`);
      const data = res?.data ?? res;
      setOrderInfo(data);
      console.log("✅ [PopupNhanChecking] order preview:", data);
    } catch (err) {
      console.error("❌ Lỗi khi lấy preview-return:", err);
    }
  };

  // Gọi API lần đầu
  useEffect(() => {
    fetchOrderPreview();
  }, [xe]);

  /** ================================
   * 🔁 Auto refresh khi trạng thái AWAIT_FINAL (chờ thanh toán)
   * ================================ */
  useEffect(() => {
    if (!orderInfo || orderInfo.status !== "AWAIT_FINAL") return;

    console.log("⏳ Bắt đầu auto-refresh: chờ khách hàng thanh toán...");
    const intervalId = setInterval(async () => {
      console.log("🔁 Kiểm tra trạng thái thanh toán...");
      await fetchOrderPreview();
    }, 5000); // 5 giây / lần

    return () => {
      console.log("🛑 Dừng auto-refresh khi popup đóng hoặc trạng thái đổi.");
      clearInterval(intervalId);
    };
  }, [orderInfo?.status]);

  /** ================================
   * 💾 Lưu localStorage khi thay đổi input
   * ================================ */
  useEffect(() => {
    localStorage.setItem("nhanChecking_severity", severity);
    localStorage.setItem("nhanChecking_description", description);
    localStorage.setItem("nhanChecking_cost", cost);
  }, [severity, description, cost]);

  /** ================================
   * 🚨 Gửi báo cáo sự cố
   * ================================ */
  const handleReportIncident = async () => {
    if (!severity || !description.trim()) {
      alert("⚠️ Vui lòng chọn mức độ và nhập mô tả sự cố!");
      return;
    }

    const incidentData = {
      vehicleId: xe.id || xe.vehicleId,
      stationId: user?.stationId || 1,
      description,
      severity,
      status: "OPEN",
      occurredOn: new Date().toISOString().split("T")[0],
      cost: Number(cost) || 0,
      reportedBy: user?.userId || "unknown",
    };

    try {
      setSending(true);
      await api.post("/incidents/create", incidentData);
      alert("✅ Báo cáo sự cố đã được gửi thành công!");
      await fetchOrderPreview();
    } catch (error) {
      console.error("❌ Lỗi khi gửi báo cáo sự cố:", error);
      alert("Không thể gửi báo cáo sự cố!");
    } finally {
      setSending(false);
    }
  };

  /** ================================
   * 💰 Gửi yêu cầu thanh toán khách hàng
   * ================================ */
  const handleRequestPayment = async () => {
    try {
      const orderId = xe.order?.orderId || xe.orderId;
      if (!orderId) {
        alert("⚠️ Không tìm thấy orderId hợp lệ!");
        return;
      }

      setSending(true);

      const returnData = {
        note: "Yêu cầu thanh toán sau kiểm tra xe",
        processedBy: user?.userId || "unknown",
      };

      const res = await orderService.return(orderId, returnData);
      const data = res?.data ?? res;
      console.log("✅ [PopupNhanChecking] API return thành công:", data);

      alert("✅ Yêu cầu thanh toán khách hàng đã được gửi thành công!");
      setDone(true);

      await fetchOrderPreview();
    } catch (err) {
      console.error("❌ Lỗi khi gửi yêu cầu thanh toán:", err);
      alert("Không thể gửi yêu cầu thanh toán!");
    } finally {
      setSending(false);
    }
  };

  /** ================================
   * 🖼️ Giao diện
   * ================================ */
  return (
    <div className="popup-overlay">
      <div className="popup-content popup-maintenance">
        <h2>🔧 Nhận xe kiểm tra: {xe.ten}</h2>
        <p>Biển số: <strong>{xe.bienSo}</strong></p>
        <p>Hãng: <strong>{xe.hang}</strong></p>
        <p>Pin hiện tại: <strong>{xe.pin}%</strong></p>
        <hr />

        {/* Thông tin đơn hàng */}
        {loading ? (
          <p>Đang tải thông tin đơn hàng...</p>
        ) : orderInfo ? (
          <div className="order-info">
            <h3>📦 Thông tin đơn hàng (preview-return)</h3>
            <ul>
              <li><strong>Mã đơn:</strong> {orderInfo.orderId}</li>
              <li><strong>Xe ID:</strong> {orderInfo.vehicleId}</li>
              <li><strong>Trạng thái:</strong> {orderInfo.status}</li>
              <li><strong>Thời gian bắt đầu:</strong> {orderInfo.startTime}</li>
              <li><strong>Thời gian kết thúc:</strong> {orderInfo.endTime}</li>
              <li><strong>Tổng tiền:</strong> {orderInfo.totalPrice?.toLocaleString()}₫</li>
              <li><strong>Phí phạt:</strong> {orderInfo.penaltyFee?.toLocaleString()}₫</li>
              <li><strong>Tiền cọc:</strong> {orderInfo.depositAmount?.toLocaleString()}₫</li>
              <li><strong>Còn lại phải trả:</strong> {orderInfo.remainingAmount?.toLocaleString()}₫</li>
            </ul>
          </div>
        ) : (
          <p>⚠️ Không tìm thấy thông tin đơn hàng!</p>
        )}

        <hr />

        {/* Form báo cáo sự cố */}
        {orderInfo?.status !== "AWAIT_FINAL" && orderInfo?.status !== "COMPLETED" && (
          <>
            <h3>📋 Báo cáo sự cố</h3>
            <p>{xe.ten} ({xe.bienSo})</p>
            <select
              className="input-select"
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
            >
              <option value="">Chọn mức độ</option>
              <option value="LOW">Thấp</option>
              <option value="MEDIUM">Trung bình</option>
              <option value="HIGH">Cao</option>
            </select>

            <textarea
              className="input-textarea"
              placeholder="Mô tả sự cố..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>

            <input
              className="input-text"
              type="number"
              placeholder="Nhập chi phí (VNĐ)"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />

            <button
              onClick={handleReportIncident}
              className="btn-pay"
              disabled={sending}
            >
              {sending ? "🔄 Đang gửi..." : "🚨 Gửi báo cáo sự cố"}
            </button>

            <hr />
          </>
        )}

        {/* Nút thanh toán / chờ thanh toán */}
        {!done ? (
          orderInfo?.status === "AWAIT_FINAL" ? (
            <button className="btn-check" disabled>
              ⏳ Vui lòng chờ sự thanh toán của khách hàng...
            </button>
          ) : orderInfo?.status === "COMPLETED" ? (
            <button className="btn-check" disabled style={{ backgroundColor: "#28a745" }}>
              ✅ Khách hàng đã thanh toán thành công
            </button>
          ) : (
            <button
              onClick={handleRequestPayment}
              className="btn-check"
              disabled={sending || done}
            >
              Gửi yêu cầu thanh toán khách hàng
            </button>
          )
        ) : (
          <p style={{ color: "green" }}>
            ✅ Yêu cầu thanh toán đã được gửi thành công.
          </p>
        )}

        <div className="popup-buttons">
          <button onClick={onClose} className="btn-cancel">Đóng</button>
        </div>
      </div>
    </div>
  );
};

export default PopupNhanChecking;
