import React, { useState, useEffect } from "react";
import { orderService } from "../services";
import "./XacThucKhachHang.css";
import PopupXacThucHoSoCaNhan from "../components/staff/PopupXacThucHoSoCaNhan";

const XacThucKhachHangPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);
  const [popupType, setPopupType] = useState(null);
  const [hoSoDatXe, setHoSoDatXe] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        console.log("🚀 Loading orders for verification...");

        const orders = await orderService.getAll();
        console.log("✅ Orders:", orders);

        // Hiển thị TẤT CẢ đơn có ý nghĩa “đặt xe” (PENDING/CONFIRMED/PICKED_UP)
        const bookingOrders = orders
          .filter((o) => ["PENDING", "CONFIRMED", "PICKED_UP"].includes(o.status))
          .map((order) => ({
            id: order.orderId,
            ten: order.customerName || order.fullName || "Khách hàng",
            sdt: order.phone || "N/A",
            xe: `${order.vehicleName || "Xe"} (${order.plateNumber || "N/A"})`,
            thoiGian: `${new Date(order.startTime).toLocaleString("vi-VN")} - ${new Date(
              order.endTime
            ).toLocaleString("vi-VN")}`,
            tongTien: `${order.totalPrice?.toLocaleString("vi-VN")} VND`,
            coc: `${(order.totalPrice * 0.3)?.toLocaleString("vi-VN")} VND`,
            status: order.status, // PENDING | CONFIRMED | PICKED_UP
            xacThuc: ["CONFIRMED", "PICKED_UP"].includes(order.status) ? "Đã xác thực" : "Chưa xác thực",
            thoiGianXacThuc: order.confirmedAt ? new Date(order.confirmedAt).toLocaleString("vi-VN") : "N/A",
            banGiaoAt: order.pickedUpAt ? new Date(order.pickedUpAt).toLocaleString("vi-VN") : null,
            email: order.email || "N/A",
            cccd: order.identityCard || "N/A",
            gplx: order.licenseNumber || "N/A",
          }));

        setHoSoDatXe(bookingOrders);
      } catch (error) {
        console.error("❌ Error loading orders:", error);
        // Fallback demo data
        setHoSoDatXe([
          {
            id: "ORD-003",
            ten: "Phạm Thị T",
            sdt: "0932456789",
            xe: "VinFast Evo200 (29E-33333)",
            thoiGian: "21/12/2024 10:00 - 23/12/2024 18:00",
            tongTien: "900.000 VND",
            coc: "270.000 VND",
            status: "CONFIRMED",
            xacThuc: "Đã xác thực",
            thoiGianXacThuc: "19/12/2024 10:30",
            banGiaoAt: null,
            email: "phamtt@email.com",
            cccd: "012345678901",
            gplx: "B1-123456",
          },
          {
            id: "ORD-004",
            ten: "Nguyễn Văn A",
            sdt: "0911112222",
            xe: "Kia Morning (30A-12345)",
            thoiGian: "24/12/2024 09:00 - 26/12/2024 20:00",
            tongTien: "1.200.000 VND",
            coc: "360.000 VND",
            status: "PENDING",
            xacThuc: "Chưa xác thực",
            thoiGianXacThuc: "N/A",
            banGiaoAt: null,
            email: "nguyenvana@email.com",
            cccd: "079999999999",
            gplx: "B2-888888",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  // 🔍 Lọc tìm kiếm chỉ trên danh sách đặt xe
  const filteredDatXe = hoSoDatXe.filter(
    (item) =>
      item.ten.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sdt.includes(searchTerm) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ===== Handlers =====
  const handleOpenXacThuc = (row) => {
    setSelectedRow(row);
    setPopupType("caNhan"); // tái sử dụng popup xác thực cá nhân cho người đặt
  };

  const handleBanGiaoXe = async (row) => {
    try {
      // Gọi API cập nhật trạng thái -> 'PICKED_UP'
      await orderService.updateStatus(row.id, "PICKED_UP");
      setHoSoDatXe((prev) =>
        prev.map((r) =>
          r.id === row.id
            ? {
                ...r,
                status: "PICKED_UP",
                xacThuc: "Đã xác thực",
                banGiaoAt: new Date().toLocaleString("vi-VN"),
              }
            : r
        )
      );
    } catch (e) {
      console.error("❌ Bàn giao xe thất bại:", e);
      alert("Bàn giao xe thất bại. Vui lòng thử lại!");
    }
  };

  const handleTuChoiBanGiao = async (row) => {
    try {
      // Gọi API hủy/ từ chối (REJECTED hoặc CANCELLED tùy backend)
      await orderService.updateStatus(row.id, "REJECTED");
      // Loại khỏi danh sách chờ xử lý
      setHoSoDatXe((prev) => prev.filter((r) => r.id !== row.id));
    } catch (e) {
      console.error("❌ Từ chối bàn giao thất bại:", e);
      alert("Từ chối bàn giao thất bại. Vui lòng thử lại!");
    }
  };

  if (loading) {
    return (
      <div className="xacThuc-container">
        <h1 className="title">Xác thực khách hàng</h1>
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="xacThuc-container">
        <h1 className="title">Xác thực khách hàng</h1>
        <p className="subtitle">Kiểm tra giấy tờ và xử lý hồ sơ đặt xe</p>

        {/* 🔍 Thanh tìm kiếm */}
        <input
          type="text"
          placeholder="🔍 Tìm kiếm theo họ tên, SĐT, mã đơn..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-box"
        />

        {/* 🚗 CHỜ XÁC THỰC / XỬ LÝ HỒ SƠ ĐẶT XE */}
        <div className="section">
          <h2>Hồ sơ đặt xe cần xử lý ({filteredDatXe.length})</h2>
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
                    <span className={`status ${row.xacThuc === "Đã xác thực" ? "success" : "warning"}`}>
                      {row.xacThuc}
                    </span>
                    <br />
                    <small>{row.thoiGianXacThuc}</small>
                    {row.banGiaoAt && (
                      <>
                        <br />
                        <small>Đã bàn giao: {row.banGiaoAt}</small>
                      </>
                    )}
                  </td>
                  <td>
                    {/* 1) Xác thực hồ sơ (chỉ hiện khi chưa xác thực) */}
                    {row.xacThuc === "Chưa xác thực" && (
                      <button className="btn-primary" onClick={() => handleOpenXacThuc(row)}>
                        Xác thực hồ sơ
                      </button>
                    )}

                    {/* 2) Bàn giao xe (chỉ hiện khi đã xác thực & chưa PICKED_UP) */}
                    {row.xacThuc === "Đã xác thực" && row.status !== "PICKED_UP" && (
                      <button className="btn-success" onClick={() => handleBanGiaoXe(row)} style={{ marginLeft: 8 }}>
                        Bàn giao xe
                      </button>
                    )}

                    {/* 3) Từ chối bàn giao xe (luôn có, trừ khi đã bàn giao) */}
                    {row.status !== "PICKED_UP" && (
                      <button className="btn-danger" onClick={() => handleTuChoiBanGiao(row)} style={{ marginLeft: 8 }}>
                        Từ chối bàn giao
                      </button>
                    )}

                    {/* Nếu đã bàn giao thì disable */}
                    {row.status === "PICKED_UP" && (
                      <button className="btn-secondary" disabled style={{ marginLeft: 8 }}>
                        Đã bàn giao
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {popupType === "caNhan" && (
        <PopupXacThucHoSoCaNhan row={selectedRow} onClose={() => setPopupType(null)} />
      )}
    </>
  );
};

export default XacThucKhachHangPage;
