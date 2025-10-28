import React, { useState, useEffect } from "react";
import { orderService } from "../services";
import "./XacThucKhachHang.css";
import PopupXacThucHoSoCaNhan from "../components/staff/PopupXacThucHoSoCaNhan";

const XacThucKhachHangPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);
  const [popupType, setPopupType] = useState(null);
  const [hoSoCaNhan, setHoSoCaNhan] = useState([]);
  const [hoSoDatXe, setHoSoDatXe] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        console.log('🚀 Loading orders for verification...');

        const orders = await orderService.getAll();
        console.log('✅ Orders:', orders);

        // Phân loại orders
        // Hồ sơ cá nhân: PENDING orders (chưa xác thực)
        const pendingOrders = orders
          .filter(order => order.status === 'PENDING')
          .map(order => ({
            id: order.orderId,
            ten: order.customerName || order.fullName || 'Khách hàng',
            sdt: order.phone || 'N/A',
            email: order.email || 'N/A',
            cccd: order.identityCard || 'N/A',
            gplx: order.licenseNumber || 'N/A',
            status: "Chưa xác thực hồ sơ cá nhân"
          }));

        // Hồ sơ đặt xe: CONFIRMED orders (đã xác thực cá nhân, chờ xác thực booking)
        const confirmedOrders = orders
          .filter(order => ['CONFIRMED', 'PICKED_UP'].includes(order.status))
          .map(order => ({
            id: order.orderId,
            ten: order.customerName || order.fullName || 'Khách hàng',
            sdt: order.phone || 'N/A',
            xe: `${order.vehicleName || 'Xe'} (${order.plateNumber || 'N/A'})`,
            thoiGian: `${new Date(order.startTime).toLocaleString('vi-VN')} - ${new Date(order.endTime).toLocaleString('vi-VN')}`,
            tongTien: `${order.totalPrice?.toLocaleString('vi-VN')} VND`,
            coc: `${(order.totalPrice * 0.3)?.toLocaleString('vi-VN')} VND`,
            xacThuc: order.status === 'CONFIRMED' ? 'Đã xác thực' : 'Chưa xác thực',
            thoiGianXacThuc: order.confirmedAt ? new Date(order.confirmedAt).toLocaleString('vi-VN') : 'N/A',
          }));

        setHoSoCaNhan(pendingOrders);
        setHoSoDatXe(confirmedOrders);
      } catch (error) {
        console.error('❌ Error loading orders:', error);
        // Fallback data
        setHoSoCaNhan([
          {
            id: "ORD-001",
            ten: "Trần Thị B",
            sdt: "0912345678",
            email: "tranthib@email.com",
            cccd: "001234567890",
            gplx: "B1-123456",
            status: "Đã xác thực hồ sơ cá nhân"
          },
        ]);
        setHoSoDatXe([
          {
            id: "ORD-003",
            ten: "Phạm Thị T",
            sdt: "0932456789",
            xe: "VinFast Evo200 (29E-33333)",
            thoiGian: "21/12/2024 10:00 - 23/12/2024 18:00",
            tongTien: "900.000 VND",
            coc: "250.000 VND",
            xacThuc: "Đã xác thực",
            thoiGianXacThuc: "19/12/2024 10:30",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  // 🔍 Lọc tìm kiếm
  const filteredCaNhan = hoSoCaNhan.filter(
    (item) =>
      item.ten.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sdt.includes(searchTerm) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDatXe = hoSoDatXe.filter(
    (item) =>
      item.ten.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sdt.includes(searchTerm) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAction = (row) => {
    setSelectedRow(row);
    if (row.status === "Chưa xác thực hồ sơ cá nhân") setPopupType("caNhan");
  }

  if (loading) {
    return (
      <div className="xacThuc-container">
        <h1 className="title">Xác thực khách hàng</h1>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="xacThuc-container">
        <h1 className="title">Xác thực khách hàng</h1>
        <p className="subtitle">
          Kiểm tra giấy tờ và xác thực thông tin khách hàng
        </p>

        {/* 🔍 Thanh tìm kiếm */}
        <input
          type="text"
          placeholder="🔍 Tìm kiếm theo họ tên, SĐT, mã đơn..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-box"
        />

        {/* 🧾 CHỜ XÁC THỰC HỒ SƠ CÁ NHÂN */}
        <div className="section">
          <h2>Chờ xác thực hồ sơ cá nhân ({filteredCaNhan.length})</h2>
          <table className="table">
            <thead>
              <tr>
                <th>MÃ ĐƠN</th>
                <th>KHÁCH HÀNG</th>
                <th>LIÊN HỆ</th>
                <th>CMND/CCCD</th>
                <th>GPLX</th>
                <th>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {filteredCaNhan.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>{row.ten}</td>
                  <td>
                    {row.sdt}
                    <br />
                    <span className="email">{row.email}</span>
                  </td>
                  <td>{row.cccd}</td>
                  <td>{row.gplx}</td>
                  <td>
                    <button
                      className="btn-primary" onClick={() => handleAction(row)}>Xác thực hồ sơ</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 🚗 CHỜ XÁC THỰC HỒ SƠ ĐẶT XE */}
        <div className="section">
          <h2>Chờ xác thực hồ sơ đặt xe ({filteredDatXe.length})</h2>
          <table className="table">
            <thead>
              <tr>
                <th>MÃ ĐƠN</th>
                <th>KHÁCH HÀNG</th>
                <th>XE THUÊ</th>
                <th>THỜI GIAN THUÊ</th>
                <th>TỔNG TIỀN</th>
                <th>XÁC THỰC HỒ SƠ</th>
                <th>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {filteredDatXe.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>
                    {row.ten}
                    <br />
                    <span className="phone">{row.sdt}</span>
                  </td>
                  <td>{row.xe}</td>
                  <td>{row.thoiGian}</td>
                  <td>
                    {row.tongTien}
                    <br />
                    <small>Cọc: {row.coc}</small>
                  </td>
                  <td>
                    <span className="status success">{row.xacThuc}</span>
                    <br />
                    <small>{row.thoiGianXacThuc}</small>
                  </td>
                  <td>

                    {
                      row.xacThuc === "Chưa xác thực" ? (
                        <button className="btn-primary">Xác thực hồ sơ</button>
                      ) : (<button className="btn-secondary" disabled>Đã xác thực</button>)

                    }

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {popupType === "caNhan" && (<PopupXacThucHoSoCaNhan row={selectedRow} onClose={() => setPopupType(null)} />)}
    </>
  );
};

export default XacThucKhachHangPage;
