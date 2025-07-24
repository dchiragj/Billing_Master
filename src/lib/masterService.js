import api from "./api";

export const fetchDropdownData = async (CompanyCode, MstCode) => {
        const response = await api.get(`/dropdown?CompanyCode=${CompanyCode}&MstCode=${MstCode}`);
        return response.data.data;
};
export const fetchDropdownDatacity = async (CompanyCode, MstCode,DocCode) => {
        const response = await api.get(`/dropdown?CompanyCode=${CompanyCode}&MstCode=${MstCode}&Param1=${DocCode}`);
        return response.data.data;
};

export const getCustomerData = async (CompanyCode) => {
        const response = await api.get(`/get_customers?CompanyCode=${CompanyCode}`);
        return response.data.data;
};

export const addCustomer = async (customerData) => {
        const response = await api.post("/customers_add", customerData);
        return response.data;
};

export const updateCustomer = async (updatedData) => {
        const response = await api.put(`/update_customers`, updatedData);
        return response.data;
};

export const getUserData = async (CompanyCode) => {
        const response = await api.get(`/get_users?CompanyCode=${CompanyCode}`);
        return response.data.data;
};

export const addUser = async (userData) => {
        const response = await api.post("/add_users", userData);
        return response.data;
};

export const updateUser = async (userData) => {
        const response = await api.put(`/update_users`, userData);
        return response.data;
};

export const getLocationData = async (CompanyCode) => {
        const response = await api.get(`/get_location?CompanyCode=${CompanyCode}`);
        return response.data.data;
};

export const addLocation = async (locationData) => {
        const response = await api.post("/add_location", locationData);
        return response.data;
};

export const updateLocation = async (locationData) => {
        const response = await api.put(`/update_location`, locationData);
        return response.data;
};

export const getProductData = async (CompanyCode, ItemCode = "") => {
        const response = await api.get(`/get_item?CompanyCode=${CompanyCode}&ItemCode=${ItemCode}`);
        return response.data.data;
};

export const addItem = async (itemData) => {
        const response = await api.post("/add_item", itemData);
        return response.data;
};

export const getCompanyData = async () => {
        const response = await api.get(`/get_company?`);
        return response.data.data;
};

export const getItemLocation = async (CompanyCode) => {
        const response = await api.get(`/get_item_location?CompanyCode=${CompanyCode}`);
        return response.data.data;
};

export const getItemPrice = async (CompanyCode) => {
        const response = await api.get(`/get_price?CompanyCode=${CompanyCode}`);
        return response.data.data;
};

export const getItemTax = async (CompanyCode) => {
        const response = await api.get(`/get_tax?CompanyCode=${CompanyCode}`);
        return response.data.data;
};

export const getBillPaymentData = async (formData) => {
        const response = await api.get("/get_Bill_Payment", { params: formData });
        return response || null;
};

export const getBillEntryPayment = async (payload) => {
        const response = await api.post("/get_BillEntryPayment", payload)
        return response.data?.data || null;
}

export const addInvoice = async (formData) => {
        const response = await api.post("/add_invoice", formData)
        return response.data || null;
}

export const billGenerate = async (formData) => {
        const response = await api.post(`/add_generate_invoice`,formData);
        return response.data;    
}

export const USPSearchInvoiceItem = async () => {
    const response = await api.get(`/search_invoice_item`);
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
export const getInvoiceView = async (formData) => {
    const response = await api.post(`/add_invoice_view`,formData);  
    return response.data;
}
export const getMRView = async (formData) => {
    const response = await api.post(`/add_mr_view`,formData);  
    return response.data;    
}

export const deleteCustomer = async (custCode, entryBy) => {
    const response = await api.delete(`/customer_cancle?custCode=${custCode}&entryBy=${entryBy}`);
    return  response.data;
}
export const deleteProduct = async (iCode, entryBy) => {
    const response = await api.delete(`/Item_Cancel?iCode=${iCode}&entryBy=${entryBy}`);
    return  response.data;
}
export const deleteLocation = async (locCode, entryBy) => {
    const response = await api.delete(`/Location_Cancel?locCode=${locCode}&entryBy=${entryBy}`);
    return  response.data;
}
export const deleteUser = async (userId, entryBy) => {
    const response = await api.delete(`/User_Cancel?userId=${userId}&entryBy=${entryBy}`);
    return  response.data;
}
export const getInvoiceBillData = async (billNo) => {
    const response = await api.get(`/get_invoice_detail?billNo=${billNo}`);
    return  response.data;
}

export const deleteInvoice = async (billNo, entryBy) => {
    const response = await api.delete(`/bill_cancel?billno=${billNo}&entryby=${entryBy}`);
    return response.data;
};

export const getmrviewdetail = async (billNo) => {
    const response = await api.get(`/get_mr_view_detail?MRSNO=${billNo}`);
    return response.data;
};

// lib/masterService.js
export const getupdateinvoice = async (payload) => {
  const response = await api.put(`/update-invoice`, payload);
  return response.data;
};

export const getledgerreport = async (payload) => {
  const response = await api.get(`/generalLedger`, {params:payload});
  return response.data;
};

export const getstockreport = async (payload) => {
  const response = await api.get(`/get_stockLedger`, {params:payload});
  return response.data;
};