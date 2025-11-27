import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminQuanLyDonHangPage.css';
import { orderService } from '../../services/orderService';
import { rentalStationService } from '../../services/rentalStationService';

// Định dạng ngày giờ
const fmtVN = (d) => (d ? new Date(d).toLocaleString("vi-VN") : "N/A");
const fmtRange = (s, e) => `${fmtVN(s)} - ${fmtVN(e)}`;

// Helper function
const getStatusText = (status) => {
  if (!status) return "N/A";
  const s = status.toUpperCase();
  const statusMap = {
    'PENDING': 'Chờ xác nhận',
    'CONFIRMED': 'Đã xác nhận',
    'RENTED': 'Đang thuê',
    'RENTAL': 'Đang thuê',
    'COMPLETED': 'Hoàn thành',
    'CANCELLED': 'Đã hủy',
    'PAYMENT_FAILED': 'Thanh toán thất bại',
    'REFUNDED': 'Đã hoàn tiền',
    'FAILED': 'Thất bại',
    'ACTIVE': 'Đang hoạt động'
  };
  return statusMap[s] || status;
};

// Helper function: Lấy class CSS cho status
const getStatusClass = (status) => {
  if (!status) return 'warning';
  const s = status.toUpperCase();
  if (['COMPLETED', 'CONFIRMED', 'RENTED', 'RENTAL', 'ACTIVE'].includes(s)) {
    return 'success';
  }
  if (['PAYMENT_FAILED', 'REFUNDED', 'CANCELLED', 'FAILED'].includes(s)) {
    return 'warning';
  }
  return 'warning';
};

const AdminQuanLyDonHangPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [stations, setStations] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch orders - Logic giống với staff page
  // Staff page dùng getPendingOrders() (có customerName/phone) + getAll() (cần map từ customer)
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Bước 1: Lấy pending orders (có customerName và phone sẵn)
      const pendingRes = await orderService.getPendingOrders();
      const pendingData = Array.isArray(pendingRes?.data) ? pendingRes.data : 
                         Array.isArray(pendingRes) ? pendingRes : [];
      
      // Bước 2: Lấy tất cả orders từ getAll()
      const allRes = await orderService.getAll();
      const allOrders = Array.isArray(allRes?.data) ? allRes.data : 
                       Array.isArray(allRes) ? allRes : [];
      
      // Bước 3: Merge và map dữ liệu
      const orderMap = new Map();
      
      // Thêm pending orders vào map (đã có customerName và phone)
      pendingData.forEach(order => {
        orderMap.set(String(order.orderId), {
          ...order,
          customerName: order.customerName || 'N/A',
          phone: order.phone || 'N/A'
        });
      });
      
      // Thêm các orders từ getAll() vào map (cần map từ customer object)
      allOrders.forEach(order => {
        const orderId = String(order.orderId);
        if (!orderMap.has(orderId)) {
          // Map từ customer object
          const customerName = order.customerName || 
                            order.customer?.fullName || 
                            order.customer?.name ||
                            'N/A';
          
          const phone = order.phone || 
                       order.customer?.phone ||
                       'N/A';
          
          orderMap.set(orderId, {
            ...order,
            customerName,
            phone
          });
        }
      });
      
      // Chuyển map thành array
      const ordersData = Array.from(orderMap.values());
      
      setOrders(ordersData);
    } catch (err) {
      console.error('❌ [AdminQuanLyDonHangPage] Lỗi khi gọi API:', err);
      const errorMessage = err?.response?.data?.message || 
                          err?.message || 
                          'Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.';
      setError(errorMessage);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stations để hiển thị tên trạm
  const fetchStations = async () => {
    try {
      const res = await rentalStationService.getAll();
      const data = Array.isArray(res) ? res : (res?.data || []);
      setStations(data);
    } catch (err) {
      console.error('❌ Không thể tải danh sách trạm:', err);
      setStations([]);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchStations();
  }, []);

  // Tìm kiếm
  const filtered = orders.filter((order) => {
    if (!search.trim()) return true;
    const searchLower = search.toLowerCase();
    return [
      order.customerName,
      order.phone,
      order.orderId,
      order.vehicleName,
      order.plateNumber
    ].some((field) => (field || '').toLowerCase().includes(searchLower));
  });

  // Xem chi tiết đơn hàng
  const handleViewOrderDetail = (orderId) => {
    navigate(`/admin/order-detail/${orderId}`);
  };

  if (loading) {
    return (
      <div className="verify-container">
        <h1 className="verify-title">QUẢN LÝ ĐƠN HÀNG</h1>
        <p style={{ textAlign: 'center', padding: 40 }}>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="verify-container">
      <h1 className="verify-title">QUẢN LÝ ĐƠN HÀNG</h1>
      <p className="verify-subtitle">Danh sách tất cả đơn hàng trong hệ thống</p>

      {/* Tìm kiếm */}
      <input
        className="verify-search"
        type="text"
        placeholder="Tìm kiếm theo họ tên, SĐT, mã đơn..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Hiển thị lỗi nếu có */}
      {error && (
        <div style={{
          padding: '16px',
          marginBottom: '20px',
          backgroundColor: '#FFEBEE',
          border: '2px solid #F44336',
          borderRadius: '4px',
          color: '#C62828'
        }}>
          <strong>⚠️ Lỗi:</strong> {error}
          <button
            onClick={() => {
              setError(null);
              fetchOrders();
            }}
            style={{
              marginLeft: '12px',
              padding: '6px 12px',
              backgroundColor: '#F44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Thử lại
          </button>
        </div>
      )}

      <div className="verify-section">
        <h2>Danh sách đơn hàng ({filtered.length})</h2>

        {filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            {orders.length === 0 ? 'Không có đơn hàng nào' : 'Không tìm thấy đơn hàng phù hợp'}
          </div>
        ) : (
          <table className="verify-table">
            <thead>
              <tr>
                <th>KHÁCH HÀNG</th>
                <th>XE THUÊ</th>
                <th>THỜI GIAN THUÊ</th>
                <th>TRẠM</th>
                <th>TỔNG TIỀN</th>
                <th>TRẠNG THÁI</th>
                <th>THAO TÁC</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((order) => {
                // Tìm trạm theo stationId
                const orderStationId = order.stationId || order.station_id || order.stationid;
                const station = stations.find(
                  (s) => Number(s.stationid || s.stationId || s.station_id) === Number(orderStationId)
                );

                // Xác định trạng thái xác thực
                const verified = order.profileVerified ||
                  ['ACTIVE', 'ĐÃ XÁC THỰC', 'ĐÃ XÁC THỰC (HỒ SƠ)'].includes(
                    (order.userStatus || '').toUpperCase()
                  );

                return (
                  <tr key={order.orderId}>
                    <td>
                      {order.customerName || 'N/A'}
                      <br />
                      <span className="verify-phone">{order.phone || 'N/A'}</span>
                    </td>

                    <td>
                      {order.vehicleName} ({order.plateNumber})
                    </td>

                    <td>{fmtRange(order.startTime, order.endTime)}</td>

                    <td>
                      {station ? (
                        <>
                          <strong>{station.name}</strong>
                          <br />
                          <small>
                            {[station.street, station.ward, station.district, station.city]
                              .filter(Boolean)
                              .join(', ')}
                          </small>
                        </>
                      ) : (
                        order.stationName || 'Không xác định'
                      )}
                    </td>

                    <td>
                      {Number(order.totalPrice).toLocaleString('vi-VN')} VND
                    </td>

                    <td>
                      {/* Hiển thị status trực tiếp từ order */}
                      {order.status ? (
                        <>
                          <span className={`verify-status ${getStatusClass(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                          {/* Hiển thị lý do hủy nếu đơn bị hủy */}
                          {(order.status.toUpperCase() === 'CANCELLED' || 
                            order.status.toUpperCase() === 'CANCELED') && 
                            (order.cancellationReason || order.cancelReason || order.reason) && (
                            <>
                              <br />
                              <small style={{ 
                                color: '#DC2626', 
                                fontSize: '11px', 
                                fontWeight: '400',
                                display: 'block',
                                marginTop: '4px',
                                fontStyle: 'italic'
                              }}>
                                Lý do: {order.cancellationReason || order.cancelReason || order.reason}
                              </small>
                            </>
                          )}
                          {/* Hiển thị trạng thái xác thực nếu có */}
                          {verified && (
                            <>
                              <br />
                              <small style={{ color: '#2E7D32', fontSize: '11px', fontWeight: '400' }}>
                                Đã xác thực
                              </small>
                            </>
                          )}
                        </>
                      ) : (
                        <span className="verify-status warning">N/A</span>
                      )}
                    </td>

                    <td>
                      <button
                        className="verify-btn info"
                        onClick={() => handleViewOrderDetail(order.orderId)}
                      >
                        Chi tiết đơn hàng
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminQuanLyDonHangPage;

