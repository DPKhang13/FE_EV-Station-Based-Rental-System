// pages/ThanhToanPage.jsx
import React, { useState, useEffect} from "react";
import transactionService from "../services/transactionService";
import "./ThanhToanPage.css";

const formatVND = (n) =>
  Number(n ?? 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" });

const ThanhToanPage = () => {
  const [userId, setUserId] = useState("");
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
      const arr = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setTransactions(arr);
    } catch (err) {
      console.error("❌ Error loading transactions:", err);
      setTransactions([]);
    } finally {
      setLoading(false);
    } 
  }

  const handleSearch = async () => {
    if (!phone.trim()) {
      setError("Vui lòng nhập số điện thoại khách hàng!");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await transactionService.searchByUserId(phone);
      // ✅ res đã là array -> đổ thẳng vào state
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
            placeholder="Nhập mã số điện  thoại khách hàng"
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

      {/* Luôn hiển thị bảng; nếu rỗng thì hiện 1 dòng thông báo */}
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
                  {t?.status || "-"}
                </td>
                <td>{t?.type || "-"}</td>
                <td>{t?.createdAt ? new Date(t.createdAt).toLocaleString("vi-VN") : "-"}</td>
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
