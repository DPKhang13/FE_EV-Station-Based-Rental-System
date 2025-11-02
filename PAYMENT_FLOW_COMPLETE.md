# 💳 LUỒNG THANH TOÁN HOÀN CHỈNH

## ✅ ĐÃ HOÀN THÀNH

### 📋 **1. Cấu trúc thanh toán**

#### **MyBookingsPage** → **PaymentPage** → **VNPay** → **PaymentCallbackPage**

---

## 🔄 LUỒNG HOẠT ĐỘNG

### **Bước 1: Xem lịch sử đơn hàng**
**File**: `MyBookingsPage.jsx`
- User vào trang "My Bookings"
- Hiển thị tất cả đơn hàng (PENDING, CONFIRMED, COMPLETED, CANCELLED)
- Với đơn PENDING: Hiện 2 nút:
  - 💳 **Thanh toán**
  - ❌ **Hủy đặt hàng**

### **Bước 2: Chọn thanh toán**
**File**: `PaymentPage.jsx`
- Click nút "Thanh toán" → Navigate đến `/payment/{orderId}`
- Hiển thị thông tin đơn hàng:
  - Order ID
  - Vehicle ID
  - Thời gian nhận/trả xe
  - Số giờ thuê
  - **Tổng tiền** (totalPrice)
- Cho phép chọn 1 trong 2 phương thức:
  - 💵 **Tiền mặt** (CASH)
  - 🏦 **VNPay**

### **Bước 3A: Thanh toán tiền mặt**
```javascript
if (paymentMethod === 'CASH') {
  // Hiển thị thông báo
  alert('Thanh toán bằng tiền mặt sẽ được xử lý tại cửa hàng khi nhận xe');
  // Quay về My Bookings
  navigate('/my-bookings');
}
```

### **Bước 3B: Thanh toán VNPay**
```javascript
if (paymentMethod === 'VNPAY') {
  // 1. Chuẩn bị dữ liệu
  const paymentData = {
    orderId: orderId,        // UUID string
    method: 'VNPay',         // Chính xác là 'VNPay' (capital P)
    paymentType: 1           // 1 = Deposit payment
  };

  // 2. Gọi API
  const response = await paymentService.createPaymentUrl(paymentData);
  
  // 3. Redirect đến VNPay
  window.location.href = response.paymentUrl;
}
```

### **Bước 4: VNPay xử lý**
- User được redirect đến trang VNPay
- Nhập thông tin thẻ/tài khoản
- VNPay xử lý thanh toán
- VNPay redirect về: `/payment-callback?vnp_ResponseCode=00&...`

### **Bước 5: Xử lý kết quả**
**File**: `PaymentCallbackPage.jsx`
- Nhận params từ VNPay:
  - `vnp_ResponseCode`: Mã kết quả (00 = thành công)
  - `vnp_TxnRef`: Mã tham chiếu
  - `vnp_Amount`: Số tiền
  - `vnp_TransactionNo`: Mã giao dịch

**Response code 00 (Success):**
```javascript
✅ Thanh toán thành công!
→ Tự động redirect về /my-bookings sau 3 giây
```

**Response code khác (Failed):**
```javascript
❌ Thanh toán thất bại!
→ Hiển thị lỗi cụ thể
→ Cho phép "Thử lại" hoặc "Xem đơn hàng"
```

---

## 🔧 CÁC FILE ĐÃ CẬP NHẬT

### 1. **api.js**
```javascript
const API_BASE_URL = 'http://localhost:8082/api'; // ✅ Updated to 8082
```

### 2. **vehicleService.js**
```javascript
const API_BASE_URL = 'http://localhost:8082/api'; // ✅ Updated to 8082
```

### 3. **PaymentPage.jsx**
- ✅ Fixed `orderId` comparison (UUID string)
- ✅ Handle both CASH and VNPAY methods
- ✅ Call API with correct payload format
- ✅ Better error messages (Vietnamese)

### 4. **PaymentCallbackPage.jsx** (NEW)
- ✅ Handle VNPay callback
- ✅ Parse response codes
- ✅ Show success/failed UI
- ✅ Auto redirect on success

### 5. **PaymentCallbackPage.css** (NEW)
- ✅ Beautiful gradient background
- ✅ Animated status icons
- ✅ Responsive design
- ✅ Loading spinner

