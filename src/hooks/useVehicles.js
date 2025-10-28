import { useState, useEffect } from 'react';
import { fetchAndTransformVehicles } from '../services/vehicleService';

/**
 * ⚠️ PURE API MODE - Không có fallback data
 * Custom hook để lấy dữ liệu xe từ API
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
                console.log('🎯 [useVehicles] Đây là dữ liệu ĐỘNG từ backend, KHÔNG phải hardcoded!');
                setVehicles(data);
            } else {
                // ⚠️ NO FALLBACK - Nếu API trả rỗng thì để rỗng
                console.warn('⚠️ [useVehicles] API trả về 0 xe - database có thể rỗng');
                setVehicles([]);
            }
        } catch (err) {
            console.error('❌ [useVehicles] Lỗi khi fetch vehicles:', err);
            setError(err.message);
            // ⚠️ NO FALLBACK - Lỗi API thì để rỗng, buộc phải fix backend
            console.error('🚫 [useVehicles] KHÔNG có fallback - App bắt buộc cần backend API!');
            setVehicles([]);
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
