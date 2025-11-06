import React, { useState, useEffect } from 'react';
import { stationService } from '../../services';
import vehicleService from '../../services/vehicleService';
import { formatVariant } from '../../utils/formatVariant';
import './StationManagement.css';

const StationManagement = () => {
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingStation, setEditingStation] = useState(null);
    const [selectedStation, setSelectedStation] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
    const [selectedStationForVehicle, setSelectedStationForVehicle] = useState(null);
    const [vehicleFormData, setVehicleFormData] = useState({
        plateNumber: '',
        vehicleName: '',
        color: '',
        seatCount: '',
        variant: ''
    });
    const [stationVehicles, setStationVehicles] = useState([]);
    const [loadingVehicles, setLoadingVehicles] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        city: '',
        district: '',
        ward: '',
        street: ''
    });

    // Fetch stations on component mount
    useEffect(() => {
        fetchStations();
    }, []);

    const fetchStations = async () => {
        try {
            setLoading(true);
            const response = await stationService.getAllStations();

            console.log('🔍 DEBUG - Raw response:', response);
            console.log('🔍 DEBUG - Response type:', typeof response);
            console.log('🔍 DEBUG - Is Array?', Array.isArray(response));

            // Handle different response formats
            let stationData = [];
            if (Array.isArray(response)) {
                console.log('✅ Response is array');
                stationData = response;
            } else if (response?.data && Array.isArray(response.data)) {
                console.log('✅ Response.data is array');
                stationData = response.data;
            } else if (response?.result && Array.isArray(response.result)) {
                console.log('✅ Response.result is array');
                stationData = response.result;
            } else {
                console.log('❌ Response format unknown:', response);
            }

            console.log('🔍 DEBUG - Station data before mapping:', stationData);
            console.log('🔍 DEBUG - Station data length:', stationData.length);

            // Map stationid -> id for consistency
            stationData = stationData.map(station => {
                console.log('🔍 Mapping station:', station);
                return {
                    ...station,
                    id: station.stationid || station.id
                };
            });

            console.log('✅ Final parsed stations:', stationData);
            console.log('✅ Setting stations state with:', stationData.length, 'items');

            setStations(stationData);
            setError('');

            if (stationData.length === 0) {
                console.warn('⚠️ No stations found in response!');
            }
        } catch (err) {
            console.error('❌ Error fetching stations:', err);
            console.error('❌ Error response:', err.response);
            console.error('❌ Error message:', err.message);
            setError(`Không thể tải danh sách điểm thuê. ${err.message || 'Vui lòng thử lại sau.'}`);
        } finally {
            setLoading(false);
        }
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingStation) {
                const stationId = editingStation.stationid || editingStation.id;
                await stationService.updateStation(stationId, formData);
                alert('✅ Cập nhật điểm thuê thành công!');
            } else {
                await stationService.createStation(formData);
                alert('✅ Thêm điểm thuê mới thành công!');
            }

            fetchStations();
            handleCloseModal();
        } catch (err) {
            console.error('❌ Error saving station:', err);
            alert('❌ Có lỗi xảy ra. Vui lòng thử lại.');
        }
    };

    const handleEdit = (station) => {
        setEditingStation(station);
        setFormData({
            name: station.name || '',
            city: station.city || '',
            district: station.district || '',
            ward: station.ward || '',
            street: station.street || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (stationId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa điểm thuê này?')) {
            return;
        }

        try {
            await stationService.deleteStation(stationId);
            alert('✅ Xóa điểm thuê thành công!');
            fetchStations();
        } catch (err) {
            console.error('❌ Error deleting station:', err);
            alert('❌ Không thể xóa điểm thuê. Vui lòng thử lại.');
        }
    };

    const handleViewDetails = async (station) => {
        setSelectedStation(station);
        setShowDetailModal(true);
        setLoadingVehicles(true);

        try {
            // TODO: Replace with actual API call
            // const vehicles = await vehicleService.getVehiclesByStation(station.stationid || station.id);

            // Mock data for now
            const mockVehicles = [
                {
                    id: 1,
                    plateNumber: '29A-12345',
                    vehicleName: 'VinFast VF e34',
                    color: 'White',
                    seatCount: 4,
                    variant: 'Plus',
                    status: 'AVAILABLE'
                },
                {
                    id: 2,
                    plateNumber: '30B-67890',
                    vehicleName: 'VinFast VF 8',
                    color: 'Black',
                    seatCount: 7,
                    variant: 'Eco',
                    status: 'RENTED'
                }
            ];

            setStationVehicles(mockVehicles);
        } catch (err) {
            console.error('❌ Error fetching vehicles:', err);
            setStationVehicles([]);
        } finally {
            setLoadingVehicles(false);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingStation(null);
        setFormData({
            name: '',
            city: '',
            district: '',
            ward: '',
            street: ''
        });
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            fetchStations();
            return;
        }

        try {
            setLoading(true);
            const response = await stationService.searchStations(searchQuery);
            console.log('✅ Search results:', response);

            let stationData = [];
            if (Array.isArray(response)) {
                stationData = response;
            } else if (response?.data && Array.isArray(response.data)) {
                stationData = response.data;
            }

            // Map stationid -> id
            stationData = stationData.map(station => ({
                ...station,
                id: station.stationid || station.id
            }));

            setStations(stationData);
            setError('');
        } catch (err) {
            console.error('❌ Error searching stations:', err);
            setError('Không thể tìm kiếm. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAddVehicle = (station) => {
        setSelectedStationForVehicle(station);
        setShowAddVehicleModal(true);
    };

    const handleCloseAddVehicleModal = () => {
        setShowAddVehicleModal(false);
        setSelectedStationForVehicle(null);
        setVehicleFormData({
            plateNumber: '',
            vehicleName: '',
            color: '',
            seatCount: '',
            variant: ''
        });
    };

    const handleVehicleInputChange = (e) => {
        const { name, value } = e.target;
        setVehicleFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddVehicle = async (e) => {
        e.preventDefault();

        try {
            const brand = vehicleFormData.vehicleName; // VinFast, BMW, Tesla
            const seatCount = parseInt(vehicleFormData.seatCount);
            
            // ✅ Normalize variant về dạng First-letter capitalized (Air, Plus, Pro)
            const variant = formatVariant(vehicleFormData.variant);

            // Tạo vehicleName theo format: Brand + Số ghế + S + Variant
            // Ví dụ: "VinFast 7S Air", "BMW 4S Plus"
            const seatLabel = seatCount === 4 ? '4S' : '7S';
            const vehicleName = `${brand} ${seatLabel} ${variant}`;

            // Tạo description theo format: Brand EV X-seater, Variant variant
            const seatText = seatCount === 4 ? '4-seater' : '7-seater';
            const description = `${brand} EV ${seatText}, ${variant} variant`;

            // Prepare data to send to backend
            const vehicleData = {
                plateNumber: vehicleFormData.plateNumber,
                stationId: selectedStationForVehicle.stationid || selectedStationForVehicle.id,
                brand: brand,
                vehicleName: vehicleName, // VinFast 7S Air
                color: vehicleFormData.color,
                seatCount: seatCount,
                variant: variant,
                status: 'AVAILABLE',
                description: description, // VinFast EV 7-seater, Air variant
                batteryStatus: '100%', // Thêm % vào
                batteryCapacity: '100 kWh', // Thêm kWh vào
                rangeKm: 500
            };

            console.log('🚗 Adding vehicle:', vehicleData);

            // Call API to add vehicle
            const result = await vehicleService.createVehicle(vehicleData);
            console.log('✅ Vehicle created successfully:', result);

            alert(`✅ Đã thêm xe thành công vào trạm: ${selectedStationForVehicle.name}`);
            handleCloseAddVehicleModal();

            // Refresh station list to show updated vehicle counts
            await fetchStations();
        } catch (err) {
            console.error('❌ Error adding vehicle:', err);
            alert('❌ Có lỗi xảy ra khi thêm xe. Vui lòng thử lại.');
        }
    };

    if (loading) {
        return <div className="station-loading">⏳ Đang tải danh sách điểm thuê...</div>;
    }

    return (
        <div className="station-management">
            <div className="station-header">
                <div>
                    <h1>QUẢN LÝ ĐIỂM THUÊ</h1>
                    <p className="station-subtitle">Quản lý các điểm cho thuê xe điện</p>
                    <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                        type="text"
                        placeholder="Tìm kiếm điểm thuê..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        style={{
                            padding: '10px 15px',
                            borderRadius: '8px',
                            border: '2px solid #e5e7eb',
                            fontSize: '14px',
                            minWidth: '250px'
                        }}
                    />
                    <button
                        className="btn-add-station"
                        onClick={handleSearch}
                        style={{ 
                            background: '#3b82f6',
                            padding: '0px 13px'
                        }}
                    >
                        Tìm kiếm
                    </button>
                </div>
            </div>            {error && (
                <div className="error-message" style={{
                    background: '#fee',
                    border: '2px solid #f44',
                    padding: '20px',
                    borderRadius: '12px',
                    margin: '20px 0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                            ⚠️ Lỗi tải dữ liệu
                        </div>
                        <div style={{ fontSize: '14px', color: '#666' }}>
                            {error}
                        </div>
                        <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                            💡 Kiểm tra: Backend có chạy không? (http://localhost:8080)
                        </div>
                    </div>
                    <button
                        onClick={fetchStations}
                        style={{
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Thử lại
                    </button>
                </div>
            )}

            <div className="station-stats">
                <div className="stat-card">
                    <div className="stat-info">
                        <div className="stat-value">{stations.length}</div>
                        <div className="stat-label">Tổng điểm thuê</div>
                    </div>
                </div>
            </div>

            <div className="station-table-container">
                <table className="station-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>TÊN ĐIỂM THUÊ</th>
                            <th>ĐƯỜNG</th>
                            <th>PHƯỜNG/XÃ</th>
                            <th>QUẬN/HUYỆN</th>
                            <th>THÀNH PHỐ</th>
                            <th>THAO TÁC</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stations.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="no-data" style={{ padding: '40px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '18px', marginBottom: '10px' }}>
                                        Chưa có điểm thuê nào
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#666' }}>
                                        State.stations.length: {stations.length}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
                                        Mở F12 Console để xem debug logs
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            stations.map((station, index) => (
                                <tr key={station.id || index}>
                                    <td>{station.id}</td>
                                    <td className="station-name">{station.name}</td>
                                    <td className="station-address">{station.street || 'N/A'}</td>
                                    <td>{station.ward || 'N/A'}</td>
                                    <td>{station.district || 'N/A'}</td>
                                    <td>{station.city || 'N/A'}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn-add-vehicle"
                                                onClick={() => handleOpenAddVehicle(station)}
                                                title="Thêm xe"
                                                style={{
                                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                    color: 'white',
                                                    padding: '8px 12px',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                                                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                                            >
                                                Thêm xe
                                            </button>
                                            <button
                                                className="btn-view"
                                                onClick={() => handleViewDetails(station)}
                                                title="Quản lý xe"
                                            >
                                                Quản lý
                                            </button>
                                            <button
                                                className="btn-edit"
                                                onClick={() => handleEdit(station)}
                                                title="Chỉnh sửa"
                                            >
                                                Chỉnh sửa
                                            </button>
                                            <button
                                                className="btn-delete"
                                                onClick={() => handleDelete(station.id)}
                                                title="Xóa"
                                            >
                                                Xóa
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingStation ? ' Chỉnh sửa điểm thuê' : ' Thêm điểm thuê mới'}</h2>
                            <button className="modal-close" onClick={handleCloseModal}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="station-form">
                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <label>Tên điểm thuê <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="VD: Trạm EV Hà Nội 1"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Thành phố <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Hà Nội"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Quận/Huyện <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        name="district"
                                        value={formData.district}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Cầu Giấy"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Phường/Xã <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        name="ward"
                                        value={formData.ward}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Dịch Vọng"
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label>Đường <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        name="street"
                                        value={formData.street}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="123 Xuân Thủy"
                                    />
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                                    Hủy
                                </button>
                                <button type="submit" className="btn-submit">
                                    {editingStation ? 'Cập nhật' : ' Thêm mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Vehicle Management Modal */}
            {showDetailModal && selectedStation && (
                <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="modal-content detail-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '1200px' }}>
                        <div className="modal-header">
                            <div>
                                <h2> Quản lý xe - {selectedStation.name}</h2>
                                <p style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                                    {[selectedStation.street, selectedStation.ward, selectedStation.district, selectedStation.city]
                                        .filter(Boolean)
                                        .join(', ')}
                                </p>
                            </div>
                            <button className="modal-close" onClick={() => setShowDetailModal(false)}>✕</button>
                        </div>

                        <div className="detail-content">
                            {loadingVehicles ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                    ⏳ Đang tải danh sách xe...
                                </div>
                            ) : (
                                <div className="station-table-container">
                                    <table className="station-table">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>BIỂN SỐ</th>
                                                <th>TÊN XE</th>
                                                <th>MÀU SẮC</th>
                                                <th>SỐ CHỖ</th>
                                                <th>VARIANT</th>
                                                <th>TRẠNG THÁI</th>
                                                <th>THAO TÁC</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stationVehicles.length === 0 ? (
                                                <tr>
                                                    <td colSpan="8" className="no-data">
                                                        Chưa có xe nào trong trạm này
                                                    </td>
                                                </tr>
                                            ) : (
                                                stationVehicles.map((vehicle, index) => (
                                                    <tr key={vehicle.id || index}>
                                                        <td>{vehicle.id}</td>
                                                        <td style={{ fontWeight: 'bold', color: '#1f2937' }}>{vehicle.plateNumber}</td>
                                                        <td>{vehicle.vehicleName}</td>
                                                        <td>
                                                            <span style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '6px'
                                                            }}>
                                                                {vehicle.color}
                                                                <span style={{
                                                                    width: '16px',
                                                                    height: '16px',
                                                                    borderRadius: '4px',
                                                                    border: '2px solid #ddd',
                                                                    backgroundColor: vehicle.color.toLowerCase()
                                                                }}></span>
                                                            </span>
                                                        </td>
                                                        <td>{vehicle.seatCount} chỗ</td>
                                                        <td>{formatVariant(vehicle.variant)}</td>
                                                        <td>
                                                            <span className={`status-badge ${vehicle.status === 'AVAILABLE' ? 'status-active' :
                                                                vehicle.status === 'RENTED' ? 'status-inactive' :
                                                                    'status-maintenance'
                                                                }`}>
                                                                {vehicle.status === 'AVAILABLE' ? 'Sẵn sàng' :
                                                                    vehicle.status === 'RENTED' ? 'Đang thuê' :
                                                                        vehicle.status}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div className="action-buttons">
                                                                <button
                                                                    className="btn-edit"
                                                                    onClick={() => alert(`Sửa xe: ${vehicle.plateNumber}`)}
                                                                    title="Chỉnh sửa"
                                                                >
                                                                    Chỉnh sửa
                                                                </button>
                                                                <button
                                                                    className="btn-delete"
                                                                    onClick={() => alert(`Xóa xe: ${vehicle.plateNumber}`)}
                                                                    title="Xóa"
                                                                >
                                                                    Xóa
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="detail-actions">
                            <button
                                className="btn-submit"
                                onClick={() => {
                                    setShowDetailModal(false);
                                    handleOpenAddVehicle(selectedStation);
                                }}
                                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                            >
                                Thêm xe mới
                            </button>
                            <button className="btn-cancel" onClick={() => setShowDetailModal(false)}>
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Vehicle Modal */}
            {showAddVehicleModal && selectedStationForVehicle && (
                <div className="modal-overlay" onClick={handleCloseAddVehicleModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2> Thêm xe vào trạm: {selectedStationForVehicle.name}</h2>
                            <button className="modal-close" onClick={handleCloseAddVehicleModal}>✕</button>
                        </div>

                        <form onSubmit={handleAddVehicle} className="station-form">
                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <label>Biển số xe <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        name="plateNumber"
                                        value={vehicleFormData.plateNumber}
                                        onChange={handleVehicleInputChange}
                                        required
                                        placeholder="VD: 29A-12345"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Hãng xe <span className="required">*</span></label>
                                    <select
                                        name="vehicleName"
                                        value={vehicleFormData.vehicleName}
                                        onChange={handleVehicleInputChange}
                                        required
                                    >
                                        <option value="">-- Chọn hãng xe --</option>
                                        <option value="VinFast">VinFast</option>
                                        <option value="BMW">BMW</option>
                                        <option value="Tesla">Tesla</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Màu sắc <span className="required">*</span></label>
                                    <select
                                        name="color"
                                        value={vehicleFormData.color}
                                        onChange={handleVehicleInputChange}
                                        required
                                    >
                                        <option value="">-- Chọn màu --</option>
                                        <option value="White">Trắng ⬜</option>
                                        <option value="Black">Đen ⬛</option>
                                        <option value="Silver">Bạc 🔲</option>
                                        <option value="Red">Đỏ 🟥</option>
                                        <option value="Blue">Xanh dương 🟦</option>
                                        <option value="Gray">Xám ⬜</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Số chỗ ngồi <span className="required">*</span></label>
                                    <select
                                        name="seatCount"
                                        value={vehicleFormData.seatCount}
                                        onChange={handleVehicleInputChange}
                                        required
                                    >
                                        <option value="">-- Chọn số chỗ --</option>
                                        <option value="4">4 chỗ</option>
                                        <option value="7">7 chỗ</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Variant <span className="required">*</span></label>
                                    <select
                                        name="variant"
                                        value={vehicleFormData.variant}
                                        onChange={handleVehicleInputChange}
                                        required
                                    >
                                        <option value="">-- Chọn variant --</option>
                                        <option value="Air">Air</option>
                                        <option value="Plus">Plus</option>
                                        <option value="Pro">Pro</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn-cancel" onClick={handleCloseAddVehicleModal}>
                                    Hủy
                                </button>
                                <button type="submit" className="btn-submit">
                                    Thêm xe
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StationManagement;
