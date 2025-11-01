// pages/ThanhToanPage.jsx
import React, { useState, useEffect } from "react";
import transactionService from "../services/transactionService";
import "./ThanhToanPage.css";

// Định dạng tiền VND
const formatVND = (n) =>
  Number(n ?? 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });

// 🔤 Dịch trạng thái sang tiếng Việt
const translateStatus = (status) => {
  switch ((status || "").toUpperCase()) {
    case "SUCCESS":
      return "Thành công";
    case "FAILED":
      return "Thất bại";
    case "PENDING":
      return "Đang xử lý";
    default:
      return "Không xác định";
  }
};

// 🔤 Dịch loại giao dịch sang tiếng Việt
const translateType = (type) => {
  switch ((type || "").toUpperCase()) {
    case "DEPOSIT":
      return "Đã cọc tiền";
    case "WITHDRAW":
      return "Rút tiền";
    case "RENTAL_PAYMENT":
      return "Thanh toán thuê xe";
    case "REFUND":
      return "Hoàn tiền";
    case "TOP_UP":
      return "Nạp tài khoản";
    default:
      return "Khác";
  }
};

const ThanhToanPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    getAllTransactions();
  }, []);

  const getAllTransactions = async () => {
    setLoading(true);
    try {
      const res = await transactionService.getAllTransactions();
      const arr = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : [];
      setTransactions(arr);
    } catch (err) {
      console.error("❌ Lỗi tải giao dịch:", err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!phone.trim()) {
      setError("Vui lòng nhập số điện thoại khách hàng!");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await transactionService.searchByUserId(phone);
      setTransactions(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Không tìm thấy dữ liệu giao dịch!");
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="search-box">
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

      {loading && <p className="loading">Đang tải dữ liệu...</p>}

      <table className="transaction-table">
        <thead>
          <tr>
            <th>Mã giao dịch</th>
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
                <td>{t.transactionId}</td>
                <td>{formatVND(t.amount)}</td>
                <td className={`status ${(t?.status || "").toLowerCase()}`}>
                  {translateStatus(t.status)}
                </td>
                <td>{translateType(t.type)}</td>
                <td>
                  {t?.createdAt
                    ? new Date(t.createdAt).toLocaleString("vi-VN", {
                        hour12: false,
                      })
                    : "-"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="no-data-cell">
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
