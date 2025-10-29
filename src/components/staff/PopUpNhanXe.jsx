import React, { useState } from "react";
import maintenanceService from "../../services/maintenanceService";
import vehicleService from "../../services/vehicleService";
import "./PopupNhanXe.css";

const PopupNhanXe = ({ xe, onClose }) => {
  const maintenanceOptions = [
    { id: 1, description: "Kiểm tra hệ thống pin", cost: 500000 },
    { id: 2, description: "Bảo dưỡng phanh", cost: 350000 },
    { id: 3, description: "Thay lốp", cost: 800000 },
    { id: 4, description: "Hiệu chỉnh động cơ điện", cost: 600000 },
    { id: 5, description: "Vệ sinh cổng sạc", cost: 200000 },
    { id: 6, description: "Vệ sinh nội thất", cost: 150000 },
    { id: 7, description: "Cập nhật phần mềm", cost: 100000 },
    { id: 8, description: "Kiểm tra hệ thống treo", cost: 450000 },
    { id: 9, description: "Thay đèn pha", cost: 700000 },
    { id: 10, description: "Kiểm tra tổng thể", cost: 900000 },
  ];

  const [selectedItems, setSelectedItems] = useState([]);
  const [isPaid, setIsPaid] = useState(false); // ✅ trạng thái đã thanh toán
  const [loading, setLoading] = useState(false);

  const handleToggle = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const totalCost = selectedItems
    .map((id) => maintenanceOptions.find((m) => m.id === id)?.cost || 0)
    .reduce((a, b) => a + b, 0);

  const handleConfirm = async () => {
    try {
      setLoading(true);

      // Nếu chưa thanh toán, không cho xác nhận
      if (!isPaid) {
        alert("⚠️ Vui lòng xác nhận rằng khách hàng đã thanh toán trước khi hoàn tất!");
        return;
      }

      // 🟢 Không tick gì -> chỉ cập nhật trạng thái Available
      if (selectedItems.length === 0) {
        await vehicleService.updateStatus(xe.id, { status: "Available" });
        alert(`✅ Xe ${xe.ten} đã được cập nhật trạng thái thành "Có sẵn".`);
        onClose();
        return;
      }

      // 🔵 Có tick -> tạo đơn bảo trì + chuyển sang "Maintenance"
      for (const id of selectedItems) {
        const option = maintenanceOptions.find((m) => m.id === id);
        const payload = {
          vehicleId: xe.id,
          description: option.description,
          date: new Date().toISOString().split("T")[0],
          cost: option.cost,
        };

        await maintenanceService.create(payload);
        console.log("Đã tạo đơn:", payload);
      }

      await vehicleService.updateStatus(xe.id, { status: "Maintenance" });

      alert(
        `🛠️ Đã tạo ${selectedItems.length} đơn bảo trì cho xe ${xe.ten}.\n` +
          `Tổng phí phát sinh: ${totalCost.toLocaleString()} ₫\n` +
          `Trạng thái xe đã chuyển thành "Bảo trì".`
      );
      onClose();
    } catch (error) {
      console.error("❌ Lỗi khi xử lý nhận xe:", error);
      alert("Không thể cập nhật dữ liệu, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content popup-maintenance">
        <h2>🚗 Nhận xe trả: {xe.ten}</h2>
        <p>Biển số: <strong>{xe.bienSo}</strong></p>
        <p>Hãng: <strong>{xe.hang}</strong></p>
        <hr />

        <h3>🧾 Chọn hạng mục bảo trì cần tạo (nếu có)</h3>

        <div className="checklist-container">
          {maintenanceOptions.map((item) => (
            <label
              key={item.id}
              className={`check-item ${
                selectedItems.includes(item.id) ? "checked" : ""
              }`}
            >
              <input
                type="checkbox"
                checked={selectedItems.includes(item.id)}
                onChange={() => handleToggle(item.id)}
              />
              <span>{item.description}</span>
              <span className="cost">{item.cost.toLocaleString()} ₫</span>
            </label>
          ))}
        </div>

        <div className="total">
          <strong>Tổng chi phí phát sinh:</strong>{" "}
          <span className="cost">{totalCost.toLocaleString()} ₫</span>
        </div>

        <div className="payment-confirm">
          <label>
            <input
              type="checkbox"
              checked={isPaid}
              onChange={(e) => setIsPaid(e.target.checked)}
            />
            ✅ Xác nhận khách hàng đã thanh toán
          </label>
        </div>

        <div className="popup-buttons">
          <button onClick={onClose} className="btn-cancel">
            Hủy
          </button>
          <button
            className="btn-confirm"
            onClick={handleConfirm}
            disabled={loading || !isPaid} // 🔒 Chỉ bật khi đã thanh toán
          >
            {loading ? "Đang xử lý..." : "Hoàn tất nhận xe"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupNhanXe;
