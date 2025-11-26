import axios from "axios";

const API_BASE_URL = "https://be-ev-station-based-rental-system.onrender.com/api";

export const vehicleTimelineService = {
  async getTimelines(vehicleId) {
    try {
      console.log("🔍 Fetching timeline:", `${API_BASE_URL}/vehicle-timelines/${vehicleId}`);
      const res = await axios.get(`${API_BASE_URL}/vehicle-timelines/${vehicleId}`);
      return res.data;
    } catch (error) {
      console.error("❌ Lỗi khi lấy timeline xe:", error);
      return [];
    }
  },
};
