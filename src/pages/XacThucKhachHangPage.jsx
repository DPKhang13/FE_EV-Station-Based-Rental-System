import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { orderService, authService } from "../services";
import "./XacThucKhachHang.css";
import PopupXacThucHoSoCaNhan from "../components/staff/PopupXacThucHoSoCaNhan";
import { AuthContext } from "../context/AuthContext";

// 🕒 Định dạng thời gian
const fmtVN = (d) => (d ? new Date(d).toLocaleString("vi-VN") : "N/A");
const fmtRange = (s, e) => `${fmtVN(s)} - ${fmtVN(e)}`;

export default function VerifyCustomerPage() {
  const { user } = useContext(AuthContext);
  const nav = useNavigate();
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [popupType, setPopupType] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);

  // 🧾 Lấy danh sách đơn hàng
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

  useEffect(() => {
    fetchOrders();
  }, []);

  // 🔍 Tìm kiếm
  const filtered = orders.filter((x) => {
    if (x.status === "COMPLETED") return false;
    const term = search.toLowerCase();
    return [x.customerName, x.phone, x.orderId]
      .some((f) => (f || "").toLowerCase().includes(term));
  });

  // 👤 Xác thực hồ sơ
  const handleOpenProfile = async (row) => {
    setSelectedRow(row);
    setPopupType("profile");
    setProfileLoading(true);
    try {
      const res = await authService.getProfilePendingVerification();
      const profiles = res.data || res || [];
      setSelectedProfile(profiles.find((p) => p.userId === row.userId) || null);
    } catch {
      setProfileError("Không tải được hồ sơ khách hàng.");
    } finally {
      setProfileLoading(false);
    }
  };

  // ✅ Duyệt hồ sơ
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

  // 📄 Xem chi tiết đơn hàng → truyền cả orderId + userId
  const handleViewOrderDetail = (orderId, userId) => {
    nav(`/staff/chitiet/${orderId}/${userId}`);
  };

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
        <p className="verify-subtitle">
          Kiểm tra giấy tờ và xử lý hồ sơ đặt xe
        </p>

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
                <th>TỔNG TIỀN</th>
                <th>XÁC THỰC HỒ SƠ</th>
                <th>THAO TÁC</th>
              </tr>
            </thead>
           <tbody>
  {filtered.map((row) => {
    // ✅ Nếu userStatus là ACTIVE hoặc ĐÃ XÁC THỰC thì coi là đã xác thực
    const verified =
      row.profileVerified ||
      ["ACTIVE", "ĐÃ XÁC THỰC", "ĐÃ XÁC THỰC (HỒ SƠ)"].includes(
        row.userStatus?.toUpperCase?.()
      );

    const delivered =
      !!row.pickedUpAt ||
      ["RENTAL", "RENTED"].includes(row.status?.toUpperCase?.());
    const deposit =
      row.depositAmount ?? Math.round(Number(row.totalPrice || 0) * 0.3);

    return (
      <tr key={row.orderId}>
        <td>
          {row.customerName}
          <br />
          <span className="verify-phone">{row.phone}</span>
        </td>
        <td>
          {(row.vehicleName || "Xe")} ({row.plateNumber || "N/A"})
        </td>
        <td>{fmtRange(row.startTime, row.endTime)}</td>
        <td>
          {Number(row.totalPrice).toLocaleString("vi-VN")} VND
          <br />
          <small>
            Cọc: {Number(deposit).toLocaleString("vi-VN")} VND
          </small>
        </td>
        <td>
          <span
            className={`verify-status ${verified ? "success" : "warning"}`}
          >
            {row.userStatus || "Chưa xác thực"}
          </span>
          {row.pickedUpAt && (
            <small>
              <br />
              Đã bàn giao: {fmtVN(row.pickedUpAt)}
            </small>
          )}
        </td>
        <td>
          {/* ❌ Nếu chưa xác thực thì mới cho bấm xác thực */}
          {!verified ? (
            <button
              className="verify-btn primary"
              onClick={() => handleOpenProfile(row)}
            >
              Xác thực hồ sơ
            </button>
          ) : (
            // ✅ Nếu đã xác thực thì chỉ cho xem chi tiết đơn hàng
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