// pages/ThanhToanPage.jsx
import React, { useState, useEffect } from "react";
import transactionService from "../services/transactionService";
import "./ThanhToanPage.css";

// ðŸª™ Äá»‹nh dáº¡ng tiá»n VND
const formatVND = (n) =>
  (Number(n) || 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });

// ðŸ”¤ Dá»‹ch tráº¡ng thÃ¡i sang tiáº¿ng Viá»‡t
const translateStatus = (status = "") => {
  const map = {
    SUCCESS: "ThÃ nh cÃ´ng",
    FAILED: "Tháº¥t báº¡i",
    PENDING: "Äang xá»­ lÃ½",
    FULL_PAYMENT: "ÄÃ£ thanh toÃ¡n toÃ n bá»™",
    DEPOSIT: "ÄÃ£ Ä‘áº·t cá»c",
    PICKUP: "ÄÃ£ tráº£ pháº§n cÃ²n láº¡i",  
    CANCELLED: "ÄÃ£ há»§y",
    REFUND: "ÄÃ£ hoÃ n tiá»n",
    SERVICE: "ÄÃ£ thanh toÃ¡n dá»‹ch vá»¥",
    SERVICE_SERVICE: "ÄÃ£ thanh toÃ¡n dá»‹ch vá»¥ phÃ¡t sinh",
    FULL_PAYMENT_PENDING: "ÄÃ£ thanh toÃ¡n toÃ n bá»™ báº±ng tiá»n máº·t",
    DEPOSIT_PENDING: "ÄÃ£ Ä‘áº·t cá»c báº±ng tiá»n máº·t",
    PICKUP_PENDING: "ÄÃ£ tráº£ pháº§n cÃ²n láº¡i báº±ng tiá»n máº·t",
    
   
  };
  return map[status.toUpperCase()] || "KhÃ´ng xÃ¡c Ä‘á»‹nh";
};

// ðŸ”¤ Dá»‹ch loáº¡i giao dá»‹ch sang tiáº¿ng Viá»‡t
const translateType = (type = "") => {
  const typeUpper = type.toUpperCase();
  
  // Xá»­ lÃ½ cÃ¡c loáº¡i _PENDING trÆ°á»›c
  if (typeUpper.includes("_PENDING")) {
    const baseType = typeUpper.replace("_PENDING", "");
    const pendingMap = {
      "FULL_PAYMENT": "Thanh toÃ¡n toÃ n bá»™ (tiá»n máº·t)",
      "DEPOSIT": "Äáº·t cá»c (tiá»n máº·t)",
      "PICKUP": "Tráº£ pháº§n cÃ²n láº¡i (tiá»n máº·t)",
    };
    return pendingMap[baseType] || `${baseType} (tiá»n máº·t)`;
  }
  
  const map = {
    DEPOSITED: "ÄÃ£ cá»c tiá»n",
    FINAL: "ÄÃ£ thanh toÃ¡n háº¿t",
    FULL_PAYMENT: "ÄÃ£ thanh toÃ¡n toÃ n bá»™",
    DEPOSIT: "ÄÃ£ Ä‘áº·t cá»c",
    WITHDRAW: "RÃºt tiá»n",
    RENTAL_PAYMENT: "Thanh toÃ¡n thuÃª xe",
    REFUND: "HoÃ n tiá»n",
    TOP_UP: "Náº¡p tÃ i khoáº£n",
    PICKUP: "Tráº£ pháº§n cÃ²n láº¡i",
    SERVICE: "Dá»‹ch vá»¥",
    SERVICE_SERVICE: "Dá»‹ch vá»¥ phÃ¡t sinh",
  };
  return map[typeUpper] || type || "KhÃ¡c";
};

const ThanhToanPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]); // LÆ°u táº¥t cáº£ transactions Ä‘á»ƒ filter
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // ðŸš€ Láº¥y toÃ n bá»™ giao dá»‹ch khi má»Ÿ trang
  useEffect(() => {
    fetchTransactions();
  }, []);

  // ðŸ” HÃ m táº£i danh sÃ¡ch giao dá»‹ch
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await transactionService.getAllTransactions();
      const data = Array.isArray(res?.data) ? res.data : res;
      const transactionsList = data || [];
      setAllTransactions(transactionsList); // LÆ°u táº¥t cáº£ Ä‘á»ƒ filter
      setTransactions(transactionsList); // Hiá»ƒn thá»‹ táº¥t cáº£ ban Ä‘áº§u
    } catch (err) {
      console.error("âŒ Lá»—i táº£i giao dá»‹ch:", err);
      setAllTransactions([]);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // ðŸ” TÃ¬m kiáº¿m theo nhiá»u tiÃªu chÃ­ (tÃªn, sá»‘ Ä‘iá»‡n thoáº¡i, tÃªn tráº¡m) - partial match
  const handleSearch = () => {
    const query = searchQuery.trim().toLowerCase();
    
    if (!query) {
      // Náº¿u khÃ´ng cÃ³ query, hiá»ƒn thá»‹ táº¥t cáº£
      setTransactions(allTransactions);
      setError("");
      return;
    }

    setError("");
    
    // âœ… Filter theo nhiá»u tiÃªu chÃ­ vá»›i partial match
    const filtered = allTransactions.filter((t) => {
      const customerName = (t.customerName || "").toLowerCase();
      const customerPhone = (t.customerPhone || "").toLowerCase();
      const stationName = (t.stationName || "").toLowerCase();
      
      // TÃ¬m kiáº¿m partial match trong tÃªn, sá»‘ Ä‘iá»‡n thoáº¡i, hoáº·c tÃªn tráº¡m
      return (
        customerName.includes(query) ||
        customerPhone.includes(query) ||
        stationName.includes(query)
      );
    });

    setTransactions(filtered);
    
    if (filtered.length === 0) {
      setError("KhÃ´ng tÃ¬m tháº¥y dá»¯ liá»‡u giao dá»‹ch!");
    }
  };

  // âœ… Tá»± Ä‘á»™ng tÃ¬m kiáº¿m khi nháº­p (debounce)
  useEffect(() => {
    if (!allTransactions.length) return; // ChÆ°a load xong thÃ¬ khÃ´ng search
    
    const timer = setTimeout(() => {
      handleSearch();
    }, 300); // Äá»£i 300ms sau khi ngÆ°á»i dÃ¹ng ngá»«ng gÃµ

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, allTransactions]);

  return (
    <div className="page-container">
      {/* ðŸ” Form tÃ¬m kiáº¿m */}
      <div className="search-boxs">
        <h2>Tra cá»©u lá»‹ch sá»­ giao dá»‹ch</h2>
        <div className="search-form">
          <input
            type="text"
            placeholder="Nháº­p tÃªn, sá»‘ Ä‘iá»‡n thoáº¡i hoáº·c tÃªn tráº¡m..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
          <button onClick={handleSearch} disabled={loading}>
            {loading ? "Äang tÃ¬m..." : "TÃ¬m kiáº¿m"}
          </button>
        </div>
        {error && <p className="error">{error}</p>}
      </div>

      {/* ðŸ“Š Báº£ng káº¿t quáº£ */}
      {loading && <p className="loading">Äang táº£i dá»¯ liá»‡u...</p>}

      <table className="transaction-table">
        <thead>
          <tr>
            <th>TÃªn khÃ¡ch hÃ ng</th>
            <th>Sá»‘ Ä‘iá»‡n thoáº¡i</th>
            <th>TÃªn tráº¡m</th>
            <th>Sá»‘ tiá»n</th>
            <th>Tráº¡ng thÃ¡i</th>
            <th>Loáº¡i</th>
            <th>Thá»i gian</th>
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
                KhÃ´ng cÃ³ dá»¯ liá»‡u giao dá»‹ch.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ThanhToanPage;

