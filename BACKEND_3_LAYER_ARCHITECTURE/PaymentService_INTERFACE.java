// ============================================================
// SERVICE INTERFACE - PaymentService.java
// Định nghĩa các business logic methods
// ============================================================

package com.group6.Rental_Car.service;

import com.group6.Rental_Car.dtos.payment.PaymentDto;
import com.group6.Rental_Car.dtos.payment.PaymentResponse;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface PaymentService {
    
    /**
     * Tạo MoMo payment URL
     * 
     * @param dto PaymentDto chứa orderId, paymentType, method
     * @param userId ID của user tạo payment
     * @return PaymentResponse với paymentUrl
     */
    PaymentResponse createPaymentUrl(PaymentDto dto, UUID userId);
    
    /**
     * Xử lý MoMo callback
     * 
     * @param params Map chứa các params từ MoMo callback
     * @return PaymentResponse với kết quả thanh toán
     */
    PaymentResponse handleMoMoCallback(Map<String, String> params);
    
    /**
     * Tạo payment CASH với status PENDING
     * Không tự động update order status - chờ staff xác nhận
     * 
     * @param dto PaymentDto chứa orderId, paymentType, method
     * @param userId ID của user tạo payment
     * @return PaymentResponse với status PENDING
     */
    PaymentResponse processCashPayment(PaymentDto dto, UUID userId);
    
    /**
     * Staff xác nhận payment CASH PENDING
     * Chuyển status từ PENDING → SUCCESS và update order status
     * 
     * @param paymentId ID của payment cần xác nhận
     * @param staffId ID của staff xác nhận
     * @return PaymentResponse với status SUCCESS
     */
    PaymentResponse confirmCashPayment(UUID paymentId, UUID staffId);
    
    /**
     * Lấy danh sách payments theo orderId
     * 
     * @param orderId ID của order
     * @return List<PaymentResponse>
     */
    List<PaymentResponse> getPaymentsByOrderId(UUID orderId);
    
    /**
     * Hoàn tiền cho đơn hàng
     * 
     * @param orderId ID của order cần hoàn tiền
     * @return PaymentResponse với thông tin hoàn tiền
     */
    PaymentResponse refund(UUID orderId);
}

