import api from "./api";

export const fetchDropdownData = async (CompanyCode, MstCode) => {
    try {
        const response = await api.get(`/dropdown?CompanyCode=${CompanyCode}&MstCode=${MstCode}`);
        return response.data.data;
    } catch (error) {
        console.error("Error fetching customers:", error.response?.data?.message || error.message);
        return null;
    }
};

export const getCustomerData = async (CompanyCode) => {
    try {
        const response = await api.get(`/get_customers?CompanyCode=${CompanyCode}`);
        return response.data.data;
    } catch (error) {
        console.error("Error fetching customers:", error.response?.data?.message || error.message);
        return null;
    }
};

export const addCustomer = async (customerData) => {
    try {
        const response = await api.post("/customers_add", customerData);
        return response.data;
    } catch (error) {
        console.error("Error adding customer:", error.response?.data?.message || error.message);
        return null;
    }
};

export const updateCustomer = async ( updatedData) => {
    try {
        const response = await api.put(`/update_customers`, updatedData);
        return response.data;
    } catch (error) {
        console.error("Error updating customer:", error.response?.data?.message || error.message);
        return null;
    }
};

export const getUserData = async (CompanyCode) => {
    try {
        const response = await api.get(`/get_users?CompanyCode=${CompanyCode}`);     
        return response.data.data;
    } catch (error) {
        console.error(error.response?.data?.message || "Error fetching user data");
        return null;
    }
};

export const addUser = async (userData) => {
    try {
        const response = await api.post("/add_users", userData);
        return response.data;
    } catch (error) {
        console.error("Error adding customer:", error.response?.data?.message || error.message);
        return null;
    }
};

export const updateUser = async ( userData) => {
    try {
        const response = await api.put(`/update_users`, userData);
        return response.data;
    } catch (error) {
        console.error("Error updating customer:", error.response?.data?.message || error.message);
        return null;
    }
};

export const getLocationData = async (CompanyCode) => {
    try {
        const response = await api.get(`/get_location?CompanyCode=${CompanyCode}`);     
        return response.data.data;
    } catch (error) {
        console.log(error.response?.data?.message || "Error fetching user data");
        return null;
    }
};

export const addLocation = async (locationData) => {
    try {
        const response = await api.post("/add_location", locationData);
        return response.data;
    } catch (error) {
        console.error("Error adding customer:", error.response?.data?.message || error.message);
        return null;
    }
};

export const updateLocation = async (locationData) => {
    try {
        const response = await api.put(`/update_location`, locationData);
        return response.data;
    } catch (error) {
        console.error("Error updating customer:", error.response?.data?.message || error.message);
        return null;
    }
};

export const getProductData = async (CompanyCode) => {
    try {
        const response = await api.get(`/get_item?companyCode=${CompanyCode}`);     
        return response.data.data;
    } catch (error) {
        console.log(error.response?.data?.message || "Error fetching user data");
        return null;
    }
};
export const getCompanyData = async () => {
    try {
        const response = await api.get(`/get_company?`);     
        return response.data.data;
    } catch (error) {
        console.log(error.response?.data?.message || "Error fetching user data");
        return null;
    }
};