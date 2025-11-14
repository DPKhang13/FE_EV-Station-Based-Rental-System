import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api"; // axios instance

const OrderDetailCusPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [orderDetails, setOrderDetails] = useState([]);
  const [orderStatus, setOrderStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  // ============================
  // FETCH ORDER DETAILS
  // ============================
  const fetchOrderDetails = async () => {
    try {
      setLoading(true);

      const res = await api.get(`/order-details/order/${orderId}`);
      const details = Array.isArray(res)
        ? res
        : Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];

      console.log("DETAILS:", details);
      setOrderDetails(details);

      if (details.length > 0 && details[0].status) {
        setOrderStatus(details[0].status.toUpperCase());
      }
    } catch (err) {
      console.error("❌ Lỗi khi tải chi tiết đơn:", err);
      setError("Không thể tải thông tin chi tiết đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  // ============================
  // HANDLE PAYMENT
  // ============================
  const handlePayment = async (paymentType) => {
    try {
      setProcessing(true);

      const payload = {
        orderId,
        method: "captureWallet",
        paymentType,
      };

      const res = await api.post("/payment/url", payload);

      const paymentUrl = res?.paymentUrl || res?.data?.paymentUrl || "";

      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        alert("Không nhận được link thanh toán từ server!");
      }
    } catch (err) {
      console.error("❌ Thanh toán lỗi:", err);
      alert("Không thể tạo thanh toán. Vui lòng thử lại sau.");
    } finally {
      setProcessing(false);
    }
  };

  // ============================
  // UI LOADING / ERROR
  // ============================
  if (loading) {
    return (
      <div className="order-detail-page">
        <p>Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-detail-page">
        <h2>Lỗi</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>Quay lại</button>
      </div>
    );
  }

  // ============================
  // MAIN UI
  // ============================
  return (
    <div className="order-detail-page">
      <h1>Chi tiết đơn hàng</h1>
      <p>
        <strong>Mã đơn hàng:</strong> {orderId}
      </p>
      <p>
        <strong>Trạng thái:</strong> {orderStatus || "N/A"}
      </p>

      {orderDetails.length === 0 ? (
        <p>Không có dữ liệu chi tiết.</p>
      ) : (
        <>
          {/* ==============================
              BẢNG RENTAL ORDER DETAIL
             ============================== */}
          <table className="order-detail-table">
            <thead>
              <tr>
                <th>Mã chi tiết</th>
                <th>Xe</th>
                <th>Loại</th>
                <th>Thời gian thuê</th>
                <th>Giá</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {orderDetails.map((d) => {
                const type = String(d.type).toUpperCase();
                const status = String(d.status).toUpperCase();
                const isService = type.startsWith("SERVICE");
                const isPaid = status === "SUCCESS";
                const paymentType = type === "RENTAL" ? 1 : 2;

                return (
                  <tr key={d.detailId}>
                    <td>{d.detailId}</td>
                    <td>{d.vehicleId}</td>
                    <td>{type}</td>
                    <td>
                      {new Date(d.startTime).toLocaleString("vi-VN")} -{" "}
                      {new Date(d.endTime).toLocaleString("vi-VN")}
                    </td>
                    <td>{d.price?.toLocaleString("vi-VN")} VND</td>
                    <td>{status}</td>

                    <td style={{ textAlign: "center" }}>
                      {!isService ? (
                        isPaid ? (
                          <span
                            style={{
                              background: "#dcfce7",
                              color: "#166534",
                              padding: "6px 10px",
                              borderRadius: "6px",
                              fontWeight: "600",
                            }}
                          >
                            ✅ Đã thanh toán
                          </span>
                        ) : (
                          <button
                            disabled={processing}
                            onClick={() => handlePayment(paymentType)}
                            style={{
                              background:
                                paymentType === 1
                                  ? "linear-gradient(135deg, #f59e0b, #d97706)"
                                  : "linear-gradient(135deg, #16a34a, #15803d)",
                              color: "white",
                              border: "none",
                              padding: "8px 14px",
                              borderRadius: "8px",
                              fontWeight: "600",
                              cursor: "pointer",
                            }}
                          >
                            {paymentType === 1
                              ? "💰 Thanh toán cọc"
                              : "💳 Thanh toán còn lại"}
                          </button>
                        )
                      ) : (
                        <span style={{ color: "#9ca3af" }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* ==============================
              THANH TOÁN PHÍ PHÁT SINH
             ============================== */}
          {(() => {
            const serviceItems = orderDetails.filter((d) =>
              String(d.type).toUpperCase().startsWith("SERVICE")
            );

            const unpaidServices = serviceItems.filter(
              (s) => String(s.status).toUpperCase() !== "SUCCESS"
            );

            const totalServiceCost = unpaidServices.reduce(
              (sum, item) => sum + (item.price || 0),
              0
            );

            console.log("SERVICE DEBUG:", {
              unpaidServices,
              totalServiceCost,
            });

            if (unpaidServices.length === 0 || totalServiceCost <= 0)
              return null;

            return (
              <div
                style={{
                  marginTop: "20px",
                  padding: "16px",
                  background: "#f8fafc",
                  borderRadius: "10px",
                  textAlign: "center",
                }}
              >
                <h3>
                  Tổng phí phát sinh ({unpaidServices.length} mục):{" "}
                  <span style={{ color: "#2563eb" }}>
                    {totalServiceCost.toLocaleString("vi-VN")} VND
                  </span>
                </h3>

                <div style={{ marginTop: "10px", color: "#6b7280" }}>
                  {unpaidServices.map((s, idx) => (
                    <div key={idx}>
                      • {s.description || s.type}:{" "}
                      {(s.price || 0).toLocaleString("vi-VN")} VND
                    </div>
                  ))}
                </div>

                <button
                  disabled={processing}
                  onClick={() => handlePayment(5)}
                  style={{
                    marginTop: "14px",
                    background: "linear-gradient(135deg, #2563eb, #1e40af)",
                    color: "white",
                    padding: "12px 20px",
                    borderRadius: "10px",
                    fontWeight: "700",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  🛠 Thanh toán phí phát sinh
                </button>
              </div>
            );
          })()}
        </>
      )}

      <div style={{ marginTop: "24px" }}>
        <button className="btn-back" onClick={() => navigate(-1)}>
          ⬅ Quay lại
        </button>
      </div>
    </div>
  );
};

export default OrderDetailCusPage;
