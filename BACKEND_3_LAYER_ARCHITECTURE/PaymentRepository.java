// ============================================================
// REPOSITORY LAYER - PaymentRepository.java (Interface)
// Data Access Layer - Định nghĩa các methods truy cập database
// ============================================================

package com.carrent.repository;

import com.carrent.entity.Payment;
import com.carrent.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    
    /**
     * Tìm tất cả payments theo orderId
     */
    List<Payment> findByRentalOrder_OrderId(UUID orderId);
    
    /**
     * Tìm payment theo orderId và status
     */
    List<Payment> findByRentalOrder_OrderIdAndStatus(UUID orderId, PaymentStatus status);
    
    /**
     * Tìm payment theo orderId, paymentType và status
     */
    List<Payment> findByRentalOrder_OrderIdAndPaymentTypeAndStatus(
        UUID orderId, 
        Short paymentType, 
        PaymentStatus status
    );
    
    /**
     * Tìm payment PENDING theo orderId và method
     */
    List<Payment> findByRentalOrder_OrderIdAndMethodAndStatus(
        UUID orderId, 
        String method, 
        PaymentStatus status
    );
    
    /**
     * Tìm payment theo paymentId
     */
    Optional<Payment> findByPaymentId(UUID paymentId);
    
    /**
     * Kiểm tra xem có payment SUCCESS với paymentType cụ thể không
     */
    boolean existsByRentalOrder_OrderIdAndPaymentTypeAndStatus(
        UUID orderId, 
        Short paymentType, 
        PaymentStatus status
    );
}
