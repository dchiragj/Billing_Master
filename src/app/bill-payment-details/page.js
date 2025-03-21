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
//     <div className="p-8 w-full lg:w-[calc(100vw-288px)] ml-0 lg:ml-[288px] text-black min-h-screen">
//       <button
//         className="lg:hidden text-black p-3 flex justify-start"
//         onClick={() => setIsSidebarOpen(true)}
//       >
//        <FontAwesomeIcon icon={faAlignLeft} />
//       </button>
//       <div className="bg-white p-8 rounded-lg shadow-lg space-y-6">
//         <h4 className="text-2xl font-bold text-center text-gray-800">
//           Bill Collection
//         </h4>

//         <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
//           <h6 className="text-xl font-semibold text-gray-700 mb-6">
//             You Selected
//           </h6>
//           <div className="space-y-6">
//             <div className="space-y-4">
//               <div className="flex flex-col md:flex-row gap-4 md:gap-14">
//                 <div className="flex flex-col space-y-1">
//                   <span className="text-sm font-medium text-gray-500">
//                     Customer Code and Name
//                   </span>
//                   <span className="text-base font-semibold text-gray-800">
//                     {billDetails[0]?.CustCd || "-"}
//                   </span>
//                 </div>
//                 <div className="flex flex-col space-y-1">
//                   <span className="text-sm font-medium text-gray-500">
//                     Docket Booking Date Range
//                   </span>
//                   <span className="text-base font-semibold text-gray-800">
//                     {Fromdt} TO {Todt}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
//           <div className="border rounded-lg p-5">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
//                       className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
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
//                       className="p-2 w-2/3 lg:w-5/6 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none resize-none"
//                       rows="2"
//                       placeholder={placeHolder}
//                     />
//                   ) : type === "checkbox" ? (
//                     <input
//                       type={type}
//                       name={name}
//                       checked={formData.MRHDR[name] || false}
//                       onChange={(e) => handleInputChange(e, "MRHDR")}
//                       className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-gray-500"
//                     />
//                   )  : (
//                     <input
//                       type={type}
//                       name={name}
//                       value={formData.MRHDR[name] || ""}
//                       onChange={(e) => handleInputChange(e, "MRHDR")}
//                       className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
//                       disabled={name === "MRSBR" || name === "ManualMrsno"}
//                       placeholder={placeHolder}
//                       readOnly={name === "MRSBR" || name === "ManualMrsno"}
//                     />
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div className="border rounded-lg p-5">
//             <h5 className="text-lg font-semibold mb-2 flex justify-center">List Of Bills:</h5>
//             <div className="relative overflow-x-auto shadow-md sm:rounded-lg border">
//               <table className="min-w-full text-sm text-center rtl:text-right text-gray-500 border border-gray-300">
//                 <thead className="text-gray-700 uppercase bg-gray-200 border-b-2 border-gray-400">
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
//                           className="p-1 w-full bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
//                         />
//                       </td>
//                       {bill.charges?.map((charge, idx) => (
//                         <td key={idx} className="border border-gray-300 px-1 py-2">
//                           <input
//                             type="number"
//                             name={`CHG${idx + 1}`}
//                             value={formData.BillMRDET.BillMRDET[index][`CHG${idx + 1}`] || ""}
//                             onChange={(e) => handleBillInputChange(e, index, `CHG${idx + 1}`)}
//                             className="p-1 w-full bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
//                           />
//                         </td>
//                       ))}
//                       <td className="border border-gray-300 px-1 py-2">
//                         <textarea
//                           name="Remarks"
//                           value={bill.Remarks || ""}
//                           onChange={(e) => handleBillInputChange(e, index, "Remarks")}
//                           className="p-1 w-full bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
//                         />
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//           <div className="border rounded-lg p-5">
//             <h5 className="text-lg font-semibold mb-4 flex justify-center">Collection Details</h5>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {[
//                 ["paymode", "Receipt Mode", "select", true, dropdownData.CPTYP],
//                 ["NETAMT", "Net Amount", "number", true],
//                 ["MRSCASH", "Cash Amount", "number", true],
//                 // ["MRSTYPE", "MRS Type", "text", true],
//                 // ["EMRS_type", "EMRS Type", "text", true],
//                 ["BankAcccode", "Bank Account Code", "text", true],
//               ].map(([name, label, type, isRequired, options], index) => (
//                 <div key={index} className="flex items-center">
//                   <label className="text-gray-700 font-medium w-1/3 text-left">{label}</label>
//                   {type === "select" ? (
//                     <select
//                       name={name}
//                       value={formData.MRHDR[name] || ""}
//                       onChange={(e) => handleInputChange(e, "MRHDR")}
//                       className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
//                   <label className="text-gray-700 font-medium w-1/3 text-left">{label}</label>
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
//               className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
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
//     <div className="p-8 w-full lg:w-[calc(100vw-288px)] ml-0 lg:ml-[288px] text-black min-h-screen">
//       <button
//         className="lg:hidden text-black p-3 flex justify-start"
//         onClick={() => setIsSidebarOpen(true)}
//       >
//         <FontAwesomeIcon icon={faAlignLeft} />
//       </button>
//       <div className="bg-white p-8 rounded-lg shadow-lg space-y-6">
//         <h4 className="text-2xl font-bold text-center text-gray-800">
//           Bill Collection
//         </h4>

