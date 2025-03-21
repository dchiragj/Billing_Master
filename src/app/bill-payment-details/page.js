// "use client";

// import { useRouter, useSearchParams } from "next/navigation";
// import { useEffect, useState } from "react";
// import { billgenerate, fetchDropdownData, Finyear, getBillEntryPayment } from "@/lib/masterService";
// import { useAuth } from "../context/AuthContext";
// import { toast } from "react-toastify";
// import { faAlignLeft } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// const BillPaymentDetails = () => {
//   const searchParams = useSearchParams();
//   const selectedBills = searchParams.get("selectedBill");
//   const Fromdt = searchParams.get("Fromdt");
//   const Todt = searchParams.get("Todt");
//   const router = useRouter();
//   const { setIsSidebarOpen, userDetail } = useAuth();

//   const [billDetails, setBillDetails] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [isCashSelected, setIsCashSelected] = useState(false);
//   const [dropdownData, setDropdownData] = useState({
//     CPTYP: [],
//   });

//   const [formData, setFormData] = useState({
//     ChqDet: {
//       ClearDt: "",
//       Cleared: "",
//       Chqno: "",
//       Chqdt: "",
//       Chqamt: "",
//       Banknm: "",
//       Bankbrn: "",
//       Ptmsptcd: "",
//       Ptmsptnm: "",
//       ColAmt: "",
//       brcd: "",
//       Acccode: "",
//       Onaccount: "",
//       Diposited: "",
//     },
//     BillMRDET: {
//       BillMRDET: [],
//     },
//     MRHDR: {
//       MRSDT: "",
//       MRSTYPE: "",
//       EMRS_type: "",
//       MRSBR: userDetail.LocationName,
//       PTCD: "",
//       PTMSNM: "",
//       MRSAMT: "",
//       NETAMT: "",
//       DEDUCTION: "",
//       MRSCASH: "",
//       MRSCHQ: "",
//       MRSCHQNO: "",
//       MRSCHQDT: "",
//       MRSBANK: "",
//       MRS_CLOSED: "",
//       DED_TDS: "",
//       MR_CANCEL: "",
//       BILLMR: "",
//       finclosedt: "",
//       paymode: "",
//       BankAcccode: "",
//       BankAccdesc: "",
//       tdsacccode: "",
//       tdsaccdesc: "",
//       ManualMrsno: "",
//       CompanyCode: "",
//     },
//     MR_Location: "",
//     FinYear: "",
//     EntryBy: "",
//     CompanyCode: "",
//   });

//   useEffect(() => {
//     if (selectedBills) {
//       fetchBillDetails();
//     } else {
//       router.push(`/bill-payment`);
//     }
//   }, [selectedBills]);

//   useEffect(() => {
//     if (userDetail?.CompanyCode) {
//       Object.keys(dropdownData).forEach((key) => {
//         handleDropdownData(userDetail.CompanyCode, key);
//       });
//     }
//   }, [userDetail?.CompanyCode]);

//   useEffect(() => {
//     setIsCashSelected(formData.MRHDR.paymode === "190");
//   }, [formData.MRHDR.paymode]);

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

//   const fetchBillDetails = async () => {
//     setLoading(true);
//     try {
//       const data = await getBillEntryPayment(selectedBills);
//       setBillDetails(data);

//       const parsedBills = data.map((bill) => {
//         const charges = bill.CHGCODE.split("*/")
//           .map((charge) => {
//             const [code, description, isActive, sign] = charge.split("~");
//             return { code, description, isActive, sign };
//           })
//           .filter((charge) => charge.isActive === "Y");

//         return { ...bill, charges, NetRecdAmount: bill.BILLAMT };
//       });

//       setFormData((prev) => ({
//         ...prev,
//         BillMRDET: {
//           BillMRDET: parsedBills.map((bill) => ({
//             BillNO: bill.BillNO || "",
//             CustCd: bill.CustCd || "",
//             BGNDT: bill.BGNDT || "",
//             BILLAMT: bill.BILLAMT || "",
//             PendAmt: bill.PendAmt || "",
//             TOTBILL: "",
//             TDSDED: "",
//             NETAMT: "",
//             UNEXPDED: "",
//             DOCNO: "",
//             CHG1: "",
//             CHG2: "",
//             CHG3: "",
//             CHG4: "",
//             CHG5: "",
//             CHG6: "",
//             CHG7: "",
//             CHG8: "",
//             CHG9: "",
//             CHG10: "",
//             Remarks: "",
//             charges: bill.charges,
//           })),
//         },
//       }));
//     } catch (err) {
//       setError(err.message || "Failed to fetch bill details");
//       toast.error("Failed to fetch bill details. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleInputChange = (e, section) => {
//     const { name, value, type, checked } = e.target;
    
//     setFormData((prev) => ({
//       ...prev,
//       [section]: {
//         ...prev[section],
//         [name]: type === "checkbox" ? checked : value,
//       },
//     }));

//     if (name === "paymode" && section === "MRHDR") {
//       setIsCashSelected(value === "190");
//     }
//   };

//   const handleBillInputChange = (e, index, name) => {
//     const { value } = e.target;
//     setFormData((prev) => {
//       const updatedBills = [...prev.BillMRDET.BillMRDET];
//       updatedBills[index][name] = value;
//       return {
//         ...prev,
//         BillMRDET: {
//           BillMRDET: updatedBills,
//         },
//       };
//     });
//   };

//   const formatDate = (inputDate) => {
//     if (!inputDate) return "";
//     const date = new Date(inputDate);
//     return date.toLocaleDateString("en-GB", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     const transformedBills = formData.BillMRDET.BillMRDET.map((bill) => ({
//       TOTBILL: String(bill.TOTBILL) || "0.00",
//       TDSDED: bill.TDSDED || "0.00",
//       NETAMT: String(bill.BILLAMT) || "0.00",
//       UNEXPDED: bill.UNEXPDED || "0.00",
//       DOCNO: bill.BillNO || "",
//       CHG1: bill.CHG1 || "0.00",
//       CHG2: bill.CHG2 || "0.00",
//       CHG3: bill.CHG3 || "0.00",
//       CHG4: bill.CHG4 || "0.00",
//       CHG5: bill.CHG5 || "0.00",
//       CHG6: bill.CHG6 || "0.00",
//       CHG7: bill.CHG7 || "0.00",
//       CHG8: bill.CHG8 || "0.00",
//       CHG9: bill.CHG9 || "0.00",
//       CHG10: bill.CHG10 || "0.00",
//       Remarks: bill.Remarks || "",
//     }));

//     const filteredChqDet = Object.keys(formData.ChqDet).reduce((acc, key) => {
//       if (formData.ChqDet[key] !== undefined && formData.ChqDet[key] !== "") {
//         acc[key] = formData.ChqDet[key];
//       }
//       return acc;
//     }, {});

//     const filteredMRHDR = Object.keys(formData.MRHDR).reduce((acc, key) => {
//       if (formData.MRHDR[key] !== undefined && formData.MRHDR[key] !== "") {
//         acc[key] = formData.MRHDR[key];
//       }
//       return acc;
//     }, {});

//     const payload = {
//       ChqDet: {
//         ...filteredChqDet,
//         ClearDt: formatDate(formData.ChqDet.ClearDt),
//         Chqdt: formatDate(formData.ChqDet.Chqdt),
//       },
//       BillMRDET: {
//         BillMRDET: transformedBills,
//       },
//       MRHDR: {
//         ...filteredMRHDR,
//         MRSDT: formatDate(formData.MRHDR.MRSDT),
//         MRSCHQDT: formatDate(formData.MRHDR.MRSCHQDT),
//         finclosedt: formatDate(formData.MRHDR.finclosedt),
//         CompanyCode: userDetail.CompanyCode,
//         MRSBR: userDetail.LocationName,
//         MRSTYPE:"1",
//         EMRS_type:"MR"
//       },
//       MR_Location: formData.MR_Location || "1",
//       FinYear: Finyear,
//       EntryBy: userDetail.UserId,
//       CompanyCode: userDetail.CompanyCode,
//     };

//     try {
//       const response = await billgenerate(payload);

//       if (response.status) {
//         toast.success("Bill generated successfully!");
//         router.push("/bill-payment");
//       } else {
//         toast.error("Failed to generate bill. Please try again.");
//       }
//     } catch (err) {
//       toast.error("An error occurred while generating the bill.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-8 text-black w-full lg:ml-[288px] lg:w-[calc(100vw-288px)] min-h-screen ml-0">
//       <button
//         className="flex justify-start p-3 text-black lg:hidden"
//         onClick={() => setIsSidebarOpen(true)}
//       >
//        <FontAwesomeIcon icon={faAlignLeft} />
//       </button>
//       <div className="bg-white p-8 rounded-lg shadow-lg space-y-6">
//         <h4 className="text-2xl text-center text-gray-800 font-bold">
//           Bill Collection
//         </h4>

