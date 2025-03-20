// // // "use client";
// // // import React, { useEffect, useState } from "react";
// // // import { useAuth } from "../context/AuthContext";
// // // import { addInvoice, fetchDropdownData, Finyear } from "@/lib/masterService";
// // // import moment from "moment";

// // // const InvoiceMaster = () => {
// // //   const { setIsSidebarOpen, userDetail } = useAuth();
// // //   const initialState = {
// // //     InvMst: {
// // //     },
// // //     Invdet: {
// // //       Invdet: [
// // //         {
// // //           ICode: "",
// // //           QTY: 0,
// // //           DelQty: 0,
// // //           OthAmt: 0,
// // //           NetPrice: 0,
// // //           CHG1: 0,
// // //           CHG2: 0,
// // //           CHG3: 0,
// // //           CHG4: 0,
// // //           CHG5: 0,
// // //           NetAmt: 0,
// // //         },
// // //       ],
// // //     },
// // //   }
// // //   const [formData, setFormData] = useState(initialState);

// // //   const [dropdownData, setDropdownData] = useState({
// // //     BillType: [],
// // //     TAX: [],
// // //     Price: [],
// // //   });

// // //   useEffect(() => {
// // //     if (userDetail?.CompanyCode) {
// // //       Object.keys(dropdownData).forEach((key) => {
// // //         handleDropdownData(userDetail.CompanyCode, key);
// // //       });
// // //     }
// // //   }, [userDetail?.CompanyCode]);

// // //   const handleDropdownData = async (CompanyCode, MstCode) => {
// // //     try {
// // //       if (userDetail.CompanyCode) {
// // //         const data = await fetchDropdownData(CompanyCode, MstCode);
// // //         setDropdownData((prev) => ({
// // //           ...prev,
// // //           [MstCode]: data,
// // //         }));
// // //       }
// // //     } catch (error) {
// // //       console.error(`Error fetching ${MstCode}:`, error);
// // //     }
// // //   };

// // //   const handleInputChange = (e, section = "InvMst", index = 0) => {
// // //     const { name, value, type, checked } = e.target;
// // //     const updatedValue = type === "checkbox" ? checked : value;

// // //     setFormData((prev) => {
// // //       const newData = { ...prev };
// // //       if (section === "InvMst") {
// // //         newData.InvMst[name] = updatedValue;
// // //       } else if (section === "Invdet") {
// // //         newData.Invdet.Invdet[index][name] = updatedValue;
// // //       }
// // //       return newData;
// // //     });
// // //   };

// // //   const handleAddInvoiceDetail = () => {
// // //     setFormData((prev) => ({
// // //       ...prev,
// // //       Invdet: {
// // //         Invdet: [
// // //           ...prev.Invdet.Invdet,
// // //           initialState.Invdet.Invdet
// // //         ],
// // //       },
// // //     }));
// // //   };

// // //   const handleRemoveInvoiceDetail = (index) => {
// // //     setFormData((prev) => ({
// // //       ...prev,
// // //       Invdet: {
// // //         Invdet: prev.Invdet.Invdet.filter((_, i) => i !== index),
// // //       },
// // //     }));
// // //   };

// // //   const handleAddSubmit = async (e) => {
// // //     e.preventDefault();
// // //     const payload = {...formData, CompanyCode : userDetail.CompanyCode, Finyear : Finyear, Billno: "",}
// // //     console.log(payload);

// // //     try {
// // //       // const response = await addInvoice(payload);
// // //       console.log(payload);

// // //       // if (response.status) {
// // //       //   fetchData();
// // //       //   setModalOpen(false);
// // //       //   setFormData({});
// // //       // } else {
// // //       //   console.log(response.data.message);
// // //       // }
// // //     } catch (error) {
// // //       console.error(error.response?.data?.message || "Error submitting form");
// // //     }
// // //   };

// // //   return (
// // //     <div className={`p-8 w-full lg:w-[calc(100vw-288px)] ml-0 lg:ml-[288px] text-black min-h-screen`}>
// // //       <button
// // //         className="lg:hidden text-black p-3 flex justify-start"
// // //         onClick={() => setIsSidebarOpen(true)}
// // //       >
// // //         <svg
// // //           className="h-6 w-6"
// // //           fill="none"
// // //           viewBox="0 0 24 24"
// // //           stroke="currentColor"
// // //         >
// // //           <path
// // //             strokeLinecap="round"
// // //             strokeLinejoin="round"
// // //             strokeWidth={2}
// // //             d="M4 6h16M4 12h16m-7 6h7"
// // //           />
// // //         </svg>
// // //       </button>
// // //       <div className="bg-white p-8 rounded-lg shadow-lg space-y-8">
// // //         <div className="flex justify-between items-center">
// // //           <h4 className="text-2xl font-bold">Invoice Master</h4>
// // //         </div>
// // //         <form onSubmit={handleAddSubmit} className="space-y-6">
// // //           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
// // //             {[
// // //               ["StockLoc", "Stock Location", "text", true],
// // //               // ["BBRCD", "BBRCD", "text", true],
// // //               // ["BillType2", "Bill Type 2", "text", true],
// // //               // ["BGNDT", "BGNDT", "date", true],
// // //               // ["BCLBRCD", "BCLBRCD", "text", true],
// // //               ["CustCd", "Customer Code", "text", true],
// // //               ["RefDt", "Reference Date", "date", true],
// // //               ["DueDT", "Due Date", "date", true],
// // //               ["BillType", "Bill Type", "select", true, dropdownData.BillType],
// // //               ["Collection", "Collection", "text", true],
// // //               ["PriceType", "Price Type", "select", false, dropdownData.Price],
// // //               ["TaxType", "Tax Type", "select", false, dropdownData.TAX],
// // //               ["DueDays", "Bill Due Days", "number", true],
// // //               ["OverDuePer", "OverDue Percentage(%)", "number", true],
// // //               ["BillAmt", "Bill Amount", "number", true],
// // //               ["Dely_Address", "Delivery Address", "textarea", true],
// // //               ["Remarks", "Remarks", "textarea", true],

