import React, { useEffect, useState } from "react";
import "./BangGiaPage.css";
import axios from "axios";

export default function BangGiaPage() {
  const [carPricing, setCarPricing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
const [formData, setFormData] = useState({
  dailyPrice: 0,
  lateFeePerDay: 0,
  holidayPrice: 0
});
const [showAddModal, setShowAddModal] = useState(false);
const [newPricing, setNewPricing] = useState({
  seatCount: 0,
  variant: "",
  dailyPrice: 0,
  lateFreePerDayPrice: 0, // ✅ đổi key này
  holidayPrice: 0
});




  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/pricing-rules");
        setCarPricing(res.data);
      } catch (error) {
        console.error("Lỗi khi tải bảng giá:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPricing();
  }, []);

  const handleAdd = () => {
  setShowAddModal(true);
  setNewPricing({
    seatCount: 0,
    variant: "",
    dailyPrice: 0,
    lateFeePerDay: 0,
    holidayPrice: 0
  });
};

 const handleEdit = (item) => {
  setEditingItem(item);
  setFormData({
    dailyPrice: item.dailyPrice,
    lateFeePerDay: item.lateFeePerDay,
    holidayPrice: item.holidayPrice
  });
};
const handleUpdate = async () => {
  try {
    const res = await axios.put(
      `http://localhost:8080/api/pricing-rules/${editingItem.seatCount}/${editingItem.variant}`,
      formData
    );

    alert("✅ Cập nhật bảng giá thành công!");
    setEditingItem(null);

    // Reload lại bảng
    const refreshed = await axios.get("http://localhost:8080/api/pricing-rules");
    setCarPricing(refreshed.data);
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật:", error);
    alert("Cập nhật thất bại!");
  }
};



  const handleDelete = async (item) => {
  const ok = window.confirm(
    `Bạn có chắc chắn muốn xóa bảng giá cho xe ${item.variant} (${item.seatCount} chỗ)?`
  );
  if (!ok) return;

  try {
    await axios.delete(`http://localhost:8080/api/pricing-rules/delete/${item.pricingRuleId}`);
    alert("🗑️ Đã xóa bảng giá thành công!");

    // Cập nhật lại danh sách
    const refreshed = await axios.get("http://localhost:8080/api/pricing-rules");
    setCarPricing(refreshed.data);
  } catch (err) {
    console.error("❌ Lỗi khi xóa:", err);
    alert("Không thể xóa bảng giá. Vui lòng thử lại!");
  }
};
const handleCreatePricing = async () => {
  try {
    await axios.post("http://localhost:8080/api/pricing-rules/create", newPricing);
    alert("✅ Thêm bảng giá mới thành công!");
    setShowAddModal(false);

    // Reload lại dữ liệu
    const refreshed = await axios.get("http://localhost:8080/api/pricing-rules");
    setCarPricing(refreshed.data);
  } catch (error) {
    console.error("❌ Lỗi khi thêm bảng giá:", error);
    alert("Không thể thêm bảng giá. Vui lòng thử lại!");
  }
};


  const formatMoney = (number) =>
    number.toLocaleString("vi-VN") + "đ";

  return (
    <div className="banggia-container">
      <div className="table-header">
        <h1 className="page-title">Bảng giá thuê xe</h1>
        <button className="btn add" onClick={handleAdd}>+ Thêm mới</button>
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <table className="pricing-table">
          <thead>
            <tr>
              <th>Số ghế</th>
              <th>Biến thể</th>
              <th>Giá / ngày</th>
              <th>Phụ phí trễ / ngày</th>
              <th>Giá ngày lễ</th>
              <th>Hành động</th>
            </tr>
          </thead>

          <tbody>
            {carPricing.map((item) => (
              <tr key={item.pricingRuleId}>
                <td>{item.seatCount}</td>
                <td>{item.variant}</td>
                <td>{formatMoney(item.dailyPrice)}</td>
                <td>{formatMoney(item.lateFeePerDay)}</td>
                <td>{formatMoney(item.holidayPrice)}</td>
                <td>
                  <button className="btn edit" onClick={() => handleEdit(item)}>Sửa</button>
                  <button className="btn delete" onClick={() => handleDelete(item)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {editingItem && (
  <div className="modal-overlay">
    <div className="modal">
      <h2>✏️ Cập nhật giá thuê xe</h2>
      <p>
        <strong>{editingItem.variant}</strong> - {editingItem.seatCount} chỗ
      </p>

      <label>Giá / ngày</label>
      <input
        type="number"
        value={formData.dailyPrice}
        onChange={(e) =>
          setFormData({ ...formData, dailyPrice: Number(e.target.value) })
        }
      />

      <label>Phụ phí trễ / ngày</label>
      <input
        type="number"
        value={formData.lateFeePerDay}
        onChange={(e) =>
          setFormData({ ...formData, lateFeePerDay: Number(e.target.value) })
        }
      />

      <label>Giá ngày lễ</label>
      <input
        type="number"
        value={formData.holidayPrice}
        onChange={(e) =>
          setFormData({ ...formData, holidayPrice: Number(e.target.value) })
        }
      />

      <div className="modal-actions">
        <button className="btn btn-primary" onClick={handleUpdate}>
          💾 Lưu thay đổi
        </button>
        <button className="btn btn-danger" onClick={() => setEditingItem(null)}>
          ✖ Hủy
        </button>
      </div>
    </div>
  </div>
)}


{showAddModal && (
  <div className="modal-overlay">
    <div className="modal">
      <h2>➕ Thêm mới bảng giá thuê xe</h2>
<input
  type="number"
  placeholder="Nhập số ghế..."
  value={newPricing.seatCount === 0 ? "" : newPricing.seatCount}
  onChange={(e) => {
    const val = e.target.value;
    setNewPricing({
      ...newPricing,
      seatCount: val === "" ? 0 : Number(val)
    });
  }}
/>

<input
  type="text"
  placeholder="Nhập biến thể..."
  value={newPricing.variant}
  onChange={(e) =>
    setNewPricing({ ...newPricing, variant: e.target.value })
  }
/>

<input
  type="number"
  placeholder="Giá / ngày..."
  value={newPricing.dailyPrice === 0 ? "" : newPricing.dailyPrice}
  onChange={(e) => {
    const val = e.target.value;
    setNewPricing({
      ...newPricing,
      dailyPrice: val === "" ? 0 : Number(val)
    });
  }}
/>

<input
  type="number"
  placeholder="Phụ phí trễ / ngày..."
  value={
    newPricing.lateFreePerDayPrice === 0
      ? ""
      : newPricing.lateFreePerDayPrice
  }
  onChange={(e) => {
    const val = e.target.value;
    setNewPricing({
      ...newPricing,
      lateFreePerDayPrice: val === "" ? 0 : Number(val)
    });
  }}
/>

<input
  type="number"
  placeholder="Giá ngày lễ..."
  value={newPricing.holidayPrice === 0 ? "" : newPricing.holidayPrice}
  onChange={(e) => {
    const val = e.target.value;
    setNewPricing({
      ...newPricing,
      holidayPrice: val === "" ? 0 : Number(val)
    });
  }}
/>


      <div className="modal-actions">
        <button className="btn btn-primary" onClick={handleCreatePricing}>
          ✅ Đồng ý thêm
        </button>
        <button className="btn btn-danger" onClick={() => setShowAddModal(false)}>
          ✖ Đóng
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
