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
    // Map API data to frontend format
    return {
        id: apiVehicle.vehicleId,
        vehicle_id: apiVehicle.vehicleId.toString(),
        vehicle_name: apiVehicle.vehicleName,
        brand: apiVehicle.brand,
        name: apiVehicle.vehicleName,
        // Xác định image dựa vào số ghế
        image: getVehicleImage(apiVehicle.seatCount),
        // Xác định type dựa vào số ghế
        type: apiVehicle.seatCount <= 5 ? '4-seater' : '7-seater',
        seat_count: apiVehicle.seatCount,
        grade: apiVehicle.variant,
        color: apiVehicle.color,
        year_of_manufacture: apiVehicle.year,
        plate_number: apiVehicle.plateNumber,
        status: mapStatus(apiVehicle.status),
        description: apiVehicle.description,
        branch: apiVehicle.stationId?.toString() || '1',
        transmission: apiVehicle.transmission,
        variant: apiVehicle.variant,
        battery_status: apiVehicle.batteryStatus,
        battery_capacity: apiVehicle.batteryCapacity,
        range_km: apiVehicle.rangeKm,
        // Thông tin bổ sung
        stationId: apiVehicle.stationId,
        stationName: apiVehicle.stationName,
        pricingRuleId: apiVehicle.pricingRuleId
    };
};

/**
 * Map status từ API sang format frontend
 */
const mapStatus = (apiStatus) => {
    // API trả về lowercase: 'available', 'rented', 'maintenance'
    const statusMap = {
        'available': 'Available',
        'rented': 'Rented',
        'maintenance': 'Maintenance',
        'reserved': 'Reserved',
        // Fallback cho uppercase (nếu có)
        'AVAILABLE': 'Available',
        'RENTED': 'Rented',
        'MAINTENANCE': 'Maintenance',
        'RESERVED': 'Reserved'
    };
    return statusMap[apiStatus] || apiStatus;
};

/**
 * Lấy image phù hợp dựa vào số ghế
 */
const getVehicleImage = (seatCount) => {
    // Use imported images (ES6 style)
    return seatCount <= 5 ? image4Seater : image7Seater;
};

/**
 * Lấy và transform tất cả xe
 */
export const fetchAndTransformVehicles = async () => {
    try {
        const vehicles = await getVehicles();
        return vehicles.map(transformVehicleData);
    } catch (error) {
        console.error('Lỗi khi fetch và transform vehicles:', error);
        // Trả về array rỗng nếu có lỗi
        return [];
    }
};

// Default export cho vehicleService object
const vehicleService = {
    getVehicles,
    transformVehicleData,
    fetchAndTransformVehicles
};

export default vehicleService;
