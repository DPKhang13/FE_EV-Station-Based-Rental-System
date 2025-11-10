import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authService, orderService, vehicleService } from "../services";
import "./OrderDetailPage.css";

export default function OrderDetailPage() {
  const { orderId, userId } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [order, setOrder] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [similarVehicles, setSimilarVehicles] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [confirmData, setConfirmData] = useState(null); // ✅ popup confirm custom
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Fake bảng giá dịch vụ
  const [services, setServices] = useState([
    { id: 1, serviceName: "Bồi thường hư xe", defaultPrice: 500000, description: "Xe bị hư do khách" },
    { id: 2, serviceName: "Bồi thường trầy xe", defaultPrice: 300000, description: "Xe bị trầy nhẹ" },
    { id: 3, serviceName: "Bồi thường xe dơ", defaultPrice: 100000, description: "Xe bẩn cần vệ sinh" },
    { id: 4, serviceName: "Phạt nguội", defaultPrice: 50000, description: "Đóng hộ tiền phạt" },
  ]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [actualEndTime, setActualEndTime] = useState(null);



  useEffect(() => {
    const fetchData = async () => {
      try {
        const resCus = await authService.getAllCustomer();
        const customers = resCus.data || resCus || [];
        const foundCustomer = customers.find(
          (c) => String(c.userId).toLowerCase() === String(userId).toLowerCase()
        );
        setCustomer(foundCustomer || null);

        const resOrder = await orderService.get(orderId);
        const orderData = resOrder.data || resOrder || {};
        setOrder(orderData);

        if (orderData.vehicleId) {
          const resVehicles = await vehicleService.getVehicles();
          const vehicles = resVehicles.data || resVehicles || [];
          const foundVehicle = vehicles.find(
            (v) => Number(v.vehicleId) === Number(orderData.vehicleId)
          );
          setVehicle(foundVehicle || null);

          // 🔹 Xe tương tự (cùng tên, cùng trạm, sẵn sàng)
          const similar = vehicles.filter(
            (v) =>
              v.vehicleId !== foundVehicle?.vehicleId &&
              v.vehicleName === foundVehicle?.vehicleName &&
              v.status === "AVAILABLE" &&
              v.stationId === foundVehicle?.stationId
          );
          setSimilarVehicles(similar);
        }
      } catch (err) {
        console.error("❌ Lỗi tải dữ liệu:", err);
        setError("Không thể tải thông tin đơn hàng hoặc khách hàng.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orderId, userId]);

  const fmtVN = (d) => (d ? new Date(d).toLocaleString("vi-VN") : "N/A");

  // ✅ Popup confirm hiển thị
  const confirmAction = (message, onConfirm) => {
    setConfirmData({ message, onConfirm });
  };

  // 🔁 Đổi xe tương tự
  const handleChangeVehicle = async (newVehicleId) => {
    confirmAction("Bạn có chắc muốn **đổi sang xe này** không?", async () => {
      try {
        const body = {
          status: order.status,
          vehicleId: newVehicleId,
          couponCode: order.couponCode || "",
        };
        await orderService.update(orderId, body);
        alert("✅ Đổi xe thành công!");
        setOrder((prev) => ({ ...prev, vehicleId: newVehicleId }));
        setVehicle(similarVehicles.find((v) => v.vehicleId === newVehicleId));
        setShowPopup(false);
      } catch (err) {
        console.error("❌ Lỗi đổi xe:", err);
        alert("Không thể đổi xe, vui lòng thử lại!");
      }
    });
  };

  // ✅ Xác nhận bàn giao
  const handlePickup = () => {
    confirmAction("Bạn có chắc muốn **xác nhận bàn giao xe cho khách** không?", async () => {
      try {
        await orderService.pickup(orderId);
        alert("✅ Đã bàn giao xe thành công!");
        setOrder((prev) => ({ ...prev, status: "RENTED" }));
      } catch (err) {
        console.error("❌ Lỗi bàn giao xe:", err);
        alert("Không thể bàn giao xe!");
      }
    });
  };

  // ❌ Hủy đơn & hoàn cọc
  const handleCancelOrder = () => {
    confirmAction("Bạn có chắc muốn **hủy đơn và hoàn cọc cho khách** không?", async () => {
      try {
        const body = {
          status: "CANCELLED",
          vehicleId: order.vehicleId,
          couponCode: order.couponCode || "",
        };
        await orderService.update(orderId, body);
        alert("❌ Đã hủy đơn và hoàn cọc!");
        setOrder((prev) => ({ ...prev, status: "CANCELLED" }));
      } catch (err) {
        console.error("❌ Lỗi hủy đơn:", err);
        alert("Không thể hủy đơn, vui lòng thử lại!");
      }
    });
  };

  const handleConfirmYes = async () => {
    if (confirmData?.onConfirm) await confirmData.onConfirm();
    setConfirmData(null);
  };

  const handleConfirmNo = () => setConfirmData(null);

  if (loading)
    return (
      <div className="order-detail-page">
        <div className="loading">Đang tải dữ liệu...</div>
      </div>
    );

  if (error)
    return (
      <div className="order-detail-page">
        <div className="error">{error}</div>
      </div>
    );

  return (
    <div className="order-detail-page">
      <div className="header">
        <h1>Chi tiết đơn hàng</h1>
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Quay lại
        </button>
      </div>

      {/* 👤 Thông tin khách hàng */}
      {customer && (
        <div className="info-card">
          <h2>Thông tin khách hàng</h2>
          <div className="info-grid">
            <p><span>Họ tên:</span> {customer.fullName || "Không có dữ liệu"}</p>
            <p><span>Email:</span> {customer.email || "Không có dữ liệu"}</p>
            <p><span>Số điện thoại:</span> {customer.phone || "Không có dữ liệu"}</p>
          </div>
        </div>
      )}

      {/* 🚘 Thông tin đơn hàng */}
      {order && (
        <div className="info-card">
          <h2>Thông tin đơn hàng</h2>
          <div className="info-grid">
            <p>
              <span>Xe thuê:</span>{" "}
              {vehicle
                ? `${vehicle.vehicleName} (${vehicle.plateNumber})`
                : "Không rõ"}
            </p>
            <p>
              <span>Thời gian thuê:</span>{" "}
              {fmtVN(order.startTime)} - {fmtVN(order.endTime)}
            </p>
            <p>
              <span>Tổng tiền:</span>{" "}
              {Number(order.totalPrice || 0).toLocaleString("vi-VN")} VND
            </p>
            <p>
              <span>Tiền cọc:</span>{" "}
              {Number(order.depositAmount || order.totalPrice * 0.3 || 0).toLocaleString("vi-VN")} VND
            </p>
            <p>
              <span>Trạng thái:</span>{" "}
              <span className={`status-tag ${order.status?.toLowerCase()}`}>
                {order.status || "N/A"}
              </span>
            </p>
          </div>

          {/* ⚙️ Hành động */}
          {order.status === "DEPOSITED" && (
            <div className="action-section">
              <h3 className="action-title">Hành động</h3>
              <div className="action-buttons">
                <button className="action-btn pickup" onClick={handlePickup}>
                  ✅ Xác nhận bàn giao
                </button>
                <button className="action-btn cancel" onClick={handleCancelOrder}>
                  ❌ Hủy đơn & Hoàn cọc
                </button>
                <button
                  className="action-btn change"
                  onClick={() => setShowPopup(true)}
                  disabled={similarVehicles.length === 0}
                >
                  🔁 Đổi xe tương tự
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {/* 🚗 Nếu đang thuê (RENTAL) → hiển thị khung nhận lại xe & thanh toán */}
      {/* 🚗 Nếu đang thuê (RENTAL) → hiển thị khung nhận lại xe & thanh toán */}
      {order.status === "RENTAL" && (
        <div className="payment-section">
          <h2> Nhận lại xe & Thanh toán</h2>
          <div className="payment-grid">
            <p><span>Thời gian bắt đầu:</span> {fmtVN(order.startTime)}</p>
            <p>
              <span>Thời gian kết thúc thực tế:</span>{" "}
              {actualEndTime ? (
                <b style={{ color: "#2563eb" }}>{fmtVN(actualEndTime)}</b>
              ) : (
                <em style={{ color: "#94a3b8" }}>Chưa lấy</em>
              )}
              <button
                className="btn-now"
                onClick={() => setActualEndTime(new Date())}
              >
                📅 Lấy thời gian hiện tại
              </button>
            </p>

            <p><span>Tổng tiền thuê:</span> {Number(order.totalPrice || 0).toLocaleString("vi-VN")} VND</p>
            <p><span>Tiền đã cọc:</span> {Number(order.depositAmount || 0).toLocaleString("vi-VN")} VND</p>
          </div>

          {/* ✅ Checklist dịch vụ có thể chỉnh sửa */}
          <div className="service-checklist">
            <h3>Bảng giá dịch vụ khác</h3>
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>Tên dịch vụ</th>
                  <th>Giá (đ)</th>
                  <th>Mô tả</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(s)}
                        onChange={() => {
                          if (selectedServices.includes(s)) {
                            setSelectedServices(selectedServices.filter((x) => x !== s));
                          } else {
                            setSelectedServices([...selectedServices, s]);
                          }
                        }}
                      />
                    </td>
                    <td>{s.serviceName}</td>

                    {/* Ô giá — cho edit inline */}
                    <td>
                      {s.isEditing ? (
                        <input
                          type="number"
                          value={s.defaultPrice}
                          onChange={(e) => {
                            const newPrice = Number(e.target.value);
                            setServices((prev) =>
                              prev.map((x) =>
                                x.id === s.id ? { ...x, defaultPrice: newPrice } : x
                              )
                            );
                          }}
                          className="edit-input"
                        />
                      ) : (
                        `${s.defaultPrice.toLocaleString("vi-VN")}đ`
                      )}
                    </td>

                    {/* Ô mô tả — edit inline */}
                    <td>
                      {s.isEditing ? (
                        <input
                          type="text"
                          value={s.description}
                          onChange={(e) => {
                            const newDesc = e.target.value;
                            setServices((prev) =>
                              prev.map((x) =>
                                x.id === s.id ? { ...x, description: newDesc } : x
                              )
                            );
                          }}
                          className="edit-input"
                        />
                      ) : (
                        s.description
                      )}
                    </td>

                    {/* Nút hành động */}
                    <td>
                      <button
                        className={`edit-btn ${s.isEditing ? "save" : ""}`}
                        onClick={() =>
                          setServices((prev) =>
                            prev.map((x) =>
                              x.id === s.id ? { ...x, isEditing: !x.isEditing } : x
                            )
                          )
                        }
                      >
                        {s.isEditing ? " Lưu" : " Sửa"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tổng kết */}
          <div className="payment-summary">
            <p>
              <strong>Tổng phụ phí:</strong>{" "}
              {selectedServices
                .reduce((sum, s) => sum + (s.defaultPrice || 0), 0)
                .toLocaleString("vi-VN")}đ
            </p>
            <p>
              <strong>Tổng thanh toán cuối cùng:</strong>{" "}
              {(Number(order.totalPrice || 0) +
                selectedServices.reduce((sum, s) => sum + (s.defaultPrice || 0), 0)
              ).toLocaleString("vi-VN")}đ
            </p>
          </div>

          {/* 💳 Phương thức thanh toán */}
<div className="payment-method">
  <h3>Phương thức thanh toán</h3>
  <div className="method-buttons">
    <button
      className="btn-send-payment"
      onClick={() => {
        confirmAction(
          "Gửi yêu cầu thanh toán cho khách hàng qua VNPay?",
          async () => {
            try {
              // 🔹 Call API tạo yêu cầu thanh toán ở đây
              alert("✅ Đã gửi yêu cầu thanh toán cho khách hàng!");
            } catch (err) {
              console.error("❌ Lỗi gửi yêu cầu:", err);
              alert("Không thể gửi yêu cầu thanh toán!");
            }
          }
        );
      }}
    >
      Gửi yêu cầu thanh toán cho khách hàng
    </button>

    <button
      className="btn-cash-confirm"
      onClick={() => {
        confirmAction(
          "Xác nhận khách hàng đã thanh toán <b>bằng tiền mặt</b>?",
          async () => {
            try {
              const body = {
                status: "COMPLETED",
                paymentMethod: "CASH",
                endTime: actualEndTime?.toISOString() || new Date().toISOString(),
                servicesUsed: selectedServices,
              };
              await orderService.update(orderId, body);
              alert("✅ Đã xác nhận thanh toán tiền mặt và hoàn tất đơn!");
              setOrder((prev) => ({ ...prev, status: "COMPLETED" }));
            } catch (err) {
              console.error("❌ Lỗi xác nhận thanh toán:", err);
              alert("Không thể xác nhận thanh toán!");
            }
          }
        );
      }}
    >
      Xác nhận khách đã thanh toán tiền mặt
    </button>
  </div>
</div>

        </div>
      )}



      {/* 🔹 Popup chọn xe tương tự */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Chọn xe thay thế</h3>
            {similarVehicles.length > 0 ? (
              <ul className="vehicle-list">
                {similarVehicles.map((v) => (
                  <li key={v.vehicleId}>
                    <span>
                      {v.vehicleName} – {v.plateNumber} ({v.color})
                    </span>
                    {order.vehicleId === v.vehicleId ? (
                      <button className="done-btn" disabled>
                        ✅ Đã đổi
                      </button>
                    ) : (
                      <button
                        onClick={() => handleChangeVehicle(v.vehicleId)}
                        className="confirm-btn"
                      >
                        Đổi sang xe này
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Không có xe tương tự khả dụng</p>
            )}
            <button className="close-btn" onClick={() => setShowPopup(false)}>
              ✖ Đóng
            </button>
          </div>
        </div>
      )}

      {/* 🔸 Popup xác nhận */}
      {confirmData && (
        <div className="popup-overlay">
          <div className="confirm-popup">
            <h3>⚠️ Xác nhận hành động</h3>
            <p dangerouslySetInnerHTML={{ __html: confirmData.message }} />
            <div className="confirm-buttons">
              <button className="confirm-yes" onClick={handleConfirmYes}>
                ✅ Đồng ý
              </button>
              <button className="confirm-no" onClick={handleConfirmNo}>
                ❌ Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