// // //               // ["Qty", "Quantity", "number", true],
// // //               // ["DeliveredQty", "Delivered Quantity", "number", true],
// // //               // ["Discount", "Discount", "number", true],
// // //               // ["OthAmt", "Other Amount", "number", true],
// // //               // ["WI_Mob", "Warehouse Mobile", "text", true],
// // //               // ["WI_Address", "Warehouse Address", "text", true],
// // //               // ["Billing_Name", "Billing Name", "text", true],
// // //               // ["Billing_Address", "Billing Address", "text", true],
// // //               // ["Billing_Contact", "Billing Contact", "text", true],
// // //               // ["Billing_Pincode", "Billing Pincode", "text", true],
// // //               // ["Billing_City", "Billing City", "text", true],
// // //               // ["Billing_State", "Billing State", "text", true],
// // //               // ["Billing_Country", "Billing Country", "text", true],
// // //               // ["Shipping_Name", "Shipping Name", "text", true],
// // //               // ["Shipping_Address", "Shipping Address", "text", true],
// // //               // ["Shipping_contact", "Shipping Contact", "text", true],
// // //               // ["Shipping_Pincode", "Shipping Pincode", "text", true],
// // //               // ["Shipping_City", "Shipping City", "text", true],
// // //               // ["Shipping_State", "Shipping State", "text", true],
// // //               // ["Shipping_Country", "Shipping Country", "text", true],
// // //               // ["GSTNO", "GST Number", "text", true],
// // //               // ["RefNo", "Reference Number", "text", true],
// // //               // ["Dbt_Ledger", "Debit Ledger", "text", true],
// // //               // ["Vip_Disc", "VIP Discount", "number", true],
// // //               // ["RoundOffAmt", "Round Off Amount", "number", true],
// // //               // ["InvFlagFrom", "Invoice Flag From", "text", true],
// // //               // ["OrderID", "Order ID", "text", true],
// // //               // ["OrderDate", "Order Date", "date", true],
// // //             ].map(([name, label, type, isRequired, options], index) => (
// // //               <div key={index} className={`flex items-center ${type === "textarea" ? "md:col-span-2" : ""}`}>
// // //                 <label className={`text-gray-700 font-medium ${type === "textarea" ? "lg:w-1/6" : ""} w-1/3 text-left`}>{label}</label>
// // //                 {type === "select" ? (
// // //                   <select
// // //                     name={name}
// // //                     value={formData.InvMst[name] || ""}
// // //                     onChange={(e) => handleInputChange(e)}
// // //                     className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
// // //                     required={isRequired}
// // //                   >
// // //                     <option value="">Select {label}</option>
// // //                     {options?.map((option, idx) => (
// // //                       <option key={idx} value={option.DocCode}>
// // //                         {option.CodeDesc}
// // //                       </option>
// // //                     ))}
// // //                   </select>
// // //                 ) : type === "textarea" ? (
// // //                   <textarea
// // //                     name={name}
// // //                     value={formData.InvMst[name] || ""}
// // //                     onChange={(e) => handleInputChange(e)}
// // //                     className="p-2 w-2/3 lg:w-5/6 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none resize-none"
// // //                     rows="2"
// // //                     required={isRequired}
// // //                   />
// // //                 ) : (
// // //                   <input
// // //                     type={type}
// // //                     name={name}
// // //                     value={type === "date" ? (formData.InvMst[name] ? moment(formData.InvMst[name]).format("YYYY-MM-DD") : "") : formData.InvMst[name] || ""}
// // //                     onChange={(e) => handleInputChange(e)}
// // //                     className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
// // //                     required={isRequired}
// // //                   />
// // //                 )}
// // //               </div>
// // //             ))}
// // //           </div>

// // //           <h6 className="flex justify-center text-xl font-bold">Invoice Details</h6>
// // //           <div className="relative overflow-x-auto shadow-md sm:rounded-lg border">
// // //             <table className="w-full text-sm text-center text-gray-700 dark:text-gray-300 border border-gray-300">
// // //               <thead className="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-300 uppercase">
// // //                 <tr>
// // //                   {[
// // //                     "SR No.", "ICode", "QTY", "DelQty", "OthAmt", "NetPrice",
// // //                     "CHG1", "CHG2", "CHG3", "CHG4", "CHG5", "NetAmt", "Action"
// // //                   ].map((heading, index) => (
// // //                     <th key={index} className="px-3 py-2 border border-gray-300">{heading}</th>
// // //                   ))}
// // //                 </tr>
// // //               </thead>
// // //               <tbody>
// // //                 {formData.Invdet.Invdet.map((Bill, index) => (
// // //                   <tr key={index} className="border border-gray-300">
// // //                     <td className="py-2 border border-gray-300">{index + 1}</td>
// // //                     {[
// // //                       "ICode", "QTY", "DelQty", "OthAmt", "NetPrice",
// // //                       "CHG1", "CHG2", "CHG3", "CHG4", "CHG5", "NetAmt"
// // //                     ].map((field, i) => (
// // //                       <td key={i} className="p-2 border border-gray-300">
// // //                         <input
// // //                           type={["QTY", "DelQty", "NetPrice", "CHG1", "CHG2", "CHG3", "CHG4", "CHG5", "NetAmt"].includes(field) ? "number" : "text"}
// // //                           name={field}
// // //                           value={Bill[field] || ""}
// // //                           onChange={(e) => handleInputChange(e, "Invdet", index)}
// // //                           className="p-1 w-full bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-center"
// // //                         />
// // //                       </td>
// // //                     ))}
// // //                     <td className="py-2 border border-gray-300">
// // //                       {formData.Invdet.Invdet.length > 1 && (
// // //                         <button
// // //                           type="button"
// // //                           onClick={() => handleRemoveInvoiceDetail(index)}
// // //                           className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition"
// // //                         >
// // //                           Remove
// // //                         </button>
// // //                       )}
// // //                     </td>
// // //                   </tr>
// // //                 ))}
// // //                 <tr>
// // //                   <td colSpan={13} className="px-4 py-3 text-center">
// // //                     <button
// // //                       type="button"
// // //                       onClick={handleAddInvoiceDetail}
// // //                       className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
// // //                     >
// // //                       + Add New Row
// // //                     </button>
// // //                   </td>
// // //                 </tr>
// // //               </tbody>
// // //             </table>
// // //           </div>
// // //           <div className="flex items-center justify-between mt-4">
// // //             <button
// // //               type="button"
// // //               onClick={() => setFormData(initialState)}
// // //               className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition duration-200"
// // //             >
// // //               Cancel
// // //             </button>
// // //             <button
// // //               type="submit"
// // //               className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
// // //             >
// // //               Submit
// // //             </button>
// // //           </div>
// // //         </form>
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default InvoiceMaster;

// // "use client";
// // import React, { useEffect, useState } from "react";
// // import { useAuth } from "../context/AuthContext";
// // import { addInvoice, fetchDropdownData, Finyear, USPInvoiceCustItemLocationChanged } from "@/lib/masterService";
// // import moment from "moment";
// // import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// // import { faAlignLeft, faTrash } from "@fortawesome/free-solid-svg-icons";
// // import { toast } from "react-toastify";
// // import Swal from "sweetalert2";

// // const InvoiceMaster = () => {
// //   const { setIsSidebarOpen, userDetail } = useAuth();
// //   const initialState = {
// //     InvMst: {},
// //     Invdet: {
// //       Invdet: [
// //         {
// //           ICode: "",
// //           QTY: 0,
// //           DelQty: 0,
// //           OthAmt: 0,
// //           NetPrice: 0,
// //           CHG1: 0,
// //           CHG2: 0,
// //           CHG3: 0,
// //           CHG4: 0,
// //           CHG5: 0,
// //           NetAmt: 0,
// //         },
// //       ],
// //     },
// //   };
// //   const [formData, setFormData] = useState(initialState);
// //   const [isBlacklisted, setIsBlacklisted] = useState(false);
// //   const [dropdownData, setDropdownData] = useState({
// //     Customer: [],
// //     BillType: [],
// //     TAX: [],
// //     Price: [],
// //     Location: [],
// //   });

