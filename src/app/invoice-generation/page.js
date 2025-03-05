// // "use client"
// // import { useState } from "react";
// // import { useAuth } from "../context/AuthContext";

// // export default function InvoicePage() {
// //     const { setIsSidebarOpen, userDetail } = useAuth();
// //     const [isModalOpen, setIsModalOpen] = useState(false);
// //     const [formData, setFormData] = useState([]);
// //     const [dropdownData, setDropdownData] = useState({});


// //     const handleInputChange = (e) => {
// //       const { name, value, type, checked } = e.target;

// //       setFormData({
// //         ...formData,
// //         [name]: type === 'checkbox' ? checked : value,
// //       });
// //     };



// //       const handleSubmit = async (e) => {
// //         e.preventDefault();

// //         // try {
// //         //   const payload = {
// //         //     ...formData,
// //         //   };     

// //         //   let response;

// //         //   if (isEditMode) {
// //         //     response = await updateCustomer(payload);
// //         //   } else {
// //         //     response = await addCustomer(payload);
// //         //   }

// //         //   if (response.status) {
// //         //     fetchData();
// //         //     setIsModalOpen(false);
// //         //     setFormData({});
// //         //   } else {
// //         //     console.log(response.data.message);
// //         //   }
// //         // } catch (error) {
// //         //   console.log(error);
// //         //   console.error('Error during the submit action:', error?.response?.message || error.message);
// //         // }
// //       };

// //   return (
// //     <div className={`p-8 w-full lg:w-[calc(100vw-288px)] ml-0 lg:ml-[288px] text-black min-h-screen ${isModalOpen ? "overflow-hidden h-screen" : "overflow-auto"}`}>
// //     <button
// //       className="lg:hidden text-black p-3 flex justify-start"
// //       onClick={() => setIsSidebarOpen(true)}
// //     >
// //       <svg
// //         className="h-6 w-6"
// //         fill="none"
// //         viewBox="0 0 24 24"
// //         stroke="currentColor"
// //       >
// //         <path
// //           strokeLinecap="round"
// //           strokeLinejoin="round"
// //           strokeWidth={2}
// //           d="M4 6h16M4 12h16m-7 6h7"
// //         />
// //       </svg>
// //     </button>
// //     <div className="bg-white p-8 rounded-lg shadow-lg space-y-8">
// //       <div className="flex justify-between items-center">
// //         <h4 className="text-2xl font-bold">Invoice Generation</h4>
// //         {/* <button
// //           // onClick={handleAddClick}
// //           className="bg-blue-700 hover:bg-blue-800 hover:ring text-white rounded-md px-5 py-1 flex items-center"
// //         >
// //           <span className="text-2xl">+ </span> ADD
// //         </button> */}
// //       </div>
// //       <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50 ml-0 lg:ml-[288px] px-5">
// //           <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-6xl overflow-auto max-h-[90vh] border-2 border-gray-300">
// //             <div className="flex justify-between items-center mb-6">
// //               {/* <h3 className="text-2xl">{isEditMode ? "Edit Customer Master" : "Add Customer Master"}</h3> */}
// //               <h3 className="text-2xl">Add Customer Master</h3>
// //               {/* <button onClick={() => setIsModalOpen(false)} className="text-red-500 font-bold text-xl">X</button> */}
// //             </div>
// //             <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border-2">

