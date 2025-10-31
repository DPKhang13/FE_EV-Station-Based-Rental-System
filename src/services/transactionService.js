// /src/services/transactionService.js
import api from "./api"; // nếu api.js ở /src/services/api.js

const transactionService = {
  searchByUserId: async (phone, searchParams = {}) => {
    if (!phone) throw new Error("Missing phone number");
    const qs = new URLSearchParams(searchParams).toString();
    const endpoint =
      `/transactions/user/${phone}` +
      (qs ? `?${qs}` : "");

    // api.get của bạn nên trả về JSON đã parse (fetch wrapper)
    const res = await api.get(endpoint);

    // Chuẩn hóa kết quả về mảng
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.data)) return res.data;
    return [];
  },
  getAllTransactions: async () => {
    return await api.get('/transactions/all');
  },
};

export default transactionService;
