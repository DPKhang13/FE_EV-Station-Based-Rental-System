# 🏦 VNPay Payment Integration Guide

## 📋 Table of Contents
1. [Payment Flow Overview](#payment-flow-overview)
2. [Frontend Implementation](#frontend-implementation)
3. [VNPay Response Codes](#vnpay-response-codes)
4. [Important Notes](#important-notes)
5. [Special Cases Handling](#special-cases-handling)
6. [Testing Information](#testing-information)

---

## 🔄 Payment Flow Overview

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  FRONTEND   │      │   BACKEND   │      │    VNPAY    │      │   BACKEND   │      │  FRONTEND   │
│             │      │             │      │             │      │             │      │             │
│   Step 1    │─────▶│   Step 2    │─────▶│   Step 3    │─────▶│   Step 4    │─────▶│   Step 5    │
│             │      │             │      │             │      │             │      │             │
│ Create      │      │ Generate    │      │ User pays   │      │ Validate    │      │ Display     │
│ Payment     │      │ VNPay URL   │      │ with card   │      │ & Save to   │      │ Result      │
│ Request     │      │             │      │             │      │ Database    │      │             │
└─────────────┘      └─────────────┘      └─────────────┘      └─────────────┘      └─────────────┘
```

### Step-by-Step Flow:

**Step 1: Frontend - Create Payment Request**
- User clicks "Thanh toán" button on order
- Frontend calls: `POST /api/payment/url`
- Payload:
  ```json
  {
    "orderId": "uuid-string",
    "method": "VNPay",
    "paymentType": 1  // 1=Deposit, 2=Remaining, 3=Full
  }
  ```

**Step 2: Backend - Generate VNPay URL**
- Backend creates VNPay payment request
- Signs with HMAC SHA512
- Returns payment URL

**Step 3: VNPay - User Payment**
- User redirected to VNPay payment page
- User enters card info and OTP
- VNPay processes payment

**Step 4: Backend - Validate & Save**
- VNPay redirects to backend callback
- Backend validates signature
- Updates order status in database
- Redirects to frontend with result

**Step 5: Frontend - Display Result**
- Frontend receives callback with `vnp_ResponseCode`
- Displays success/error message
- Auto-redirects to My Bookings after 3s

---

## 💻 Frontend Implementation

### 1. Create Payment URL

```javascript
// services/paymentService.js
export const paymentService = {
    /**
     * Tạo VNPay payment URL
     * POST /api/payment/url
     */
    createPaymentUrl: async (paymentData) => {
        // paymentData format:
        // {
        //   orderId: "uuid-string",
        //   method: "VNPay",
        //   paymentType: 1  // 1=Deposit, 2=Remaining, 3=Full
        // }
        return await api.post('/payment/url', paymentData);
    },

    /**
     * ⚠️ KHÔNG cần verify ở frontend
     * Backend đã xử lý validation và lưu database
     */
};
```

### 2. Handle Payment Button Click

```javascript
// pages/PaymentPage.jsx
const handlePayment = async () => {
    try {
        if (selectedMethod === 'CASH') {
            alert('Vui lòng thanh toán tiền mặt tại quầy khi nhận xe');
            navigate('/my-bookings');
            return;
        }

        if (selectedMethod === 'VNPAY') {
            // Create payment request
            const paymentData = {
                orderId: orderId,  // UUID string
                method: "VNPay",
                paymentType: 1     // 1 = Deposit payment
            };

            console.log('🏦 Creating VNPay payment URL...', paymentData);
            
            const response = await paymentService.createPaymentUrl(paymentData);
            
            console.log('✅ VNPay URL received:', response.paymentUrl);

            // Redirect to VNPay payment page
            window.location.href = response.paymentUrl;
        }
    } catch (error) {
        console.error('❌ Payment error:', error);
        alert('Payment failed: ' + error.message);
    }
};
```

### 3. Handle Payment Callback Result

```javascript
// pages/PaymentCallbackPage.jsx
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const PaymentCallbackPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [paymentStatus, setPaymentStatus] = useState('processing');

    useEffect(() => {
        // Get response code from VNPay callback
        const responseCode = searchParams.get('vnp_ResponseCode');
        const orderId = searchParams.get('vnp_TxnRef');

        console.log('🏦 VNPay callback received:', { responseCode, orderId });

        if (responseCode === '00') {
            setPaymentStatus('success');
            
            // ⚠️ KHÔNG tự cập nhật order status
            // Backend đã validate và lưu database rồi
            
            // Auto redirect after 3 seconds
            setTimeout(() => {
                navigate('/my-bookings');
            }, 3000);
        } else {
            setPaymentStatus('failed');
        }
    }, [searchParams, navigate]);

    return (
        <div className="payment-callback-container">
            {paymentStatus === 'success' && (
                <div className="success-message">
                    <h2>✅ Thanh toán thành công!</h2>
                    <p>Đang chuyển về trang đơn hàng...</p>
                </div>
            )}
            
            {paymentStatus === 'failed' && (
                <div className="error-message">
                    <h2>❌ Thanh toán thất bại!</h2>
                    <button onClick={() => navigate('/my-bookings')}>
                        Quay lại đơn hàng
                    </button>
                </div>
            )}
        </div>
    );
};
```

### 4. Verify Order Payment Status (Optional)

```javascript
// ⚠️ CHỈ dùng để HIỂN THỊ, KHÔNG dùng để validate thanh toán
const verifyOrderPayment = async (orderId) => {
    try {
        // Get latest order info from backend
        const order = await orderService.getById(orderId);
        
        console.log('📋 Order status:', order.status);
        console.log('💰 Payment status:', order.paymentStatus);
        
        // Display to user
        return order;
    } catch (error) {
        console.error('Failed to verify order:', error);
    }
};
```

---

## 📊 VNPay Response Codes

### Success Codes

| Code | Description | Action |
|------|-------------|--------|
| `00` | Giao dịch thành công | Show success message, redirect to orders |

### Error Codes

| Code | Description | Vietnamese Message |
|------|-------------|-------------------|
| `07` | Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường) | Giao dịch bị nghi ngờ, vui lòng liên hệ ngân hàng |
| `09` | Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking | Thẻ chưa đăng ký Internet Banking |
| `10` | Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần | Xác thực thông tin thẻ không đúng quá 3 lần |
| `11` | Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch | Hết hạn chờ thanh toán |
| `12` | Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa | Thẻ/Tài khoản bị khóa |
| `13` | Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP) | Sai mật khẩu OTP |
| `24` | Giao dịch không thành công do: Khách hàng hủy giao dịch | Khách hàng hủy giao dịch |
| `51` | Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư | Tài khoản không đủ số dư |
| `65` | Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá giới hạn giao dịch trong ngày | Vượt quá giới hạn giao dịch |
| `75` | Ngân hàng thanh toán đang bảo trì | Ngân hàng đang bảo trì |
| `79` | Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định | Nhập sai mật khẩu quá số lần quy định |
| `99` | Các lỗi khác | Lỗi không xác định |

### Implementation Example:

```javascript
const getPaymentMessage = (responseCode) => {
    const messages = {
        '00': 'Thanh toán thành công!',
        '07': 'Giao dịch bị nghi ngờ, vui lòng liên hệ ngân hàng',
        '09': 'Thẻ chưa đăng ký Internet Banking',
        '10': 'Xác thực thông tin thẻ không đúng quá 3 lần',
        '11': 'Hết hạn chờ thanh toán',
        '12': 'Thẻ/Tài khoản bị khóa',
        '13': 'Sai mật khẩu OTP',
        '24': 'Khách hàng hủy giao dịch',
        '51': 'Tài khoản không đủ số dư',
        '65': 'Vượt quá giới hạn giao dịch trong ngày',
        '75': 'Ngân hàng đang bảo trì',
        '79': 'Nhập sai mật khẩu quá số lần quy định',
        '99': 'Lỗi không xác định'
    };
    
    return messages[responseCode] || 'Giao dịch không thành công';
};
```

---

## ⚠️ Important Notes

### 🚫 KHÔNG làm những điều này ở Frontend:

1. **KHÔNG tự validate payment signature**
   ```javascript
   // ❌ WRONG - Backend already did this
   const isValid = validateVNPaySignature(params);
   ```

2. **KHÔNG tự update order status**
   ```javascript
   // ❌ WRONG - Backend already updated database
   await orderService.update(orderId, { status: 'PAID' });
   ```

3. **KHÔNG trust frontend callback**
   ```javascript
   // ❌ WRONG - User can fake URL parameters
   if (vnp_ResponseCode === '00') {
       // Don't trust this without backend verification
   }
   ```

### ✅ Frontend CHỈ làm những việc này:

1. **Tạo payment request**
   - Call API `/api/payment/url`
   - Redirect to VNPay URL

2. **Hiển thị kết quả**
   - Parse `vnp_ResponseCode` from URL
   - Show success/error message
   - Redirect user

3. **Fetch latest order info (optional)**
   - Get order from backend to display
   - KHÔNG dùng để validate payment

---

## 🔧 Special Cases Handling

### Case 1: User closes tab during payment

```javascript
// User might close browser tab at VNPay page
// Backend will still receive callback and update database
// When user returns, just fetch latest order status

useEffect(() => {
    const checkPendingPayments = async () => {
        const orders = await orderService.getMyOrders();
        const pendingPayments = orders.filter(o => 
            o.status === 'PENDING_PAYMENT'
        );
        
        if (pendingPayments.length > 0) {
            // Show notification: "You have pending payments"
        }
    };
    
    checkPendingPayments();
}, []);
```

### Case 2: Network timeout

```javascript
const handlePayment = async () => {
    try {
        setLoading(true);
        
        // Add timeout
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), 30000)
        );
        
        const paymentPromise = paymentService.createPaymentUrl(paymentData);
        
        const response = await Promise.race([paymentPromise, timeoutPromise]);
        
        window.location.href = response.paymentUrl;
    } catch (error) {
        if (error.message === 'Request timeout') {
            alert('Yêu cầu quá lâu, vui lòng thử lại');
        }
    } finally {
        setLoading(false);
    }
};
```

### Case 3: User clicks Back button

```javascript
// PaymentCallbackPage.jsx
useEffect(() => {
    // Prevent back button
    const handlePopState = (e) => {
        e.preventDefault();
        navigate('/my-bookings', { replace: true });
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
        window.removeEventListener('popstate', handlePopState);
    };
}, [navigate]);
```

---

## 🧪 Testing Information

### VNPay Sandbox Test Cards

**Test Card for SUCCESS (Code 00):**
```
Card Number: 9704198526191432198
Card Holder: NGUYEN VAN A
Expiry Date: 07/15
OTP: 123456
```

**Test Card for INSUFFICIENT BALANCE (Code 51):**
```
Card Number: 9704198526191432199
Card Holder: NGUYEN VAN B
Expiry Date: 07/15
OTP: 123456
```

### Testing Checklist:

- [ ] Payment success (code 00)
- [ ] Payment cancelled by user (code 24)
- [ ] Insufficient balance (code 51)
- [ ] Wrong OTP (code 13)
- [ ] Timeout (code 11)
- [ ] User closes tab during payment
- [ ] Network timeout
- [ ] User clicks back button

---

## 📖 Usage Examples

### Example 1: Deposit Payment (Đặt cọc)

```javascript
// User wants to pay deposit for order
const payDeposit = async (orderId) => {
    const paymentData = {
        orderId: orderId,
        method: "VNPay",
        paymentType: 1  // 1 = Deposit
    };
    
    const response = await paymentService.createPaymentUrl(paymentData);
    window.location.href = response.paymentUrl;
};
```

### Example 2: Remaining Payment (Thanh toán còn lại)

```javascript
// User pays remaining amount when returning vehicle
const payRemaining = async (orderId) => {
    const paymentData = {
        orderId: orderId,
        method: "VNPay",
        paymentType: 2  // 2 = Remaining
    };
    
    const response = await paymentService.createPaymentUrl(paymentData);
    window.location.href = response.paymentUrl;
};
```

### Example 3: Full Payment (Thanh toán toàn bộ)

```javascript
// User pays full amount upfront
const payFull = async (orderId) => {
    const paymentData = {
        orderId: orderId,
        method: "VNPay",
        paymentType: 3  // 3 = Full payment
    };
    
    const response = await paymentService.createPaymentUrl(paymentData);
    window.location.href = response.paymentUrl;
};
```

---

## 🎯 Summary

### Frontend Responsibilities:
✅ Create payment request with orderId, method, paymentType  
✅ Redirect user to VNPay URL  
✅ Display payment result based on vnp_ResponseCode  
✅ Handle edge cases (timeout, back button, closed tab)  

### Backend Responsibilities (NOT Frontend):
✅ Generate VNPay payment URL with signature  
✅ Validate VNPay callback signature  
✅ Update order status in database  
✅ Store transaction history  

### Key Principle:
> **Frontend hiển thị, Backend quyết định.**  
> Frontend KHÔNG bao giờ tự validate hoặc update payment status!

---

## 📞 Support

If you have questions about VNPay integration:
1. Check this documentation first
2. Review backend API documentation
3. Test with VNPay sandbox
4. Contact backend team for signature/callback issues

**Happy Coding! 🚀**