// //               <div className="pb-4">
// //                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
// //                 {[
// //                 ["CompanyCode", "Company Code", "text", true],
// //                 ["LocationCode", "Location Code", "text", true],
// //               ].map(([name, label, type], index) => (
// //                 <div key={index} className="flex items-center">
// //                   <label className="text-gray-700 font-medium w-1/3 text-left">{label}</label>
// //                   <input
// //                     type={type}
// //                     name={name}
// //                     value={formData[name] || ""}
// //                     readOnly
// //                     className="p-2 w-2/3 bg-gray-200 rounded-md border border-gray-300 cursor-not-allowed"
// //                     disabled
// //                   />
// //                 </div>
// //               ))}
// //                   {[
// //                     ["GroupCode", "Group Code", "select", true, dropdownData.CMG],
// //                     ["BillType", "Bill Type", "select", true, dropdownData.BillType],
// //                     ["CustomerName", "Customer Name", "text", true],
// //                     ["CustomerLocationId", "Customer Location Id", "select", false, dropdownData.Location],
// //                   ].map(([name, label, type, isRequired, options], index) => (
// //                     <div key={index} className="flex items-center justify-start">
// //                       <label className="text-gray-700 font-medium w-1/3 text-left">{label}</label>
// //                       {type === "select" ? (
// //                     <select
// //                     name={name}
// //                     value={formData[name] || ""}
// //                     onChange={handleInputChange}
// //                     className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
// //                     required={isRequired}
// //                   >
// //                     <option value="">Select {label}</option>
// //                     {/* {options.map((option, idx) => (
// //                       <option key={idx} value={name === "CustomerLocationId"? option.LocationCode: option.DocCode}>
// //                         {name === "CustomerLocationId"? option.LocationName : option.CodeDesc}
// //                       </option>
// //                     ))} */}
// //                   </select>
// //                       ) : (
// //                         <input
// //                           type={type}
// //                           name={name}
// //                           value={formData[name] || ""}
// //                           onChange={handleInputChange}
// //                           className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
// //                           required={isRequired}
// //                         />
// //                       )}
// //                     </div>
// //                   ))}
// //                 </div>
// //               </div>

// //               <div className="pb-4">
// //                 <div className='text-xl font-semibold flex justify-center pb-2'>Contact Details </div>
// //                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
// //                   {[
// //                     ["MobileNo", "Mobile No", "number", true],
// //                     ["PhoneNo", "Phone No", "number", true],
// //                     ["EmailId", "Email ID", "email", true],
// //                     ["Address", "Address", "textarea", true],
// //                     ["DeliveryAddress", "Delivery Address", "textarea", true],
// //                     ["City", "City", "select", false, dropdownData.City],
// //                     ["State", "State", "select", true, dropdownData.State],
// //                     ["Pincode", "Pin Code", "text", false],
// //                   ].map(([name, label, type, isRequired, options], index) => (
// //                     <div key={index} className={`flex items-center ${type === "textarea" ? "md:col-span-2" : ""}`}>
// //                     <label className={`text-gray-700 font-medium ${label.includes("Address") ? "lg:w-1/6" : ""} w-1/3 text-left`}>{label}</label>
// //                       {type === "select" ? (
// //                         <select
// //                           name={name}
// //                           value={formData[name] || ""}
// //                           onChange={handleInputChange}
// //                           className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
// //                           required={isRequired}
// //                         >
// //                           <option value="">Select {label}</option>
// //                           {/* {options.map((option, idx) => (
// //                             <option key={idx} value={option.DocCode}>
// //                               {option.CodeDesc}
// //                             </option>
// //                           ))} */}
// //                         </select>
// //                       ) : type === "textarea" ? (
// //                         <textarea
// //                           name={name}
// //                           value={formData[name] || ""}
// //                           onChange={handleInputChange}
// //                           className="p-2 w-2/3 lg:w-5/6 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none resize-none"
// //                           rows="2"
// //                           required={isRequired}
// //                         />
// //                       ) : (
// //                         <input
// //                           type={type}
// //                           name={name}
// //                           value={formData[name] || ""}
// //                           onChange={handleInputChange}
// //                           className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
// //                           required={isRequired}
// //                         />
// //                       )}
// //                     </div>
// //                   ))}
// //                 </div>
// //               </div>

// //               <div className="border-b pb-4">