//         <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
//           <h6 className="text-gray-700 text-xl font-semibold mb-6">
//             You Selected
//           </h6>
//           <div className="space-y-6">
//             <div className="space-y-4">
//               <div className="flex flex-col gap-4 md:flex-row md:gap-14">
//                 <div className="flex flex-col space-y-1">
//                   <span className="text-gray-500 text-sm font-medium">
//                     Customer Code and Name
//                   </span>
//                   <span className="text-base text-gray-800 font-semibold">
//                     {billDetails[0]?.CustCd || "-"}
//                   </span>
//                 </div>
//                 <div className="flex flex-col space-y-1">
//                   <span className="text-gray-500 text-sm font-medium">
//                     Docket Booking Date Range
//                   </span>
//                   <span className="text-base text-gray-800 font-semibold">
//                     {Fromdt} TO {Todt}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <form onSubmit={handleSubmit} className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm space-y-6">
//           <div className="border p-5 rounded-lg">
//             <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//               {[
//                 ["ManualMrsno", "MR Number", "text", true, "System Generated"],
//                 ["MRSBR", "MR branch", "text", true],
//                 ["MRSDT", "MR Generation Date", "date", false],
//                 ["MRS_CLOSED", "Is Reconciled", "checkbox", false],
//                 ["Remarks", "Remarks", "textarea", false],
//               ].map(([name, label, type, required, placeHolder, options], index) => (
//                 <div key={index} className={`flex items-center ${type === "textarea" ? "md:col-span-2" : ""}`}>
//                   <label className={`text-gray-700 font-medium ${label.includes("Remarks") ? "lg:w-1/6" : ""} w-1/3 text-left`}>{label}</label>
//                   {type === "select" ? (
//                     <select
//                       name={name}
//                       value={formData.MRHDR[name] || ""}
//                       onChange={(e) => handleInputChange(e, "MRHDR")}
//                       className="bg-gray-100 border border-gray-300 p-2 rounded-md w-2/3 focus:outline-none focus:ring-2 focus:ring-gray-500"
//                       placeholder={placeHolder}
//                     >
//                       <option value="">Select {label}</option>
//                       {options.map((option, idx) => (
//                         <option key={idx} value={option}>
//                           {option}
//                         </option>
//                       ))}
//                     </select>
//                   ) : type === "textarea" ? (
//                     <textarea
//                       name={name}
//                       value={formData.MRHDR[name] || ""}
//                       onChange={(e) => handleInputChange(e, "MRHDR")}
//                       className="bg-gray-100 border border-gray-300 p-2 rounded-md w-2/3 focus:outline-none focus:ring-2 focus:ring-gray-500 lg:w-5/6 resize-none"
//                       rows="2"
//                       placeholder={placeHolder}
//                     />
//                   ) : type === "checkbox" ? (
//                     <input
//                       type={type}
//                       name={name}
//                       checked={formData.MRHDR[name] || false}
//                       onChange={(e) => handleInputChange(e, "MRHDR")}
//                       className="border-gray-300 h-5 rounded text-blue-600 w-5 focus:ring-gray-500"
//                     />
//                   )  : (
//                     <input
//                       type={type}
//                       name={name}
//                       value={formData.MRHDR[name] || ""}
//                       onChange={(e) => handleInputChange(e, "MRHDR")}
//                       className="bg-gray-100 border border-gray-300 p-2 rounded-md w-2/3 focus:outline-none focus:ring-2 focus:ring-gray-500"
//                       disabled={name === "MRSBR" || name === "ManualMrsno"}
//                       placeholder={placeHolder}
//                       readOnly={name === "MRSBR" || name === "ManualMrsno"}
//                     />
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div className="border p-5 rounded-lg">
//             <h5 className="flex justify-center text-lg font-semibold mb-2">List Of Bills:</h5>
//             <div className="border shadow-md overflow-x-auto relative sm:rounded-lg">
//               <table className="border border-gray-300 text-center text-gray-500 text-sm min-w-full rtl:text-right">
//                 <thead className="bg-gray-200 border-b-2 border-gray-400 text-gray-700 uppercase">
//                   <tr className="border border-gray-300">
//                     <th className="border border-gray-300 py-2">SR No</th>
//                     {[
//                       "Bill No",
//                       "Bill Date",
//                       "Bill Amt.",
//                       "Pending Amt.",
//                       "Net Recd. Amount",
//                     ].map((header, index) => (
//                       <th key={index} className="border border-gray-300 px-2 py-2">
//                         {header}
//                       </th>
//                     ))}
//                     {formData.BillMRDET.BillMRDET[0]?.charges?.map((charge, index) => (
//                       <th key={index} className="border border-gray-300 px-2 py-2">
//                         {charge.description}
//                       </th>
//                     ))}
//                     <th className="border border-gray-300 px-2 py-2">Remarks</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {formData.BillMRDET.BillMRDET.map((bill, index) => (
//                     <tr key={index} className="border border-gray-300">
//                       <td className="border border-gray-300 px-1 py-2">{index + 1}</td>
//                       <td className="border border-gray-300 px-1 py-2">{bill.BillNO}</td>
//                       <td className="border border-gray-300 px-1 py-2">{bill.BGNDT}</td>
//                       <td className="border border-gray-300 px-1 py-2">{bill.BILLAMT}</td>
//                       <td className="border border-gray-300 px-1 py-2">{bill.PendAmt}</td>
//                       <td className="border border-gray-300 px-1 py-2">
//                         <input
//                           type="number"
//                           name="NetRecdAmount"
//                           value={formData.BillMRDET.BillMRDET[index].NetRecdAmount || bill.BILLAMT}
//                           onChange={(e) => handleBillInputChange(e, index, "NetRecdAmount")}
//                           className="bg-gray-100 border border-gray-300 p-1 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-gray-500"
//                         />
//                       </td>
//                       {bill.charges?.map((charge, idx) => (
//                         <td key={idx} className="border border-gray-300 px-1 py-2">
//                           <input
//                             type="number"
//                             name={`CHG${idx + 1}`}
//                             value={formData.BillMRDET.BillMRDET[index][`CHG${idx + 1}`] || ""}
//                             onChange={(e) => handleBillInputChange(e, index, `CHG${idx + 1}`)}
//                             className="bg-gray-100 border border-gray-300 p-1 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-gray-500"
//                           />
//                         </td>
//                       ))}
//                       <td className="border border-gray-300 px-1 py-2">
//                         <textarea
//                           name="Remarks"
//                           value={bill.Remarks || ""}
//                           onChange={(e) => handleBillInputChange(e, index, "Remarks")}
//                           className="bg-gray-100 border border-gray-300 p-1 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-gray-500"
//                         />
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//           <div className="border p-5 rounded-lg">
//             <h5 className="flex justify-center text-lg font-semibold mb-4">Collection Details</h5>
//             <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//               {[
//                 ["paymode", "Receipt Mode", "select", true, dropdownData.CPTYP],
//                 ["NETAMT", "Net Amount", "number", true],
//                 ["MRSCASH", "Cash Amount", "number", true],
//                 // ["MRSTYPE", "MRS Type", "text", true],
//                 // ["EMRS_type", "EMRS Type", "text", true],
//                 ["BankAcccode", "Bank Account Code", "text", true],
//               ].map(([name, label, type, isRequired, options], index) => (
//                 <div key={index} className="flex items-center">
//                   <label className="text-gray-700 text-left w-1/3 font-medium">{label}</label>
//                   {type === "select" ? (
//                     <select
//                       name={name}
//                       value={formData.MRHDR[name] || ""}
//                       onChange={(e) => handleInputChange(e, "MRHDR")}
//                       className="bg-gray-100 border border-gray-300 p-2 rounded-md w-2/3 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       required={isRequired}
//                     >
//                       <option value="">Select {label}</option>
//                       {options.map((option, idx) => (
//                         <option key={idx} value={option.CodeId || option}>
//                           {option.CodeDesc || option}
//                         </option>
//                       ))}
//                     </select>
//                   ) : (
//                     <input
//                       type={type}
//                       name={name}
//                       value={formData.MRHDR[name] || ""}
//                       onChange={(e) => handleInputChange(e, "MRHDR")}
//                       className={`p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
//                         (name === "MRSCASH" && !isCashSelected) || 
//                         (name !== "MRSCASH" && name !== "NETAMT" && isCashSelected)
//                           ? "opacity-50 cursor-not-allowed"
//                           : ""
//                       }`}
//                       required={isRequired && ((name === "MRSCASH" && isCashSelected) || (name !== "MRSCASH" && !isCashSelected))}
//                       disabled={
//                         (name === "MRSCASH" && !isCashSelected) || 
//                         (name !== "MRSCASH" && name !== "NETAMT" && isCashSelected)
//                       }
//                     />
//                   )}
//                 </div>
//               ))}
//               {[
//                 ["ClearDt", "Clear Date", "date", false],
//                 ["Chqno", "Cheque Number", "text", false],
//                 ["Chqdt", "Cheque Date", "date", false],
//                 ["Chqamt", "Cheque Amount", "number", false],
//                 ["ColAmt", "Collection Amount", "number", false],
//                 ["Banknm", "Bank Name", "text", false],
//                 ["Diposited", "Deposited", "checkbox", false],
//                 ["Onaccount", "On Account", "checkbox", false],
//                 ["Acccode", "Account Code", "text", false],
//               ].map(([name, label, type, isRequired, options], index) => (
//                 <div key={index} className="flex items-center">
//                   <label className="text-gray-700 text-left w-1/3 font-medium">{label}</label>
//                   {type === "select" ? (
//                     <select
//                       name={name}
//                       value={formData.ChqDet[name] || ""}
//                       onChange={(e) => handleInputChange(e, "ChqDet")}
//                       className={`p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
//                         isCashSelected ? "opacity-50 cursor-not-allowed" : ""
//                       }`}
//                       required={isRequired && !isCashSelected}
//                       disabled={isCashSelected}
//                     >
//                       <option value="">Select {label}</option>
//                       {options?.map((option, idx) => (
//                         <option key={idx} value={option}>
//                           {option}
//                         </option>
//                       ))}
//                     </select>
//                   ) : type === "checkbox" ? (
//                     <input
//                       type={type}
//                       name={name}
//                       checked={formData.ChqDet[name] || false}
//                       onChange={(e) => handleInputChange(e, "ChqDet")}
//                       className={`h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-gray-500 ${
//                         isCashSelected ? "opacity-50 cursor-not-allowed" : ""} `}
//                       required={isRequired && !isCashSelected}
//                       disabled={isCashSelected}

