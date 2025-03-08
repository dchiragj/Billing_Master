// "use client";
// import React, { useEffect, useState } from "react";
// import { useAuth } from "../context/AuthContext";
// import { addInvoice, fetchDropdownData, Finyear } from "@/lib/masterService";
// import moment from "moment";

// const InvoiceMaster = () => {
//   const { setIsSidebarOpen, userDetail } = useAuth();
//   const initialState = {
//     InvMst: {
//     },
//     Invdet: {
//       Invdet: [
//         {
//           ICode: "",
//           QTY: 0,
//           DelQty: 0,
//           OthAmt: 0,
//           NetPrice: 0,
//           CHG1: 0,
//           CHG2: 0,
//           CHG3: 0,
//           CHG4: 0,
//           CHG5: 0,
//           NetAmt: 0,
//         },
//       ],
//     },
//   }
//   const [formData, setFormData] = useState(initialState);

//   const [dropdownData, setDropdownData] = useState({
//     BillType: [],
//     TAX: [],
//     Price: [],
//   });

//   useEffect(() => {
//     if (userDetail?.CompanyCode) {
//       Object.keys(dropdownData).forEach((key) => {
//         handleDropdownData(userDetail.CompanyCode, key);
//       });
//     }
//   }, [userDetail?.CompanyCode]);

//   const handleDropdownData = async (CompanyCode, MstCode) => {
//     try {
//       if (userDetail.CompanyCode) {
//         const data = await fetchDropdownData(CompanyCode, MstCode);
//         setDropdownData((prev) => ({
//           ...prev,
//           [MstCode]: data,
//         }));
//       }
//     } catch (error) {
//       console.error(`Error fetching ${MstCode}:`, error);
//     }
//   };

//   const handleInputChange = (e, section = "InvMst", index = 0) => {
//     const { name, value, type, checked } = e.target;
//     const updatedValue = type === "checkbox" ? checked : value;

//     setFormData((prev) => {
//       const newData = { ...prev };
//       if (section === "InvMst") {
//         newData.InvMst[name] = updatedValue;
//       } else if (section === "Invdet") {
//         newData.Invdet.Invdet[index][name] = updatedValue;
//       }
//       return newData;
//     });
//   };

//   const handleAddInvoiceDetail = () => {
//     setFormData((prev) => ({
//       ...prev,
//       Invdet: {
//         Invdet: [
//           ...prev.Invdet.Invdet,
//           initialState.Invdet.Invdet
//         ],
//       },
//     }));
//   };

//   const handleRemoveInvoiceDetail = (index) => {
//     setFormData((prev) => ({
//       ...prev,
//       Invdet: {
//         Invdet: prev.Invdet.Invdet.filter((_, i) => i !== index),
//       },
//     }));
//   };

//   const handleAddSubmit = async (e) => {
//     e.preventDefault();
//     const payload = {...formData, CompanyCode : userDetail.CompanyCode, Finyear : Finyear, Billno: "",}
//     console.log(payload);

//     try {
//       // const response = await addInvoice(payload);
//       console.log(payload);
      
//       // if (response.status) {
//       //   fetchData();
//       //   setModalOpen(false);
//       //   setFormData({});
//       // } else {
//       //   console.log(response.data.message);
//       // }
//     } catch (error) {
//       console.error(error.response?.data?.message || "Error submitting form");
//     }
//   };

//   return (
//     <div className={`p-8 w-full lg:w-[calc(100vw-288px)] ml-0 lg:ml-[288px] text-black min-h-screen`}>
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
//             strokeWidth={2}
//             d="M4 6h16M4 12h16m-7 6h7"
//           />
//         </svg>
//       </button>
//       <div className="bg-white p-8 rounded-lg shadow-lg space-y-8">
//         <div className="flex justify-between items-center">
//           <h4 className="text-2xl font-bold">Invoice Master</h4>
//         </div>
//         <form onSubmit={handleAddSubmit} className="space-y-6">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             {[
//               ["StockLoc", "Stock Location", "text", true],
//               // ["BBRCD", "BBRCD", "text", true],
//               // ["BillType2", "Bill Type 2", "text", true],
//               // ["BGNDT", "BGNDT", "date", true],
//               // ["BCLBRCD", "BCLBRCD", "text", true],
//               ["CustCd", "Customer Code", "text", true],
//               ["RefDt", "Reference Date", "date", true],
//               ["DueDT", "Due Date", "date", true],
//               ["BillType", "Bill Type", "select", true, dropdownData.BillType],
//               ["Collection", "Collection", "text", true],
//               ["PriceType", "Price Type", "select", false, dropdownData.Price],
//               ["TaxType", "Tax Type", "select", false, dropdownData.TAX],
//               ["DueDays", "Bill Due Days", "number", true],
//               ["OverDuePer", "OverDue Percentage(%)", "number", true],
//               ["BillAmt", "Bill Amount", "number", true],
//               ["Dely_Address", "Delivery Address", "textarea", true],
//               ["Remarks", "Remarks", "textarea", true],
              
