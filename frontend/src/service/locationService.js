import axios from 'axios';

const BASE_URL = "https://esgoo.net/api-tinhthanh";

const locationService = {
    getProvinces: async () => {
        try {
            const response = await axios.get(`${BASE_URL}/1/0.htm`);
            return response.data.error === 0 ? response.data.data : [];
        } catch (error) {
            console.error("Error fetching provinces:", error);
            return [];
        }
    },

    getDistricts: async (provinceId) => {
        try {
            const response = await axios.get(`${BASE_URL}/2/${provinceId}.htm`);
            return response.data.error === 0 ? response.data.data : [];
        } catch (error) {
            console.error("Error fetching districts:", error);
            return [];
        }
    },

    getWards: async (districtId) => {
        try {
            const response = await axios.get(`${BASE_URL}/3/${districtId}.htm`);
            return response.data.error === 0 ? response.data.data : [];
        } catch (error) {
            console.error("Error fetching wards:", error);
            return [];
        }
    },

    getFullData: async () => {
        try {
            const response = await axios.get(`${BASE_URL}/4/0.htm`);
            return response.data.error === 0 ? response.data.data : [];
        } catch (error) {
            console.error("Error fetching full data:", error);
            return [];
        }
    },

    getNameById: async (id) => {
        try {
            const response = await axios.get(`${BASE_URL}/5/${id}.htm`);
            return response.data.error === 0 ? response.data.data : null;
        } catch (error) {
            console.error("Error fetching name by id:", error);
            return null;
        }
    }
};

export default locationService;