// //   useEffect(() => {
// //     if (userDetail?.CompanyCode) {
// //       Object.keys(dropdownData).forEach((key) => {
// //         handleDropdownData(userDetail.CompanyCode, key);
// //       });
// //     }
// //   }, [userDetail?.CompanyCode]);

// //   const handleDropdownData = async (CompanyCode, MstCode) => {
// //     try {
// //       if (userDetail.CompanyCode) {
// //         const data = await fetchDropdownData(CompanyCode, MstCode);
// //         setDropdownData((prev) => ({
// //           ...prev,
// //           [MstCode]: data,
// //         }));
// //       }
// //     } catch (error) {
// //       console.error(`Error fetching ${MstCode}:`, error);
// //     }
// //   };

// //   const fetchCustomerDetails = async (customerCode) => {
// //     try {
// //       const response = await USPInvoiceCustItemLocationChanged({ CustCd: customerCode });
// //       console.log("Customer Details Response:", response);

// //       if (response.status) {
// //         const customerData = response.data;

// //         // ✅ Check if blacklisted
// //         if (customerData.IsBlackList === "1") {
// //           Swal.fire({
// //             icon: "error",
// //             title: "Blacklisted Customer",
// //             text: "The Same Customer has been declared as Black Listed",
// //             confirmButtonText: "OK",
// //             confirmButtonColor: "#d33"
// //           });
// //           setIsBlacklisted(true);      // 🚫 Mark as blacklisted
// //           setFormData(initialState);    // ❌ Clear form data
// //           return;                       // Exit the function
// //         } else {
// //           setIsBlacklisted(false);      // ✅ Not blacklisted
// //         }
// //         // ✅ Update formData for non-blacklisted customers
// //         setFormData((prev) => ({
// //           ...prev,
// //           InvMst: {
// //             ...prev.InvMst,
// //             Dely_Address: customerData.Dely_Address || "",
// //             OverDuePer: customerData.Overdue_Interest || "",
// //             PriceType: customerData.PriceType || "",
// //             BillType: customerData.CustCat || "",
// //             TaxType: customerData.CodeID || "",
// //             DueDays: customerData.CRDAYS || "",
// //           },
// //         }));
// //       } else {
// //         toast.error("Failed to fetch customer location data.");
// //       }
// //     } catch (error) {
// //       console.error("Error fetching customer details:", error);
// //       // toast.error("An error occurred while fetching customer details.");
// //     }
// //   };


// //   const handleInputChange = (e, section = "InvMst", index = 0) => {
// //     const { name, value, type, checked } = e.target;
// //     const updatedValue = type === "checkbox" ? checked : value;

// //     setFormData((prev) => {
// //       const newData = { ...prev };
// //       if (section === "InvMst") {
// //         newData.InvMst[name] = updatedValue;

// //         // Call the API when CustCd changes
// //         if (name === "CustCd") {
// //           fetchCustomerDetails(updatedValue);
// //         }
// //       } else if (section === "Invdet") {
// //         newData.Invdet.Invdet[index][name] = updatedValue;
// //       }
// //       return newData;
// //     });
// //   };

// //   const handleAddInvoiceDetail = () => {
// //     setFormData((prev) => ({
// //       ...prev,
// //       Invdet: {
// //         Invdet: [
// //           ...prev.Invdet.Invdet,
// //           initialState.Invdet.Invdet[0],
// //         ],
// //       },
// //     }));
// //   };

// //   const handleRemoveInvoiceDetail = (index) => {
// //     setFormData((prev) => ({
// //       ...prev,
// //       Invdet: {
// //         Invdet: prev.Invdet.Invdet.filter((_, i) => i !== index),
// //       },
// //     }));
// //   };

// //   const handleAddSubmit = async (e) => {
// //     e.preventDefault();

// //     // Define which fields should be numbers
// //     const numberFields = [
// //       "DueDays",
// //       "OverDuePer",
// //       "BillAmt",
// //       "QTY",
// //       "DelQty",
// //       "OthAmt",
// //       "NetPrice",
// //       "CHG1",
// //       "CHG2",
// //       "CHG3",
// //       "CHG4",
// //       "CHG5",
// //       "NetAmt",
// //     ];

// //     // Create a deep copy of the formData to avoid mutating the original state
// //     const payload = JSON.parse(JSON.stringify(formData));

// //     // Convert number fields to numbers
// //     Object.keys(payload.InvMst).forEach((key) => {
// //       if (numberFields.includes(key)) {
// //         payload.InvMst[key] = Number(payload.InvMst[key]);
// //       }
// //     });

// //     payload.Invdet.Invdet.forEach((detail) => {
// //       Object.keys(detail).forEach((key) => {
// //         if (numberFields.includes(key)) {
// //           detail[key] = Number(detail[key]);
// //         }
// //       });
// //     });

// //     // Add additional fields to the payload
// //     payload.CompanyCode = userDetail.CompanyCode;
// //     payload.Finyear = Finyear;
// //     payload.Billno = "";
// //     payload.Brcd = "2";

// //     try {
// //       const response = await addInvoice(payload);
// //       console.log("API Response:", response);

