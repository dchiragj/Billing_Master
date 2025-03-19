"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Table from "../components/Table";
import moment from "moment";
import { addUser, fetchDropdownData, fetchDropdownDatacity, getUserData, updateUser } from "@/lib/masterService";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAlignLeft, faEdit } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import Select from 'react-select';


const UserMaster = () => {
  const { setIsSidebarOpen, userDetail } = useAuth();
  const [userData, setUserData] = useState([]);
  const [formData, setFormData] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [dropdownData, setDropdownData] = useState({
    Gender: [],
    User: [],
    EMT: [],
    Location: [],
  });
  const [errors, setErrors] = useState({
    EmailId: "",
    PhoneNo: "",
    MobileNo: "",
  });


  useEffect(() => {
    if (userDetail?.CompanyCode) {
      fetchData();
    }
    Object.keys(dropdownData).forEach((key) => {
      handleDropdownData(userDetail.CompanyCode, key);
    });

  }, [userDetail]);

  async function fetchData() {
    try {
      const data = await getUserData(userDetail.CompanyCode);

      setUserData(data);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    }
  }

  const handleDropdownData = async (CompanyCode, MstCode) => {
    try {
      if (userDetail.CompanyCode) {
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

  const tableHeaders = [
    "User Name", "User Id", "Company Name", "Email", "Address",
    "Mobile No", "Date Of Birth", "Date Of Joining", "Action"
  ];

  const filteredData = userData.map((user) => ({
    "User Name": user.UserName || "-",
    "User Id": user.UserId || "-",
    "Company Name": user.CompanyName || "-",
    "Email": user.EmailId || "-",
    "Address": user.Address || "-",
    "Mobile No": user.MobileNo || "-",
    "Date Of Birth": moment(user.DateOfBirth).format('YYYY-MM-DD') || "-",
    "Date Of Joining": moment(user.DateOfJoining).format('YYYY-MM-DD') || "-",
    Action: (
      <button
        onClick={() => handleEditClick(user)}
        className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
      >
        <FontAwesomeIcon icon={faEdit} className="h-5 w-5" />
      </button>
    ),
  }));

  const handleEditClick = (user) => {
    const customerLocationIds = user.LocationCode
      ? user.LocationCode.split(",").map(id => ({
          value: id,
          label: dropdownData.Location.find(loc => loc.LocationCode === id)?.LocationName || id,
        }))
      : [];
    setIsEdit(true);
  
    setFormData({
      ...user,
      CompanyCode: userDetail.CompanyCode,
      LocationCode: customerLocationIds,
      EntryBy: userDetail.UserId,
      IsActive: user.IsActive || false, 
    });
    setModalOpen(true);
  };

  const handleAddClick = () => {
    setIsEdit(false);
    setFormData({
      CompanyCode: userDetail.CompanyCode,
      EntryBy: userDetail.UserId,
      IsActive: false, 
    });
    setModalOpen(true);
  };

  const handleStateChange = async (e) => {
    const selectedStateDocCode = e.target.value;
    setFormData({
      ...formData,
      State: selectedStateDocCode,
    });

    // if (selectedStateDocCode) {
    //   await handleDropdownData(userDetail.CompanyCode, "City", selectedStateDocCode);
    // }
  };
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePhoneNumber = (number) => {
    const regex = /^\d{10}$/; 
    return regex.test(number);
  };
  const validatePassword = (password, confirmPassword) => {
    if (password !== confirmPassword) {
      return "password and confirm password do not match message";
    }
    return "";
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
    } else if (name === "Password" || name === "ConfirmPassword") {
      const passwordError = validatePassword(
        name === "Password" ? value : formData.Password, // Use updated value for Password
        name === "ConfirmPassword" ? value : formData.ConfirmPassword // Use updated value for ConfirmPassword
      );
      setErrors({
        ...errors,
        ConfirmPassword: passwordError,
      });
    }
  };

  const handleMultiSelectChange = (selectedOptions) => {
    setFormData({
      ...formData,
      LocationCode: selectedOptions, 
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields before submission
    const emailError = validateEmail(formData.EmailId) ? "" : "Invalid email address";
    const phoneError = validatePhoneNumber(formData.PhoneNo) ? "" : "Invalid phone number (10 digits required)";
    const mobileError = validatePhoneNumber(formData.MobileNo) ? "" : "Invalid mobile number (10 digits required)";
    const passwordError = validatePassword(formData.Password, formData.ConfirmPassword);

    setErrors({
      EmailId: emailError,
      PhoneNo: phoneError,
      MobileNo: mobileError,
      ConfirmPassword: passwordError,
    });

    if (emailError || phoneError || mobileError || passwordError) {
      return; // Stop submission if there are errors
    }
    try {
      const locationCodes = formData.LocationCode
        .map(option => option.value) // Extract values from the array of objects
        .join(",");

      const payload = {
        ...formData,
        LocationCode: locationCodes
      };

      let response;

      if (isEdit) {
        response = await updateUser(payload);
      } else {
        response = await addUser(payload);
      }

      if (response.status) {
        toast.success(response.message || "User added successfully.");
        fetchData();
        setModalOpen(false);
        setFormData({});
      } else {
        toast.error(response.data.message || "Operation failed!");
        console.log(response.data.message);
      }
    } catch (error) {
      console.error(error.response?.data?.message || "Error submitting form");
      toast.error(error.response?.data?.message || "An error occurred. Please try again.");
    }
  };

  return (
    <div className={`p-8 w-full lg:w-[calc(100vw-288px)] ml-0 lg:ml-[288px] text-black min-h-screen ${modalOpen ? "overflow-hidden h-screen" : "overflow-auto"}`}>
      <button
        className="lg:hidden text-black p-3 flex justify-start"
        onClick={() => setIsSidebarOpen(true)}
      >
        {/* <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
        </svg> */}
               <FontAwesomeIcon icon={faAlignLeft} />
        
      </button>

      <div className="bg-white p-8 rounded-lg shadow-lg space-y-8 overflow-y-hidden">
        <div className="flex justify-between items-center">
          <h4 className="text-2xl font-bold">User Master</h4>
          <button
            className="bg-blue-700 hover:bg-blue-800 hover:ring text-white rounded-md px-5 py-1 flex items-center"
            onClick={handleAddClick}
          >
            <span className="text-2xl">+ </span> ADD
          </button>
        </div>
        <Table headers={tableHeaders} data={filteredData} />
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50 ml-0 lg:ml-[288px] px-5">

          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-6xl overflow-auto max-h-[90vh] border-2 border-gray-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl">{isEdit ? "Edit User Master" : "Add User Master"}</h3>
              <button onClick={() => setModalOpen(false)} className="text-red-500 font-bold text-xl">X</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  ["CompanyCode", "Company Code", "text", true],
                  // ["LocationCode", "Location Code", "text", true],
                ].map(([name, label, type], index) => (
                  <div key={index} className="flex items-center">
                    <label className="text-gray-700 font-medium w-1/3 text-left">{label}</label>
                    <input
                      type={type}
                      name={name}
                      value={formData[name] || ""}
                      className="p-2 w-2/3 bg-gray-200 rounded-md border border-gray-300 cursor-not-allowed"
                      disabled={name === "CompanyCode"}
                    />
                  </div>
                ))}
                <div className="flex items-center justify-start">
                  <label className="text-gray-700 font-medium w-1/3 text-left">Customer Location Id</label>
                  <Select
                    isMulti
                    name="LocationCode"
                    options={dropdownData.Location.map(location => ({
                      value: location.LocationCode,
                      label: location.LocationName,
                    }))}
                    value={formData.LocationCode}
                    onChange={handleMultiSelectChange}
                    className="w-2/3"
                    classNamePrefix="select"
                  />
                </div>
                {[
                  ["UserId", "User Id", "text", true],
                  ["UserName", "User Name", "text", true],
                  ["MobileNo", "Mobile No", "number", true],
                  ["PhoneNo", "Phone No", "number", true],
                  ["EmailId", "Email ID", "email", true],
                  ["Gender", "Gender", "select", true, dropdownData.Gender],
                  ["DateOfBirth", "Date of Birth", "date", false],
                  ["DateOfJoining", "Date of Joining", "date", false],
                  ...(!isEdit ? [
                    ["Password", "Password", "password", false],
                    ["ConfirmPassword", "Confirm Password", "password", false],
                  ] : []),
                  ["Address", "Address", "textarea", true],
                  ["UserType", "User Type", "select", false, dropdownData.EMT],
                  ["ManagerId", "Manager ID", "select", true, dropdownData.User],
                  ["ActiveTillDate", "Active Till Date", "date", false],
                ].map(([name, label, type, isRequired, options], index) => (
                  <div key={index} className={`${type === "textarea" ? "md:col-span-2" : ""}`}>
                    <div className={`flex items-center`}>
                      <label className={`text-gray-700 font-medium ${name === "Address" ? "lg:w-1/6" : ""} w-1/3 text-left`}>{label}</label>
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
                            <option key={idx} value={name === "ManagerId" ? option.UserName : option.DocCode}>
                              {name === "ManagerId" ? option.UserId : option.CodeDesc}
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
                          value={type === "date" ? (formData[name] ? moment(formData[name]).format("YYYY-MM-DD") : "") : formData[name] || ""}
                          onChange={handleInputChange}
                          className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                          required={isRequired}
                        />
                      )}
                    </div>
                    {errors[name] && <span className="text-red-500 text-sm">{errors[name]}</span>}
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
                  {isEdit ? "Update User" : "Add User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMaster;