//                     />
//                   ) : (
//                     <input
//                       type={type}
//                       name={name}
//                       value={formData.ChqDet[name] || ""}
//                       onChange={(e) => handleInputChange(e, "ChqDet")}
//                       className={`p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
//                         isCashSelected ? "opacity-50 cursor-not-allowed" : ""
//                       }`}
//                       required={isRequired && !isCashSelected}
//                       disabled={isCashSelected}
//                     />
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//           <div className="flex justify-end">
//             <button
//               type="submit"
//               className="bg-blue-600 rounded-lg text-white duration-200 hover:bg-blue-700 px-6 py-2 transition"
//               disabled={loading}
//             >
//               {loading ? "Submitting..." : "Submit"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default BillPaymentDetails;


// "use client";

// import { useRouter, useSearchParams } from "next/navigation";
// import { useEffect, useState } from "react";
// import { billgenerate, fetchDropdownData, Finyear, getBillEntryPayment } from "@/lib/masterService";
// import { useAuth } from "../context/AuthContext";
// import { toast } from "react-toastify";
// import { faAlignLeft } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// const BillPaymentDetails = () => {
//   const searchParams = useSearchParams();
//   const selectedBills = searchParams.get("selectedBill");
//   const Fromdt = searchParams.get("Fromdt");
//   const Todt = searchParams.get("Todt");
//   const router = useRouter();
//   const { setIsSidebarOpen, userDetail } = useAuth();

//   const [billDetails, setBillDetails] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [isCashSelected, setIsCashSelected] = useState(false);
//   const [dropdownData, setDropdownData] = useState({
//     CPTYP: [],
//   });

//   const [formData, setFormData] = useState({
//     ChqDet: {
//       ClearDt: "",
//       Cleared: "",
//       Chqno: "",
//       Chqdt: "",
//       Chqamt: "",
//       Banknm: "",
//       Bankbrn: "",
//       Ptmsptcd: "",
//       Ptmsptnm: "",
//       ColAmt: "",
//       brcd: "",
//       Acccode: "",
//       Onaccount: "",
//       Diposited: "",
//     },
//     BillMRDET: {
//       BillMRDET: [],
//     },
//     MRHDR: {
//       MRSDT: "",
//       MRSTYPE: "",
//       EMRS_type: "",
//       MRSBR: userDetail.LocationName,
//       PTCD: "",
//       PTMSNM: "",
//       MRSAMT: "",
//       NETAMT: "",
//       DEDUCTION: "",
//       MRSCASH: "",
//       MRSCHQ: "",
//       MRSCHQNO: "",
//       MRSCHQDT: "",
//       MRSBANK: "",
//       MRS_CLOSED: "",
//       DED_TDS: "",
//       MR_CANCEL: "",
//       BILLMR: "",
//       finclosedt: "",
//       paymode: "",
//       BankAcccode: "",
//       BankAccdesc: "",
//       tdsacccode: "",
//       tdsaccdesc: "",
//       ManualMrsno: "",
//       CompanyCode: "",
//     },
//     MR_Location: "",
//     FinYear: "",
//     EntryBy: "",
//     CompanyCode: "",
//   });

//   // Fetch bill details when selectedBills changes
//   useEffect(() => {
//     if (selectedBills) {
//       fetchBillDetails();
//     } else {
//       router.push(`/bill-payment`);
//     }
//   }, [selectedBills]);

//   // Fetch dropdown data when userDetail.CompanyCode changes
//   useEffect(() => {
//     if (userDetail?.CompanyCode) {
//       Object.keys(dropdownData).forEach((key) => {
//         handleDropdownData(userDetail.CompanyCode, key);
//       });
//     }
//   }, [userDetail?.CompanyCode]);

//   // Reset fields when paymode changes
//   useEffect(() => {
//     if (formData.MRHDR.paymode === "190") {
//       setFormData((prev) => ({
//         ...prev,
//         ChqDet: {
//           ClearDt: "",
//           Cleared: "",
//           Chqno: "",
//           Chqdt: "",
//           Chqamt: "",
//           Banknm: "",
//           Bankbrn: "",
//           Ptmsptcd: "",
//           Ptmsptnm: "",
//           ColAmt: "",
//           brcd: "",
//           Acccode: "",
//           Onaccount: "",
//           Diposited: "",
//         },
//         MRHDR: {
//           ...prev.MRHDR,
//           MRSCHQ: "",
//           MRSCHQNO: "",
//           MRSCHQDT: "",
//           MRSBANK: "",
//           BankAcccode:""
//         },
//       }));
//     } else {
//       setFormData((prev) => ({
//         ...prev,
//         MRHDR: {
//           ...prev.MRHDR,
//           MRSCASH: "",
//         },
//       }));
//     }
//     setIsCashSelected(formData.MRHDR.paymode === "190");
//   }, [formData.MRHDR.paymode]);

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

//   const fetchBillDetails = async () => {
//     setLoading(true);
//     try {
//       const data = await getBillEntryPayment(selectedBills);
//       setBillDetails(data);

//       const parsedBills = data.map((bill) => {
//         const charges = bill.CHGCODE.split("*/")
//           .map((charge) => {
//             const [code, description, isActive, sign] = charge.split("~");
//             return { code, description, isActive, sign };
//           })
//           .filter((charge) => charge.isActive === "Y");

//         return { ...bill, charges, NetRecdAmount: bill.BILLAMT };
//       });

//       setFormData((prev) => ({
//         ...prev,
//         BillMRDET: {
//           BillMRDET: parsedBills.map((bill) => ({
//             BillNO: bill.BillNO || "",
//             CustCd: bill.CustCd || "",
//             BGNDT: bill.BGNDT || "",
//             BILLAMT: bill.BILLAMT || "",
//             PendAmt: bill.PendAmt || "",
//             TOTBILL: "",
//             TDSDED: "",
//             NETAMT: "",
//             UNEXPDED: "",
//             DOCNO: "",
//             CHG1: "",
//             CHG2: "",
//             CHG3: "",
//             CHG4: "",
//             CHG5: "",
//             CHG6: "",
//             CHG7: "",
//             CHG8: "",
//             CHG9: "",
//             CHG10: "",
//             Remarks: "",
//             charges: bill.charges,
//           })),
//         },
//       }));
//     } catch (err) {
//       setError(err.message || "Failed to fetch bill details");
//       toast.error("Failed to fetch bill details. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleInputChange = (e, section) => {
//     const { name, value, type, checked } = e.target;

