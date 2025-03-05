"use client"
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Table from '../components/Table';
import moment from 'moment';
import { addCustomer, fetchDropdownData, Finyear, getCustomerData, updateCustomer } from '@/lib/masterService';

const CustomerMaster = () => {
  const [customersData, setCustomersData] = useState([]);
  const [formData, setFormData] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const { setIsSidebarOpen, userDetail } = useAuth();
  const [dropdownData, setDropdownData] = useState({
    CMG: [],
    BillType: [],
    Location: [],
    City: [],
    State: [],
    TAX: [],
    Price: [],
    });

  useEffect(() => {
    if (userDetail.CompanyCode) {
      
      fetchData();
      Object.keys(dropdownData).forEach((key) => {
        handleDropdownData(userDetail.CompanyCode,key);
      });                
    }
    
  }, [userDetail.CompanyCode]);

  async function fetchData() {
    try {
      const data = await getCustomerData(userDetail.CompanyCode);
     
      setCustomersData(data);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    }
  }

  const handleDropdownData = async (CompanyCode , MstCode) => {   
    try {
      if(userDetail.CompanyCode){
        const data = await fetchDropdownData(CompanyCode, MstCode);        
        setDropdownData((prev) => ({
          ...prev,
          [MstCode]: data,
        }));
      }
    } catch (error) {
      console.error(`Error fetching ${MstCode}:`, error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
   
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
      };     

      let response;

      if (isEditMode) {
        response = await updateCustomer(payload);
      } else {
        response = await addCustomer(payload);
      }

      if (response.status) {
        fetchData();
        setIsModalOpen(false);
        setFormData({});
      } else {
        console.log(response.data.message);
      }
    } catch (error) {
      console.log(error);
      console.error('Error during the submit action:', error?.response?.message || error.message);
    }
  };

  const handleAddClick = () => {
    setFormData({ 
      CompanyCode: userDetail.CompanyCode,
      LocationCode: String(userDetail.LocationCode),
      FinYear:Finyear});
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEditClick = (customerData) => {
    setFormData({
      ...customerData,
      CompanyCode: userDetail.CompanyCode,
      LocationCode: String(userDetail.LocationCode),
      FinYear:Finyear,
      // CrDays: customerData.CrDays?.toString() || "",
      // CRLimit: customerData.CRLimit?.toString() || "",
      // OverDue_Interest: customerData.OverDue_Interest?.toString() || "",
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const tableHeaders = ['Name', 'Mobile No', 'Email', 'Address', 'Delivery Address', 'Tax', 'Bill Type', 'Date', 'Action'];

  const filteredData = customersData.map((customerData) => ({
    "Name": customerData.CustomerName || "-",
    'Mobile No': customerData.MobileNo || "-",
    'Email': customerData.EmailId || "-",
    'Address': `${customerData.Address && customerData.City && customerData.State ? `${customerData.Address}, ${customerData.City}, ${customerData.State}` : '-'}`,
    'Delivery Address': customerData.DeliveryAddress || "-",
    'Tax': customerData.TaxType || "-",
    'Bill Type': customerData.BillType || "-",
    'Date': moment(customerData.EntryDate).format('YYYY-MM-DD') || "-",
    Action: (
      <button onClick={() => handleEditClick(customerData)} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
        Edit
      </button>
    ),
  }));

  return (
    <div className={`p-8 w-full lg:w-[calc(100vw-288px)] ml-0 lg:ml-[288px] text-black min-h-screen ${isModalOpen ? "overflow-hidden h-screen" : "overflow-auto"}`}>
      <button
        className="lg:hidden text-black p-3 flex justify-start"
        onClick={() => setIsSidebarOpen(true)}
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16m-7 6h7"
          />
        </svg>
      </button>
      <div className="bg-white p-8 rounded-lg shadow-lg space-y-8">
        <div className="flex flex-wrap justify-between items-center">
          <h4 className="text-2xl font-bold">Customer Master</h4>
          <button
            onClick={handleAddClick}
            className="bg-blue-700 hover:bg-blue-800 hover:ring text-white rounded-md px-5 py-1 flex items-center"
          >
            <span className="text-2xl">+ </span> ADD
          </button>
        </div>

        <Table headers={tableHeaders} data={filteredData} />
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50 ml-0 lg:ml-[288px] px-5">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-6xl overflow-auto max-h-[90vh] border-2 border-gray-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl">{isEditMode ? "Edit Customer Master" : "Add Customer Master"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-red-500 font-bold text-xl">X</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border-2">

              <div className="pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {[
                ["CompanyCode", "Company Code", "text", true],
                ["LocationCode", "Location Code", "text", true],
              ].map(([name, label, type], index) => (
                <div key={index} className="flex items-center">
                  <label className="text-gray-700 font-medium w-1/3 text-left">{label}</label>
                  <input
                    type={type}
                    name={name}
                    value={formData[name] || ""}
                    readOnly
                    className="p-2 w-2/3 bg-gray-200 rounded-md border border-gray-300 cursor-not-allowed"
                    disabled
                  />
                </div>
              ))}
                  {[
                    ["GroupCode", "Group Code", "select", true, dropdownData.CMG],
                    ["BillType", "Bill Type", "select", true, dropdownData.BillType],
                    ["CustomerName", "Customer Name", "text", true],
                    ["CustomerLocationId", "Customer Location Id", "select", false, dropdownData.Location],
                  ].map(([name, label, type, isRequired, options], index) => (
                    <div key={index} className="flex items-center justify-start">
                      <label className="text-gray-700 font-medium w-1/3 text-left">{label}</label>
                      {type === "select" ? (
                    <select
                    name={name}
                    value={formData[name] || ""}
                    onChange={handleInputChange}
                    className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                    required={isRequired}
                  >
                    <option value="">Select {label}</option>
                    {options.map((option, idx) => (
                      <option key={idx} value={name === "CustomerLocationId"? option.LocationCode: option.DocCode}>
                        {name === "CustomerLocationId"? option.LocationName : option.CodeDesc}
                      </option>
                    ))}
                  </select>
                      ) : (
                        <input
                          type={type}
                          name={name}
                          value={formData[name] || ""}
                          onChange={handleInputChange}
                          className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                          required={isRequired}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pb-4">
                <div className='text-xl font-semibold flex justify-center pb-2'>Contact Details </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  {[
                    ["MobileNo", "Mobile No", "number", true],
                    ["PhoneNo", "Phone No", "number", true],
                    ["EmailId", "Email ID", "email", true],
                    ["Address", "Address", "textarea", true],
                    ["DeliveryAddress", "Delivery Address", "textarea", true],
                    ["City", "City", "select", false, dropdownData.City],
                    ["State", "State", "select", true, dropdownData.State],
                    ["Pincode", "Pin Code", "text", false],
                  ].map(([name, label, type, isRequired, options], index) => (
                    <div key={index} className={`flex items-center ${type === "textarea" ? "md:col-span-2" : ""}`}>
                    <label className={`text-gray-700 font-medium ${label.includes("Address") ? "lg:w-1/6" : ""} w-1/3 text-left`}>{label}</label>
                      {type === "select" ? (
                        <select
                          name={name}
                          value={formData[name] || ""}
                          onChange={handleInputChange}
                          className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                          required={isRequired}
                        >
                          <option value="">Select {label}</option>
                          {options.map((option, idx) => (
                            <option key={idx} value={option.DocCode}>
                              {option.CodeDesc}
                            </option>
                          ))}
                        </select>
                      ) : type === "textarea" ? (
                        <textarea
                          name={name}
                          value={formData[name] || ""}
                          onChange={handleInputChange}
                          className="p-2 w-2/3 lg:w-5/6 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none resize-none"
                          rows="2"
                          required={isRequired}
                        />
                      ) : (
                        <input
                          type={type}
                          name={name}
                          value={formData[name] || ""}
                          onChange={handleInputChange}
                          className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                          required={isRequired}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-b pb-4">

                <div className='text-xl font-semibold flex justify-center pb-2'> Account Details </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  {[
                    ["CrDays", "Credit Days", "number", true],
                    ["CRLimit", "Credit Limit", "number", true],
                    ["OverDue_Interest", "OverDue Interest", "number", true],
                    ["PanNo", "PAN No", "text", true],
                    ["TaxType", "Tax Type", "select", true, dropdownData.TAX],
                    ["PriceType", "Price Type","select", true, dropdownData.Price],
                    ["FinYear", "Fin Year", "text", true],
                  ].map(([name, label, type, isRequired, options], index) => (
                    <div key={index} className="flex items-center justify-start">
                      <label className="text-gray-700 font-medium w-1/3 text-left">{label}</label>
                      {type === "select" ? (
                        <select
                          name={name}
                          value={formData[name] || ""}
                          onChange={handleInputChange}
                          className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                          required={isRequired}
                        >
                          <option value="">Select {label}</option>
                          {options.map((option, idx) => (
                            <option key={idx} value={option.DocCode}>
                              {option.CodeDesc}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={type}
                          name={name}
                          value={formData[name] || ""}
                          onChange={handleInputChange}
                          className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                          required={isRequired}
                          readOnly={name === "FinYear"}
                        />
                      )}
                    </div>
                  ))}
                  
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 mt-4">
              <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="IsActive"
                    checked={formData.IsActive || false}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-gray-500"
                  />
                  <label className="text-gray-700 font-medium">Is Active</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="IsBlackList"
                    checked={formData.IsBlackList || false}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-gray-500"
                  />
                  <label className="text-gray-700 font-medium">Is BlackList</label>
                </div>
                {/* </div>
              <div className="flex flex-col lg:flex-row items-center justify-between mt-4"> */}
                <div className="flex items-center space-x-2">
                  <label className="text-gray-700 font-medium">{`If Credit Limit < OutStanding Amount Allow Transaction Y/N`}</label>
                  <input
                    type="checkbox"
                    name="IsAllow_Trn"
                    checked={formData.IsAllow_Trn || false}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-gray-500"
                  />
                </div>
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200">
                  {isEditMode ? "Update Customer" : "Add Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )
      }
    </div>
  );
};

export default CustomerMaster;
