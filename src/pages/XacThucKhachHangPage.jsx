import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { orderService, authService } from "../services";
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

  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [popupType, setPopupType] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  

  // 🧾 Lấy đơn hàng theo trạm
  const fetchOrders = async () => {
    try {
      const res = await orderService.getPendingOrders();
      const data = res.data || res || [];
      const stationId = user?.stationId || 1;

      setOrders(data.filter((o) => Number(o.stationId) === Number(stationId)));
    } catch (err) {
      console.error("❌ Lỗi tải hồ sơ:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // 🚉 Fetch toàn bộ trạm
  const fetchStations = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/rentalstation/getAll");
      const data = await res.json();
      setStations(data || []);
    } catch (err) {
      console.error("❌ Không thể tải danh sách trạm:", err);
    }
  };

  useEffect(() => {
    // ✅ Chạy lại khi user data ready (có stationId) hoặc location thay đổi
    if (user?.stationId) {
      console.log('👤 User ready with stationId:', user.stationId);
      fetchOrders();
    }
    fetchStations(); 
  }, [user?.stationId, location]); // ✅ Thêm user.stationId và location vào dependency

  // ✅ Tự động mở chi tiết đơn hàng khi navigate từ GiaoTraXe
  useEffect(() => {
    if (location.state?.autoOpenOrderDetail && orders.length > 0) {
      const { autoOpenOrderDetail: orderId, userId } = location.state;
      console.log('🎯 Auto opening order detail:', { orderId, userId });
      // Không cần delay, orders đã ready
      handleViewOrderDetail(orderId, userId);
    }
  }, [location.state?.autoOpenOrderDetail, orders]);

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

  if (loading)
    return (
      <div className="verify-container">
        <h1 className="verify-title">Xác thực khách hàng</h1>
        <p style={{ textAlign: "center", padding: 40 }}>Đang tải dữ liệu...</p>
      </div>
    );

  return (
    <>
      <div className="verify-container">
        <h1 className="verify-title">Xác thực khách hàng</h1>
        <p className="verify-subtitle">Kiểm tra giấy tờ và xử lý hồ sơ đặt xe</p>

        {/* 🔍 Tìm kiếm */}
        <input
          className="verify-search"
          type="text"
          placeholder="Tìm kiếm theo họ tên, SĐT, mã đơn..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

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

                // ⭐ Tìm trạm theo stationId
                const station = stations.find(
                  (s) => Number(s.stationid) === Number(row.stationId)
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
