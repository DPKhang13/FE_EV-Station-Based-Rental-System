# 🚀 API Services - Hướng Dẫn Sử Dụng

## ✅ HOÀN TẤT! Đã tạo services cho TẤT CẢ API endpoints!

### 📦 Các Services Đã Tạo:

| Service | File | Endpoints |
|---------|------|-----------|
| 🔐 Auth | `authService.js` | Login, Register, OTP, Logout, Refresh Token, Forgot Password |
| 🚗 Vehicle | `vehicleService.js` | Get, Create, Update, Delete vehicles |
| 📝 Order | `orderService.js` | Create, Update, Delete, Pickup, Return orders |
| 📍 Station | `rentalStationService.js` | Get, Search, Create, Update stations |
| 💰 Pricing | `pricingRuleService.js` | Get, Update pricing rules |
| 🔧 Maintenance | `maintenanceService.js` | CRUD maintenance records |
| 💬 Feedback | `feedbackService.js` | CRUD feedback |
| 🔔 Notification | `notificationService.js` | CRUD notifications |
| 👔 Staff Schedule | `staffScheduleService.js` | CRUD staff schedules |
| 🎫 Coupon | `couponService.js` | Get all coupons |
| 💳 Payment | `paymentService.js` | VNPay payment URL & callback |
| 💵 Transaction | `transactionService.js` | Search & sort transactions |
| 👤 Profile | `profileService.js` | Update user profile |

---

## 🎯 Cách Sử Dụng

### Option 1: Import từng service

```javascript
import { authService, orderService, vehicleService } from './services';

// Sử dụng
const vehicles = await vehicleService.getAll();
const orders = await orderService.getMyOrders();
```

### Option 2: Import service cụ thể

```javascript
import authService from './services/authService';
import orderService from './services/orderService';
```

---

## 📖 Examples

### 🔐 Authentication

```javascript
import { authService } from './services';

// Login
const loginData = await authService.login('email@example.com', 'password');
// Token tự động lưu vào localStorage!

// Register
const registerData = await authService.register({
    email: 'user@example.com',
    password: 'password123',
    fullName: 'John Doe'
});

// Verify OTP
await authService.verifyOTP('email@example.com', '123456');

// Logout
await authService.logout();
// Token tự động xóa khỏi localStorage!

// Forgot Password Flow
await authService.forgotPassword('email@example.com');
await authService.verifyForgotPasswordOTP('email@example.com', '123456');
await authService.resetPassword('email@example.com', 'newPass', 'newPass');
```

---

### 📝 Orders

```javascript
import { orderService } from './services';

// Tạo đơn hàng
const newOrder = await orderService.create({
    vehicleId: 1,
    startDate: '2025-10-28',
    endDate: '2025-10-30',
    pickupStationId: 1,
    returnStationId: 1
});

// Lấy đơn hàng của tôi
const myOrders = await orderService.getMyOrders();

// Lấy tất cả đơn (admin)
const allOrders = await orderService.getAll();

// Cập nhật đơn
await orderService.update(orderId, { status: 'CONFIRMED' });

// Pickup - Nhận xe
await orderService.pickup(orderId, { 
    actualPickupTime: new Date().toISOString() 
});

// Return - Trả xe
await orderService.return(orderId, { 
    actualReturnTime: new Date().toISOString(),
    condition: 'GOOD'
});

// Xóa đơn
await orderService.delete(orderId);
```

---

### 🚗 Vehicles (Đã có từ trước)

```javascript
import { useVehicles } from './hooks/useVehicles';

// Trong component
function CarList() {
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

---

### 📍 Rental Stations

```javascript
import { rentalStationService } from './services';

// Lấy tất cả trạm
const stations = await rentalStationService.getAll();

// Tìm kiếm trạm
const results = await rentalStationService.search({
    city: 'Ho Chi Minh',
    district: 'District 1'
});

// Tạo trạm mới
await rentalStationService.create({
    name: 'Station Central',
    address: '123 Main St',
    city: 'Ho Chi Minh'
});

// Cập nhật trạm
await rentalStationService.update(stationId, {
    name: 'Updated Name'
});
```

---

### 💰 Pricing Rules

```javascript
import { pricingRuleService } from './services';

// Lấy tất cả bảng giá
const pricingRules = await pricingRuleService.getAll();

// Cập nhật giá cho loại xe
await pricingRuleService.update(4, 'Standard', {
    basePrice: 500000,
    hourlyRate: 50000,
    dailyRate: 800000
});
```

---

### 💬 Feedback

```javascript
import { feedbackService } from './services';

// Tạo feedback
await feedbackService.create({
    orderId: 123,
    rating: 5,
    comment: 'Great service!'
});

// Lấy tất cả feedback
const feedbacks = await feedbackService.getAll();

// Lấy feedback theo ID
const feedback = await feedbackService.getById(feedbackId);

// Cập nhật feedback
await feedbackService.update(feedbackId, {
    rating: 4,
    comment: 'Updated comment'
});

// Xóa feedback
await feedbackService.delete(feedbackId);
```

---

### 🔔 Notifications

```javascript
import { notificationService } from './services';

// Lấy tất cả thông báo
const notifications = await notificationService.getAll();

// Đánh dấu đã đọc
await notificationService.update(notificationId, {
    isRead: true
});

// Xóa thông báo
await notificationService.delete(notificationId);
```

---

### 🎫 Coupons

```javascript
import { couponService } from './services';

// Lấy tất cả mã giảm giá
const coupons = await couponService.showAll();

