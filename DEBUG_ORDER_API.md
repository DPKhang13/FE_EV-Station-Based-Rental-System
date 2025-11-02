# DEBUG ORDER API - HTTP 500 Error

## ✅ **ĐÃ FIX - ROOT CAUSE FOUND!**

### **Vấn đề:** CustomerId bị parse từ UUID sang Integer

Backend yêu cầu `customerId` là **UUID string**:
```
"330d185b-1560-44bc-bf91-8269b1da517c"
```

Nhưng frontend đang parse thành **integer**:
```javascript
customerId: parseInt(customerId)  // ❌ WRONG!
// Result: 330 (sai hoàn toàn!)
```

### **Đã fix tại:**
- ✅ `Booking4Seater.jsx` - Line 131
- ✅ `Booking7Seater.jsx` - Line 131  
- ✅ `ConfirmBookingPage.jsx` - Validation logic

---

## ❌ Vấn đề cũ (ĐÃ GIẢI QUYẾT)

API `POST /api/order/create` đang trả về HTTP 500 với payload:

```json
{
  "customerId": 330,
  "vehicleId": 30,
  "startTime": "2025-11-05T07:03:00",
  "endTime": "2025-11-05T20:03:00",
  "plannedHours": 20,
  "couponCode": null
}
```

## 🔍 Các nguyên nhân có thể

### 1. Customer ID không tồn tại
- `customerId: 330` có thể không tồn tại trong database
- Kiểm tra: Đăng nhập và xem user ID thực tế trong localStorage
- Fix: Đảm bảo user đã đăng ký và có ID hợp lệ

### 2. Vehicle ID không available
- `vehicleId: 30` có thể đang được thuê hoặc maintenance
- Kiểm tra: GET `/api/vehicles/get` để xem xe nào available
- Fix: Chọn xe có status = "available"

### 3. Coupon Code validation
- Backend có thể reject `null` coupon code
- Frontend đã fix: Bỏ field `couponCode` nếu empty

### 4. DateTime format
- Backend có thể yêu cầu format khác
- Hiện tại: `"2025-11-05T07:03:00"` (ISO 8601 không timezone)
- Có thể cần: `"2025-11-05T07:03:00.000Z"` (có milliseconds + Z)

### 5. Missing fields
- Backend có thể yêu cầu thêm fields không có trong docs
- Ví dụ: `stationId`, `paymentMethod`, `depositAmount`

## ✅ Các bước debug

### Bước 1: Kiểm tra User ID
```javascript
// Mở Console trong browser
const user = JSON.parse(localStorage.getItem('user'));
console.log('User ID:', user.userId || user.customerId || user.id);
```

### Bước 2: Kiểm tra Vehicle available
```javascript
// Test API vehicles
fetch('http://localhost:8080/api/vehicles/get')
  .then(r => r.json())
  .then(data => {
    console.log('Available vehicles:', data.filter(v => v.status === 'available'));
  });
```

### Bước 3: Test API trực tiếp với Postman/cURL
```bash
curl -X POST http://localhost:8080/api/order/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "customerId": 330,
    "vehicleId": 30,
    "startTime": "2025-11-05T07:03:00",
    "endTime": "2025-11-05T20:03:00",
    "plannedHours": 20
  }'
```

### Bước 4: Kiểm tra backend logs
- Xem logs của Spring Boot application
- Tìm stack trace để biết chính xác lỗi gì

### Bước 5: Kiểm tra database
```sql
-- Kiểm tra customer tồn tại
SELECT * FROM customer WHERE customer_id = 330;

-- Kiểm tra vehicle available
SELECT * FROM vehicle WHERE vehicle_id = 30;

-- Kiểm tra có order nào conflict không
SELECT * FROM orders 
WHERE vehicle_id = 30 
  AND status IN ('PENDING', 'CONFIRMED', 'IN_PROGRESS');
```

## 🔧 Frontend đã fix

### ConfirmBookingPage.jsx
- ✅ Validate customerId, vehicleId, plannedHours
- ✅ Bỏ couponCode nếu empty
- ✅ Error message chi tiết hơn
- ✅ Log đầy đủ để debug

### MyBookingsPage.jsx
- ✅ Handle HTTP 500 gracefully
- ✅ Show empty state thay vì crash
- ✅ Display đúng fields từ API response

## 📋 API Response Format (theo docs)

```json
{
  "orderId": "uuid",
  "vehicleId": 0,
  "startTime": "ISO DateTime",
  "endTime": "ISO DateTime",
  "createdAt": "ISO DateTime",
  "totalPrice": 0,
  "status": "string",
  "couponCode": "string",
  "plannedHours": 0,
  "actualHours": 0,
  "penaltyFee": 0,
  "depositAmount": 0,
  "remainingAmount": 0
}
```

## 💡 Giải pháp tạm thời

Nếu backend vẫn lỗi, có thể:
1. Test với user/vehicle ID khác
2. Kiểm tra xem backend có cần restart không
3. Kiểm tra database có dữ liệu test không
4. Liên hệ backend team để xem logs

## 📞 Next Steps

1. Kiểm tra backend logs để tìm root cause
2. Verify customer ID 330 có trong database
3. Verify vehicle ID 30 available
4. Test với Postman để isolate frontend/backend issue
5. Update backend validation nếu cần
