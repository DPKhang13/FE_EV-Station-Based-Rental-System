import React, { useState, useEffect } from "react";
import { orderService, authService } from "../services";
import "./XacThucKhachHang.css";
import PopupXacThucHoSoCaNhan from "../components/staff/PopupXacThucHoSoCaNhan";

const BOOKING_STATUSES = new Set(["DEPOSITED", "RENTAL", "COMPLETED"]);

const fmtVN = (dateStr) => {
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? "N/A" : d.toLocaleString("vi-VN");
};
const fmtRange = (start, end) => `${fmtVN(start)} - ${fmtVN(end)}`;

const XacThucKhachHangPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);
  const [popupType, setPopupType] = useState(null);
  const [hoSoDatXe, setHoSoDatXe] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);

  const loadOrders = async () => {
  try {
    setLoading(true);
    const res = await orderService.getPendingOrders();
    const arr = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
    setHoSoDatXe(arr);
  } catch (error) {
    console.error("❌ Error loading orders:", error);
    setHoSoDatXe([]);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  loadOrders();
}, []);


  const filteredDatXe = hoSoDatXe.filter((item) =>
    (item.customerName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.phone || "").includes(searchTerm) ||
    (item.orderId || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // mở popup + tải hồ sơ chờ xác thực theo userId
  const handleOpenXacThuc = async (row) => {
    setSelectedRow(row);
    setPopupType("caNhan");
    setProfileLoading(true);
    setProfileError(null);
    setSelectedProfile(null);

    try {
      const raw = await authService.getProfilePendingVerification();
      const list = Array.isArray(raw) ? raw : (raw?.data || raw?.items || []);
      const profile = list.find((p) => p.userId === row.userId) || null;
      setSelectedProfile(profile);
    } catch (err) {
      console.error("❌ Lỗi tải hồ sơ chờ xác thực:", err);
      setProfileError("Không tải được hồ sơ chờ xác thực. Vui lòng thử lại.");
    } finally {
      setProfileLoading(false);
    }
  };
  // 🚗 Bàn giao xe (pickup)
const handleBanGiaoXe = async (row) => {
  if (!row?.orderId) return;

  if (!window.confirm(`Xác nhận bàn giao xe cho khách hàng ${row.customerName}?`)) {
    return;
  }

  try {
    // Gọi API pickup
    await orderService.pickup(row.orderId, {
      note: "Bàn giao xe cho khách hàng", // bạn có thể truyền thêm dữ liệu nếu backend yêu cầu
    });

    // ✅ Cập nhật lại trạng thái trong FE
    setHoSoDatXe((prev) =>
      prev.map((r) =>
        r.orderId === row.orderId
          ? {
              ...r,
              status: "RENTAL",
              pickedUpAt: new Date().toISOString(), // để hiển thị "Đã bàn giao"
            }
          : r
      )
    );

    alert(`🚗 Đã bàn giao xe cho ${row.customerName}`);
  } catch (err) {
    console.error("❌ Lỗi khi bàn giao xe:", err);
    alert("Không thể bàn giao xe. Vui lòng thử lại.");
  }
};


  // Xác nhận xác thực hồ sơ: PUT /auth/verify-profile/{userId}
  const handleVerifyProfile = async () => {
    if (!selectedRow?.userId) return;
    setVerifyLoading(true);
    setProfileError(null);
    try {
      const updated = await authService.verifyProfileByUserId(selectedRow.userId);
      const updatedObj = Array.isArray(updated) ? updated[0] : updated;

      // 1) Cập nhật trạng thái hiển thị trong bảng để hiện nút "Bàn giao xe"
      setHoSoDatXe((prev) =>
      prev.map((r) =>
        r.userId === selectedRow.userId
          ? {
              ...r,
              profileVerified: true,
              userStatus: "ĐÃ XÁC THỰC (HỒ SƠ)", // 🔥 cập nhật trạng thái ngay
            }
          : r
      )
    );

      // 2) (tuỳ chọn) nếu vẫn muốn cập nhật trạng thái trong popup trước khi đóng
      setSelectedProfile((prev) => ({
        ...(prev || {}),
        ...(updatedObj || {}),
        status: updatedObj?.status || "ACTIVE", // backend của bạn trả "ACTIVE"
      }));

      // 3) Đóng popup
      setPopupType(null);
      setSelectedRow(null);

      // 4) Thông báo
      alert("Đã xác thực hồ sơ khách hàng.");
    } catch (err) {
      console.error("❌ Xác thực hồ sơ thất bại:", err);
      setProfileError("Xác thực hồ sơ thất bại. Vui lòng thử lại.");
    } finally {
      setVerifyLoading(false);
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

        <input
          type="text"
          placeholder="🔍 Tìm kiếm theo họ tên, SĐT, mã đơn..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-box"
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
                // ✅ ĐÃ SỬA: coi như "đã xác thực" nếu profileVerified = true
                const isProfileVerified =
  row.profileVerified === true ||
  row.userStatus?.includes("ĐÃ XÁC THỰC");
                const isVerified = isProfileVerified || ["COMPLETED", "RENTAL"].includes(row.status);

                const deposit =
                  typeof row.depositAmount === "number" && !isNaN(row.depositAmount)
                    ? row.depositAmount
                    : Math.round(Number(row.totalPrice || 0) * 0.3);

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
                      <small>Cọc: {deposit.toLocaleString("vi-VN")} VND</small>
                    </td>
                    <td>
  <span
    className={`status ${
      row.userStatus?.includes("ĐÃ XÁC THỰC") ? "success" : "warning"
    }`}
  >
    {row.userStatus || "Không xác định"}
  </span>

  {row.confirmedAt && (
    <>
      <br />
      <small>{fmtVN(row.confirmedAt)}</small>
    </>
  )}
  {row.pickedUpAt && (
    <>
      <br />
      <small>Đã bàn giao: {fmtVN(row.pickedUpAt)}</small>
    </>
  )}
</td>

                   <td>
  {/* Nếu đã bàn giao rồi → chỉ hiện "Đã bàn giao" */}
  {row.status === "RENTAL" ? (
    <button className="btn-secondary" disabled>
      Đã bàn giao
    </button>
  ) : (
    <>
      {/* Nếu chưa xác thực → hiện nút xác thực */}
      {!isVerified && (
        <button
          className="btn-primary"
          onClick={() => handleOpenXacThuc(row)}
        >
          Xác thực hồ sơ
        </button>
      )}

      {/* Nếu đã xác thực hồ sơ → hiện nút bàn giao */}
      {isVerified && (
        <button
          className="btn-success"
          onClick={() => handleBanGiaoXe(row)}
          style={{ marginLeft: 8 }}
        >
          Bàn giao xe
        </button>
      )}

      {/* Nút từ chối bàn giao (luôn có nếu chưa PICKED_UP) */}
      <button
        className="btn-danger"
        onClick={() => handleTuChoiBanGiao(row)}
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