// Hiển thị
coupons.forEach(coupon => {
    console.log(`${coupon.code}: -${coupon.discount}%`);
});
```

---

### 💳 Payment (VNPay)

```javascript
import { paymentService } from './services';

// Tạo URL thanh toán
const paymentUrl = await paymentService.createPaymentUrl({
    orderId: 123,
    amount: 1000000,
    orderInfo: 'Thanh toan don hang #123'
});

// Redirect user
window.location.href = paymentUrl;

// Xử lý callback (trong route /payment/callback)
const result = await paymentService.vnpayCallback({
    vnp_TransactionNo: '...',
    vnp_ResponseCode: '00',
    // ... other params from VNPay
});
```

---

### 💵 Transaction History

```javascript
import { transactionService } from './services';

// Lấy giao dịch của user
const transactions = await transactionService.searchByUserId(userId, {
    startDate: '2025-01-01',
    endDate: '2025-12-31'
});

// Sắp xếp giao dịch
const sorted = await transactionService.sortByUserId(userId, {
    sortBy: 'date',
    order: 'desc'
});
```

---

### 👤 Profile

```javascript
import { profileService } from './services';

// Cập nhật profile
await profileService.update({
    fullName: 'John Doe',
    phone: '0123456789',
    address: '123 Main St'
});
```

---

### 👔 Staff Schedule

```javascript
import { staffScheduleService } from './services';

// Lấy danh sách lịch
const schedules = await staffScheduleService.getList();

// Tìm kiếm lịch theo ngày
const todaySchedules = await staffScheduleService.search({
    date: '2025-10-28',
    stationId: 1
});

// Tạo lịch làm việc
await staffScheduleService.create({
    staffId: 5,
    stationId: 1,
    startTime: '2025-10-28T08:00:00',
    endTime: '2025-10-28T17:00:00'
});

// Cập nhật lịch
await staffScheduleService.update(scheduleId, {
    startTime: '2025-10-28T09:00:00'
});
```

---

### 🔧 Maintenance

```javascript
import { maintenanceService } from './services';

// Lấy tất cả bảo trì
const maintenances = await maintenanceService.getAll();

// Tạo bảo trì mới
await maintenanceService.create({
    vehicleId: 1,
    description: 'Thay dầu',
    scheduledDate: '2025-11-01',
    cost: 500000
});

// Cập nhật trạng thái
await maintenanceService.update(maintenanceId, {
    status: 'COMPLETED',
    actualCost: 450000
});

// Xóa bảo trì
await maintenanceService.delete(maintenanceId);
```

---

## 🎨 Sử Dụng Với React Components

### Example: Order Form Component

```jsx
import React, { useState } from 'react';
import { orderService } from '../services';

function OrderForm() {
    const [formData, setFormData] = useState({
        vehicleId: '',
        startDate: '',
        endDate: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const result = await orderService.create(formData);
            console.log('Order created:', result);
            alert('Đặt xe thành công!');
        } catch (err) {
            setError(err.message);
            alert('Lỗi: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Form fields */}
            <button type="submit" disabled={loading}>
                {loading ? 'Đang xử lý...' : 'Đặt xe'}
            </button>
            {error && <div style={{color: 'red'}}>{error}</div>}
        </form>
    );
}
```

### Example: Station Selector

```jsx
import React, { useState, useEffect } from 'react';
import { rentalStationService } from '../services';

function StationSelector() {
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStations = async () => {
            try {
                const data = await rentalStationService.getAll();
                setStations(data);
            } catch (error) {
                console.error('Error loading stations:', error);
            } finally {
                setLoading(false);
            }
        };

        loadStations();
    }, []);

    if (loading) return <div>Loading stations...</div>;

    return (
        <select>
            {stations.map(station => (
                <option key={station.id} value={station.id}>
                    {station.name} - {station.address}
                </option>
            ))}
        </select>
    );
}
```

---

## 🔒 Error Handling

Tất cả services đều throw error khi có vấn đề. Bạn nên wrap trong try-catch:

```javascript
try {
    const result = await orderService.create(orderData);
    // Success
} catch (error) {
    console.error('Error:', error.message);
    // Handle error
    if (error.message.includes('401')) {
        // Redirect to login
    }
}
```

---

## 📡 Auto Token Management

- **Login**: Token tự động lưu vào `localStorage`
- **All API calls**: Token tự động được thêm vào header
- **Logout**: Token tự động bị xóa
- **Expired token**: Bạn có thể dùng `authService.refreshToken()`

---

## 🎯 Best Practices

### 1. Always handle errors

```javascript
try {
    await someService.someMethod();
} catch (error) {
    // Handle appropriately
}
```

### 2. Use loading states

```javascript
const [loading, setLoading] = useState(false);

const fetchData = async () => {
    setLoading(true);
    try {
        await someService.someMethod();
    } finally {
        setLoading(false);
    }
};
```

### 3. Validate before API call

```javascript
if (!formData.email) {
    alert('Email required');
    return;
}

await authService.register(formData);
```

---

## 📊 Tóm Tắt

✅ **13 Services** covering **50+ API endpoints**
✅ **Auto token management** 
✅ **Consistent error handling**
✅ **Easy to use** - chỉ cần import và gọi
✅ **TypeScript-ready** - có thể thêm types sau
✅ **Fully documented** - comment cho mọi function

---

## 🚀 Ready to Use!

Tất cả services đã sẵn sàng! Chỉ cần:

```javascript
import { authService, orderService } from './services';

// Start coding!
const data = await orderService.getMyOrders();
```

**Happy Coding! 🎉**
