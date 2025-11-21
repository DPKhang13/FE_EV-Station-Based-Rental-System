import React, { useState } from "react";
import "./AdminBangGiaPage.css";

const AdminBangGiaPage = () => {
  // Dữ liệu bảng giá thuê xe
  const [rentalPricing, setRentalPricing] = useState([
    { type: "B-SUV", dailyPrice: 900000, lateFee: 200000, holidayPrice: 1200000 },
    { type: "C-SUV", dailyPrice: 1100000, lateFee: 260000, holidayPrice: 1400000 },
    { type: "D-SUV", dailyPrice: 1300000, lateFee: 320000, holidayPrice: 1650000 },
    { type: "E-SUV", dailyPrice: 1800000, lateFee: 400000, holidayPrice: 2200000 },
    { type: "F-SUV", dailyPrice: 2000000, lateFee: 450000, holidayPrice: 2500000 },
    { type: "G-SUV", dailyPrice: 2300000, lateFee: 520000, holidayPrice: 2900000 }
  ]);

  // Dữ liệu bảng giá dịch vụ
  const [servicePricing, setServicePricing] = useState([
    {
      category: "Phí giao thông",
      services: [
        { description: "Phí giao thông cơ bản", price: 50000 },
        { description: "Phí giao thông cơ bản", price: 60000 },
        { description: "Phí giao thông giờ cao điểm", price: 70000 },
        { description: "Phụ phí điều kiện giao thông đặc biệt", price: 100000 }
      ]
    },
    {
      category: "Vệ sinh",
      services: [
        { description: "Vệ sinh nội thất", price: 80000 },
        { description: "Vệ sinh toàn bộ xe", price: 100000 },
        { description: "Dịch vụ vệ sinh sâu", price: 120000 },
        { description: "Vệ sinh nội thất", price: 1110000 }
      ]
    },
    {
      category: "Bảo trì",
      services: [
        { description: "Bảo trì thường xuyên", price: 150000 },
        { description: "Bảo trì hệ thống điện", price: 200000 },
        { description: "Bảo trì toàn diện xe", price: 250000 }
      ]
    },
    {
      category: "Sửa chữa",
      services: [
        { description: "Sửa chữa nhỏ", price: 180000 },
        { description: "Sửa chữa nhỏ", price: 180000 },
        { description: "Sửa chữa tiêu chuẩn", price: 300000 },
        { description: "Sửa chữa lớn", price: 500000 }
      ]
    }
  ]);

  // Format số tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "₫";
  };

  return (
    <div className="admin-banggia-page">
      <div className="banggia-header">
        <h1>BẢNG GIÁ</h1>
      </div>

      {/* Bảng giá thuê xe */}
      <div className="pricing-table-section">
        <h2 className="section-title">BẢNG GIÁ THUÊ XE</h2>
        <div className="table-container">
          <table className="pricing-table">
            <thead>
              <tr>
                <th>LOẠI XE</th>
                <th>GIÁ / NGÀY</th>
                <th>PHỤ PHÍ TRẺ / NGÀY</th>
                <th>GIÁ NGÀY LỄ</th>
              </tr>
            </thead>
            <tbody>
              {rentalPricing.map((item, index) => (
                <tr key={index}>
                  <td className="car-type">{item.type}</td>
                  <td className="price">{formatPrice(item.dailyPrice)}</td>
                  <td className="price">{formatPrice(item.lateFee)}</td>
                  <td className="price">{formatPrice(item.holidayPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bảng giá dịch vụ */}
      <div className="pricing-table-section">
        <h2 className="section-title">BẢNG GIÁ DỊCH VỤ</h2>
        <div className="table-container">
          <table className="pricing-table">
            <thead>
              <tr>
                <th>LOẠI DỊCH VỤ</th>
                <th>MÔ TẢ</th>
                <th>GIÁ</th>
              </tr>
            </thead>
            <tbody>
              {servicePricing.map((category, catIndex) =>
                category.services.map((service, servIndex) => (
                  <tr key={`${catIndex}-${servIndex}`}>
                    <td className="service-type">
                      {servIndex === 0 ? category.category : ""}
                    </td>
                    <td className="description">{service.description}</td>
                    <td className="price">{formatPrice(service.price)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminBangGiaPage;

