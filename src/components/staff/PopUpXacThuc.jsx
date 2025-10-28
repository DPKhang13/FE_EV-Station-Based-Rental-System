import { useNavigate } from "react-router-dom";

const PopupXacThuc = ({ xe, onClose }) => {
  const navigate = useNavigate();
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Xác thực khách hàng cho xe: {xe.ten}</h2>
        <p>Khách hàng: <strong>{xe.khachHang}</strong></p>
        <p>Vui lòng xác thực khách hàng trước khi bàn giao xe.</p>

        <div className="popup-buttons">
          <button onClick={onClose}>Hủy</button>
          <button
            className="btn-confirm"
            onClick={() => {
              onClose();
              navigate("/staff/xacthuc");
            }}
          >
            Xác thực
          </button>
        </div>
      </div>
    </div>
  );
};
export default PopupXacThuc;