//         <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
//           <h6 className="text-xl font-semibold text-gray-700 mb-6">
//             You Selected
//           </h6>
//           <div className="space-y-6">
//             <div className="space-y-4">
//               <div className="flex flex-col md:flex-row gap-4 md:gap-14">
//                 <div className="flex flex-col space-y-1">
//                   <span className="text-sm font-medium text-gray-500">
//                     Customer Code and Name
//                   </span>
//                   <span className="text-base font-semibold text-gray-800">
//                     {billDetails[0]?.CustCd || "-"}
//                   </span>
//                 </div>
//                 <div className="flex flex-col space-y-1">
//                   <span className="text-sm font-medium text-gray-500">
//                     Docket Booking Date Range
//                   </span>
//                   <span className="text-base font-semibold text-gray-800">
//                     {Fromdt} TO {Todt}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          //    <div className="border rounded-lg p-5">
          //  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          //             className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
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
          //             className="p-2 w-2/3 lg:w-5/6 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none resize-none"
          //             rows="2"
          //             placeholder={placeHolder}
          //           />
          //         ) : type === "checkbox" ? (
          //           <input
          //             type={type}
          //             name={name}
          //             checked={formData.MRHDR[name] || false}
          //             onChange={(e) => handleInputChange(e, "MRHDR")}
          //             className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-gray-500"
          //           />
          //         )  : (
          //           <input
          //             type={type}
          //             name={name}
          //             value={formData.MRHDR[name] || ""}
          //             onChange={(e) => handleInputChange(e, "MRHDR")}
          //             className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
          //             disabled={name === "MRSBR" || name === "ManualMrsno"}
          //             placeholder={placeHolder}
          //             readOnly={name === "MRSBR" || name === "ManualMrsno"}
          //           />
          //         )}
          //       </div>
          //     ))}
          //   </div>
          // </div>

          // <div className="border rounded-lg p-5">
          //   <h5 className="text-lg font-semibold mb-2 flex justify-center">List Of Bills:</h5>
          //   <div className="relative overflow-x-auto shadow-md sm:rounded-lg border">
          //     <table className="min-w-full text-sm text-center rtl:text-right text-gray-500 border border-gray-300">
          //       <thead className="text-gray-700 uppercase bg-gray-200 border-b-2 border-gray-400">
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
          //                 className="p-1 w-full bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
          //               /> */}
          //             </td>
          //             {bill.charges?.map((charge, idx) => (
          //               <td key={idx} className="border border-gray-300 px-1 py-2">
          //                 <input
          //                   type="number"
          //                   name={`CHG${idx + 1}`}
          //                   value={formData.BillMRDET.BillMRDET[index][`CHG${idx + 1}`] || ""}
          //                   onChange={(e) => handleBillInputChange(e, index, `CHG${idx + 1}`)}
          //                   className="p-1 w-full bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
          //                 />
          //               </td>
          //             ))}
          //             <td className="border border-gray-300 px-1 py-2">
          //               <textarea
          //                 name="Remarks"
          //                 value={bill.Remarks || ""}
          //                 onChange={(e) => handleBillInputChange(e, index, "Remarks")}
          //                 className="p-1 w-full bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
          //               />
          //             </td>
          //           </tr>
          //         ))}
          //       </tbody>
          //     </table>
          //   </div>
          // </div>
          // <div className="border rounded-lg p-5">
          //   <h5 className="text-lg font-semibold mb-4 flex justify-center">Collection Details</h5>
          //   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          //     {[
          //       ["paymode", "Receipt Mode", "select", true, dropdownData.CPTYP],
          //       ["NETAMT", "Net Amount", "number", true],
          //       ["MRSCASH", "Cash Amount", "number", true],
          //       // ["MRSTYPE", "MRS Type", "text", true],
          //       // ["EMRS_type", "EMRS Type", "text", true],
          //       ["BankAcccode", "Bank Account Code", "text", true],
          //     ].map(([name, label, type, isRequired, options], index) => (
          //       <div key={index} className="flex items-center">
          //         <label className="text-gray-700 font-medium w-1/3 text-left">{label}</label>
          //         {type === "select" ? (
          //           <select
          //             name={name}
          //             value={formData.MRHDR[name] || ""}
          //             onChange={(e) => handleInputChange(e, "MRHDR")}
          //             className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
          //         <label className="text-gray-700 font-medium w-1/3 text-left">{label}</label>
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
          //     className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
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

  return (
    <div className="p-8 w-full lg:w-[calc(100vw-288px)] ml-0 lg:ml-[288px] text-black min-h-screen">
      <button
        className="lg:hidden text-black p-3 flex justify-start"
        onClick={() => setIsSidebarOpen(true)}
      >
        <FontAwesomeIcon icon={faAlignLeft} />
      </button>
      <div className="bg-white p-8 rounded-lg shadow-lg space-y-6">
        <h4 className="text-2xl font-bold text-center text-gray-800">
          Bill Collection
        </h4>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h6 className="text-xl font-semibold text-gray-700 mb-6">
            You Selected
          </h6>
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4 md:gap-14">
                <div className="flex flex-col space-y-1">
                  <span className="text-sm font-medium text-gray-500">
                    Customer Code and Name
                  </span>
                  <span className="text-base font-semibold text-gray-800">
                    {billDetails[0]?.CustCd || "-"}
                  </span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-sm font-medium text-gray-500">
                    Docket Booking Date Range
                  </span>
                  <span className="text-base font-semibold text-gray-800">
                    {Fromdt} TO {Todt}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="border rounded-lg p-5">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
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
                      className="p-2 w-2/3 lg:w-5/6 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none resize-none"
                      rows="2"
                      placeholder={placeHolder}
                    />
                  ) : type === "checkbox" ? (
                    <input
                      type={type}
                      name={name}
                      checked={formData.MRHDR[name] || false}
                      onChange={(e) => handleInputChange(e, "MRHDR")}
                      className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-gray-500"
                    />
                  )  : (
                    <input
                      type={type}
                      name={name}
                      value={formData.MRHDR[name] || ""}
                      onChange={(e) => handleInputChange(e, "MRHDR")}
                      className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                      placeholder={placeHolder}
                      disabled={name === "MRSBR" || name === "ManualMrsno"}
                      readOnly={name === "MRSBR" || name === "ManualMrsno"}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="border rounded-lg p-5">
            <h5 className="text-lg font-semibold mb-2 flex justify-center">List Of Bills:</h5>
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg border">
              <table className="min-w-full text-sm text-center rtl:text-right text-gray-500 border border-gray-300">
                <thead className="text-gray-700 uppercase bg-gray-200 border-b-2 border-gray-400">
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
                          className="p-1 w-full bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                        /> */}
                      </td>
                      {bill.charges?.map((charge, idx) => (
                        <td key={idx} className="border border-gray-300 px-1 py-2">
                          <input
                            type="number"
                            name={`CHG${idx + 1}`}
                            value={formData.BillMRDET.BillMRDET[index][`CHG${idx + 1}`] || ""}
                            onChange={(e) => handleBillInputChange(e, index, `CHG${idx + 1}`)}
                            className="p-1 w-full bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                          />
                        </td>
                      ))}
                      <td className="border border-gray-300 px-1 py-2">
                        <textarea
                          name="Remarks"
                          value={bill.Remarks || ""}
                          onChange={(e) => handleBillInputChange(e, index, "Remarks")}
                          className="p-1 w-full bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="border rounded-lg p-5">
            <h5 className="text-lg font-semibold mb-4 flex justify-center">Collection Details</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                ["paymode", "Receipt Mode", "select", true, dropdownData.CPTYP],
                ["NETAMT", "Net Amount", "number", true],
                ["MRSCASH", "Cash Amount", "number", true],
                // ["MRSTYPE", "MRS Type", "text", true],
                // ["EMRS_type", "EMRS Type", "text", true],
                ["BankAcccode", "Bank Account Code", "text", true],
              ].map(([name, label, type, isRequired, options], index) => (
                <div key={index} className="flex items-center">
                  <label className="text-gray-700 font-medium w-1/3 text-left">{label}</label>
                  {type === "select" ? (
                    <select
                      name={name}
                      value={formData.MRHDR[name] || ""}
                      onChange={(e) => handleInputChange(e, "MRHDR")}
                      className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                  <label className="text-gray-700 font-medium w-1/3 text-left">{label}</label>
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
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
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