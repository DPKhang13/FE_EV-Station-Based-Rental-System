import React, { useState, useEffect } from 'react';
import './VehicleManagement.css';
import vehicleService from '../../services/vehicleService';

// Mapping ảnh xe theo hãng, màu sắc và số chỗ
const CAR_IMAGE_MAPPING = {
    '4': { // 4 chỗ
        'Vinfast': {
            'Blue': 'https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/4_Cho/Vinfast/a80cae76-5c8a-4226-ac85-116ba2da7a3a.png',
            'Silver': 'https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/4_Cho/Vinfast/b76c51c2-6e69-491c-ae83-0d36ff93cdff.png',
            'Black': 'https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/4_Cho/Vinfast/e88bd242-3df4-48a7-8fe2-a9a3466f939f.png',
            'Red': 'https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/4_Cho/Vinfast/e420cb1b-1710-4dbe-a5e3-e1285c690b6e.png',
            'White': 'https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/4_Cho/Vinfast/unnamed.jpg'
        },
        'BMW': {
            'White': 'https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/4_Cho/BMW/white.jpg',
            'Silver': 'https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/4_Cho/BMW/unnamed%20%281%29.jpg',
            'Blue': 'https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/4_Cho/BMW/blue.jpg',
            'Black': 'https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/4_Cho/BMW/8f9f3e31-0c04-4441-bb40-97778c9824e0.png',
            'Red': 'https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/4_Cho/BMW/7f3edc23-30ba-4e84-83a9-c8c418f2362d.png'
        },
        'Tesla': {
            'Silver': 'https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/4_Cho/Tesla/unnamed4.jpg',
            'Blue': 'https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/4_Cho/Tesla/unnamed.jpg',
            'Black': 'https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/4_Cho/Tesla/unnamed%20%283%29.jpg',
            'White': 'https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/4_Cho/Tesla/unnamed%20%282%29.jpg',
            'Red': 'https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/4_Cho/Tesla/unnamed%20%281%29.jpg'
        }
    }
};

