// pages/ThanhToanPage.jsx
import React, { useState, useEffect, useContext } from "react";
import transactionService from "../services/transactionService";
import { AuthContext } from "../context/AuthContext";
import "./ThanhToanPage.css";

// 💰 Định dạng tiền VND
const formatVND = (n) =>
  (Number(n) || 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });

// 🔄 Dịch trạng thái sang tiếng Việt
const translateStatus = (status = "") => {
  const map = {
    SUCCESS: "Thành công",
    FAILED: "Thất bại",
    PENDING: "Đang xử lý",
    FULL_PAYMENT: "Đã thanh toán toàn bộ",
    DEPOSIT: "Đã đặt cọc",
    PICKUP: "Đã trả phần còn lại",  
    CANCELLED: "Đã hủy",
    REFUND: "Đã hoàn tiền",
    SERVICE: "Đã thanh toán dịch vụ",
    SERVICE_SERVICE: "Đã thanh toán dịch vụ phát sinh",
    FULL_PAYMENT_PENDING: "Đã thanh toán toàn bộ bằng tiền mặt",
    DEPOSIT_PENDING: "Đã đặt cọc bằng tiền mặt",
    PICKUP_PENDING: "Đã trả phần còn lại bằng tiền mặt",
  };
  return map[status.toUpperCase()] || "Không xác định";
};

// 🔤 Dịch loại giao dịch sang tiếng Việt
const translateType = (type = "") => {
  const typeUpper = type.toUpperCase();
  
  // Xử lý các loại _PENDING trước
  if (typeUpper.includes("_PENDING")) {
    const baseType = typeUpper.replace("_PENDING", "");
    const pendingMap = {
      "FULL_PAYMENT": "Thanh toán toàn bộ (tiền mặt)",
      "DEPOSIT": "Đặt cọc (tiền mặt)",
      "PICKUP": "Trả phần còn lại (tiền mặt)",
    };
    return pendingMap[baseType] || `${baseType} (tiền mặt)`;
  }
  
  const map = {
    DEPOSITED: "Đã cọc tiền",
    FINAL: "Đã thanh toán hết",
    FULL_PAYMENT: "Đã thanh toán toàn bộ",
    DEPOSIT: "Đã đặt cọc",
    WITHDRAW: "Rút tiền",
    RENTAL_PAYMENT: "Thanh toán thuê xe",
    REFUND: "Hoàn tiền",
    TOP_UP: "Nạp tài khoản",
    PICKUP: "Trả phần còn lại",
    SERVICE: "Dịch vụ",
    SERVICE_SERVICE: "Dịch vụ phát sinh",
  };
  return map[typeUpper] || type || "Khác";
};

const ThanhToanPage = () => {
  const { user } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]); // Lưu tất cả transactions để filter
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // ⭐ Lấy stationId của staff đang đăng nhập
  const staffStationId = user?.stationId || user?.station_id || user?.tramId || null;

  // 🚀 Lấy toàn bộ giao dịch khi mở trang hoặc khi user thay đổi
  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staffStationId]); // Re-fetch khi stationId thay đổi

  // 📁 Hàm tải danh sách giao dịch
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await transactionService.getAllTransactions();
      const data = Array.isArray(res?.data) ? res.data : res;
      const transactionsList = data || [];
      
      // ⭐ Lọc transactions theo stationId của staff (nếu có)
      let filteredTransactions = transactionsList;
      if (staffStationId) {
        filteredTransactions = transactionsList.filter((t) => {
          const transactionStationId = t.stationId || t.station_id || t.tramId || null;
          // So sánh stationId (có thể là string hoặc number)
          return String(transactionStationId) === String(staffStationId);
        });
        console.log(`🔍 [ThanhToanPage] Lọc transactions theo stationId: ${staffStationId}, Tổng: ${filteredTransactions.length}/${transactionsList.length}`);
      } else {
        console.warn("⚠️ [ThanhToanPage] Không tìm thấy stationId của staff, hiển thị tất cả transactions");
      }
      
      setAllTransactions(filteredTransactions); // Lưu transactions đã lọc
      setTransactions(filteredTransactions); // Hiển thị transactions đã lọc
    } catch (err) {
      console.error("❌ Lỗi tải giao dịch:", err);
      setAllTransactions([]);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Tìm kiếm theo nhiều tiêu chí (tên, số điện thoại, tên trạm) - partial match
  const handleSearch = () => {
    const query = searchQuery.trim().toLowerCase();
    
    if (!query) {
      // Nếu không có query, hiển thị tất cả
      setTransactions(allTransactions);
      setError("");
      return;
    
    }
    setError("");
    
    // ✅ Filter theo nhiều tiêu chí với partial match
    const filtered = allTransactions.filter((t) => {
      const customerName = (t.customerName || "").toLowerCase();
      const customerPhone = (t.customerPhone || "").toLowerCase();
      const stationName = (t.stationName || "").toLowerCase();
      
      // Tìm kiếm partial match trong tên, số điện thoại, hoặc tên trạm
      return (
        customerName.includes(query) ||
        customerPhone.includes(query) ||
        stationName.includes(query)
      );
    });

    setTransactions(filtered);
    
    if (filtered.length === 0) {
      setError("Không tìm thấy dữ liệu giao dịch!");
    }
  };

  // ✅ Tự động tìm kiếm khi nhập (debounce)
  useEffect(() => {
    if (!allTransactions.length) return; // Chưa load xong thì không search
    
    const timer = setTimeout(() => {
      handleSearch();
    }, 300); // Đợi 300ms sau khi người dùng ngừng gõ

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, allTransactions]);

  return (
    <div className="page-container">
      {/* 🔍 Form tìm kiếm */}
      <div className="search-boxs">
        <h2>Tra cứu lịch sử giao dịch</h2>
        <div className="search-form">
          <input
            type="text"
            placeholder="Nhập tên, số điện thoại hoặc tên trạm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
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
