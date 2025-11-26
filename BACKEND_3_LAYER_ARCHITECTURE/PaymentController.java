// ============================================================
// CONTROLLER LAYER - PaymentController.java
// Xử lý HTTP requests/responses
// ============================================================

package com.carrent.controller;

import com.carrent.dto.PaymentDto;
import com.carrent.dto.PaymentResponse;
import com.carrent.security.JwtUserDetails;
import com.carrent.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
@Tag(name = "Payment", description = "Payment management APIs")
public class PaymentController {

    private final PaymentService paymentService;

    // ============================
    // CREATE CASH PAYMENT (PENDING)
    // ============================
    @PostMapping("/cash")
    @Operation(summary = "Create cash payment with PENDING status")
    public ResponseEntity<PaymentResponse> processCashPayment(
            @RequestBody PaymentDto paymentDto,
            @AuthenticationPrincipal JwtUserDetails jwtUserDetails) {
        
        PaymentResponse response = paymentService.processCashPayment(
            paymentDto, 
            jwtUserDetails.getUserId()
        );
        
        return ResponseEntity.ok(response);
    }

    // ============================
    // STAFF CONFIRM CASH PAYMENT
    // ============================
    @PutMapping("/{paymentId}/confirm")
    @Operation(summary = "Staff confirms cash payment - changes PENDING to SUCCESS")
    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')")
    public ResponseEntity<PaymentResponse> confirmCashPayment(
            @PathVariable UUID paymentId,
            @AuthenticationPrincipal JwtUserDetails jwtUserDetails) {
        
        PaymentResponse response = paymentService.confirmCashPayment(
            paymentId, 
            jwtUserDetails.getUserId()
        );
        
        return ResponseEntity.ok(response);
    }

    // ============================
    // GET PAYMENTS BY ORDER
    // ============================
    @GetMapping("/order/{orderId}")
    @Operation(summary = "Get all payments for an order")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByOrder(
            @PathVariable UUID orderId) {
        
        List<PaymentResponse> payments = paymentService.getPaymentsByOrderId(orderId);
        return ResponseEntity.ok(payments);
    }
}