// //       if (response.status) {
// //         toast.success(response.message);
// //         setFormData(initialState);
// //       } else {
// //         toast.error(response.data.message || "An error occurred while processing your request.");
// //       }
// //     } catch (error) {
// //       toast.error("An unexpected error occurred. Please try again.");
// //     }
// //   };
// //   return (
// //     <div className={`p-8 w-full lg:w-[calc(100vw-288px)] ml-0 lg:ml-[288px] text-black min-h-screen`}>
// //       <button
// //         className="lg:hidden text-black p-3 flex justify-start"
// //         onClick={() => setIsSidebarOpen(true)}
// //       >
// //         <FontAwesomeIcon icon={faAlignLeft} />
// //       </button>
// //       <div className="bg-white p-8 rounded-lg shadow-lg space-y-8">
// //         <div className="flex justify-between items-center">
// //           <h4 className="text-2xl font-bold">Invoice Master</h4>
// //         </div>
// //         <form onSubmit={handleAddSubmit} className="space-y-6bg-white p-6 rounded-lg border-2">
// //           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// //             {[
// //               ["StockLoc", "Stock Location", "select", false, dropdownData.Location],
// //               ["CustCd", "Customer Name", "select", false, dropdownData.Customer],
// //               ["BGNDT", "Bill Date", "date", false],
// //               ["BillType", "Bill Type", "select", false, dropdownData.BillType],
// //               ["PriceType", "Price Type", "select", false, dropdownData.Price],
// //               ["TaxType", "Tax Type", "select", false, dropdownData.TAX],
// //               ["RefDt", "Reference Date", "date", false],
// //               ["DueDT", "Due Date", "date", false],
// //               ["Collection", "Collection", "text", false],
// //               ["DueDays", "Bill Due Days", "number", false],
// //               ["OverDuePer", "OverDue Percentage(%)", "number", false],
// //               ["BillAmt", "Bill Amount", "number", false],
// //               ["Dely_Address", "Delivery Address", "textarea", false],
// //               ["Remarks", "Remarks", "textarea", false],
// //             ].map(([name, label, type, isRequired, options], index) => (
// //               <div key={index} className={`flex items-center ${type === "textarea" ? "md:col-span-2" : ""}`}>
// //                 <label className={`text-gray-700 font-medium ${type === "textarea" ? "lg:w-1/6" : ""} w-1/3 text-left`}>{label}</label>
// //                 {type === "select" ? (
// //                   <select
// //                     name={name}
// //                     value={formData.InvMst[name] || ""}
// //                     onChange={(e) => handleInputChange(e)}
// //                     className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
// //                     required={isRequired}
// //                   >
// //                     <option value="">Select {label}</option>
// //                     {options?.map((option, idx) => (
// //                       <option
// //                         key={idx}
// //                         value={
// //                           name === "CustCd"
// //                             ? option.CustomerCode // For Customer dropdown
// //                             : name === "StockLoc"
// //                               ? option.LocationCode // For Stock Location dropdown
// //                               : option.DocCode // Fallback for other dropdowns
// //                         }
// //                       >
// //                         {name === "CustCd"
// //                           ? option.CustomerName // For Customer dropdown
// //                           : name === "StockLoc"
// //                             ? option.LocationName // For Stock Location dropdown
// //                             : option.CodeDesc // Fallback for other dropdowns
// //                         }
// //                       </option>
// //                     ))}
// //                   </select>
// //                 ) : type === "textarea" ? (
// //                   <textarea
// //                     name={name}
// //                     value={formData.InvMst[name] || ""}
// //                     onChange={(e) => handleInputChange(e)}
// //                     className="p-2 w-2/3 lg:w-5/6 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none resize-none"
// //                     rows="2"
// //                     required={isRequired}
// //                   />
// //                 ) : (
// //                   <input
// //                     type={type}
// //                     name={name}
// //                     value={type === "date" ? (formData.InvMst[name] ? moment(formData.InvMst[name]).format("YYYY-MM-DD") : "") : formData.InvMst[name] || ""}
// //                     onChange={(e) => handleInputChange(e)}
// //                     className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
// //                     required={isRequired}
// //                     readOnly={name === "OverDuePer" || name === "DueDays" || name === "BGNDT"}
// //                   />
// //                 )}
// //               </div>
// //             ))}
// //           </div>
// //           {!isBlacklisted && (
// //             <>
// //               <h6 className="flex justify-center text-xl font-bold py-5">Invoice Details</h6>
// //               <div className="relative overflow-x-auto shadow-md sm:rounded-lg border">
// //                 <table className="w-full text-sm text-center text-gray-700 dark:text-gray-300 border border-gray-300">
// //                   <thead className="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-300 uppercase">
// //                     <tr>
// //                       {["SR No.", "ICode", "QTY", "DelQty", "Price","Discount","OthAmt", "NetPrice", "CHG1", "CHG2", "CHG3", "CHG4", "CHG5", "NetAmt", "Action"].map((heading, index) => (
// //                         <th key={index} className="px-3 py-2 border border-gray-300">{heading}</th>
// //                       ))}
// //                     </tr>
// //                   </thead>

// //                   <tbody>
// //                     {formData.Invdet.Invdet.map((Bill, index) => {
// //                       const qty = Number(Bill.QTY) || 0;
// //                       const netPrice = Number(Bill.NetPrice) || 0;
// //                       const othAmt = Number(Bill.OthAmt) || 0;
// //                       const chg1 = Number(Bill.CHG1) || 0;
// //                       const chg2 = Number(Bill.CHG2) || 0;
// //                       const chg3 = Number(Bill.CHG3) || 0;
// //                       const chg4 = Number(Bill.CHG4) || 0;
// //                       const chg5 = Number(Bill.CHG5) || 0;

// //                       // Auto-calculate DelQty and NetAmt
// //                       const autoDelQty = qty;
// //                       const netAmt = (qty * netPrice) + othAmt + chg1 + chg2 + chg3 + chg4 + chg5;

// //                       return (
// //                         <tr key={index} className="border border-gray-300">
// //                           <td className="py-2 border border-gray-300">{index + 1}</td>

// //                           {/* ICode */}
// //                           <td className="p-2 border border-gray-300">
// //                             <input
// //                               type="text"
// //                               name="ICode"
// //                               value={Bill.ICode || ""}
// //                               onChange={(e) => handleInputChange(e, "Invdet", index)}
// //                               className="p-1 w-full bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-center"
// //                             />
// //                           </td>

// //                           {/* QTY */}
// //                           <td className="p-2 border border-gray-300">
// //                             <input
// //                               type="number"
// //                               name="QTY"
// //                               value={qty}
// //                               onChange={(e) => handleInputChange(e, "Invdet", index)}
// //                               className="p-1 w-full bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-center"
// //                             />
// //                           </td>

// //                           {/* DelQty (auto-filled) */}
// //                           <td className="p-2 border border-gray-300">
// //                             <input
// //                               type="number"
// //                               name="DelQty"
// //                               value={autoDelQty}
// //                               readOnly
// //                               className="p-1 w-full bg-gray-200 dark:bg-gray-700 rounded-md border border-gray-300 text-center"
// //                             />
// //                           </td>
// //                            {/* Price */}
// //                            <td className="p-2 border border-gray-300">
// //                             <input
// //                               type="number"
// //                               name="Price"
// //                               // value={""}
// //                               readOnly
// //                               className="p-1 w-full bg-gray-200 dark:bg-gray-700 rounded-md border border-gray-300 text-center"
// //                             />
// //                           </td> {/* Discount*/}
// //                           <td className="p-2 border border-gray-300">
// //                             <input
// //                               type="Discount"
// //                               name="DelQty"
// //                               // value={""}
// //                               readOnly
// //                               className="p-1 w-full bg-gray-200 dark:bg-gray-700 rounded-md border border-gray-300 text-center"
// //                             />
// //                           </td>

// //                           {/* OthAmt */}
// //                           <td className="p-2 border border-gray-300">
// //                             <input
// //                               type="number"
// //                               name="OthAmt"
// //                               value={Bill.OthAmt || ""}
// //                               onChange={(e) => handleInputChange(e, "Invdet", index)}
// //                               className="p-1 w-full bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-center"
// //                             />
// //                           </td>

// //                           {/* NetPrice */}
// //                           <td className="p-2 border border-gray-300">
// //                             <input
// //                               type="number"
// //                               name="NetPrice"
// //                               value={Bill.NetPrice || ""}
// //                               onChange={(e) => handleInputChange(e, "Invdet", index)}
// //                               className="p-1 w-full bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-center"
// //                             />
// //                           </td>

