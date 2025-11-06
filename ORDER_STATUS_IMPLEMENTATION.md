# 🚗 Hệ Thống Quản Lý Đặt Xe - Order Status Implementation

## 📋 Tổng Quan

Đã implement hệ thống kiểm tra và quản lý trạng thái đơn hàng dựa trên API `/api/order/{orderId}/preview-return`

## ✅ Các Tính Năng Đã Hoàn Thành

### 1. **API Service - orderService.js**

Đã thêm method mới:
```javascript
getReturnPreview: async (orderId) => {
    const res = await api.get(`/order/${orderId}/preview-return`);
    return res?.data ?? res;
}
```

### 2. **MyBookingsPage.jsx - Quản Lý Trạng Thái Đơn Hàng**

#### ✨ Tính năng mới:

**a) Lấy status chi tiết từ preview-return API:**
- Fetch status cho từng order khi load trang
- Lưu vào state `orderStatuses` mapping orderId → {status, remainingAmount, penaltyFee, actualHours}

**b) Hiển thị theo status:**

| Status | Hiển thị | Hành động |
|--------|----------|-----------|
| `RENTAL` | 🚗 "Đang thuê" | **BLOCK** không cho đặt xe khác |
| `AWAIT_FINAL` | 💰 "Còn lại: X VND" | Button "Thanh toán ngay" → VNPay |
| `COMPLETED` | ✅ "Hoàn thành" | Button "📝 Đánh giá" → FeedbackPage |
| `PENDING` | "Chờ xử lý" | Button "Đặt Cọc" & "Hủy" |
| `DEPOSITED` | "Đã đặt cọc" | Text "Chờ nhận xe" |

**c) Functions mới:**
```javascript
fetchOrderStatuses(orders)   // Lấy status từ preview-return API
handleFinalPayment(orderId)   // Thanh toán remainingAmount qua VNPay  
handleFeedback(orderId)       // Navigate đến /feedback
```

### 3. **Blocking Logic - Booking4Seater.jsx**

#### ✨ Logic kiểm tra RENTAL:
```javascript
useEffect(() => {
    // Check if user has active RENTAL order
    const orders = await orderService.getMyOrders();
    for (const order of orders) {
        const preview = await orderService.getReturnPreview(order.orderId);
        if (preview.status === 'RENTAL') {
            setHasActiveRental(true);
            break;
        }
    }
}, [user]);
```

#### 🚫 Khi có RENTAL active:
- Hiển thị màn hình chặn với thông báo
- Button "Xem đơn đặt xe" → Navigate về /my-bookings
- **KHÔNG** cho phép đặt xe mới

### 4. **FeedbackPage.jsx - Trang Đánh Giá**

#### 🎨 UI Components:
- ⭐ Rating stars (1-5 sao) với hover effect
- 📝 Comment textarea (max 1000 ký tự)
- ✅ Submit button → Gọi feedbackService.create()

#### 📡 API Call:
```javascript
feedbackService.create({
    orderId: orderId,
    rating: rating,      // 1-5
    comment: comment     // Text feedback
});
```

