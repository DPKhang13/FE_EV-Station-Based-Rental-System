import { useState, useEffect, useCallback } from 'react';
import { vehicleTimelineService } from '../services/vehicleTimelineService';

/**
 * Custom hook để fetch và quản lý timeline của nhiều xe
 * @param {Array} vehicles - Danh sách xe cần lấy timeline
 * @returns {Object} { timelines, loading, getVehicleTimeline, hasBookedSlots }
 */
export const useVehicleTimelines = (vehicles = []) => {
  const [timelines, setTimelines] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!vehicles || vehicles.length === 0) return;

    const fetchAllTimelines = async () => {
      setLoading(true);
      const timelineMap = {};

      try {
        // Fetch timeline cho tất cả xe song song
        const promises = vehicles.map(async (vehicle) => {
          const vehicleId = vehicle.vehicleId || vehicle.id;
          if (!vehicleId) return null;

          try {
            const data = await vehicleTimelineService.getTimelines(vehicleId);
            const bookedSlots = data
              .filter(
                (t) =>
                  t.status === "BOOKED" ||
                  t.status === "ORDER_RENTAL" ||
                  t.status === "RENTAL" ||
                  t.status === "CHECKING" ||
                  t.status === "MAINTENANCE"
              )
              .map((t) => ({
                start: new Date(t.startTime),
                end: new Date(t.endTime),
                status: t.status,
                note: t.note,
              }));
            
            return { vehicleId, bookedSlots };
          } catch (error) {
            console.error(`❌ Lỗi khi lấy timeline cho xe ${vehicleId}:`, error);
            return { vehicleId, bookedSlots: [] };
          }
        });

        const results = await Promise.all(promises);
        
        // Tạo map từ vehicleId -> bookedSlots
        results.forEach((result) => {
          if (result && result.vehicleId) {
            timelineMap[result.vehicleId] = result.bookedSlots;
          }
        });

        setTimelines(timelineMap);
      } catch (error) {
        console.error('❌ Lỗi khi fetch timelines:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllTimelines();
  }, [vehicles.length]); // Chỉ re-fetch khi số lượng xe thay đổi

  /**
   * Lấy timeline của một xe cụ thể
   */
  const getVehicleTimeline = useCallback((vehicleId) => {
    return timelines[vehicleId] || [];
  }, [timelines]);

  /**
   * Kiểm tra xe có timeline đang booked không
   */
  const hasBookedSlots = useCallback((vehicleId) => {
    const slots = timelines[vehicleId] || [];
    return slots.length > 0;
  }, [timelines]);

  /**
   * Kiểm tra có overlap với timeline không
   */
  const hasOverlap = useCallback((vehicleId, startTime, endTime) => {
    const slots = timelines[vehicleId] || [];
    const start = new Date(startTime);
    const end = new Date(endTime);

    return slots.some((slot) => {
      return start < slot.end && end > slot.start;
    });
  }, [timelines]);

  /**
   * Lấy thông báo timeline cho xe
   */
  const getTimelineMessage = useCallback((vehicleId) => {
    const slots = timelines[vehicleId] || [];
    if (slots.length === 0) return null;

    // Lọc các slot đang active (chưa kết thúc)
    const now = new Date();
    const activeSlots = slots.filter(slot => slot.end > now);

    if (activeSlots.length === 0) return null;

    return {
      count: activeSlots.length,
      slots: activeSlots,
      summary: activeSlots.length === 1 
        ? 'Xe có 1 lịch đặt trước'
        : `Xe có ${activeSlots.length} lịch đặt trước`
    };
  }, [timelines]);

  return {
    timelines,
    loading,
    getVehicleTimeline,
    hasBookedSlots,
    hasOverlap,
    getTimelineMessage,
  };
};