// //                 <div className='text-xl font-semibold flex justify-center pb-2'> Account Details </div>
// //                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
// //                   {[
// //                     ["CrDays", "Credit Days", "number", true],
// //                     ["CRLimit", "Credit Limit", "number", true],
// //                     ["OverDue_Interest", "OverDue Interest", "number", true],
// //                     ["PanNo", "PAN No", "text", true],
// //                     ["TaxType", "Tax Type", "select", true, dropdownData.TAX],
// //                     ["PriceType", "Price Type","select", true, dropdownData.Price],
// //                     ["FinYear", "Fin Year", "text", true],
// //                   ].map(([name, label, type, isRequired, options], index) => (
// //                     <div key={index} className="flex items-center justify-start">
// //                       <label className="text-gray-700 font-medium w-1/3 text-left">{label}</label>
// //                       {type === "select" ? (
// //                         <select
// //                           name={name}
// //                           value={formData[name] || ""}
// //                           onChange={handleInputChange}
// //                           className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
// //                           required={isRequired}
// //                         >
// //                           <option value="">Select {label}</option>
// //                           {/* {options.map((option, idx) => (
// //                             <option key={idx} value={option.DocCode}>
// //                               {option.CodeDesc}
// //                             </option>
// //                           ))} */}
// //                         </select>
// //                       ) : (
// //                         <input
// //                           type={type}
// //                           name={name}
// //                           value={formData[name] || ""}
// //                           onChange={handleInputChange}
// //                           className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
// //                           required={isRequired}
// //                           readOnly={name === "FinYear"}
// //                         />
// //                       )}
// //                     </div>
// //                   ))}

// //                 </div>
// //               </div>
// //               <div className="flex flex-wrap items-center justify-between gap-2 mt-4">
// //               <div className="flex items-center space-x-2">
// //                   <input
// //                     type="checkbox"
// //                     name="IsActive"
// //                     checked={formData.IsActive || false}
// //                     onChange={handleInputChange}
// //                     className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-gray-500"
// //                   />
// //                   <label className="text-gray-700 font-medium">Is Active</label>
// //                 </div>
// //                 <div className="flex items-center space-x-2">
// //                   <input
// //                     type="checkbox"
// //                     name="IsBlackList"
// //                     checked={formData.IsBlackList || false}
// //                     onChange={handleInputChange}
// //                     className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-gray-500"
// //                   />
// //                   <label className="text-gray-700 font-medium">Is BlackList</label>
// //                 </div>
// //                 {/* </div>
// //               <div className="flex flex-col lg:flex-row items-center justify-between mt-4"> */}
// //                 <div className="flex items-center space-x-2">
// //                   <label className="text-gray-700 font-medium">{`If Credit Limit < OutStanding Amount Allow Transaction Y/N`}</label>
// //                   <input
// //                     type="checkbox"
// //                     name="IsAllow_Trn"
// //                     checked={formData.IsAllow_Trn || false}
// //                     onChange={handleInputChange}
// //                     className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-gray-500"
// //                   />
// //                 </div>
// //                 <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200">
// //                   {/* {isEditMode ? "Update Customer" : "Add Customer"} */}
// //                  Add Customer
// //                 </button>
// //               </div>
// //             </form>
// //           </div>
// //         </div>
// //       </div>
// //       </div>
// //   );
// // }


// // "use client"
// // import { useState } from "react";
// // import Table from "../components/Table";

