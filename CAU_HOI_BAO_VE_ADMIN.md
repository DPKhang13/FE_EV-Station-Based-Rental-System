# CÂU HỎI BẢO VỆ DỰ ÁN - PHẦN ADMIN

## 📋 MỤC LỤC
1. [Tổng quan hệ thống Admin](#1-tổng-quan-hệ-thống-admin)
2. [Quản lý đơn hàng](#2-quản-lý-đơn-hàng)
3. [Dashboard và Thống kê](#3-dashboard-và-thống-kê)
4. [Quản lý Khách hàng](#4-quản-lý-khách-hàng)
5. [Quản lý Trạm và Xe](#5-quản-lý-trạm-và-xe)
6. [Báo cáo Sự cố](#6-báo-cáo-sự-cố)
7. [Bảng giá](#7-bảng-giá)
8. [Bảo mật và Phân quyền](#8-bảo-mật-và-phân-quyền)
9. [Xử lý Lỗi và UX](#9-xử-lý-lỗi-và-ux)
10. [Kiến trúc và Công nghệ](#10-kiến-trúc-và-công-nghệ)

---

## 1. TỔNG QUAN HỆ THỐNG ADMIN

### Q1.1: Hệ thống admin có những chức năng chính nào?
**Trả lời:**
- **Quản lý đơn hàng**: Xem danh sách, chi tiết, xử lý hoàn tiền, xem lý do hủy
- **Dashboard**: Thống kê tổng quan (doanh thu, số xe, tỷ lệ sử dụng, dịch vụ)
- **Quản lý khách hàng**: Xem danh sách, thông tin chi tiết khách hàng
- **Quản lý trạm**: Thêm/sửa/xóa trạm, quản lý xe tại trạm
- **Quản lý xe**: Thêm/sửa/xóa xe, xem lịch sử thuê
- **Báo cáo sự cố**: Xem và quản lý các báo cáo sự cố
- **Bảng giá**: Quản lý giá thuê xe theo loại và thời gian

### Q1.2: Admin có thể làm gì khác so với Staff?
**Trả lời:**
- Admin có quyền truy cập tất cả chức năng của Staff
- Admin có thể quản lý toàn bộ hệ thống (tất cả trạm, không giới hạn)
- Admin có thể xem dashboard tổng quan toàn hệ thống
- Admin có thể quản lý bảng giá, quản lý nhân viên
- Admin có thể xử lý hoàn tiền cho đơn hàng bị hủy
- Admin có quyền xem và quản lý tất cả đơn hàng trong hệ thống

---

## 2. QUẢN LÝ ĐƠN HÀNG

### Q2.1: Trang quản lý đơn hàng hiển thị những thông tin gì?
**Trả lời:**
- **Khách hàng**: Tên và số điện thoại
- **Xe thuê**: Tên xe và biển số
- **Thời gian thuê**: Thời gian bắt đầu và kết thúc
- **Trạm**: Tên trạm và địa chỉ
- **Tổng tiền**: Tổng giá trị đơn hàng
- **Trạng thái**: Pending, Confirmed, Rented, Completed, Cancelled, Refunded, Payment Failed
- **Thao tác**: Nút xem chi tiết đơn hàng

### Q2.2: Làm thế nào để tìm kiếm đơn hàng?
**Trả lời:**
- Có ô tìm kiếm ở đầu trang
- Tìm kiếm theo: Tên khách hàng, SĐT, mã đơn hàng, tên xe, biển số
- Tìm kiếm không phân biệt hoa thường
- Kết quả được lọc real-time khi người dùng nhập

### Q2.3: Làm thế nào hệ thống lấy dữ liệu đơn hàng?
**Trả lời:**
- Sử dụng 2 API:
  1. `getPendingOrders()`: Lấy đơn hàng chờ xác nhận (có sẵn customerName và phone)
  2. `getAll()`: Lấy tất cả đơn hàng (cần map từ customer object)
- Merge dữ liệu từ 2 nguồn để đảm bảo có đầy đủ thông tin
- Xử lý fallback nếu một trong hai API không trả về dữ liệu

### Q2.4: Trang chi tiết đơn hàng hiển thị gì?
**Trả lời:**
- **Bảng chi tiết**: Mã, loại dịch vụ, mô tả, giá, thời gian bắt đầu/kết thúc, trạng thái
- **Banner hoàn tiền**: Nếu đơn hàng đã được hoàn tiền, hiển thị số tiền đã hoàn
- **Nút hoàn tiền**: Cho đơn hàng bị hủy (chưa hoàn tiền)
- **Nút xem lý do hủy**: Cho đơn hàng bị hủy
- **Nút xem lý do hoàn tiền**: Cho đơn hàng đã hoàn tiền

### Q2.5: Quy trình hoàn tiền cho đơn hàng bị hủy như thế nào?
**Trả lời:**
1. Admin click nút "Hoàn tiền" trên đơn hàng có status CANCELED
2. Popup hiển thị form nhập:
   - Số tiền hoàn (tùy chọn, để trống = hoàn toàn bộ)
   - Lý do hoàn tiền (tùy chọn)
3. Hệ thống validate:
   - Số tiền không được vượt quá tổng số tiền đã trả
   - Tự động điều chỉnh nếu nhập vượt quá
4. Gọi API: `POST /api/payment/refund/{orderId}?amount={amount}`
5. Hiển thị thông báo thành công/thất bại
6. Reload trang để cập nhật trạng thái

### Q2.6: Làm thế nào để xem lý do hủy đơn hàng?
**Trả lời:**
- Click nút "Xem lý do hủy" trên đơn hàng bị hủy
- Hệ thống tìm trong Notifications:
  - Tìm notification có message chứa `#orderId` và từ khóa "đã bị hủy" hoặc "đã hủy"
  - Parse lý do từ message (format: "Lý do: ...")
- Fallback: Lấy từ order object (cancellationReason, cancelReason, reason)
- Hiển thị trong modal popup

### Q2.7: Các trạng thái đơn hàng được hiển thị như thế nào?
**Trả lời:**
- **Mapping tiếng Việt**:
  - PENDING → "Chờ xác nhận"
  - CONFIRMED → "Đã xác nhận"
  - RENTED/RENTAL → "Đang thuê"
  - COMPLETED → "Hoàn thành"
  - CANCELLED → "Đã hủy"
  - PAYMENT_FAILED → "Thanh toán thất bại"
  - REFUNDED → "Đã hoàn tiền"
- **Màu sắc**:
  - Success (xanh): COMPLETED, CONFIRMED, RENTED, RENTAL, ACTIVE
  - Warning (vàng/cam): PAYMENT_FAILED, REFUNDED, CANCELLED, FAILED

### Q2.8: Các loại dịch vụ được hiển thị như thế nào?
**Trả lời:**
- **Mapping tiếng Việt**:
  - DEPOSIT → "Đặt cọc"
  - PICKUP → "Nhận xe"
  - RETURN → "Trả xe"
  - SERVICE → "Dịch vụ"
  - FULL_PAYMENT → "Thanh toán toàn bộ"
  - PARTIAL_PAYMENT → "Thanh toán một phần"
  - RENTAL → "Thuê xe"
  - Và các loại khác...

---

## 3. DASHBOARD VÀ THỐNG KÊ

### Q3.1: Dashboard hiển thị những thông tin gì?
**Trả lời:**
- **Tổng quan hệ thống**:
  - Tổng doanh thu
  - Tổng số xe
  - Tổng số đơn hàng
  - Tỷ lệ sử dụng xe
- **Tỷ lệ sử dụng dịch vụ**:
  - Tổng dịch vụ
  - Dịch vụ thành công
  - Chi phí dịch vụ
  - Dịch vụ theo loại
- **Chi tiết dịch vụ gần đây**: Bảng hiển thị các dịch vụ mới nhất
- **Tỷ lệ sử dụng xe**: Theo từng trạm với progress bar

### Q3.2: Dữ liệu dashboard được lấy từ đâu?
**Trả lời:**
- API: `GET /api/admin/dashboard-stats`
- Response chứa:
  - `summary`: Tổng quan (revenue, totalVehicles, totalOrders, usageRate)
  - `serviceKpi`: KPIs dịch vụ (totalServices, servicesByStatus, servicesByType, totalCost)
  - `recentServices`: Danh sách dịch vụ gần đây
  - `stations`: Danh sách trạm với thông tin utilization

### Q3.3: Làm thế nào tính tỷ lệ sử dụng xe?
**Trả lời:**
- Công thức: `(Số xe đang được thuê / Tổng số xe) * 100%`
- Hiển thị theo từng trạm
- Progress bar với màu sắc:
  - Xanh (high): ≥ 80%
  - Vàng (medium): 40% - 79%
  - Đỏ (low): < 40%

---

## 4. QUẢN LÝ KHÁCH HÀNG

### Q4.1: Trang quản lý khách hàng hiển thị gì?
**Trả lời:**
- Danh sách tất cả người dùng trong hệ thống
- Thông tin: Tên, Email, SĐT, Vai trò (Admin/Staff/Customer), Trạng thái (Active/Inactive)
- Tìm kiếm theo tên, email, SĐT
- Badge màu sắc phân biệt vai trò và trạng thái

### Q4.2: Làm thế nào lấy danh sách khách hàng?
**Trả lời:**
- API: `GET /api/users/all` (hoặc tương đương)
- Service: `userService.getAllUsers()`
- Hiển thị loading state khi đang fetch
- Xử lý lỗi nếu API call thất bại

---

## 5. QUẢN LÝ TRẠM VÀ XE

### Q5.1: Admin có thể quản lý trạm như thế nào?
**Trả lời:**
- Xem danh sách tất cả trạm
- Thêm trạm mới (tên, địa chỉ: city, district, ward, street)
- Sửa thông tin trạm
- Xóa trạm
- Xem danh sách xe tại mỗi trạm
- Thêm/sửa/xóa xe tại trạm

### Q5.2: Quản lý xe tại trạm có những chức năng gì?
**Trả lời:**
- Xem danh sách xe theo trạm
- Thêm xe mới vào trạm (biển số, tên xe, màu, số ghế, variant, hình ảnh)
- Sửa thông tin xe
- Xóa xe
- Xem chi tiết xe
- Xem lịch sử thuê của xe

---

## 6. BÁO CÁO SỰ CỐ

### Q6.1: Trang báo cáo sự cố hiển thị gì?
**Trả lời:**
- Danh sách các báo cáo sự cố từ khách hàng/nhân viên
- Thông tin: Mã báo cáo, loại sự cố, mô tả, trạng thái, thời gian
- Lọc theo trạng thái (Pending, Processing, Resolved, Closed)
- Tìm kiếm theo từ khóa
- Xem chi tiết và cập nhật trạng thái sự cố

---

## 7. BẢNG GIÁ

### Q7.1: Admin có thể quản lý bảng giá như thế nào?
**Trả lời:**
- Xem danh sách bảng giá hiện tại
- Thêm/sửa/xóa bảng giá
- Quản lý giá theo:
  - Loại xe (4 chỗ, 7 chỗ)
  - Variant (Air, Lux, Premium)
  - Thời gian thuê (theo giờ, theo ngày, dài hạn)
- Áp dụng giá cho từng trạm hoặc toàn hệ thống

---

## 8. BẢO MẬT VÀ PHÂN QUYỀN

### Q8.1: Hệ thống đảm bảo bảo mật như thế nào?
**Trả lời:**
- **Authentication**: Sử dụng JWT token lưu trong localStorage
- **Authorization**: Kiểm tra role trước khi truy cập trang admin
- **Protected Routes**: Chỉ user có role "admin" mới truy cập được
- **Token validation**: Kiểm tra token hợp lệ trước mỗi API call
- **Logout**: Xóa token khi đăng xuất

### Q8.2: Làm thế nào phân biệt quyền Admin và Staff?
**Trả lời:**
- Kiểm tra `user.role` từ AuthContext
- Admin có thể truy cập tất cả routes `/admin/*`
- Staff chỉ có thể truy cập một số routes nhất định
- Sidebar hiển thị menu khác nhau tùy theo role

---

## 9. XỬ LÝ LỖI VÀ UX

### Q9.1: Hệ thống xử lý lỗi như thế nào?
**Trả lời:**
- **Loading states**: Hiển thị "Đang tải..." khi fetch dữ liệu
- **Error messages**: Hiển thị thông báo lỗi rõ ràng với nút "Thử lại"
- **Empty states**: Hiển thị "Không có dữ liệu" khi danh sách rỗng
- **Validation**: Validate input trước khi submit (ví dụ: số tiền hoàn không vượt quá số đã trả)
- **Try-catch**: Bọc API calls trong try-catch để bắt lỗi
- **Fallback data**: Sử dụng dữ liệu từ nhiều nguồn để đảm bảo luôn có thông tin

### Q9.2: UX được tối ưu như thế nào?
**Trả lời:**
- **Responsive design**: Tương thích nhiều kích thước màn hình
- **Search real-time**: Tìm kiếm ngay khi người dùng nhập
- **Modal popups**: Sử dụng modal cho các hành động quan trọng (hoàn tiền, xem lý do)
- **Color coding**: Màu sắc phân biệt trạng thái (xanh = thành công, vàng = cảnh báo)
- **Loading indicators**: Hiển thị trạng thái đang xử lý
- **Confirmation dialogs**: Xác nhận trước khi thực hiện hành động quan trọng

### Q9.3: Làm thế nào validate số tiền hoàn?
**Trả lời:**
1. Fetch tổng số tiền đã trả thành công từ API `/api/payment/order/{orderId}`
2. Tính tổng các payment có status = 'SUCCESS'
3. Hiển thị số tiền tối đa có thể hoàn
4. Khi user nhập:
   - Nếu vượt quá → Tự động điều chỉnh về mức tối đa
   - Hiển thị alert thông báo
5. Validate lại khi submit

---

## 10. KIẾN TRÚC VÀ CÔNG NGHỆ

### Q10.1: Công nghệ sử dụng trong phần Admin?
**Trả lời:**
- **Frontend Framework**: React (Functional Components với Hooks)
- **Routing**: React Router DOM (v6)
- **State Management**: 
  - useState, useEffect cho local state
  - Context API (AuthContext) cho global state
- **HTTP Client**: Axios với custom API service
- **Styling**: CSS modules (file .css riêng cho mỗi component)
- **Build Tool**: Vite

### Q10.2: Cấu trúc thư mục như thế nào?
**Trả lời:**
```
src/
  components/
    admin/
      AdminQuanLyDonHangPage.jsx
      AdminDashBoardPage.jsx
      ChiTietDonTrongAdmin.jsx
      CustomerManagement.jsx
      StationManagement.jsx
      AdminBangGiaPage.jsx
      IncidentReportPage.jsx
      SideBarAdmin.jsx
      ... (và các file CSS tương ứng)
  services/
    orderService.js
    adminService.js
    userService.js
    ...
  context/
    AuthContext.jsx
```

### Q10.3: Làm thế nào tổ chức API calls?
**Trả lời:**
- **Service Layer**: Tách biệt logic API vào các service files
  - `orderService.js`: Xử lý API đơn hàng
  - `adminService.js`: Xử lý API admin (dashboard, stats)
  - `userService.js`: Xử lý API user
  - `rentalStationService.js`: Xử lý API trạm
- **Base API**: File `api.js` chứa axios instance với base URL và interceptors
- **Error Handling**: Xử lý lỗi tập trung trong service layer
- **Response Normalization**: Chuẩn hóa response từ API (xử lý cả `res.data` và `res`)

### Q10.4: Làm thế nào quản lý state trong component?
**Trả lời:**
- **Local State**: Sử dụng `useState` cho dữ liệu chỉ dùng trong component
  - Ví dụ: `loading`, `error`, `orders`, `search`
- **Global State**: Sử dụng `Context API` cho dữ liệu dùng chung
  - Ví dụ: `AuthContext` cho thông tin user đã đăng nhập
- **Side Effects**: Sử dụng `useEffect` để fetch dữ liệu khi component mount
- **Dependencies**: Quản lý dependencies trong useEffect để tránh re-render không cần thiết

### Q10.5: Làm thế nào đảm bảo code dễ maintain?
**Trả lời:**
- **Component tách biệt**: Mỗi component có file riêng và CSS riêng
- **Helper functions**: Tách logic xử lý thành helper functions (ví dụ: `getStatusText`, `getServiceTypeText`)
- **Comments**: Thêm comments giải thích logic phức tạp
- **Consistent naming**: Đặt tên biến, hàm rõ ràng, nhất quán
- **Error handling**: Xử lý lỗi đầy đủ ở mọi nơi
- **Type checking**: Kiểm tra kiểu dữ liệu trước khi sử dụng (Array.isArray, nullish coalescing)

---

## 📝 CÂU HỎI MỞ RỘNG

### Q11.1: Nếu cần thêm chức năng mới, bạn sẽ làm như thế nào?
**Trả lời:**
1. Phân tích yêu cầu và thiết kế UI/UX
2. Tạo component mới trong `components/admin/`
3. Tạo service mới nếu cần API mới
4. Thêm route mới trong `App.jsx`
5. Thêm menu item trong `SideBarAdmin.jsx`
6. Test chức năng và xử lý lỗi
7. Cập nhật documentation nếu cần

### Q11.2: Làm thế nào tối ưu performance?
**Trả lời:**
- **Lazy loading**: Load component khi cần (React.lazy, Suspense)
- **Memoization**: Sử dụng `useMemo`, `useCallback` cho expensive calculations
- **Pagination**: Phân trang cho danh sách dài
- **Debounce**: Debounce search input để giảm số lần gọi API
- **Caching**: Cache dữ liệu không thay đổi thường xuyên
- **Code splitting**: Tách code theo route để giảm bundle size

### Q11.3: Làm thế nào test hệ thống?
**Trả lời:**
- **Unit tests**: Test từng function/component riêng lẻ
- **Integration tests**: Test tương tác giữa các component
- **E2E tests**: Test flow hoàn chỉnh từ đầu đến cuối
- **Manual testing**: Test thủ công các chức năng quan trọng
- **Error scenarios**: Test các trường hợp lỗi (API fail, network error, invalid input)

---

## 🎯 TIPS CHO BUỔI BẢO VỆ

1. **Chuẩn bị demo**: Chuẩn bị sẵn dữ liệu test và các scenario để demo
2. **Giải thích rõ ràng**: Giải thích từng bước khi demo, không chỉ click qua
3. **Nhấn mạnh điểm mạnh**: 
   - Xử lý lỗi tốt
   - UX thân thiện
   - Code có tổ chức
   - Bảo mật tốt
4. **Thừa nhận hạn chế**: Nếu có phần chưa hoàn thiện, thừa nhận và đề xuất hướng cải thiện
5. **Sẵn sàng trả lời**: Chuẩn bị trả lời các câu hỏi về:
   - Tại sao chọn công nghệ này?
   - Có thể mở rộng như thế nào?
   - Có vấn đề gì đã gặp và cách giải quyết?

---

**Chúc bạn bảo vệ thành công! 🎉**





