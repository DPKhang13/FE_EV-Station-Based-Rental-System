# ⚠️ VẤN ĐỀ BACKEND - VARIANT BỊ LOWERCASE

## 🔴 Vấn đề

Backend đang **tự động chuyển variant thành lowercase** khi lưu vào database, mặc dù frontend gửi đúng format (chữ cái đầu viết hoa).

### Ví dụ:
- Frontend gửi: `"Plus"`
- Database lưu: `"plus"` ❌ (SAI)
- Database cần: `"Plus"` ✅ (ĐÚNG)

## 🔍 Đã kiểm tra

✅ Frontend dropdown values: `"Air"`, `"Plus"`, `"Pro"` - ĐÚNG
✅ Frontend normalization code: Chuyển thành First-letter-capitalized - ĐÚNG
✅ Frontend payload gửi đi: variant = `"Plus"` - ĐÚNG
❌ Backend response trả về: variant = `"plus"` - SAI

## 📁 Files đã kiểm tra (Frontend)

1. `src/components/admin/StationManagement.jsx` - Line 267-271
   - Code normalize variant đúng
   - Debug logs đã thêm

2. `src/services/vehicleService.js` - Line 175-206
   - Payload gửi đúng format
   - Debug logs đã thêm

## 🎯 Nguyên nhân

Backend (Java/Spring Boot) có thể đang:

### 1. Sử dụng `@Column` annotation với lowercase constraint
```java
@Column(name = "variant")
@Convert(converter = LowercaseConverter.class) // ❌ Cần xóa
private String variant;
```

### 2. Có AttributeConverter tự động lowercase
```java
public class LowercaseConverter implements AttributeConverter<String, String> {
    @Override
    public String convertToDatabaseColumn(String attribute) {
        return attribute != null ? attribute.toLowerCase() : null; // ❌ SAI
    }
}
```

### 3. Setter method tự lowercase
```java
public void setVariant(String variant) {
    this.variant = variant.toLowerCase(); // ❌ SAI
}
```

### 4. Database column có collation lowercase
```sql
ALTER TABLE vehicle_model 
MODIFY variant VARCHAR(50) 
COLLATE utf8mb4_general_ci; -- ❌ Có thể gây vấn đề
```

## 🔧 Cần sửa ở Backend

### File cần kiểm tra:

1. **VehicleModel.java / Vehicle.java**
   ```java
   @Entity
   @Table(name = "vehicle_model")
   public class VehicleModel {
       
       @Column(name = "variant")
       private String variant; // ← KHÔNG được lowercase ở đây
       
       // Getter - giữ nguyên
       public String getVariant() {
           return this.variant;
       }
       
       // Setter - KHÔNG được lowercase
       public void setVariant(String variant) {
           this.variant = variant; // ✅ Giữ nguyên giá trị từ frontend
       }
   }
   ```

2. **VehicleController.java**
   ```java
   @PostMapping("/create")
   public ResponseEntity<?> createVehicle(@RequestBody VehicleDTO dto) {
       // KHÔNG lowercase variant ở đây
       VehicleModel vehicle = new VehicleModel();
       vehicle.setVariant(dto.getVariant()); // ✅ Giữ nguyên
       // ...
   }
   ```

3. **Database Migration**
   ```sql
   -- Sửa dữ liệu hiện tại
   UPDATE vehicle_model 
   SET variant = CONCAT(UPPER(SUBSTRING(variant, 1, 1)), SUBSTRING(variant, 2))
   WHERE variant IS NOT NULL;
   
   -- Kết quả:
   -- 'plus' → 'Plus'
   -- 'air'  → 'Air'
   -- 'pro'  → 'Pro'
   ```

## 🛠️ Giải pháp tạm thời (Frontend)

Đã thêm utility function để format lại variant khi nhận từ backend:

```javascript
// src/utils/formatVariant.js
export const formatVariant = (variant) => {
    if (!variant) return '';
    return variant.charAt(0).toUpperCase() + variant.slice(1).toLowerCase();
};
```

**LƯU Ý:** Đây chỉ là workaround. Backend VẪN CẦN SỬA để lưu đúng format vào database.

## ✅ Checklist sửa Backend

- [ ] Tìm file `VehicleModel.java` hoặc `Vehicle.java`
- [ ] Kiểm tra setter `setVariant()` - xóa `.toLowerCase()` nếu có
- [ ] Kiểm tra `@Convert` annotation - xóa nếu có LowercaseConverter
- [ ] Kiểm tra `VehicleController.java` - không lowercase trong controller
- [ ] Kiểm tra `VehicleService.java` - không lowercase trong service
- [ ] Run database migration để sửa dữ liệu cũ
- [ ] Test lại API POST /api/vehicles/create
- [ ] Verify variant được lưu đúng: "Plus", "Air", "Pro"

## 🧪 Test Plan

### 1. Test Backend API với Postman

```json
POST http://localhost:8080/api/vehicles/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "plateNumber": "TEST-001",
  "stationId": 1,
  "brand": "VinFast",
  "vehicleName": "Test Car",
  "color": "White",
  "seatCount": 4,
  "variant": "Plus",  // ← GỬI ĐI
  "status": "AVAILABLE"
}
```

**Expected Response:**
```json
{
  "vehicleId": 123,
  "variant": "Plus"  // ← PHẢI TRẢ VỀ ĐÚNG, KHÔNG PHẢI "plus"
}
```

### 2. Kiểm tra Database

```sql
SELECT vehicle_id, variant 
FROM vehicle_model 
WHERE plate_number = 'TEST-001';

-- Expected:
-- vehicle_id | variant
-- ----------|--------
--       123 | Plus     ✅ (KHÔNG phải "plus")
```

## 📞 Liên hệ

Cần backend team kiểm tra và sửa các file sau trong **BE repository**:
- `src/main/java/com/example/model/VehicleModel.java`
- `src/main/java/com/example/controller/VehicleController.java`
- `src/main/java/com/example/service/VehicleService.java`
- `src/main/resources/db/migration/V*__update_variant_format.sql`

---

**Ngày tạo:** 06/11/2025
**Severity:** MEDIUM (Ảnh hưởng hiển thị dữ liệu)
**Impact:** Database có dữ liệu sai format
