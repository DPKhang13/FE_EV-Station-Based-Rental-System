import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';        // 👈 thêm
import userService from '../../services/userService';
import './CustomerManagement.css';

const CustomerManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const navigate = useNavigate();                   // 👈 thêm

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await userService.getAllUsers();
            setUsers(data);
            setError('');
        } catch (err) {
            console.error('❌ Error fetching users:', err);
            setError('Không thể tải danh sách người dùng. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchRole = filterRole === 'all' || user.role === filterRole;
        const matchSearch = !searchQuery ||
            user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.phone.includes(searchQuery);

        return matchRole && matchSearch;
    });

    const getRoleBadgeClass = (role) => {
        switch (role) {
            case 'admin': return 'role-admin';
            case 'staff': return 'role-staff';
            case 'customer': return 'role-customer';
            default: return '';
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'ACTIVE': return 'status-active';
            case 'VERIFIED': return 'status-active';
            case 'BANNED': return 'status-inactive';
            default: return '';
        }
    };

    const getRoleText = (role) => {
        switch (role) {
            case 'admin': return 'Quản trị viên';
            case 'staff': return 'Nhân viên';
            case 'customer': return 'Khách hàng';
            default: return role;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'ACTIVE': return 'Hoạt động';
            case 'VERIFIED': return 'Đã xác thực';
            case 'BANNED': return 'Bị cấm';
            default: return status;
        }
    };

    // 🔍 Xử lý tìm kiếm
    const handleSearch = () => {
        // Logic tìm kiếm đã được áp dụng trong filteredUsers thông qua searchQuery
    };

    // 👇 hàm xem chi tiết
    const handleViewDetail = (user) => {
        const id = user.userId || user.id;
        if (!id) {
            console.warn("Không có ID user để điều hướng");
            return;
        }
        // tuỳ cấu trúc route của bạn – sửa path nếu cần
        navigate(`/admin/chitiet/${id}`);
        // hoặc nếu chưa có route thì tạm:
        // alert(`Xem chi tiết khách hàng: ${user.fullName}`);
    };

    if (loading) {
        return <div className="customer-loading">⏳ Đang tải danh sách người dùng...</div>;
    }

    return (
        <div className="customer-management">
            <div className="customer-header">
                <div>
                    <h1>QUẢN LÝ KHÁCH HÀNG</h1>
                    <p className="customer-subtitle">Danh sách tất cả người dùng trong hệ thống</p>
                </div>
            </div>

            {error && (
                <div className="error-message">
                    <div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                            ⚠️ Lỗi tải dữ liệu
                        </div>
                        <div style={{ fontSize: '14px', color: '#666' }}>
                            {error}
                        </div>
                    </div>
                    <button onClick={fetchUsers}>
                        Thử lại
                    </button>
                </div>
            )}

            <div className="customer-search-section">
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

            <div className="customer-table-container">
                <table className="customer-table">
                    <thead>
                        <tr>
                            <th>Họ tên</th>
                            <th>Email</th>
                            <th>Số điện thoại</th>
                            <th>Vai trò</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th> {/* 👈 thêm cột */}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="no-data">
                                    Không tìm thấy người dùng nào
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user, index) => (
                                <tr key={user.userId || index}>
                                    <td className="user-name">{user.fullName}</td>
                                    <td className="email-text">{user.email}</td>
                                    <td>{user.phone}</td>
                                    <td>
                                        <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                                            {getRoleText(user.role)}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${getStatusBadgeClass(user.status)}`}>
                                            {getStatusText(user.status)}
                                        </span>
                                    </td>
                                    <td>
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
