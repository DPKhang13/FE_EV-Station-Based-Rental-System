import React, { useState } from "react";
import "./PopupDaXacThuc.css";

const PopupDaXacThuc = ({ xe, onClose }) => {
  const [image, setImage] = useState(null);
  const [tinhTrang, setTinhTrang] = useState({
    pin: xe.pin || "",
    lop: "Tốt",
    phanh: "Tốt",
    den: "Tốt",
    guong: "Đầy đủ",
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImage(URL.createObjectURL(file));
  };

  const handleChange = (field, value) => {
    setTinhTrang({ ...tinhTrang, [field]: value });
  };

  const handleConfirm = () => {
    if (!image) {
      alert("Vui lòng tải ảnh xe lên trước khi xác nhận!");
      return;
    }
    alert("✅ Đã bàn giao xe thành công!");
    onClose();
  };

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <h2 className="popup-title">Bàn giao xe: {xe.ten}</h2>
        <p className="popup-subtitle">Biển số: {xe.bienSo}</p>

        <div className="form-group">
          <label>Ảnh xe bàn giao:</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {image && (
            <img src={image} alt="Ảnh xe" className="preview-image" />
          )}
        </div>

        <div className="form-group">
          <label>Pin hiện tại (%):</label>
          <input
            type="number"
            value={tinhTrang.pin}
            onChange={(e) => handleChange("pin", e.target.value)}
            placeholder="Nhập % pin hiện tại"
          />
        </div>

        <div className="form-group">
          <label>Tình trạng lốp:</label>
          <select
            value={tinhTrang.lop}
            onChange={(e) => handleChange("lop", e.target.value)}
          >
            <option>Tốt</option>
            <option>Mòn</option>
            <option>Hư</option>
          </select>
        </div>

        <div className="form-group">
          <label>Tình trạng phanh:</label>
          <select
            value={tinhTrang.phanh}
            onChange={(e) => handleChange("phanh", e.target.value)}
          >
            <option>Tốt</option>
            <option>Yếu</option>
            <option>Hư</option>
          </select>
        </div>

        <div className="form-group">
          <label>Đèn xe:</label>
          <select
            value={tinhTrang.den}
            onChange={(e) => handleChange("den", e.target.value)}
          >
            <option>Tốt</option>
            <option>Hỏng</option>
          </select>
        </div>

        <div className="form-group">
          <label>Gương xe:</label>
          <select
            value={tinhTrang.guong}
            onChange={(e) => handleChange("guong", e.target.value)}
          >
            <option>Đầy đủ</option>
            <option>Thiếu</option>
          </select>
        </div>

        <div className="form-buttons">
          <button className="btn-cancel" onClick={onClose}>
            Hủy
          </button>
          <button className="btn-confirm" onClick={handleConfirm}>
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupDaXacThuc;