// //                           {/* CHG1 - CHG5 */}
// //                           {[1, 2, 3, 4, 5].map((chgIndex) => (
// //                             <td key={chgIndex} className="p-2 border border-gray-300">
// //                               <input  type="number" className=" p-1 w-full bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-center"/>
// //                               <input
// //                                 type="number"
// //                                 name={`CHG${chgIndex}`}
// //                                 value={Bill[`CHG${chgIndex}`] || ""}
// //                                 onChange={(e) => handleInputChange(e, "Invdet", index)}
// //                                 className="p-1 w-full bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-center my-2"
// //                               />
// //                             </td>
// //                           ))}

// //                           {/* NetAmt (auto-calculated) */}
// //                           <td className="p-2 border border-gray-300">
// //                             <input
// //                               type="number"
// //                               name="NetAmt"
// //                               value={netAmt}
// //                               readOnly
// //                               className="p-1 w-full bg-gray-200 dark:bg-gray-700 rounded-md border border-gray-300 text-center"
// //                             />
// //                           </td>

// //                           {/* Action */}
// //                           <td className="py-2 border border-gray-300">
// //                             {formData.Invdet.Invdet.length > 1 && (
// //                               <button
// //                                 type="button"
// //                                 onClick={() => handleRemoveInvoiceDetail(index)}
// //                                 className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition"
// //                               >
// //                                 <FontAwesomeIcon icon={faTrash} />
// //                               </button>
// //                             )}
// //                           </td>
// //                         </tr>
// //                       );
// //                     })}
// //                   </tbody>

// //                   {/* Total NetAmt Row */}
// //                   <tfoot>
// //                     <tr className="bg-gray-200 font-bold">
// //                       <td colSpan={13} className="py-2 border border-gray-300 text-right">Total NetAmt:</td>
// //                       <td className="py-2 border border-gray-300 text-center">
// //                         {formData.Invdet.Invdet.reduce((total, Bill) => {
// //                           const qty = Number(Bill.QTY) || 0;
// //                           const netPrice = Number(Bill.NetPrice) || 0;
// //                           const othAmt = Number(Bill.OthAmt) || 0;
// //                           const chg1 = Number(Bill.CHG1) || 0;
// //                           const chg2 = Number(Bill.CHG2) || 0;
// //                           const chg3 = Number(Bill.CHG3) || 0;
// //                           const chg4 = Number(Bill.CHG4) || 0;
// //                           const chg5 = Number(Bill.CHG5) || 0;

// //                           return total + (qty * netPrice + othAmt + chg1 + chg2 + chg3 + chg4 + chg5);
// //                         }, 0)}
// //                       </td>
// //                       <td className="py-2 border border-gray-300"></td>
// //                     </tr>

// //                     {/* Add New Row Button */}
// //                     <tr>
// //                       <td colSpan={13} className="px-4 py-3 text-center">
// //                         <button
// //                           type="button"
// //                           onClick={handleAddInvoiceDetail}
// //                           className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
// //                         >
// //                           + Add New Row
// //                         </button>
// //                       </td>
// //                     </tr>
// //                   </tfoot>
// //                 </table>

// //               </div>

// //               <div className="flex items-center justify-between mt-4">
// //                 <button
// //                   type="button"
// //                   onClick={() => setFormData(initialState)}
// //                   className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition duration-200"
// //                 >
// //                   Cancel
// //                 </button>
// //                 <button
// //                   type="submit"
// //                   className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
// //                 >
// //                   Submit
// //                 </button>
// //               </div>
// //             </>
// //           )}
// //         </form>
// //       </div>
// //     </div>
// //   );
// // };

// // export default InvoiceMaster;