#### 🎨 Styling:
- Gradient background (#667eea → #764ba2)
- Responsive design
- Smooth animations & transitions

### 5. **Routes - App.jsx**

Đã thêm route:
```jsx
<Route path="/feedback" element={
  <ProtectedRoute>
    <FeedbackPage />
  </ProtectedRoute>
} />
```

## 🔄 Flow Hoàn Chỉnh

### 📊 Flow Đặt Xe:

```
1. User vào trang Booking4Seater/Booking7Seater
   ↓
2. Check có order RENTAL không?
   ├─ Có → Show màn hình chặn
   └─ Không → Cho phép đặt xe
   ↓
3. User đặt xe → Status: PENDING
   ↓
4. User thanh toán cọc → Status: DEPOSITED
   ↓
5. Staff pickup xe → Status: RENTAL
   ↓
6. Staff return xe → Status: AWAIT_FINAL
   ↓
7. User thanh toán còn lại → Status: COMPLETED
   ↓
8. User feedback → Hoàn tất
```

### 💰 Flow Thanh Toán Cuối:

```
1. MyBookingsPage hiển thị order AWAIT_FINAL
   ├─ Show remainingAmount
   └─ Button "Thanh toán ngay"
   ↓
2. User click → handleFinalPayment()
   ├─ Navigate to /payment/:orderId với state {isFinalPayment: true, remainingAmount}
   └─ PaymentPage xử lý VNPay
   ↓
3. VNPay redirect
   ├─ Success → /payment-success
   └─ Failed → /payment-failed
   ↓
4. Status update: COMPLETED
```

### 📝 Flow Feedback:

```
1. Order status = COMPLETED
   ↓
2. MyBookingsPage hiển thị button "📝 Đánh giá"
   ↓
3. User click → Navigate to /feedback với state {orderId}
   ↓
4. User nhập rating (1-5 sao) + comment
   ↓
5. Submit → feedbackService.create()
   ↓
6. Success → Navigate về /my-bookings
```

## 📁 Files Modified/Created

### ✅ Modified:
1. `src/services/orderService.js` - Added `getReturnPreview()`
2. `src/pages/MyBookingsPage.jsx` - Added status checking & action buttons
3. `src/components/Booking4Seater.jsx` - Added RENTAL blocking logic
4. `src/App.jsx` - Added /feedback route

### ✨ Created:
1. `src/pages/FeedbackPage.jsx` - Feedback form component
2. `src/pages/FeedbackPage.css` - Feedback page styling

## 🔧 TODO - Cần Hoàn Thiện

### 1. **Booking7Seater.jsx**
Apply tương tự logic blocking như Booking4Seater:
```javascript
// Add imports
import { orderService } from '../services';

// Add states
const [hasActiveRental, setHasActiveRental] = useState(false);
const [checkingRental, setCheckingRental] = useState(true);

// Add useEffect check RENTAL (copy từ Booking4Seater)

// Add blocking UI before return statement
```

### 2. **VNPay Integration cho Final Payment**
Trong `MyBookingsPage.jsx` → `handleFinalPayment()`:
```javascript
// TODO: Replace with actual VNPay API
const response = await paymentService.createPayment({
    orderId: orderId,
    amount: orderStatus.remainingAmount,
    returnUrl: window.location.origin + '/payment-callback'
});
window.location.href = response.paymentUrl;
```

### 3. **PaymentPage.jsx Enhancement**
Thêm logic xử lý `isFinalPayment`:
```javascript
const location = useLocation();
const isFinalPayment = location.state?.isFinalPayment;
const remainingAmount = location.state?.remainingAmount;

// Display different UI/message for final payment
if (isFinalPayment) {
    // Show "Thanh toán phần còn lại"
    // Use remainingAmount instead of depositAmount
}
```

### 4. **feedbackService.js**
Đảm bảo có method `create()`:
```javascript
export const feedbackService = {
    create: async (feedbackData) => {
        return await api.post('/feedback/create', feedbackData);
    }
};
```

## 🎯 Testing Checklist

- [ ] Test RENTAL blocking trên Booking4Seater
- [ ] Test RENTAL blocking trên Booking7Seater  
- [ ] Test AWAIT_FINAL payment flow
- [ ] Test COMPLETED feedback flow
- [ ] Test VNPay redirect success/failed
- [ ] Test feedback submission
- [ ] Test responsive UI trên mobile

## 📱 Status Badge Colors

```css
PENDING: #f59e0b (Orange)
RENTAL: #3b82f6 (Blue)
AWAIT_FINAL: #f59e0b (Orange)
COMPLETED: #10b981 (Green)
CANCELLED: #ef4444 (Red)
```

## 🚀 Deployment Notes

1. Đảm bảo API endpoint `/api/order/{orderId}/preview-return` available
2. Test feedback API `/api/feedback/create` working
3. VNPay credentials configured properly
4. Mobile responsive tested

---

**✅ Implementation Status: 80% Complete**
**🔧 Remaining: Booking7Seater blocking + VNPay final payment integration**
