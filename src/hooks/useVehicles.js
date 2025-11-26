import { useState, useEffect } from 'react';
import { fetchAndTransformVehicles } from '../services/vehicleService';

// Import sample images
import image4Seater from '../assets/4standard.jpg';
import image7Seater from '../assets/7standard.jpg';

// Sample data - chỉ dùng khi API fail để demo
const SAMPLE_VEHICLES = [
    // BMW 4-seater
    {
        id: 'demo-bmw-1',
        vehicle_id: 'BMW-001',
        vehicle_name: 'BMW i4 Air',
        brand: 'BMW',
        name: 'BMW i4 Air',
        image: image4Seater,
        type: '4-seater',
        seat_count: 4,
        grade: 'Air',
        color: 'Black',
        year_of_manufacture: 2024,
        plate_number: '30A-11111',
        status: 'Available',
        description: 'BMW i4 điện cao cấp',
        branch: '1',
        transmission: 'Automatic',
        variant: 'Air',
        battery_status: '100%',
        battery_capacity: '80 kWh',
        range_km: 500,
        stationId: 1,
        stationName: 'Hanoi EV Station 1'
    },
    {
        id: 'demo-bmw-2',
        vehicle_id: 'BMW-002',
        vehicle_name: 'BMW i4 Plus',
        brand: 'BMW',
        name: 'BMW i4 Plus',
        image: image4Seater,
        type: '4-seater',
        seat_count: 4,
        grade: 'Plus',
        color: 'White',
        year_of_manufacture: 2024,
        plate_number: '30A-22222',
        status: 'Available',
        description: 'BMW i4 phiên bản Plus',
        branch: '1',
        transmission: 'Automatic',
        variant: 'Plus',
        battery_status: '95%',
        battery_capacity: '80 kWh',
        range_km: 500,
        stationId: 1,
        stationName: 'Hanoi EV Station 1'
    },
    {
        id: 'demo-bmw-3',
        vehicle_id: 'BMW-003',
        vehicle_name: 'BMW i4 Pro',
        brand: 'BMW',
        name: 'BMW i4 Pro',
        image: image4Seater,
        type: '4-seater',
        seat_count: 4,
        grade: 'Pro',
        color: 'Blue',
        year_of_manufacture: 2024,
        plate_number: '30A-33333',
        status: 'Available',
        description: 'BMW i4 phiên bản Pro',
        branch: '1',
        transmission: 'Automatic',
        variant: 'Pro',
        battery_status: '100%',
        battery_capacity: '80 kWh',
        range_km: 500,
        stationId: 1,
        stationName: 'Hanoi EV Station 1'
    },
    // Tesla 4-seater
    {
        id: 'demo-tesla-1',
        vehicle_id: 'TESLA-001',
        vehicle_name: 'Tesla Model 3 Air',
        brand: 'Tesla',
        name: 'Tesla Model 3 Air',
        image: image4Seater,
        type: '4-seater',
        seat_count: 4,
        grade: 'Air',
        color: 'Red',
        year_of_manufacture: 2024,
        plate_number: '51F-11111',
        status: 'Available',
        description: 'Tesla Model 3 tiết kiệm',
        branch: '2',
        transmission: 'Automatic',
        variant: 'Air',
        battery_status: '100%',
        battery_capacity: '60 kWh',
        range_km: 450,
        stationId: 2,
        stationName: 'HCM EV Station 1'
    },
    {
        id: 'demo-tesla-2',
        vehicle_id: 'TESLA-002',
        vehicle_name: 'Tesla Model 3 Plus',
        brand: 'Tesla',
        name: 'Tesla Model 3 Plus',
        image: image4Seater,
        type: '4-seater',
        seat_count: 4,
        grade: 'Plus',
        color: 'White',
        year_of_manufacture: 2024,
        plate_number: '51F-22222',
        status: 'Available',
        description: 'Tesla Model 3 cao cấp hơn',
        branch: '2',
        transmission: 'Automatic',
        variant: 'Plus',
        battery_status: '98%',
        battery_capacity: '70 kWh',
        range_km: 500,
        stationId: 2,
        stationName: 'HCM EV Station 1'
    },
    {
        id: 'demo-tesla-3',
        vehicle_id: 'TESLA-003',
        vehicle_name: 'Tesla Model 3 Pro',
        brand: 'Tesla',
        name: 'Tesla Model 3 Pro',
        image: image4Seater,
        type: '4-seater',
        seat_count: 4,
        grade: 'Pro',
        color: 'Black',
        year_of_manufacture: 2024,
        plate_number: '51F-33333',
        status: 'Available',
        description: 'Tesla Model 3 Performance',
        branch: '2',
        transmission: 'Automatic',
        variant: 'Pro',
        battery_status: '100%',
        battery_capacity: '80 kWh',
        range_km: 550,
        stationId: 2,
        stationName: 'HCM EV Station 1'
    },
    // VinFast 4-seater
    {
        id: 'demo-vinfast-1',
        vehicle_id: 'VF-001',
        vehicle_name: 'VinFast VF5 Air',
        brand: 'VinFast',
        name: 'VinFast VF5 Air',
        image: image4Seater,
        type: '4-seater',
        seat_count: 4,
        grade: 'Air',
        color: 'Silver',
        year_of_manufacture: 2024,
        plate_number: '99X-11111',
        status: 'Available',
        description: 'VinFast VF5 tiết kiệm',
        branch: '3',
        transmission: 'Automatic',
        variant: 'Air',
        battery_status: '100%',
        battery_capacity: '40 kWh',
        range_km: 300,
        stationId: 3,
        stationName: 'Da Nang EV Station 1'
    },
    {
        id: 'demo-vinfast-2',
        vehicle_id: 'VF-002',
        vehicle_name: 'VinFast VF5 Plus',
        brand: 'VinFast',
        name: 'VinFast VF5 Plus',
        image: image4Seater,
        type: '4-seater',
        seat_count: 4,
        grade: 'Plus',
        color: 'Red',
        year_of_manufacture: 2024,
        plate_number: '99X-22222',
        status: 'Available',
        description: 'VinFast VF5 Plus cao cấp',
        branch: '3',
        transmission: 'Automatic',
        variant: 'Plus',
        battery_status: '95%',
        battery_capacity: '50 kWh',
        range_km: 350,
        stationId: 3,
        stationName: 'Da Nang EV Station 1'
    },
];

