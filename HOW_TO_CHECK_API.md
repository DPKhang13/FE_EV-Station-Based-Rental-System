# 🔍 Cách Kiểm Tra Kết Nối API

## ✅ HOÀN TẤT! Đã thêm API Status Checker

### 🎯 Bây giờ bạn sẽ thấy NGAY trên màn hình:

Mở app tại `http://localhost:5173`

➡️ **Góc trên bên phải** màn hình sẽ có 1 box màu hiển thị:

---

### 📊 3 Trạng Thái Có Thể Thấy:

#### 1️⃣ ✅ ĐANG DÙNG API (Box màu XANH)
```
✅ ĐANG DÙNG API! Nhận được X xe từ backend

🔑 Token: ✅ Có
🌐 Backend: ✅ Online
📊 Data count: X xe
```
➡️ **Nghĩa là:** App đang lấy dữ liệu ĐỘNG từ backend API!

---

#### 2️⃣ ❌ Chưa có Token (Box màu ĐỎ)
```
❌ Chưa có token - App đang dùng FALLBACK DATA

🔑 Token: ❌ Không có
🌐 Backend: ⏳ Đang check...
```
➡️ **Nghĩa là:** Chưa login nên đang dùng 40 xe cố định (fallback)

**Cách fix:** Login vào app để có token!

---

#### 3️⃣ ❌ Backend Offline (Box màu ĐỎ)
```
❌ Backend OFFLINE - App đang dùng FALLBACK DATA

🔑 Token: ✅ Có
🌐 Backend: ❌ Offline
```
➡️ **Nghĩa là:** Backend chưa chạy

**Cách fix:** Start backend server trên port 8080!

---

## 🔍 Kiểm Tra Thêm Trong Console

Mở Console (F12) và xem log:

### ✅ Khi ĐANG DÙNG API:
```
🔍 [useVehicles] Bắt đầu load dữ liệu xe...
🔑 [useVehicles] Có token - Đang fetch từ API...
🚀 [API] Đang gọi API: http://localhost:8080/api/vehicles/get
🔑 [API] Token: CÓ TOKEN ✅
📡 [API] Response status: 200
✅ [API] Nhận được dữ liệu từ backend: 50 xe
📊 [API] Sample data: {vehicleId: 1, vehicleName: "..."}
✅ [useVehicles] SUCCESS! Đã lấy dữ liệu từ API: 50 xe
🎯 [useVehicles] Đây là dữ liệu ĐỘNG từ backend, KHÔNG phải fix cứng!
✔️ [useVehicles] Hoàn tất load dữ liệu
```

### ⚠️ Khi KHÔNG CÓ TOKEN:
```
🔍 [useVehicles] Bắt đầu load dữ liệu xe...
⚠️ [useVehicles] Chưa đăng nhập - sử dụng dữ liệu fallback (40 xe cố định)
✔️ [useVehicles] Hoàn tất load dữ liệu
```

### ❌ Khi BACKEND OFFLINE:
```
🔍 [useVehicles] Bắt đầu load dữ liệu xe...
🔑 [useVehicles] Có token - Đang fetch từ API...
🚀 [API] Đang gọi API: http://localhost:8080/api/vehicles/get
🔑 [API] Token: CÓ TOKEN ✅
❌ [API] Lỗi khi gọi API: Failed to fetch
❌ [useVehicles] Lỗi khi fetch vehicles: ...
⚠️ [useVehicles] Dùng fallback data do có lỗi
✔️ [useVehicles] Hoàn tất load dữ liệu
```

---

## 🌐 Kiểm Tra Trong Network Tab

1. Mở DevTools (F12)
2. Vào tab **Network**
3. Reload trang (Ctrl+R)
4. Tìm request tên `get` hoặc `vehicles`

### ✅ Nếu thấy request:
- **URL:** `localhost:8080/api/vehicles/get`
- **Status:** 200 OK
- **Preview:** Array of vehicles

➡️ **ĐANG DÙNG API!** ✅

### ❌ Nếu KHÔNG thấy request:
➡️ Chưa có token hoặc backend offline

---

## 🎮 Test Ngay:

### Bước 1: Kiểm tra Status Box
```
Mở http://localhost:5173
→ Xem box góc trên phải màu gì?
```

### Bước 2: Nếu box XANH
```
✅ YAY! Đang dùng API rồi!
```

### Bước 3: Nếu box ĐỎ
```
❌ Chưa dùng API

→ Check: Có token không?
   Cách check: localStorage.getItem('accessToken')
   
→ Check: Backend đã chạy chưa?
   Cách check: Mở http://localhost:8080/api/vehicles/get
```

### Bước 4: Login để có token
```
1. Vào trang /login
2. Đăng nhập
3. Token sẽ được lưu vào localStorage
4. Reload trang
5. Box sẽ chuyển sang XANH ✅
```

---

## 🔄 Nút "Kiểm tra lại"

Trong Status Box có nút **"🔄 Kiểm tra lại"**

Click vào để test lại connection ngay lập tức!

---

## 📝 Tóm Tắt

| Trạng thái | Box Color | Token | Backend | Dùng gì? |
|------------|-----------|-------|---------|----------|
| ✅ Dùng API | 🟢 XANH | ✅ Có | ✅ Online | API Data |
| ❌ Chưa login | 🔴 ĐỎ | ❌ Không | ? | Fallback |
| ❌ Backend off | 🔴 ĐỎ | ✅ Có | ❌ Offline | Fallback |

---

## 💡 Kết Luận

**CÁCH ĐƠN GIẢN NHẤT:** Nhìn vào **box góc trên phải**!

- 🟢 XANH = Đang dùng API ✅
- 🔴 ĐỎ = Chưa dùng API, đang dùng fallback ❌

**Không cần đoán nữa!** 🎯
