"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Table from '../components/Table';
import { addLocation, fetchDropdownData, fetchDropdownDatacity, getLocationData, updateLocation } from '@/lib/masterService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAlignLeft, faEdit } from "@fortawesome/free-solid-svg-icons";
import { toast } from 'react-toastify';

const LocationMaster = () => {
  const [locationData, setLocationData] = useState([]);
  const [formData, setFormData] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [dropdownData, setDropdownData] = useState({
    IStatus: [],
    City: [],
    State: [],
  });
  const [errors, setErrors] = useState({
    EmailId: "",
    PhoneNo: "",
    MobileNo: "",
    LocationCode: ""
  });

  const { setIsSidebarOpen, userDetail } = useAuth();

  function validateLocationCode(code) {
    return code.length === 6; // Ensure the code is exactly 6 characters
  }
  useEffect(() => {
    if (userDetail?.CompanyCode) {
      fetchData();
      Object.keys(dropdownData).forEach((key) => {
        handleDropdownData(userDetail.CompanyCode, key);
      });
    }
  }, [userDetail]);

  const fetchData = async () => {
    try {
      const data = await getLocationData(userDetail.CompanyCode);
      setLocationData(data);
    } catch (error) {
      console.error("Failed to fetch locations:", error);
    }
  };

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
      console.error(`Error fetching ${MstCode}:`, error);
    }
  };
  const handleStateChange = async (e) => {
    const selectedStateDocCode = e.target.value;
    setFormData({
      ...formData,
      State: selectedStateDocCode,
    });

    if (selectedStateDocCode) {
      await handleDropdownData(userDetail.CompanyCode, "City", selectedStateDocCode);
    }
  };
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePhoneNumber = (number) => {
    const regex = /^\d{10}$/; // Assuming phone numbers are 10 digits
    return regex.test(number);
  };

  const handleInputChange = async (e) => {
    const { name, value, type, checked } = e.target;
    // setFormData({
    //   ...formData,
    //   [name]: type === 'checkbox' ? checked : value,
    // });
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
    // Validate on change
    if (name === "EmailId") {
      setErrors({
        ...errors,
        EmailId: validateEmail(value) ? "" : "Invalid email address",
      });
    } else if (name === "PhoneNo") {
      setErrors({
        ...errors,
        PhoneNo: validatePhoneNumber(value) ? "" : "Invalid phone number (10 digits required)",
      });
    } else if (name === "MobileNo") {
      setErrors({
        ...errors,
        MobileNo: validatePhoneNumber(value) ? "" : "Invalid mobile number (10 digits required)",
      });
    } else if (name === "LocationCode") {
      setErrors({
        ...errors,
        LocationCode: validateLocationCode(value) ? "" : "Location Code must be exactly 6 characters",
      });
    }

  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields before submission
    const emailError = validateEmail(formData.EmailId) ? "" : "Invalid email address";
    const phoneError = validatePhoneNumber(formData.PhoneNo) ? "" : "Invalid phone number (10 digits required)";
    const mobileError = validatePhoneNumber(formData.MobileNo) ? "" : "Invalid mobile number (10 digits required)";
    const locationCodeError = validateLocationCode(formData.LocationCode) ? "" : "Location Code must be exactly 6 characters";

    setErrors({
      EmailId: emailError,
      PhoneNo: phoneError,
      MobileNo: mobileError,
      LocationCode: locationCodeError,
    });

    if (emailError || phoneError || mobileError || locationCodeError) {
      return; // Stop submission if there are errors
    }

    const payload = {
      ...formData,
      IsActive: formData.IsActive || false,
    };

    try {
      let response;
      if (isEditMode) {
        response = await updateLocation(payload);
      } else {
        response = await addLocation(payload);
      }
      if (response.status) {
        toast.success(isEditMode ? "Location updated successfully!" : "Location added successfully!",);
        fetchData();
        setIsModalOpen(false);
        setFormData({});
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "An error occurred during submission.");
      console.log('Error during the submit action:', error?.response?.data?.message || error.message);
    }
  };

  const handleAddClick = () => {
    setFormData({
      CompanyCode: userDetail?.CompanyCode || "",
      EntryBy: userDetail?.UserId || "",
    });
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEditClick = (locationData) => {
    setFormData({
      ...locationData,
      CompanyCode: userDetail?.CompanyCode || locationData.CompanyCode || "",
      EntryBy: userDetail?.UserId || locationData.EntryBy || "",
      LocationCode: String(locationData.LocationCode),
      IsActive: locationData.IsActive || false,
    });
    if (locationData.State) {
      handleDropdownData(userDetail.CompanyCode, "City", locationData.State);
    }
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const tableHeaders = ['Location Code', 'Location Name', 'Address', 'Mobile No', 'Email', 'Fax No', 'Action'];
  const filteredData = locationData.map((location) => ({
    'Location Code': location.LocationCode || "-",
    'Location Name': location.LocationName || "-",
    'Address': `${location.Address && location.City && location.State ? `${location.Address}, ${location.City}, ${location.State}` : '-'}`,
    'Mobile No': location.MobileNo || "-",
    'Email': location.EmailId || "-",
    'Fax No': location.FaxNo || "-",
    Action: (
      <button
        onClick={() => handleEditClick(location)}
        className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
      >
        <FontAwesomeIcon icon={faEdit} className="h-5 w-5" />
      </button>
    ),
  }));

  return (
    <div className={`p-8 w-full lg:w-[calc(100vw-288px)] ml-0 lg:ml-[288px] text-black min-h-screen ${isModalOpen ? "overflow-hidden h-screen" : "overflow-auto"}`}>
      <button
        className="lg:hidden text-black p-3 flex justify-start"
        onClick={() => setIsSidebarOpen(true)}
      >
       <FontAwesomeIcon icon={faAlignLeft} />
      </button>
      <div className="bg-white p-8 rounded-lg shadow-lg space-y-8">
        <div className="flex justify-between items-center">
          <h4 className="text-2xl font-bold">Location Master</h4>
          <button onClick={handleAddClick} className="bg-blue-700 hover:bg-blue-800 hover:ring text-white rounded-md px-5 py-1 flex items-center">
            <span className="text-2xl">+ </span> ADD
          </button>
        </div>
        <Table headers={tableHeaders} data={filteredData} />
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50 ml-0 lg:ml-[288px] px-5">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-6xl overflow-auto max-h-[90vh] border-2 border-gray-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl">{isEditMode ? "Edit Location Master" : "Add Location Master"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-red-500 font-bold text-xl">X</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  ["LocationName", "Location Name", "text", true],
                  ["LocationCode", "Location code", "text", true],
                  ["MobileNo", "Mobile No", "number", true],
                  ["PhoneNo", "Phone No", "number", false],
                  ["EmailId", "Email ID", "email", true],
                  ["Address", "Address", "textarea", true],
                  ["State", "State", "select", false, dropdownData.State],
                  ["City", "City", "select", false, dropdownData.City],
                  ["Pincode", "Pin Code", "number", false],
                  ["FaxNo", "Fax No", "text", false],
                ].map(([name, label, type, isRequired, options], index) => (
                  <div key={index} className={`flex flex-col ${type === "textarea" ? "md:col-span-2" : ""}`}>
                    <label className="text-gray-700 font-medium mb-1">
                      {label}
                    </label>
                    <div className="flex flex-col">
                      {type === "select" ? (
                        <select
                          name={name}
                          value={formData[name] || ""}
                          onChange={handleInputChange}
                          className="p-2 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                          required={isRequired}
                        >
                          <option value="">Select {label}</option>
                          {options.map((option, idx) => (
                            <option key={idx} value={name === "City" ? option.CityCode : option.DocCode}>
                              {name === "City" ? option.CityName : option.CodeDesc}
                            </option>
                          ))}
                        </select>
                      ) : type === "textarea" ? (
                        <textarea
                          name={name}
                          value={formData[name] || ""}
                          onChange={handleInputChange}
                          className="p-2 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none resize-none"
                          rows="2"
                          required={isRequired}
                        />
                      ) : (
                        <input
                          type={type}
                          name={name}
                          value={formData[name] || ""}
                          onChange={handleInputChange}
                          className="p-2 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                          required={isRequired}
                        />
                      )}
                      {errors[name] && (
                        <p className="text-red-500 text-sm mt-1">*{errors[name]}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-4">
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
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  {isEditMode ? "Update Location" : "Add Location"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationMaster;