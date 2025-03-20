import api from "./api";

export const Finyear = "2024_2025"

export const fetchDropdownData = async (CompanyCode, MstCode) => {
    // try {
        const response = await api.get(`/dropdown?CompanyCode=${CompanyCode}&MstCode=${MstCode}`);
        return response.data.data;
    // } catch (error) {
    //     console.error("Error fetching customers:", error.response?.data?.message || error.message);
    //     return null;
    // }
};
export const fetchDropdownDatacity = async (CompanyCode, MstCode,DocCode) => {
    // try {
        const response = await api.get(`/dropdown?CompanyCode=${CompanyCode}&MstCode=${MstCode}&Param1=${DocCode}`);
        return response.data.data;
    // } catch (error) {
    //     console.error("Error fetching customers:", error.response?.data?.message || error.message);
    //     return null;
    // }
};

export const getCustomerData = async (CompanyCode) => {
    // try {
        const response = await api.get(`/get_customers?CompanyCode=${CompanyCode}`);
        return response.data.data;
    // } catch (error) {
    //     console.error("Error fetching customers:", error.response?.data?.message || error.message);
    //     return null;
    // }
};

export const addCustomer = async (customerData) => {
    // try {
        const response = await api.post("/customers_add", customerData);
        return response.data;
    // } catch (error) {
    //     console.error("Error adding customer:", error.response?.data?.message || error.message);
    //     return null;
    // }
};

export const updateCustomer = async (updatedData) => {
    // try {
        const response = await api.put(`/update_customers`, updatedData);
        return response.data;
    // } catch (error) {
    //     console.error("Error updating customer:", error.response?.data?.message || error.message);
    //     return null;
    // }
};

export const getUserData = async (CompanyCode) => {
    // try {
        const response = await api.get(`/get_users?CompanyCode=${CompanyCode}`);
        return response.data.data;
    // } catch (error) {
    //     console.error(error.response?.data?.message || "Error fetching user data");
    //     return null;
    // }
};

export const addUser = async (userData) => {
    // try {
        const response = await api.post("/add_users", userData);
        return response.data;
    // } catch (error) {
    //     console.error("Error adding customer:", error.response?.data?.message || error.message);
    //     return null;
    // }
};

export const updateUser = async (userData) => {
    // try {
        const response = await api.put(`/update_users`, userData);
        return response.data;
    // } catch (error) {
    //     console.error("Error updating customer:", error.response?.data?.message || error.message);
    //     return null;
    // }
};

export const getLocationData = async (CompanyCode) => {
    // try {
        const response = await api.get(`/get_location?CompanyCode=${CompanyCode}`);
        return response.data.data;
    // } catch (error) {
    //     console.log(error.response?.data?.message || "Error fetching user data");
    //     return null;
    // }
};

export const addLocation = async (locationData) => {
    // try {
        const response = await api.post("/add_location", locationData);
        return response.data;
    // } catch (error) {
    //     console.error("Error adding customer:", error.response?.data?.message || error.message);
    //     return null;
    // }
};

export const updateLocation = async (locationData) => {
    // try {
        const response = await api.put(`/update_location`, locationData);
        return response.data;
    // } catch (error) {
    //     console.error("Error updating customer:", error.response?.data?.message || error.message);
    //     return null;
    // }
};

export const getProductData = async (CompanyCode, ItemCode = "") => {
    // try {
        const response = await api.get(`/get_item?CompanyCode=${CompanyCode}&ItemCode=${ItemCode}`);
        return response.data.data;
    // } catch (error) {
    //     console.log(error.response?.data?.message || "Error fetching user data");
    //     return null;
    // }
};

export const addItem = async (itemData) => {
    // try {
        const response = await api.post("/add_item", itemData);
        return response.data;
    // } catch (error) {
    //     console.error("Error adding customer:", error.response?.data?.message || error.message);
    //     return null;
    // }
};

export const getCompanyData = async () => {
    // try {
        const response = await api.get(`/get_company?`);
        return response.data.data;
    // } catch (error) {
    //     console.log(error.response?.data?.message || "Error fetching user data");
    //     return null;
    // }
};

export const getItemLocation = async (CompanyCode) => {
    // try {
        const response = await api.get(`/get_item_location?CompanyCode=${CompanyCode}`);
        return response.data.data;
    // } catch (error) {
    //     console.error(error.response?.data?.message || "Error fetching user data");
    //     return null;
    // }
};

export const getItemPrice = async (CompanyCode) => {
    // try {
        const response = await api.get(`/get_price?CompanyCode=${CompanyCode}`);
        return response.data.data;
    // } catch (error) {
    //     console.error(error.response?.data?.message || "Error fetching user data");
    //     return null;
    // }
};

export const getItemTax = async (CompanyCode) => {
    // try {
        const response = await api.get(`/get_tax?CompanyCode=${CompanyCode}`);
        return response.data.data;
    // } catch (error) {
    //     console.error(error.response?.data?.message || "Error fetching user data");
    //     return null;
    // }
};

export const getBillPaymentData = async (formData) => {
        const response = await api.get("/get_Bill_Payment", { params: formData });
        return response || null;
};

export const getBillEntryPayment = async (billnos, CompanyCode) => {
    // try {
        const response = await api.post("/get_BillEntryPayment", { billnos, CompanyCode, })
        return response.data?.data || null;
    // } catch (error) {
    //     return null;
    // }
}

export const addInvoice = async (formData) => {
        const response = await api.post("/add_invoice", formData)
        return response.data || null;
}

export const billgenerate = async (formData) => {
    // try {
        const response = await api.post(`/add_generate_invoice`,formData);
        return response.data;    
    // } catch (error) {
    //     console.error(error.response?.data?.message || "Error generating bill", error);
    //     return null;
    // }
}

export const USPSearchInvoiceItem = async (searchTerm) => {
    const response = await api.get(`/search_invoice_item`, { params : searchTerm});
    return response.data;    
}

export const USPInvoiceCustItemLocationChanged = async (formData) => {
    const response = await api.get(`/Customer_change`,{params:formData});  
    return response.data;    
}
export const USPITEMWiseTaxDetails = async (formData) => {
    const response = await api.get(`/itemwise_taxdetail`,{params:formData});  
    return response.data.data;    
}