//     setFormData((prev) => ({
//       ...prev,
//       [section]: {
//         ...prev[section],
//         [name]: type === "checkbox" ? checked : value,
//       },
//     }));

//     if (name === "paymode" && section === "MRHDR") {
//       setIsCashSelected(value === "190");
//     }
//   };

//   const handleBillInputChange = (e, index, name) => {
//     const { value } = e.target;
//     setFormData((prev) => {
//       const updatedBills = [...prev.BillMRDET.BillMRDET];
//       updatedBills[index][name] = value;
//       return {
//         ...prev,
//         BillMRDET: {
//           BillMRDET: updatedBills,
//         },
//       };
//     });
//   };

//   const formatDate = (inputDate) => {
//     if (!inputDate) return "";
//     const date = new Date(inputDate);
//     return date.toLocaleDateString("en-GB", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     const transformedBills = formData.BillMRDET.BillMRDET.map((bill) => ({
//       TOTBILL: String(bill.TOTBILL) || "0.00",
//       TDSDED: bill.TDSDED || "0.00",
//       NETAMT: String(bill.BILLAMT) || "0.00",
//       UNEXPDED: bill.UNEXPDED || "0.00",
//       DOCNO: bill.BillNO || "",
//       CHG1: bill.CHG1 || "0.00",
//       CHG2: bill.CHG2 || "0.00",
//       CHG3: bill.CHG3 || "0.00",
//       CHG4: bill.CHG4 || "0.00",
//       CHG5: bill.CHG5 || "0.00",
//       CHG6: bill.CHG6 || "0.00",
//       CHG7: bill.CHG7 || "0.00",
//       CHG8: bill.CHG8 || "0.00",
//       CHG9: bill.CHG9 || "0.00",
//       CHG10: bill.CHG10 || "0.00",
//       Remarks: bill.Remarks || "",
//     }));

//     const filteredChqDet = Object.keys(formData.ChqDet).reduce((acc, key) => {
//       if (formData.ChqDet[key] !== undefined && formData.ChqDet[key] !== "") {
//         acc[key] = formData.ChqDet[key];
//       }
//       return acc;
//     }, {});

//     const filteredMRHDR = Object.keys(formData.MRHDR).reduce((acc, key) => {
//       if (formData.MRHDR[key] !== undefined && formData.MRHDR[key] !== "") {
//         acc[key] = formData.MRHDR[key];
//       }
//       return acc;
//     }, {});

//     const payload = {
//       ChqDet: {
//         ...filteredChqDet,
//         ClearDt: formatDate(formData.ChqDet.ClearDt),
//         Chqdt: formatDate(formData.ChqDet.Chqdt),
//       },
//       BillMRDET: {
//         BillMRDET: transformedBills,
//       },
//       MRHDR: {
//         ...filteredMRHDR,
//         MRSDT: formatDate(formData.MRHDR.MRSDT),
//         MRSCHQDT: formatDate(formData.MRHDR.MRSCHQDT),
//         finclosedt: formatDate(formData.MRHDR.finclosedt),
//         CompanyCode: userDetail.CompanyCode,
//         MRSBR: userDetail.LocationName,
//         MRSTYPE: "1",
//         EMRS_type: "MR",
//       },
//       MR_Location: formData.MR_Location || "1",
//       FinYear: Finyear,
//       EntryBy: userDetail.UserId,
//       CompanyCode: userDetail.CompanyCode,
//     };

//     try {
//       const response = await billgenerate(payload);

//       if (response.status) {
//         toast.success("Bill generated successfully!");
//         router.push("/bill-payment");
//       } else {
//         toast.error("Failed to generate bill. Please try again.");
//       }
//     } catch (err) {
//       toast.error("An error occurred while generating the bill.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-8 text-black w-full lg:ml-[288px] lg:w-[calc(100vw-288px)] min-h-screen ml-0">
//       <button
//         className="flex justify-start p-3 text-black lg:hidden"
//         onClick={() => setIsSidebarOpen(true)}
//       >
//         <FontAwesomeIcon icon={faAlignLeft} />
//       </button>
//       <div className="bg-white p-8 rounded-lg shadow-lg space-y-6">
//         <h4 className="text-2xl text-center text-gray-800 font-bold">
//           Bill Collection
//         </h4>

