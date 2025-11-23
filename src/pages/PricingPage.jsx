import React, { useEffect, useState } from "react";
import { pricingRuleService } from '../services/pricingRuleService';
import api from '../services/api';
import "./PricingPage.css";

export default function PricingPage() {
  const [carPricing, setCarPricing] = useState([]);
  const [servicePricing, setServicePricing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serviceLoading, setServiceLoading] = useState(true);

  // ✅ Hàm sắp xếp từ B xuống (B, C, D, E, F, G)
  const sortPricingData = (data) => {
    return [...data].sort((a, b) => {
      const getOrder = (carmodel) => {
        const firstChar = carmodel?.charAt(0)?.toUpperCase() || '';
        const orderMap = { 'B': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5, 'G': 6 };
        return orderMap[firstChar] || 999;
      };
      return getOrder(a.carmodel) - getOrder(b.carmodel);
    });
  };

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const data = await pricingRuleService.getAll();
        setCarPricing(sortPricingData(data));
      } catch (error) {
        console.error("Lỗi khi tải bảng giá:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPricing();
  }, []);

  // ✅ Fetch bảng giá dịch vụ
  useEffect(() => {
    const fetchServicePricing = async () => {
      try {
        const data = await api.get('/order-services/price-list');
        const services = data || [];
        
        // ✅ Sắp xếp theo serviceType và cost
        const sortedData = [...services].sort((a, b) => {
          const typeOrder = ['TRAFFIC_FEE', 'CLEANING', 'MAINTENANCE', 'REPAIR', 'OTHER'];
          const aTypeIndex = typeOrder.indexOf(a.serviceType) !== -1 ? typeOrder.indexOf(a.serviceType) : 999;
          const bTypeIndex = typeOrder.indexOf(b.serviceType) !== -1 ? typeOrder.indexOf(b.serviceType) : 999;
          
          if (aTypeIndex !== bTypeIndex) {
            return aTypeIndex - bTypeIndex;
          }
          return (a.cost || 0) - (b.cost || 0);
        });
        
        setServicePricing(sortedData);
      } catch (error) {
        console.error("Lỗi khi tải bảng giá dịch vụ:", error);
      } finally {
        setServiceLoading(false);
      }
    };

    fetchServicePricing();
  }, []);

  // ✅ Chuyển đổi serviceType sang tiếng Việt
  const getServiceTypeText = (type) => {
    const typeMap = {
      'TRAFFIC_FEE': 'Phí giao thông',
      'CLEANING': 'Vệ sinh',
      'MAINTENANCE': 'Bảo trì',
      'REPAIR': 'Sửa chữa',
      'OTHER': 'Khác'
    };
    return typeMap[type] || type;
  };

  const formatMoney = (number) =>
    number?.toLocaleString("vi-VN") + " VND" || "0 VND";

  return (
    <div className="pricing-page">
      <div className="pricing-header">
        <h1 className="pricing-title">Bảng Giá Thuê Xe</h1>
        <p className="pricing-subtitle">Thông tin giá thuê xe và dịch vụ chi tiết</p>
      </div>

      {/* Bảng giá thuê xe */}
      <div className="pricing-section">
        <h2 className="section-title">Giá Thuê Xe Theo Ngày</h2>
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Đang tải bảng giá...</p>
          </div>
        ) : carPricing.length === 0 ? (
          <div className="empty-state">
            <p>Chưa có thông tin bảng giá</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="pricing-table">
              <thead>
                <tr>
                  <th>Loại Xe</th>
                  <th>Giá / Ngày</th>
                  <th>Phụ Phí Trễ / Ngày</th>
                  <th>Giá Ngày Lễ</th>
                </tr>
              </thead>
              <tbody>
                {carPricing.map((item) => (
                  <tr key={item.pricingRuleId}>
                    <td className="car-model">{item.carmodel}</td>
                    <td className="price-cell">{formatMoney(item.dailyPrice)}</td>
                    <td className="price-cell">{formatMoney(item.lateFeePerDay)}</td>
                    <td className="price-cell highlight">{formatMoney(item.holidayPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bảng giá dịch vụ */}
      <div className="pricing-section">
        <h2 className="section-title">Bảng Giá Dịch Vụ</h2>
        {serviceLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Đang tải bảng giá dịch vụ...</p>
          </div>
        ) : (() => {
          // ✅ Lọc bỏ các dịch vụ có serviceType là "OTHER"
          const filteredServices = servicePricing.filter(item => 
            item.serviceType && item.serviceType.toUpperCase() !== "OTHER"
          );
          
          if (filteredServices.length === 0) {
            return (
              <div className="empty-state">
                <p>Chưa có thông tin dịch vụ</p>
              </div>
            );
          }
          
          // ✅ Nhóm các dịch vụ theo serviceType
          const groupedServices = filteredServices.reduce((acc, item) => {
            const type = item.serviceType;
            if (!acc[type]) {
              acc[type] = [];
            }
            acc[type].push(item);
            return acc;
          }, {});

          // ✅ Chuyển đổi thành mảng để render
          const serviceGroups = Object.entries(groupedServices);

          return (
            <div className="table-wrapper">
              <table className="pricing-table">
                <thead>
                  <tr>
                    <th>Loại Dịch Vụ</th>
                    <th>Mô Tả</th>
                    <th>Giá</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceGroups.map(([serviceType, services], groupIndex) => (
                    <React.Fragment key={serviceType}>
                      {services.map((item, itemIndex) => (
                        <tr key={item.serviceId}>
                          {/* ✅ Chỉ hiển thị serviceType ở dòng đầu tiên của mỗi nhóm với rowspan */}
                          {itemIndex === 0 && (
                            <td 
                              rowSpan={services.length}
                              className="service-type-cell"
                            >
                              {getServiceTypeText(serviceType)}
                            </td>
                          )}
                          <td>{item.description || "N/A"}</td>
                          <td className="price-cell">{formatMoney(item.cost || 0)}</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })()}
      </div>

      {/* Lưu ý */}
      <div className="pricing-note">
        <h3>Lưu ý:</h3>
        <ul>
          <li>Giá có thể thay đổi tùy theo thời điểm và chương trình khuyến mãi</li>
          <li>Vui lòng liên hệ trực tiếp để biết thêm chi tiết</li>
        </ul>
      </div>
    </div>
  );
}