// // export default function InvoiceForm() {
// //   const [formData, setFormData] = useState({
// //     InvMst: {
// //       BBRCD: "",
// //       BillType: "",
// //       BillType2: "",
// //       BGNDT: "",
// //       BCLBRCD: "",
// //       DueDT: "",
// //       DueDays: 0,
// //       OverDuePer: 0,
// //       CustCd: "",
// //       Qty: 0,
// //       DeliveredQty: 0,
// //       Discount: 0,
// //       OthAmt: 0,
// //       BillAmt: 0,
// //       Remarks: "",
// //       PriceType: "",
// //       TaxType: "",
// //       WI_Mob: "",
// //       WI_Address: "",
// //       Dely_Address: "",
// //       Billing_Name: "",
// //       Billing_Address: "",
// //       Billing_Contact: "",
// //       Billing_Pincode: "",
// //       Billing_City: "",
// //       Billing_State: "",
// //       Billing_Country: "",
// //       Shipping_Name: "",
// //       Shipping_Address: "",
// //       Shipping_contact: "",
// //       Shipping_Pincode: "",
// //       Shipping_City: "",
// //       Shipping_State: "",
// //       Shipping_Country: "",
// //       GSTNO: "",
// //       RefNo: "",
// //       RefDt: "",
// //       Dbt_Ledger: "",
// //       CHG1: 0,
// //       CHG2: 0,
// //       CHG3: 0,
// //       CHG4: 0,
// //       CHG5: 0,
// //       CHG6: 0,
// //       CHG7: 0,
// //       CHG8: 0,
// //       CHG9: 0,
// //       CHG10: 0,
// //       Vip_Disc: 0,
// //       RoundOffAmt: 0,
// //       CompanyCode: "",
// //       InvFlagFrom: "",
// //       Collection: "",
// //       StockLoc: "",
// //       OrderID: "",
// //       OrderDate: "",
// //     },
// //     Invdet: {
// //       Invdet: [
// //         {
// //           ICode: "",
// //           Acccode: "",
// //           Price: 0,
// //           Dicount: 0,
// //           OthAmt: 0,
// //           PriceType: "",
// //           QTY: 0,
// //           DelQty: 0,
// //           TaxType: "",
// //           CHG1: 0,
// //           CHG2: 0,
// //           CHG3: 0,
// //           CHG4: 0,
// //           CHG5: 0,
// //           CHG6: 0,
// //           CHG7: 0,
// //           CHG8: 0,
// //           CHG9: 0,
// //           CHG10: 0,
// //           NetAmt: 0,
// //           NetPrice: 0,
// //           Add_Desc: "",
// //           RoomType: "",
// //           OtherChargeItemWise: 0,
// //           OtherCharge_TaxAmount: 0,
// //           OtherCharge_Add_TaxAmount: 0,
// //           OtherCharge_IGST_TaxAmount: 0,
// //         },
// //       ],
// //     },
// //     Billno: "",
// //     InvType: "",
// //     TrnType: "",
// //     Brcd: "",
// //     Finyear: "",
// //     CompanyCode: "",
// //   });

// //   const handleInputChange = (e, section, index = null) => {
// //     const { name, value, type, checked } = e.target;

// //     setFormData((prevData) => {
// //       const newData = { ...prevData };

// //       if (section === "InvMst") {
// //         newData.InvMst = {
// //           ...newData.InvMst,
// //           [name]: type === "checkbox" ? checked : value,
// //         };
// //       } else if (section === "Invdet" && index !== null) {
// //         const updatedInvdet = [...newData.Invdet.Invdet];
// //         updatedInvdet[index] = {
// //           ...updatedInvdet[index],
// //           [name]: type === "checkbox" ? checked : value,
// //         };
// //         newData.Invdet.Invdet = updatedInvdet;
// //       } else {
// //         newData[section] = {
// //           ...newData[section],
// //           [name]: type === "checkbox" ? checked : value,
// //         };
// //       }

// //       return newData;
// //     });
// //   };

// //   const handleAddItem = () => {
// //     setFormData((prevData) => ({
// //       ...prevData,
// //       Invdet: {
// //         Invdet: [
// //           ...prevData.Invdet.Invdet,
// //           {
// //             ICode: "",
// //             Acccode: "",
// //             Price: 0,
// //             Dicount: 0,
// //             OthAmt: 0,
// //             PriceType: "",
// //             QTY: 0,
// //             DelQty: 0,
// //             TaxType: "",
// //             CHG1: 0,
// //             CHG2: 0,
// //             CHG3: 0,
// //             CHG4: 0,
// //             CHG5: 0,
// //             CHG6: 0,
// //             CHG7: 0,
// //             CHG8: 0,
// //             CHG9: 0,
// //             CHG10: 0,
// //             NetAmt: 0,
// //             NetPrice: 0,
// //             Add_Desc: "",
// //             RoomType: "",
// //             OtherChargeItemWise: 0,
// //             OtherCharge_TaxAmount: 0,
// //             OtherCharge_Add_TaxAmount: 0,
// //             OtherCharge_IGST_TaxAmount: 0,
// //           },
// //         ],
// //       },
// //     }));
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     console.log("Form Data:", formData);
// //     // Add your API call here
// //   };

