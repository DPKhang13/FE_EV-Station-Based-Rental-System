import React, { useState, useEffect } from 'react';
import './VehicleManagement.css';

const VehicleManagement = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        console.log('🔄 Component mounted - sẽ fetch data');
        // Tạm thời set fake data để test giao diện
        setTimeout(() => {
            setVehicles([
                {
                    vehicleId: 1,
                    vehicle_name: 'VinFast VF3',
                    plate_number: '29A-12345',
                    grade: 'Air',
                    color: 'Trắng',
                    status: 'AVAILABLE',
                    image: 'https://via.placeholder.com/100x60'
                },
                {
                    vehicleId: 2,
                    vehicle_name: 'VinFast VF5',
                    plate_number: '30B-67890',
                    grade: 'Plus',
                    color: 'Đen',
                    status: 'RESERVED',
                    image: 'https://via.placeholder.com/100x60'
                }
            ]);
            setLoading(false);
            console.log('✅ Fake data loaded');
        }, 1000);
    }, []);

    // Lọc xe theo từ khóa tìm kiếm
    const filteredVehicles = vehicles.filter(vehicle =>
        vehicle.vehicle_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.plate_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.color?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    console.log('🔍 Filtered vehicles:', filteredVehicles.length);

    return (
        <div className="vehicle-management">
            <div className="header">
                <h1>🚗 Quản lý xe</h1>
                <button className="btn-add">+ Thêm xe mới</button>
            </div>

            <div className="search-bar">
                <input
                    type="text"
                    placeholder="🔍 Tìm kiếm theo tên, biển số, màu sắc..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="loading">⏳ Đang tải dữ liệu...</div>
            ) : (
                <table className="vehicle-table">
                    <thead>
                        <tr>
                            <th>Hình ảnh</th>
                            <th>Tên xe</th>
                            <th>Biển số</th>
                            <th>Grade</th>
                            <th>Màu sắc</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredVehicles.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                                    Không tìm thấy xe nào
                                </td>
                            </tr>
                        ) : (
                            filteredVehicles.map(vehicle => (
                                <tr key={vehicle.vehicleId}>
                                    <td>
                                        <img src={vehicle.image} alt={vehicle.vehicle_name} />
                                    </td>
                                    <td>{vehicle.vehicle_name}</td>
                                    <td>{vehicle.plate_number}</td>
                                    <td>{vehicle.grade}</td>
                                    <td>{vehicle.color}</td>
                                    <td>
                                        <span className={`status-badge ${vehicle.status}`}>
                                            {vehicle.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn-edit">✏️ Sửa</button>
                                        <button className="btn-delete">🗑️ Xóa</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default VehicleManagement;