const VehicleManagement = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);

    // Filters state
    const [filters, setFilters] = useState({
        colors: [],
        seatCounts: [],
        stations: [],
        statuses: []
    });

    // Modals state
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [showOrderHistory, setShowOrderHistory] = useState(false);
    const [selectedVehicleOrders, setSelectedVehicleOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        vehicleName: '',
        brand: '',
        plateNumber: '',
        variant: '',
        color: '',
        colorHex: '#ffffff',
        seatCount: '',
        year: '',
        stationId: '',
        batteryStatus: '',
        rangeKm: '',
        status: 'Available',
        transmission: 'Automatic',
        batteryCapacity: '',
        description: '',
        imageUrl: ''
    });

    // Fetch vehicles từ API
    const fetchVehicles = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('🔄 [VehicleManagement] Fetching vehicles from API...');

            const data = await vehicleService.fetchAndTransformVehicles();
            console.log('✅ [VehicleManagement] Received vehicles:', data.length);
            console.log('📊 [VehicleManagement] Sample vehicle:', data[0]);

            setVehicles(data);
        } catch (err) {
            console.error('❌ [VehicleManagement] Error fetching vehicles:', err);
            setError('Không thể tải danh sách xe. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    // Lấy unique values cho filters
    const getUniqueColors = () => [...new Set(vehicles.map(v => v.color).filter(Boolean))];
    const getUniqueSeatCounts = () => [...new Set(vehicles.map(v => v.seat_count).filter(Boolean))].sort((a, b) => a - b);
    const getUniqueStations = () => [...new Set(vehicles.map(v => v.stationName || `Station ${v.stationId}`).filter(Boolean))];
    const getAllStatuses = () => ['Available', 'Rented', 'Reserved', 'Maintenance'];

    // Lọc xe theo từ khóa tìm kiếm và filters
    const filteredVehicles = vehicles.filter(vehicle => {
        // Text search
        const matchesSearch = !searchTerm ||
            vehicle.vehicle_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vehicle.plate_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vehicle.color?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vehicle.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vehicle.stationName?.toLowerCase().includes(searchTerm.toLowerCase());

        // Filter by color
        const matchesColor = filters.colors.length === 0 || filters.colors.includes(vehicle.color);

        // Filter by seat count
        const matchesSeatCount = filters.seatCounts.length === 0 || filters.seatCounts.includes(vehicle.seat_count);

        // Filter by station
        const vehicleStation = vehicle.stationName || `Station ${vehicle.stationId}`;
        const matchesStation = filters.stations.length === 0 || filters.stations.includes(vehicleStation);

        // Filter by status
        const matchesStatus = filters.statuses.length === 0 || filters.statuses.includes(vehicle.status);

        return matchesSearch && matchesColor && matchesSeatCount && matchesStation && matchesStatus;
    });

    console.log('🔍 Filtered vehicles:', filteredVehicles.length);

    // Map status cho badge hiển thị
    const getStatusInfo = (status) => {
        const statusMap = {
            'Available': { text: 'Sẵn sàng', class: 'AVAILABLE' },
            'Rented': { text: 'Đang thuê', class: 'IN_USE' },
            'Reserved': { text: 'Đã đặt', class: 'RESERVED' },
            'Maintenance': { text: 'Bảo trì', class: 'MAINTENANCE' }
        };
        return statusMap[status] || { text: status, class: 'AVAILABLE' };
    };

    // Toggle filter
    const toggleFilter = (filterType, value) => {
        setFilters(prev => {
            const current = prev[filterType];
            const updated = current.includes(value)
                ? current.filter(item => item !== value)
                : [...current, value];
            return { ...prev, [filterType]: updated };
        });
    };

    // Clear all filters
    const clearFilters = () => {
        setFilters({
            colors: [],
            seatCounts: [],
            stations: [],
            statuses: []
        });
    };

    // Xem lịch sử đặt xe
    const handleViewOrderHistory = async (vehicle) => {
        try {
            setLoadingOrders(true);
            setShowOrderHistory(true);

            const vehicleId = vehicle.vehicle_id;
            const token = localStorage.getItem('accessToken');

            console.log('📦 Fetching order history for vehicle:', vehicleId);

            const response = await fetch(`http://localhost:8080/api/order/vehicle/${vehicleId}/history`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch order history');
            }

            const vehicleOrders = await response.json();
            console.log(`✅ Orders for vehicle ${vehicle.plate_number}:`, vehicleOrders.length);
            console.log('� Order data:', vehicleOrders);

            setSelectedVehicleOrders(vehicleOrders);
        } catch (err) {
            console.error('❌ Error fetching order history:', err);
            alert('❌ Không thể tải lịch sử đặt xe. Vui lòng thử lại.');
            setShowOrderHistory(false);
        } finally {
            setLoadingOrders(false);
        }
    };

    const closeOrderHistory = () => {
        setShowOrderHistory(false);
        setSelectedVehicleOrders([]);
    };

    // Function to fetch image URL from backend API
    const fetchCarImageFromAPI = async (brand, color, seatCount) => {
        try {
            const token = localStorage.getItem('accessToken');
            const API_BASE_URL = 'http://localhost:8080/api';
            
            console.log('🎨 [API] Fetching image for:', { brand, color, seatCount });
            
            const url = `${API_BASE_URL}/vehicles/image-url?brand=${encodeURIComponent(brand)}&color=${encodeURIComponent(color)}&seatCount=${seatCount}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('✅ [API] Image URL received:', data.imageUrl);
                return data.imageUrl;
            } else {
                console.error('❌ [API] Failed to fetch image:', response.status);
                return '';
            }
        } catch (error) {
            console.error('❌ [API] Error fetching image:', error);
            return '';
        }
    };

    // Function to update form data and auto-fill image from API
    const updateFormWithImage = async (updates) => {
        const newFormData = { ...formData, ...updates };
        
        console.log('🔄 [updateFormWithImage] Current form:', newFormData);
        
        // Tự động cập nhật ảnh nếu có đủ thông tin
        if (newFormData.brand && newFormData.color && newFormData.seatCount) {
            const imageUrl = await fetchCarImageFromAPI(newFormData.brand, newFormData.color, newFormData.seatCount);
            if (imageUrl) {
                newFormData.imageUrl = imageUrl;
                console.log('✅ [updateFormWithImage] Auto-filled image:', imageUrl);
            }
        }
        
        setFormData(newFormData);
    };

    // Handle add vehicle (currently unused - reserved for future use)
    const _handleAddVehicle = () => {
        setFormData({
            vehicleName: '',
            brand: '',
            plateNumber: '',
            variant: '',
            color: '',
            colorHex: '#ffffff',
            seatCount: '',
            year: '',
            stationId: '',
            batteryStatus: '',
            rangeKm: '',
            status: 'Available',
            transmission: 'Automatic',
            batteryCapacity: '',
            description: '',
            imageUrl: ''
        });
        setShowAddModal(true);
    };

    // Handle edit vehicle
    const handleEditVehicle = (vehicle) => {
        setEditingVehicle(vehicle);
        setFormData({
            vehicleName: vehicle.vehicle_name || '',
            brand: vehicle.brand || '',
            plateNumber: vehicle.plate_number || '',
            variant: vehicle.variant || vehicle.grade || '',
            color: vehicle.color || '',
            seatCount: vehicle.seat_count || '',
            year: vehicle.year_of_manufacture || '',
            stationId: vehicle.stationId || '',
            batteryStatus: vehicle.battery_status || '',
            rangeKm: vehicle.range_km || '',
            status: vehicle.status || 'Available',
            transmission: vehicle.transmission || 'Automatic',
            batteryCapacity: vehicle.battery_capacity || '',
            description: vehicle.description || '',
            imageUrl: vehicle.imageUrl || vehicle.image_url || ''
        });
        setShowEditModal(true);
    };

    // Handle delete vehicle with double confirmation
    const handleDeleteVehicle = async (vehicle) => {
        // First confirmation
        const firstConfirm = window.confirm(
            `BẠN CÓ CHẮC CHẮN MUỐN XÓA XE NÀY?\n\n` +
            `Tên xe: ${vehicle.vehicle_name}\n` +
            `Biển số: ${vehicle.plate_number}\n` +
            `Màu: ${vehicle.color}\n\n` +
            `Hành động này KHÔNG THỂ HOÀN TÁC!`
        );

        if (!firstConfirm) {
            console.log('❌ User cancelled first confirmation');
            return;
        }

        // Second confirmation
        const secondConfirm = window.confirm(
            `XÁC NHẬN LẦN 2\n\n` +
            `Bạn thực sự muốn xóa xe "${vehicle.vehicle_name}" (${vehicle.plate_number})?\n\n` +
            `Đây là xác nhận cuối cùng. Sau khi xóa, dữ liệu sẽ MẤT VĨNH VIỄN!`
        );

        if (!secondConfirm) {
            console.log('❌ User cancelled second confirmation');
            return;
        }

        try {
            console.log('🗑️ Deleting vehicle:', vehicle.id);
            
            await vehicleService.deleteVehicle(vehicle.id);

            alert(`✅ Đã xóa xe ${vehicle.vehicle_name} thành công!`);
            fetchVehicles(); // Refresh list
        } catch (err) {
            console.error('❌ Error deleting vehicle:', err);
            alert(`❌ Lỗi khi xóa xe: ${err.message}`);
        }
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (showEditModal) {
                console.log('✏️ Updating vehicle:', editingVehicle.id, formData);
                // TODO: Call API to update vehicle
                // await vehicleService.updateVehicle(editingVehicle.id, formData);
                alert('✅ Cập nhật xe thành công!');
            } else {
                console.log('➕ Adding new vehicle:', formData);
                // TODO: Call API to add vehicle
                // await vehicleService.addVehicle(formData);
                alert('✅ Thêm xe mới thành công!');
            }

            setShowAddModal(false);
            setShowEditModal(false);
            setEditingVehicle(null);
            fetchVehicles(); // Refresh list
        } catch (err) {
            console.error('❌ Error saving vehicle:', err);
            alert(`❌ Lỗi: ${err.message}`);
        }
    };

    // Close modals
    const closeModals = () => {
        setShowAddModal(false);
        setShowEditModal(false);
        setEditingVehicle(null);
    };

    return (
        <div className="vehicle-management">
            <div className="page-header">
                <h1>QUẢN LÝ XE</h1>
            </div>

            <div className="search-bar">
                <input
                    type="text"
                    placeholder=" Tìm kiếm theo tên, biển số, màu sắc..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Filters Section */}
            <div
                className={`filters-section ${showFilters ? 'open' : ''}`}
                onMouseEnter={() => setShowFilters(true)}
                onMouseLeave={() => setShowFilters(false)}
            >
                <div className="filter-header">
                    <h3>🔍 Bộ lọc {!showFilters && '(Di chuột vào để mở)'}</h3>
                    {(filters.colors.length > 0 || filters.seatCounts.length > 0 ||
                        filters.stations.length > 0 || filters.statuses.length > 0) && (
                            <button className="btn-clear-filters" onClick={clearFilters}>
                                Xóa bộ lọc
                            </button>
                        )}
                </div>

                <div className="filters-grid">
                    {/* Color Filter */}
                    <div className="filter-group">
                        <h4>🎨 Màu sắc</h4>
                        <div className="filter-options">
                            {getUniqueColors().map(color => (
                                <label key={color} className="filter-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={filters.colors.includes(color)}
                                        onChange={() => toggleFilter('colors', color)}
                                    />
                                    <span>{color}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Seat Count Filter */}
                    <div className="filter-group">
                        <h4>💺 Số ghế</h4>
                        <div className="filter-options">
                            {getUniqueSeatCounts().map(count => (
                                <label key={count} className="filter-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={filters.seatCounts.includes(count)}
                                        onChange={() => toggleFilter('seatCounts', count)}
                                    />
                                    <span>{count} chỗ</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Station Filter */}
                    <div className="filter-group">
                        <h4>📍 Điểm thuê</h4>
                        <div className="filter-options">
                            {getUniqueStations().map(station => (
                                <label key={station} className="filter-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={filters.stations.includes(station)}
                                        onChange={() => toggleFilter('stations', station)}
                                    />
                                    <span>{station}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="filter-group">
                        <h4>📊 Trạng thái</h4>
                        <div className="filter-options">
                            {getAllStatuses().map(status => {
                                const statusInfo = getStatusInfo(status);
                                return (
                                    <label key={status} className="filter-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={filters.statuses.includes(status)}
                                            onChange={() => toggleFilter('statuses', status)}
                                        />
                                        <span>{statusInfo.text}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="error-message" style={{
                    padding: '20px',
                    background: '#fee2e2',
                    color: '#991b1b',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    textAlign: 'center'
                }}>
                    ⚠️ {error}
                    <button
                        onClick={fetchVehicles}
                        style={{
                            marginLeft: '15px',
                            padding: '8px 16px',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                        }}
                    >
                        🔄 Thử lại
                    </button>
                </div>
            )}

            {loading ? (
                <div className="loading">⏳ Đang tải dữ liệu xe từ hệ thống...</div>
            ) : (
                <table className="vehicle-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Hình ảnh</th>
                            <th>Tên xe</th>
                            <th>Biển số</th>
                            <th>Hãng</th>
                            <th>Phiên bản</th>
                            <th>Màu sắc</th>
                            <th>Số ghế</th>
                            <th>Năm SX</th>
                            <th>Điểm thuê</th>
                            <th>Pin (%)</th>
                            <th>Quãng đường (km)</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredVehicles.length === 0 ? (
                            <tr>
                                <td colSpan="14" style={{ textAlign: 'center', padding: '40px' }}>
                                    {searchTerm ? '🔍 Không tìm thấy xe nào phù hợp' : '📭 Chưa có xe nào trong hệ thống'}
                                </td>
                            </tr>
                        ) : (
                            filteredVehicles.map((vehicle, index) => {
                                const statusInfo = getStatusInfo(vehicle.status);
                                return (
                                    <tr key={vehicle.id || vehicle.vehicle_id}>
                                        <td><strong>#{index + 1}</strong></td>
                                        <td>
                                            <img
                                                src={vehicle.image}
                                                alt={vehicle.vehicle_name}
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/100x60?text=No+Image';
                                                }}
                                            />
                                        </td>
                                        <td><strong>{vehicle.vehicle_name}</strong></td>
                                        <td><span style={{ fontWeight: '600', color: '#3b82f6' }}>{vehicle.plate_number}</span></td>
                                        <td>{vehicle.brand || 'N/A'}</td>
                                        <td>{vehicle.grade || vehicle.variant || 'N/A'}</td>
                                        <td>{vehicle.color}</td>
                                        <td>{vehicle.seat_count} chỗ</td>
                                        <td>{vehicle.year_of_manufacture}</td>
                                        <td>{vehicle.stationName || `Station ${vehicle.stationId}` || 'N/A'}</td>
                                        <td>
                                            {(() => {
                                                const batteryValue = parseInt(vehicle.battery_status) || 0;
                                                const color = batteryValue >= 70 ? '#10b981' :    // >= 70%: Xanh lá
                                                              batteryValue > 0 ? '#f59e0b' :      // 1-69%: Vàng
                                                              '#ef4444';                          // 0%: Đỏ
                                                return (
                                                    <span style={{ color: color, fontWeight: '600' }}>
                                                        {vehicle.battery_status || 0}
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        <td>{vehicle.range_km || 0} km</td>
                                        <td>
                                            <span className={`status-badge ${statusInfo.class}`}>
                                                {statusInfo.text}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="btn-edit"
                                                title="Chỉnh sửa thông tin xe"
                                                onClick={() => handleEditVehicle(vehicle)}
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                className="btn-history"
                                                title="Xem lịch sử đặt xe"
                                                onClick={() => handleViewOrderHistory(vehicle)}
                                                style={{
                                                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                                    color: 'white',
                                                    padding: '8px 12px',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    marginRight: '8px'
                                                }}
                                            >
                                                📋 Lịch sử
                                            </button>
                                            <button
                                                className="btn-delete"
                                                title="Xóa xe khỏi hệ thống"
                                                onClick={() => handleDeleteVehicle(vehicle)}
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            )}

            {!loading && !error && vehicles.length > 0 && (
                <div style={{
                    marginTop: '20px',
                    padding: '15px',
                    background: '#f0f9ff',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <strong> Tổng số xe:</strong> {vehicles.length} xe
                        {searchTerm && <span> | Tìm thấy: {filteredVehicles.length} xe</span>}
                    </div>
                    <button
                        onClick={fetchVehicles}
                        style={{
                            padding: '8px 16px',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600'
                        }}
                    >
                        Làm mới
                    </button>
                </div>
            )}

            {/* Add/Edit Vehicle Modal */}
            {(showAddModal || showEditModal) && (
                <div className="modal-overlay" onClick={closeModals}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{showEditModal ? ' Chỉnh sửa xe' : ' Thêm xe mới'}</h2>
                            <button className="modal-close" onClick={closeModals}>✖️</button>
                        </div>

                        <form onSubmit={handleSubmit} className="vehicle-form">
                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <label>🚗 Chọn nhanh mẫu xe (tự động điền ảnh)</label>
                                    <select
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                const [brand, color, seats, imageUrl] = e.target.value.split('|||');
                                                const colorMap = {
                                                    'White': '#ffffff',
                                                    'Black': '#000000',
                                                    'Silver': '#c0c0c0',
                                                    'Red': '#ff0000',
                                                    'Blue': '#0000ff'
                                                };
                                                setFormData({
                                                    ...formData,
                                                    brand: brand,
                                                    color: color,
                                                    colorHex: colorMap[color] || '#ffffff',
                                                    seatCount: seats,
                                                    imageUrl: imageUrl
                                                });
                                            }
                                        }}
                                        style={{
                                            padding: '12px',
                                            border: '2px solid #3b82f6',
                                            borderRadius: '8px',
                                            background: '#eff6ff',
                                            fontWeight: '600'
                                        }}
                                    >
                                        <option value="">-- Chọn mẫu xe có sẵn --</option>
                                        <optgroup label="🚗 Vinfast 4 chỗ">
                                            <option value="Vinfast|||Blue|||4|||https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/4_Cho/Vinfast/a80cae76-5c8a-4226-ac85-116ba2da7a3a.png">🔵 Vinfast - Xanh</option>
                                            <option value="Vinfast|||Silver|||4|||https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/4_Cho/Vinfast/b76c51c2-6e69-491c-ae83-0d36ff93cdff.png">⚪ Vinfast - Bạc</option>
                                            <option value="Vinfast|||Black|||4|||https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/4_Cho/Vinfast/e88bd242-3df4-48a7-8fe2-a9a3466f939f.png">⚫ Vinfast - Đen</option>
                                            <option value="Vinfast|||Red|||4|||https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/4_Cho/Vinfast/e420cb1b-1710-4dbe-a5e3-e1285c690b6e.png">🔴 Vinfast - Đỏ</option>
                                            <option value="Vinfast|||White|||4|||https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/4_Cho/Vinfast/unnamed.jpg">⚪ Vinfast - Trắng</option>
                                        </optgroup>
                                        <optgroup label="🚙 BMW 4 chỗ">
                                            <option value="BMW|||White|||4|||https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/4_Cho/BMW/white.jpg">⚪ BMW - Trắng</option>
                                            <option value="BMW|||Silver|||4|||https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/4_Cho/BMW/unnamed%20%281%29.jpg">⚪ BMW - Bạc</option>
                                            <option value="BMW|||Blue|||4|||https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/4_Cho/BMW/blue.jpg">🔵 BMW - Xanh</option>
                                            <option value="BMW|||Black|||4|||https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/4_Cho/BMW/8f9f3e31-0c04-4441-bb40-97778c9824e0.png">⚫ BMW - Đen</option>
                                            <option value="BMW|||Red|||4|||https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/4_Cho/BMW/7f3edc23-30ba-4e84-83a9-c8c418f2362d.png">🔴 BMW - Đỏ</option>
                                        </optgroup>
                                        <optgroup label="🚘 Tesla 4 chỗ">
                                            <option value="Tesla|||Silver|||4|||https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/4_Cho/Tesla/unnamed4.jpg">⚪ Tesla - Bạc</option>
                                            <option value="Tesla|||Blue|||4|||https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/4_Cho/Tesla/unnamed.jpg">🔵 Tesla - Xanh</option>
                                            <option value="Tesla|||Black|||4|||https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/4_Cho/Tesla/unnamed%20%283%29.jpg">⚫ Tesla - Đen</option>
                                            <option value="Tesla|||White|||4|||https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/4_Cho/Tesla/unnamed%20%282%29.jpg">⚪ Tesla - Trắng</option>
                                            <option value="Tesla|||Red|||4|||https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/4_Cho/Tesla/unnamed%20%281%29.jpg">🔴 Tesla - Đỏ</option>
                                        </optgroup>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Tên xe *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.vehicleName}
                                        onChange={(e) => setFormData({ ...formData, vehicleName: e.target.value })}
                                        placeholder="VD: VinFast VF5"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Hãng xe *</label>
                                    <select
                                        required
                                        value={formData.brand}
                                        onChange={(e) => updateFormWithImage({ brand: e.target.value })}
                                    >
                                        <option value="">-- Chọn hãng xe --</option>
                                        <option value="Vinfast">Vinfast</option>
                                        <option value="BMW">BMW</option>
                                        <option value="Tesla">Tesla</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Biển số *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.plateNumber}
                                        onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                                        placeholder="VD: 29A-12345"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Phiên bản</label>
                                    <input
                                        type="text"
                                        value={formData.variant}
                                        onChange={(e) => setFormData({ ...formData, variant: e.target.value })}
                                        placeholder="VD: Plus, Base"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Màu sắc *</label>
                                    {/* Color picker with preview - Updated */}
                                    <div style={{ 
                                        display: 'flex', 
                                        gap: '12px', 
                                        alignItems: 'center' 
                                    }}>
                                        <input
                                            type="color"
                                            value={formData.colorHex || '#ffffff'}
                                            onChange={(e) => setFormData({ 
                                                ...formData, 
                                                colorHex: e.target.value 
                                            })}
                                            style={{
                                                width: '60px',
                                                height: '42px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px',
                                                cursor: 'pointer'
                                            }}
                                            title="Chọn màu"
                                        />
                                        <select
                                            required
                                            value={formData.color}
                                            onChange={(e) => {
                                                const colorMap = {
                                                    'White': '#ffffff',
                                                    'Black': '#000000',
                                                    'Silver': '#c0c0c0',
                                                    'Red': '#ff0000',
                                                    'Blue': '#0000ff',
                                                    'Gray': '#808080',

                                                };
                                                updateFormWithImage({ 
                                                    color: e.target.value,
                                                    colorHex: colorMap[e.target.value] || formData.colorHex
                                                });
                                            }}
                                            style={{ flex: 1 }}
                                        >
                                            <option value="">-- Chọn màu --</option>
                                            <option value="White">⚪ Trắng</option>
                                            <option value="Black">⚫ Đen</option>
                                            <option value="Silver">🔘 Bạc</option>
                                            <option value="Red">🔴 Đỏ</option>
                                            <option value="Blue">🔵 Xanh dương</option>
                                            <option value="Gray">⚫ Xám</option>
                                        </select>
                                    </div>
                                    <small style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px' }}>
                                        Chọn màu từ dropdown hoặc dùng color picker để chọn màu tùy chỉnh
                                    </small>
                                </div>

                                <div className="form-group">
                                    <label>Số ghế *</label>
                                    <select
                                        required
                                        value={formData.seatCount}
                                        onChange={(e) => updateFormWithImage({ seatCount: e.target.value })}
                                    >
                                        <option value="">Chọn số ghế</option>
                                        <option value="4">4 chỗ</option>
                                        <option value="5">5 chỗ</option>
                                        <option value="7">7 chỗ</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Năm sản xuất *</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.year}
                                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                        placeholder="VD: 2024"
                                        min="2000"
                                        max="2030"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Điểm thuê (Station ID) *</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.stationId}
                                        onChange={(e) => setFormData({ ...formData, stationId: e.target.value })}
                                        placeholder="VD: 1, 2, 3"
                                        min="1"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Dung lượng pin (kWh)</label>
                                    <input
                                        type="number"
                                        value={formData.batteryCapacity}
                                        onChange={(e) => setFormData({ ...formData, batteryCapacity: e.target.value })}
                                        placeholder="VD: 37.23"
                                        step="0.01"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Pin hiện tại (%)</label>
                                    <input
                                        type="number"
                                        value={formData.batteryStatus}
                                        onChange={(e) => setFormData({ ...formData, batteryStatus: e.target.value })}
                                        placeholder="VD: 85"
                                        min="0"
                                        max="100"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Quãng đường (km)</label>
                                    <input
                                        type="number"
                                        value={formData.rangeKm}
                                        onChange={(e) => setFormData({ ...formData, rangeKm: e.target.value })}
                                        placeholder="VD: 300"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Hộp số</label>
                                    <select
                                        value={formData.transmission}
                                        onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                                    >
                                        <option value="Automatic">Tự động</option>
                                        <option value="Manual">Số sàn</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Trạng thái *</label>
                                    <select
                                        required
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="Available">Sẵn sàng</option>
                                        <option value="Rented">Đang thuê</option>
                                        <option value="Reserved">Đã đặt</option>
                                        <option value="Maintenance">Bảo trì</option>
                                    </select>
                                </div>

                                <div className="form-group full-width">
                                    <label>Mô tả</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Mô tả chi tiết về xe..."
                                        rows="3"
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label>Đường dẫn ảnh</label>
                                    <div style={{ 
                                        marginBottom: '8px', 
                                        padding: '8px 12px', 
                                        background: '#f3f4f6', 
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        color: '#6b7280'
                                    }}>
                                        📋 Hiện tại: Brand={formData.brand || '?'}, Color={formData.color || '?'}, Seats={formData.seatCount || '?'}
                                        {formData.brand && formData.color && formData.seatCount && (
                                            <span style={{ color: '#10b981', fontWeight: 'bold' }}> ✓ Đủ điều kiện</span>
                                        )}
                                    </div>
                                    <input
                                        type="url"
                                        value={formData.imageUrl || ''}
                                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                        placeholder="URL ảnh xe (tự động điền khi chọn hãng, màu, số chỗ)"
                                        style={{ 
                                            backgroundColor: formData.imageUrl ? '#f0fdf4' : '#fff',
                                            borderColor: formData.imageUrl ? '#10b981' : '#e5e7eb'
                                        }}
                                    />
                                    {formData.imageUrl && (
                                        <div style={{ marginTop: '8px' }}>
                                            <img 
                                                src={formData.imageUrl} 
                                                alt="Preview" 
                                                style={{ 
                                                    maxWidth: '200px', 
                                                    maxHeight: '120px',
                                                    borderRadius: '8px',
                                                    border: '2px solid #e5e7eb'
                                                }}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={closeModals}>
                                    Hủy
                                </button>
                                <button type="submit" className="btn-submit">
                                    {showEditModal ? ' Lưu thay đổi' : 'Thêm xe'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Order History Modal */}
            {showOrderHistory && (
                <div className="modal-overlay" onClick={closeOrderHistory}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '1200px' }}>
                        <div className="modal-header">
                            <h2>📋 Lịch sử đặt xe</h2>
                            <button className="modal-close" onClick={closeOrderHistory}>✕</button>
                        </div>

                        <div className="modal-body">
                            {loadingOrders ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                    ⏳ Đang tải lịch sử đặt xe...
                                </div>
                            ) : selectedVehicleOrders.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                    📭 Chưa có lịch sử đặt xe nào
                                </div>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="vehicle-table" style={{ width: '100%' }}>
                                        <thead>
                                            <tr>
                                                <th>Mã đơn</th>
                                                <th>Biển số</th>
                                                <th>Trạm</th>
                                                <th>Hãng</th>
                                                <th>Màu</th>
                                                <th>Số ghế</th>
                                                <th>Thời gian bắt đầu</th>
                                                <th>Thời gian kết thúc</th>
                                                <th>Tổng tiền</th>
                                                <th>Đặt cọc</th>
                                                <th>Còn lại</th>
                                                <th>Trạng thái</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedVehicleOrders.map((order, index) => (
                                                <tr key={order.orderId || index}>
                                                    <td style={{ fontFamily: 'monospace', fontSize: '11px' }}>
                                                        {order.orderId ? order.orderId.split('-')[0] + '...' : 'N/A'}
                                                    </td>
                                                    <td style={{ fontWeight: 'bold' }}>{order.plateNumber || 'N/A'}</td>
                                                    <td>{order.stationName || `Station ${order.stationId}`}</td>
                                                    <td>{order.brand || 'N/A'}</td>
                                                    <td>{order.color || 'N/A'}</td>
                                                    <td>{order.seatCount} chỗ</td>
                                                    <td>{order.startTime || 'N/A'}</td>
                                                    <td>{order.endTime || 'N/A'}</td>
                                                    <td style={{ fontWeight: 'bold', color: '#059669' }}>
                                                        {order.totalPrice?.toLocaleString() || '0'}đ
                                                    </td>
                                                    <td>{order.depositAmount?.toLocaleString() || '0'}đ</td>
                                                    <td>{order.remainingAmount?.toLocaleString() || '0'}đ</td>
                                                    <td>
                                                        <span style={{
                                                            padding: '4px 8px',
                                                            borderRadius: '12px',
                                                            fontSize: '12px',
                                                            fontWeight: '600',
                                                            background: order.status === 'DEPOSITED' ? '#d1fae5' :
                                                                order.status === 'PENDING_DEPOSIT' ? '#fef3c7' :
                                                                    order.status === 'PAYMENT_FAILED' ? '#fee2e2' :
                                                                        order.status === 'COMPLETED' ? '#dbeafe' : '#e5e7eb',
                                                            color: order.status === 'DEPOSITED' ? '#065f46' :
                                                                order.status === 'PENDING_DEPOSIT' ? '#92400e' :
                                                                    order.status === 'PAYMENT_FAILED' ? '#991b1b' :
                                                                        order.status === 'COMPLETED' ? '#1e40af' : '#1f2937'
                                                        }}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div style={{ marginTop: '20px', padding: '15px', background: '#f3f4f6', borderRadius: '8px' }}>
                                        <strong>📊 Thống kê:</strong> Tổng {selectedVehicleOrders.length} đơn đặt xe
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={closeOrderHistory}>
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VehicleManagement;