import React, { useEffect, useState } from "react";
import "./BangGiaPage.css";
import axios from "axios";

export default function BangGiaPage() {
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
        return orderMap[firstChar] || 999; // Nếu không phải B-G, đặt cuối
      };
      return getOrder(a.carmodel) - getOrder(b.carmodel);
    });
  };

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const res = await axios.get("https://be-ev-station-based-rental-system.onrender.com/api/pricing-rules");
        // ✅ API trả về format mới với carmodel
        const data = res.data || [];
        
        // ✅ Sắp xếp từ B xuống (B, C, D, E, F, G)
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
        const res = await axios.get("https://be-ev-station-based-rental-system.onrender.com/api/order-services/price-list");
        const data = res.data || [];
        
        // ✅ Sắp xếp theo serviceType và cost
        const sortedData = [...data].sort((a, b) => {
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
    number.toLocaleString("vi-VN") + "đ";

  return (
    <div className="banggia-container">
      {/* Bảng giá thuê xe - Chỉ xem */}
      <div className="table-header">
        <h1 className="page-title">Bảng giá thuê xe</h1>
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <table className="pricing-table">
            <thead>
              <tr>
                <th>Loại xe</th>
                <th>Giá / ngày</th>
                <th>Phụ phí trễ / ngày</th>
                <th>Giá ngày lễ</th>
              </tr>
            </thead>

          <tbody>
            {carPricing.map((item) => (
              <tr key={item.pricingRuleId}>
                <td>{item.carmodel}</td>
                <td>{formatMoney(item.dailyPrice)}</td>
                <td>{formatMoney(item.lateFeePerDay)}</td>
                <td>{formatMoney(item.holidayPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Bảng giá dịch vụ - Chỉ xem */}
      <div className="table-header" style={{ marginTop: "60px" }}>
        <h1 className="page-title">Bảng giá dịch vụ</h1>
      </div>

      {serviceLoading ? (
        <p>Đang tải...</p>
      ) : (() => {
        // ✅ Lọc bỏ các dịch vụ có serviceType là "OTHER"
        const filteredServices = servicePricing.filter(item => 
          item.serviceType && item.serviceType.toUpperCase() !== "OTHER"
        );
        
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
          <table className="pricing-table">
            <thead>
              <tr>
                <th>Loại dịch vụ</th>
                <th>Mô tả</th>
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
                          style={{
                            verticalAlign: "top",
                            fontWeight: "600",
                            backgroundColor: "#f9fafb",
                            borderRight: "2px solid #e0e0e0"
                          }}
                        >
                          {getServiceTypeText(serviceType)}
                        </td>
                      )}
                      <td>{item.description || "N/A"}</td>
                      <td>{formatMoney(item.cost || 0)}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        );
      })()}



    </div>
  );
}
