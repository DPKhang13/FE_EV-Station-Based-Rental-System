# Hướng Dẫn Sử Dụng Vehicle API Integration

## 📋 Tổng Quan

Dự án đã được cập nhật để lấy dữ liệu xe động từ backend API thay vì dữ liệu fix cứng.

## 🔧 Các File Đã Tạo/Cập Nhật

### 1. **src/services/vehicleService.js** (MỚI)
Service để kết nối với Vehicle API

**Các function chính:**
- `getVehicles()` - Lấy danh sách xe từ API
- `transformVehicleData()` - Chuyển đổi dữ liệu từ API sang format frontend
- `fetchAndTransformVehicles()` - Lấy và transform tất cả xe

### 2. **src/hooks/useVehicles.js** (MỚI)
Custom React Hook để sử dụng dữ liệu xe

**Trả về:**
```javascript
{
  vehicles: [],      // Danh sách xe
  loading: boolean,  // Trạng thái loading
  error: null,       // Lỗi (nếu có)
  refetch: function  // Function để fetch lại dữ liệu
}
```

### 3. **src/components/carData.js** (CẬP NHẬT)
- Giữ lại dữ liệu cũ như fallback data
- Export `fallbackCarsData` để sử dụng khi API không available

## 🚀 Cách Sử Dụng

### Option 1: Sử Dụng Custom Hook (Khuyến Nghị)

```jsx
import { useVehicles } from '../hooks/useVehicles';

function YourComponent() {
  const { vehicles, loading, error, refetch } = useVehicles();

  if (loading) {
    return <div>Đang tải dữ liệu xe...</div>;
  }

  if (error) {
    return <div>Lỗi: {error}</div>;
  }

  return (
    <div>
      {vehicles.map(car => (
        <div key={car.id}>
          <h3>{car.vehicle_name}</h3>
          <p>Biển số: {car.plate_number}</p>
        </div>
      ))}
      <button onClick={refetch}>Tải lại</button>
    </div>
  );
}
```

### Option 2: Sử Dụng Service Trực Tiếp

```jsx
import { fetchAndTransformVehicles } from '../services/vehicleService';

function YourComponent() {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    const loadVehicles = async () => {
      const data = await fetchAndTransformVehicles();
      setVehicles(data);
    };
    loadVehicles();
  }, []);

  // Render...
}
```

## 📊 Cấu Trúc Dữ Liệu Xe

### Từ API:
```javascript
{
  vehicleId: 1,
  stationId: 5,
  stationName: "Trạm Quận 1",
  plateNumber: "51A-12345",
  status: "AVAILABLE",
  vehicleName: "VinFast VF8",
  description: "Xe điện cao cấp",
  brand: "VinFast",
  color: "Xanh dương",
  transmission: "Automatic",
  seatCount: 5,
  year: 2024,
  variant: "Plus",
  batteryStatus: "100%",
  batteryCapacity: "87.7 kWh",
  rangeKm: 447,
  pricingRuleId: 10
}
```

### Sau khi Transform (Frontend Format):
```javascript
{
  id: 1,
  vehicle_id: "1",
  vehicle_name: "VinFast VF8",
  brand: "VinFast",
  name: "VinFast VF8",
  image: standard4, // Tự động chọn dựa vào seatCount
  type: "4-seater", // Tự động chọn dựa vào seatCount
  seat_count: 5,
  grade: "Plus",
  color: "Xanh dương",
  year_of_manufacture: 2024,
  plate_number: "51A-12345",
  status: "Available", // AVAILABLE -> Available
  description: "Xe điện cao cấp",
  branch: "5",
  transmission: "Automatic",
  variant: "Plus",
  battery_status: "100%",
  battery_capacity: "87.7 kWh",
  range_km: 447,
  stationId: 5,
  stationName: "Trạm Quận 1",
  pricingRuleId: 10
}
```

## 🔐 Authentication

API yêu cầu authentication token. Hook `useVehicles` tự động:
1. Kiểm tra token trong localStorage
2. Nếu có token: Fetch từ API
3. Nếu không có token: Sử dụng fallback data