// //   const renderFormFields = (section, index = null) => {
// //     const fields = [
// //       ["BBRCD", "BBRCD", "text", true],
// //       ["BillType", "Bill Type", "select", true, ["Invoice", "Retail"]],
// //       ["BillType2", "Bill Type 2", "text", true],
// //       ["BGNDT", "BGNDT", "date", true],
// //       ["BCLBRCD", "BCLBRCD", "text", true],
// //       ["DueDT", "Due Date", "date", true],
// //       ["DueDays", "Due Days", "number", true],
// //       ["OverDuePer", "Over Due Percentage", "number", true],
// //       ["CustCd", "Customer Code", "text", true],
// //       ["Qty", "Quantity", "number", true],
// //       ["DeliveredQty", "Delivered Quantity", "number", true],
// //       ["Discount", "Discount", "number", true],
// //       ["OthAmt", "Other Amount", "number", true],
// //       ["BillAmt", "Bill Amount", "number", true],
// //       ["Remarks", "Remarks", "text", false],
// //       ["PriceType", "Price Type", "text", true],
// //       ["TaxType", "Tax Type", "text", true],
// //       ["WI_Mob", "Warehouse Mobile", "text", true],
// //       ["WI_Address", "Warehouse Address", "text", true],
// //       ["Dely_Address", "Delivery Address", "text", true],
// //       ["Billing_Name", "Billing Name", "text", true],
// //       ["Billing_Address", "Billing Address", "text", true],
// //       ["Billing_Contact", "Billing Contact", "text", true],
// //       ["Billing_Pincode", "Billing Pincode", "text", true],
// //       ["Billing_City", "Billing City", "text", true],
// //       ["Billing_State", "Billing State", "text", true],
// //       ["Billing_Country", "Billing Country", "text", true],
// //       ["Shipping_Name", "Shipping Name", "text", true],
// //       ["Shipping_Address", "Shipping Address", "text", true],
// //       ["Shipping_contact", "Shipping Contact", "text", true],
// //       ["Shipping_Pincode", "Shipping Pincode", "text", true],
// //       ["Shipping_City", "Shipping City", "text", true],
// //       ["Shipping_State", "Shipping State", "text", true],
// //       ["Shipping_Country", "Shipping Country", "text", true],
// //       ["GSTNO", "GST Number", "text", true],
// //       ["RefNo", "Reference Number", "text", true],
// //       ["RefDt", "Reference Date", "date", true],
// //       ["Dbt_Ledger", "Debit Ledger", "text", true],
// //       ["CHG1", "Charge 1", "number", true],
// //       ["CHG2", "Charge 2", "number", true],
// //       ["CHG3", "Charge 3", "number", true],
// //       ["CHG4", "Charge 4", "number", true],
// //       ["CHG5", "Charge 5", "number", true],
// //       ["CHG6", "Charge 6", "number", true],
// //       ["CHG7", "Charge 7", "number", true],
// //       ["CHG8", "Charge 8", "number", true],
// //       ["CHG9", "Charge 9", "number", true],
// //       ["CHG10", "Charge 10", "number", true],
// //       ["Vip_Disc", "VIP Discount", "number", true],
// //       ["RoundOffAmt", "Round Off Amount", "number", true],
// //       ["CompanyCode", "Company Code", "text", true],
// //       ["InvFlagFrom", "Invoice Flag From", "text", true],
// //       ["Collection", "Collection", "text", true],
// //       ["StockLoc", "Stock Location", "text", true],
// //       ["OrderID", "Order ID", "text", true],
// //       ["OrderDate", "Order Date", "date", true],
// //     ];

// //     return fields.map(([name, label, type, isRequired, options], idx) => (
// //       <div key={idx} className="flex items-center justify-start">
// //         <label className="text-gray-700 font-medium w-1/3 text-left">{label}</label>
// //         {type === "select" ? (
// //           <select
// //             name={name}
// //             value={formData[section][name] || ""}
// //             onChange={(e) => handleInputChange(e, section, index)}
// //             className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
// //             required={isRequired}
// //           >
// //             <option value="">Select {label}</option>
// //             {options.map((option, idx) => (
// //               <option key={idx} value={option}>
// //                 {option}
// //               </option>
// //             ))}
// //           </select>
// //         ) : (
// //           <input
// //             type={type}
// //             name={name}
// //             value={formData[section][name] || ""}
// //             onChange={(e) => handleInputChange(e, section, index)}
// //             className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
// //             required={isRequired}
// //           />
// //         )}
// //       </div>
// //     ));
// //   };

