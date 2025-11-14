import React, { useEffect, useState } from "react";
import "./BangGiaPage.css";
import axios from "axios";

export default function BangGiaPage() {
  const [carPricing, setCarPricing] = useState([]);
  const [loading, setLoading] = useState(true);

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
    alert("Thêm mới bảng giá thuê xe");
  };

  const handleEdit = (item) => {
    alert(`Chỉnh sửa: ${item.variant}`);
  };

  const handleDelete = (item) => {
    alert(`Xóa: ${item.variant}`);
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
    </div>
  );
}