**Lưu ý:** Token phải được lưu trong `localStorage.getItem('accessToken')`

## 🛡️ Xử Lý Lỗi

### Fallback Strategy:
1. Không có token → Sử dụng fallback data
2. API lỗi → Sử dụng fallback data
3. API trả về rỗng → Sử dụng fallback data

### Xem Log:
Mở Console để xem các thông báo:
- ✅ Success: Data từ API
- ⚠️ Warning: Sử dụng fallback data
- ❌ Error: Chi tiết lỗi

## 🔄 Cập Nhật Các Component Hiện Có

### Ví dụ: ListCarPage.jsx

**Trước:**
```jsx
import cars from './carData';

function ListCarPage() {
  const [filteredCars, setFilteredCars] = useState(cars);
  // ...
}
```

**Sau:**
```jsx
import { useVehicles } from '../hooks/useVehicles';

function ListCarPage() {
  const { vehicles: cars, loading } = useVehicles();
  const [filteredCars, setFilteredCars] = useState([]);

  useEffect(() => {
    setFilteredCars(cars);
  }, [cars]);

  if (loading) return <div>Loading...</div>;
  // ...
}
```

## 🌐 Cấu Hình API

API URL mặc định: `https://be-ev-station-based-rental-system.onrender.com/api`

Để thay đổi, sửa trong `src/services/vehicleService.js`:
```javascript
const API_BASE_URL = 'http://your-api-url/api';
```

## 🧪 Testing

### Test API Connection:
```javascript
import { getVehicles } from './services/vehicleService';

// Trong console hoặc component
getVehicles()
  .then(data => console.log('Success:', data))
  .catch(err => console.error('Error:', err));
```

### Test Hook:
```jsx
function TestComponent() {
  const { vehicles, loading, error } = useVehicles();
  
  console.log('Vehicles:', vehicles);
  console.log('Loading:', loading);
  console.log('Error:', error);
  
  return <div>Check console</div>;
}
```

## 📝 Checklist Migration

Khi migrate component sang sử dụng API:

- [ ] Import `useVehicles` thay vì `carData`
- [ ] Thêm loading state
- [ ] Thêm error handling
- [ ] Cập nhật useEffect dependencies
- [ ] Test với API running
- [ ] Test khi API offline (fallback)
- [ ] Test khi chưa đăng nhập

## 🐛 Troubleshooting

### Không lấy được dữ liệu từ API:
1. Kiểm tra backend đã chạy chưa (https://be-ev-station-based-rental-system.onrender.com)
2. Kiểm tra token trong localStorage
3. Kiểm tra Console để xem lỗi
4. Kiểm tra CORS settings trên backend

### Dữ liệu bị lỗi format:
1. Kiểm tra `transformVehicleData()` trong `vehicleService.js`
2. So sánh structure từ API với expected format
3. Thêm logging để debug

### Image không hiển thị:
1. Kiểm tra file images trong `src/assets/`
2. Kiểm tra `getVehicleImage()` function
3. Có thể cần update logic dựa vào vehicle model

## 💡 Best Practices

1. **Luôn kiểm tra loading state** trước khi render data
2. **Sử dụng refetch** khi cần update data (sau khi thêm/sửa/xóa xe)
3. **Cache data** nếu cần (có thể thêm vào hook)
4. **Error boundary** để catch lỗi ở component level
5. **Optimistic updates** cho UX tốt hơn

## 🔮 Future Enhancements

- [ ] Thêm caching với React Query hoặc SWR
- [ ] Implement pagination
- [ ] Implement filters trên API level
- [ ] Real-time updates với WebSocket
- [ ] Offline support với Service Worker
- [ ] Image optimization & lazy loading

## 📞 Support

Nếu có vấn đề, kiểm tra:
1. Console logs
2. Network tab (DevTools)
3. Backend logs
4. API documentation

---

**Tạo ngày:** 28/10/2025
**Version:** 1.0.0