// //   return (
// //     <div className="p-8 bg-white rounded-lg shadow-lg">
// //       <h4 className="text-xl font-bold mb-4">Credit (Sales) - Invoice Generation</h4>
// //       <form onSubmit={handleSubmit} className="space-y-6">
// //         {/* Invoice Master Section */}
// //         <div className="pb-4">
// //           <h4 className="text-lg font-bold mb-4">Invoice Master</h4>
// //           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
// //             {renderFormFields("InvMst")}
// //           </div>
// //         </div>


// //         {/* Invoice Details Section */}
// //         <div className="pb-4">
// //           <h4 className="text-lg font-bold mb-4">Invoice Details</h4>
// //           {formData.Invdet.Invdet.map((item, index) => (
// //             <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
// //               {renderFormFields("Invdet", index)}
// //             </div>
// //           ))}
// //           <div>
// //             <table>
// //               <thead>
// //                 <tr>
// //                   <th>Srno.</th>
// //                   <th>item</th>
// //                   <th>Qty</th>
// //                   <th>Del.Qty</th>
// //                   <th></th>
// //                   <th></th>
// //                   <th>Oth.Qty</th>
// //                   <th>Net Price</th>
// //                   <th>Chg 1</th>
// //                   <th>Chg 2</th>
// //                   <th>Chg 3</th>
// //                   <th>Chg 4</th>
// //                   <th>Chg 5</th>
// //                   <th>Per Weight</th>
// //                   <th>Total Weight</th>
// //                   <th>Net Amount</th>
// //                   <th>pieces</th>
// //                   <th>BalanceQty</th>
// //                 </tr>
// //               </thead>
// //               <tbody>

// //               </tbody>
// //             </table>
// //           </div>
// //           <button
// //             type="button"
// //             onClick={handleAddItem}
// //             className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
// //           >
// //             Add New Item
// //           </button>
// //         </div>

// //         {/* Submit Button */}
// //         <div className="flex flex-wrap items-center justify-between gap-2 mt-4">
// //           <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200">
// //             Submit
// //           </button>
// //         </div>
// //       </form>
// //     </div>
// //   );
// // }

// "use client"
// import { useState } from "react";

// export default function InvoiceTable() {
//   const [rows, setRows] = useState([
//     { pieces: "", balanceQty: "", otherCharges: "", totalAmount: "", cgst: "", sgst: "", igst: "" },
//   ]);

//   const handleInputChange = (index, field, value) => {
//     const updatedRows = [...rows];
//     updatedRows[index][field] = value;

//     // Calculate Total Amount if necessary
//     if (field === "otherCharges" || field === "cgst" || field === "sgst" || field === "igst") {
//       const otherCharges = parseFloat(updatedRows[index].otherCharges) || 0;
//       const cgst = parseFloat(updatedRows[index].cgst) || 0;
//       const sgst = parseFloat(updatedRows[index].sgst) || 0;
//       const igst = parseFloat(updatedRows[index].igst) || 0;

//       updatedRows[index].totalAmount = otherCharges + (otherCharges * (cgst + sgst + igst) / 100);
//     }

//     setRows(updatedRows);
//   };

//   const addNewRow = () => {
//     setRows([...rows, { pieces: "", balanceQty: "", otherCharges: "", totalAmount: "", cgst: "", sgst: "", igst: "" }]);
//   };

