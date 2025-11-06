import api from './api'; 

export const adminService = {
 

    getStaffs: async () => {
        return await api.get('/staffschedule/getlist/staff');
    }


};