import { useState } from "react";

const PopupNhanXe = ({ xe, onClose }) => {
  const [conditions, setConditions] = useState({
    den: false,
    guong: false,
    lop: false,
    thang: false,
    pin: false,
    giayToXe: false,
  });

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setConditions((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = () => {
    console.log("Tình trạng xe:", conditions);
    alert("Đã hoàn tất nhận xe!");
    onClose();
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Nhận xe trả: {xe.ten}</h2>
        <p>
          Khách hàng: <strong>{xe.khachHang}</strong>
        </p>

        <h3>Kiểm tra tình trạng xe:</h3>
        <div className="checklist">
          <label>
            <input
              type="checkbox"
              name="den"
              checked={conditions.den}
              onChange={handleCheckboxChange}
            />
            Đèn hoạt động bình thường
          </label>
          <label>
            <input
              type="checkbox"
              name="guong"
              checked={conditions.guong}
              onChange={handleCheckboxChange}
            />
            Gương còn nguyên vẹn
          </label>
          <label>
            <input
              type="checkbox"
              name="lop"
              checked={conditions.lop}
              onChange={handleCheckboxChange}
            />
            Lốp không xẹp / nứt
          </label>
          <label>
            <input
              type="checkbox"
              name="thang"
              checked={conditions.thang}
              onChange={handleCheckboxChange}
            />
            Thắng hoạt động tốt
          </label>
          <label>
            <input
              type="checkbox"
              name="pin"
              checked={conditions.pin}
              onChange={handleCheckboxChange}
            />
            Pin còn đủ điện
          </label>
          <label>
            <input
              type="checkbox"
              name="giayToXe"
              checked={conditions.giayToXe}
              onChange={handleCheckboxChange}
            />
            Giấy tờ xe đầy đủ
          </label>
        </div>

        <div className="popup-buttons">
          <button onClick={onClose}>Hủy</button>
          <button className="btn-confirm" onClick={handleSubmit}>
            Hoàn tất nhận xe
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupNhanXe;
