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
    const [showEditVehicleModal, setShowEditVehicleModal] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [showOrderHistoryModal, setShowOrderHistoryModal] = useState(false);
    const [selectedVehicleForHistory, setSelectedVehicleForHistory] = useState(null);
    const [orderHistory, setOrderHistory] = useState([]);
    const [loadingOrderHistory, setLoadingOrderHistory] = useState(false);

    // Vehicle details modal state
    const [showVehicleDetailsModal, setShowVehicleDetailsModal] = useState(false);
    const [vehicleDetails, setVehicleDetails] = useState(null);
    const [loadingVehicleDetails, setLoadingVehicleDetails] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        city: '',
        district: '',
        ward: '',
        street: ''
    });

    // Local car image mapping (same logic as VehicleManagement) to show thumbnails
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
    };

    const getCarImageUrl = (vehicle) => {
        if (!vehicle) return 'https://via.placeholder.com/100x60?text=No+Image';
        const brand = (vehicle.brand || '').toLowerCase().replace(/\s+/g, '');
        const seat = String(vehicle.seat_count || vehicle.seatCount || '4');
        let colorRaw = (vehicle.color || '').toLowerCase().trim();

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

        const tryLookup = (b, s, c) => {
            try {
                return carImageMap?.[b]?.[s]?.[c];
            } catch {
                return undefined;
            }
        };

        let url = tryLookup(brand, seat, colorRaw);
        if (!url) {
            const normalize = (str) => str.normalize ? str.normalize('NFD').replace(/\p{Diacritic}/gu, '') : str;
            const colorNoAcc = normalize(colorRaw);
            const bucket = carImageMap?.[brand]?.[seat] || {};
            for (const key of Object.keys(bucket)) {
                if (normalize(key) === colorNoAcc) {
                    url = bucket[key];
                    break;
                }
            }
        }

        return url || vehicle.image || 'https://via.placeholder.com/100x60?text=No+Image';
    };

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
            const stationId = station.stationid || station.id;
            console.log('🔍 Fetching vehicles for station ID:', stationId);

            // Lấy xe từ API theo stationId
            const vehicles = await vehicleService.getVehiclesByStation(stationId);
            console.log('✅ Xe trong trạm:', vehicles.length, 'xe');
            console.log('📋 Vehicle list:', vehicles);

            setStationVehicles(vehicles);
        } catch (err) {
            console.error('❌ Error fetching vehicles:', err);
            setStationVehicles([]);
            alert('❌ Không thể tải danh sách xe. Vui lòng thử lại.');
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

    const handleEditVehicle = (vehicle) => {
        console.log('🔍 Editing vehicle object:', vehicle);
        setEditingVehicle(vehicle);
        setVehicleFormData({
            plateNumber: vehicle.plateNumber,
            vehicleName: vehicle.brand || 'VinFast',
            color: vehicle.color || 'White',
            seatCount: vehicle.seatCount || 4,
            variant: vehicle.variant || 'AIR',
            status: vehicle.status || 'AVAILABLE',
            batteryStatus: vehicle.batteryStatus || '100%',
            batteryCapacity: vehicle.batteryCapacity || '100 kWh'
        });
        setShowEditVehicleModal(true);
    };

    const handleCloseEditVehicleModal = () => {
        setShowEditVehicleModal(false);
        setEditingVehicle(null);
        setVehicleFormData({
            plateNumber: '',
            vehicleName: '',
            color: '',
            seatCount: '',
            variant: ''
        });
    };

    const handleUpdateVehicle = async (e) => {
        e.preventDefault();

        try {
            const brand = vehicleFormData.vehicleName;
            const seatCount = parseInt(vehicleFormData.seatCount);
            const variant = vehicleFormData.variant.toUpperCase();

            const seatLabel = seatCount === 4 ? '4S' : '7S';
            const vehicleName = `${brand} ${seatLabel} ${variant}`;

            const seatText = seatCount === 4 ? '4-seater' : '7-seater';
            const description = `${brand} EV ${seatText}, ${variant} variant`;

            const vehicleData = {
                plateNumber: vehicleFormData.plateNumber,
                stationId: editingVehicle.stationId, // Thêm stationId từ xe đang edit
                brand: brand,
                vehicleName: vehicleName,
                color: vehicleFormData.color,
                seatCount: seatCount,
                variant: variant,
                status: vehicleFormData.status,
                description: description,
                batteryStatus: vehicleFormData.batteryStatus,
                batteryCapacity: vehicleFormData.batteryCapacity,
                rangeKm: 500
            };

            const vehicleId = editingVehicle.vehicleId || editingVehicle.id;
            console.log('🔧 Updating vehicle ID:', vehicleId, 'Data:', vehicleData);

            if (!vehicleId) {
                throw new Error('Vehicle ID not found!');
            }

            const result = await vehicleService.updateVehicle(vehicleId, vehicleData);
            console.log('✅ Vehicle updated successfully:', result);

            // Đóng modal edit
            handleCloseEditVehicleModal();

            // Refresh danh sách xe (modal detail vẫn mở)
            if (selectedStation) {
                const stationId = selectedStation.stationid || selectedStation.id;
                console.log('🔄 Refreshing vehicle list for station:', stationId);
                const vehicles = await vehicleService.getVehiclesByStation(stationId);
                console.log('✅ Refreshed:', vehicles.length, 'xe');
                setStationVehicles(vehicles);
            }

            alert(`✅ Đã cập nhật xe ${vehicleFormData.plateNumber} thành công!`);
        } catch (err) {
            console.error('❌ Error updating vehicle:', err);
            alert('❌ Có lỗi xảy ra khi cập nhật xe. Vui lòng thử lại.');
        }
    };

    const handleDeleteVehicle = async (vehicle) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa xe ${vehicle.plateNumber}?`)) {
            return;
        }

        try {
            const vehicleId = vehicle.vehicleId || vehicle.id;
            console.log('🗑️ Deleting vehicle ID:', vehicleId);

            if (!vehicleId) {
                throw new Error('Vehicle ID not found!');
            }

            await vehicleService.deleteVehicle(vehicleId);
            console.log('✅ Vehicle deleted successfully');

            // Refresh danh sách xe
            if (selectedStation) {
                const stationId = selectedStation.stationid || selectedStation.id;
                console.log('🔄 Refreshing vehicle list for station:', stationId);
                const vehicles = await vehicleService.getVehiclesByStation(stationId);
                console.log('✅ Refreshed:', vehicles.length, 'xe');
                setStationVehicles(vehicles);
            }

            alert(`✅ Đã xóa xe ${vehicle.plateNumber} thành công!`);
        } catch (err) {
            console.error('❌ Error deleting vehicle:', err);
            alert('❌ Có lỗi xảy ra khi xóa xe. Vui lòng thử lại.');
        }
    };

    const handleViewOrderHistory = async (vehicle) => {
        setSelectedVehicleForHistory(vehicle);
        setShowOrderHistoryModal(true);
        setLoadingOrderHistory(true);

        try {
            const vehicleId = vehicle.vehicleId || vehicle.id;
            console.log('📜 Fetching order history for vehicle ID:', vehicleId);

            const history = await vehicleService.getVehicleOrderHistory(vehicleId);
            console.log('✅ Order history:', history);

            setOrderHistory(history);
        } catch (err) {
            console.error('❌ Error fetching order history:', err);
            setOrderHistory([]);
            alert('❌ Không thể tải lịch sử đặt xe. Vui lòng thử lại.');
        } finally {
            setLoadingOrderHistory(false);
        }
    };

    // Fetch full vehicle details (from GET /api/vehicles/get) and show modal
    const handleShowVehicleDetails = async (vehicle) => {
        setShowVehicleDetailsModal(true);
        setVehicleDetails(null);
        setLoadingVehicleDetails(true);

        try {
            const vehicleId = vehicle.vehicleId || vehicle.id;
            console.log('🔍 Fetching full vehicle list to locate vehicle ID:', vehicleId);

            const resp = await vehicleService.getVehicles();
            let list = [];
            if (Array.isArray(resp)) list = resp;
            else if (resp?.data && Array.isArray(resp.data)) list = resp.data;
            else if (resp?.result && Array.isArray(resp.result)) list = resp.result;

            const found = list.find(v => String(v.vehicleId) === String(vehicleId) || String(v.id) === String(vehicleId) || (v.plateNumber && v.plateNumber === vehicle.plateNumber));
            if (found) {
                setVehicleDetails(found);
            } else {
                // Fallback: show the passed-in object
                setVehicleDetails(vehicle);
            }
        } catch (err) {
            console.error('❌ Error fetching vehicle details:', err);
            setVehicleDetails(vehicle);
        } finally {
            setLoadingVehicleDetails(false);
        }
    };

    const handleCloseOrderHistoryModal = () => {
        setShowOrderHistoryModal(false);
        setSelectedVehicleForHistory(null);
        setOrderHistory([]);
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
                                                <th>HÌNH ẢNH</th>
                                                <th>BIỂN SỐ</th>
                                                <th>TÊN XE</th>
                                                <th>MÀU SẮC</th>
                                                <th>SỐ CHỖ</th>
                                                <th>Loại xe</th>
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
                                                        <td>
                                                            <img
                                                                src={getCarImageUrl(vehicle)}
                                                                alt={vehicle.vehicleName || vehicle.plateNumber}
                                                                style={{ width: 84, height: 50, objectFit: 'cover', borderRadius: 4 }}
                                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/100x60?text=No+Image'; }}
                                                            />
                                                        </td>
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
                                                                    className="btn-view"
                                                                    onClick={() => handleShowVehicleDetails(vehicle)}
                                                                    title="Xem chi tiết xe"
                                                                    style={{
                                                                        background: '#dbeafe',
                                                                        color: '#1e40af',
                                                                        padding: '8px 12px',
                                                                        border: 'none',
                                                                        borderRadius: '6px',
                                                                        cursor: 'pointer',
                                                                        fontSize: '14px',
                                                                        fontWeight: '600'
                                                                    }}
                                                                >
                                                                    Xem chi tiết
                                                                </button>
                                                                <button
                                                                    className="btn-edit"
                                                                    onClick={() => handleEditVehicle(vehicle)}
                                                                    title="Chỉnh sửa"
                                                                >
                                                                    Chỉnh sửa
                                                                </button>
                                                                <button
                                                                    className="btn-delete"
                                                                    onClick={() => handleDeleteVehicle(vehicle)}
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

                        {/* Preview based on selected brand/color/seat */}
                        {/* Reduce horizontal padding and let image be responsive to remove white side bars */}
                        <div style={{ textAlign: 'center', padding: '12px 0 0 0', width: '100%' }}>
                            {(() => {
                                const previewVehicle = {
                                    brand: vehicleFormData.vehicleName,
                                    color: vehicleFormData.color,
                                    seatCount: Number(vehicleFormData.seatCount) || 4,
                                    image: ''
                                };
                                return (
                                    <img
                                        src={getCarImageUrl(previewVehicle)}
                                        alt="Preview"
                                        style={{
                                            width: '35%',
                                            maxWidth: 720,
                                            height: 'auto',
                                            objectFit: 'contain',
                                            borderRadius: 8,
                                            border: '1px solid #eee',
                                            background: 'transparent',
                                            boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
                                            display: 'block',
                                            margin: '0 auto'
                                        }}
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/420x400?text=No+Image'; }}
                                    />
                                );
                            })()}
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
                                    <label>Loại xe <span className="required">*</span></label>
                                    <select
                                        name="variant"
                                        value={vehicleFormData.variant}
                                        onChange={handleVehicleInputChange}
                                        required
                                    >
                                        <option value="">-- Chọn loại xe --</option>
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

            {/* Edit Vehicle Modal */}
            {showEditVehicleModal && editingVehicle && (
                <div className="modal-overlay" onClick={handleCloseEditVehicleModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>🔧 Chỉnh sửa xe: {editingVehicle.plateNumber}</h2>
                            <button className="modal-close" onClick={handleCloseEditVehicleModal}>✕</button>
                        </div>

                        {/* Preview for edit modal */}
                        {/* Reduce horizontal padding and let image be responsive to remove white side bars */}
                        <div style={{ textAlign: 'center', padding: '12px 0 0 0', width: '100%' }}>
                            {(() => {
                                const previewVehicle = {
                                    brand: vehicleFormData.vehicleName || editingVehicle.brand,
                                    color: vehicleFormData.color || editingVehicle.color,
                                    seatCount: Number(vehicleFormData.seatCount) || editingVehicle.seatCount || 4,
                                    image: editingVehicle.image || ''
                                };
                                return (
                                    <img
                                        src={getCarImageUrl(previewVehicle)}
                                        alt="Preview"
                                        style={{
                                            width: '35%',
                                            maxWidth: 720,
                                            height: 'auto',
                                            objectFit: 'contain',
                                            borderRadius: 8,
                                            border: '1px solid #eee',
                                            background: 'transparent',
                                            boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
                                            display: 'block',
                                            margin: '0 auto'
                                        }}
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/420x400?text=No+Image'; }}
                                    />
                                );
                            })()}
                        </div>

                        <form onSubmit={handleUpdateVehicle} className="station-form">
                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <label>Biển số xe <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        name="plateNumber"
                                        value={vehicleFormData.plateNumber}
                                        onChange={handleVehicleInputChange}
                                        required
                                        disabled
                                        style={{ background: '#f3f4f6', cursor: 'not-allowed' }}
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
                                    <label>Loại xe <span className="required">*</span></label>
                                    <select
                                        name="variant"
                                        value={vehicleFormData.variant}
                                        onChange={handleVehicleInputChange}
                                        required
                                    >
                                        <option value="">-- Chọn loại xe --</option>
                                        <option value="AIR">Air</option>
                                        <option value="PLUS">Plus</option>
                                        <option value="PRO">Pro</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Trạng thái <span className="required">*</span></label>
                                    <select
                                        name="status"
                                        value={vehicleFormData.status}
                                        onChange={handleVehicleInputChange}
                                        required
                                    >
                                        <option value="">-- Chọn trạng thái --</option>
                                        <option value="AVAILABLE">Sẵn sàng</option>
                                        <option value="RENTED">Đang thuê</option>
                                        <option value="MAINTENANCE">Bảo trì</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Pin hiện tại (%)</label>
                                    <input
                                        type="text"
                                        name="batteryStatus"
                                        value={vehicleFormData.batteryStatus}
                                        onChange={handleVehicleInputChange}
                                        placeholder="VD: 100%"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Dung lượng pin (kWh)</label>
                                    <input
                                        type="text"
                                        name="batteryCapacity"
                                        value={vehicleFormData.batteryCapacity}
                                        onChange={handleVehicleInputChange}
                                        placeholder="VD: 100 kWh"
                                    />
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn-cancel" onClick={handleCloseEditVehicleModal}>
                                    Hủy
                                </button>
                                <button type="submit" className="btn-submit">
                                    Cập nhật
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Order History Modal */}
            {showOrderHistoryModal && selectedVehicleForHistory && (
                <div className="modal-overlay" onClick={handleCloseOrderHistoryModal}>
                    <div className="modal-content detail-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>📜 Lịch sử đặt xe: {selectedVehicleForHistory.plateNumber}</h2>
                            <button className="modal-close" onClick={handleCloseOrderHistoryModal}>✕</button>
                        </div>

                        <div className="detail-content">
                            {loadingOrderHistory ? (
                                <div style={{ textAlign: 'center', padding: '40px' }}>
                                    <div style={{ fontSize: '18px', marginBottom: '10px' }}>⏳ Đang tải lịch sử...</div>
                                </div>
                            ) : orderHistory.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px' }}>
                                    <div style={{ fontSize: '18px', marginBottom: '10px' }}>📭 Chưa có lịch sử đặt xe</div>
                                    <div style={{ fontSize: '14px', color: '#666' }}>
                                        Xe này chưa từng được đặt thuê.
                                    </div>
                                </div>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="station-table">
                                        <thead>
                                            <tr>
                                                <th>Mã đơn</th>
                                                <th>Trạm</th>
                                                <th>Thời gian bắt đầu</th>
                                                <th>Thời gian kết thúc</th>
                                                <th>Trạng thái</th>
                                                <th>Tổng tiền</th>
                                                <th>Đặt cọc</th>
                                                <th>Còn lại</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orderHistory.map((order, index) => (
                                                <tr key={index}>
                                                    <td style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                                                        {order.orderId.substring(0, 8)}...
                                                    </td>
                                                    <td>{order.stationName || 'N/A'}</td>
                                                    <td>{new Date(order.startTime).toLocaleString('vi-VN')}</td>
                                                    <td>{new Date(order.endTime).toLocaleString('vi-VN')}</td>
                                                    <td>
                                                        <span className={`status-badge ${order.status === 'COMPLETED' ? 'status-active' :
                                                            order.status === 'CANCELLED' ? 'status-inactive' :
                                                                'status-maintenance'
                                                            }`}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td style={{ fontWeight: '600', color: '#059669' }}>
                                                        {order.totalPrice?.toLocaleString('vi-VN')} đ
                                                    </td>
                                                    <td>{order.depositAmount?.toLocaleString('vi-VN')} đ</td>
                                                    <td>{order.remainingAmount?.toLocaleString('vi-VN')} đ</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="detail-actions">
                            <button className="btn-cancel" onClick={handleCloseOrderHistoryModal}>
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Vehicle Details Modal */}
            {showVehicleDetailsModal && (
                <div className="modal-overlay" onClick={() => { setShowVehicleDetailsModal(false); setVehicleDetails(null); }}>
                    <div className="modal-content detail-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>🔍 Thông tin xe</h2>
                            <button className="modal-close" onClick={() => { setShowVehicleDetailsModal(false); setVehicleDetails(null); }}>✕</button>
                        </div>

                        <div className="detail-content">
                            {loadingVehicleDetails ? (
                                <div style={{ textAlign: 'center', padding: '40px' }}>⏳ Đang tải thông tin xe...</div>
                            ) : !vehicleDetails ? (
                                <div style={{ textAlign: 'center', padding: '40px' }}>Không tìm thấy thông tin xe.</div>
                            ) : (
                                <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                                    <div style={{ flex: '0 0 360px', textAlign: 'center' }}>
                                        <img
                                            src={getCarImageUrl(vehicleDetails)}
                                            alt={vehicleDetails.vehicleName || vehicleDetails.plateNumber}
                                            style={{ width: '100%', maxWidth: 360, height: 'auto', objectFit: 'contain', borderRadius: 8 }}
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/420x300?text=No+Image'; }}
                                        />
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <tbody>
                                                <tr>
                                                    <td style={{ padding: '8px 12px', fontWeight: 700, width: 160 }}>Mã xe</td>
                                                    <td style={{ padding: '8px 12px' }}>{vehicleDetails.vehicleId || vehicleDetails.id || 'N/A'}</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ padding: '8px 12px', fontWeight: 700 }}>Biển số</td>
                                                    <td style={{ padding: '8px 12px' }}>{vehicleDetails.plateNumber || 'N/A'}</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ padding: '8px 12px', fontWeight: 700 }}>Tên xe</td>
                                                    <td style={{ padding: '8px 12px' }}>{vehicleDetails.vehicleName || 'N/A'}</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ padding: '8px 12px', fontWeight: 700 }}>Hãng</td>
                                                    <td style={{ padding: '8px 12px' }}>{vehicleDetails.brand || 'N/A'}</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ padding: '8px 12px', fontWeight: 700 }}>Màu</td>
                                                    <td style={{ padding: '8px 12px' }}>{vehicleDetails.color || vehicleDetails.colorName || 'N/A'}</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ padding: '8px 12px', fontWeight: 700 }}>Số chỗ</td>
                                                    <td style={{ padding: '8px 12px' }}>{vehicleDetails.seatCount || vehicleDetails.seat_count || 'N/A'}</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ padding: '8px 12px', fontWeight: 700 }}>Loại xe</td>
                                                    <td style={{ padding: '8px 12px' }}>{formatVariant(vehicleDetails.variant || vehicleDetails.variantName || '')}</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ padding: '8px 12px', fontWeight: 700 }}>Trạng thái</td>
                                                    <td style={{ padding: '8px 12px' }}>{vehicleDetails.status || 'N/A'}</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ padding: '8px 12px', fontWeight: 700 }}>Pin</td>
                                                    <td style={{ padding: '8px 12px' }}>{vehicleDetails.batteryStatus || 'N/A'}</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ padding: '8px 12px', fontWeight: 700 }}>Dung lượng pin</td>
                                                    <td style={{ padding: '8px 12px' }}>{vehicleDetails.batteryCapacity || 'N/A'}</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ padding: '8px 12px', fontWeight: 700 }}>Phạm vi (km)</td>
                                                    <td style={{ padding: '8px 12px' }}>{vehicleDetails.rangeKm || vehicleDetails.range_km || 'N/A'}</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ padding: '8px 12px', fontWeight: 700 }}>Mô tả</td>
                                                    <td style={{ padding: '8px 12px' }}>{vehicleDetails.description || '—'}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="detail-actions">
                            <button className="btn-cancel" onClick={() => { setShowVehicleDetailsModal(false); setVehicleDetails(null); }}>
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
