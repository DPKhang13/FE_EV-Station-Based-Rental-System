import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import rentalStationService from "../../services/rentalStationService";
import maintenanceService from "../../services/maintenanceService";
import { orderService } from "../../services";
import api from "../../services/api";
import "./PopupNhanXe.css";

const PopupNhanChecking = ({ xe, onClose }) => {
  const { user } = useContext(AuthContext);

  // -------------------- STATE --------------------
  const [orderInfo, setOrderInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [hasIncidents, setHasIncidents] = useState(false);
  const [receiveSuccess, setReceiveSuccess] = useState(false);

  const [severity, setSeverity] = useState(() => localStorage.getItem("nhanChecking_severity") || "");
  const [description, setDescription] = useState(() => localStorage.getItem("nhanChecking_description") || "");
  const [cost, setCost] = useState(() => localStorage.getItem("nhanChecking_cost") || "");

  // -------------------- EFFECT: Lấy dữ liệu đơn hàng --------------------
  const fetchOrderPreview = async () => {
    const orderId = xe.order?.orderId || xe.orderId;
    if (!orderId) return console.error("⚠️ Không có orderId hợp lệ:", xe);

    try {
      setLoading(true);
      const { data } = await api.get(`/order/${orderId}/preview-return`);
      setOrderInfo(data);
      console.log("✅ [PopupNhanChecking] order preview:", data);
    } catch (err) {
      console.error("❌ Lỗi khi lấy preview-return:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderPreview();
  }, [xe]);

  // -------------------- EFFECT: Auto refresh khi chờ thanh toán --------------------
  useEffect(() => {
    if (orderInfo?.status !== "AWAIT_FINAL") return;
    const intervalId = setInterval(fetchOrderPreview, 5000);
    return () => clearInterval(intervalId);
  }, [orderInfo?.status]);

  // -------------------- EFFECT: Lưu form tạm --------------------
  useEffect(() => {
    localStorage.setItem("nhanChecking_severity", severity);
    localStorage.setItem("nhanChecking_description", description);
    localStorage.setItem("nhanChecking_cost", cost);
  }, [severity, description, cost]);

  // -------------------- 🚨 Gửi báo cáo sự cố --------------------
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

  // -------------------- 💰 Gửi yêu cầu thanh toán --------------------
  const handleRequestPayment = async () => {
    const orderId = xe.order?.orderId || xe.orderId;
    if (!orderId) return alert("⚠️ Không tìm thấy orderId hợp lệ!");

    try {
      setSending(true);
      const payload = {
        note: "Yêu cầu thanh toán sau kiểm tra xe",
        processedBy: user?.userId || "unknown",
      };

      const { data } = await orderService.return(orderId, payload);
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

  // -------------------- 🚗 Hoàn tất nhận xe --------------------
  const handleCompleteReceive = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await maintenanceService.getAllIncidents();

      const relatedIncidents = data.filter(
        (i) =>
          (i.vehicleId === xe.id || i.vehicleId === xe.vehicleId) &&
          i.occurredOn === today
      );

      setHasIncidents(relatedIncidents.length > 0);
      setShowConfirmPopup(true);
    } catch (err) {
      console.error("❌ Lỗi khi kiểm tra sự cố:", err);
      alert("Không thể kiểm tra sự cố!");
    }
  };

  // -------------------- 🧾 Xử lý lựa chọn từ popup --------------------
  const handleConfirmChoice = async (choice) => {
    setShowConfirmPopup(false);
    const newStatus = choice === "MAINTENANCE" ? "MAINTENANCE" : "AVAILABLE";

    try {
      await rentalStationService.updateVehicleStatus(xe.id || xe.vehicleId, {
        status: newStatus,
        battery: xe.pin || 100,
      });
      setReceiveSuccess(true);
    } catch (err) {
      console.error("❌ Lỗi khi cập nhật trạng thái xe:", err);
      alert("Không thể cập nhật trạng thái xe!");
    }
  };

  // -------------------- 🔄 Đóng popup chính --------------------
  const handleCloseAndRefresh = () => {
    onClose();
    window.location.reload();
  };

  // -------------------- 🖼️ Giao diện --------------------
  return (
    <div className="popup-overlay">
      <div className="popup-content popup-maintenance">
        {/* Header */}
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
            <h3>📦 Thông tin đơn hàng</h3>
            <ul>
              <li><strong>Mã đơn:</strong> {orderInfo.orderId}</li>
              <li><strong>Xe ID:</strong> {orderInfo.vehicleId}</li>
              <li><strong>Trạng thái:</strong> {orderInfo.status}</li>
              <li><strong>Tổng tiền:</strong> {orderInfo.totalPrice?.toLocaleString()}₫</li>
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

            <button onClick={handleReportIncident} className="btn-pay" disabled={sending}>
              {sending ? "🔄 Đang gửi..." : "🚨 Gửi báo cáo sự cố"}
            </button>
          </>
        )}

        <hr />

        {/* Nút thanh toán / chờ thanh toán */}
        {!done ? (
          orderInfo?.status === "AWAIT_FINAL" ? (
            <button className="btn-check" disabled>
              ⏳ Vui lòng chờ khách hàng thanh toán...
            </button>
          ) : orderInfo?.status === "COMPLETED" ? (
            <button className="btn-check" disabled style={{ backgroundColor: "#28a745" }}>
              ✅ Đã hoàn tất nhận xe
            </button>
          ) : (
            <button onClick={handleRequestPayment} className="btn-check" disabled={sending}>
              Gửi yêu cầu thanh toán khách hàng
            </button>
          )
        ) : (
          <p style={{ color: "green" }}>✅ Yêu cầu thanh toán đã được gửi thành công.</p>
        )}

        {/* Footer */}
        <div className="popup-buttons">
          <button onClick={handleCloseAndRefresh} className="btn-cancel">Đóng</button>
        </div>
      </div>

      {/* Popup xác nhận */}
      {showConfirmPopup && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <h3>Hoàn tất nhận xe</h3>
            <p>
              {hasIncidents
                ? "Xe có sự cố hôm nay. Bạn muốn chuyển xe sang trạng thái nào?"
                : "Xe không có sự cố. Bạn muốn chuyển xe sang trạng thái nào?"}
            </p>
            <div className="confirm-actions">
              {hasIncidents && (
                <button className="btn-maintenance" onClick={() => handleConfirmChoice("MAINTENANCE")}>
                  Bảo trì
                </button>
              )}
              <button className="btn-available" onClick={() => handleConfirmChoice("AVAILABLE")}>
                Có sẵn
              </button>
              <button className="btn-cancel-popup" onClick={() => setShowConfirmPopup(false)}>
                ❌ Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup thông báo thành công */}
      {receiveSuccess && (
        <div className="confirm-overlay">
          <div className="confirm-box" style={{ borderTop: "6px solid #28a745" }}>
            <h3 style={{ color: "#28a745" }}>✅ Đã nhận xe thành công!</h3>
            <p>Xe đã được cập nhật trạng thái mới.</p>
            <button
              className="btn-available"
              onClick={() => {
                setReceiveSuccess(false);
                onClose();
                window.location.reload();
              }}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PopupNhanChecking;
