import React, { useState, useEffect } from 'react';
import './VehicleManagement.css';
import vehicleService from '../../services/vehicleService';

const VehicleManagement = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);

    // Modal / form / order-history states which were missing and caused runtime errors
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [formData, setFormData] = useState({
        vehicleName: '',
        brand: '',
        plateNumber: '',
        variant: '',
        color: '',
        seatCount: '',
        year: '',
        stationId: '',
        batteryStatus: '',
        rangeKm: '',
        status: 'Available',
        transmission: 'Automatic',
        batteryCapacity: '',
        description: ''
    });

    const [showOrderHistory, setShowOrderHistory] = useState(false);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [selectedVehicleOrders, setSelectedVehicleOrders] = useState([]);
    const [historyVehicle, setHistoryVehicle] = useState(null);

    // Fetch vehicles wrapper - use vehicleService helper
    const fetchVehicles = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await vehicleService.fetchAndTransformVehicles();
            setVehicles(data);
        } catch (err) {
            console.error('Error fetching vehicles:', err);
            setError('Không thể tải danh sách xe. Vui lòng thử lại.');
            setVehicles([]);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Đặt carImageMap ngay trong component (có thể dùng state và hàm khác)
    const carImageMap = {
        vinfast: {
            '7': {
                trắng: 'https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/7_Cho/Vinfast/unnamed.jpg',
                bạc: 'https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/7_Cho/Vinfast/unnamed%20%284%29.jpg',
                đen: 'https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/7_Cho/Vinfast/unnamed%20%283%29.jpg',
                đỏ: 'https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/7_Cho/Vinfast/unnamed%20%282%29.jpg',
                xanh: 'https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/7_Cho/Vinfast/unnamed%20%281%29.jpg',
            },
            '4': {
                xanh: 'https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/4_Cho/Vinfast/a80cae76-5c8a-4226-ac85-116ba2da7a3a.png',
                bạc: 'https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/4_Cho/Vinfast/b76c51c2-6e69-491c-ae83-0d36ff93cdff.png',
                đen: 'https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/4_Cho/Vinfast/e88bd242-3df4-48a7-8fe2-a9a3466f939f.png',
                đỏ: 'https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/4_Cho/Vinfast/e420cb1b-1710-4dbe-a5e3-e1285c690b6e.png',
                trắng: 'https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/4_Cho/Vinfast/unnamed.jpg',
            },
        },
        bmw: {
            '7': {
                đỏ: 'https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/7_Cho/BMW/unnamed%20%281%29.jpg',
                đen: 'https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/7_Cho/BMW/unnamed%20%284%29.jpg',
                trắng: 'https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/7_Cho/BMW/unnamed.jpg',
                bạc: 'https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/7_Cho/BMW/unnamed%20%283%29.jpg',
                xanh: 'https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/7_Cho/BMW/unnamed%20%282%29.jpg',
            },
            '4': {
                trắng: 'https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/4_Cho/BMW/white.jpg',
                bạc: 'https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/4_Cho/BMW/unnamed%20%281%29.jpg',
                xanh: 'https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/4_Cho/BMW/blue.jpg',
                đen: 'https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/4_Cho/BMW/8f9f3e31-0c04-4441-bb40-97778c9824e0.png',
                đỏ: 'https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/4_Cho/BMW/7f3edc23-30ba-4e84-83a9-c8c418f2362d.png',
            },
        },
        tesla: {
            '7': {
                trắng: 'https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/7_Cho/Tesla/unnamed.jpg',
                bạc: 'https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/7_Cho/Tesla/unnamed%20%284%29.jpg',
                đỏ: 'https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/7_Cho/Tesla/unnamed%20%282%29.jpg',
                đen: 'https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/7_Cho/Tesla/unnamed%20%283%29.jpg',
                xanh: 'https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/7_Cho/Tesla/unnamed%20%281%29.jpg',
            },
            '4': {
                bạc: 'https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/4_Cho/Tesla/unnamed4.jpg',
                xanh: 'https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/4_Cho/Tesla/unnamed.jpg',
                đen: 'https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/4_Cho/Tesla/unnamed%20%283%29.jpg',
                trắng: 'https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/4_Cho/Tesla/unnamed%20%282%29.jpg',
                đỏ: 'https://s3-hcm5-r1.longvan.net/19430189-verify-customer-docs/imgCar/4_Cho/Tesla/unnamed%20%281%29.jpg',
            },
        },
    }; // ✅ chỉ 1 ngoặc đóng duy nhất ở đây!

    // Lấy URL ảnh theo brand / seat / color từ carImageMap
    const getCarImageUrl = (vehicle) => {
        if (!vehicle) return 'https://via.placeholder.com/100x60?text=No+Image';
        const brand = (vehicle.brand || '').toLowerCase().replace(/\s+/g, '');
        const seat = String(vehicle.seat_count || vehicle.seatCount || '4');
        let colorRaw = (vehicle.color || '').toLowerCase().trim();

        // map common english names to Vietnamese keys used in carImageMap
        const colorSynonyms = {
            'white': 'trắng',
            'black': 'đen',
            'silver': 'bạc',
            'grey': 'xanh',
            'gray': 'xanh',
            'blue': 'xanh',
            'red': 'đỏ'
        };

        if (!colorRaw && vehicle.colorName) colorRaw = vehicle.colorName.toLowerCase().trim();
        if (colorSynonyms[colorRaw]) colorRaw = colorSynonyms[colorRaw];

        // Try direct lookup, then normalized without diacritics, then fallback to vehicle.image or placeholder
        const tryLookup = (b, s, c) => {
            try {
                return carImageMap?.[b]?.[s]?.[c];
            } catch {
                return undefined;
            }
        };

        let url = tryLookup(brand, seat, colorRaw);

        if (!url) {
            // try remove diacritics from keys
            const normalize = (str) => str.normalize ? str.normalize('NFD').replace(/\p{Diacritic}/gu, '') : str;
            const colorNoAcc = normalize(colorRaw);
            // iterate available colors for brand/seat and try to match by normalized key
            const bucket = carImageMap?.[brand]?.[seat] || {};
            for (const key of Object.keys(bucket)) {
                if (normalize(key) === colorNoAcc) {
                    url = bucket[key];
                    break;
                }
            }
        }

        // fallback to vehicle.image (transformed data) or a placeholder
        return url || vehicle.image || 'https://via.placeholder.com/100x60?text=No+Image';
    };

    // ✅ Bây giờ khai báo state filters bình thường
    const [filters, setFilters] = useState({
        colors: [],
        seatCounts: [],
        stations: [],
        statuses: [],
    });
    const [showFilters, setShowFilters] = useState(false);
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
        }
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
            // open modal right away so user sees loading state
            setShowOrderHistory(true);

            // normalize id to number (API expects vehicleId path param)
            const rawId = vehicle.vehicle_id || vehicle.id || vehicle.vehicleId;
            const vehicleId = Number(rawId);
            console.log('📦 Fetching order history for vehicle (raw/id):', rawId, '/', vehicleId);

            if (!Number.isFinite(vehicleId) || vehicleId <= 0) {
                throw new Error('Invalid vehicleId provided for order history');
            }

            // remember which vehicle we are loading history for (for UI/debug)
            setHistoryVehicle({ id: vehicleId, plate: vehicle.plate_number || vehicle.plateNumber || vehicle.vehicle_name || 'N/A' });

            // Use vehicleService helper which centralizes API calls and errors
            const vehicleOrders = await vehicleService.getVehicleOrderHistory(vehicleId);

            if (!Array.isArray(vehicleOrders)) {
                throw new Error('Invalid response for order history');
            }

            console.log(`✅ Orders for vehicle ${vehicle.plate_number}:`, vehicleOrders.length);
            setSelectedVehicleOrders(vehicleOrders);
        } catch (err) {
            console.error('❌ Error fetching order history:', err);
            alert('❌ Không thể tải lịch sử đặt xe. Vui lòng thử lại.');
            setShowOrderHistory(false);
            setSelectedVehicleOrders([]);
            setHistoryVehicle(null);
        } finally {
            setLoadingOrders(false);
        }
    };

    const closeOrderHistory = () => {
        setShowOrderHistory(false);
        setSelectedVehicleOrders([]);
        setHistoryVehicle(null);
    };

    // Handle add vehicle
    const handleAddVehicle = () => {
        setFormData({
            vehicleName: '',
            brand: '',
            plateNumber: '',
            variant: '',
            color: '',
            seatCount: '',
            year: '',
            stationId: '',
            batteryStatus: '',
            rangeKm: '',
            status: 'Available',
            transmission: 'Automatic',
            batteryCapacity: '',
            description: ''
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
            description: vehicle.description || ''
        });
        setShowAddModal(false);
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
            // normalize vehicle id
            const rawId = vehicle.vehicle_id || vehicle.id || vehicle.vehicleId;
            const vehicleId = Number(rawId);

            if (!Number.isFinite(vehicleId) || vehicleId <= 0) {
                throw new Error('Invalid vehicle id for deletion');
            }

            console.log('🗑️ Deleting vehicle via API:', vehicleId);
            await vehicleService.deleteVehicle(vehicleId);

            alert(`✅ Đã xóa xe ${vehicle.vehicle_name || vehicle.vehicleName || vehicle.plate_number || ''} thành công!`);
            await fetchVehicles(); // Refresh list
        } catch (err) {
            console.error('❌ Error deleting vehicle:', err);
            alert(`❌ Lỗi khi xóa xe: ${err.message || err}`);
        }
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // determine status: prefer form value, then existing editingVehicle, otherwise default to 'available'
            const statusValue = (formData.status || (editingVehicle && editingVehicle.status) || 'available').toString().toLowerCase();

            // Build payload expected by backend
            const payload = {
                plateNumber: formData.plateNumber,
                status: statusValue, // must be one of maintenance,rented,available (lowercase)
                stationId: Number(formData.stationId) || 1,
                vehicleName: formData.vehicleName || `${formData.brand || ''} ${formData.seatCount || ''}`.trim(),
                description: formData.description || '',
                brand: formData.brand,
                color: formData.color,
                transmission: formData.transmission || 'Automatic',
                seatCount: Number(formData.seatCount) || 4,
                year: Number(formData.year) || new Date().getFullYear(),
                variant: formData.variant,
                batteryStatus: formData.batteryStatus || '100',
                batteryCapacity: formData.batteryCapacity || '0',
                rangeKm: Number(formData.rangeKm) || 0
            };

            if (showEditModal && editingVehicle && editingVehicle.vehicle_id) {
                // Update existing vehicle (use update endpoint)
                await vehicleService.updateVehicle(editingVehicle.vehicle_id, payload);
                alert('✅ Cập nhật xe thành công!');
            } else {
                // Create new vehicle
                await vehicleService.createVehicle(payload);
                alert('✅ Thêm xe mới thành công!');
            }

            setShowAddModal(false);
            setShowEditModal(false);
            setEditingVehicle(null);
            // refresh
            await fetchVehicles();
        } catch (err) {
            console.error('❌ Error saving vehicle:', err);
            alert(`❌ Lỗi: ${err.message || err}`);
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
            <div className="header">
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
                    borderRadius: '4px',
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
                            filteredVehicles.map(vehicle => {
                                const statusInfo = getStatusInfo(vehicle.status);
                                return (
                                    <tr key={vehicle.id || vehicle.vehicle_id}>
                                        <td><strong>#{vehicle.id}</strong></td>
                                        <td>
                                            <img
                                                src={getCarImageUrl(vehicle)}
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
                                            <span style={{
                                                color: vehicle.battery_status >= 80 ? '#10b981' :
                                                    vehicle.battery_status >= 50 ? '#f59e0b' : '#ef4444',
                                                fontWeight: '600'
                                            }}>
                                                {vehicle.battery_status || 0}
                                            </span>
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
                    borderRadius: '4px',
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
                            {showEditModal ? (
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Trạng thái *</label>
                                        <select
                                            required
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        >
                                            <option value="">Chọn trạng thái</option>
                                            <option value="available">Available</option>
                                            <option value="rented">Rented</option>
                                            <option value="maintenance">Maintenance</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Điểm thuê (Station ID)</label>
                                        <input
                                            type="number"
                                            value={formData.stationId}
                                            onChange={(e) => setFormData({ ...formData, stationId: Number(e.target.value) })}
                                            placeholder="VD: 1"
                                            min="1"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Hãng</label>
                                        <select
                                            value={formData.brand}
                                            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                        >
                                            <option value="">Chọn hãng</option>
                                            <option value="VinFast">VinFast</option>
                                            <option value="BMW">BMW</option>
                                            <option value="Tesla">Tesla</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Màu</label>
                                        <select
                                            value={formData.color}
                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                        >
                                            <option value="">Chọn màu</option>
                                            <option value="White">White</option>
                                            <option value="Black">Black</option>
                                            <option value="Silver">Silver</option>
                                            <option value="Red">Red</option>
                                            <option value="Blue">Blue</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Số ghế</label>
                                        <select
                                            value={formData.seatCount}
                                            onChange={(e) => setFormData({ ...formData, seatCount: Number(e.target.value) })}
                                        >
                                            <option value="">Chọn số ghế</option>
                                            <option value={4}>4</option>
                                            <option value={7}>7</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Phiên bản</label>
                                        <select
                                            value={formData.variant}
                                            onChange={(e) => setFormData({ ...formData, variant: e.target.value })}
                                        >
                                            <option value="">Chọn hạng</option>
                                            <option value="Pro">Pro</option>
                                            <option value="Air">Air</option>
                                            <option value="Plus">Plus</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Pin hiện tại (%)</label>
                                        <input
                                            type="number"
                                            value={formData.batteryStatus}
                                            onChange={(e) => setFormData({ ...formData, batteryStatus: e.target.value })}
                                            min="0"
                                            max="100"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Dung lượng pin (kWh)</label>
                                        <input
                                            type="number"
                                            value={formData.batteryCapacity}
                                            onChange={(e) => setFormData({ ...formData, batteryCapacity: e.target.value })}
                                            step="0.01"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Quãng đường (km)</label>
                                        <input
                                            type="number"
                                            value={formData.rangeKm}
                                            onChange={(e) => setFormData({ ...formData, rangeKm: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Biển số *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.plateNumber}
                                            onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                                            placeholder="VD: EV-0001"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Hãng *</label>
                                        <select
                                            required
                                            value={formData.brand}
                                            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                        >
                                            <option value="">Chọn hãng</option>
                                            <option value="VinFast">VinFast</option>
                                            <option value="BMW">BMW</option>
                                            <option value="Tesla">Tesla</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Màu *</label>
                                        <select
                                            required
                                            value={formData.color}
                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                        >
                                            <option value="">Chọn màu</option>
                                            <option value="White">White</option>
                                            <option value="Black">Black</option>
                                            <option value="Silver">Silver</option>
                                            <option value="Red">Red</option>
                                            <option value="Blue">Blue</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Số ghế *</label>
                                        <select
                                            required
                                            value={formData.seatCount}
                                            onChange={(e) => setFormData({ ...formData, seatCount: Number(e.target.value) })}
                                        >
                                            <option value="">Chọn số ghế</option>
                                            <option value={4}>4</option>
                                            <option value={7}>7</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Phiên bản *</label>
                                        <select
                                            required
                                            value={formData.variant}
                                            onChange={(e) => setFormData({ ...formData, variant: e.target.value })}
                                        >
                                            <option value="">Chọn hạng</option>
                                            <option value="Pro">Pro</option>
                                            <option value="Air">Air</option>
                                            <option value="Plus">Plus</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={closeModals}>
                                    Hủy
                                </button>
                                <button type="submit" className="btn-submit">
                                    {showEditModal ? ' Lưu thay đổi' : 'Thêm/ Lưu'}
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
                            <h2>📋 Lịch sử đặt xe {historyVehicle ? `- ${historyVehicle.plate} (ID:${historyVehicle.id})` : ''}</h2>
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
                                    {historyVehicle && (
                                        <div style={{ marginTop: 12, color: '#999', fontSize: 13 }}>
                                            (Vehicle: {historyVehicle.plate} — ID: {historyVehicle.id})
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="vehicle-table" style={{ width: '100%' }}>
                                        <thead>
                                            <tr>
                                                <th>Mã đơn</th>
                                                <th>Hình ảnh</th>
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
                                            {selectedVehicleOrders.map((order, index) => {
                                                // create a small vehicle-like object so getCarImageUrl can resolve a thumbnail
                                                const orderVehicle = {
                                                    brand: order.brand,
                                                    color: order.color,
                                                    seat_count: order.seatCount,
                                                    seatCount: order.seatCount,
                                                    image: ''
                                                };

                                                return (
                                                    <tr key={order.orderId || index}>
                                                        <td style={{ fontFamily: 'monospace', fontSize: '11px' }}>
                                                            {order.orderId ? order.orderId.split('-')[0] + '...' : 'N/A'}
                                                        </td>
                                                        <td>
                                                            <img
                                                                className="order-history-img"
                                                                src={getCarImageUrl(orderVehicle)}
                                                                alt={order.plateNumber || 'vehicle'}
                                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/100x60?text=No+Image'; }}
                                                            />
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
                                                                borderRadius: '4px',
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
                                                );
                                            })}
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
};   // ✅ đóng ngoặc function ở đây

export default VehicleManagement;  // ✅ export ra ngoài