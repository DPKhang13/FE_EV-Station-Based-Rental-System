// components/admin/ChiTietDonTrongAdmin.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../../services/api";
import { notificationService } from "../../services/notificationService";
import "./ChiTietDonTrongAdmin.css";

const ChiTietDonTrongAdmin = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [details, setDetails] = useState([]);
  const [orderStatus, setOrderStatus] = useState(null);
  const [refundedAmount, setRefundedAmount] = useState(null);
  const [refundReason, setRefundReason] = useState(null); // Lý do hoàn tiền
  const [cancellationReason, setCancellationReason] = useState(null);
  const [maxRefundAmount, setMaxRefundAmount] = useState(null); // Số tiền tối đa có thể hoàn (tổng đã trả)
  const [loading, setLoading] = useState(true);
  const [refunding, setRefunding] = useState(false);
  const [loadingCancelReason, setLoadingCancelReason] = useState(false);
  const [loadingRefundReason, setLoadingRefundReason] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showCancelReasonModal, setShowCancelReasonModal] = useState(false);
  const [showRefundReasonModal, setShowRefundReasonModal] = useState(false);
  const [refundForm, setRefundForm] = useState({
    amount: '',
    reason: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch order details
        const detailsRes = await axios.get(
          `http://localhost:8080/api/order-details/order/${orderId}`
        );
        setDetails(detailsRes.data || []);

        // Lấy order status từ getAll() - tìm order theo orderId
        let fetchedOrderStatus = null;
        try {
          const { orderService } = await import("../../services/orderService");
          const allOrdersRes = await orderService.getAll();
          const allOrders = Array.isArray(allOrdersRes?.data) ? allOrdersRes.data : 
                           Array.isArray(allOrdersRes) ? allOrdersRes : [];
          
          const order = allOrders.find(o => 
            String(o.orderId || o.order_id) === String(orderId)
          );
          
          if (order) {
            fetchedOrderStatus = order.status || null;
            setOrderStatus(fetchedOrderStatus);
            // Không lấy lý do hủy ngay, chỉ lấy khi user click button
          } else {
            // Thử lấy từ details nếu có
            if (detailsRes.data && detailsRes.data.length > 0) {
              const firstDetail = detailsRes.data[0];
              if (firstDetail.order && firstDetail.order.status) {
                fetchedOrderStatus = firstDetail.order.status;
                setOrderStatus(fetchedOrderStatus);
                // Không lấy lý do hủy ngay, chỉ lấy khi user click button
              }
            }
          }
        } catch (orderErr) {
          console.error("❌ Không thể tải thông tin đơn hàng:", orderErr);
          // Thử lấy từ details nếu có
          if (detailsRes.data && detailsRes.data.length > 0) {
            const firstDetail = detailsRes.data[0];
            if (firstDetail.order && firstDetail.order.status) {
              fetchedOrderStatus = firstDetail.order.status;
              setOrderStatus(fetchedOrderStatus);
              // Không lấy lý do hủy ngay, chỉ lấy khi user click button
            }
          }
        }

        // Fetch refunded amount nếu order status là REFUNDED
        // API: GET /api/payment/order/{orderId}/refunded-amount
        if (fetchedOrderStatus && fetchedOrderStatus.toUpperCase() === 'REFUNDED') {
          try {
            const refundRes = await api.get(`/payment/order/${orderId}/refunded-amount`);
            const refundData = refundRes?.data || refundRes;
            
            // API có thể trả về object với các properties hoặc refundedAmount trực tiếp
            if (refundData) {
              // Thử nhiều cách để lấy refundedAmount
              const amount = refundData.refundedAmount || 
                            refundData.amount ||
                            (typeof refundData === 'number' ? refundData : null);
              
              if (amount !== null && amount !== undefined) {
                setRefundedAmount(amount);
              }
            }
          } catch (refundErr) {
            console.error("❌ Không thể tải số tiền đã hoàn:", refundErr);
            // Không set error vì có thể đơn hàng chưa được hoàn tiền
          }
        }

        // Fetch tổng số tiền đã trả để validate số tiền hoàn tối đa
        try {
          const paymentsRes = await api.get(`/payment/order/${orderId}`);
          const payments = Array.isArray(paymentsRes?.data) ? paymentsRes.data : 
                          Array.isArray(paymentsRes) ? paymentsRes : [];
          
          // Tính tổng số tiền đã trả thành công
          const totalPaid = payments
            .filter(p => p.status === 'SUCCESS' || p.status === 'Success')
            .reduce((sum, p) => {
              const amount = Number(p.amount || 0);
              return sum + amount;
            }, 0);
          
          if (totalPaid > 0) {
            setMaxRefundAmount(totalPaid);
            console.log('💰 Tổng số tiền đã trả:', totalPaid);
          }
        } catch (paymentErr) {
          console.error("❌ Không thể tải thông tin thanh toán:", paymentErr);
          // Không set error vì có thể đơn hàng chưa có thanh toán
        }
      } catch (err) {
        console.error("❌ Lỗi tải chi tiết đơn:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orderId]);

  // Helper function: Chuyển status sang tiếng Việt
  const getStatusText = (status) => {
    if (!status) return 'N/A';
    const s = status.toUpperCase();
    const statusMap = {
      'SUCCESS': 'Thành công',
      'PENDING': 'Chờ xử lý',
      'PROCESSING': 'Đang xử lý',
      'FAILED': 'Thất bại',
      'CANCEL': 'Đã hủy',
      'CANCELLED': 'Đã hủy',
      'CANCELED': 'Đã hủy',
      'COMPLETED': 'Hoàn thành',
      'REFUNDED': 'Đã hoàn tiền',
      'PAID': 'Đã thanh toán',
      'UNPAID': 'Chưa thanh toán'
    };
    return statusMap[s] || status;
  };

  if (loading) {
    return <div className="od-loading">Đang tải chi tiết đơn hàng...</div>;
  }

  // Kiểm tra nếu đơn hàng đã được hoàn tiền
  const isRefunded = orderStatus && orderStatus.toUpperCase() === 'REFUNDED';
  
  // Kiểm tra nếu đơn hàng đã bị hủy (cần hoàn tiền)
  // Hỗ trợ cả CANCELED và CANCELLED
  // Cũng hiển thị button cho đơn hàng REFUNDED (vì đơn hàng đã hoàn tiền thường là do đã bị hủy trước đó)
  const statusUpper = orderStatus ? orderStatus.toUpperCase() : '';
  const isCanceled = statusUpper === 'CANCELED' || 
                     statusUpper === 'CANCELLED' || 
                     statusUpper === 'CANCEL' ||
                     statusUpper.includes('CANCEL') ||
                     isRefunded; // Hiển thị button cho cả đơn hàng đã hoàn tiền (có thể đã bị hủy trước đó)
  
  // Debug: Log để kiểm tra
  console.log('🔍 [ChiTietDonTrongAdmin] Debug:', {
    orderStatus,
    statusUpper,
    isCanceled,
    isRefunded,
    orderId
  });

  // Mở popup hoàn tiền
  const handleOpenRefundModal = () => {
    setShowRefundModal(true);
    setRefundForm({ amount: '', reason: '' });
  };

  // Đóng popup hoàn tiền
  const handleCloseRefundModal = () => {
    setShowRefundModal(false);
    setRefundForm({ amount: '', reason: '' });
  };

  // ⭐ Helper function: Parse lý do từ notification message
  const parseReasonFromNotification = (message, orderId) => {
    if (!message || typeof message !== 'string') return null;
    
    // Tìm message chứa orderId
    const orderIdInMessage = `#${orderId}`;
    if (!message.includes(orderIdInMessage)) return null;
    
    // Parse lý do từ format: "Đơn hàng #... đã bị hủy. Lý do: Khách bảo hủy"
    // Tìm pattern: "Lý do: " hoặc "lý do: " và lấy phần sau
    const reasonMatch = message.match(/[Ll]ý do[:\s]+(.+?)(?:\.|$)/i);
    if (reasonMatch && reasonMatch[1]) {
      return reasonMatch[1].trim();
    }
    
    // Nếu không tìm thấy "Lý do:", trả về toàn bộ message (fallback)
    return message;
  };

  // Xem lý do hủy - Lấy từ Notification trong database
  const handleViewCancelReason = async () => {
    try {
      setLoadingCancelReason(true);
      setCancellationReason(null);
      setShowCancelReasonModal(true);

      // ⭐ Lấy tất cả notifications và tìm message chứa orderId
      try {
        const notificationsRes = await notificationService.getAll();
        const notifications = Array.isArray(notificationsRes?.data) 
          ? notificationsRes.data 
          : Array.isArray(notificationsRes) 
            ? notificationsRes 
            : [];
        
        // Tìm notification có message chứa orderId này
        const orderNotification = notifications.find(notif => {
          const message = notif.message || notif.content || '';
          return message.includes(`#${orderId}`) && 
                 (message.includes('đã bị hủy') || message.includes('đã hủy'));
        });

        if (orderNotification) {
          const message = orderNotification.message || orderNotification.content || '';
          const reason = parseReasonFromNotification(message, orderId);
          if (reason) {
            setCancellationReason(reason);
          } else {
            // Nếu không parse được, hiển thị toàn bộ message
            setCancellationReason(message || 'Không có lý do hủy');
          }
        } else {
          // Fallback: Thử lấy từ order nếu không tìm thấy notification
          const { orderService } = await import("../../services/orderService");
          const allOrdersRes = await orderService.getAll();
          const allOrders = Array.isArray(allOrdersRes?.data) ? allOrdersRes.data : 
                           Array.isArray(allOrdersRes) ? allOrdersRes : [];
          
          const order = allOrders.find(o => 
            String(o.orderId || o.order_id) === String(orderId)
          );

          if (order) {
            const reason = order.cancellationReason || 
                         order.cancelReason || 
                         order.reason || 
                         'Không có lý do hủy';
            setCancellationReason(reason);
          } else {
            setCancellationReason('Không tìm thấy thông tin lý do hủy');
          }
        }
      } catch (notifErr) {
        console.error("❌ Lỗi khi lấy notifications:", notifErr);
        setCancellationReason('Không thể tải lý do hủy từ thông báo. Vui lòng thử lại sau.');
      }
    } catch (err) {
      console.error('❌ Lỗi khi lấy lý do hủy:', err);
      setCancellationReason('Không thể tải lý do hủy. Vui lòng thử lại sau.');
    } finally {
      setLoadingCancelReason(false);
    }
  };

  // Đóng modal lý do hủy
  const handleCloseCancelReasonModal = () => {
    setShowCancelReasonModal(false);
    setCancellationReason(null);
  };

  // ⭐ Xem lý do hoàn tiền - Lấy từ Notification trong database
  const handleViewRefundReason = async () => {
    try {
      setLoadingRefundReason(true);
      setRefundReason(null);
      setShowRefundReasonModal(true);

      // ⭐ Lấy tất cả notifications và tìm message chứa orderId
      try {
        const notificationsRes = await notificationService.getAll();
        const notifications = Array.isArray(notificationsRes?.data) 
          ? notificationsRes.data 
          : Array.isArray(notificationsRes) 
            ? notificationsRes 
            : [];
        
        // Tìm notification có message chứa orderId này (có thể liên quan đến hủy/hoàn tiền)
        const orderNotification = notifications.find(notif => {
          const message = notif.message || notif.content || '';
          return message.includes(`#${orderId}`);
        });

        if (orderNotification) {
          const message = orderNotification.message || orderNotification.content || '';
          const reason = parseReasonFromNotification(message, orderId);
          if (reason) {
            setRefundReason(reason);
          } else {
            // Nếu không parse được, hiển thị toàn bộ message
            setRefundReason(message || 'Không có lý do hoàn tiền');
          }
        } else {
          // Fallback: Thử gọi API refund-reason nếu không tìm thấy notification
          try {
            const refundReasonRes = await api.get(`/payment/order/${orderId}/refund-reason`);
            const refundReasonData = refundReasonRes?.data || refundReasonRes;

            if (refundReasonData) {
              const reason = refundReasonData.reason || 
                            refundReasonData.refundReason || 
                            refundReasonData.message ||
                            (typeof refundReasonData === 'string' ? refundReasonData : null);
              
              if (reason) {
                setRefundReason(reason);
              } else {
                const reasonStr = typeof refundReasonData === 'object' 
                  ? JSON.stringify(refundReasonData) 
                  : String(refundReasonData);
                setRefundReason(reasonStr || 'Không có lý do hoàn tiền');
              }
            } else {
              setRefundReason('Không có lý do hoàn tiền');
            }
          } catch (apiErr) {
            console.error("❌ Lỗi khi gọi API refund-reason:", apiErr);
            setRefundReason('Không tìm thấy lý do hoàn tiền');
          }
        }
      } catch (notifErr) {
        console.error("❌ Lỗi khi lấy notifications:", notifErr);
        setRefundReason('Không thể tải lý do hoàn tiền từ thông báo. Vui lòng thử lại sau.');
      }
    } catch (err) {
      console.error('❌ Lỗi khi lấy lý do hoàn tiền:', err);
      setRefundReason('Không thể tải lý do hoàn tiền. Vui lòng thử lại sau.');
    } finally {
      setLoadingRefundReason(false);
    }
  };

  // Đóng modal lý do hoàn tiền
  const handleCloseRefundReasonModal = () => {
    setShowRefundReasonModal(false);
    setRefundReason(null);
  };

  // Validate và tự động chỉnh số tiền hoàn nếu vượt quá số tiền tối đa
  const handleRefundAmountChange = (e) => {
    const inputValue = e.target.value;
    let amount = parseFloat(inputValue);
    
    // Nếu có maxRefundAmount và số tiền nhập vượt quá, tự động chỉnh về max
    if (maxRefundAmount && !isNaN(amount) && amount > maxRefundAmount) {
      amount = maxRefundAmount;
      alert(`Số tiền hoàn không được vượt quá ${maxRefundAmount.toLocaleString('vi-VN')} VNĐ (tổng số tiền đã trả). Đã tự động chỉnh về mức tối đa.`);
    }
    
    setRefundForm({ 
      ...refundForm, 
      amount: inputValue === '' ? '' : (isNaN(amount) ? inputValue : amount.toString())
    });
  };

  // Xử lý submit hoàn tiền
  const handleRefund = async () => {
    try {
      setRefunding(true);
      
      // Validate số tiền trước khi submit
      let finalAmount = null;
      if (refundForm.amount && refundForm.amount.trim()) {
        let amount = parseFloat(refundForm.amount);
        
        // Nếu vượt quá maxRefundAmount, tự động chỉnh về max
        if (maxRefundAmount && !isNaN(amount) && amount > maxRefundAmount) {
          amount = maxRefundAmount;
          alert(`⚠️ Số tiền hoàn đã được chỉnh về mức tối đa: ${maxRefundAmount.toLocaleString('vi-VN')} VNĐ`);
        }
        
        if (!isNaN(amount) && amount > 0) {
          finalAmount = amount;
        }
      }
      
      // Xây dựng URL với query parameter amount nếu có
      let url = `/payment/refund/${orderId}`;
      if (finalAmount !== null) {
        url += `?amount=${finalAmount}`;
      }
      
      // Gọi API hoàn tiền: POST /api/payment/refund/{orderId}?amount={amount}
      await api.post(url);
      
      alert('✅ Hoàn tiền thành công!');
      
      // Đóng popup và reload dữ liệu
      handleCloseRefundModal();
      window.location.reload();
    } catch (err) {
      console.error('❌ Lỗi khi hoàn tiền:', err);
      const errorMsg = err?.response?.data?.message || 
                      err?.message || 
                      'Không thể hoàn tiền. Vui lòng thử lại sau.';
      alert(`Lỗi: ${errorMsg}`);
    } finally {
      setRefunding(false);
    }
  };

  return (
    <div className="od-container">

      <h1 className="od-title">Chi tiết đơn hàng</h1>

      {/* Banner thông báo REFUNDED */}
      {isRefunded && (
        <div className="od-refund-banner">
          <div className="od-refund-banner-content">
            <strong>Đơn hàng đã được hoàn tiền</strong>
            <p>Đơn hàng này đã được hoàn tiền và không còn hiệu lực.</p>
            {refundedAmount !== null && refundedAmount !== undefined && (
              <p className="od-refund-amount">
                Số tiền đã hoàn: <strong>{Number(refundedAmount).toLocaleString('vi-VN')} VNĐ</strong>
              </p>
            )}
            {/* ⭐ Button xem lý do hoàn tiền */}
            <button 
              className="od-cancel-reason-btn" 
              onClick={handleViewRefundReason}
              disabled={loadingRefundReason}
              style={{
                marginTop: '12px',
                padding: '8px 16px',
                background: '#fff',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: loadingRefundReason ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151'
              }}
            >
              {loadingRefundReason ? 'Đang tải...' : 'Xem lý do hoàn tiền'}
            </button>
          </div>
        </div>
      )}

      {/* Nút quay lại và xem lý do hủy nằm kế nhau */}
      <div className="od-action-buttons">
        <button className="od-back-btn" onClick={() => navigate(-1)}>
          Quay lại
        </button>
        
        {/* Button xem lý do hủy cho đơn hàng bị hủy */}
        {isCanceled && (
          <button 
            className="od-cancel-reason-btn" 
            onClick={handleViewCancelReason}
            disabled={loadingCancelReason}
          >
            {loadingCancelReason ? 'Đang tải...' : 'Xem lý do hủy'}
          </button>
        )}
      </div>

      {/* Nút hoàn tiền cho đơn hàng đã hủy */}
      {/* Hiển thị nút nếu đơn hàng bị hủy và chưa được hoàn tiền */}
      {isCanceled && !isRefunded && (
        <div className="od-refund-action">
          <button 
            className="od-refund-btn" 
            onClick={handleOpenRefundModal}
            disabled={refunding}
          >
            Hoàn tiền
          </button>
        </div>
      )}

      <div className="od-card">
        {details.length === 0 ? (
          <div className="od-empty">Không có dữ liệu chi tiết đơn hàng</div>
        ) : (
          <table className="od-table">
            <thead>
              <tr>
                <th>Detail ID</th>
                <th>Loại dịch vụ</th>
                <th>Mô tả</th>
                <th>Giá</th>
                <th>Thời gian bắt đầu</th>
                <th>Thời gian kết thúc</th>
                <th>Trạng thái</th>
              </tr>
            </thead>

            <tbody>
              {details.map((d, index) => (
                <tr key={d.detailId || index}>
                  <td>{index + 1}</td>
                  <td>{d.type}</td>
                  <td>{d.description}</td>
                  <td className="od-money">
                    {d.price.toLocaleString()} VNĐ
                  </td>
                  <td>{new Date(d.startTime).toLocaleString()}</td>
                  <td>{new Date(d.endTime).toLocaleString()}</td>

                  <td>
                    <span className={`od-badge status-${d.status}`}>
                      {getStatusText(d.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Popup hoàn tiền */}
      {showRefundModal && (
        <div className="od-modal-overlay" onClick={handleCloseRefundModal}>
          <div className="od-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="od-modal-header">
              <h2>Hoàn tiền đơn hàng</h2>
              <button className="od-modal-close" onClick={handleCloseRefundModal}>
                ×
              </button>
            </div>

            <div className="od-modal-body">
              <div className="od-form-group">
                <label htmlFor="refund-amount">
                  Số tiền hoàn (VNĐ) <span style={{ color: '#999', fontSize: '12px' }}>(Tùy chọn - để trống để hoàn toàn bộ)</span>
                  {maxRefundAmount && (
                    <span style={{ color: '#dc2626', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                      Tối đa: {maxRefundAmount.toLocaleString('vi-VN')} VNĐ (tổng số tiền đã trả)
                    </span>
                  )}
                </label>
                <input
                  id="refund-amount"
                  type="number"
                  placeholder="Nhập số tiền cần hoàn..."
                  value={refundForm.amount}
                  onChange={handleRefundAmountChange}
                  min="0"
                  max={maxRefundAmount || undefined}
                  step="1000"
                />
              </div>

              <div className="od-form-group">
                <label htmlFor="refund-reason">Lý do hoàn tiền</label>
                <textarea
                  id="refund-reason"
                  placeholder="Nhập lý do hoàn tiền (tùy chọn)..."
                  value={refundForm.reason}
                  onChange={(e) => setRefundForm({ ...refundForm, reason: e.target.value })}
                  rows="4"
                />
              </div>
            </div>

            <div className="od-modal-actions">
              <button 
                className="od-modal-btn-cancel" 
                onClick={handleCloseRefundModal}
                disabled={refunding}
              >
                Hủy
              </button>
              <button 
                className="od-modal-btn-submit" 
                onClick={handleRefund}
                disabled={refunding}
              >
                {refunding ? 'Đang xử lý...' : 'Xác nhận hoàn tiền'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal hiển thị lý do hủy */}
      {showCancelReasonModal && (
        <div className="od-modal-overlay" onClick={handleCloseCancelReasonModal}>
          <div className="od-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="od-modal-header">
              <h2>Lý do hủy đơn hàng</h2>
              <button className="od-modal-close" onClick={handleCloseCancelReasonModal}>
                ×
              </button>
            </div>

            <div className="od-modal-body">
              {loadingCancelReason ? (
                <p style={{ textAlign: 'center', padding: '20px' }}>Đang tải...</p>
              ) : (
                <p style={{ 
                  fontSize: '14px', 
                  lineHeight: '1.6',
                  color: '#374151',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  margin: 0
                }}>
                  {cancellationReason || 'Không có lý do hủy'}
                </p>
              )}
            </div>

            <div className="od-modal-actions">
              <button 
                className="od-modal-btn-submit" 
                onClick={handleCloseCancelReasonModal}
                disabled={loadingCancelReason}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⭐ Modal hiển thị lý do hoàn tiền */}
      {showRefundReasonModal && (
        <div className="od-modal-overlay" onClick={handleCloseRefundReasonModal}>
          <div className="od-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="od-modal-header">
              <h2>LÝ DO HỦY ĐƠN HÀNG</h2>
              <button className="od-modal-close" onClick={handleCloseRefundReasonModal}>
                ×
              </button>
            </div>

            <div className="od-modal-body">
              {loadingRefundReason ? (
                <p style={{ textAlign: 'center', padding: '20px' }}>Đang tải...</p>
              ) : (
                <textarea
                  readOnly
                  value={refundReason || 'Không có lý do hủy'}
                  style={{
                    width: '100%',
                    minHeight: '120px',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    lineHeight: '1.6',
                    color: '#374151',
                    backgroundColor: '#f9fafb',
                    resize: 'vertical',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}
                />
              )}
            </div>

            <div className="od-modal-actions">
              <button 
                className="od-modal-btn-submit" 
                onClick={handleCloseRefundReasonModal}
                disabled={loadingRefundReason}
                style={{
                  background: '#dc2626',
                  borderColor: '#dc2626'
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChiTietDonTrongAdmin;
