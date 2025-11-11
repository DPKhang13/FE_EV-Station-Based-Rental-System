// Service để kết nối với User API
const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Lấy danh sách tất cả người dùng
 * @returns {Promise<Array>} Danh sách người dùng
 */
export const getAllUsers = async () => {
    try {
        const token = localStorage.getItem('accessToken');

        console.log('🚀 [API] Đang lấy danh sách người dùng');

        const response = await fetch(`${API_BASE_URL}/auth/getAll/customer`, {
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
        console.log('✅ [API] Danh sách người dùng:', data);

        return data;
    } catch (error) {
        console.error('❌ [API] Lỗi khi lấy danh sách người dùng:', error);
        throw error;
    }
};

// Default export
const userService = {
    getAllUsers
};

export default userService;
