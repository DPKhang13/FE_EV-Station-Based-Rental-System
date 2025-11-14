import React from 'react'
import { useNavigate } from "react-router-dom";
const PopupDatTruoc = ({ xe, onClose }) => {
  const navigate = useNavigate();

  const handleConfirm = () => {
    navigate("/staff/xacthuc", { state: { xe } });
  };

  return (
    <div className="popup-overlay">
      <div className="popup">
        <h2>🚗 Xe {xe.ten}</h2>
        <p>Biển số: {xe.bienSo}</p>
        <p className="popup-message">Vui lòng đi đến quản lí đơn hàng để tiến hành thủ tục bàn giao.</p>
        <div className="popup-buttons">
          <button className="btn-closes" onClick={onClose}>
            Đóng
          </button>
          <button className="btn-confirms" onClick={handleConfirm}>
            Đồng ý
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupDatTruoc
