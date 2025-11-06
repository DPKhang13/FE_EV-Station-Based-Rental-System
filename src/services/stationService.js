import api from './api';

const stationService = {
    // Get all stations
    getAllStations: async () => {
        try {
            const response = await api.get('/rentalstation/getAll');
            console.log('📡 stationService - Raw response:', response);
            return response; // api.get already returns parsed data
        } catch (error) {
            console.error('❌ Error fetching stations:', error);
            throw error;
        }
    },

    // Search stations
    searchStations: async (query) => {
        try {
            const response = await api.get('/rentalstation/search', {
                params: { q: query }
            });
            return response; // api.get already returns parsed data
        } catch (error) {
            console.error('❌ Error searching stations:', error);
            throw error;
        }
    },

    // Create new station
    createStation: async (stationData) => {
        try {
            const response = await api.post('/rentalstation/create', stationData);
            return response; // api.post already returns parsed data
        } catch (error) {
            console.error('❌ Error creating station:', error);
            throw error;
        }
    },

    // Update station
    updateStation: async (id, stationData) => {
        try {
            const response = await api.put(`/rentalstation/update/${id}`, stationData);
            return response; // api.put already returns parsed data
        } catch (error) {
            console.error(`❌ Error updating station ${id}:`, error);
            throw error;
        }
    },

    // Delete station (if available)
    deleteStation: async (id) => {
        try {
            const response = await api.delete(`/rentalstation/delete/${id}`);
            return response; // api.delete already returns parsed data
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
