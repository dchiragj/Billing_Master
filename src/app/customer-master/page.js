"use client"
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Table from '../components/Table';
import moment from 'moment';
import { addCustomer, deleteCustomer, fetchDropdownData, fetchDropdownDatacity, getCustomerData, updateCustomer } from '@/lib/masterService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAlignLeft, faCheckCircle, faEdit, faTimesCircle, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { toast } from 'react-toastify';
import Select from 'react-select';
import Swal from 'sweetalert2';


const CustomerMaster = () => {
  const [customersData, setCustomersData] = useState([]);
  const [formData, setFormData] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { setIsSidebarOpen, userDetail } = useAuth();
  const [dropdownData, setDropdownData] = useState({
    CMG: [],
    BillType: [],
    Location: [],
    State: [],
    TAX: [],
    Price: [],
    City: [],
  });
  const [errors, setErrors] = useState({
    EmailId: "",
    PhoneNo: "",
    MobileNo: "",
  });
  const Finyear = userDetail.FinancialYear;

  const showActionButtons = userDetail.UserType === "Admin";
  useEffect(() => {
    if (userDetail.CompanyCode) {

      fetchCustomers();
      Object.keys(dropdownData).forEach((key) => {
        handleDropdownData(userDetail.CompanyCode, key);
      });
    }

  }, [userDetail.CompanyCode]);

  useEffect(() => {
    if (!isEditMode && dropdownData.City.length > 0 && formData.State && !formData.City) {
      setFormData(prev => ({
        ...prev,
        City: dropdownData.City[0]?.CityCode || ""
      }));
    }
  }, [dropdownData.City, isEditMode, formData.State]);

  async function fetchCustomers() {
    setLoading(true);
    try {
      const data = await getCustomerData(userDetail.CompanyCode);

      setCustomersData(data);
    } catch (error) {
      console.log("Failed to fetch customers:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleDropdownData = async (CompanyCode, MstCode, DocCode = null) => {
    try {
      if (userDetail.CompanyCode) {
        let data;
        if (MstCode === "City" && DocCode) {
          data = await fetchDropdownDatacity(CompanyCode, MstCode, DocCode);
        } else {
          data = await fetchDropdownData(CompanyCode, MstCode);
        }
        setDropdownData((prev) => ({
          ...prev,
          [MstCode]: data,
        }));
      }
    } catch (error) {
      console.log(`Error fetching ${MstCode}:`, error);
    }
  };
  // const handleStateChange = async (e) => {
  //   const selectedStateDocCode = e.target.value;
  //   setFormData({
  //     ...formData,
  //     State: selectedStateDocCode,
  //   });

  //   if (selectedStateDocCode) {
  //     await handleDropdownData(userDetail.CompanyCode, "City", selectedStateDocCode);
  //   }
  // };
  const handleStateChange = async (e) => {
    const selectedStateDocCode = e.target.value;
    
    // Update form data with the new state
    const updatedFormData = {
      ...formData,
      State: selectedStateDocCode,
      City: "" // Reset city when state changes
    };
    
    setFormData(updatedFormData);
  
    if (selectedStateDocCode) {
      // Fetch cities for the selected state
      await handleDropdownData(userDetail.CompanyCode, "City", selectedStateDocCode);
      
      // Set the first city as default only in add mode
      if (!isEditMode) {
        setFormData(prev => ({
          ...prev,
          City: dropdownData.City[0]?.CityCode || ""
        }));
      }
    }
  };
  const validateEmail = (email) => {
    if (!email) return true;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePhoneNumber = (number) => {
    if (!number) return true;
    const regex = /^\d{10}$/;
    return regex.test(number);
  };

  const handleInputChange = async (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "State") {
      // Call handleStateChange for state dropdown
      await handleStateChange(e);
    } else {
      // Handle other inputs normally
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value,
      });
    }
    if (name === "EmailId") {
      setErrors({
        ...errors,
        EmailId: value && !validateEmail(value) ? "Invalid email address" : "",
      });
    } else if (name === "PhoneNo") {
      setErrors({
        ...errors,
        PhoneNo: value && !validatePhoneNumber(value) ? "Invalid phone number (10 digits required)" : "",
      });
    } else if (name === "MobileNo") {
      setErrors({
        ...errors,
        MobileNo: value && !validatePhoneNumber(value) ? "Invalid mobile number (10 digits required)" : "",
      });
    }
  };
  const handleMultiSelectChange = (selectedOptions) => {
    setFormData({
      ...formData,
      CustomerLocationId: selectedOptions, // Update with the selected array of objects
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailError = formData.EmailId && !validateEmail(formData.EmailId)
      ? "Invalid email address" : "";
    const phoneError = formData.PhoneNo && !validatePhoneNumber(formData.PhoneNo)
      ? "Invalid phone number (10 digits required)" : "";
    const mobileError = formData.MobileNo && !validatePhoneNumber(formData.MobileNo)
      ? "Invalid mobile number (10 digits required)" : "";

    setErrors({
      EmailId: emailError,
      PhoneNo: phoneError,
      MobileNo: mobileError,
    });

    if (emailError || phoneError || mobileError) {
      return; // Stop submission if there are errors
    }

    setSubmitting(true);
    try {
      const customerLocationIds = formData.CustomerLocationId
        .map(option => option.value) // Extract values from the array of objects
        .join(",");

      const payload = {
        ...formData,
        CustomerLocationId: customerLocationIds,
        CrDays: String(formData.CrDays || ""),
        CRLimit: String(formData.CRLimit || ""),
        OverDue_Interest: String(formData.OverDue_Interest || ""),
        IsAllow_Trn: formData.IsAllow_Trn || false,
      };

      let response;

      if (isEditMode) {
        response = await updateCustomer(payload);
      } else {
        response = await addCustomer(payload);
      }

      if (response.status) {
        toast.success(response.message || "Insert successful.");
        fetchCustomers();
        setIsModalOpen(false);
        setFormData({});
      } else {
        toast.error(response.message || "Insert failed!");
      }
    } catch (error) {
      console.log('Error during the submit action:', error?.response?.message || error.message);
      toast.error(error?.error || "An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
  //  const handleAddClick = () => {
  //     const defaultGroupCode = dropdownData.CMG.length > 0 ? dropdownData.CMG[0].DocCode : '';

  //     setFormData({
  //       CompanyCode: userDetail.CompanyCode,
  //       LocationCode: String(userDetail.LocationCode),
  //       FinYear: Finyear,
  //       GroupCode: defaultGroupCode // Set the default group code
  //     });
  //     setIsEditMode(false);
  //     setIsModalOpen(true);
  //   };

  const handleAddClick = () => {
    const defaultFormData = {
      CompanyCode: String(userDetail.CompanyCode),
      LocationCode: String(userDetail.LocationCode),
      FinYear: Finyear,
      GroupCode: dropdownData.CMG.length > 0 ? dropdownData.CMG[0].DocCode : '',
      BillType: dropdownData.BillType.length > 0 ? dropdownData.BillType[0].DocCode : '',
      TaxType: dropdownData.TAX.length > 0 ? dropdownData.TAX[0].DocCode : '',
      PriceType: dropdownData.Price.length > 0 ? dropdownData.Price[0].DocCode : '',
      State: dropdownData.State.length > 0 ? dropdownData.State[0].DocCode : '',
      City: "",
      CustomerLocationId: [],
      IsActive: false, 
      IsBlackList: false,
      IsAllow_Trn: false,
      CrDays: '',
      CRLimit: '',
      OverDue_Interest: '',
      MobileNo: '',
      PhoneNo: '',
      EmailId: '',
      Pincode: '',
      Address: '',
      DeliveryAddress: '',
      PanNo: '',
    };

    setFormData(defaultFormData);
    setIsEditMode(false);
    setIsModalOpen(true);

    // If State has a value, load its cities
    if (defaultFormData.State) {
      handleDropdownData(userDetail.CompanyCode, "City", defaultFormData.State);
    }
  };

  const handleEditClick = async (customerData) => {
    const customerLocationIds = customerData.CustomerLocationId
      ? customerData.CustomerLocationId.split(",").map(id => ({
          value: id,
          label: dropdownData.Location.find(loc => loc.LocationCode === id)?.LocationName || id,
        }))
      : [];
    
    // Initialize form data with customer data
    const updatedFormData = {
      ...customerData,
      CompanyCode: String(userDetail.CompanyCode),
      LocationCode: String(userDetail.LocationCode),
      FinYear: Finyear,
      CustomerLocationId: customerLocationIds,
      State: customerData.State || (dropdownData.State.length > 0 ? dropdownData.State[0].DocCode : ''),
      City: customerData.City || '',
    };

    setFormData(updatedFormData);
    setIsEditMode(true);
    setIsModalOpen(true);

    // Fetch cities for the selected state if it exists
    if (updatedFormData.State) {
      await handleDropdownData(userDetail.CompanyCode, "City", updatedFormData.State);
    }
  };

  const handleDeleteClick = async (custCode) => {
    try {
      const entryBy = userDetail.UserId; // from context

      if (!custCode || !entryBy) {
        toast.error("Missing required information");
        return;
      }

      // SweetAlert confirmation
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      });

      if (!result.isConfirmed) return;

      Swal.fire({
        title: 'Deleting...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await deleteCustomer(custCode, entryBy);

      // Strict status check
      if (response.status) {
        // Success notification
        await Swal.fire({
          title: 'Deleted!',
          text: response.message || 'Customer deleted successfully',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });

        fetchCustomers();
      }

    } catch (error) {
      console.log('Delete failed:', error);
      // Close loading dialog first
      Swal.close();

      // Show error alert
      await Swal.fire({
        title: 'Error!',
        text: error.response?.data?.message || error.message || 'Deletion failed',
        icon: 'error'
      });
    }
  };

  const tableHeaders = [...(showActionButtons ? ['Action'] : []),'Name', 'Mobile No', 'Email', 'City', 'Tax Type', 'Price Type', 'Date', 'IsActive'];

  const filteredData = customersData.map((customerData) => {
  const rowData = {
    "Name": customerData.CustomerName || "-",
    'Mobile No': customerData.MobileNo || "-",
    'Email': customerData.EmailId || "-",
    'City': customerData.Cityname || "-",
    'Tax Type': customerData.TaxTypeName || "-",
    'Price Type': customerData.PriceTypeName || "-",
    'Date': moment(customerData.EntryDate).format('YYYY-MM-DD') || "-",
    'IsActive': customerData.IsActive ? (
      <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" fontSize={20} />
    ) : (
      <FontAwesomeIcon icon={faTimesCircle} className="text-red-500" fontSize={20} />
    ),
  };

  // Only add "Action" if admin
  if (showActionButtons) {
    rowData["Action"] = (
      <div className='flex gap-3'>
        <button onClick={() => handleEditClick(customerData)} className="font-medium text-blue-600 hover:underline">
          <FontAwesomeIcon icon={faEdit} className="h-5 w-5" />
        </button>
        <button onClick={() => handleDeleteClick(customerData.CustomerCode)} className="font-medium text-red-600 hover:underline">
          <FontAwesomeIcon icon={faTrashCan} className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return rowData;
});

  return (
    <div className="h-full">
      <button
        className="lg:hidden text-xl text-black p-3 flex justify-start"
        onClick={() => setIsSidebarOpen(true)}
      >
        <FontAwesomeIcon icon={faAlignLeft} />
      </button>
      <div className="bg-white p-8 rounded-lg shadow-lg space-y-8">
        <div className="flex flex-wrap justify-between items-center">
          <h4 className="text-xl font-bold">Customer Master</h4>
          <button
            onClick={handleAddClick}
            className="bg-blue-700 hover:bg-blue-800 hover:ring text-white rounded-md px-5 py-1 flex items-center"
          >
            <span className="text-xl">+ </span> ADD
          </button>
        </div>

        <Table headers={tableHeaders} data={filteredData} loading={loading} />
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50 ml-0 lg:ml-[288px] px-5">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-6xl overflow-auto max-h-[90vh] border-2 border-gray-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl">{isEditMode ? "Edit Customer Master" : "Add Customer Master"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-red-500 font-bold text-xl">X</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border-2">

              <div className="pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  {[
                    ["GroupCode", "Group Code", "select", true, dropdownData.CMG],
                    ["BillType", "Bill Type", "select", true, dropdownData.BillType],
                    ["CustomerName", "Customer Name", "text", true],
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
                        />
                      )}
                    </div>
                  ))}

                  {/* Multi-select for Customer Location Id */}
                  <div className="flex items-center justify-start">
                    <label className="text-gray-700 font-medium w-1/3 text-left">Customer Location Id</label>
                    <Select
                      isMulti
                      name="CustomerLocationId"
                      options={dropdownData.Location.map(location => ({
                        value: location.LocationCode,
                        label: location.LocationName,
                      }))}
                      value={formData.CustomerLocationId} // Use the array of objects
                      onChange={handleMultiSelectChange}
                      className="w-2/3"
                      classNamePrefix="select"
                    />
                  </div>
                </div>
              </div>

              <div className="pb-4">
                <div className='text-xl font-semibold flex justify-center pb-2'>Contact Details </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  {[
                    ["MobileNo", "Mobile No", "number", true],
                    ["PhoneNo", "Phone No", "number", false],
                    ["EmailId", "Email ID", "email", false],
                    ["Pincode", "Pin Code", "number", false],
                    // ["Address", "Address", "textarea", false],
                    ["DeliveryAddress", "Delivery Address", "textarea", false],
                    ["State", "State", "select", false, dropdownData.State],
                    ["City", "City", "select", false, dropdownData.City],
                  ].map(([name, label, type, isRequired, options], index) => (
                    <div key={index} className={` items-center ${type === "textarea" ? "md:col-span-2" : ""}`}>
                      <div className={`flex items-center ${type === "textarea" ? "md:col-span-2" : ""}`}>
                        <label className={`text-gray-700 font-medium ${label.includes("Address") ? "lg:w-1/6" : ""} w-1/3 text-left`}>{label}</label>
                        {type === "select" ? (
                          <select
                            name={name}
                            value={formData[name] || ""}
                            onChange={handleInputChange}
                            className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                            required={isRequired}
                          >
                            {options && options.length > 0 ? (
                              options.map((option, idx) => (
                                <option key={idx} value={name === "City" ? option.CityCode : option.DocCode}>
                                  {name === "City" ? option.CityName : option.CodeDesc}
                                </option>
                              ))
                            ) : (
                              <option value="">Select {name === "City" ? "City" : "State"}</option>
                            )}
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
                      {errors[name] && (
                        <p className="text-red-500 text-sm mt-1">*{errors[name]}</p>
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
                    ["PanNo", "PAN No", "text", false],
                    ["TaxType", "Tax Type", "select", false, dropdownData.TAX],
                    ["PriceType", "Price Type", "select", false, dropdownData.Price],
                    // ["FinYear", "Fin Year", "text",false],
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
                          {/* <option value="">Select {label}</option> */}
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
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center"
                  disabled={submitting}
                >
                  {submitting ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    isEditMode ? "Update Customer" : "Add Customer"
                  )}
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