"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  addInvoice,
  fetchDropdownData,
  Finyear,
  USPInvoiceCustItemLocationChanged,
  USPITEMWiseTaxDetails,
  USPSearchInvoiceItem,
} from "@/lib/masterService";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAlignLeft, faTrash } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const InvoiceMaster = () => {
  const { setIsSidebarOpen, userDetail } = useAuth();

  // Initialize BGNDT with today's date
  const initialState = {
    InvMst: {
      BGNDT: moment().format("YYYY-MM-DD"), // Set today's date
      RefDt: moment().format("YYYY-MM-DD"), // Set today's date
      DueDT: moment().format("YYYY-MM-DD"), // Set today's date
    },
    Invdet: {
      Invdet: [
        {
          ICode: "",
          QTY: 0,
          DelQty: 0,
          OthAmt: 0,
          NetPrice: 0,
          CHG1: 0,
          CHG2: 0,
          CHG3: 0,
          CHG4: 0,
          CHG5: 0,
          NetAmt: 0,
        },
      ],
    },
  };
  const [formData, setFormData] = useState(initialState);
  const [isBlacklisted, setIsBlacklisted] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownData, setDropdownData] = useState({
    Customer: [],
    BillType: [],
    TAX: [],
    Price: [],
    Location: [],
  });
  const [enabledCharges, setEnabledCharges] = useState([]); // State to hold enabled charges

  useEffect(() => {
    if (userDetail?.CompanyCode) {
      Object.keys(dropdownData).forEach((key) => {
        handleDropdownData(userDetail.CompanyCode, key);
      });
    }
  }, [userDetail?.CompanyCode]);

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

  const parseChargesDetails = (chargesString) => {
    const chargesArray = chargesString.split("*/"); // Split by the main delimiter
    const enabledCharges = [];

    chargesArray.forEach((charge, index) => {
      const parts = charge.split("~"); // Split by '~'
      if (parts.length >= 3) {
        // Ensure there are enough parts
        const isEnabled = parts[2]; // Enabled status (Y or N)
        if (isEnabled === "Y") {
          enabledCharges.push({
            key: `CHG${index + 1}`, // Create keys like CHG1, CHG2, etc.
            name: parts[1], // Charge name (e.g., CGST(%), SGST(%), etc.)
          });
        }
      }
    });

    return enabledCharges;
  };

  const fetchCustomerDetails = async (customerCode) => {
    try {
      const response = await USPInvoiceCustItemLocationChanged({
        CustCd: customerCode,
      });

      if (response.status) {
        const customerData = response.data;

        // ✅ Check if blacklisted
        if (customerData.IsBlackList === "1") {
          Swal.fire({
            icon: "error",
            title: "Blacklisted Customer",
            text: "The Same Customer has been declared as Black Listed",
            confirmButtonText: "OK",
            confirmButtonColor: "#d33",
          });
          setIsBlacklisted(true); // 🚫 Mark as blacklisted
          setFormData(initialState); // ❌ Clear form data
          return; // Exit the function
        } else {
          setIsBlacklisted(false); // ✅ Not blacklisted
        }

        // Parse ChargesDetails and set enabled charges
        const enabledCharges = parseChargesDetails(customerData.ChargesDetails);
        setEnabledCharges(enabledCharges); // Store enabled charges in state

        // ✅ Update formData for non-blacklisted customers
        setFormData((prev) => ({
          ...prev,
          InvMst: {
            ...prev.InvMst,
            Dely_Address: customerData.Dely_Address || "",
            OverDuePer: customerData.Overdue_Interest || "",
            PriceType: customerData.PriceType || "",
            BillType: customerData.CustCat || "",
            TaxType: customerData.CodeID || "",
            DueDays: customerData.CRDAYS || "",
          },
        }));
      } else {
        toast.error("Failed to fetch customer location data.");
      }
    } catch (error) {
      console.error("Error fetching customer details:", error);
    }
  };

  const fetchItemDetails = async (prefixText, index) => {
    try {
      if(prefixText){
        const itemDetails = await USPSearchInvoiceItem({ prefixText });
        setSearchResults(itemDetails.data); // Assuming itemDetails is an array of items
        setShowDropdown(true);
      }
    } catch (error) {
      console.error("Error fetching item details:", error);
    }
  };

  // const handleItemSelect = async (itemCode, index) => {
  //   setShowDropdown(false);
  //   setFormData((prev) => {
  //     const newData = { ...prev };
  //     newData.Invdet.Invdet[index].ICode = itemCode;
  //     return newData;
  //   });

  //   // Fetch tax details
  //   const taxDetails = await USPITEMWiseTaxDetails({
  //     itemCode,
  //     taxType: formData.InvMst.TaxType,
  //     priceType: formData.InvMst.PriceType,
  //   });

  //   setFormData((prev) => {
  //     const newData = { ...prev };
  //     newData.Invdet.Invdet[index] = {
  //       ...newData.Invdet.Invdet[index],
  //       CHG1: taxDetails.CHG1 || 0,
  //       CHG2: taxDetails.CHG2 || 0,
  //       CHG3: taxDetails.CHG3 || 0,
  //       CHG4: taxDetails.CHG4 || 0,
  //       CHG5: taxDetails.CHG5 || 0,
  //     };
  //     return newData;
  //   });
  // };


  const handleItemSelect = async (itemCode, index) => {
    try {
      // Hide the dropdown
      setShowDropdown(false);
  
      // Update formData with the selected item code
      setFormData((prev) => {
        const newData = { ...prev };
        newData.Invdet.Invdet[index].ICode = itemCode;
        return newData;
      });
  
      // Fetch tax details
      const taxDetails = await USPITEMWiseTaxDetails({
        itemCode,
        taxType: formData.InvMst.TaxType,
        priceType: formData.InvMst.PriceType,
      });
  
      // Check if taxDetails is available
      if (!taxDetails) {
        console.log("No tax details found for the selected item.");
        toast.error("No tax details found for the selected item.");
        return;
      }
  
      // Parse CHGCODE, CHGColumns, and priceColumns  
      const chgCodes = taxDetails.CHGCODE.split("*/");
      const chgColumns = taxDetails.CHGColumns.split("*/");
      const priceColumns = taxDetails.priceColumns.split("*/");
  
      // Extract enabled charges and their values
      const enabledCharges = chgCodes
        .map((code, idx) => {
          const [chgKey, chgName, isEnabled, sign] = code.split("~");
          if (isEnabled === "Y") {
            return {
              key: `CHG${idx + 1}`,
              name: chgName,
              value: parseFloat(chgColumns[idx]),
              sign: sign,
            };
          }
          return null;
        })
        .filter(Boolean);
  
      // Set enabled charges in state
      setEnabledCharges(enabledCharges);
  
      // Update formData with tax details, price, and discount
      setFormData((prev) => {
        const newData = { ...prev };
        newData.Invdet.Invdet[index] = {
          ...newData.Invdet.Invdet[index],
          Price: parseFloat(priceColumns[0]),
          Discount: parseFloat(priceColumns[1]),
          ...enabledCharges.reduce((acc, charge) => {
            acc[charge.key] = charge.value;
            return acc;
          }, {}),
        };
        return newData;
      });
    } catch (error) {
      console.error("An error occurred while handling item selection:", error);
    }
  };


  const handleInputChange = (e, section = "InvMst", index = 0) => {
    const { name, value, type, checked } = e.target;
    const updatedValue = type === "checkbox" ? checked : value;

    setFormData((prev) => {
      const newData = { ...prev };
      if (section === "InvMst") {
        newData.InvMst[name] = updatedValue;

        // Call the API when CustCd changes
        if (name === "CustCd") {
          fetchCustomerDetails(updatedValue);
        }
      } else if (section === "Invdet") {
        newData.Invdet.Invdet[index][name] = updatedValue;
        if (name === "ICode") {
          fetchItemDetails(updatedValue, index);
        }
      }
      return newData;
    });
  };

  const handleAddInvoiceDetail = () => {
    setFormData((prev) => ({
      ...prev,
      Invdet: {
        Invdet: [
          ...prev.Invdet.Invdet,
          initialState.Invdet.Invdet[0],
        ],
      },
    }));
  };

  const handleRemoveInvoiceDetail = (index) => {
    setFormData((prev) => ({
      ...prev,
      Invdet: {
        Invdet: prev.Invdet.Invdet.filter((_, i) => i !== index),
      },
    }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();

    // Define which fields should be numbers
    const numberFields = [
      "DueDays",
      "OverDuePer",
      "BillAmt",
      "QTY",
      "DelQty",
      "OthAmt",
      "NetPrice",
      "CHG1",
      "CHG2",
      "CHG3",
      "CHG4",
      "CHG5",
      "NetAmt",
    ];

    // Create a deep copy of the formData to avoid mutating the original state
    const payload = JSON.parse(JSON.stringify(formData));

    // Convert number fields to numbers
    Object.keys(payload.InvMst).forEach((key) => {
      if (numberFields.includes(key)) {
        payload.InvMst[key] = Number(payload.InvMst[key]);
      }
    });

    payload.Invdet.Invdet.forEach((detail) => {
      Object.keys(detail).forEach((key) => {
        if (numberFields.includes(key)) {
          detail[key] = Number(detail[key]);
        }
      });
    });

    // Add additional fields to the payload
    payload.CompanyCode = userDetail.CompanyCode;
    payload.Finyear = Finyear;
    payload.Billno = "";
    payload.Brcd = "2";

    try {
      const response = await addInvoice(payload);
      console.log("API Response:", response);

      if (response.status) {
        toast.success(response.message);
        setFormData(initialState);
      } else {
        toast.error(response.data.message || "An error occurred while processing your request.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className={`p-8 w-full lg:w-[calc(100vw-288px)] ml-0 lg:ml-[288px] text-black min-h-screen`}>
      <button
        className="lg:hidden text-black p-3 flex justify-start"
        onClick={() => setIsSidebarOpen(true)}
      >
        <FontAwesomeIcon icon={faAlignLeft} />
      </button>
      <div className="bg-white p-8 rounded-lg shadow-lg space-y-8">
        <div className="flex justify-between items-center">
          <h4 className="text-2xl font-bold">Invoice Master</h4>
        </div>
        <form onSubmit={handleAddSubmit} className="space-y-6 bg-white p-6 rounded-lg border-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              ["StockLoc", "Stock Location", "select", false, dropdownData.Location],
              ["CustCd", "Customer Name", "select", false, dropdownData.Customer],
              ["BGNDT", "Bill Date", "date", false],
              ["BillType", "Bill Type", "select", false, dropdownData.BillType],
              ["PriceType", "Price Type", "select", false, dropdownData.Price],
              ["TaxType", "Tax Type", "select", false, dropdownData.TAX],
              ["RefDt", "Reference Date", "date", false],
              ["DueDT", "Due Date", "date", false],
              ["Collection", "Collection", "text", false],
              ["DueDays", "Bill Due Days", "number", false],
              ["OverDuePer", "OverDue Percentage(%)", "number", false],
              ["BillAmt", "Bill Amount", "number", false],
              ["Dely_Address", "Delivery Address", "textarea", false],
              ["Remarks", "Remarks", "textarea", false],
            ].map(([name, label, type, isRequired, options], index) => (
              <div key={index} className={`flex items-center ${type === "textarea" ? "md:col-span-2" : ""}`}>
                <label className={`text-gray-700 font-medium ${type === "textarea" ? "lg:w-1/6" : ""} w-1/3 text-left`}>{label}</label>
                {type === "select" ? (
                  <select
                    name={name}
                    value={formData.InvMst[name] || ""}
                    onChange={(e) => handleInputChange(e)}
                    className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                    required={isRequired}
                  >
                    <option value="">Select {label}</option>
                    {options?.map((option, idx) => (
                      <option
                        key={idx}
                        value={
                          name === "CustCd"
                            ? option.CustomerCode // For Customer dropdown
                            : name === "StockLoc"
                              ? option.LocationCode // For Stock Location dropdown
                              : option.DocCode // Fallback for other dropdowns
                        }
                      >
                        {name === "CustCd"
                          ? option.CustomerName // For Customer dropdown
                          : name === "StockLoc"
                            ? option.LocationName // For Stock Location dropdown
                            : option.CodeDesc // Fallback for other dropdowns
                        }
                      </option>
                    ))}
                  </select>
                ) : type === "textarea" ? (
                  <textarea
                    name={name}
                    value={formData.InvMst[name] || ""}
                    onChange={(e) => handleInputChange(e)}
                    className="p-2 w-2/3 lg:w-5/6 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none resize-none"
                    rows="2"
                    required={isRequired}
                  />
                ) : (
                  <input
                    type={type}
                    name={name}
                    value={type === "date" ? (formData.InvMst[name] ? moment(formData.InvMst[name]).format("YYYY-MM-DD") : "") : formData.InvMst[name] || ""}
                    onChange={(e) => handleInputChange(e)}
                    className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                    required={isRequired}
                    readOnly={name === "OverDuePer" || name === "DueDays" || name === "BGNDT"}
                  />
                )}
              </div>
            ))}
          </div>
          {!isBlacklisted && (
            <>
              <h6 className="flex justify-center text-xl font-bold py-5">Invoice Details</h6>
              <div className="relative overflow-x-auto shadow-md sm:rounded-lg border">
                <table className="w-full text-sm text-center text-gray-700 dark:text-gray-300 border border-gray-300">
                  <thead className="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-300 uppercase">
                    <tr>
                      {["SR No.", "ICode", "QTY", "DelQty", "Price", "Discount", "OthAmt", "NetPrice"]
                        .concat(enabledCharges.map(charge => `${charge.name}(${charge.sign || "+"})`)) // Add enabled charge names
                        .concat(["NetAmt", "Action"])
                        .map((heading, index) => (
                          <th key={index} className="px-3 py-2 border border-gray-300">{heading}</th>
                        ))}
                    </tr>
                  </thead>

                  {/* <tbody>
                    {formData.Invdet.Invdet.map((Bill, index) => {
                      const qty = Number(Bill.QTY) || 0;
                      const netPrice = Number(Bill.NetPrice) || 0;
                      const othAmt = Number(Bill.OthAmt) || 0;
                      const chgValues = enabledCharges.map(charge => Number(Bill[charge.key]) || 0);

                      // Auto-calculate DelQty and NetAmt
                      const autoDelQty = qty;
                      const netAmt = (qty * netPrice) + othAmt + chgValues.reduce((sum, chg) => sum + chg, 0);

                      return (
                        <tr key={index} className="border border-gray-300">
                          <td className="py-2 border border-gray-300">{index + 1}</td>

                          <td className="border border-gray-300 p-2">
                            <input
                              type="text"
                              name="ICode"
                              autoComplete="off"
                              value={Bill.ICode || ""}
                              onChange={(e) => {
                                handleInputChange(e, "Invdet", index);
                                fetchItemDetails(e.target.value, index);
                              }}
                              className="bg-gray-100 border border-gray-300 p-1 rounded-md text-center w-full dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {showDropdown && (
                              <ul className="bg-white border border-gray-300 rounded-md shadow-lg absolute mt-1 z-10">
                                {Array.isArray(searchResults) && searchResults.map((item) => (
                                  <li
                                    key={item.code}
                                    onClick={() => handleItemSelect(item.code, index)}
                                    className="p-2 cursor-pointer hover:bg-gray-100"
                                  >
                                    {item.name}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </td>

                          <td className="p-2 border border-gray-300">
                            <input
                              type="number"
                              name="QTY"
                              value={qty}
                              onChange={(e) => handleInputChange(e, "Invdet", index)}
                              className="p-1 w-full bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-center"
                            />
                          </td>

                          <td className="p-2 border border-gray-300">
                            <input
                              type="number"
                              name="DelQty"
                              value={autoDelQty}
                              readOnly
                              className="p-1 w-full bg-gray-200 dark:bg-gray-700 rounded-md border border-gray-300 text-center"
                            />
                          </td>
                          <td className="p-2 border border-gray-300">
                            <input
                              type="number"
                              name="Price"
                              readOnly
                              className="p-1 w-full bg-gray-200 dark:bg-gray-700 rounded-md border border-gray-300 text-center"
                            />
                          </td>
                          <td className="p-2 border border-gray-300">
                            <input
                              type="Discount"
                              name="DelQty"
                              readOnly
                              className="p-1 w-full bg-gray-200 dark:bg-gray-700 rounded-md border border-gray-300 text-center"
                            />
                          </td>
                          <td className="p-2 border border-gray-300">
                            <input
                              type="number"
                              name="OthAmt"
                              value={Bill.OthAmt || ""}
                              onChange={(e) => handleInputChange(e, "Invdet", index)}
                              className="p-1 w-full bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-center"
                            />
                          </td>
                          <td className="p-2 border border-gray-300">
                            <input
                              type="number"
                              name="NetPrice"
                              value={Bill.NetPrice || ""}
                              onChange={(e) => handleInputChange(e, "Invdet", index)}
                              className="p-1 w-full bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-center"
                            />
                          </td>

                          {enabledCharges.map((charge) => (
                          <td key={charge.key} className="p-2 border border-gray-300">
                            <input
                              type="number"
                              name={charge.key}
                              value={Bill[charge.key] || ""}
                              onChange={(e) => handleInputChange(e, "Invdet", index)}
                              className="p-1 w-full bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-center"
                            />
                            <input
                            value={Bill[charge.key]}
                            className="p-1 mt-1 w-full bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-center"
                            readOnly
                            />
                          </td>
                        ))}
                          <td className="p-2 border border-gray-300">
                            <input
                              type="number"
                              name="NetAmt"
                              value={netAmt}
                              readOnly
                              className="p-1 w-full bg-gray-200 dark:bg-gray-700 rounded-md border border-gray-300 text-center"
                            />
                          </td>
                          <td className="py-2 border border-gray-300">
                            {formData.Invdet.Invdet.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveInvoiceDetail(index)}
                                className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition"
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody> */}
    <tbody>
  {formData.Invdet.Invdet.map((Bill, index) => {
    const qty = Number(Bill.QTY) || 0;
    const price = Number(Bill.Price) || 0;
    const discount = Number(Bill.Discount) || 0;
    const netPrice = (price - discount) * qty; // Calculate NetPrice
    const othAmt = Number(Bill.OthAmt) || 0;

    const chgValues = enabledCharges.map((charge) => {
      const chargeValue = Number(Bill[charge.key]) || 0; // Charge value from input
      const calculatedValue = netPrice * (chargeValue / 100); // Calculate percentage of NetPrice
      return charge.sign === "+" ? calculatedValue : -calculatedValue; // Apply sign
    });
    
    // Calculate NetAmt
    const netAmt = qty * netPrice + othAmt + chgValues.reduce((sum, chg) => sum + chg, 0);

    return (
      <tr key={index} className="border border-gray-300">
        <td className="py-2 border border-gray-300">{index + 1}</td>

        {/* ICode Input */}
        <td className="border border-gray-300 p-2">
          <input
            type="text"
            name="ICode"
            autoComplete="off"
            value={Bill.ICode || ""}
            onChange={(e) => {
              handleInputChange(e, "Invdet", index);
              fetchItemDetails(e.target.value, index);
            }}
            className="bg-gray-100 border border-gray-300 p-1 rounded-md text-center w-full dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {showDropdown && (
            <ul className="bg-white border border-gray-300 rounded-md shadow-lg absolute mt-1 z-10">
              {Array.isArray(searchResults) && searchResults.map((item) => (
                <li
                  key={`${item.code}-${index}`}
                  onClick={() => handleItemSelect(item.code, index)}
                  className="p-2 cursor-pointer hover:bg-gray-100"
                >
                  {item.name}
                </li>
              ))}
            </ul>
          )}
        </td>

        {/* QTY Input */}
        <td className="p-2 border border-gray-300">
          <input
            type="number"
            name="QTY"
            value={qty}
            onChange={(e) => handleInputChange(e, "Invdet", index)}
            className="p-1 w-full bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-center"
          />
        </td>

        {/* DelQty Input (Auto-calculated) */}
        <td className="p-2 border border-gray-300">
          <input
            type="number"
            name="DelQty"
            value={qty} // Auto-calculated as QTY
            readOnly
            className="p-1 w-full bg-gray-200 dark:bg-gray-700 rounded-md border border-gray-300 text-center"
          />
        </td>

        {/* Price Input */}
        <td className="p-2 border border-gray-300">
          <input
            type="number"
            name="Price"
            value={price}
            onChange={(e) => handleInputChange(e, "Invdet", index)}
            className="p-1 w-full bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-center"
          />
        </td>

        {/* Discount Input */}
        <td className="p-2 border border-gray-300">
          <input
            type="number"
            name="Discount"
            value={discount}
            onChange={(e) => handleInputChange(e, "Invdet", index)}
            className="p-1 w-full bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-center"
          />
        </td>
        {/* OthAmt Input */}
        <td className="p-2 border border-gray-300">
          <input
            type="number"
            name="OthAmt"
            value={othAmt}
            onChange={(e) => handleInputChange(e, "Invdet", index)}
            className="p-1 w-full bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-center"
          />
        </td>
         {/* NetPrice Input (Auto-calculated) */}
         <td className="p-2 border border-gray-300">
          <input
            type="number"
            name="NetPrice"
            value={netPrice}
            readOnly
            className="p-1 w-full bg-gray-200 dark:bg-gray-700 rounded-md border border-gray-300 text-center"
          />
        </td>

        {/* Enabled Charges Inputs */}
        {enabledCharges.map((charge) => {
  const chargeValue = Number(Bill[charge.key]) || 0; // Charge value from input
  const calculatedValue = netPrice * (chargeValue / 100) 
  const finalAns = charge.sign === "+" ?  calculatedValue :  - calculatedValue;

  return (
    <td key={charge.key} className="p-2 border border-gray-300">
      {/* Input for Charge Value */}
      <input
        type="number"
        name={charge.key}
        value={chargeValue}
        onChange={(e) => handleInputChange(e, "Invdet", index)}
        className="p-1 w-full bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-center"
      />

      {/* Calculated Value Display */}
      <input
        type="number"
        readOnly
        value={finalAns.toFixed(2)} // Display calculated value with 2 decimal places
        className="p-1 w-full bg-gray-200 mt-1 dark:bg-gray-700 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-center"
      />
    </td>
  );
})}

        {/* NetAmt Input (Auto-calculated) */}
        <td className="p-2 border border-gray-300">
          <input
            type="number"
            name="NetAmt"
            value={netAmt}
            readOnly
            className="p-1 w-full bg-gray-200 dark:bg-gray-700 rounded-md border border-gray-300 text-center"
          />
        </td>

        {/* Action Button (Remove Row) */}
        <td className="py-2 border border-gray-300">
          {formData.Invdet.Invdet.length > 1 && (
            <button
              type="button"
              onClick={() => handleRemoveInvoiceDetail(index)}
              className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          )}
        </td>
      </tr>
    );
  })}
</tbody>

                  {/* Total NetAmt Row */}
                  <tfoot>
  <tr className="bg-gray-200 font-bold">
    <td colSpan={8 + enabledCharges.length} className="py-2 border border-gray-300 text-right">Total NetAmt:</td>
    <td className="py-2 border border-gray-300 text-center">
      {formData.Invdet.Invdet.reduce((total, Bill) => {
        const qty = Number(Bill.QTY) || 0;
        const price = Number(Bill.Price) || 0;
        const discount = Number(Bill.Discount) || 0;
        const netPrice = price - discount;
        const othAmt = Number(Bill.OthAmt) || 0;
        const chgValues = enabledCharges.map((charge) => {
          const value = Number(Bill[charge.key]) || 0;
          return charge.sign === "+" ? value : -value;
        });
        return total + (qty * netPrice + othAmt + chgValues.reduce((sum, chg) => sum + chg, 0));
      }, 0)}
    </td>
    <td className="py-2 border border-gray-300"></td>
  </tr>
  <tr>
               <td colSpan={10 + enabledCharges.length} className="px-4 py-3 text-center">
                 <button
                          type="button"
                          onClick={handleAddInvoiceDetail}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                        >
                          + Add New Row
                        </button>
                      </td>
                    </tr>
</tfoot>
                </table>
              </div>

              <div className="flex items-center justify-between mt-4">
                <button
                  type="button"
                  onClick={() => setFormData(initialState)}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  Submit
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default InvoiceMaster;