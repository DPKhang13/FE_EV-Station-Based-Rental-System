// pages/ThanhToanPage.jsx
import React, { useState, useEffect } from "react";
import transactionService from "../services/transactionService";
import "./ThanhToanPage.css";

// 🪙 Định dạng tiền VND
const formatVND = (n) =>
  (Number(n) || 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });

// 🔤 Dịch trạng thái sang tiếng Việt
const translateStatus = (status = "") => {
  const map = {
    SUCCESS: "Thành công",
    FAILED: "Thất bại",
    PENDING: "Đang xử lý",
  };
  return map[status.toUpperCase()] || "Không xác định";
};

// 🔤 Dịch loại giao dịch sang tiếng Việt
const translateType = (type = "") => {
  const map = {
    DEPOSITED: "Đã cọc tiền",
    FINAL: "Đã thanh toán hết",
    FULL_PAYMENT: "Đã thanh toán toàn bộ",
    DEPOSIT: "Đã cọc tiền",
    WITHDRAW: "Rút tiền",
    RENTAL_PAYMENT: "Thanh toán thuê xe",
    REFUND: "Hoàn tiền",
    TOP_UP: "Nạp tài khoản",
    PICKUP: "Tiền còn lại sau cọc",
    PICKUP_PENDING : "Trả phần còn lại bằng tiền mặt",
    DEPOSIT_PENDING : "Cọc bằng tiền mặt",
    FULL_PAYMENT_PENDING : "Thanh toán toàn bộ bằng tiền mặt",
    SERVICE : "Thanh toán dịch vụ",
    SERVICE_SERVICE : "Thanh toán dịch vụ phát sinh",
  };
  return map[type.toUpperCase()] || "Khác";
};

const ThanhToanPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");

  // 🚀 Lấy toàn bộ giao dịch khi mở trang
  useEffect(() => {
    fetchTransactions();
  }, []);

  // 🔁 Hàm tải danh sách giao dịch
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await transactionService.getAllTransactions();
      const data = Array.isArray(res?.data) ? res.data : res;
      setTransactions(data || []);
    } catch (err) {
      console.error("❌ Lỗi tải giao dịch:", err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Tra cứu theo số điện thoại
  const handleSearch = async () => {
    if (!phone.trim()) {
      fetchTransactions();
      return;
    
    }
    setError("");
    try {
      setLoading(true);
      const res = await transactionService.searchByUserId(phone);
      setTransactions(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("❌ Lỗi tìm kiếm:", err);
      setError("Không tìm thấy dữ liệu giao dịch!");
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      {/* 🔍 Form tìm kiếm */}
      <div className="search-boxs">
        <h2>Tra cứu lịch sử giao dịch</h2>
        <div className="search-form">
          <input
            type="text"
            placeholder="Nhập số điện thoại khách hàng"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button onClick={handleSearch} disabled={loading}>
            {loading ? "Đang tìm..." : "Tìm kiếm"}
          </button>
        </div>
        {error && <p className="error">{error}</p>}
      </div>

      {/* 📊 Bảng kết quả */}
      {loading && <p className="loading">Đang tải dữ liệu...</p>}

      <table className="transaction-table">
        <thead>
          <tr>
            <th>Tên khách hàng</th>
            <th>Số điện thoại</th>
            <th>Tên trạm</th>
            <th>Số tiền</th>
            <th>Trạng thái</th>
            <th>Loại</th>
            <th>Thời gian</th>
          </tr>
        </thead>

        <tbody>
          {transactions.length > 0 ? (
            transactions.map((t) => (
              <tr key={t.transactionId}>
                <td>{t.customerName || "N/A"}</td>
                <td>{t.customerPhone || "N/A"}</td>
                <td>{t.stationName || "N/A"}</td>
                <td>{formatVND(t.amount)}</td>
                <td className={`status ${t.status?.toLowerCase()}`}>
                  {translateStatus(t.status)}
                </td>
                <td>{translateType(t.type)}</td>
                <td>
                  {t.createdAt
                    ? new Date(t.createdAt).toLocaleString("vi-VN", {
                        hour12: false,
                      })
                    : "-"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="no-data-cell">
                Không có dữ liệu giao dịch.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ThanhToanPage;
