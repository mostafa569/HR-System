import api from '../../auth/services/api';

const departmentService = {
    getAllDepartments: async () => {
        try {
            const response = await api.get('/departments');
            return response.data;
        } catch (error) {
            console.error("Error fetching all departments:", error);
            throw error;
        }
    },

    getDepartmentById: async (id) => {
        try {
            const response = await api.get(`/departments/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching department with ID ${id}:`, error);
            throw error;
        }
    },

    createDepartment: async (departmentData) => {
        try {
            const response = await api.post('/departments', departmentData);
            return response.data;
        } catch (error) {
            console.error("Error creating department:", error);
            throw error;
        }
    },

    updateDepartment: async (id, departmentData) => {
        try {
            const response = await api.put(`/departments/${id}`, departmentData);
            return response.data;
        } catch (error) {
            console.error(`Error updating department with ID ${id}:`, error);
            throw error;
        }
    },

    deleteDepartment: async (id) => {
        try {
            const response = await api.delete(`/departments/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting department with ID ${id}:`, error);
            throw error;
        }
    }
};

export default departmentService;