# TEST ORDER CREATE API

## 🔥 Vấn đề hiện tại

Payload đã ĐÚNG FORMAT nhưng vẫn HTTP 500:
```json
{
  "customerId": "330d185b-1560-44bc-bf91-8269b1da517c",
  "vehicleId": 7,
  "startTime": "2025-11-03T07:11:00",
  "endTime": "2025-11-03T20:11:00",
  "plannedHours": 20
}
```

## 🧪 Test với Postman/cURL

### 1. Get your token first
```javascript
// Run in browser console
localStorage.getItem('accessToken')
```

### 2. Test API với cURL
```bash
curl -X POST https://be-ev-station-based-rental-system.onrender.com/api/order/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "customerId": "330d185b-1560-44bc-bf91-8269b1da517c",
    "vehicleId": 7,
    "startTime": "2025-11-03T07:11:00.000Z",
    "endTime": "2025-11-03T20:11:00.000Z",
    "plannedHours": 20
  }'
```

### 3. Thử các format datetime khác

**Option A: ISO 8601 với Z**
```json
{
  "startTime": "2025-11-03T07:11:00.000Z",
  "endTime": "2025-11-03T20:11:00.000Z"
}
```

**Option B: LocalDateTime format**
```json
{
  "startTime": "2025-11-03T07:11:00",
  "endTime": "2025-11-03T20:11:00"
}
```

**Option C: Timestamp milliseconds**
```json
{
  "startTime": 1730617860000,
  "endTime": 1730664660000
}
```

## 🔍 Kiểm tra Backend

### Câu hỏi cần trả lời:

1. **Backend có log gì?**
   - Xem console của Spring Boot application
   - Tìm stack trace để biết lỗi cụ thể

2. **Database có constraint gì?**
   ```sql
   -- Kiểm tra table structure
   DESCRIBE orders;
   
   -- Kiểm tra foreign keys
   SELECT * FROM customer WHERE customer_id = '330d185b-1560-44bc-bf91-8269b1da517c';
   SELECT * FROM vehicle WHERE vehicle_id = 7;
   ```

3. **Backend validation rules?**
   - startTime phải > now?
   - endTime phải > startTime?
   - plannedHours phải match với (endTime - startTime)?
   - Vehicle phải available?

4. **Backend có cần thêm fields?**
   - stationId?
   - paymentMethod?
   - depositAmount?
   - totalPrice?

## 🎯 Các trường hợp có thể

### Case 1: DateTime Validation Failed
Backend reject vì:
- startTime trong quá khứ
- endTime không đúng với plannedHours
- Format datetime không khớp

**Fix:** Frontend đã update sang ISO format với timezone

### Case 2: Vehicle Not Available
Vehicle ID 7 đang:
- Được thuê bởi order khác
- Status không phải "available"
- Không tồn tại trong database

**Check:**
```sql
SELECT * FROM vehicle WHERE vehicle_id = 7;
SELECT * FROM orders WHERE vehicle_id = 7 AND status IN ('PENDING', 'CONFIRMED', 'IN_PROGRESS');
```

### Case 3: Customer Validation Failed
Customer UUID không hợp lệ:
- Không tồn tại trong database
- Account chưa verified
- Account bị banned

**Check:**
```sql
SELECT * FROM customer WHERE customer_id = '330d185b-1560-44bc-bf91-8269b1da517c';
```

### Case 4: Business Logic Error
Backend có thể check:
- Customer có order PENDING chưa thanh toán
- Thời gian book quá xa (max 30 days?)
- Thời gian thuê quá dài (max 7 days?)
- Vehicle và customer khác station?

### Case 5: Missing Required Fields
Backend có thể yêu cầu:
```json
{
  "customerId": "uuid",
  "vehicleId": 7,
  "stationId": 2,  // ← Thiếu?
  "startTime": "...",
  "endTime": "...",
  "plannedHours": 20,
  "depositAmount": 0,  // ← Thiếu?
  "paymentMethod": "CASH"  // ← Thiếu?
}
```

## ✅ Frontend đã làm đúng

- ✅ customerId là UUID string
- ✅ vehicleId là integer
- ✅ plannedHours là integer
- ✅ DateTime format chuẩn
- ✅ Không gửi null couponCode

## 🚨 ACTION REQUIRED

**Backend team cần:**
1. Check logs và share stack trace
2. Verify database có dữ liệu test
3. Document đầy đủ required fields
4. Document validation rules

**Frontend có thể thử:**
1. Test với vehicle ID khác
2. Test với customer ID khác (tạo account mới)
3. Thử thêm fields optional (stationId, depositAmount, etc.)
4. Kiểm tra xem có order pending nào chưa

## 📞 Next Steps

1. **XEM BACKEND LOGS** - Quan trọng nhất!
2. Test API với Postman để isolate issue
3. Check database có data hợp lệ
4. Review backend validation code
5. Update API documentation nếu thiếu

---

**Current Status:** Waiting for backend team to investigate HTTP 500 error.
