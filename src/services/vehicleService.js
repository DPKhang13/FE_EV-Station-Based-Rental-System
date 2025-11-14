// Service để kết nối với Vehicle API
// Import images at top
import image4Seater from '../assets/4standard.jpg';
import image7Seater from '../assets/7standard.jpg';

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Lấy danh sách tất cả xe từ API
 * @returns {Promise<Array>} Danh sách xe
 */
export const getVehicles = async () => {
    try {
        const token = localStorage.getItem('accessToken');

        console.log('🚀 [API] Đang gọi API:', `${API_BASE_URL}/vehicles/get`);
        console.log('🔑 [API] Token:', token ? 'CÓ TOKEN ✅' : 'KHÔNG CÓ TOKEN (OK - API này không cần token)');

        // API GET /api/vehicles/get KHÔNG CẦN authentication theo docs
        // Nhưng vẫn gửi token nếu có (để lấy thêm info nếu logged in)
        const headers = {
            'Content-Type': 'application/json'
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/vehicles/get`, {
            method: 'GET',
            headers: headers
        });

        console.log('📡 [API] Response status:', response.status);
        console.log('📡 [API] Response OK:', response.ok);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ [API] Error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('✅ [API] Nhận được dữ liệu từ backend:', data.length, 'xe');
        console.log('📊 [API] Sample data:', data.length > 0 ? data[0] : 'No data');

        if (!Array.isArray(data)) {
            console.error('❌ [API] Data không phải array:', typeof data);
            return [];
        }

        return data;
    } catch (error) {
        console.error('❌ [API] Lỗi khi gọi API:', error.message);
        console.error('❌ [API] Chi tiết lỗi:', error);
        console.error('❌ [API] Stack:', error.stack);

        // Check if it's CORS error
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            console.error('🚫 [API] Có thể là lỗi CORS! Kiểm tra backend CORS config');
        }

        throw error;
    }
};

/**
 * Chuyển đổi dữ liệu từ API thành format của frontend
 * @param {Object} apiVehicle - Dữ liệu xe từ API
 * @returns {Object} Dữ liệu xe theo format frontend
 */
export const transformVehicleData = (apiVehicle) => {

    // ✅ CHỈ dựa vào seatCount từ API để xác định type
    const seatCount = apiVehicle.seatCount || 4;
    const is7Seater = seatCount >= 7;
    const vehicleType = is7Seater ? '7-seater' : '4-seater';

    // ✅ Xử lý variant - API trả về trong field "variant"
    const variantValue = apiVehicle.variant;

    // ✅ Xử lý màu sắc
    let carColor = apiVehicle.color;
    if (!carColor || carColor === 'null' || carColor === 'undefined') {
        carColor = null;
    }

    // ✅ Xử lý status - API trả về UPPERCASE
    const statusValue = mapStatus(apiVehicle.status);

    // Map API data to frontend format
    const transformed = {
        id: apiVehicle.vehicleId,
        vehicle_id: apiVehicle.vehicleId.toString(),
        vehicle_name: apiVehicle.vehicleName,
        brand: apiVehicle.brand,
        name: apiVehicle.vehicleName,
        image: is7Seater ? image7Seater : image4Seater,
        type: vehicleType,
        seat_count: seatCount,
        seatCount: seatCount,
        grade: variantValue,        // ✅ Dùng trực tiếp từ API
        variant: variantValue,      // ✅ Dùng trực tiếp từ API
        color: carColor,
        year_of_manufacture: apiVehicle.year,
        plate_number: apiVehicle.plateNumber,
        status: statusValue,        // ✅ Đã map sang 'Available'
        description: apiVehicle.description,
        branch: apiVehicle.stationId?.toString() || '1',
        stationId: apiVehicle.stationId,
        stationName: apiVehicle.stationName,
        transmission: apiVehicle.transmission,
        battery_status: apiVehicle.batteryStatus,
        battery_capacity: apiVehicle.batteryCapacity,
        range_km: apiVehicle.rangeKm,
        pricingRuleId: apiVehicle.pricingRuleId
    };

    return transformed;
};

/**
 * Map status từ API sang format frontend
 * ✅ GIỮ NGUYÊN status BOOKED, RENTAL, CHECKING để FE có thể hiển thị và xử lý timeline
 */
const mapStatus = (apiStatus) => {
    if (!apiStatus) return 'Available';
    
    // Normalize về uppercase để so sánh
    const normalized = apiStatus.toUpperCase();
    
    // Chỉ map các status cơ bản, giữ nguyên BOOKED/RENTAL/CHECKING
    const statusMap = {
        'AVAILABLE': 'Available',
        'RENTED': 'Rented', 
        'MAINTENANCE': 'Maintenance',
        'RESERVED': 'Reserved'
    };
    
    // Nếu có trong map thì map, không thì giữ nguyên (cho BOOKED, RENTAL, CHECKING, etc.)
    return statusMap[normalized] || apiStatus;
};

/**
 * Lấy và transform tất cả xe
 */
export const fetchAndTransformVehicles = async () => {
    try {
        const vehicles = await getVehicles();
        const transformed = vehicles.map(transformVehicleData);

        // ✅ DEBUG: In ra 3 xe đầu tiên để kiểm tra
        console.log('🎯 [Transform] Sample 3 xe đầu tiên sau transform:');
        transformed.slice(0, 3).forEach(car => {
            console.log(`   ${car.plate_number}: type="${car.type}", variant="${car.variant}", status="${car.status}", stationId=${car.stationId}`);
        });

        return transformed;
    } catch (error) {
        console.error('Lỗi khi fetch và transform vehicles:', error);
        return [];
    }
};

/**
 * Tạo xe mới
 * @param {Object} vehicleData - Dữ liệu xe cần tạo
 * @returns {Promise<Object>} Xe vừa tạo
 */
export const createVehicle = async (vehicleData) => {
    try {
        const token = localStorage.getItem('accessToken');

        console.log('🚀 [API] Đang tạo xe mới:', vehicleData);

        const response = await fetch(`${API_BASE_URL}/vehicles/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(vehicleData)
        });

        console.log('📡 [API] Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ [API] Error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('✅ [API] Xe đã được tạo:', data);

        return data;
    } catch (error) {
        console.error('❌ [API] Lỗi khi tạo xe:', error);
        throw error;
    }
};

