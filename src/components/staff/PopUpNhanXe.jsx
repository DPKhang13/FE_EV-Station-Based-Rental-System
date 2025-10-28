const PopupNhanXe = ({ xe, onClose }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Nhận xe trả: {xe.ten}</h2>
        <p>Khách hàng: <strong>{xe.khachHang}</strong></p>

        <label>Ghi chú tình trạng xe:</label>
        <textarea placeholder="Ví dụ: xe bị trầy nhẹ, pin còn 60%"></textarea>

        <div className="popup-buttons">
          <button onClick={onClose}>Hủy</button>
          <button className="btn-confirm">Hoàn tất nhận xe</button>
        </div>
      </div>
    </div>
  );
};
export default PopupNhanXe;
