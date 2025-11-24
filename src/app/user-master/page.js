"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Table from "../components/Table";
import moment from "moment";
import {
  addUser,
  deleteUser,
  fetchDropdownData,
  fetchDropdownDatacity,
  getUserData,
  updateUser,
} from "@/lib/masterService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAlignLeft,
  faCheckCircle,
  faEdit,
  faTimesCircle,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import Select from "react-select";
import Swal from "sweetalert2";

const UserMaster = () => {
  const { setIsSidebarOpen, userDetail } = useAuth();
  const [userData, setUserData] = useState([]);
  const [formData, setFormData] = useState({
    CompanyCode: String(userDetail.CompanyCode),
  });
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const showActionButtons = userDetail.UserType === "Admin";
  const [dropdownData, setDropdownData] = useState({
    Gender: [],
    User: [],
    EMT: [],
    Location: [],
    Customer: [],
    Company: [],
  });
  const [dropdownLoading, setDropdownLoading] = useState(true);
  const [errors, setErrors] = useState({
    EmailId: "",
    PhoneNo: "",
    MobileNo: "",
  });

  useEffect(() => {
    if (userDetail?.CompanyCode) {
      setDropdownLoading(true);

      fetchUser();

      const promises = Object.keys(dropdownData).map((key) =>
        handleDropdownData(userDetail.CompanyCode, key)
      );

      Promise.all(promises).then(() => {
        setDropdownLoading(false);
      });
    }
  }, [userDetail?.CompanyCode]);

  async function fetchUser() {
    setLoading(true); // Set loading to true before fetching data
    try {
      const data = await getUserData(userDetail.CompanyCode);
      setUserData(data);
    } catch (error) {
      console.log("Failed to fetch customers:", error);
    } finally {
      setLoading(false); // Set loading to false after fetching data
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
      console.log(`Error fetching ${MstCode}:`, error);
    }
  };

  const handleDeleteClick = async (UserId) => {
    try {
      const entryBy = userDetail.UserId; // from context

      if (!UserId || !entryBy) {
        toast.error("Missing required information");
        return;
      }

      // SweetAlert confirmation
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      });

      if (!result.isConfirmed) return;

      Swal.fire({
        title: "Deleting...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await deleteUser(UserId, entryBy);

      // Strict status check
      if (response.status) {
        // Success notification
        await Swal.fire({
          title: "Deleted!",
          text: response.message || "User deleted successfully",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });

        fetchUser();
      }
    } catch (error) {
      console.log("Delete failed:", error);
      // Close loading dialog first
      Swal.close();

      // Show error alert
      await Swal.fire({
        title: "Error!",
        text:
          error.response?.data?.message || error.message || "Deletion failed",
        icon: "error",
      });
    }
  };

  const tableHeaders = [
    ...(showActionButtons ? ["Action"] : []),
    "User Name",
    "User Id",
    "Company Name",
    "Email",
    "Address",
    "Mobile No",
    "Date Of Birth",
    "Date Of Joining",
    "IsActive",
  ];

  const filteredData = userData.map((user) => {
    const rowData = {
      "User Name": user.UserName || "-",
      "User Id": user.UserId || "-",
      "Company Name": user.CompanyName || "-",
      Email: user.EmailId || "-",
      Address: user.Address || "-",
      "Mobile No": user.MobileNo || "-",
      "Date Of Birth": moment(user.DateOfBirth).format("YYYY-MM-DD") || "-",
      "Date Of Joining": moment(user.DateOfJoining).format("YYYY-MM-DD") || "-",
      IsActive: user.IsActive ? (
        <FontAwesomeIcon
          icon={faCheckCircle}
          className="text-green-500"
          fontSize={20}
        />
      ) : (
        <FontAwesomeIcon
          icon={faTimesCircle}
          className="text-red-500"
          fontSize={20}
        />
      ),
    };

    // Only add Action buttons if admin
    if (showActionButtons) {
      rowData["Action"] = (
        <div className="flex gap-3">
          <button
            onClick={() => handleEditClick(user)}
            className="font-medium text-blue-600 hover:underline"
          >
            <FontAwesomeIcon icon={faEdit} className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleDeleteClick(user.UserId)}
            className="font-medium text-red-600 hover:underline"
          >
            <FontAwesomeIcon icon={faTrashCan} className="h-5 w-5" />
          </button>
        </div>
      );
    }

    return rowData;
  });

  const handleEditClick = (user) => {
    const customerLocationIds = user.LocationCode
      ? user.LocationCode.split(",").map((id) => ({
          value: id,
          label:
            dropdownData.Location.find((loc) => loc.LocationCode === id)
              ?.LocationName || id,
        }))
      : [];
    setIsEdit(true);

    setFormData({
      ...user,
      CompanyCode: String(userDetail.CompanyCode),
      LocationCode: customerLocationIds,
      EntryBy: userDetail.UserId,
      IsActive: user.IsActive || false,
    });
    setModalOpen(true);
  };

  const handleAddClick = () => {
    setIsEdit(false);
    setFormData({
      CompanyCode: String(userDetail.CompanyCode),
      Gender: dropdownData.Gender[0]?.DocCode || "",
      UserType: dropdownData.EMT[0]?.DocCode || "",
      ManagerId: dropdownData.User[0]?.UserId || "",
      LocationCode: [],
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
    if (!email) return true; // Empty is valid (optional)
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePhoneNumber = (number) => {
    if (!number) return true; // Empty is valid (optional)
    const regex = /^\d{10}$/; // Assuming phone numbers are 10 digits
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
        [name]: type === "checkbox" ? checked : value,
      });
    }
    // Validate on change
    if (name === "EmailId") {
      setErrors({
        ...errors,
        EmailId: value && !validateEmail(value) ? "Invalid email address" : "",
      });
    } else if (name === "PhoneNo") {
      setErrors({
        ...errors,
        PhoneNo:
          value && !validatePhoneNumber(value)
            ? "Invalid phone number (10 digits required)"
            : "",
      });
    } else if (name === "MobileNo") {
      setErrors({
        ...errors,
        MobileNo:
          value && !validatePhoneNumber(value)
            ? "Invalid mobile number (10 digits required)"
            : "",
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
    const emailError =
      formData.EmailId && !validateEmail(formData.EmailId)
        ? "Invalid email address"
        : "";
    const phoneError =
      formData.PhoneNo && !validatePhoneNumber(formData.PhoneNo)
        ? "Invalid phone number (10 digits required)"
        : "";
    const mobileError =
      formData.MobileNo && !validatePhoneNumber(formData.MobileNo)
        ? "Invalid mobile number (10 digits required)"
        : "";
    const passwordError = validatePassword(
      formData.Password,
      formData.ConfirmPassword
    );

    setErrors({
      EmailId: emailError,
      PhoneNo: phoneError,
      MobileNo: mobileError,
      ConfirmPassword: passwordError,
    });

    if (emailError || phoneError || mobileError || passwordError) {
      return;
    }
    setSubmitting(true);

    try {
      const locationCodes = formData.LocationCode.map(
        (option) => option.value
      ).join(",");

      const payload = {
        CompanyCode: formData.CompanyCode || "",
        UserId: formData.UserId || "",
        UserName: formData.UserName || "",
        MobileNo: formData.MobileNo || "",
        PhoneNo: formData.PhoneNo || "",
        EmailId: formData.EmailId || "",
        Gender: formData.Gender || "",
        DateOfBirth: formData.DateOfBirth || "",
        DateOfJoining: formData.DateOfJoining || "",
        Password: formData.Password || "",
        ConfirmPassword: formData.ConfirmPassword || "",
        Address: formData.Address || "",
        UserType: formData.UserType || "",
        ManagerId: formData.ManagerId || "",
        ActiveTillDate: formData.ActiveTillDate || "",
        IsActive: formData.IsActive || false,
        LocationCode: locationCodes,
        EntryBy: userDetail.UserId || "",
      };

      let response;

      if (isEdit) {
        response = await updateUser(payload);
      } else {
        response = await addUser(payload);
      }

      if (response.status) {
        toast.success(response.message || "User added successfully.");
        fetchUser();
        setModalOpen(false);
        setFormData({});
      } else {
        toast.error(response.data.message || "Operation failed!");
        console.log(response.data.message);
      }
    } catch (error) {
      console.log(error.response?.data?.message || "Error submitting form");
      toast.error(
        error.response?.data?.message || "An error occurred. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-full">
      <button
        className="lg:hidden text-xl text-black p-3 flex justify-start"
        onClick={() => setIsSidebarOpen(true)}
      >
        {/* <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
        </svg> */}
        <FontAwesomeIcon icon={faAlignLeft} />
      </button>

      <div className="bg-white p-8 rounded-lg shadow-lg space-y-8 overflow-y-hidden">
        <div className="flex justify-between items-center">
          <h4 className="text-xl font-bold">User Master</h4>
          <button
            className={`bg-blue-700 hover:bg-blue-800 hover:ring text-white rounded-md px-5 py-1 flex items-center 
    ${dropdownLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={handleAddClick}
            disabled={dropdownLoading}
          >
            <span className="text-xl">+ </span> ADD
          </button>
        </div>
        <Table headers={tableHeaders} data={filteredData} loading={loading} />
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50 ml-0 lg:ml-[288px] px-5">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-6xl overflow-auto max-h-[90vh] border-2 border-gray-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl">
                {isEdit ? "Edit User Master" : "Add User Master"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-red-500 font-bold text-xl"
              >
                X
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-6 bg-white p-6 rounded-lg border-2"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  [
                    "CompanyCode",
                    "Company Code",
                    "select",
                    dropdownData.Company,
                  ],
                  // ["LocationCode", "Location Code", "text", true],
                ].map(([name, label, type, options], index) => (
                  <div key={index} className="flex items-center">
                    <label className="text-gray-700 font-medium w-1/3 text-left">
                      {label}
                    </label>
                    {/* <input
                      type={type}
                      name={name}
                      value={formData[name] || ""}
                      className="p-2 w-2/3 bg-gray-200 rounded-md border border-gray-300 cursor-not-allowed"
                      disabled={name === "CompanyCode"}
                    /> */}
                    <select
                      type={type}
                      name={name}
                      value={formData[name] || ""}
                      onChange={handleInputChange}
                      className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                      // required={isRequired}
                      // readOnly
                      // disabled
                    >
                      {/* <option value="">Select {label}</option> */}
                      {options.map((option, idx) => (
                        <option key={idx} value={option.CompanyCode}>
                          {option.CompanyName}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
                <div className="flex items-center justify-start">
                  <label className="text-gray-700 font-medium w-1/3 text-left">
                    Customer Location Id
                  </label>
                  <Select
                    isMulti
                    name="LocationCode"
                    options={dropdownData.Location.map((location) => ({
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
                  ["PhoneNo", "Phone No", "number", false],
                  ["EmailId", "Email ID", "email", false],
                  ["Gender", "Gender", "select", false, dropdownData.Gender],
                  ["DateOfBirth", "Date of Birth", "date", true],
                  ["DateOfJoining", "Date of Joining", "date", true],
                  ...(!isEdit
                    ? [
                        ["Password", "Password", "password", true],
                        [
                          "ConfirmPassword",
                          "Confirm Password",
                          "password",
                          true,
                        ],
                      ]
                    : []),
                  ["Address", "Address", "textarea", false],
                  ["UserType", "User Type", "select", true, dropdownData.EMT],
                  [
                    "ManagerId",
                    "Manager ID",
                    "select",
                    true,
                    dropdownData.User,
                  ],
                  ["ActiveTillDate", "Active Till Date", "date", true],
                ].map(([name, label, type, isRequired, options], index) => (
                  <div
                    key={index}
                    className={`${type === "textarea" ? "md:col-span-2" : ""}`}
                  >
                    <div className={`flex items-center`}>
                      <label
                        className={`text-gray-700 font-medium ${
                          name === "Address" ? "lg:w-1/6" : ""
                        } w-1/3 text-left`}
                      >
                        {label}
                      </label>
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
                            <option
                              key={idx}
                              value={
                                name === "ManagerId"
                                  ? option.UserId
                                  : option.DocCode
                              }
                            >
                              {name === "ManagerId"
                                ? `${option.UserId}-${option.UserName} `
                                : option.CodeDesc}
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
                          value={
                            type === "date"
                              ? formData[name]
                                ? moment(formData[name]).format("YYYY-MM-DD")
                                : ""
                              : formData[name] || ""
                          }
                          onChange={handleInputChange}
                          className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                          required={isRequired}
                        />
                      )}
                    </div>
                    {errors[name] && (
                      <span className="text-red-500 text-sm">
                        {errors[name]}
                      </span>
                    )}
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

                {/* <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  {isEdit ? "Update User" : "Add User"}
                </button> */}
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center"
                  disabled={submitting}
                >
                  {submitting ? (
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : isEdit ? (
                    "Update User"
                  ) : (
                    "Add User"
                  )}
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