//   return (
//     <div className="p-8 bg-white rounded-lg shadow-lg">
//       <h4 className="text-xl font-bold mb-4">Invoice Details</h4>
//       <table className="w-full border-collapse">
//         <thead>
//           <tr className="bg-gray-200">
//             <th className="border p-2">Pieces</th>
//             <th className="border p-2">Balance Qty</th>
//             <th className="border p-2">Other Charges</th>
//             <th className="border p-2">Total Amount</th>
//             <th className="border p-2">CGST (%)</th>
//             <th className="border p-2">SGST (%)</th>
//             <th className="border p-2">IGST (%)</th>
//           </tr>
//         </thead>
//         <tbody>
//           {rows.map((row, index) => (
//             <tr key={index} className="border">
//               <td className="border p-2">
//                 <input
//                   type="text"
//                   value={row.pieces}
//                   onChange={(e) => handleInputChange(index, "pieces", e.target.value)}
//                   className="w-full p-1 border rounded"
//                 />
//               </td>
//               <td className="border p-2">
//                 <input
//                   type="text"
//                   value={row.balanceQty}
//                   onChange={(e) => handleInputChange(index, "balanceQty", e.target.value)}
//                   className="w-full p-1 border rounded"
//                 />
//               </td>
//               <td className="border p-2">
//                 <input
//                   type="text"
//                   value={row.otherCharges}
//                   onChange={(e) => handleInputChange(index, "otherCharges", e.target.value)}
//                   className="w-full p-1 border rounded"
//                 />
//               </td>
//               <td className="border p-2">
//                 <input
//                   type="text"
//                   value={row.totalAmount}
//                   readOnly
//                   className="w-full p-1 border rounded bg-gray-100"
//                 />
//               </td>
//               <td className="border p-2">
//                 <input
//                   type="text"
//                   value={row.cgst}
//                   onChange={(e) => handleInputChange(index, "cgst", e.target.value)}
//                   className="w-full p-1 border rounded"
//                 />
//               </td>
//               <td className="border p-2">
//                 <input
//                   type="text"
//                   value={row.sgst}
//                   onChange={(e) => handleInputChange(index, "sgst", e.target.value)}
//                   className="w-full p-1 border rounded"
//                 />
//               </td>
//               <td className="border p-2">
//                 <input
//                   type="text"
//                   value={row.igst}
//                   onChange={(e) => handleInputChange(index, "igst", e.target.value)}
//                   className="w-full p-1 border rounded"
//                 />
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//       <button
//         onClick={addNewRow}
//         className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
//       >
//         Add New Row
//       </button>
//     </div>
//   );
// }
"use client"
import { useState } from 'react';

