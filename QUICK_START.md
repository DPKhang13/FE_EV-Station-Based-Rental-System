# 🚀 Quick Start: Vehicle API Integration

## TL;DR

Dự án đã được cập nhật để lấy dữ liệu xe từ backend API thay vì hard-coded data.

## ⚡ Sử Dụng Nhanh

### 1. Trong Component:

```jsx
import { useVehicles } from '../hooks/useVehicles';

function MyComponent() {
  const { vehicles, loading, error } = useVehicles();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {vehicles.map(car => (
        <div key={car.id}>{car.vehicle_name}</div>
      ))}
    </div>
  );
}
```

### 2. Với Filter:

```jsx
function FilterComponent() {
  const { vehicles, loading } = useVehicles();
  
  if (loading) return <div>Loading...</div>;
  
  const available4Seaters = vehicles.filter(
    car => car.type === '4-seater' && car.status === 'Available'
  );
  
  return <div>Found {available4Seaters.length} cars</div>;
}
```

## 🔧 API Setup

**Endpoint:**
```
GET http://localhost:8080/api/vehicles/get
```

**Headers:**
```javascript
{
  'Authorization': 'Bearer ' + localStorage.getItem('accessToken'),
  'Content-Type': 'application/json'
}
```

## 📊 Dữ Liệu Xe

Mỗi vehicle có các field:
```javascript
{
  id: 1,
  vehicle_id: "1",
  vehicle_name: "VinFast VF8",
  brand: "VinFast",
  type: "4-seater" | "7-seater",
  seat_count: 5,
  color: "Blue",
  year_of_manufacture: 2024,
  plate_number: "51A-12345",
  status: "Available" | "Rented" | "Maintenance",
  battery_status: "100%",
  battery_capacity: "87.7 kWh",
  range_km: 447,
  stationId: 5,
  stationName: "Trạm Quận 1",
  // ... và nhiều field khác
}
```

## 🛡️ Error Handling

Hook tự động handle:
- ✅ Không có token → Dùng fallback data
- ✅ API error → Dùng fallback data
- ✅ API offline → Dùng fallback data

→ **App luôn chạy được!**

## 📝 Components Đã Update

- ✅ `CarFilter.jsx` - Lọc và hiển thị xe
- ✅ `Booking4Seater.jsx` - Đặt xe 4 chỗ
- ✅ `Booking7Seater.jsx` - Đặt xe 7 chỗ

## 📚 Docs Đầy Đủ

- `VEHICLE_API_INTEGRATION.md` - Hướng dẫn chi tiết
- `API_INTEGRATION_SUMMARY.md` - Tóm tắt những gì đã làm
- `src/examples/VehicleAPIExamples.jsx` - 8 code examples

## 🎯 That's It!

Chỉ cần `import { useVehicles }` và bắt đầu code! 🚗⚡
