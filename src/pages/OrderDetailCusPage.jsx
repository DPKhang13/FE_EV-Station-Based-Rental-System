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

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/order-details/order/${orderId}`);
      const details = Array.isArray(res)
        ? res
        : Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];

      console.log("✅ Parsed order details:", details);
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

  // ✅ Gọi API thanh toán
  const handlePayment = async (paymentType) => {
    if (!orderId) return alert("Không tìm thấy mã đơn hàng!");

    try {
      setProcessing(true);
      console.log("💳 Bắt đầu thanh toán:", { orderId, paymentType });

      const payload = {
        orderId,
        method: "captureWallet",
        paymentType,
      };

      const res = await api.post("/payment/url", payload);
      console.log("✅ Kết quả API:", res);

      const paymentUrl =
        res?.paymentUrl || res?.data?.paymentUrl || "";

      if (paymentUrl && typeof paymentUrl === "string") {
        console.log("🌍 Redirecting to:", paymentUrl);
        window.location.href = paymentUrl;
      } else {
        console.warn("⚠️ Không tìm thấy paymentUrl trong response:", res);
        alert("Không nhận được link thanh toán từ server!");
      }
    } catch (err) {
      console.error("❌ Lỗi khi tạo thanh toán:", err);
      alert("Không thể tạo thanh toán. Vui lòng thử lại sau.");
    } finally {
      setProcessing(false);
    }
  };

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
      <p>Không có dữ liệu chi tiết cho đơn hàng này.</p>
    ) : (
      <>
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
              const isPaid = status === "SUCCESS";
              const paymentType = type === "RENTAL" ? 1 : 2;

              const isService = type.startsWith("SERVICE");

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
                    {/* ❌ Không hiển thị nút cho SERVICE */}
                    {!isService && (
                      <>
                        {isPaid ? (
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
                                  ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                                  : "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                              color: "white",
                              border: "none",
                              padding: "8px 14px",
                              borderRadius: "8px",
                              fontWeight: "600",
                              cursor: "pointer",
                              boxShadow:
                                paymentType === 1
                                  ? "0 4px 10px rgba(245,158,11,0.4)"
                                  : "0 4px 10px rgba(22,163,74,0.4)",
                            }}
                          >
                            {paymentType === 1
                              ? "💰 Thanh toán cọc"
                              : "💳 Thanh toán còn lại"}
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* ⭐ THANH TOÁN DỊCH VỤ ⭐ */}
        {(() => {
          const serviceItems = orderDetails.filter((d) =>
            String(d.type).toUpperCase().startsWith("SERVICE")
          );
          const serviceTotal = serviceItems.reduce(
            (sum, item) => sum + (item.price || 0),
            0
          );

          if (serviceTotal <= 0) return null;

          return (
            <div
              style={{
                marginTop: "20px",
                padding: "16px",
                textAlign: "center",
                background: "#f8fafc",
                borderRadius: "10px",
              }}
            >
              <h3>
                Tổng tiền dịch vụ:{" "}
                <span style={{ color: "#2563eb" }}>
                  {serviceTotal.toLocaleString("vi-VN")} VND
                </span>
              </h3>

              <button
                disabled={processing}
                onClick={() => handlePayment(5)}
                style={{
                  marginTop: "12px",
                  background: "linear-gradient(135deg, #2563eb, #1e40af)",
                  color: "white",
                  padding: "10px 20px",
                  borderRadius: "10px",
                  fontWeight: "700",
                  cursor: "pointer",
                  border: "none",
                }}
              >
                🛠 Thanh toán dịch vụ
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