//         <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
//           <h6 className="text-gray-700 text-xl font-semibold mb-6">
//             You Selected
//           </h6>
//           <div className="space-y-6">
//             <div className="space-y-4">
//               <div className="flex flex-col gap-4 md:flex-row md:gap-14">
//                 <div className="flex flex-col space-y-1">
//                   <span className="text-gray-500 text-sm font-medium">
//                     Customer Code and Name
//                   </span>
//                   <span className="text-base text-gray-800 font-semibold">
//                     {billDetails[0]?.CustCd || "-"}
//                   </span>
//                 </div>
//                 <div className="flex flex-col space-y-1">
//                   <span className="text-gray-500 text-sm font-medium">
//                     Docket Booking Date Range
//                   </span>
//                   <span className="text-base text-gray-800 font-semibold">
//                     {Fromdt} TO {Todt}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <form onSubmit={handleSubmit} className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm space-y-6">
          //    <div className="border p-5 rounded-lg">
          //  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          //    {[
          //       ["ManualMrsno", "MR Number", "text", true, "System Generated"],
          //       ["MRSBR", "MR branch", "text", true],
          //       ["MRSDT", "MR Generation Date", "date", false],
          //       ["MRS_CLOSED", "Is Reconciled", "checkbox", false],
          //       ["Remarks", "Remarks", "textarea", false],
          //     ].map(([name, label, type, required, placeHolder, options], index) => (
          //       <div key={index} className={`flex items-center ${type === "textarea" ? "md:col-span-2" : ""}`}>
          //         <label className={`text-gray-700 font-medium ${label.includes("Remarks") ? "lg:w-1/6" : ""} w-1/3 text-left`}>{label}</label>
          //         {type === "select" ? (
          //           <select
          //             name={name}
          //             value={formData.MRHDR[name] || ""}
          //             onChange={(e) => handleInputChange(e, "MRHDR")}
          //             className="bg-gray-100 border border-gray-300 p-2 rounded-md w-2/3 focus:outline-none focus:ring-2 focus:ring-gray-500"
          //             placeholder={placeHolder}
          //           >
          //             <option value="">Select {label}</option>
          //             {options.map((option, idx) => (
          //               <option key={idx} value={option}>
          //                 {option}
          //               </option>
          //             ))}
          //           </select>
          //         ) : type === "textarea" ? (
          //           <textarea
          //             name={name}
          //             value={formData.MRHDR[name] || ""}
          //             onChange={(e) => handleInputChange(e, "MRHDR")}
          //             className="bg-gray-100 border border-gray-300 p-2 rounded-md w-2/3 focus:outline-none focus:ring-2 focus:ring-gray-500 lg:w-5/6 resize-none"
          //             rows="2"
          //             placeholder={placeHolder}
          //           />
          //         ) : type === "checkbox" ? (
          //           <input
          //             type={type}
          //             name={name}
          //             checked={formData.MRHDR[name] || false}
          //             onChange={(e) => handleInputChange(e, "MRHDR")}
          //             className="border-gray-300 h-5 rounded text-blue-600 w-5 focus:ring-gray-500"
          //           />
          //         )  : (
          //           <input
          //             type={type}
          //             name={name}
          //             value={formData.MRHDR[name] || ""}
          //             onChange={(e) => handleInputChange(e, "MRHDR")}
          //             className="bg-gray-100 border border-gray-300 p-2 rounded-md w-2/3 focus:outline-none focus:ring-2 focus:ring-gray-500"
          //             disabled={name === "MRSBR" || name === "ManualMrsno"}
          //             placeholder={placeHolder}
          //             readOnly={name === "MRSBR" || name === "ManualMrsno"}
          //           />
          //         )}
          //       </div>
          //     ))}
          //   </div>
          // </div>

          // <div className="border p-5 rounded-lg">
          //   <h5 className="flex justify-center text-lg font-semibold mb-2">List Of Bills:</h5>
          //   <div className="border shadow-md overflow-x-auto relative sm:rounded-lg">
          //     <table className="border border-gray-300 text-center text-gray-500 text-sm min-w-full rtl:text-right">
          //       <thead className="bg-gray-200 border-b-2 border-gray-400 text-gray-700 uppercase">
          //         <tr className="border border-gray-300">
          //           <th className="border border-gray-300 py-2">SR No</th>
          //           {[
          //             "Bill No",
          //             "Bill Date",
          //             "Bill Amt.",
          //             "Pending Amt.",
          //             "Net Recd. Amount",
          //           ].map((header, index) => (
          //             <th key={index} className="border border-gray-300 px-2 py-2">
          //               {header}
          //             </th>
          //           ))}
          //           {formData.BillMRDET.BillMRDET[0]?.charges?.map((charge, index) => (
          //             <th key={index} className="border border-gray-300 px-2 py-2">
          //               {charge.description}
          //             </th>
          //           ))}
          //           <th className="border border-gray-300 px-2 py-2">Remarks</th>
          //         </tr>
          //       </thead>
          //       <tbody>
          //         {formData.BillMRDET.BillMRDET.map((bill, index) => (
          //           <tr key={index} className="border border-gray-300">
          //             <td className="border border-gray-300 px-1 py-2">{index + 1}</td>
          //             <td className="border border-gray-300 px-1 py-2">{bill.BillNO}</td>
          //             <td className="border border-gray-300 px-1 py-2">{bill.BGNDT}</td>
          //             <td className="border border-gray-300 px-1 py-2">{bill.BILLAMT}</td>
          //             <td className="border border-gray-300 px-1 py-2">{bill.PendAmt}</td>
          //             <td className="border border-gray-300 px-1 py-2"> {formData.BillMRDET.BillMRDET[index].NetRecdAmount || bill.BILLAMT}
          //               {/* <input
          //                 type="number"
          //                 name="NetRecdAmount"
          //                 value={formData.BillMRDET.BillMRDET[index].NetRecdAmount || bill.BILLAMT}
          //                 onChange={(e) => handleBillInputChange(e, index, "NetRecdAmount")}
          //                 className="bg-gray-100 border border-gray-300 p-1 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-gray-500"
          //               /> */}
          //             </td>
          //             {bill.charges?.map((charge, idx) => (
          //               <td key={idx} className="border border-gray-300 px-1 py-2">
          //                 <input
          //                   type="number"
          //                   name={`CHG${idx + 1}`}
          //                   value={formData.BillMRDET.BillMRDET[index][`CHG${idx + 1}`] || ""}
          //                   onChange={(e) => handleBillInputChange(e, index, `CHG${idx + 1}`)}
          //                   className="bg-gray-100 border border-gray-300 p-1 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-gray-500"
          //                 />
          //               </td>
          //             ))}
          //             <td className="border border-gray-300 px-1 py-2">
          //               <textarea
          //                 name="Remarks"
          //                 value={bill.Remarks || ""}
          //                 onChange={(e) => handleBillInputChange(e, index, "Remarks")}
          //                 className="bg-gray-100 border border-gray-300 p-1 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-gray-500"
          //               />
          //             </td>
          //           </tr>
          //         ))}
          //       </tbody>
          //     </table>
          //   </div>
          // </div>
          // <div className="border p-5 rounded-lg">
          //   <h5 className="flex justify-center text-lg font-semibold mb-4">Collection Details</h5>
          //   <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          //     {[
          //       ["paymode", "Receipt Mode", "select", true, dropdownData.CPTYP],
          //       ["NETAMT", "Net Amount", "number", true],
          //       ["MRSCASH", "Cash Amount", "number", true],
          //       // ["MRSTYPE", "MRS Type", "text", true],
          //       // ["EMRS_type", "EMRS Type", "text", true],
          //       ["BankAcccode", "Bank Account Code", "text", true],
          //     ].map(([name, label, type, isRequired, options], index) => (
          //       <div key={index} className="flex items-center">
          //         <label className="text-gray-700 text-left w-1/3 font-medium">{label}</label>
          //         {type === "select" ? (
          //           <select
          //             name={name}
          //             value={formData.MRHDR[name] || ""}
          //             onChange={(e) => handleInputChange(e, "MRHDR")}
          //             className="bg-gray-100 border border-gray-300 p-2 rounded-md w-2/3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          //             required={isRequired}
          //           >
          //             <option value="">Select {label}</option>
          //             {options.map((option, idx) => (
          //               <option key={idx} value={option.CodeId || option}>
          //                 {option.CodeDesc || option}
          //               </option>
          //             ))}
          //           </select>
          //         ) : (
          //           <input
          //             type={type}
          //             name={name}
          //             value={formData.MRHDR[name] || ""}
          //             onChange={(e) => handleInputChange(e, "MRHDR")}
          //             className={`p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
          //               (name === "MRSCASH" && !isCashSelected) || 
          //               (name !== "MRSCASH" && name !== "NETAMT" && isCashSelected)
          //                 ? "opacity-50 cursor-not-allowed"
          //                 : ""
          //             }`}
          //             required={isRequired && ((name === "MRSCASH" && isCashSelected) || (name !== "MRSCASH" && !isCashSelected))}
          //             disabled={
          //               (name === "MRSCASH" && !isCashSelected) || 
          //               (name !== "MRSCASH" && name !== "NETAMT" && isCashSelected)
          //             }
          //           />
          //         )}
          //       </div>
          //     ))}
          //     {[
          //       ["ClearDt", "Clear Date", "date", false],
          //       ["Chqno", "Cheque Number", "text", false],
          //       ["Chqdt", "Cheque Date", "date", false],
          //       ["Chqamt", "Cheque Amount", "number", false],
          //       ["ColAmt", "Collection Amount", "number", false],
          //       ["Banknm", "Bank Name", "text", false],
          //       ["Diposited", "Deposited", "checkbox", false],
          //       ["Onaccount", "On Account", "checkbox", false],
          //       ["Acccode", "Account Code", "text", false],
          //     ].map(([name, label, type, isRequired, options], index) => (
          //       <div key={index} className="flex items-center">
          //         <label className="text-gray-700 text-left w-1/3 font-medium">{label}</label>
          //         {type === "select" ? (
          //           <select
          //             name={name}
          //             value={formData.ChqDet[name] || ""}
          //             onChange={(e) => handleInputChange(e, "ChqDet")}
          //             className={`p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
          //               isCashSelected ? "opacity-50 cursor-not-allowed" : ""
          //             }`}
          //             required={isRequired && !isCashSelected}
          //             disabled={isCashSelected}
          //           >
          //             <option value="">Select {label}</option>
          //             {options?.map((option, idx) => (
          //               <option key={idx} value={option}>
          //                 {option}
          //               </option>
          //             ))}
          //           </select>
          //         ) : type === "checkbox" ? (
          //           <input
          //             type={type}
          //             name={name}
          //             checked={formData.ChqDet[name] || false}
          //             onChange={(e) => handleInputChange(e, "ChqDet")}
          //             className={`h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-gray-500 ${
          //               isCashSelected ? "opacity-50 cursor-not-allowed" : ""} `}
          //             required={isRequired && !isCashSelected}
          //             disabled={isCashSelected}

          //           />
          //         ) : (
          //           <input
          //             type={type}
          //             name={name}
          //             value={formData.ChqDet[name] || ""}
          //             onChange={(e) => handleInputChange(e, "ChqDet")}
          //             className={`p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
          //               isCashSelected ? "opacity-50 cursor-not-allowed" : ""
          //             }`}
          //             required={isRequired && !isCashSelected}
          //             disabled={isCashSelected}
          //           />
          //         )}
          //       </div>
          //     ))}
          //   </div>
          // </div>
          // <div className="flex justify-end">
          //   <button
          //     type="submit"
          //     className="bg-blue-600 rounded-lg text-white duration-200 hover:bg-blue-700 px-6 py-2 transition"
          //     disabled={loading}
          //   >
          //     {loading ? "Submitting..." : "Submit"}
          //   </button>
          // </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default BillPaymentDetails;


"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { billgenerate, fetchDropdownData, Finyear, getBillEntryPayment } from "@/lib/masterService";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { faAlignLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";