//               // ["Qty", "Quantity", "number", true],
//               // ["DeliveredQty", "Delivered Quantity", "number", true],
//               // ["Discount", "Discount", "number", true],
//               // ["OthAmt", "Other Amount", "number", true],
//               // ["WI_Mob", "Warehouse Mobile", "text", true],
//               // ["WI_Address", "Warehouse Address", "text", true],
//               // ["Billing_Name", "Billing Name", "text", true],
//               // ["Billing_Address", "Billing Address", "text", true],
//               // ["Billing_Contact", "Billing Contact", "text", true],
//               // ["Billing_Pincode", "Billing Pincode", "text", true],
//               // ["Billing_City", "Billing City", "text", true],
//               // ["Billing_State", "Billing State", "text", true],
//               // ["Billing_Country", "Billing Country", "text", true],
//               // ["Shipping_Name", "Shipping Name", "text", true],
//               // ["Shipping_Address", "Shipping Address", "text", true],
//               // ["Shipping_contact", "Shipping Contact", "text", true],
//               // ["Shipping_Pincode", "Shipping Pincode", "text", true],
//               // ["Shipping_City", "Shipping City", "text", true],
//               // ["Shipping_State", "Shipping State", "text", true],
//               // ["Shipping_Country", "Shipping Country", "text", true],
//               // ["GSTNO", "GST Number", "text", true],
//               // ["RefNo", "Reference Number", "text", true],
//               // ["Dbt_Ledger", "Debit Ledger", "text", true],
//               // ["Vip_Disc", "VIP Discount", "number", true],
//               // ["RoundOffAmt", "Round Off Amount", "number", true],
//               // ["InvFlagFrom", "Invoice Flag From", "text", true],
//               // ["OrderID", "Order ID", "text", true],
//               // ["OrderDate", "Order Date", "date", true],
//             ].map(([name, label, type, isRequired, options], index) => (
//               <div key={index} className={`flex items-center ${type === "textarea" ? "md:col-span-2" : ""}`}>
//                 <label className={`text-gray-700 font-medium ${type === "textarea" ? "lg:w-1/6" : ""} w-1/3 text-left`}>{label}</label>
//                 {type === "select" ? (
//                   <select
//                     name={name}
//                     value={formData.InvMst[name] || ""}
//                     onChange={(e) => handleInputChange(e)}
//                     className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
//                     required={isRequired}
//                   >
//                     <option value="">Select {label}</option>
//                     {options?.map((option, idx) => (
//                       <option key={idx} value={option.DocCode}>
//                         {option.CodeDesc}
//                       </option>
//                     ))}
//                   </select>
//                 ) : type === "textarea" ? (
//                   <textarea
//                     name={name}
//                     value={formData.InvMst[name] || ""}
//                     onChange={(e) => handleInputChange(e)}
//                     className="p-2 w-2/3 lg:w-5/6 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none resize-none"
//                     rows="2"
//                     required={isRequired}
//                   />
//                 ) : (
//                   <input
//                     type={type}
//                     name={name}
//                     value={type === "date" ? (formData.InvMst[name] ? moment(formData.InvMst[name]).format("YYYY-MM-DD") : "") : formData.InvMst[name] || ""}
//                     onChange={(e) => handleInputChange(e)}
//                     className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
//                     required={isRequired}
//                   />
//                 )}
//               </div>
//             ))}
//           </div>

//           <h6 className="flex justify-center text-xl font-bold">Invoice Details</h6>
//           <div className="relative overflow-x-auto shadow-md sm:rounded-lg border">
//             <table className="w-full text-sm text-center text-gray-700 dark:text-gray-300 border border-gray-300">
//               <thead className="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-300 uppercase">
//                 <tr>
//                   {[
//                     "SR No.", "ICode", "QTY", "DelQty", "OthAmt", "NetPrice",
//                     "CHG1", "CHG2", "CHG3", "CHG4", "CHG5", "NetAmt", "Action"
//                   ].map((heading, index) => (
//                     <th key={index} className="px-3 py-2 border border-gray-300">{heading}</th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {formData.Invdet.Invdet.map((Bill, index) => (
//                   <tr key={index} className="border border-gray-300">
//                     <td className="py-2 border border-gray-300">{index + 1}</td>
//                     {[
//                       "ICode", "QTY", "DelQty", "OthAmt", "NetPrice",
//                       "CHG1", "CHG2", "CHG3", "CHG4", "CHG5", "NetAmt"
//                     ].map((field, i) => (
//                       <td key={i} className="p-2 border border-gray-300">
//                         <input
//                           type={["QTY", "DelQty", "NetPrice", "CHG1", "CHG2", "CHG3", "CHG4", "CHG5", "NetAmt"].includes(field) ? "number" : "text"}
//                           name={field}
//                           value={Bill[field] || ""}
//                           onChange={(e) => handleInputChange(e, "Invdet", index)}
//                           className="p-1 w-full bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-center"
//                         />
//                       </td>
//                     ))}
//                     <td className="py-2 border border-gray-300">
//                       {formData.Invdet.Invdet.length > 1 && (
//                         <button
//                           type="button"
//                           onClick={() => handleRemoveInvoiceDetail(index)}
//                           className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition"
//                         >
//                           Remove
//                         </button>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//                 <tr>
//                   <td colSpan={13} className="px-4 py-3 text-center">
//                     <button
//                       type="button"
//                       onClick={handleAddInvoiceDetail}
//                       className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
//                     >
//                       + Add New Row
//                     </button>
//                   </td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>
//           <div className="flex items-center justify-between mt-4">
//             <button
//               type="button"
//               onClick={() => setFormData(initialState)}
//               className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition duration-200"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
//             >
//               Submit
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default InvoiceMaster;

