# 🧪 Test Guide - Variant Format Issue

## 🎯 Mục đích
Kiểm tra và xác nhận rằng variant được xử lý đúng cách từ frontend, và xác định vị trí backend đang lowercase variant.

## 📋 Các bước test

### 1. Test Frontend (Đã sửa ✅)

#### Bước 1.1: Mở Console
1. Mở Chrome DevTools (F12)
2. Chuyển sang tab **Console**
3. Clear console để dễ đọc

#### Bước 1.2: Thêm xe mới
1. Đăng nhập với tài khoản Admin
2. Vào trang **Quản lý điểm thuê**
3. Click **Thêm xe** ở một trạm bất kỳ
4. Điền form:
   - Biển số: `TEST-VARIANT-001`
   - Hãng xe: `VinFast`
   - Màu sắc: `White`
   - Số chỗ: `4`
   - **Variant: `Plus`** ← Chọn từ dropdown

#### Bước 1.3: Xem Console Logs

Bạn sẽ thấy các log sau:

```
🔍 DEBUG VARIANT:
  - vehicleFormData.variant (từ form): Plus
  - variant (sau khi normalize): Plus

🚀 [API] Đang tạo xe mới: {plateNumber: "TEST-VARIANT-001", ...}
🔍 [API] KIỂM TRA VARIANT TRƯỚC KHI GỬI:
  - vehicleData.variant: Plus
  - Type: string
  - JSON payload sẽ gửi: {
      "variant": "Plus",  // ← Frontend gửi ĐÚNG
      ...
    }

📡 [API] Response status: 200

✅ [API] Xe đã được tạo: {...}
🔍 [API] KIỂM TRA VARIANT SAU KHI TẠO:
  - data.variant: plus  // ← Backend trả về SAI (lowercase)
```

**KẾT LUẬN:** Frontend gửi `"Plus"` ✅ nhưng backend trả về `"plus"` ❌

---

### 2. Test Backend (Cần sửa ❌)

#### Test với Postman

**Request:**
```http
POST https://be-ev-station-based-rental-system.onrender.com/api/vehicles/create
Authorization: Bearer {YOUR_ACCESS_TOKEN}
Content-Type: application/json

{
  "plateNumber": "TEST-POST-001",
  "stationId": 1,
  "brand": "VinFast",
  "vehicleName": "VinFast 4S Plus",
  "color": "White",
  "seatCount": 4,
  "variant": "Plus",
  "status": "AVAILABLE",
  "description": "Test vehicle",
  "batteryStatus": "100%",
  "batteryCapacity": "100 kWh",
  "rangeKm": 500
}
```

**Expected Response (ĐÚNG):**
```json
{
  "vehicleId": 123,
  "variant": "Plus"  // ← Phải là "Plus", KHÔNG phải "plus"
}
```

**Actual Response (SAI):**
```json
{
  "vehicleId": 123,
  "variant": "plus"  // ❌ Backend đã lowercase
}
```

---

### 3. Test Database

#### Query để kiểm tra

```sql
-- Xem variant trong database
SELECT 
    vehicle_id,
    plate_number, 
    variant,
    LENGTH(variant) as length,
    ASCII(SUBSTRING(variant, 1, 1)) as first_char_ascii
FROM vehicle_model 
WHERE plate_number LIKE 'TEST-%'
ORDER BY vehicle_id DESC
LIMIT 10;
```

**Kết quả mong đợi:**
```
vehicle_id | plate_number    | variant | length | first_char_ascii
-----------|-----------------|---------|--------|------------------
       123 | TEST-POST-001   | Plus    |      4 |               80 (P - uppercase)
```

**Kết quả thực tế:**
```
vehicle_id | plate_number    | variant | length | first_char_ascii
-----------|-----------------|---------|--------|------------------
       123 | TEST-POST-001   | plus    |      4 |              112 (p - lowercase) ❌
```

---

### 4. Trace Backend Code

#### File cần kiểm tra:

##### 4.1 VehicleModel.java / Vehicle.java

