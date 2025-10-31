import { useState, useEffect } from 'react';
import { fetchAndTransformVehicles } from '../services/vehicleService';

// Import sample images
import image4Seater from '../assets/4standard.jpg';
import image7Seater from '../assets/7standard.jpg';

// Sample data - chỉ dùng khi API fail để demo
const SAMPLE_VEHICLES = [
    {
        id: 'demo-1',
        vehicle_id: 'DEMO-001',
        vehicle_name: 'VinFast VF3 Air',
        brand: 'VinFast',
        name: 'VinFast VF3 Air',
        image: image4Seater,
        type: '4-seater',
        seat_count: 4,
        grade: 'Air',
        color: 'Xanh',
        year_of_manufacture: 2024,
        plate_number: '99X-12345',
        status: 'Available',
        description: 'Xe điện 4 chỗ tiết kiệm, phù hợp đi phố',
        branch: '1',
        transmission: 'Automatic',
        variant: 'Air',
        battery_status: '100%',
        battery_capacity: '40 kWh',
        range_km: 300,
        stationId: 1,
        stationName: 'Hanoi EV Station 1'
    },
    {
        id: 'demo-2',
        vehicle_id: 'DEMO-002',
        vehicle_name: 'VinFast VF5 Plus',
        brand: 'VinFast',
        name: 'VinFast VF5 Plus',
        image: image4Seater,
        type: '4-seater',
        seat_count: 4,
        grade: 'Plus',
        color: 'Đỏ',
        year_of_manufacture: 2024,
        plate_number: '99X-23456',
        status: 'Available',
        description: 'Xe điện 4 chỗ cao cấp hơn với nhiều tính năng',
        branch: '2',
        transmission: 'Automatic',
        variant: 'Plus',
        battery_status: '95%',
        battery_capacity: '50 kWh',
        range_km: 350,
        stationId: 2,
        stationName: 'HCM EV Station 1'
    },
    {
        id: 'demo-3',
        vehicle_id: 'DEMO-003',
        vehicle_name: 'VinFast VF7 Air',
        brand: 'VinFast',
        name: 'VinFast VF7 Air',
        image: image7Seater,
        type: '7-seater',
        seat_count: 7,
        grade: 'Air',
        color: 'Trắng',
        year_of_manufacture: 2024,
        plate_number: '99X-34567',
        status: 'Available',
        description: 'Xe điện 7 chỗ rộng rãi cho gia đình',
        branch: '1',
        transmission: 'Automatic',
        variant: 'Air',
        battery_status: '100%',
        battery_capacity: '70 kWh',
        range_km: 400,
        stationId: 1,
        stationName: 'Hanoi EV Station 1'
    },
    {
        id: 'demo-4',
        vehicle_id: 'DEMO-004',
        vehicle_name: 'VinFast VF8 Plus',
        brand: 'VinFast',
        name: 'VinFast VF8 Plus',
        image: image7Seater,
        type: '7-seater',
        seat_count: 7,
        grade: 'Plus',
        color: 'Xám',
        year_of_manufacture: 2024,
        plate_number: '99X-45678',
        status: 'Available',
        description: 'Xe điện 7 chỗ cao cấp với công nghệ hiện đại',
        branch: '3',
        transmission: 'Automatic',
        variant: 'Plus',
        battery_status: '98%',
        battery_capacity: '80 kWh',
        range_km: 450,
        stationId: 3,
        stationName: 'Da Nang EV Station 1'
    },
    {
        id: 'demo-5',
        vehicle_id: 'DEMO-005',
        vehicle_name: 'VinFast VF9 Pro',
        brand: 'VinFast',
        name: 'VinFast VF9 Pro',
        image: image7Seater,
        type: '7-seater',
        seat_count: 7,
        grade: 'Pro',
        color: 'Đen',
        year_of_manufacture: 2024,
        plate_number: '99X-56789',
        status: 'Available',
        description: 'Xe điện 7 chỗ hạng sang với mọi tiện nghi',
        branch: '2',
        transmission: 'Automatic',
        variant: 'Pro',
        battery_status: '100%',
        battery_capacity: '90 kWh',
        range_km: 500,
        stationId: 2,
        stationName: 'HCM EV Station 1'
    }
];

/**
 * Custom hook để lấy dữ liệu xe từ API với fallback data
 * @returns {Object} { vehicles, loading, error, refetch }
 */
export const useVehicles = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
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
            console.warn('   1. Backend có đang chạy? (http://localhost:8080)');
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
        fetchVehicles();
    }, []);

    return {
        vehicles,
        loading,
        error,
        refetch: fetchVehicles
    };
};
