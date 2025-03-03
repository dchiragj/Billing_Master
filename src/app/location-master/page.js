"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Table from '../components/Table';
import { addLocation, fetchDropdownData, getLocationData, updateLocation } from '@/lib/masterService';

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
  
  const { setIsSidebarOpen, userDetail } = useAuth();

  useEffect(() => {
    if (userDetail?.CompanyCode) {
      fetchData();
      Object.keys(dropdownData).forEach((key) => {
        handleDropdownData(userDetail.CompanyCode,key);
      });   
    }
  
  }, [userDetail]);

 async function fetchData() {
    try {
      const data = await getLocationData(userDetail.CompanyCode);
      setLocationData(data);
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
       let response
      if (isEditMode) {
        response = await updateLocation(formData);
      } else {
        response = await addLocation(formData);        
      }
      if (response.status) {
        fetchData();
        setIsModalOpen(false);
        setFormData({});
      }
    } catch (error) {
      console.log('Error during the submit action:', error?.response?.data?.message || error.message);
    }
  };

  const handleAddClick = () => {
    setFormData({
      CompanyCode: userDetail?.CompanyCode || "",
      EntryBy: userDetail?.UserId || "",
      isActive: false, 
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
      isActive: locationData.isActive || false, 
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };


  const tableHeaders = ['Location Code', 'Location Name', 'Address', 'Mobile No', 'EmailId', 'Fax No', 'Action'];

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
    ["CompanyCode", "Company Code", "text", true],
    ["EntryBy", "Entry By", "text", true],
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
  ["LocationName", "Location Name", "text", true],
  // ["LevelId", "Level ID", "text", false],
  // ["ReportLocationId", "Report Location ID", "text", false],
  // ["ReportLevelId", "Report Level ID", "text", false],
  ["AccountLocationId", "Account Location ID", "text", false],
  ["MobileNo", "Mobile No", "number", false],
  ["PhoneNo", "Phone No", "number", false],
  ["EmailId", "Email ID", "email", false],
  ["Address", "Address", "textarea", false],
  ["City", "City", "select", false, dropdownData.City],
  ["State", "State", "select", false, dropdownData.State],
  ["Pincode", "Pin Code", "number", false],
  ["FaxNo", "Fax No", "text", false],
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

  <div className="flex items-center justify-between mt-4">
    <div className="flex items-center space-x-2">
      {console.log(formData.isActive)
      }
      <input
        type="checkbox"
        name="isActive"
        checked={formData.isActive || false}
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
// "use client";
// import axios from 'axios';
// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../context/AuthContext';
// import Table from '../components/Table';
// import Form from '../components/Form';

// const LocationMaster = () => {
//   const [locationData, setLocationData] = useState([]);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const { setIsSidebarOpen } = useAuth();

//   // Fetch location data from the API
//   useEffect(() => {
//     async function getLocationData() {
//       try {
//         const response = await axios.get('/api/get_location');
//         if (response.data.status) {
//           setLocationData(response.data.data);
//         }
//       } catch (error) {
//         console.log(error.response.data.message);
//       }
//     }
//     getLocationData();
//   }, []);

//   // Table Headers
//   const tableHeaders = [
//     'Location Code', 'Location Name', 'Address', 'Mobile No', 'EmailId', 'Fax No', 'Action'
//   ];

//   // Map location data to table format
//   const filteredData = locationData.map((location) => ({
//     'Location Code': location.LocationCode || "-",
//     'Location Name': location.LocationName || "-",
//     'Address': `${location.Address && location.City && location.State ? `${location.Address}, ${location.City}, ${location.State}` : '-'}`,
//     'Mobile No': location.MobileNo || "-",
//     'Email': location.EmailId || "-",
//     'Fax No': location.FaxNo || "-",
//     Action: (
//       <button
//         onClick={() => handleEditClick(location)}
//         className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
//       >
//         Edit
//       </button>
//     ),
//   }));

//   // Form fields for location
  // const locationFormFields = [
  //   { label: 'Location Code', name: 'locationCode', type: 'text', placeholder: 'Enter Location Code', required: true },
  //   { label: 'Location Name', name: 'locationName', type: 'text', placeholder: 'Enter Location Name', required: true },
  //   { label: 'Address', name: 'address', type: 'text', placeholder: 'Enter Address' },
  //   { label: 'City', name: 'city', type: 'text', placeholder: 'Enter City' },
  //   { label: 'State', name: 'state', type: 'text', placeholder: 'Enter State' },
  //   { label: 'Mobile No', name: 'mobileNo', type: 'text', placeholder: 'Enter Mobile No' },
  //   { label: 'Email Id', name: 'emailId', type: 'email', placeholder: 'Enter Email Id' },
  //   { label: 'Fax No', name: 'faxNo', type: 'text', placeholder: 'Enter Fax No' },
  //   { label: 'Status', name: 'status', type: 'select', options: ['Active', 'Inactive'], required: true },
  // ];

//   // Handle form submission (Add new location)
//   const handleFormSubmit = (data) => {
//     console.log('New Location Data:', data);
//     // You can send this data to an API to save the location

//     // After submission, close the modal and update the table
//     setLocationData([...locationData, data]);
//     setIsModalOpen(false);
//   };

//   // Open the modal when the "ADD" button is clicked
//   const handleAddClick = () => {
//     setIsModalOpen(true);
//   };

//   // Handle edit button click (for future functionality)
//   const handleEditClick = (location) => {
//     console.log('Edit location', location);
//   };

//   return (
//     <div className="p-8 w-full lg:w-[calc(100vw-288px)] ml-0 lg:ml-[288px] text-black min-h-screen">
//       <button
//         className="lg:hidden text-black p-3 flex justify-start"
//         onClick={() => setIsSidebarOpen(true)}
//       >
//         <svg
//           className="h-6 w-6"
//           fill="none"
//           viewBox="0 0 24 24"
//           stroke="currentColor"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth="2"
//             d="M4 6h16M4 12h16m-7 6h7"
//           />
//         </svg>
//       </button>
//       <div className="bg-white p-8 rounded-lg shadow-lg space-y-8">
//         <div className="flex justify-between items-center">
//           <h4 className="text-2xl font-bold">Location Master</h4>
//           <button
//             className="bg-blue-700 hover:bg-blue-800 hover:ring text-white rounded-md px-5 py-1 flex items-center"
//             onClick={handleAddClick}
//           >
//             <span className="text-2xl">+ </span> ADD
//           </button>
//         </div>
        
//         <Table headers={tableHeaders} data={filteredData} />

//         {/* Modal with Form */}
//         <Form
//           formFields={locationFormFields}
//           onSubmit={handleFormSubmit}
//           isOpen={isModalOpen}
//           onClose={() => setIsModalOpen(false)}
//           buttonText="Submit Location"
//         />
//       </div>
//     </div>
//   );
// };

// export default LocationMaster;
