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

// Default export cho vehicleService object
const vehicleService = {
    getVehicles,
    transformVehicleData,
    fetchAndTransformVehicles,
    createVehicle
};

export default vehicleService;
