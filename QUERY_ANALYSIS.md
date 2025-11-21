# Phân tích Query SQL cho Admin Dashboard

## Frontend cần gì từ API `/admin/dashboard`:

1. **KPI Summary:**
   - `kpi.revenueInRange` - Tổng doanh thu trong kỳ
   - `kpi.totalVehicles` - Tổng số xe
   - `kpi.rentedVehicles` - Xe đang thuê

2. **Revenue Analysis by Station:**
   - `revenueByStationAnalysis[]` với:
     - `stationName`
     - `todayRevenue` - Doanh thu hôm nay
     - `weekRevenue` - Doanh thu tuần này  
     - `monthRevenue` - Doanh thu tháng này
     - `avgPerDay` - Trung bình mỗi ngày
     - `growthDay`, `growthWeek`, `growthMonth` - % tăng trưởng

3. **Peak Hours:**
   - `peakHourWindow.startHour`, `peakHourWindow.endHour`

## Query SQL hiện có:

✅ **CÓ SẴN:**
1. `revenueBetween(from, to)` - Tổng doanh thu trong khoảng thời gian
2. `revenueTodayPerStation()` - Doanh thu hôm nay theo trạm
3. `revenueThisWeekPerStation()` - Doanh thu tuần này theo trạm
4. `revenueThisMonthPerStation()` - Doanh thu tháng này theo trạm
5. `revenuePerStation(from, to)` - Doanh thu theo trạm trong khoảng
6. `countOrdersByHour(from, to)` - Đếm order theo giờ (cho peak hour)

## VẤN ĐỀ CẦN XỬ LÝ:

### 1. **Tăng trưởng (Growth) - THIẾU**
Frontend cần `growthDay`, `growthWeek`, `growthMonth` nhưng không có query tính toán.

**Cần thêm:**
- So sánh doanh thu hôm nay với hôm qua
- So sánh tuần này với tuần trước
- So sánh tháng này với tháng trước

### 2. **Trung bình mỗi ngày (avgPerDay) - THIẾU**
Frontend cần `avgPerDay` nhưng không có query tính toán.

**Cần thêm:**
- Tính trung bình doanh thu mỗi ngày trong khoảng thời gian

### 3. **Peak Hour Window - CẦN XỬ LÝ**
Query `countOrdersByHour` trả về danh sách, cần xử lý để tìm khoảng giờ có nhiều order nhất.

## KẾT LUẬN:

✅ **Các query cơ bản đã ĐÚNG:**
- Query doanh thu theo trạm đã đúng
- Query doanh thu theo thời gian đã đúng
- Logic JOIN với rentalorder_detail đã đúng
- Filter status đã đúng

❌ **Cần bổ sung:**
1. Query tính tăng trưởng (growth)
2. Query tính trung bình mỗi ngày
3. Logic xử lý peak hour window từ `countOrdersByHour`