```java
// ❌ SAI - Nếu có code này
@Column(name = "variant")
private String variant;

public void setVariant(String variant) {
    this.variant = variant.toLowerCase(); // ← TÌM THẤY VẤN ĐỀ!
}
```

```java
// ✅ ĐÚNG - Nên là
@Column(name = "variant")
private String variant;

public void setVariant(String variant) {
    this.variant = variant; // Giữ nguyên giá trị
}
```

##### 4.2 VehicleController.java

```java
@PostMapping("/create")
public ResponseEntity<?> createVehicle(@RequestBody VehicleDTO dto) {
    // ❌ SAI - Nếu có
    String variant = dto.getVariant().toLowerCase();
    vehicle.setVariant(variant);
    
    // ✅ ĐÚNG - Nên là
    vehicle.setVariant(dto.getVariant()); // Giữ nguyên
}
```

##### 4.3 Tìm kiếm trong Backend

Chạy lệnh trong backend repository:

```bash
# Tìm tất cả file có toLowerCase() với variant
grep -r "variant.*toLowerCase\|toLowerCase.*variant" --include="*.java" .

# Tìm file VehicleModel
find . -name "*Vehicle*.java" -type f

# Xem setter method
grep -A 5 "setVariant" src/main/java/com/*/model/VehicleModel.java
```

---

## 🔍 Debug Checklist

### Frontend ✅
- [x] Dropdown values: `"Air"`, `"Plus"`, `"Pro"` - ĐÚNG
- [x] formatVariant utility function - ĐÚNG
- [x] Payload gửi đi: `variant: "Plus"` - ĐÚNG
- [x] Console logs chi tiết - ĐÚNG

### Backend ❌ (CẦN KIỂM TRA)
- [ ] VehicleModel.java - setter không lowercase?
- [ ] VehicleController.java - không lowercase?
- [ ] VehicleService.java - không lowercase?
- [ ] Database collation - case-sensitive?
- [ ] JPA AttributeConverter - không lowercase?

---

## 🛠️ Workaround hiện tại

Frontend đã có workaround:
1. ✅ `formatVariant()` utility để format variant khi **nhận từ backend**
2. ✅ `vehicleService.transformVehicleData()` tự động format
3. ✅ Console warning khi backend trả về lowercase

**Ví dụ warning:**
```
⚠️ [vehicleService] Backend trả về variant="plus" (lowercase). 
Đã tự động format thành "Plus". 
Backend cần sửa để lưu đúng format vào database!
```

**LƯU Ý:** Đây CHỈ LÀ workaround cho hiển thị. Data trong database VẪN SAI và CẦN backend sửa!

---

## 📊 Test Results Summary

| Thành phần | Trạng thái | Variant gửi/nhận | Ghi chú |
|-----------|-----------|------------------|---------|
| Frontend Form | ✅ OK | `"Plus"` | Dropdown value đúng |
| Frontend Normalize | ✅ OK | `"Plus"` | formatVariant() works |
| Frontend Payload | ✅ OK | `"Plus"` | JSON.stringify đúng |
| Backend Response | ❌ FAIL | `"plus"` | Backend lowercase! |
| Database Value | ❌ FAIL | `"plus"` | Lưu sai format |
| Frontend Display | ✅ OK | `"Plus"` | Workaround format lại |

---

## 🎬 Next Steps

1. **Backend Team:**
   - [ ] Tìm và sửa code lowercase variant
   - [ ] Run migration để fix data cũ
   - [ ] Test với Postman
   - [ ] Verify database

2. **QA:**
   - [ ] Test thêm xe mới sau khi backend sửa
   - [ ] Verify variant hiển thị đúng
   - [ ] Verify database lưu đúng

3. **Frontend:**
   - [ ] Xóa workaround sau khi backend fix
   - [ ] Xóa console warnings
   - [ ] Cleanup code

---

## 📞 Contact

- Frontend issue: File đã sửa trong `FE_EV-Station-Based-Rental-System`
- Backend issue: Cần sửa trong `BE_*` repository
- Documentation: `BACKEND_VARIANT_ISSUE.md`

**Ngày test:** 06/11/2025