const InvoiceForm = () => {
  const [formData, setFormData] = useState({
    InvMst: {
      BBRCD: "12345",
      BillType: "Invoice",
      BillType2: "Retail",
      BGNDT: "2025-03-01",
      BCLBRCD: "BR001",
      DueDT: "2025-03-10T00:00:00",
      DueDays: 10,
      OverDuePer: 2.50,
      CustCd: "CUST001",
      Qty: 100.500,
      DeliveredQty: 100.000,
      Discount: 5.00,
      OthAmt: 10.00,
      BillAmt: 5000.75,
      Remarks: "Test order",
      PriceType: "Wholesale",
      TaxType: "GST",
      WI_Mob: "9876543210",
      WI_Address: "Warehouse 1, Industrial Area",
      Dely_Address: "Customer Location",
      Billing_Name: "John Doe",
      Billing_Address: "123 Main St, City",
      Billing_Contact: "9876543210",
      Billing_Pincode: "123456",
      Billing_City: "Metro City",
      Billing_State: "StateName",
      Billing_Country: "CountryName",
      Shipping_Name: "John Doe",
      Shipping_Address: "456 Market St, City",
      Shipping_contact: "9876543210",
      Shipping_Pincode: "654321",
      Shipping_City: "Metro City",
      Shipping_State: "StateName",
      Shipping_Country: "CountryName",
      GSTNO: "GST123456789",
      RefNo: "REF001",
      RefDt: "2025-03-02T00:00:00",
      Dbt_Ledger: "Accounts Receivable",
      CHG1: 50.00,
      CHG2: 20.00,
      CHG3: 15.00,
      CHG4: 10.00,
      CHG5: 5.00,
      CHG6: 0.00,
      CHG7: 0.00,
      CHG8: 0.00,
      CHG9: 0.00,
      CHG10: 0.00,
      Vip_Disc: 10.00,
      RoundOffAmt: 0.25,
      CompanyCode: "COMP123",
      InvFlagFrom: "Online",
      Collection: "Y",
      StockLoc: "WH1",
      OrderID: "ORD12345",
      OrderDate: "2025-03-02T00:00:00"
    },
    Invdet: [
      {
        ICode: "ITEM123",
        Acccode: "ACC001",
        Price: 250.75,
        Dicount: 10.50,
        OthAmt: 5.00,
        PriceType: "Retail",
        QTY: 5.250,
        DelQty: 5.000,
        TaxType: "GST",
        CHG1: 10.00,
        CHG2: 5.00,
        CHG3: 2.50,
        CHG4: 1.25,
        CHG5: 0.75,
        CHG6: 0.50,
        CHG7: 0.25,
        CHG8: 0.10,
        CHG9: 0.05,
        CHG10: 0.01,
        NetAmt: 240.00,
        NetPrice: 230.00,
        Add_Desc: "Special Offer Item",
        RoomType: "A1",
        OtherChargeItemWise: 15.00,
        OtherCharge_TaxAmount: 3.00,
        OtherCharge_Add_TaxAmount: 1.50,
        OtherCharge_IGST_TaxAmount: 4.00
      },
      {
        ICode: "ITEM456",
        Acccode: "ACC002",
        Price: 499.99,
        Dicount: 25.00,
        OthAmt: 12.50,
        PriceType: "Wholesale",
        QTY: 10.750,
        DelQty: 10.500,
        TaxType: "VAT",
        CHG1: 15.00,
        CHG2: 7.50,
        CHG3: 3.75,
        CHG4: 2.00,
        CHG5: 1.00,
        CHG6: 0.75,
        CHG7: 0.50,
        CHG8: 0.25,
        CHG9: 0.10,
        CHG10: 0.05,
        NetAmt: 460.00,
        NetPrice: 450.00,
        Add_Desc: "Limited Stock Item",
        RoomType: "B2",
        OtherChargeItemWise: 20.00,
        OtherCharge_TaxAmount: 4.50,
        OtherCharge_Add_TaxAmount: 2.25,
        OtherCharge_IGST_TaxAmount: 5.00
      }
    ]
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      InvMst: {
        ...prevState.InvMst,
        [name]: value
      }
    }));
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const updatedItems = [...formData.Invdet];
    updatedItems[index] = {
      ...updatedItems[index],
      [name]: value
    };
    setFormData(prevState => ({
      ...prevState,
      Invdet: updatedItems
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Credit (Sales) - Invoice Generation</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Invoice Details Section */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Invoice No.</label>
            <input
              type="text"
              name="BBRCD"
              value={formData.InvMst.BBRCD}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Stock Location</label>
            <input
              type="text"
              name="StockLoc"
              value={formData.InvMst.StockLoc}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          {/* Add more fields similarly */}
        </div>

        {/* Table Section */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Enter No. of Sales</h2>
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Name</th>
                <th className="py-2 px-4 border-b">Qty</th>
                <th className="py-2 px-4 border-b">Did, Qty</th>
                <th className="py-2 px-4 border-b">OID, Ant</th>
                <th className="py-2 px-4 border-b">Net Price</th>
                <th className="py-2 px-4 border-b">Qtyd</th>
                <th className="py-2 px-4 border-b">Qtyd</th>
                <th className="py-2 px-4 border-b">Qtyd</th>
                <th className="py-2 px-4 border-b">Qtyd</th>
                <th className="py-2 px-4 border-b">Pvt Weight</th>
                <th className="py-2 px-4 border-b">Total Weight</th>
                <th className="py-2 px-4 border-b">Net Amount</th>
                <th className="py-2 px-4 border-b">Prices</th>
                <th className="py-2 px-4 border-b">Balance(Qty)</th>
              </tr>
            </thead>
            <tbody>
              {formData.Invdet.map((item, index) => (
                <tr key={index}>
                  <td className="py-2 px-4 border-b">
                    <input
                      type="text"
                      name="ICode"
                      value={item.ICode}
                      onChange={(e) => handleItemChange(index, e)}
                      className="w-full rounded-md border-gray-300 shadow-sm"
                    />
                  </td>
                  <td className="py-2 px-4 border-b">
                    <input
                      type="text"
                      name="QTY"
                      value={item.QTY}
                      onChange={(e) => handleItemChange(index, e)}
                      className="w-full rounded-md border-gray-300 shadow-sm"
                    />
                  </td>
                  {/* Add more table cells similarly */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default InvoiceForm;