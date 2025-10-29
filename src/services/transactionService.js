import api from './api';

/**
 * Transaction History Service
 * Lịch sử giao dịch
 */

export const transactionService = {
    /**
     * Sắp xếp giao dịch theo userId
     * GET /api/transactions/sort/{userId}
     */
    sortByUserId: async (userId, sortParams) => {
        const queryString = sortParams ? `?${new URLSearchParams(sortParams).toString()}` : '';
        return await api.get(`/transactions/sort/${userId}${queryString}`);
    },

    /**
     * Tìm kiếm danh sách giao dịch theo userId
     * GET /api/transactions/search/list/{userId}
     */
   searchByUserId: async (userId, searchParams) => {
  const queryString = searchParams ? `?${new URLSearchParams(searchParams).toString()}` : '';
  const response = await api.get(`/transactions/search/list/${userId}${queryString}`);
  return response.data; // ✅ chỉ trả về mảng data thôi
}

};

export default transactionService;