"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { addInvoice, fetchDropdownData, Finyear } from "@/lib/masterService";
import moment from "moment";

const InvoiceMaster = () => {
  const { setIsSidebarOpen, userDetail } = useAuth();
  const initialState = {
    InvMst: {},
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

  const [dropdownData, setDropdownData] = useState({
    Customer: [],
    BillType: [],
    TAX: [],
    Price: [],
  });

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

  const handleInputChange = (e, section = "InvMst", index = 0) => {
    const { name, value, type, checked } = e.target;
    const updatedValue = type === "checkbox" ? checked : value;

    setFormData((prev) => {
      const newData = { ...prev };
      if (section === "InvMst") {
        newData.InvMst[name] = updatedValue;
      } else if (section === "Invdet") {
        newData.Invdet.Invdet[index][name] = updatedValue;
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
    payload.Brcd = "1",

    console.log(payload);

    try {
      const response = await addInvoice(payload);
      console.log(payload);

      if (response.status) {
        fetchData();
        setModalOpen(false);
        setFormData({});
      } else {
        console.log(response.data.message);
      }
    } catch (error) {
      console.error(error.response?.data?.message || "Error submitting form");
    }
  };

  return (
    <div className={`p-8 w-full lg:w-[calc(100vw-288px)] ml-0 lg:ml-[288px] text-black min-h-screen`}>
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
          <h4 className="text-2xl font-bold">Invoice Master</h4>
        </div>
        <form onSubmit={handleAddSubmit} className="space-y-6bg-white p-6 rounded-lg border-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              ["StockLoc", "Stock Location", "text", true],
              ["CustCd", "Customer Name", "select", true, dropdownData.Customer],
              ["RefDt", "Reference Date", "date", true],
              ["DueDT", "Due Date", "date", true],
              ["BillType", "Bill Type", "select", true, dropdownData.BillType],
              ["Collection", "Collection", "text", true],
              ["PriceType", "Price Type", "select", false, dropdownData.Price],
              ["TaxType", "Tax Type", "select", false, dropdownData.TAX],
              ["DueDays", "Bill Due Days", "number", true],
              ["OverDuePer", "OverDue Percentage(%)", "number", true],
              ["BillAmt", "Bill Amount", "number", true],
              ["Dely_Address", "Delivery Address", "textarea", true],
              ["Remarks", "Remarks", "textarea", true],
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
            
                          <option key={idx} value={name === "CustCd" ? option.CustomerCode : option.DocCode}>
                            {name === "CustCd" ? option.CustomerName : option.CodeDesc}
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
                  />
                )}
              </div>
            ))}
          </div>

          <h6 className="flex justify-center text-xl font-bold">Invoice Details</h6>
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg border">
            <table className="w-full text-sm text-center text-gray-700 dark:text-gray-300 border border-gray-300">
              <thead className="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-300 uppercase">
                <tr>
                  {[
                    "SR No.", "ICode", "QTY", "DelQty", "OthAmt", "NetPrice",
                    "CHG1", "CHG2", "CHG3", "CHG4", "CHG5", "NetAmt", "Action"
                  ].map((heading, index) => (
                    <th key={index} className="px-3 py-2 border border-gray-300">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {formData.Invdet.Invdet.map((Bill, index) => (
                  <tr key={index} className="border border-gray-300">
                    <td className="py-2 border border-gray-300">{index + 1}</td>
                    {[
                      "ICode", "QTY", "DelQty", "OthAmt", "NetPrice",
                      "CHG1", "CHG2", "CHG3", "CHG4", "CHG5", "NetAmt"
                    ].map((field, i) => (
                      <td key={i} className="p-2 border border-gray-300">
                        <input
                          type={["QTY", "DelQty", "NetPrice", "CHG1", "CHG2", "CHG3", "CHG4", "CHG5","OthAmt", "NetAmt"].includes(field) ? "number" : "text"}
                          name={field}
                          value={Bill[field] || ""}
                          onChange={(e) => handleInputChange(e, "Invdet", index)}
                          className="p-1 w-full bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-center"
                        />
                      </td>
                    ))}
                    <td className="py-2 border border-gray-300">
                      {formData.Invdet.Invdet.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveInvoiceDetail(index)}
                          className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={13} className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={handleAddInvoiceDetail}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                    >
                      + Add New Row
                    </button>
                  </td>
                </tr>
              </tbody>
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
        </form>
      </div>
    </div>
  );
};

export default InvoiceMaster;