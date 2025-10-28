import React, { useState } from "react";

const PopupChoThue = ({ xe, onClose }) => {
  const [form, setForm] = useState({
    hoTen: "",
    cccd: "",
    blx: "",
    thoiGianThue: "",
    ghiChu: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!form.hoTen || !form.cccd || !form.blx || !form.thoiGianThue) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    // Giả lập gọi API / cập nhật trạng thái xe
    console.log("Dữ liệu cho thuê:", { xe, ...form });
    alert(`Xe ${xe.ten} đã được cho thuê cho ${form.hoTen}!`);
    onClose();
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Cho thuê xe: {xe.ten}</h2>
        <p>Biển số: {xe.bienSo}</p>

        <label>Họ tên khách hàng:</label>
        <input
          type="text"
          name="hoTen"
          value={form.hoTen}
          onChange={handleChange}
          placeholder="Nhập họ tên khách hàng"
        />

        <label>CCCD / CMND:</label>
        <input
          type="text"
          name="cccd"
          value={form.cccd}
          onChange={handleChange}
          placeholder="Nhập số CCCD/CMND"
        />

        <label>Số giấy phép lái xe (BLX):</label>
        <input
          type="text"
          name="blx"
          value={form.blx}
          onChange={handleChange}
          placeholder="Nhập số BLX"
        />

        <label>Thời gian thuê:</label>
        <input
          type="datetime-local"
          name="thoiGianThue"
          value={form.thoiGianThue}
          onChange={handleChange}
        />

        <label>Ghi chú tình trạng xe (nếu có):</label>
        <textarea
          name="ghiChu"
          value={form.ghiChu}
          onChange={handleChange}
          placeholder="Ví dụ: xe trầy nhẹ, pin còn 90%..."
        />

        <div className="popup-buttons">
          <button onClick={onClose}>Hủy</button>
          <button className="btn-confirm" onClick={handleSubmit}>
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupChoThue;
