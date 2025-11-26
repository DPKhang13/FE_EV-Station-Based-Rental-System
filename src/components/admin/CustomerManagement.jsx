// Import React hooks và các thư viện cần thiết
// useState: Hook để quản lý state (dữ liệu thay đổi trong component)
// useEffect: Hook để thực hiện side effects (gọi API, subscribe, etc.) khi component mount hoặc khi dependencies thay đổi
// useNavigate: Hook để điều hướng programmatically
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';       
import userService from '../../services/userService';
import './CustomerManagement.css';

// Component quản lý khách hàng
// Component này hiển thị danh sách tất cả người dùng trong hệ thống
const CustomerManagement = () => {
    // useState: Khởi tạo state và hàm setter để cập nhật state
    // users: Mảng chứa danh sách người dùng từ API
    const [users, setUsers] = useState([]);
    
    // loading: Boolean để hiển thị trạng thái đang tải dữ liệu
    // true = đang tải, false = đã tải xong
    const [loading, setLoading] = useState(true);
    
    // error: String chứa thông báo lỗi nếu có
    const [error, setError] = useState('');
    
    // filterRole: String để lọc user theo vai trò ('all', 'admin', 'staff', 'customer')
    // setFilterRole: Hàm để cập nhật filterRole (hiện chưa dùng trong UI, có thể thêm dropdown sau)
    // Prefix _ để tránh linter warning về unused variable
    const [filterRole, _setFilterRole] = useState('all');
    
    // searchQuery: String chứa từ khóa tìm kiếm
    const [searchQuery, setSearchQuery] = useState('');

    // useNavigate: Hook để điều hướng đến trang khác
    const navigate = useNavigate();                   

    // useEffect: Hook chạy sau khi component được render lần đầu
    // Dependency array [] rỗng = chỉ chạy 1 lần khi component mount
    // Tương đương với componentDidMount trong class component
    useEffect(() => {
        fetchUsers();
    }, []);

    // Hàm async để fetch danh sách user từ API
    // async/await: Cú pháp để xử lý Promise một cách đồng bộ
    const fetchUsers = async () => {
        try {
            // Bắt đầu loading: Hiển thị spinner/loading indicator
            setLoading(true);
            
            // Gọi API service để lấy danh sách user
            // userService.getAllUsers() trả về Promise
            const data = await userService.getAllUsers();
            
            // Cập nhật state users với dữ liệu từ API
            setUsers(data);
            
            // Xóa error nếu có (trường hợp retry thành công)
            setError('');
        } catch (err) {
            // catch: Bắt lỗi nếu API call thất bại
            console.error('Error fetching users:', err);
            
            // Hiển thị thông báo lỗi cho user
            setError('Không thể tải danh sách người dùng. Vui lòng thử lại.');
        } finally {
            // finally: Luôn chạy dù có lỗi hay không
            // Tắt loading indicator
            setLoading(false);
        }
    };

    // Hàm filter: Lọc danh sách user dựa trên filterRole và searchQuery
    // Array.filter(): Tạo mảng mới chỉ chứa các phần tử thỏa mãn điều kiện
    const filteredUsers = users.filter(user => {
        // Kiểm tra role: Nếu filterRole là 'all' thì lấy tất cả, ngược lại so sánh với user.role
        // Toán tử || (OR): Trả về true nếu một trong hai điều kiện đúng
        const matchRole = filterRole === 'all' || user.role === filterRole;
        
        // Kiểm tra search: Nếu không có searchQuery thì lấy tất cả
        // Nếu có searchQuery thì tìm trong fullName, email, phone
        // toLowerCase(): Chuyển về chữ thường để tìm kiếm không phân biệt hoa thường
        // includes(): Kiểm tra chuỗi có chứa substring không
        const matchSearch = !searchQuery ||
            user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.phone.includes(searchQuery);

        // Chỉ trả về user nếu cả hai điều kiện đều đúng
        // Toán tử && (AND): Trả về true nếu cả hai điều kiện đều true
        return matchRole && matchSearch;
    });

    // Helper function: Trả về CSS class cho badge role
    // Switch case: Cấu trúc điều kiện nhiều nhánh, rõ ràng hơn if-else chain
    // Mỗi case trả về một CSS class khác nhau để style badge
    const getRoleBadgeClass = (role) => {
        switch (role) {
            case 'admin': return 'role-admin';
            case 'staff': return 'role-staff';
            case 'customer': return 'role-customer';
            default: return ''; // Trường hợp không khớp
        }
    };

    // Helper function: Trả về CSS class cho badge status
    // ACTIVE và VERIFIED đều dùng class 'status-active' (màu xanh)
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'ACTIVE': return 'status-active';
            case 'VERIFIED': return 'status-active';
            case 'BANNED': return 'status-inactive'; // Màu đỏ
            default: return '';
        }
    };

    // Helper function: Chuyển đổi role code sang text tiếng Việt
    // Để hiển thị user-friendly text thay vì code
    const getRoleText = (role) => {
        switch (role) {
            case 'admin': return 'Quản trị viên';
            case 'staff': return 'Nhân viên';
            case 'customer': return 'Khách hàng';
            default: return role; // Nếu không khớp thì trả về nguyên giá trị
        }
    };

    // Helper function: Chuyển đổi status code sang text tiếng Việt
    const getStatusText = (status) => {
        switch (status) {
            case 'ACTIVE': return 'Hoạt động';
            case 'VERIFIED': return 'Đã xác thực';
            case 'BANNED': return 'Bị cấm';
            default: return status;
        }
    };

    // Hàm xử lý tìm kiếm
    // Lưu ý: Logic tìm kiếm thực tế được thực hiện trong filteredUsers
    // Hàm này có thể dùng để trigger search khi nhấn Enter hoặc click button
    const handleSearch = () => {
        // Logic tìm kiếm đã được áp dụng trong filteredUsers thông qua searchQuery
        // filteredUsers tự động re-render khi searchQuery thay đổi
    };

    // Hàm xử lý khi click "Xem chi tiết"
    // Nhận user object làm parameter
    const handleViewDetail = (user) => {
        // Lấy ID của user, có thể là userId hoặc id (tùy API trả về)
        // Toán tử || (OR) để fallback nếu một trong hai không có
        const id = user.userId || user.id;
        
        // Validation: Kiểm tra có ID không
        // Early return: Nếu không có ID thì dừng lại, không làm gì
        if (!id) {
            console.warn("Không có ID user để điều hướng");
            return;
        }
        
        // Điều hướng đến trang chi tiết user
        // Template literal (backtick): Cho phép chèn biến vào chuỗi
        // ${id} sẽ được thay thế bằng giá trị thực của id
        navigate(`/admin/chitiet/${id}`);
    };

    // Conditional rendering: Nếu đang loading thì hiển thị loading message
    // Early return: Dừng render phần còn lại, chỉ hiển thị loading
    if (loading) {
        return <div className="customer-loading">Đang tải danh sách người dùng...</div>;
    }

    // JSX return: Cấu trúc HTML của component
    return (
        <div className="customer-management">
            {/* Header section: Tiêu đề trang */}
            <div className="customer-header">
                <div>
                    <h1>QUẢN LÝ KHÁCH HÀNG</h1>
                    <p className="customer-subtitle">Danh sách tất cả người dùng trong hệ thống</p>
                </div>
            </div>

            {/* Conditional rendering: Chỉ hiển thị error message nếu có lỗi */}
            {/* {error && ...}: Nếu error truthy (có giá trị) thì render div error */}
            {/* Đây là pattern phổ biến để hiển thị error conditionally */}
            {error && (
                <div className="error-message">
                    <div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                            Lỗi tải dữ liệu
                        </div>
                        <div style={{ fontSize: '14px', color: '#666' }}>
                            {/* Hiển thị nội dung error từ state */}
                            {error}
                        </div>
                    </div>
                    {/* Button retry: Khi click sẽ gọi lại fetchUsers để thử tải lại */}
                    <button onClick={fetchUsers}>
                        Thử lại
                    </button>
                </div>
            )}

            {/* Search section: Ô tìm kiếm */}
            <div className="customer-search-section">
                {/* Input controlled component: value được bind với state searchQuery */}
                {/* onChange: Mỗi khi user gõ, cập nhật searchQuery state */}
                {/* onKeyPress: Khi nhấn Enter, trigger handleSearch */}
                <input
                    type="text"
                    className="customer-search-input"
                    placeholder="Tìm kiếm theo tên, email, SĐT..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button className="btn-search" onClick={handleSearch}>
                    TÌM KIẾM
                </button>
            </div>

            {/* Table container: Bảng hiển thị danh sách user */}
            <div className="customer-table-container">
                <table className="customer-table">
                    {/* Table header: Tiêu đề các cột */}
                    <thead>
                        <tr>
                            <th>Họ tên</th>
                            <th>Email</th>
                            <th>Số điện thoại</th>
                            <th>Vai trò</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    {/* Table body: Dữ liệu các dòng */}
                    <tbody>
                        {/* Conditional rendering: Nếu không có user nào thì hiển thị message */}
                        {/* Ternary operator: condition ? trueCase : falseCase */}
                        {filteredUsers.length === 0 ? (
                            <tr>
                                {/* colSpan: Merge nhiều cột thành một */}
                                <td colSpan="6" className="no-data">
                                    Không tìm thấy người dùng nào
                                </td>
                            </tr>
                        ) : (
                            // Array.map(): Duyệt qua mảng và render mỗi phần tử thành một row
                            // key prop: Bắt buộc trong React để optimize re-render
                            // user.userId || index: Dùng userId nếu có, không thì dùng index
                            filteredUsers.map((user, index) => (
                                <tr key={user.userId || index}>
                                    <td className="user-name">{user.fullName}</td>
                                    <td className="email-text">{user.email}</td>
                                    <td>{user.phone}</td>
                                    <td>
                                        {/* Template literal: Chèn CSS class động */}
                                        {/* getRoleBadgeClass() trả về class để style badge */}
                                        <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                                            {/* getRoleText() trả về text tiếng Việt */}
                                            {getRoleText(user.role)}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${getStatusBadgeClass(user.status)}`}>
                                            {getStatusText(user.status)}
                                        </span>
                                    </td>
                                    <td>
                                        {/* Button với onClick handler */}
                                        {/* Arrow function: () => handleViewDetail(user) */}
                                        {/* Truyền user object vào hàm để xử lý */}
                                        <button
                                            className="btn-view-customer"
                                            onClick={() => handleViewDetail(user)}
                                        >
                                            Xem chi tiết
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CustomerManagement;