### 6. **App.jsx**
- ✅ Added route: `/payment-callback`
- ✅ Imported `PaymentCallbackPage`

---

## 📊 API PAYLOAD

### **POST /api/payment/url**

**Request:**
```json
{
  "orderId": "123e4567-e89b-12d3-a456-426614174000",
  "method": "VNPay",
  "paymentType": 1
}
```

**Response:**
```json
{
  "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=..."
}
```

### **Payment Types:**
- `1`: Thanh toán đặt cọc (Deposit)
- `2`: Thanh toán phần còn lại (Remaining)
- `3`: Thanh toán toàn bộ (Full payment)

---

## 🎯 VNPAY RESPONSE CODES

| Code | Meaning |
|------|---------|
| 00 | Giao dịch thành công |
| 07 | Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường) |
| 09 | Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng |
| 10 | Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần |
| 11 | Giao dịch không thành công do: Đã hết hạn chờ thanh toán |
| 12 | Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa |
| 13 | Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP) |
| 24 | Giao dịch không thành công do: Khách hàng hủy giao dịch |
| 51 | Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch |
| 65 | Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày |
| 75 | Ngân hàng thanh toán đang bảo trì |
| 79 | Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định |

---

## 🧪 TESTING

### Test Case 1: Thanh toán tiền mặt
1. Login → My Bookings
2. Click "Thanh toán" trên đơn PENDING
3. Chọn "Tiền mặt"
4. Click "Xác nhận thanh toán"
5. ✅ Xem alert → Quay về My Bookings

### Test Case 2: Thanh toán VNPay (Success)
1. Login → My Bookings
2. Click "Thanh toán" trên đơn PENDING
3. Chọn "VNPay"
4. Click "Xác nhận thanh toán"
5. ✅ Redirect đến VNPay sandbox
6. Nhập thông tin test card
7. ✅ Redirect về `/payment-callback?vnp_ResponseCode=00`
8. ✅ Xem "Thanh toán thành công"
9. ✅ Auto redirect về My Bookings

### Test Case 3: Thanh toán VNPay (Failed)
1-4. Giống Test Case 2
5. ✅ Redirect đến VNPay
6. Click "Hủy giao dịch" hoặc nhập sai thông tin
7. ✅ Redirect về `/payment-callback?vnp_ResponseCode=24`
8. ✅ Xem "Thanh toán thất bại"
9. ✅ Click "Thử lại" hoặc "Xem đơn hàng"

---

## 🚨 LƯU Ý QUAN TRỌNG

### 1. **Backend Configuration**
Backend cần cấu hình:
```
vnp_ReturnUrl = http://localhost:5173/payment-callback
```

### 2. **Order Status Flow**
```
PENDING → (Thanh toán) → CONFIRMED → (Nhận xe) → PICKED_UP → (Trả xe) → RETURNED
```

### 3. **Security**
- ✅ All payment APIs require `Authorization: Bearer {token}`
- ✅ VNPay uses secure hash to verify transactions
- ✅ Frontend validates order status before allowing payment

### 4. **Error Handling**
- ✅ Handle HTTP 500 gracefully
- ✅ Show Vietnamese error messages
- ✅ Provide "Retry" option on failure
- ✅ Log all errors to console for debugging

---

## 📱 UI/UX Features

### PaymentPage
- ✅ Beautiful gradient cards
- ✅ Hover effects on payment methods
- ✅ Selected state visual feedback
- ✅ Disabled state when processing
- ✅ Info section with payment notes

### PaymentCallbackPage
- ✅ Full-screen gradient background
- ✅ Animated status icons (bounce, scale)
- ✅ Loading spinner for processing
- ✅ Auto-redirect on success (3s countdown)
- ✅ Clear action buttons
- ✅ Responsive mobile design

---

## ✨ HOÀN THÀNH!

Tất cả luồng thanh toán đã được implement đầy đủ:
- ✅ My Bookings hiển thị nút thanh toán
- ✅ PaymentPage cho phép chọn CASH/VNPAY
- ✅ API integration với VNPay
- ✅ PaymentCallbackPage xử lý kết quả
- ✅ Error handling toàn diện
- ✅ UI/UX đẹp và responsive

**Bây giờ bạn có thể test toàn bộ luồng thanh toán!** 🎉
