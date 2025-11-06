import React, { useState, useEffect } from "react";
import { orderService, authService } from "../services";
import "./XacThucKhachHang.css";
import PopupXacThucHoSoCaNhan from "../components/staff/PopupXacThucHoSoCaNhan";
import { AuthContext } from "../context/AuthContext";


// 🔧 Định dạng thời gian
const fmtVN = (d) =>
  d ? new Date(d).toLocaleString("vi-VN") : "N/A";
const fmtRange = (s, e) => `${fmtVN(s)} - ${fmtVN(e)}`;

const XacThucKhachHangPage = () => {
  const [hoSoDatXe, setHoSoDatXe] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [popupType, setPopupType] = useState(null);

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);

  // 📦 Lấy danh sách hồ sơ đặt xe
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await orderService.getPendingOrders();
        setHoSoDatXe(res.data || res || []);
      } catch (err) {
        console.error("❌ Lỗi tải hồ sơ:", err);
        setHoSoDatXe([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // 🔍 Lọc theo tên / sđt / mã đơn
  const filteredDatXe = hoSoDatXe.filter((x) =>
    [x.customerName, x.phone, x.orderId]
      .some((f) => (f || "").toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // 🧾 Xem hồ sơ cá nhân chờ xác thực
  const handleOpenXacThuc = async (row) => {
    setSelectedRow(row);
    setPopupType("caNhan");
    setProfileLoading(true);
    try {
      const res = await authService.getProfilePendingVerification();
      const profiles = res.data || res || [];
      setSelectedProfile(profiles.find((p) => p.userId === row.userId) || null);
    } catch {
      setProfileError("Không tải được hồ sơ chờ xác thực.");
    } finally {
      setProfileLoading(false);
    }
  };

  // 🚗 Bàn giao xe
  const handleBanGiaoXe = async (row) => {
    if (!window.confirm(`Bàn giao xe cho ${row.customerName}?`)) return;
    try {
      await orderService.pickup(row.orderId, { note: "Bàn giao xe" });
      setHoSoDatXe((prev) =>
        prev.map((r) =>
          r.orderId === row.orderId
            ? { ...r, status: "RENTAL", pickedUpAt: new Date().toISOString() }
            : r
        )
      );
      alert(`🚗 Đã bàn giao xe cho ${row.customerName}`);
    } catch {
      alert("❌ Không thể bàn giao xe. Vui lòng thử lại.");
    }
  };

  // ✅ Xác thực hồ sơ khách hàng
  const handleVerifyProfile = async () => {
    if (!selectedRow?.userId) return;
    setVerifyLoading(true);
    try {
      const res = await authService.verifyProfileByUserId(selectedRow.userId);
      setHoSoDatXe((prev) =>
        prev.map((r) =>
          r.userId === selectedRow.userId
            ? { ...r, profileVerified: true, userStatus: "ĐÃ XÁC THỰC (HỒ SƠ)" }
            : r
        )
      );
      setSelectedProfile((p) => ({ ...(p || {}), status: "ACTIVE" }));
      setPopupType(null);
      alert("✅ Đã xác thực hồ sơ khách hàng.");
    } catch {
      setProfileError("Xác thực hồ sơ thất bại.");
    } finally {
      setVerifyLoading(false);
    }
  };

  if (loading)
    return (
      <div className="xacThuc-container">
        <h1 className="title">Xác thực khách hàng</h1>
        <p style={{ textAlign: "center", padding: 40 }}>Đang tải dữ liệu...</p>
      </div>
    );

  return (
    <>
      <div className="xacThuc-container">
        <h1 className="title">Xác thực khách hàng</h1>
        <p className="subtitle">Kiểm tra giấy tờ và xử lý hồ sơ đặt xe</p>

        <input
          className="search-box"
          type="text"
          placeholder="Tìm kiếm theo họ tên, SĐT, mã đơn..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

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
              {filteredDatXe.map((row) => {
                const isProfileVerified =
                  row.profileVerified || row.userStatus?.includes("ĐÃ XÁC THỰC");
                const isVerified =
                  isProfileVerified ||
                  ["COMPLETED", "RENTAL"].includes(row.status);

                const deposit =
                  row.depositAmount ??
                  Math.round(Number(row.totalPrice || 0) * 0.3);

                return (
                  <tr key={row.orderId}>
                    <td>{row.orderId}</td>
                    <td>
                      {row.customerName || "Khách hàng"}
                      <br />
                      <span className="phone">{row.phone || "N/A"}</span>
                    </td>
                    <td>
                      {(row.vehicleName || "Xe")} ({row.plateNumber || "N/A"})
                    </td>
                    <td>{fmtRange(row.startTime, row.endTime)}</td>
                    <td>
                      {Number(row.totalPrice || 0).toLocaleString("vi-VN")} VND
                      <br />
                      <small>
                        Cọc: {Number(deposit).toLocaleString("vi-VN")} VND
                      </small>
                    </td>

                    <td>
                      <span
                        className={`status ${
                          row.userStatus?.includes("ĐÃ XÁC THỰC")
                            ? "success"
                            : "warning"
                        }`}
                      >
                        {row.userStatus || "Chưa xác thực"}
                      </span>
                      {row.pickedUpAt && (
                        <>
                          <br />
                          <small>Đã bàn giao: {fmtVN(row.pickedUpAt)}</small>
                        </>
                      )}
                    </td>

                    <td>
                      {row.status === "RENTAL" ? (
                        <button className="btn-secondary" disabled>
                          Đã bàn giao
                        </button>
                      ) : (
                        <>
                          {!isVerified && (
                            <button
                              className="btn-primary"
                              onClick={() => handleOpenXacThuc(row)}
                            >
                              Xác thực hồ sơ
                            </button>
                          )}
                          {isVerified && (
                            <button
                              className="btn-success"
                              onClick={() => handleBanGiaoXe(row)}
                              style={{ marginLeft: 8 }}
                            >
                              Bàn giao xe
                            </button>
                          )}
                          <button
                            className="btn-danger"
                            style={{ marginLeft: 8 }}
                          >
                            Từ chối bàn giao
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {popupType === "caNhan" && (
        <PopupXacThucHoSoCaNhan
          row={selectedRow}
          profile={selectedProfile}
          loading={profileLoading}
          error={profileError}
          verifying={verifyLoading}
          onVerify={handleVerifyProfile}
          onClose={() => setPopupType(null)}
        />
      )}
    </>
  );
};

export default XacThucKhachHangPage;
