import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { orderService, authService, rentalStationService } from "../services";
import "./XacThucKhachHang.css";
import PopupXacThucHoSoCaNhan from "../components/popup/PopupXacThucHoSoCaNhan";
import { AuthContext } from "../context/AuthContext";

// 🕒 Định dạng
const fmtVN = (d) => (d ? new Date(d).toLocaleString("vi-VN") : "N/A");
const fmtRange = (s, e) => `${fmtVN(s)} - ${fmtVN(e)}`;

export default function VerifyCustomerPage() {
  const { user } = useContext(AuthContext);
  const nav = useNavigate();
  const location = useLocation();

  const [orders, setOrders] = useState([]);
  const [stations, setStations] = useState([]); // ⭐ Danh sách trạm
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // ⭐ State để hiển thị lỗi

  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [popupType, setPopupType] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  

  // 🧾 Lấy đơn hàng theo trạm
  const fetchOrders = async () => {
    try {
      setError(null); // Clear error trước khi fetch
      const res = await orderService.getPendingOrders();
      const data = res.data || res || [];
      
      console.log('📋 [fetchOrders] Raw data:', data);
      console.log('📋 [fetchOrders] Data length:', data.length);
      
      // Lấy stationId từ user hoặc default
      const userStationId = user?.stationId || user?.station_id || user?.stationid;
      
      console.log('👤 [fetchOrders] User stationId:', userStationId);
      console.log('📋 [fetchOrders] All orders before filter:', data);
      
      // Nếu không có user stationId, hiển thị tất cả orders
      let filtered;
      if (!userStationId) {
        console.log('⚠️ [fetchOrders] No user stationId, showing all orders');
        filtered = data;
      } else {
        const stationId = userStationId;
        console.log('🔍 [fetchOrders] Filtering with stationId:', stationId);
        
        // Xử lý nhiều tên field có thể có: stationId, station_id, stationid
        filtered = data.filter((o) => {
          const orderStationId = o.stationId || o.station_id || o.stationid;
          const match = Number(orderStationId) === Number(stationId);
          console.log('🔍 [fetchOrders] Order:', {
            orderId: o.orderId,
            orderStationId: orderStationId,
            targetStationId: stationId,
            match: match
          });
          return match;
        });
        
        // ⚠️ Nếu sau khi filter không có order nào, hiển thị tất cả để tránh mất dữ liệu
        if (filtered.length === 0 && data.length > 0) {
          console.log('⚠️ [fetchOrders] No orders match stationId, showing all orders instead');
          filtered = data;
        }
      }
      
      console.log('✅ [fetchOrders] Filtered orders:', filtered.length);
      console.log('✅ [fetchOrders] Filtered orders data:', filtered);
      setOrders(filtered);
    } catch (err) {
      console.error("❌ Lỗi tải hồ sơ:", err);
      const errorMessage = err?.response?.data?.message || err?.message || "Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.";
      setError(errorMessage);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // 🚉 Fetch toàn bộ trạm
  const fetchStations = async () => {
    try {
      const res = await rentalStationService.getAll();
      const data = Array.isArray(res) ? res : (res?.data || []);
      setStations(data);
    } catch (err) {
      console.error("❌ Không thể tải danh sách trạm:", err);
      // Không set error cho stations vì không ảnh hưởng đến chức năng chính
      setStations([]);
    }
  };

  useEffect(() => {
    // ✅ Chạy lại khi user data ready (có stationId) hoặc location thay đổi
    console.log('🔄 [useEffect] User:', user);
    console.log('🔄 [useEffect] User stationId:', user?.stationId || user?.station_id || user?.stationid);
    
    // Fetch orders ngay cả khi không có user.stationId (sẽ dùng default = 1)
    fetchOrders();
    fetchStations(); 
  }, [user?.stationId, user?.station_id, user?.stationid, location]); // ✅ Thêm các variant của stationId vào dependency

  // 🔍 Tìm kiếm
  const filtered = orders.filter((x) => {
  if (!search.trim()) return true;

  const t = search.toLowerCase();
  return [x.customerName, x.phone, x.orderId]
    .some((f) => (f || "").toLowerCase().includes(t));
});


  // 👤 Xác thực hồ sơ
  const handleOpenProfile = async (row) => {
    setSelectedRow(row);
    setPopupType("profile");
    setProfileLoading(true);

    try {
      const res = await authService.getProfilePendingVerification();
      const profiles = res.data || res || [];
      setSelectedProfile(
        profiles.find((p) => p.userId === row.userId) || null
      );
    } catch {
      setProfileError("Không tải được hồ sơ khách hàng.");
    } finally {
      setProfileLoading(false);
    }
  };

  // ⭕ Duyệt hồ sơ
  const handleVerify = async () => {
    if (!selectedRow?.userId) return;
    setVerifyLoading(true);

    try {
      await authService.verifyProfileByUserId(selectedRow.userId);

      setOrders((prev) =>
        prev.map((r) =>
          r.userId === selectedRow.userId
            ? { ...r, profileVerified: true, userStatus: "ĐÃ XÁC THỰC (HỒ SƠ)" }
            : r
        )
      );

      setPopupType(null);
      alert("✅ Hồ sơ khách hàng đã được xác thực.");
    } catch {
      setProfileError("Xác thực hồ sơ thất bại.");
    } finally {
      setVerifyLoading(false);
    }
  };

  // 👉 Xem chi tiết đơn hàng
  const handleViewOrderDetail = useCallback((orderId, userId) => {
    console.log('📋 Navigating to order detail:', { orderId, userId });
    nav(`/staff/chitiet/${orderId}/${userId}`);
  }, [nav]);

  // ✅ Tự động mở chi tiết đơn hàng khi navigate từ GiaoTraXe
  useEffect(() => {
    if (location.state?.autoOpenOrderDetail && orders.length > 0) {
      const { autoOpenOrderDetail: orderId } = location.state;
      
      // ✅ Tự động tìm userId từ orders dựa vào orderId
      const order = orders.find(o => String(o.orderId) === String(orderId));
      const userId = order?.userId;
      
      if (!userId) {
        console.error('❌ Không tìm thấy userId cho orderId:', orderId);
        return;
      }
      
      console.log('🎯 Auto opening order detail:', { orderId, userId });
      // Tự động mở chi tiết đơn hàng
      handleViewOrderDetail(orderId, userId);
    }
  }, [location.state?.autoOpenOrderDetail, orders, handleViewOrderDetail]);

  if (loading)
    return (
      <div className="verify-container">
        <h1 className="verify-title">Quản lí đơn hàng</h1>
        <p style={{ textAlign: "center", padding: 40 }}>Đang tải dữ liệu...</p>
      </div>
    );

  return (
    <>
      <div className="verify-container">
        <h1 className="verify-title">Quản lí đơn hàng</h1>
        <p className="verify-subtitle">Kiểm tra giấy tờ và xử lý hồ sơ đặt xe</p>

        {/* 🔍 Tìm kiếm */}
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
            padding: "16px",
            marginBottom: "20px",
            backgroundColor: "#FFEBEE",
            border: "2px solid #F44336",
            borderRadius: "4px",
            color: "#C62828"
          }}>
            <strong>⚠️ Lỗi:</strong> {error}
            <button
              onClick={() => {
                setError(null);
                fetchOrders();
              }}
              style={{
                marginLeft: "12px",
                padding: "6px 12px",
                backgroundColor: "#F44336",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Thử lại
            </button>
          </div>
        )}

        <div className="verify-section">
          <h2>Hồ sơ đặt xe cần xử lý ({filtered.length})</h2>

          <table className="verify-table">
            <thead>
              <tr>
                <th>KHÁCH HÀNG</th>
                <th>XE THUÊ</th>
                <th>THỜI GIAN THUÊ</th>
                <th>TRẠM</th>
                <th>TỔNG TIỀN</th>
                <th>XÁC THỰC HỒ SƠ</th>
                <th>THAO TÁC</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((row) => {
                const verified =
                  row.profileVerified ||
                  ["ACTIVE", "ĐÃ XÁC THỰC", "ĐÃ XÁC THỰC (HỒ SƠ)"].includes(
                    row.userStatus?.toUpperCase?.()
                  );

                // ⭐ Tìm trạm theo stationId (xử lý nhiều tên field)
                const orderStationId = row.stationId || row.station_id || row.stationid;
                const station = stations.find(
                  (s) => Number(s.stationid || s.stationId || s.station_id) === Number(orderStationId)
                );

                return (
                  <tr key={row.orderId}>
                    <td>
                      {row.customerName}
                      <br />
                      <span className="verify-phone">{row.phone}</span>
                    </td>

                    <td>
                      {row.vehicleName} ({row.plateNumber})
                    </td>

                    <td>{fmtRange(row.startTime, row.endTime)}</td>

                    {/* ⭐ HIỂN THỊ TRẠM */}
                    <td>
                      {station ? (
                        <>
                          <strong>{station.name}</strong>
                          <br />
                          <small>
                            {station.street}, {station.ward}, {station.district},{" "}
                            {station.city}
                          </small>
                        </>
                      ) : (
                        "Không xác định"
                      )}
                    </td>

                    <td>
                      {Number(row.totalPrice).toLocaleString("vi-VN")} VND
                    </td>

                    <td>
                      <span
                        className={`verify-status ${
                          verified ? "success" : "warning"
                        }`}
                      >
                        {verified ? "ĐÃ XÁC THỰC" : "CHƯA XÁC THỰC"}
                      </span>

                      {row.pickedUpAt && (
                        <small>
                          <br />
                          Đã bàn giao: {fmtVN(row.pickedUpAt)}
                        </small>
                      )}
                    </td>

                    <td>
                      {!verified ? (
                        <button
                          className="verify-btn primary"
                          onClick={() => handleOpenProfile(row)}
                        >
                          Xác thực hồ sơ
                        </button>
                      ) : (
                        <button
                          className="verify-btn info"
                          onClick={() =>
                            handleViewOrderDetail(row.orderId, row.userId)
                          }
                        >
                          📄 Chi tiết đơn hàng
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Popup xác thực hồ sơ */}
      {popupType === "profile" && (
        <PopupXacThucHoSoCaNhan
          row={selectedRow}
          profile={selectedProfile}
          loading={profileLoading}
          error={profileError}
          verifying={verifyLoading}
          onVerify={handleVerify}
          onClose={() => setPopupType(null)}
        />
      )}
    </>
  );
}
