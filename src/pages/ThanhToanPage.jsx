import React, { useState } from "react";
import transactionService from "../services/transactionService";
import "./ThanhToanPage.css";

const ThanhToanPage = () => {
  const [userId, setUserId] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!userId.trim()) {
      setError("Vui lòng nhập mã khách hàng!");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // GỌI SERVICE THAY VÌ FETCH TRỰC TIẾP
     const response = await transactionService.searchByUserId(userId);
setTransactions(response.data || []);

    } catch (err) {
      setError("Không tìm thấy dữ liệu giao dịch!");
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
            placeholder="Nhập mã khách hàng (userId)"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <button onClick={handleSearch}>Tìm kiếm</button>
        </div>
        {error && <p className="error">{error}</p>}
      </div>

      {loading && <p className="loading">Đang tải dữ liệu...</p>}

      {!loading && transactions.length > 0 && (
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
            {transactions.map((t) => (
              <tr key={t.transactionId}>
                <td>{t.transactionId}</td>
                <td>{t.amount.toLocaleString()} ₫</td>
                <td className={`status ${t.status.toLowerCase()}`}>{t.status}</td>
                <td>{t.type}</td>
                <td>{new Date(t.createdAt).toLocaleString("vi-VN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && !error && transactions.length === 0 && (
        <p className="no-data">Không có dữ liệu giao dịch.</p>
      )}
    </div>
  );
};

export default ThanhToanPage;