/**
 * Custom hook để lấy dữ liệu xe từ API với fallback data
 * @param {boolean} autoLoad - Tự động load khi component mount (mặc định: false)
 * @returns {Object} { vehicles, loading, error, refetch }
 */
export const useVehicles = (autoLoad = false) => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(autoLoad); // Chỉ set loading = true nếu autoLoad = true
    const [error, setError] = useState(null);

    const fetchVehicles = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('🔍 [useVehicles] Bắt đầu load dữ liệu xe từ API...');
            console.log('🚀 [useVehicles] Gọi API vehicles (không cần token)...');

            // API GET /api/vehicles/get KHÔNG CẦN authentication theo docs
            const data = await fetchAndTransformVehicles();

            if (data && data.length > 0) {
                console.log('✅ [useVehicles] SUCCESS! Đã lấy', data.length, 'xe từ backend');
                console.log('🎯 [useVehicles] Đây là dữ liệu ĐỘNG từ backend');
                setVehicles(data);
            } else {
                // Sử dụng sample data nếu API trả rỗng
                console.warn('⚠️ [useVehicles] API trả về 0 xe - sử dụng sample data để demo');
                console.warn('💡 [useVehicles] Cần thêm xe vào database qua API POST /api/vehicles/create');
                setVehicles(SAMPLE_VEHICLES);
            }
        } catch (err) {
            console.error('❌ [useVehicles] Lỗi khi fetch vehicles:', err);
            console.error('📋 [useVehicles] Chi tiết lỗi:', err.message);

            // Sử dụng sample data khi API fail
            console.warn('⚠️ [useVehicles] Sử dụng sample data do lỗi API');
            console.warn('� [useVehicles] Kiểm tra:');
            console.warn('   1. Backend có đang chạy? (https://be-ev-station-based-rental-system.onrender.com)');
            console.warn('   2. CORS đã được cấu hình?');
            console.warn('   3. Database có dữ liệu xe?');

            setError(`API Error: ${err.message} - Hiển thị sample data`);
            setVehicles(SAMPLE_VEHICLES);
        } finally {
            setLoading(false);
            console.log('✔️ [useVehicles] Hoàn tất load dữ liệu');
        }
    };

    useEffect(() => {
        if (autoLoad) {
            fetchVehicles();
        }
    }, [autoLoad]);

    return {
        vehicles,
        loading,
        error,
        refetch: fetchVehicles
    };
};
