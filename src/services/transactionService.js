// /src/services/transactionService.js
import api from "./api"; // nếu api.js ở /src/services/api.js

const transactionService = {
  searchByUserId: async (userId, searchParams = {}) => {
    if (!userId) throw new Error("Missing userId");
    const qs = new URLSearchParams(searchParams).toString();
    const endpoint =
      `/transactions/search/list/${encodeURIComponent(userId)}` +
      (qs ? `?${qs}` : "");

    // api.get của bạn nên trả về JSON đã parse (fetch wrapper)
    const res = await api.get(endpoint);

    // Chuẩn hóa kết quả về mảng
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.data)) return res.data;
    return [];
  },
};

export default transactionService;