/**
 * Xóa xe
 * @param {number} vehicleId - ID của xe cần xóa
 * @returns {Promise<void>}
 */
export const deleteVehicle = async (vehicleId) => {
    try {
        const token = localStorage.getItem('accessToken');

        console.log('🗑️ [API] Đang xóa xe ID:', vehicleId);

        const response = await fetch(`${API_BASE_URL}/vehicles/deleted/${vehicleId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('📡 [API] Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ [API] Error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        console.log('✅ [API] Xe đã được xóa thành công');
        return true;
    } catch (error) {
        console.error('❌ [API] Lỗi khi xóa xe:', error);
        throw error;
    }
};

/**
 * Lấy danh sách xe theo stationId
 * @param {Number} stationId - ID của trạm
 * @returns {Promise<Array>} Danh sách xe trong trạm
 */
export const getVehiclesByStation = async (stationId) => {
    try {
        const token = localStorage.getItem('accessToken');

        console.log('🚀 [API] Đang lấy xe theo trạm:', stationId);

        const response = await fetch(`${API_BASE_URL}/vehicles/get`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('📡 [API] Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ [API] Error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('✅ [API] Tất cả xe:', data.length);

        // Lọc xe theo stationId
        const filteredVehicles = data.filter(vehicle => vehicle.stationId === stationId);
        console.log('✅ [API] Xe của trạm', stationId, ':', filteredVehicles.length, 'xe');

        return filteredVehicles;
    } catch (error) {
        console.error('❌ [API] Lỗi khi lấy xe theo trạm:', error);
        throw error;
    }
};

/**
 * Cập nhật thông tin xe
 * @param {Number} vehicleId - ID của xe
 * @param {Object} vehicleData - Dữ liệu xe cần cập nhật
 * @returns {Promise<Object>} Xe đã cập nhật
 */
export const updateVehicle = async (vehicleId, vehicleData) => {
    try {
        const token = localStorage.getItem('accessToken');

        console.log('🚀 [API] Đang cập nhật xe:', vehicleId, vehicleData);

        const response = await fetch(`${API_BASE_URL}/vehicles/update/${vehicleId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(vehicleData)
        });

        console.log('📡 [API] Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ [API] Error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('✅ [API] Xe đã được cập nhật:', data);

        return data;
    } catch (error) {
        console.error('❌ [API] Lỗi khi cập nhật xe:', error);
        throw error;
    }
};

/**
 * Cập nhật trạng thái và/hoặc pin của xe
 * @param {Number} vehicleId - ID của xe
 * @param {Object} statusData - { status?: string, batteryStatus?: string }
 * @returns {Promise<Object>} Xe đã cập nhật
 */
export const updateVehicleStatus = async (vehicleId, statusData) => {
    try {
        const token = localStorage.getItem('accessToken');

        console.log('🚀 [API] Đang cập nhật trạng thái xe:', vehicleId, statusData);

        const response = await fetch(`${API_BASE_URL}/vehicles/updateStatus/${vehicleId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(statusData)
        });

        console.log('📡 [API] Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ [API] Error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('✅ [API] Trạng thái xe đã được cập nhật:', data);

        return data;
    } catch (error) {
        console.error('❌ [API] Lỗi khi cập nhật trạng thái xe:', error);
        throw error;
    }
};

/**
 * Lấy chi tiết một xe theo vehicleId
 * @param {Number} vehicleId - ID của xe
 * @returns {Promise<Object>} Chi tiết xe
 */
export const getVehicleDetail = async (vehicleId) => {
    try {
        const token = localStorage.getItem('accessToken');

        console.log('🚀 [API] Đang lấy chi tiết xe:', vehicleId);

        const response = await fetch(`${API_BASE_URL}/vehicles/${vehicleId}/detail`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('📡 [API] Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ [API] Error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('✅ [API] Chi tiết xe:', data);

        return data;
    } catch (error) {
        console.error('❌ [API] Lỗi khi lấy chi tiết xe:', error);
        throw error;
    }
};

/**
 * Lấy lịch sử đặt xe theo vehicleId
 * @param {Number} vehicleId - ID của xe
 * @returns {Promise<Array>} Danh sách lịch sử đặt xe
 */
export const getVehicleOrderHistory = async (vehicleId) => {
    try {
        const token = localStorage.getItem('accessToken');

        console.log('🚀 [API] Đang lấy lịch sử đặt xe:', vehicleId);

        // Validate vehicleId
        const idNum = Number(vehicleId);
        if (!Number.isFinite(idNum) || idNum <= 0) {
            throw new Error('Invalid or missing vehicleId for getVehicleOrderHistory');
        }

        const response = await fetch(`${API_BASE_URL}/order/vehicle/${encodeURIComponent(idNum)}/history`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('📡 [API] Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ [API] Error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        // Normalize response: some backends wrap array in { value: [...], Count: n }
        console.log('✅ [API] Lịch sử đặt xe (raw):', data);

        if (Array.isArray(data)) {
            return data;
        }

        if (data && Array.isArray(data.value)) {
            return data.value;
        }

        // fallback to empty array to keep frontend safe
        return [];
    } catch (error) {
        console.error('❌ [API] Lỗi khi lấy lịch sử đặt xe:', error);
        throw error;
    }
};

// Default export cho vehicleService object
const vehicleService = {
    getVehicles,
    transformVehicleData,
    fetchAndTransformVehicles,
    createVehicle,
    deleteVehicle,
    getVehiclesByStation,
    updateVehicle,
    updateVehicleStatus,
    getVehicleDetail,
    getVehicleOrderHistory
};

export default vehicleService;
