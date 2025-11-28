# CÂU HỎI VỀ CODE FRONTEND ADMIN

## 📋 MỤC LỤC
1. [React Hooks và State Management](#1-react-hooks-và-state-management)
2. [API Integration và Data Fetching](#2-api-integration-và-data-fetching)
3. [Component Structure và Organization](#3-component-structure-và-organization)
4. [Error Handling và Validation](#4-error-handling-và-validation)
5. [Routing và Navigation](#5-routing-và-navigation)
6. [Styling và UI/UX](#6-styling-và-uiux)
7. [Performance Optimization](#7-performance-optimization)
8. [Code Quality và Best Practices](#8-code-quality-và-best-practices)

---

## 1. REACT HOOKS VÀ STATE MANAGEMENT

### Q1.1: Tại sao sử dụng `useState` thay vì class component state?
**Trả lời:**
- **Functional components** nhẹ hơn, dễ test hơn
- **Hooks** cho phép tái sử dụng logic giữa các components
- **Code ngắn gọn hơn**, không cần `this` binding
- **React team khuyến nghị** sử dụng functional components + hooks

**Ví dụ trong code:**
```javascript
const [orders, setOrders] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
```

### Q1.2: Khi nào sử dụng `useEffect` và dependency array?
**Trả lời:**
- **`useEffect(() => {}, [])`**: Chạy 1 lần khi component mount (tương đương `componentDidMount`)
- **`useEffect(() => {}, [dependency])`**: Chạy lại khi `dependency` thay đổi
- **Không có dependency array**: Chạy sau mỗi lần render (tránh dùng)

**Ví dụ trong code:**
```javascript
useEffect(() => {
  fetchOrders();
  fetchStations();
}, []); // Chỉ chạy 1 lần khi mount
```

### Q1.3: Tại sao không gọi async function trực tiếp trong `useEffect`?
**Trả lời:**
- `useEffect` không thể nhận async function trực tiếp
- Phải tạo async function bên trong và gọi nó

**Ví dụ trong code:**
```javascript
useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await orderService.getAll();
      setOrders(res.data);
    } catch (err) {
      setError(err.message);
    }
  };
  fetchData();
}, []);
```

### Q1.4: Khi nào nên sử dụng `useCallback` và `useMemo`?
**Trả lời:**
- **`useCallback`**: Memoize function để tránh re-create khi re-render
  - Dùng khi pass function làm prop cho child component
  - Dùng khi function là dependency của `useEffect`
- **`useMemo`**: Memoize computed value để tránh tính toán lại
  - Dùng cho expensive calculations
  - Dùng khi value là dependency của `useEffect`

**Ví dụ:**
```javascript
const filteredOrders = useMemo(() => {
  return orders.filter(order => {
    // expensive filtering logic
  });
}, [orders, search]);
```

### Q1.5: Làm thế nào quản lý nhiều state liên quan?
**Trả lời:**
- **Option 1**: Nhiều `useState` riêng biệt (đơn giản, dễ hiểu)
- **Option 2**: Một `useState` với object (khi state liên quan chặt chẽ)
- **Option 3**: `useReducer` (khi logic phức tạp, nhiều actions)

**Ví dụ trong code:**
```javascript
// Option 1: Nhiều useState
const [orders, setOrders] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

// Option 2: useState với object
const [refundForm, setRefundForm] = useState({
  amount: '',
  reason: ''
});
```

---

## 2. API INTEGRATION VÀ DATA FETCHING

### Q2.1: Tại sao tách API calls vào service layer?
**Trả lời:**
- **Separation of concerns**: Tách biệt logic API khỏi component
- **Reusability**: Có thể dùng lại ở nhiều component
- **Testability**: Dễ test API logic riêng biệt
- **Maintainability**: Dễ maintain và update API endpoints

**Ví dụ trong code:**
```javascript
// Service layer
export const orderService = {
  getAll: () => api.get('/order/getAll'),
  getPendingOrders: () => api.get('/order/pending-verification'),
};

// Component
const res = await orderService.getAll();
```

### Q2.2: Làm thế nào xử lý response từ API có cấu trúc khác nhau?
**Trả lời:**
- **Normalize response**: Chuẩn hóa response về một format
- **Nullish coalescing**: Dùng `??` hoặc `||` để fallback
- **Type checking**: Kiểm tra kiểu dữ liệu trước khi dùng

**Ví dụ trong code:**
```javascript
const allOrders = Array.isArray(allOrdersRes?.data) 
  ? allOrdersRes.data 
  : Array.isArray(allOrdersRes) 
    ? allOrdersRes 
    : [];

// Hoặc
const data = res.data || res;
```

### Q2.3: Tại sao merge dữ liệu từ 2 API trong `AdminQuanLyDonHangPage`?
**Trả lời:**
- `getPendingOrders()` có sẵn `customerName` và `phone` ở top level
- `getAll()` có đầy đủ thông tin nhưng `customer` là nested object
- Merge để đảm bảo có đầy đủ thông tin từ cả 2 nguồn
- Tránh thiếu dữ liệu nếu một API không trả về đầy đủ

**Ví dụ trong code:**
```javascript
// Bước 1: Lấy pending orders (có customerName sẵn)
const pendingRes = await orderService.getPendingOrders();

// Bước 2: Lấy tất cả orders (cần map từ customer)
const allRes = await orderService.getAll();

// Bước 3: Merge vào Map để tránh duplicate
const orderMap = new Map();
pendingData.forEach(order => {
  orderMap.set(String(order.orderId), order);
});
allOrders.forEach(order => {
  if (!orderMap.has(orderId)) {
    // Map từ customer object
    const customerName = order.customer?.fullName || 'N/A';
    orderMap.set(orderId, { ...order, customerName });
  }
});
```

### Q2.4: Làm thế nào xử lý loading và error states?
**Trả lời:**
- **Loading state**: Set `loading = true` trước khi fetch, `false` sau khi xong
- **Error state**: Catch error và set error message
- **Finally block**: Luôn set `loading = false` dù có lỗi hay không

**Ví dụ trong code:**
```javascript
const fetchOrders = async () => {
  try {
    setLoading(true);
    setError(null);
    const res = await orderService.getAll();
    setOrders(res.data);
  } catch (err) {
    setError(err.message || 'Có lỗi xảy ra');
    setOrders([]);
  } finally {
    setLoading(false);
  }
};
```

### Q2.5: Tại sao sử dụng `Map` để merge orders?
**Trả lời:**
- **O(1) lookup**: Tìm kiếm nhanh hơn array
- **Tránh duplicate**: Key là `orderId`, tự động loại bỏ duplicate
- **Dễ merge**: Có thể update hoặc thêm mới dễ dàng

**Ví dụ:**
```javascript
const orderMap = new Map();
orderMap.set(orderId, order); // Thêm hoặc update
const orders = Array.from(orderMap.values()); // Chuyển về array
```

---

## 3. COMPONENT STRUCTURE VÀ ORGANIZATION

### Q3.1: Tại sao tách helper functions ra ngoài component?
**Trả lời:**
- **Reusability**: Có thể dùng lại ở nhiều component
- **Testability**: Dễ test function riêng biệt
- **Performance**: Không bị re-create mỗi lần component re-render
- **Readability**: Code dễ đọc hơn

**Ví dụ trong code:**
```javascript
// Helper function bên ngoài component
const getStatusText = (status) => {
  const statusMap = {
    'PENDING': 'Chờ xác nhận',
    'COMPLETED': 'Hoàn thành',
    // ...
  };
  return statusMap[status.toUpperCase()] || status;
};

// Sử dụng trong component
<span>{getStatusText(order.status)}</span>
```

### Q3.2: Tại sao sử dụng early return pattern?
**Trả lời:**
- **Giảm nesting**: Code phẳng hơn, dễ đọc
- **Guard clauses**: Xử lý edge cases sớm
- **Performance**: Tránh render không cần thiết

**Ví dụ trong code:**
```javascript
if (loading) {
  return <div>Đang tải...</div>;
}

if (!data) {
  return <div>Không có dữ liệu</div>;
}

// Main render logic
return <div>...</div>;
```

### Q3.3: Làm thế nào tổ chức conditional rendering?
**Trả lời:**
- **Ternary operator**: Cho 2 trường hợp đơn giản
- **Logical AND**: Cho conditional rendering một phần
- **Early return**: Cho các trường hợp phức tạp

**Ví dụ trong code:**
```javascript
// Ternary
{loading ? <Spinner /> : <Content />}

// Logical AND
{error && <ErrorMessage error={error} />}

// Conditional trong JSX
{isRefunded && (
  <div className="refund-banner">
    Đã hoàn tiền
  </div>
)}
```

### Q3.4: Tại sao tách CSS ra file riêng?
**Trả lời:**
- **Separation of concerns**: Tách style khỏi logic
- **Reusability**: Có thể import ở nhiều component
- **Maintainability**: Dễ maintain và update
- **Performance**: CSS có thể được cache riêng

**Ví dụ:**
```javascript
import './AdminQuanLyDonHangPage.css';
```

---

## 4. ERROR HANDLING VÀ VALIDATION

### Q4.1: Làm thế nào validate input trong form hoàn tiền?
**Trả lời:**
- **Client-side validation**: Validate trước khi submit
- **Real-time validation**: Validate khi user nhập
- **Server-side validation**: Validate trên server (backup)

**Ví dụ trong code:**
```javascript
const handleRefundAmountChange = (e) => {
  let amount = parseFloat(e.target.value);
  
  // Validate: Không vượt quá số tiền tối đa
  if (maxRefundAmount && amount > maxRefundAmount) {
    amount = maxRefundAmount;
    alert(`Số tiền tối đa: ${maxRefundAmount.toLocaleString()} VNĐ`);
  }
  
  setRefundForm({ ...refundForm, amount: amount.toString() });
};
```

### Q4.2: Làm thế nào xử lý lỗi từ API?
**Trả lời:**
- **Try-catch**: Bọc API call trong try-catch
- **Error message**: Hiển thị message rõ ràng cho user
- **Fallback**: Có dữ liệu fallback nếu API fail
- **Retry mechanism**: Cho phép user thử lại

**Ví dụ trong code:**
```javascript
try {
  const res = await api.post(`/payment/refund/${orderId}`);
  alert('✅ Hoàn tiền thành công!');
} catch (err) {
  const errorMsg = err?.response?.data?.message || 
                   err?.message || 
                   'Không thể hoàn tiền. Vui lòng thử lại sau.';
  alert(`Lỗi: ${errorMsg}`);
}
```

### Q4.3: Tại sao sử dụng optional chaining (`?.`) và nullish coalescing (`??`)?
**Trả lời:**
- **Optional chaining**: Tránh lỗi khi truy cập property của `null`/`undefined`
- **Nullish coalescing**: Chỉ fallback khi `null` hoặc `undefined` (không phải `0`, `''`, `false`)

**Ví dụ trong code:**
```javascript
// Optional chaining
const customerName = order.customer?.fullName || 'N/A';

// Nullish coalescing
const data = res.data ?? res;

// Kết hợp
const amount = refundData?.refundedAmount ?? 0;
```

### Q4.4: Làm thế nào xử lý edge cases (null, undefined, empty array)?
**Trả lời:**
- **Type checking**: Kiểm tra kiểu dữ liệu trước khi dùng
- **Default values**: Cung cấp giá trị mặc định
- **Guard clauses**: Xử lý edge cases sớm

**Ví dụ trong code:**
```javascript
// Kiểm tra array
const orders = Array.isArray(data) ? data : [];

// Kiểm tra null/undefined
const name = order.customerName || 'N/A';

// Kiểm tra empty
{details.length === 0 ? (
  <div>Không có dữ liệu</div>
) : (
  <table>...</table>
)}
```

---

## 5. ROUTING VÀ NAVIGATION

### Q5.1: Tại sao sử dụng `useNavigate` thay vì `Link`?
**Trả lời:**
- **Programmatic navigation**: Điều hướng bằng code (sau khi xử lý logic)
- **Conditional navigation**: Điều hướng dựa trên điều kiện
- **Dynamic routes**: Tạo route động với params

**Ví dụ trong code:**
```javascript
const navigate = useNavigate();

const handleViewOrderDetail = (orderId) => {
  navigate(`/admin/order-detail/${orderId}`);
};
```

### Q5.2: Làm thế nào lấy params từ URL?
**Trả lời:**
- Sử dụng `useParams` hook từ `react-router-dom`

**Ví dụ trong code:**
```javascript
import { useParams } from 'react-router-dom';

const { orderId } = useParams();
// orderId sẽ là giá trị từ URL: /admin/order-detail/123
```

### Q5.3: Tại sao sử dụng `NavLink` thay vì `Link`?
**Trả lời:**
- **Active state**: Tự động thêm class `active` khi route match
- **Styling**: Dễ style link đang active

**Ví dụ trong code:**
```javascript
<NavLink to="/admin/quanlydonhang" className="sidebar__btn">
  Quản lý đơn hàng
</NavLink>
```

---

## 6. STYLING VÀ UI/UX

### Q6.1: Tại sao sử dụng CSS modules thay vì inline styles?
**Trả lời:**
- **Scoped styles**: Tránh conflict giữa các component
- **Maintainability**: Dễ maintain và update
- **Performance**: CSS được cache riêng
- **Reusability**: Có thể tái sử dụng styles

**Ví dụ:**
```javascript
import './AdminQuanLyDonHangPage.css';

<div className="verify-container">
  <h1 className="verify-title">QUẢN LÝ ĐƠN HÀNG</h1>
</div>
```

### Q6.2: Làm thế nào tạo responsive design?
**Trả lời:**
- **Media queries**: Sử dụng `@media` trong CSS
- **Flexbox/Grid**: Layout linh hoạt
- **Relative units**: Sử dụng `%`, `rem`, `em` thay vì `px` cố định

**Ví dụ:**
```css
@media (max-width: 768px) {
  .verify-table {
    font-size: 12px;
  }
}
```

### Q6.3: Tại sao sử dụng color coding cho status?
**Trả lời:**
- **Visual feedback**: User nhận biết trạng thái nhanh chóng
- **UX tốt hơn**: Không cần đọc text, chỉ cần nhìn màu
- **Consistency**: Màu sắc nhất quán trong toàn hệ thống

**Ví dụ trong code:**
```javascript
const getStatusClass = (status) => {
  if (['COMPLETED', 'CONFIRMED'].includes(status)) {
    return 'success'; // Màu xanh
  }
  if (['CANCELLED', 'FAILED'].includes(status)) {
    return 'warning'; // Màu vàng/cam
  }
};
```

---

## 7. PERFORMANCE OPTIMIZATION

### Q7.1: Làm thế nào tránh re-render không cần thiết?
**Trả lời:**
- **React.memo**: Memoize component để tránh re-render khi props không đổi
- **useMemo**: Memoize computed values
- **useCallback**: Memoize functions
- **Key prop**: Sử dụng key ổn định trong list

**Ví dụ:**
```javascript
const FilteredOrders = React.memo(({ orders, search }) => {
  const filtered = useMemo(() => {
    return orders.filter(order => 
      order.customerName.toLowerCase().includes(search.toLowerCase())
    );
  }, [orders, search]);
  
  return <div>{filtered.map(...)}</div>;
});
```

### Q7.2: Tại sao sử dụng `key` prop trong list?
**Trả lời:**
- **React reconciliation**: Giúp React xác định item nào thay đổi
- **Performance**: Tránh re-render toàn bộ list
- **State preservation**: Giữ state của item khi list thay đổi

**Ví dụ trong code:**
```javascript
{orders.map((order) => (
  <tr key={order.orderId}>
    {/* orderId là unique, ổn định */}
  </tr>
))}
```

### Q7.3: Làm thế nào optimize API calls?
**Trả lời:**
- **Debounce**: Debounce search input để giảm số lần gọi API
- **Caching**: Cache dữ liệu không thay đổi thường xuyên
- **Pagination**: Phân trang để giảm lượng dữ liệu fetch
- **Lazy loading**: Load dữ liệu khi cần

**Ví dụ:**
```javascript
// Debounce search
const debouncedSearch = useMemo(
  () => debounce((value) => {
    fetchOrders(value);
  }, 300),
  []
);
```

---

## 8. CODE QUALITY VÀ BEST PRACTICES

### Q8.1: Tại sao sử dụng destructuring?
**Trả lời:**
- **Readability**: Code dễ đọc hơn
- **Less code**: Ít code hơn
- **Avoid repetition**: Tránh lặp lại `order.`, `res.`

**Ví dụ trong code:**
```javascript
// Thay vì
const orderId = order.orderId;
const customerName = order.customerName;

// Dùng destructuring
const { orderId, customerName } = order;
```

### Q8.2: Tại sao sử dụng template literals?
**Trả lời:**
- **Readability**: Dễ đọc hơn string concatenation
- **Multi-line**: Hỗ trợ multi-line strings
- **Interpolation**: Dễ chèn biến vào string

**Ví dụ trong code:**
```javascript
// Thay vì
const url = '/api/order/' + orderId;

// Dùng template literal
const url = `/api/order/${orderId}`;
```

### Q8.3: Tại sao sử dụng arrow functions?
**Trả lời:**
- **Shorter syntax**: Cú pháp ngắn gọn hơn
- **Lexical `this`**: `this` được bind tự động
- **Consistency**: Nhất quán với functional programming style

**Ví dụ:**
```javascript
// Arrow function
const handleClick = () => {
  console.log('clicked');
};

// Regular function
function handleClick() {
  console.log('clicked');
}
```

### Q8.4: Làm thế nào đảm bảo code dễ maintain?
**Trả lời:**
- **Naming conventions**: Đặt tên rõ ràng, nhất quán
- **Comments**: Comment cho logic phức tạp
- **DRY principle**: Don't Repeat Yourself
- **Single Responsibility**: Mỗi function làm một việc
- **Consistent formatting**: Format code nhất quán

**Ví dụ trong code:**
```javascript
// Helper function có tên rõ ràng
const getStatusText = (status) => {
  // Mapping rõ ràng
  const statusMap = {
    'PENDING': 'Chờ xác nhận',
    // ...
  };
  return statusMap[status.toUpperCase()] || status;
};
```

### Q8.5: Tại sao sử dụng constants cho magic numbers/strings?
**Trả lời:**
- **Maintainability**: Dễ thay đổi giá trị ở một nơi
- **Readability**: Code dễ hiểu hơn
- **Avoid typos**: Tránh lỗi đánh máy

**Ví dụ:**
```javascript
// Thay vì
if (status === 'COMPLETED') { ... }

// Dùng constant
const STATUS = {
  COMPLETED: 'COMPLETED',
  PENDING: 'PENDING',
};
if (status === STATUS.COMPLETED) { ... }
```

---

## 📝 CÂU HỎI KỸ THUẬT CHUYÊN SÂU

### Q9.1: Tại sao sử dụng `Map` thay vì `Object` để merge orders?
**Trả lời:**
- **Performance**: O(1) lookup vs O(n) với array
- **Key types**: Map có thể dùng bất kỳ type nào làm key
- **Size property**: Có `size` property sẵn
- **Iteration**: Dễ iterate với `forEach`, `for...of`

**Ví dụ:**
```javascript
const orderMap = new Map();
orderMap.set(orderId, order);
orderMap.has(orderId); // O(1)
orderMap.size; // Số lượng items
```

### Q9.2: Làm thế nào parse lý do hủy từ notification message?
**Trả lời:**
- Sử dụng **regex** để tìm pattern trong message
- Fallback về toàn bộ message nếu không parse được

**Ví dụ trong code:**
```javascript
const parseReasonFromNotification = (message, orderId) => {
  // Tìm pattern: "Lý do: ..."
  const reasonMatch = message.match(/[Ll]ý do[:\s]+(.+?)(?:\.|$)/i);
  if (reasonMatch && reasonMatch[1]) {
    return reasonMatch[1].trim();
  }
  return message; // Fallback
};
```

### Q9.3: Tại sao validate số tiền hoàn ở cả client và server?
**Trả lời:**
- **Client-side**: UX tốt hơn, feedback ngay lập tức
- **Server-side**: Bảo mật, không thể bypass
- **Defense in depth**: Nhiều lớp bảo vệ

**Ví dụ:**
```javascript
// Client-side validation
if (amount > maxRefundAmount) {
  amount = maxRefundAmount;
  alert('Số tiền tối đa: ...');
}

// Server sẽ validate lại khi nhận request
```

### Q9.4: Làm thế nào xử lý async operations trong useEffect?
**Trả lời:**
- Tạo async function bên trong `useEffect`
- Cleanup function nếu cần cancel request
- Dependency array để control khi nào chạy lại

**Ví dụ:**
```javascript
useEffect(() => {
  let cancelled = false;
  
  const fetchData = async () => {
    const res = await api.get('/data');
    if (!cancelled) {
      setData(res.data);
    }
  };
  
  fetchData();
  
  return () => {
    cancelled = true; // Cleanup
  };
}, []);
```

### Q9.5: Tại sao sử dụng `Array.isArray()` để check?
**Trả lời:**
- **Type safety**: Đảm bảo là array trước khi dùng array methods
- **API inconsistency**: API có thể trả về object hoặc array
- **Avoid errors**: Tránh lỗi `map is not a function`

**Ví dụ trong code:**
```javascript
const orders = Array.isArray(res?.data) 
  ? res.data 
  : Array.isArray(res) 
    ? res 
    : [];
```

---

## 🎯 TIPS CHO BUỔI BẢO VỆ CODE

1. **Hiểu rõ code của mình**: Đọc lại code trước khi bảo vệ
2. **Giải thích design decisions**: Tại sao làm như vậy?
3. **Nhấn mạnh best practices**: DRY, SOLID, separation of concerns
4. **Sẵn sàng refactor**: Nếu hỏi cách cải thiện, đề xuất refactor
5. **Performance awareness**: Hiểu về performance implications
6. **Error handling**: Nhấn mạnh xử lý lỗi đầy đủ
7. **Code organization**: Giải thích cấu trúc thư mục và tổ chức code

---

**Chúc bạn bảo vệ thành công! 🚀**





