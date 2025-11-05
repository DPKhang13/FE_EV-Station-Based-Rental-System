import React, { useState, useEffect } from 'react';
import { stationService } from '../../services';
import './StationManagement.css';

const StationManagement = () => {
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingStation, setEditingStation] = useState(null);
    const [selectedStation, setSelectedStation] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const [formData, setFormData] = useState({
        stationName: '',
        address: '',
        city: '',
        district: '',
        ward: '',
        latitude: '',
        longitude: '',
        contactPhone: '',
        contactEmail: '',
        openingHours: '',
        status: 'ACTIVE'
    });

    // Fetch stations on component mount
    useEffect(() => {
        fetchStations();
    }, []);

    const fetchStations = async () => {
        try {
            setLoading(true);
            const response = await stationService.getAllStations();
            console.log('✅ Stations fetched:', response);
            setStations(response.data || response || []);
            setError('');
        } catch (err) {
            console.error('❌ Error fetching stations:', err);
            setError('Không thể tải danh sách điểm thuê. Vui lòng thử lại sau.');
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
                await stationService.updateStation(editingStation.stationId, formData);
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
            stationName: station.stationName || '',
            address: station.address || '',
            city: station.city || '',
            district: station.district || '',
            ward: station.ward || '',
            latitude: station.latitude || '',
            longitude: station.longitude || '',
            contactPhone: station.contactPhone || '',
            contactEmail: station.contactEmail || '',
            openingHours: station.openingHours || '',
            status: station.status || 'ACTIVE'
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

        // Try to fetch additional statistics if available
        try {
            const stats = await stationService.getStationStatistics(station.stationId);
            setSelectedStation(prev => ({ ...prev, ...stats }));
        } catch (err) {
            console.log('ℹ️ Statistics not available');
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingStation(null);
        setFormData({
            stationName: '',
            address: '',
            city: '',
            district: '',
            ward: '',
            latitude: '',
            longitude: '',
            contactPhone: '',
            contactEmail: '',
            openingHours: '',
            status: 'ACTIVE'
        });
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'ACTIVE': { label: 'Hoạt động', className: 'status-active' },
            'INACTIVE': { label: 'Tạm ngưng', className: 'status-inactive' },
            'MAINTENANCE': { label: 'Bảo trì', className: 'status-maintenance' }
        };

        const statusInfo = statusMap[status] || { label: status, className: '' };
        return <span className={`status-badge ${statusInfo.className}`}>{statusInfo.label}</span>;
    };

    if (loading) {
        return <div className="station-loading">⏳ Đang tải danh sách điểm thuê...</div>;
    }

    return (
        <div className="station-management">
            <div className="station-header">
                <div>
                    <h1>📍 Quản lý Điểm Thuê</h1>
                    <p className="station-subtitle">Quản lý các điểm cho thuê xe điện</p>
                </div>
                <button className="btn-add-station" onClick={() => setShowModal(true)}>
                    ➕ Thêm Điểm Thuê
                </button>
            </div>

            {error && (
                <div className="error-message">
                    ⚠️ {error}
                    <button onClick={fetchStations}>🔄 Thử lại</button>
                </div>
            )}

            <div className="station-stats">
                <div className="stat-card">
                    <div className="stat-icon">📍</div>
                    <div className="stat-info">
                        <div className="stat-value">{stations.length}</div>
                        <div className="stat-label">Tổng điểm thuê</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-info">
                        <div className="stat-value">
                            {stations.filter(s => s.status === 'ACTIVE').length}
                        </div>
                        <div className="stat-label">Đang hoạt động</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🚗</div>
                    <div className="stat-info">
                        <div className="stat-value">
                            {stations.reduce((sum, s) => sum + (s.totalVehicles || 0), 0)}
                        </div>
                        <div className="stat-label">Tổng số xe</div>
                    </div>
                </div>
            </div>

            <div className="station-table-container">
                <table className="station-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tên điểm thuê</th>
                            <th>Địa chỉ</th>
                            <th>Thành phố</th>
                            <th>Liên hệ</th>
                            <th>Số xe</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stations.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="no-data">
                                    Chưa có điểm thuê nào
                                </td>
                            </tr>
                        ) : (
                            stations.map(station => (
                                <tr key={station.stationId}>
                                    <td>{station.stationId}</td>
                                    <td className="station-name">{station.stationName}</td>
                                    <td className="station-address">{station.address}</td>
                                    <td>{station.city}</td>
                                    <td>
                                        {station.contactPhone && (
                                            <div>📞 {station.contactPhone}</div>
                                        )}
                                        {station.contactEmail && (
                                            <div className="email-text">✉️ {station.contactEmail}</div>
                                        )}
                                    </td>
                                    <td>
                                        <div className="vehicle-stats">
                                            <span className="total-vehicles">
                                                {station.totalVehicles || 0}
                                            </span>
                                            {station.availableVehicles !== undefined && (
                                                <span className="available-vehicles">
                                                    ({station.availableVehicles} sẵn sàng)
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td>{getStatusBadge(station.status)}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn-view"
                                                onClick={() => handleViewDetails(station)}
                                                title="Xem chi tiết"
                                            >
                                                👁️
                                            </button>
                                            <button
                                                className="btn-edit"
                                                onClick={() => handleEdit(station)}
                                                title="Chỉnh sửa"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="btn-delete"
                                                onClick={() => handleDelete(station.stationId)}
                                                title="Xóa"
                                            >
                                                🗑️
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
                            <h2>{editingStation ? '✏️ Chỉnh sửa điểm thuê' : '➕ Thêm điểm thuê mới'}</h2>
                            <button className="modal-close" onClick={handleCloseModal}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="station-form">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Tên điểm thuê <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        name="stationName"
                                        value={formData.stationName}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="VD: Hanoi EV Station 1"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Trạng thái</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                    >
                                        <option value="ACTIVE">Hoạt động</option>
                                        <option value="INACTIVE">Tạm ngưng</option>
                                        <option value="MAINTENANCE">Bảo trì</option>
                                    </select>
                                </div>

                                <div className="form-group full-width">
                                    <label>Địa chỉ <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="123 Xuan Thuy, Cau Giay"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Thành phố</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        placeholder="Hanoi"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Quận/Huyện</label>
                                    <input
                                        type="text"
                                        name="district"
                                        value={formData.district}
                                        onChange={handleInputChange}
                                        placeholder="Cau Giay"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Phường/Xã</label>
                                    <input
                                        type="text"
                                        name="ward"
                                        value={formData.ward}
                                        onChange={handleInputChange}
                                        placeholder="Dich Vong"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Số điện thoại</label>
                                    <input
                                        type="tel"
                                        name="contactPhone"
                                        value={formData.contactPhone}
                                        onChange={handleInputChange}
                                        placeholder="024-1234567"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        name="contactEmail"
                                        value={formData.contactEmail}
                                        onChange={handleInputChange}
                                        placeholder="station@example.com"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Giờ mở cửa</label>
                                    <input
                                        type="text"
                                        name="openingHours"
                                        value={formData.openingHours}
                                        onChange={handleInputChange}
                                        placeholder="8:00 AM - 10:00 PM"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Vĩ độ</label>
                                    <input
                                        type="number"
                                        step="any"
                                        name="latitude"
                                        value={formData.latitude}
                                        onChange={handleInputChange}
                                        placeholder="21.0285"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Kinh độ</label>
                                    <input
                                        type="number"
                                        step="any"
                                        name="longitude"
                                        value={formData.longitude}
                                        onChange={handleInputChange}
                                        placeholder="105.8542"
                                    />
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                                    Hủy
                                </button>
                                <button type="submit" className="btn-submit">
                                    {editingStation ? '💾 Cập nhật' : '➕ Thêm mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && selectedStation && (
                <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="modal-content detail-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>📍 Chi tiết điểm thuê</h2>
                            <button className="modal-close" onClick={() => setShowDetailModal(false)}>✕</button>
                        </div>

                        <div className="detail-content">
                            <div className="detail-section">
                                <h3>Thông tin cơ bản</h3>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <span className="detail-label">ID:</span>
                                        <span className="detail-value">{selectedStation.stationId}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Tên:</span>
                                        <span className="detail-value">{selectedStation.stationName}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Trạng thái:</span>
                                        {getStatusBadge(selectedStation.status)}
                                    </div>
                                    <div className="detail-item full-width">
                                        <span className="detail-label">Địa chỉ:</span>
                                        <span className="detail-value">{selectedStation.address}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Thành phố:</span>
                                        <span className="detail-value">{selectedStation.city || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Quận:</span>
                                        <span className="detail-value">{selectedStation.district || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h3>Liên hệ</h3>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <span className="detail-label">📞 Điện thoại:</span>
                                        <span className="detail-value">{selectedStation.contactPhone || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">✉️ Email:</span>
                                        <span className="detail-value">{selectedStation.contactEmail || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">🕐 Giờ mở cửa:</span>
                                        <span className="detail-value">{selectedStation.openingHours || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {(selectedStation.totalVehicles !== undefined) && (
                                <div className="detail-section">
                                    <h3>Thống kê xe</h3>
                                    <div className="stats-grid">
                                        <div className="stat-box">
                                            <div className="stat-icon">🚗</div>
                                            <div className="stat-number">{selectedStation.totalVehicles || 0}</div>
                                            <div className="stat-text">Tổng số xe</div>
                                        </div>
                                        <div className="stat-box">
                                            <div className="stat-icon">✅</div>
                                            <div className="stat-number">{selectedStation.availableVehicles || 0}</div>
                                            <div className="stat-text">Sẵn sàng</div>
                                        </div>
                                        <div className="stat-box">
                                            <div className="stat-icon">🚙</div>
                                            <div className="stat-number">{selectedStation.inUseVehicles || 0}</div>
                                            <div className="stat-text">Đang thuê</div>
                                        </div>
                                        <div className="stat-box">
                                            <div className="stat-icon">🔧</div>
                                            <div className="stat-number">{selectedStation.maintenanceVehicles || 0}</div>
                                            <div className="stat-text">Bảo trì</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {(selectedStation.latitude && selectedStation.longitude) && (
                                <div className="detail-section">
                                    <h3>Vị trí</h3>
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <span className="detail-label">Vĩ độ:</span>
                                            <span className="detail-value">{selectedStation.latitude}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Kinh độ:</span>
                                            <span className="detail-value">{selectedStation.longitude}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="detail-actions">
                            <button className="btn-edit" onClick={() => {
                                setShowDetailModal(false);
                                handleEdit(selectedStation);
                            }}>
                                ✏️ Chỉnh sửa
                            </button>
                            <button className="btn-cancel" onClick={() => setShowDetailModal(false)}>
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StationManagement;
