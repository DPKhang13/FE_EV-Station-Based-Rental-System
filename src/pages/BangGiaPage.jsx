import React from "react";
import "./BangGiaPage.css";

export default function BangGiaPage() {
  const carPricing = [
    { seat: 4, variant: "Air", daily: "1.000.000đ", late: "240.000đ", holiday: "1.250.000đ" },
    { seat: 4, variant: "Plus", daily: "1.200.000đ", late: "300.000đ", holiday: "1.500.000đ" },
    { seat: 4, variant: "Pro", daily: "1.400.000đ", late: "350.000đ", holiday: "1.750.000đ" },
    { seat: 7, variant: "Air", daily: "2.000.000đ", late: "450.000đ", holiday: "2.500.000đ" },
    { seat: 7, variant: "Plus", daily: "2.200.000đ", late: "540.000đ", holiday: "2.750.000đ" },
    { seat: 7, variant: "Pro", daily: "2.500.000đ", late: "600.000đ", holiday: "3.100.000đ" },
  ];

  const servicePricing = [
    { name: "Bồi thường hư xe", price: "500.000đ", desc: "Xe bị hư do khách", status: "Active" },
    { name: "Bồi thường trầy xe", price: "300.000đ", desc: "Xe bị trầy nhẹ", status: "Active" },
    { name: "Bồi thường xe dơ", price: "100.000đ", desc: "Xe bẩn cần vệ sinh", status: "Active" },
    { name: "Phạt nguội", price: "50.000đ", desc: "Đóng hộ tiền phạt", status: "Active" },
  ];

  const handleAdd = (type) => {
    alert(`Thêm mới ${type === "car" ? "bảng giá thuê xe" : "dịch vụ"}`);
  };

  const handleEdit = (item) => {
    alert(`Chỉnh sửa: ${item.name || item.variant}`);
  };

  const handleDelete = (item) => {
    alert(`Xóa: ${item.name || item.variant}`);
  };

  return (
    <div className="banggia-container">
      {/* === BẢNG GIÁ THUÊ XE === */}
      <div className="table-header">
        <h1 className="page-title">Bảng giá thuê xe</h1>
        <button className="btn add" onClick={() => handleAdd("car")}>+ Thêm mới</button>
      </div>

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
          {carPricing.map((item, i) => (
            <tr key={i}>
              <td>{item.seat}</td>
              <td>{item.variant}</td>
              <td>{item.daily}</td>
              <td>{item.late}</td>
              <td>{item.holiday}</td>
              <td>
                <button className="btn edit" onClick={() => handleEdit(item)}>Sửa</button>
                <button className="btn delete" onClick={() => handleDelete(item)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* === BẢNG GIÁ DỊCH VỤ KHÁC === */}
      <div className="table-header mt-40">
        <h1 className="page-title">Bảng giá dịch vụ khác</h1>
        <button className="btn add" onClick={() => handleAdd("service")}>+ Thêm mới</button>
      </div>

      <table className="pricing-table">
        <thead>
          <tr>
            <th>Tên dịch vụ</th>
            <th>Giá mặc định</th>
            <th>Mô tả</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {servicePricing.map((svc, i) => (
            <tr key={i}>
              <td>{svc.name}</td>
              <td>{svc.price}</td>
              <td>{svc.desc}</td>
              <td>
                <span className={`status-badge ${svc.status === "Active" ? "active" : "inactive"}`}>
                  {svc.status}
                </span>
              </td>
              <td>
                <button className="btn edit" onClick={() => handleEdit(svc)}>Sửa</button>
                <button className="btn delete" onClick={() => handleDelete(svc)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