const BillPaymentDetails = () => {
  const searchParams = useSearchParams();
  const selectedBills = searchParams.get("selectedBill");
  const Fromdt = searchParams.get("Fromdt");
  const Todt = searchParams.get("Todt");
  const router = useRouter();
  const { setIsSidebarOpen, userDetail } = useAuth();

  const [billDetails, setBillDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCashSelected, setIsCashSelected] = useState(false);
  const [dropdownData, setDropdownData] = useState({
    CPTYP: [],
  });

  const [formData, setFormData] = useState({
    ChqDet: {
      ClearDt: "",
      Cleared: "",
      Chqno: "",
      Chqdt: "",
      Chqamt: "",
      Banknm: "",
      Bankbrn: "",
      Ptmsptcd: "",
      Ptmsptnm: "",
      ColAmt: "",
      brcd: "",
      Acccode: "",
      Onaccount: "",
      Diposited: "",
    },
    BillMRDET: {
      BillMRDET: [],
    },
    MRHDR: {
      MRSDT: "",
      MRSTYPE: "",
      EMRS_type: "",
      MRSBR: userDetail.LocationName,
      PTCD: "",
      PTMSNM: "",
      MRSAMT: "",
      NETAMT: "",
      DEDUCTION: "",
      MRSCASH: "",
      MRSCHQ: "",
      MRSCHQNO: "",
      MRSCHQDT: "",
      MRSBANK: "",
      MRS_CLOSED: "",
      DED_TDS: "",
      MR_CANCEL: "",
      BILLMR: "",
      finclosedt: "",
      paymode: "190",
      BankAcccode: "",
      BankAccdesc: "",
      tdsacccode: "",
      tdsaccdesc: "",
      ManualMrsno: "",
      CompanyCode: "",
    },
    MR_Location: "",
    FinYear: "",
    EntryBy: "",
    CompanyCode: "",
  });

  // Fetch bill details when selectedBills changes
  useEffect(() => {
    if (selectedBills) {
      fetchBillDetails();
    } else {
      router.push(`/bill-payment`);
    }
  }, [selectedBills]);

  // Fetch dropdown data when userDetail.CompanyCode changes
  useEffect(() => {
    if (userDetail?.CompanyCode) {
      Object.keys(dropdownData).forEach((key) => {
        handleDropdownData(userDetail.CompanyCode, key);
      });
    }
  }, [userDetail?.CompanyCode]);

  // Reset fields when paymode changes
  useEffect(() => {
    if (formData.MRHDR.paymode === "190") {
      // Reset cheque-related fields when paymode is cash
      setFormData((prev) => ({
        ...prev,
        ChqDet: {
          ClearDt: "",
          Cleared: "",
          Chqno: "",
          Chqdt: "",
          Chqamt: "",
          Banknm: "",
          Bankbrn: "",
          Ptmsptcd: "",
          Ptmsptnm: "",
          ColAmt: "",
          brcd: "",
          Acccode: "",
          Onaccount: "",
          Diposited: "",
        },
        MRHDR: {
          ...prev.MRHDR,
          MRSCHQ: "",
          MRSCHQNO: "",
          MRSCHQDT: "",
          MRSBANK: "",
          BankAcccode: "",
        },
      }));
    } else {
      // Reset cash-related fields when paymode is not cash
      setFormData((prev) => ({
        ...prev,
        MRHDR: {
          ...prev.MRHDR,
          MRSCASH: "",
        },
      }));
    }
    setIsCashSelected(formData.MRHDR.paymode === "190");
  }, [formData.MRHDR.paymode]);

  // Calculate Net Amount and update Cash/Cheque Amount dynamically
  useEffect(() => {
    const calculateNetAmount = () => {
      const updatedBills = formData.BillMRDET.BillMRDET.map((bill) => {
        let netAmount = parseFloat(bill.BILLAMT) || 0;

        // Calculate Net Amount based on charges
        bill.charges.forEach((charge, index) => {
          const chargeValue = parseFloat(bill[`CHG${index + 1}`]) || 0;
          if (charge.sign === "-") {
            netAmount -= chargeValue; // Subtract if sign is "-"
          } else if (charge.sign === "+") {
            netAmount += chargeValue; // Add if sign is "+"
          }
        });

        return {
          ...bill,
          NETAMT: netAmount.toFixed(2), // Ensure 2 decimal places
        };
      });

      // Calculate total Net Amount for all bills
      const totalNetAmount = updatedBills.reduce(
        (sum, bill) => sum + (parseFloat(bill.NETAMT) || 0),
        0
      );

      // Update Cash Amount or Cheque Amount based on paymode
      if (formData.MRHDR.paymode === "190") {
        setFormData((prev) => ({
          ...prev,
          MRHDR: {
            ...prev.MRHDR,
            MRSCASH: totalNetAmount.toFixed(2), // Set Cash Amount
            MRSCHQ: "", // Reset Cheque Amount
          },
          ChqDet: {
            ...prev.ChqDet,
            Chqamt: "",
            ColAmt: ""
          }
        }));
      } else if (formData.MRHDR.paymode === "191") {
        setFormData((prev) => ({
          ...prev,
          MRHDR: {
            ...prev.MRHDR,
            MRSCHQ: totalNetAmount.toFixed(2), // Set Cheque Amount
            MRSCASH: "", // Reset Cash Amount
          },
          ChqDet: {
            ...prev.ChqDet,
            ColAmt: totalNetAmount.toFixed(2),
            Chqamt: totalNetAmount.toFixed(2),
            }
        }));
      }

      // Update Collection Amount
      setFormData((prev) => ({
        ...prev,
        ChqDet: {
          ...prev.ChqDet,
        },
        MRHDR: {
          ...prev.MRHDR,
          NETAMT: totalNetAmount.toFixed(2),
        },
      }));
    };

    calculateNetAmount();
  }, [formData.BillMRDET.BillMRDET, formData.MRHDR.paymode]);

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

  const fetchBillDetails = async () => {
    setLoading(true);
    try {
      const data = await getBillEntryPayment(selectedBills);
      setBillDetails(data);

      const parsedBills = data.map((bill) => {
        // Parse charges from CHGCODE
        const charges = bill.CHGCODE.split("*/")
        .map((charge) => {
          const [code, description, isActive, sign] = charge.split("~");
      
          // Determine the sign based on the description
          const calculatedSign = description.includes("(+)") ? "+" : "-";
      
          return { code, description, isActive, sign: calculatedSign };
        })
        .filter((charge) => charge.isActive === "Y");

        // Calculate Net Amount dynamically
        let netAmount = parseFloat(bill.BILLAMT) || 0;

        charges.forEach((charge, index) => {
          const chargeValue = parseFloat(bill[`CHG${index + 1}`]) || 0;
        
          if (charge.sign === "+") {
            netAmount += chargeValue; // Add if sign is "+"
          } else if (charge.sign === "-") {
            netAmount -= chargeValue; // Subtract if sign is "-"
          }
        });
        
        bill.NETAMT = netAmount.toFixed(2); // Update Net Amount

        return {
          ...bill,
          charges,
          NetRecdAmount: netAmount.toFixed(2), // Ensure 2 decimal places
        };
      });

      setFormData((prev) => ({
        ...prev,
        BillMRDET: {
          BillMRDET: parsedBills.map((bill) => ({
            BillNO: bill.BillNO || "",
            CustCd: bill.CustCd || "",
            BGNDT: bill.BGNDT || "",
            BILLAMT: bill.BILLAMT || "",
            PendAmt: bill.PendAmt || "",
            TOTBILL: "",
            TDSDED: "",
            NETAMT: bill.NetRecdAmount || "", // Use dynamically calculated Net Amount
            UNEXPDED: "",
            DOCNO: "",
            CHG1: "",
            CHG2: "",
            CHG3: "",
            CHG4: "",
            CHG5: "",
            CHG6: "",
            CHG7: "",
            CHG8: "",
            CHG9: "",
            CHG10: "",
            Remarks: "",
            charges: bill.charges,
          })),
        },
      }));
    } catch (err) {
      setError(err.message || "Failed to fetch bill details");
      toast.error("Failed to fetch bill details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e, section) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: type === "checkbox" ? checked : value,
      },
    }));

    if (name === "paymode" && section === "MRHDR") {
      setIsCashSelected(value === "190");
    }
  };

  const handleBillInputChange = (e, index, name) => {
    const { value } = e.target;

    setFormData((prev) => {
      const updatedBills = [...prev.BillMRDET.BillMRDET];
      updatedBills[index][name] = value;

      // Recalculate Net Amount for the current bill
      const bill = updatedBills[index];
      let netAmount = parseFloat(bill.BILLAMT) || 0;

      bill.charges.forEach((charge, chargeIndex) => {
        const chargeValue = parseFloat(updatedBills[index][`CHG${chargeIndex + 1}`]) || 0;
        if (charge.sign === "-") {
          netAmount -= chargeValue; // Subtract if sign is "-"
        } else if (charge.sign === "+") {
          netAmount += chargeValue; // Add if sign is "+"
        }
      });

      updatedBills[index].NETAMT = netAmount.toFixed(2); // Update Net Amount

      return {
        ...prev,
        BillMRDET: {
          BillMRDET: updatedBills,
        },
      };
    });
  };

  const formatDate = (inputDate) => {
    if (!inputDate) return "";
    const date = new Date(inputDate);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const transformedBills = formData.BillMRDET.BillMRDET.map((bill) => ({
      TOTBILL: String(bill.TOTBILL) || "0.00",
      TDSDED: bill.TDSDED || "0.00",
      NETAMT: String(bill.NETAMT) || "0.00", // Use dynamically calculated Net Amount
      UNEXPDED: bill.UNEXPDED || "0.00",
      DOCNO: bill.BillNO || "",
      CHG1: bill.CHG1 || "0.00",
      CHG2: bill.CHG2 || "0.00",
      CHG3: bill.CHG3 || "0.00",
      CHG4: bill.CHG4 || "0.00",
      CHG5: bill.CHG5 || "0.00",
      CHG6: bill.CHG6 || "0.00",
      CHG7: bill.CHG7 || "0.00",
      CHG8: bill.CHG8 || "0.00",
      CHG9: bill.CHG9 || "0.00",
      CHG10: bill.CHG10 || "0.00",
      Remarks: bill.Remarks || "",
    }));

    const filteredChqDet = Object.keys(formData.ChqDet).reduce((acc, key) => {
      if (formData.ChqDet[key] !== undefined && formData.ChqDet[key] !== "") {
        acc[key] = formData.ChqDet[key];
      }
      return acc;
    }, {});

    const filteredMRHDR = Object.keys(formData.MRHDR).reduce((acc, key) => {
      if (formData.MRHDR[key] !== undefined && formData.MRHDR[key] !== "") {
        acc[key] = formData.MRHDR[key];
      }
      return acc;
    }, {});

    const payload = {
      ChqDet: {
        ...filteredChqDet,
        ClearDt: formatDate(formData.ChqDet.ClearDt),
        Chqdt: formatDate(formData.ChqDet.Chqdt),
      },
      BillMRDET: {
        BillMRDET: transformedBills,
      },
      MRHDR: {
        ...filteredMRHDR,
        MRSDT: formatDate(formData.MRHDR.MRSDT),
        MRSCHQDT: formatDate(formData.MRHDR.MRSCHQDT),
        finclosedt: formatDate(formData.MRHDR.finclosedt),
        CompanyCode: userDetail.CompanyCode,
        MRSBR: userDetail.LocationName,
        MRSTYPE: "1",
        EMRS_type: "MR",
      },
      MR_Location: formData.MR_Location || "1",
      FinYear: Finyear,
      EntryBy: userDetail.UserId,
      CompanyCode: userDetail.CompanyCode,
    };

    try {
      const response = await billgenerate(payload);

      if (response.status) {
        toast.success("Bill generated successfully!");
        router.push("/bill-payment");
      } else {
        toast.error("Failed to generate bill. Please try again.");
      }
    } catch (err) {
      toast.error("An error occurred while generating the bill.");
    } finally {
      setLoading(false);
    }
  };

  // pdf Generator
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  
  //   try {
  //     // Create a new PDF document
  //     const doc = new jsPDF();
  
  //     // Add Bill Collection title
  //     doc.setFontSize(18);
  //     doc.text("Bill Collection", 10, 20);
  
  //     // Add "You Selected" section
  //     doc.setFontSize(12);
  //     doc.text("You Selected", 10, 30);
  //     doc.text(`Customer Code and Name: ${billDetails[0]?.CustCd || "-"}`, 10, 40);
  //     doc.text(`Docket Booking Date Range: ${Fromdt} TO ${Todt}`, 10, 50);
  
  //     // Add MR Number section
  //     doc.text("MR Number", 10, 70);
  //     autoTable(doc, {
  //       startY: 75,
  //       head: [["System Generated", "MR branch", "Surat","Remarks"]],
  //       body: [
  //         [
  //           formData.MRHDR.ManualMrsno || "System Generated",
  //           formData.MRHDR.MRSBR || "Surat",
  //           formData.MRHDR.MRSDT || "06-mm-yyyy",
  //           formData.MRHDR.Remarks || "-"
  //         ],
  //       ],
  //     });
  
  //     // Add Remarks
  //     // doc.text("Remarks", 10, 110);
  //     // doc.text(formData.MRHDR.Remarks || "", 10, 120);
  
  //     // Add List Of Bills section
  //     doc.text("List Of Bills:", 10, 10);
  //     autoTable(doc, {
  //       startY: 105,
  //       head: [
  //         [
  //           "SR NO",
  //           "BILL NO",
  //           "BILL DATE",
  //           "BILL AMT.",
  //           "PENDING AMT.",
  //           "NET RECD. AMOUNT",
  //           "PAYMENT GATEWAY CHARGES(↓)",
  //           "COD CHARGES(↓)",
  //           "DISCOUNT(↓)",
  //           "REMARKS",
  //         ],
  //       ],
  //       body: formData.BillMRDET.BillMRDET.map((bill, index) => [
  //         index + 1,
  //         bill.BillNO || "",
  //         bill.BGNDT || "",
  //         bill.BILLAMT || "0.00",
  //         bill.PendAmt || "0.00",
  //         bill.NETAMT || "0.00",
  //         bill.CHG1 || "0.00",
  //         bill.CHG2 || "0.00",
  //         bill.CHG3 || "0.00",
  //         bill.Remarks || "-",
  //       ]),
  //     });
  
  //     // Add Collection Details section
  //     const finalY = doc.lastAutoTable?.finalY || 145; // Fallback if undefined
  //     doc.text("Collection Details", 10, finalY + 20);
  //     autoTable(doc, {
  //       startY: finalY + 25,
  //       // head: [["Receipt Mode", "Cash", "Net Amount", formData.MRHDR.NETAMT || "0.00"]],
  //       body: [
  //         [
  //           "Cash Amount",
  //           formData.MRHDR.MRSCASH || "0.00",
  //           "Bank Account Code",
  //           formData.MRHDR.BankAcccode || "",
  //         ],
  //         [
  //           "Clear Date",
  //           formData.ChqDet.ClearDt || "dd-mm-yyyy",
  //           "Cheque Number",
  //           formData.ChqDet.Chqno || "-",
  //         ],
  //         [
  //           "Cheque Date",
  //           formData.ChqDet.Chqdt || "dd-mm-yyyy",
  //           "Cheque Amount",
  //           formData.ChqDet.Chqamt || "0.00",
  //         ],
  //         [
  //           "Collection Amount",
  //           formData.ChqDet.ColAmt || "0.00",
  //           "Bank Name",
  //           formData.ChqDet.Banknm || "-",
  //         ],
  //         [
  //           "Deposited",
  //           formData.ChqDet.Diposited ? "Yes" : "No",
  //           "On Account",
  //           formData.ChqDet.Onaccount ? "Yes" : "No",
  //         ],
  //         ["Account Code", formData.ChqDet.Acccode || "-"],
  //       ],
  //     });
  
  //     // Save the PDF and open it in a new tab
  //     //  doc.save("Bill Collection.pdf");
  //     const pdfBlob = doc.output("blob");
  //     const pdfUrl = URL.createObjectURL(pdfBlob);
  //     window.open(pdfUrl, "_blank");
  
  //     // Redirect to the bill-payment page
  //     // router.push("/bill-payment");
  //   } catch (err) {
  //     toast.error("An error occurred while generating the bill.");
  //     console.error(err); // Log the error for debugging
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  return (
    <div className="p-8 text-black w-full lg:ml-[288px] lg:w-[calc(100vw-288px)] min-h-screen ml-0">
      <button
        className="flex justify-start p-3 text-black lg:hidden"
        onClick={() => setIsSidebarOpen(true)}
      >
        <FontAwesomeIcon icon={faAlignLeft} />
      </button>
      <div className="bg-white p-8 rounded-lg shadow-lg space-y-6">
        <h4 className="text-2xl text-center text-gray-800 font-bold">
          Bill Collection
        </h4>

        <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
          <h6 className="text-gray-700 text-xl font-semibold mb-6">
            You Selected
          </h6>
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex flex-col gap-4 md:flex-row md:gap-14">
                <div className="flex flex-col space-y-1">
                  <span className="text-gray-500 text-sm font-medium">
                    Customer Code and Name
                  </span>
                  <span className="text-base text-gray-800 font-semibold">
                    {billDetails[0]?.CustCd || "-"}
                  </span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-gray-500 text-sm font-medium">
                    Docket Booking Date Range
                  </span>
                  <span className="text-base text-gray-800 font-semibold">
                    {Fromdt} TO {Todt}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm space-y-6">
        <div className="border p-5 rounded-lg">
           <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
             {[
                ["ManualMrsno", "MR Number", "text", true, "System Generated"],
                ["MRSBR", "MR branch", "text", true],
                ["MRSDT", "MR Generation Date", "date", false],
                ["MRS_CLOSED", "Is Reconciled", "checkbox", false],
                ["Remarks", "Remarks", "textarea", false],
              ].map(([name, label, type, required, placeHolder, options], index) => (
                <div key={index} className={`flex items-center ${type === "textarea" ? "md:col-span-2" : ""}`}>
                  <label className={`text-gray-700 font-medium ${label.includes("Remarks") ? "lg:w-1/6" : ""} w-1/3 text-left`}>{label}</label>
                  {type === "select" ? (
                    <select
                      name={name}
                      value={formData.MRHDR[name] || ""}
                      onChange={(e) => handleInputChange(e, "MRHDR")}
                      className="bg-gray-100 border border-gray-300 p-2 rounded-md w-2/3 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      placeholder={placeHolder}
                    >
                      <option value="">Select {label}</option>
                      {options.map((option, idx) => (
                        <option key={idx} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : type === "textarea" ? (
                    <textarea
                      name={name}
                      value={formData.MRHDR[name] || ""}
                      onChange={(e) => handleInputChange(e, "MRHDR")}
                      className="bg-gray-100 border border-gray-300 p-2 rounded-md w-2/3 focus:outline-none focus:ring-2 focus:ring-gray-500 lg:w-5/6 resize-none"
                      rows="2"
                      placeholder={placeHolder}
                    />
                  ) : type === "checkbox" ? (
                    <input
                      type={type}
                      name={name}
                      checked={formData.MRHDR[name] || false}
                      onChange={(e) => handleInputChange(e, "MRHDR")}
                      className="border-gray-300 h-5 rounded text-blue-600 w-5 focus:ring-gray-500"
                    />
                  )  : (
                    <input
                      type={type}
                      name={name}
                      value={formData.MRHDR[name] || ""}
                      onChange={(e) => handleInputChange(e, "MRHDR")}
                      className="bg-gray-100 border border-gray-300 p-2 rounded-md w-2/3 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      placeholder={placeHolder}
                      disabled={name === "MRSBR" || name === "ManualMrsno"}
                      readOnly={name === "MRSBR" || name === "ManualMrsno"}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="border p-5 rounded-lg">
            <h5 className="flex justify-center text-lg font-semibold mb-2">List Of Bills:</h5>
            <div className="border shadow-md overflow-x-auto relative sm:rounded-lg">
              <table className="border border-gray-300 text-center text-gray-500 text-sm min-w-full rtl:text-right">
                <thead className="bg-gray-200 border-b-2 border-gray-400 text-gray-700 uppercase">
                  <tr className="border border-gray-300">
                    <th className="border border-gray-300 py-2">SR No</th>
                    {[
                      "Bill No",
                      "Bill Date",
                      "Bill Amt.",
                      "Pending Amt.",
                      "Net Recd. Amount",
                    ].map((header, index) => (
                      <th key={index} className="border border-gray-300 px-2 py-2">
                        {header}
                      </th>
                    ))}
                    {formData.BillMRDET.BillMRDET[0]?.charges?.map((charge, index) => (
                      <th key={index} className="border border-gray-300 px-2 py-2">
                        {charge.description}
                      </th>
                    ))}
                    <th className="border border-gray-300 px-2 py-2">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.BillMRDET.BillMRDET.map((bill, index) => (
                    <tr key={index} className="border border-gray-300">
                      <td className="border border-gray-300 px-1 py-2">{index + 1}</td>
                      <td className="border border-gray-300 px-1 py-2">{bill.BillNO}</td>
                      <td className="border border-gray-300 px-1 py-2">{bill.BGNDT}</td>
                      <td className="border border-gray-300 px-1 py-2">{bill.BILLAMT}</td>
                      <td className="border border-gray-300 px-1 py-2">{bill.PendAmt}</td>
                      <td className="border border-gray-300 px-1 py-2"> {formData.BillMRDET.BillMRDET[index].NetRecdAmount || bill.BILLAMT}
                        {/* <input
                          type="number"
                          name="NetRecdAmount"
                          value={formData.BillMRDET.BillMRDET[index].NetRecdAmount || bill.BILLAMT}
                          onChange={(e) => handleBillInputChange(e, index, "NetRecdAmount")}
                          className="bg-gray-100 border border-gray-300 p-1 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-gray-500"
                        /> */}
                      </td>
                      {bill.charges?.map((charge, idx) => (
                        <td key={idx} className="border border-gray-300 px-1 py-2">
                          <input
                            type="number"
                            name={`CHG${idx + 1}`}
                            value={formData.BillMRDET.BillMRDET[index][`CHG${idx + 1}`] || ""}
                            onChange={(e) => handleBillInputChange(e, index, `CHG${idx + 1}`)}
                            className="bg-gray-100 border border-gray-300 p-1 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-gray-500"
                          />
                        </td>
                      ))}
                      <td className="border border-gray-300 px-1 py-2">
                        <textarea
                          name="Remarks"
                          value={bill.Remarks || ""}
                          onChange={(e) => handleBillInputChange(e, index, "Remarks")}
                          className="bg-gray-100 border border-gray-300 p-1 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-gray-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="border p-5 rounded-lg">
            <h5 className="flex justify-center text-lg font-semibold mb-4">Collection Details</h5>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {[
                ["paymode", "Receipt Mode", "select", true, dropdownData.CPTYP],
                ["NETAMT", "Net Amount", "number", true],
                ["MRSCASH", "Cash Amount", "number", true],
                // ["MRSTYPE", "MRS Type", "text", true],
                // ["EMRS_type", "EMRS Type", "text", true],
                ["BankAcccode", "Bank Account Code", "text", true],
              ].map(([name, label, type, isRequired, options], index) => (
                <div key={index} className="flex items-center">
                  <label className="text-gray-700 text-left w-1/3 font-medium">{label}</label>
                  {type === "select" ? (
                    <select
                      name={name}
                      value={formData.MRHDR[name] || ""}
                      onChange={(e) => handleInputChange(e, "MRHDR")}
                      className="bg-gray-100 border border-gray-300 p-2 rounded-md w-2/3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required={isRequired}
                    >
                      <option value="">Select {label}</option>
                      {options.map((option, idx) => (
                        <option key={idx} value={option.CodeId || option}>
                          {option.CodeDesc || option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={type}
                      name={name}
                      value={formData.MRHDR[name] || ""}
                      onChange={(e) => handleInputChange(e, "MRHDR")}
                      className={`p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                        (name === "MRSCASH" && !isCashSelected) || 
                        (name !== "MRSCASH" && name !== "NETAMT" && isCashSelected)
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      required={isRequired && ((name === "MRSCASH" && isCashSelected) || (name !== "MRSCASH" && !isCashSelected))}
                      disabled={
                        (name === "MRSCASH" && !isCashSelected) || 
                        (name !== "MRSCASH" && name !== "NETAMT" && isCashSelected)
                      }
                      readOnly={ name === "NETAMT" || name === "MRSCASH"}
                    />
                  )}
                </div>
              ))}
              {[
                ["ClearDt", "Clear Date", "date", false],
                ["Chqno", "Cheque Number", "text", false],
                ["Chqdt", "Cheque Date", "date", false],
                ["Chqamt", "Cheque Amount", "number", false],
                ["ColAmt", "Collection Amount", "number", false],
                ["Banknm", "Bank Name", "text", false],
                ["Diposited", "Deposited", "checkbox", false],
                ["Onaccount", "On Account", "checkbox", false],
                ["Acccode", "Account Code", "text", false],
              ].map(([name, label, type, isRequired, options], index) => (
                <div key={index} className="flex items-center">
                  <label className="text-gray-700 text-left w-1/3 font-medium">{label}</label>
                  {type === "select" ? (
                    <select
                      name={name}
                      value={formData.ChqDet[name] || ""}
                      onChange={(e) => handleInputChange(e, "ChqDet")}
                      className={`p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                        isCashSelected ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      required={isRequired && !isCashSelected}
                      disabled={isCashSelected}
                    >
                      <option value="">Select {label}</option>
                      {options?.map((option, idx) => (
                        <option key={idx} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : type === "checkbox" ? (
                    <input
                      type={type}
                      name={name}
                      checked={formData.ChqDet[name] || false}
                      onChange={(e) => handleInputChange(e, "ChqDet")}
                      className={`h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-gray-500 ${
                        isCashSelected ? "opacity-50 cursor-not-allowed" : ""} `}
                      required={isRequired && !isCashSelected}
                      disabled={isCashSelected}

                    />
                  ) : (
                    <input
                      type={type}
                      name={name}
                      value={formData.ChqDet[name] || ""}
                      onChange={(e) => handleInputChange(e, "ChqDet")}
                      className={`p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                        isCashSelected ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      required={isRequired && !isCashSelected}
                      disabled={isCashSelected}
                      readOnly={ name === "ColAmt" || name === "Chqamt"}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 rounded-lg text-white duration-200 hover:bg-blue-700 px-6 py-2 transition"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BillPaymentDetails;