import api from './api';

const stationService = {
    // Get all stations
    getAllStations: async (page = 1, pageSize = 10) => {
        try {
            const response = await api.get('/admin/stations', {
                params: { page, pageSize }
            });
            return response.data;
        } catch (error) {
            console.error('❌ Error fetching stations:', error);
            throw error;
        }
    },

    // Get station by ID
    getStationById: async (id) => {
        try {
            const response = await api.get(`/admin/stations/${id}`);
            return response.data;
        } catch (error) {
            console.error(`❌ Error fetching station ${id}:`, error);
            throw error;
        }
    },

    // Create new station
    createStation: async (stationData) => {
        try {
            const response = await api.post('/admin/stations', stationData);
            return response.data;
        } catch (error) {
            console.error('❌ Error creating station:', error);
            throw error;
        }
    },

    // Update station
    updateStation: async (id, stationData) => {
        try {
            const response = await api.put(`/admin/stations/${id}`, stationData);
            return response.data;
        } catch (error) {
            console.error(`❌ Error updating station ${id}:`, error);
            throw error;
        }
    },

    // Delete station
    deleteStation: async (id) => {
        try {
            const response = await api.delete(`/admin/stations/${id}`);
            return response.data;
        } catch (error) {
            console.error(`❌ Error deleting station ${id}:`, error);
            throw error;
        }
    },

    // Get vehicles at station
    getStationVehicles: async (id) => {
        try {
            const response = await api.get(`/admin/stations/${id}/vehicles`);
            return response.data;
        } catch (error) {
            console.error(`❌ Error fetching vehicles for station ${id}:`, error);
            throw error;
        }
    },

    // Get station statistics
    getStationStatistics: async (id) => {
        try {
            const response = await api.get(`/admin/stations/${id}/statistics`);
            return response.data;
        } catch (error) {
            console.error(`❌ Error fetching statistics for station ${id}:`, error);
            throw error;
        }
    }
};

export default stationService;
