// "use client"

// import React, { useState, useEffect } from 'react';
// import { faAlignLeft, faPrint } from '@fortawesome/free-solid-svg-icons';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { useAuth } from '../context/AuthContext';
// import moment from 'moment';
// import { fetchDropdownData, getMRView } from '@/lib/masterService';
// import { toast } from 'react-toastify';
// import ReactPaginate from 'react-paginate';

// function MRView() {
//     const { setIsSidebarOpen, userDetail } = useAuth();
//     const [dropdownData, setDropdownData] = useState({
//         Customer: [],
//         BillType: []
//     });
//     const [errors, setErrors] = useState({
//         Billno: '',
//         Party_code: '',
//         BillType: '',
//         Fromdt: '',
//         Todt: ''
//     });
//     const [isLoading, setIsLoading] = useState(false);
//     const [MRViewData, setMRViewData] = useState([]);
//     const [showForm, setShowForm] = useState(true);
//     const [currentPage, setCurrentPage] = useState(0);
//     const [showAll, setShowAll] = useState(false);
//     const itemsPerPage = 10;

//     const initialState = {
//         Billno: "",
//         Party_code: "",
//         BillType: "",
//         Fromdt: moment().format('YYYY-MM-DD'),
//         Todt: moment().format('YYYY-MM-DD'),
//         Brcd: userDetail?.LocationCode || "",
//         CompanyCode: userDetail?.CompanyCode || "",
//     };

//     const [formData, setFormData] = useState(initialState);

//     useEffect(() => {
//         if (userDetail?.CompanyCode) {
//             Object.keys(dropdownData).forEach((key) => {
//                 handleDropdownData(userDetail.CompanyCode, key);
//             });
//         }
//     }, [userDetail?.CompanyCode]);

//     const handleDropdownData = async (CompanyCode, MstCode) => {
//         try {
//             if (userDetail.CompanyCode) {
//                 const data = await fetchDropdownData(CompanyCode, MstCode);
//                 setDropdownData((prev) => ({
//                     ...prev,
//                     [MstCode]: data,
//                 }));

//                 setFormData(prev => {
//                     const newData = { ...prev };
//                     // if (MstCode === "Customer" && data.length > 0) {
//                     //     newData.Customer = data[0].CustomerCode;
//                     // }
//                     if (MstCode === "BillType" && data.length > 0) {
//                         newData.BillType = data[0].DocCode;
//                     }
//                     return newData;
//                 });
//             }
//         } catch (error) {
//             console.log(`Error fetching ${MstCode}:`, error);
//         }
//     };

//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({
//             ...prev,
//             [name]: value
//         }));

//         if (errors[name]) {
//             setErrors(prev => ({
//                 ...prev,
//                 [name]: ''
//             }));
//         }
//     };

//     const formatDate = (inputDate) => {
//         if (!inputDate) return "";
//         const date = new Date(inputDate);
//         return date.toLocaleDateString("en-GB", {
//             day: "2-digit",
//             month: "short",
//             year: "numeric",
//         });
//     };

//     const validateForm = () => {
//         const newErrors = {
//             Billno: '',
//             Party_code: '',
//             BillType: '',
//             Fromdt: '',
//             Todt: ''
//         };

//         let isValid = true;

//         setErrors(newErrors);
//         return isValid;
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         if (!validateForm()) return;

//         setIsLoading(true);
//         const payload = {
//             ...formData,
//             Fromdt: formData.Fromdt ? formatDate(formData.Fromdt) : "",
//             Todt: formData.Todt ? formatDate(formData.Todt) : "",
//         };

//         try {
//             const data = await getMRView(payload);

//             if (data?.status) {
//                 if (data.data && data.data.length > 0) {
//                     setMRViewData(data.data);
//                     setShowForm(false);
//                     setCurrentPage(0);
//                     toast.success(data.message || "MR data fetched successfully!");
//                 } else {
//                     const errorMessage = data.message ||
//                         (formData.Billno
//                             ? `No MRs found for MR Number: ${formData.Billno}`
//                             : `No MRs found between ${moment(formData.Fromdt).format('DD MMM YYYY')} and ${moment(formData.Todt).format('DD MMM YYYY')}`);

//                     toast.warning(errorMessage);
//                     setMRViewData([]);
//                     setShowForm(true);
//                 }
//             }
//         } catch (err) {
//             let errorMessage = "An error occurred while fetching MR data";

//             if (err.response) {
//                 if (err.response.status === 400) {
//                     errorMessage = "Invalid request: " + (err.response.data?.message || "Missing required fields");
//                 }
//                 else if (err.response.status === 404) {
//                     errorMessage = formData.Billno
//                         ? `No MRs found for MR Number: ${formData.Billno}`
//                         : `No MRs found between ${moment(formData.Fromdt).format('DD MMM YYYY')} and ${moment(formData.Todt).format('DD MMM YYYY')}`;
//                 }
//                 else {
//                     errorMessage = err.response.data?.message ||
//                         `Server error: ${err.response.status}`;
//                 }
//             } else if (err.request) {
//                 errorMessage = "Network error - Please check your connection";
//             } else {
//                 errorMessage = err.message || "Request setup error";
//             }

//             toast.error(errorMessage);
//             setMRViewData([]);
//             setShowForm(true);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleReset = () => {
//         setFormData(initialState);
//         setErrors({
//             Billno: '',
//             Party_code: '',
//             BillType: '',
//             Fromdt: '',
//             Todt: ''
//         });
//         setMRViewData([]);
//         setShowForm(true);
//     };

//     const handleNewSearch = () => {
//         setShowForm(true);
//         setMRViewData([]);
//     };

//     const handleShowAll = () => {
//         setShowAll(true);
//     };

//     const handleShowPaginated = () => {
//         setShowAll(false);
//         setCurrentPage(0);
//     };

//     // Calculate totals
//     const totalMrAmt = MRViewData.reduce((sum, mr) => sum + (parseFloat(mr.MrAmt) || 0), 0);
//     const totalOtherChrg = MRViewData.reduce((sum, mr) => sum + (parseFloat(mr.OtherChrg) || 0), 0);

//     const pageCount = Math.ceil(MRViewData.length / itemsPerPage);
//     const offset = currentPage * itemsPerPage;
//     const paginatedData = MRViewData.slice(offset, offset + itemsPerPage);
//     const displayData = showAll ? MRViewData : paginatedData;


// const handlePrintClick = (mr) => {
// };

//     const tableHeaders = [
//         'SrNo.',
//         'MR No',
//         'Location',
//         'Party Name',
//         'Oth. Charges',
//         'MR Amt.',
//         'Pay. Mode',
//         'Deduction',
//         'Action'
//     ];

//     const formatRowData = (mr, index) => ({
//         'SrNo.': index + 1,
//         'MR No': mr.Mrsno || "-",
//         'Location': mr.Location ? mr.Location.split(":")[1]?.trim() : "-",
//         'Party Name': mr.ptmsstr || "-",
//         'Oth. Charges': mr.OtherChrg || "0.00",
//         'MR Amt.': mr.MrAmt || "0.00",
//         'Pay. Mode': mr.Paymode || "-",
//         'Deduction': mr.deduction || "-",
//         'Action': (
//             <button onClick={() => handlePrintClick(mr)} className="font-medium text-blue-600 hover:underline">
//                 <FontAwesomeIcon icon={faPrint} />
//             </button>
//         ),
//     });

//     return (
//         <div className="p-8 w-full lg:w-[calc(100vw-288px)] ml-0 lg:ml-[288px] text-black h-[calc(100vh-100px)] overflow-y-auto">
//             <button
//                 className="lg:hidden text-xl text-black p-3 flex justify-start"
//                 onClick={() => setIsSidebarOpen(true)}
//             >
//                 <FontAwesomeIcon icon={faAlignLeft} />
//             </button>

//             <div className="bg-white p-8 rounded-lg shadow-lg overflow-y-hidden">
//                 <h4 className="text-xl font-bold text-center">MR View</h4>

//                 {showForm ? (
//                     <form onSubmit={handleSubmit} className="space-y-6 bg-white my-4 p-6 rounded-lg border-2">
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                             <div className="flex flex-col space-y-1">
//                                 <label className="text-gray-700 font-medium">MR No</label>
//                                 <input
//                                     type="text"
//                                     name="Billno"
//                                     value={formData.Billno}
//                                     onChange={handleInputChange}
//                                     className="p-2 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
//                                     disabled={isLoading}
//                                 />
//                                 {errors.Billno && <span className="text-red-500 text-sm">{errors.Billno}</span>}
//                             </div>
//                         </div>

//                         <h6 className="flex items-center justify-center my-4 text-xl">
//                             <span className="border-t border-gray-300 flex-grow mr-2"></span>
//                             <span className="text-gray-500">OR</span>
//                             <span className="border-t border-gray-300 flex-grow ml-2"></span>
//                         </h6>

//                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                             <div className="flex flex-col space-y-1">
//                                 <label className="text-gray-700 font-medium">Party Code</label>
//                                 <select
//                                     name="Party_code"
//                                     value={formData.Party_code}
//                                     onChange={handleInputChange}
//                                     className="p-2 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
//                                     disabled={isLoading}
//                                 >
//                                      <option value={""} >ALL</option>
//                                     {dropdownData.Customer?.map((option, idx) => (
//                                         <option key={idx} value={option.CustomerCode}>
//                                             {option.CustomerName}
//                                         </option>
//                                     ))}
//                                 </select>
//                                 {errors.Party_code && <span className="text-red-500 text-sm">{errors.Party_code}</span>}
//                             </div>
//                             <div className="flex flex-col space-y-1">
//                                 <label className="text-gray-700 font-medium">Bill Collection Type</label>
//                                 <select
//                                     name="BillType"
//                                     value={formData.BillType}
//                                     onChange={handleInputChange}
//                                     className="p-2 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
//                                     disabled={isLoading}
//                                 >
//                                     {dropdownData.BillType?.map((option, idx) => (
//                                         <option key={idx} value={option.DocCode}>
//                                             {option.CodeDesc}
//                                         </option>
//                                     ))}
//                                 </select>
//                                 {errors.BillType && <span className="text-red-500 text-sm">{errors.BillType}</span>}
//                             </div>

//                             <div className="flex flex-col space-y-1">
//                                 <label className="text-gray-700 font-medium">From Date</label>
//                                 <input
//                                     type="date"
//                                     name="Fromdt"
//                                     value={formData.Fromdt}
//                                     onChange={handleInputChange}
//                                     className="p-2 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
//                                     disabled={isLoading}
//                                     max={formData.Todt}
//                                 />
//                                 {errors.Fromdt && <span className="text-red-500 text-sm">{errors.Fromdt}</span>}
//                             </div>

//                             <div className="flex flex-col space-y-1">
//                                 <label className="text-gray-700 font-medium">To Date</label>
//                                 <input
//                                     type="date"
//                                     name="Todt"
//                                     value={formData.Todt}
//                                     onChange={handleInputChange}
//                                     className="p-2 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
//                                     disabled={isLoading}
//                                     min={formData.Fromdt}
//                                 />
//                                 {errors.Todt && <span className="text-red-500 text-sm">{errors.Todt}</span>}
//                             </div>
//                         </div>

//                         <div className="flex items-center justify-between mt-4">
//                             <button
//                                 type="button"
//                                 onClick={handleReset}
//                                 className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition duration-200"
//                                 disabled={isLoading}
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 type="submit"
//                                 className={`bg-blue-600 rounded-lg text-white duration-200 hover:bg-blue-700 px-6 py-2 transition ${isLoading ? 'opacity-50' : ''}`}
//                                 disabled={isLoading}
//                             >
//                                 {isLoading ?
//                                     <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                                     </svg> :
//                                     "Submit"}
//                             </button>
//                         </div>
//                     </form>

//                 ) : (
//                     <div>
//                         <div className="flex justify-between items-center mb-4">
//                             <h6 className='text-base font-bold'>List Of MRs</h6>
//                             <div className="flex gap-2">
//                                 {/* {showAll ? (
//                                     <button
//                                         onClick={handleShowPaginated}
//                                         className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-200"
//                                     >
//                                         Show Paginated
//                                     </button>
//                                 ) : (
//                                     <button
//                                         onClick={handleShowAll}
//                                         className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200"
//                                     >
//                                         Show All with Totals
//                                     </button>
//                                 )} */}
//                                 <button
//                                     onClick={handleNewSearch}
//                                     className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
//                                 >
//                                     New Search
//                                 </button>
//                             </div>
//                         </div>

//                         {/* Table */}
//                         <div className="relative shadow-md sm:rounded-lg border max-h-[70vh] flex flex-col">
//                             {/* Single Table with sticky header and footer */}
//                             <div className="flex-1 overflow-auto">
//                                 <table className="w-full">
//                                     {/* Sticky Header */}
//                                     <thead className="text-gray-700 uppercase bg-gray-200 border-b-2 sticky -top-0.5 z-10">
//                                         <tr>
//                                             {tableHeaders.map((header, index) => (
//                                                 <th
//                                                     key={index}
//                                                     className="px-6 py-3 border border-gray-300 whitespace-nowrap"
//                                                 >
//                                                     {header}
//                                                 </th>
//                                             ))}
//                                         </tr>
//                                     </thead>

//                                     {/* Scrollable Body */}
//                                     <tbody>
//                                         {isLoading ? (
//                                             <tr>
//                                                 <td colSpan={tableHeaders.length} className="px-6 py-4 text-center">
//                                                     <div className="flex justify-center items-center">
//                                                         <svg
//                                                             className="animate-spin h-8 w-8 text-blue-500"
//                                                             xmlns="http://www.w3.org/2000/svg"
//                                                             fill="none"
//                                                             viewBox="0 0 24 24"
//                                                         >
//                                                             <circle
//                                                                 className="opacity-25"
//                                                                 cx="12"
//                                                                 cy="12"
//                                                                 r="10"
//                                                                 stroke="currentColor"
//                                                                 strokeWidth="4"
//                                                             ></circle>
//                                                             <path
//                                                                 className="opacity-75"
//                                                                 fill="currentColor"
//                                                                 d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                                                             ></path>
//                                                         </svg>
//                                                     </div>
//                                                 </td>
//                                             </tr>
//                                             // ) : displayData.length > 0 ? (
//                                             //     displayData.map((mr, index) => (
//                                         ) : MRViewData.length > 0 ? (
//                                             MRViewData.map((mr, index) => (
//                                                 <tr
//                                                     key={index}
//                                                     className="odd:bg-white even:bg-gray-50 border-b border-gray-200"
//                                                 >
//                                                     {Object.values(formatRowData(mr, showAll ? index : offset + index)).map((value, i) => (
//                                                         <td key={i} className="px-6 py-4 border whitespace-nowrap">
//                                                             {value}
//                                                         </td>
//                                                     ))}
//                                                 </tr>
//                                             ))
//                                         ) : (
//                                             <tr>
//                                                 <td colSpan={tableHeaders.length} className="px-6 py-4 text-center">
//                                                     No Data Available
//                                                 </td>
//                                             </tr>
//                                         )}
//                                     </tbody>

//                                     {/* {showAll && ( */}
//                                     <tfoot>
//                                         {/* <tr className="bg-gray-200 font-semibold sticky bottom-0 z-10">
//                                             <td className="px-6 py-4 border" colSpan={tableHeaders.length - 4}>Total</td>
//                                             <td className="px-6 py-4 border text-right font-bold">Oth. Charges:</td>
//                                             <td className="px-6 py-4 border font-bold">{totalOtherChrg.toFixed(2)}</td>
//                                             <td className="px-6 py-4 border text-right font-bold">MR Amt:</td>
//                                             <td className="px-6 py-4 border font-bold">{totalMrAmt.toFixed(2)}</td>
//                                         </tr> */}

//                                      <tr className="bg-gray-200 font-semibold sticky -bottom-0.5 z-10">
//                                             <td className="px-6 py-4 border text-end" colSpan={4}>Total:</td>
//                                             {/* <td className="px-6 py-4 border text-right font-bold">Pen. Amt:</td> */}
//                                             <td className="px-6 py-4 border-x-2 font-bold">{totalOtherChrg.toFixed(2)}</td>
//                                             <td className="px-6 py-4 border font-bold">{totalMrAmt.toFixed(2)}</td>
//                                             <td className="px-6 py-4 border text-right font-bold" colSpan={3}></td>
//                                         </tr>
//                                     {/* )} */}
//                                     </tfoot> 
//                                 </table>
//                             </div>
//                         </div>

//                         {/* Pagination - only shown when not in "show all" mode */}
//                         {/* {!showAll && pageCount > 1 && (
//                             <ReactPaginate
//                                 previousLabel={"Previous"}
//                                 nextLabel={"Next"}
//                                 breakLabel={"..."}
//                                 pageCount={pageCount}
//                                 marginPagesDisplayed={2}
//                                 pageRangeDisplayed={5}
//                                 onPageChange={({ selected }) => setCurrentPage(selected)}
//                                 containerClassName={"flex justify-center items-center mt-4 space-x-2"}
//                                 pageClassName={"px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-200"}
//                                 pageLinkClassName={"text-gray-700"}
//                                 activeClassName={"bg-blue-500 text-white"}
//                                 activeLinkClassName={"text-white"}
//                                 previousClassName={"px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-200"}
//                                 nextClassName={"px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-200"}
//                                 disabledClassName={"opacity-50 cursor-not-allowed"}
//                                 forcePage={currentPage}
//                             />
//                         )} */}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }

// export default MRView;

// "use client"

// import React, { useState, useEffect } from 'react';
// import {
//     faAlignLeft,
//     faPrint,
//     faDownload,
//     faEye,
//     faSpinner
// } from '@fortawesome/free-solid-svg-icons';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { useAuth } from '../context/AuthContext';
// import moment from 'moment';
// import { fetchDropdownData, getMRView } from '@/lib/masterService';
// import { toast } from 'react-toastify';
// import { PDFDownloadLink } from '@react-pdf/renderer';
// import InvoicePDF from '../components/InvoicePDF';
// import { pdf } from '@react-pdf/renderer';

// function MRView() {
//     const { setIsSidebarOpen, userDetail } = useAuth();
//     const [dropdownData, setDropdownData] = useState({
//         Customer: [],
//         BillType: []
//     });
//     const [errors, setErrors] = useState({
//         Billno: '',
//         Party_code: '',
//         BillType: '',
//         Fromdt: '',
//         Todt: ''
//     });
//     const [isLoading, setIsLoading] = useState(false);
//     const [MRViewData, setMRViewData] = useState([]);
//     const [showForm, setShowForm] = useState(true);
//     const [currentPage, setCurrentPage] = useState(0);
//     const [showAll, setShowAll] = useState(false);
//     const [selectedMR, setSelectedMR] = useState(null);
//     const [isClient, setIsClient] = useState(false);
//     const itemsPerPage = 10;

//     const initialState = {
//         Billno: "",
//         Party_code: "",
//         BillType: "",
//         Fromdt: moment().format('YYYY-MM-DD'),
//         Todt: moment().format('YYYY-MM-DD'),
//         Brcd: userDetail?.LocationCode || "",
//         CompanyCode: String(userDetail.CompanyCode) || "",
//     };

//     const [formData, setFormData] = useState(initialState);

//     useEffect(() => {
//         setIsClient(true);
//         if (userDetail?.CompanyCode) {
//             Object.keys(dropdownData).forEach((key) => {
//                 handleDropdownData(userDetail.CompanyCode, key);
//             });
//         }
//     }, [userDetail?.CompanyCode]);

//     const handleDropdownData = async (CompanyCode, MstCode) => {
//         try {
//             if (userDetail.CompanyCode) {
//                 const data = await fetchDropdownData(CompanyCode, MstCode);
//                 setDropdownData((prev) => ({
//                     ...prev,
//                     [MstCode]: data,
//                 }));

//                 setFormData(prev => {
//                     const newData = { ...prev };
//                     if (MstCode === "BillType" && data.length > 0) {
//                         newData.BillType = data[0].DocCode;
//                     }
//                     return newData;
//                 });
//             }
//         } catch (error) {
//             console.log(`Error fetching ${MstCode}:`, error);
//         }
//     };

//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({
//             ...prev,
//             [name]: value
//         }));

//         if (errors[name]) {
//             setErrors(prev => ({
//                 ...prev,
//                 [name]: ''
//             }));
//         }
//     };

//     const formatDate = (inputDate) => {
//         if (!inputDate) return "";
//         const date = new Date(inputDate);
//         return date.toLocaleDateString("en-GB", {
//             day: "2-digit",
//             month: "short",
//             year: "numeric",
//         });
//     };

//     const validateForm = () => {
//         const newErrors = {
//             Billno: '',
//             Party_code: '',
//             BillType: '',
//             Fromdt: '',
//             Todt: ''
//         };

//         let isValid = true;

//         setErrors(newErrors);
//         return isValid;
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         if (!validateForm()) return;

//         setIsLoading(true);
//         const payload = {
//             ...formData,
//             Fromdt: formData.Fromdt ? formatDate(formData.Fromdt) : "",
//             Todt: formData.Todt ? formatDate(formData.Todt) : "",
//         };

//         try {
//             const data = await getMRView(payload);

//             if (data?.status) {
//                 if (data.data && data.data.length > 0) {
//                     setMRViewData(data.data);
//                     setShowForm(false);
//                     setCurrentPage(0);
//                     toast.success(data.message || "MR data fetched successfully!");
//                 } else {
//                     const errorMessage = data.message ||
//                         (formData.Billno
//                             ? `No MRs found for MR Number: ${formData.Billno}`
//                             : `No MRs found between ${moment(formData.Fromdt).format('DD MMM YYYY')} and ${moment(formData.Todt).format('DD MMM YYYY')}`);

//                     toast.warning(errorMessage);
//                     setMRViewData([]);
//                     setShowForm(true);
//                 }
//             }
//         } catch (err) {
//             let errorMessage = "An error occurred while fetching MR data";
//             toast.error(errorMessage);
//             setMRViewData([]);
//             setShowForm(true);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleReset = () => {
//         setFormData(initialState);
//         setErrors({
//             Billno: '',
//             Party_code: '',
//             BillType: '',
//             Fromdt: '',
//             Todt: ''
//         });
//         setMRViewData([]);
//         setShowForm(true);
//     };

//     const handleNewSearch = () => {
//         setShowForm(true);
//         setMRViewData([]);
//     };

//     // Calculate totals
//     const totalMrAmt = MRViewData.reduce((sum, mr) => sum + (parseFloat(mr.MrAmt) || 0), 0);
//     const totalOtherChrg = MRViewData.reduce((sum, mr) => sum + (parseFloat(mr.OtherChrg) || 0), 0);

//     const pageCount = Math.ceil(MRViewData.length / itemsPerPage);
//     const offset = currentPage * itemsPerPage;
//     const paginatedData = MRViewData.slice(offset, offset + itemsPerPage);
//     const displayData = showAll ? MRViewData : paginatedData;

//     const handlePrintClick = (mr) => {
//         setSelectedMR(mr);
//     };

//     const tableHeaders = [
//         'SrNo.',
//         'MR No',
//         'Location',
//         'Party Name',
//         'Oth. Charges',
//         'MR Amt.',
//         'Pay. Mode',
//         'Deduction',
//         // 'Action'
//     ];

//     const formatRowData = (mr, index) => ({
//         'SrNo.': index + 1,
//         'MR No': mr.Mrsno || "-",
//         'Location': mr.Location ? mr.Location.split(":")[1]?.trim() : "-",
//         'Party Name': mr.ptmsstr || "-",
//         'Oth. Charges': mr.OtherChrg || "0.00",
//         'MR Amt.': mr.MrAmt || "0.00",
//         'Pay. Mode': mr.Paymode || "-",
//         'Deduction': mr.deduction || "-",
//         // 'Action': (
//         //     <button
//         //         onClick={() => handlePrintClick(mr)}
//         //         className="font-medium text-blue-600 hover:underline"
//         //         title="Print Invoice"
//         //     >
//         //         <FontAwesomeIcon icon={faPrint} />
//         //     </button>
//         // ),
//     });

//     return (
//         <div className="h-full">
//             <button
//                 className="lg:hidden text-xl text-black p-3 flex justify-start"
//                 onClick={() => setIsSidebarOpen(true)}
//             >
//                 <FontAwesomeIcon icon={faAlignLeft} />
//             </button>

//             {/* PDF Download Modal */}
//             {/* {isClient && selectedMR && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                     <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
//                         <h3 className="text-xl font-bold mb-4">Download MR Invoice</h3>
//                         <p className="mb-4">Click the button below to download the invoice for MR No: {selectedMR.Mrsno}</p>

//                         <PDFDownloadLink
//                             document={<InvoicePDF />}
//                             fileName={`MR-Invoice-${selectedMR.Mrsno}.pdf`}
//                             className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//                         >
//                             {({ loading }) => (loading ? 'Generating PDF...' : 'Download Invoice')}
//                         </PDFDownloadLink>

//                         <button
//                             onClick={() => setSelectedMR(null)}
//                             className="ml-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
//                         >
//                             Cancel
//                         </button>
//                     </div>
//                 </div>
//             )} */}
//         {isClient && selectedMR && (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//         <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
//             <h3 className="text-xl font-bold mb-4">MR Invoice Options</h3>
//             <p className="mb-4">Choose an option for MR No: {selectedMR.Mrsno}</p>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//                 {/* Print Button */}
//                 <button
//                     onClick={async () => {
//                         try {
//                             // Generate PDF blob
//                             const pdfBlob = await pdf(<InvoicePDF mrData={selectedMR} />).toBlob();
//                             const pdfUrl = URL.createObjectURL(pdfBlob);

//                             // Open in new window and print
//                             const printWindow = window.open(pdfUrl);
//                             printWindow.onload = () => {
//                                 printWindow.print();
//                                 // Revoke the object URL after printing
//                                 URL.revokeObjectURL(pdfUrl);
//                             };
//                         } catch (error) {
//                             console.error('Error generating PDF:', error);
//                             toast.error('Failed to generate PDF for printing');
//                         } finally {
//                             setSelectedMR(null);
//                         }
//                     }}
//                     className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex flex-col items-center"
//                 >
//                     <FontAwesomeIcon icon={faPrint} className="mb-1" />
//                     <span>Print</span>
//                 </button>

//                 {/* Download Button */}
//                 <PDFDownloadLink
//                     document={<InvoicePDF mrData={selectedMR} />}
//                     fileName={`MR-Invoice-${selectedMR.Mrsno}.pdf`}
//                     className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex flex-col items-center"
//                 >
//                     {({ loading }) => (
//                         <>
//                             <FontAwesomeIcon icon={loading ? faSpinner : faDownload} className={`mb-1 ${loading ? 'animate-spin' : ''}`} />
//                             <span>{loading ? 'Preparing...' : 'Download'}</span>
//                         </>
//                     )}
//                 </PDFDownloadLink>

//                 {/* Preview Button */}
//                 <button
//                     onClick={async () => {
//                         try {
//                             // Generate PDF blob
//                             const pdfBlob = await pdf(<InvoicePDF mrData={selectedMR} />).toBlob();
//                             const pdfUrl = URL.createObjectURL(pdfBlob);

//                             // Open in new tab for preview
//                             const previewWindow = window.open(pdfUrl, '_blank');

//                             // Revoke the object URL when the window is closed
//                             previewWindow.onbeforeunload = () => {
//                                 URL.revokeObjectURL(pdfUrl);
//                             };
//                         } catch (error) {
//                             console.error('Error generating PDF:', error);
//                             toast.error('Failed to generate PDF preview');
//                         } finally {
//                             setSelectedMR(null);
//                         }
//                     }}
//                     className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 flex flex-col items-center"
//                 >
//                     <FontAwesomeIcon icon={faEye} className="mb-1" />
//                     <span>Preview</span>
//                 </button>
//             </div>

//             <button
//                 onClick={() => setSelectedMR(null)}
//                 className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
//             >
//                 Cancel
//             </button>
//         </div>
//     </div>
// )}

//             <div className="bg-white p-4 rounded-lg shadow-lg overflow-y-hidden">

//                 {showForm ? (
//                     <>
//                     <h4 className="text-xl font-bold text-center">MR View</h4>
//                     <form onSubmit={handleSubmit} className="space-y-6 bg-white my-4 p-6 rounded-lg border-2">
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                             <div className="flex flex-col space-y-1">
//                                 <label className="text-gray-700 font-medium">MR No</label>
//                                 <input
//                                     type="text"
//                                     name="Billno"
//                                     value={formData.Billno}
//                                     onChange={handleInputChange}
//                                     className="p-2 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
//                                     disabled={isLoading}
//                                 />
//                                 {errors.Billno && <span className="text-red-500 text-sm">{errors.Billno}</span>}
//                             </div>
//                         </div>

//                         <h6 className="flex items-center justify-center my-4 text-xl">
//                             <span className="border-t border-gray-300 flex-grow mr-2"></span>
//                             <span className="text-gray-500">OR</span>
//                             <span className="border-t border-gray-300 flex-grow ml-2"></span>
//                         </h6>

//                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                             <div className="flex flex-col space-y-1">
//                                 <label className="text-gray-700 font-medium">Party Code</label>
//                                 <select
//                                     name="Party_code"
//                                     value={formData.Party_code}
//                                     onChange={handleInputChange}
//                                     className="p-2 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
//                                     disabled={isLoading}
//                                 >
//                                     <option value={""}>ALL</option>
//                                     {dropdownData.Customer?.map((option, idx) => (
//                                         <option key={idx} value={option.CustomerCode}>
//                                             {option.CustomerName}
//                                         </option>
//                                     ))}
//                                 </select>
//                                 {errors.Party_code && <span className="text-red-500 text-sm">{errors.Party_code}</span>}
//                             </div>
//                             <div className="flex flex-col space-y-1">
//                                 <label className="text-gray-700 font-medium">Bill Collection Type</label>
//                                 <select
//                                     name="BillType"
//                                     value={formData.BillType}
//                                     onChange={handleInputChange}
//                                     className="p-2 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
//                                     disabled={isLoading}
//                                 >
//                                     {dropdownData.BillType?.map((option, idx) => (
//                                         <option key={idx} value={option.DocCode}>
//                                             {option.CodeDesc}
//                                         </option>
//                                     ))}
//                                 </select>
//                                 {errors.BillType && <span className="text-red-500 text-sm">{errors.BillType}</span>}
//                             </div>

//                             <div className="flex flex-col space-y-1">
//                                 <label className="text-gray-700 font-medium">From Date</label>
//                                 <input
//                                     type="date"
//                                     name="Fromdt"
//                                     value={formData.Fromdt}
//                                     onChange={handleInputChange}
//                                     className="p-2 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
//                                     disabled={isLoading}
//                                     max={formData.Todt}
//                                 />
//                                 {errors.Fromdt && <span className="text-red-500 text-sm">{errors.Fromdt}</span>}
//                             </div>

//                             <div className="flex flex-col space-y-1">
//                                 <label className="text-gray-700 font-medium">To Date</label>
//                                 <input
//                                     type="date"
//                                     name="Todt"
//                                     value={formData.Todt}
//                                     onChange={handleInputChange}
//                                     className="p-2 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
//                                     disabled={isLoading}
//                                     min={formData.Fromdt}
//                                 />
//                                 {errors.Todt && <span className="text-red-500 text-sm">{errors.Todt}</span>}
//                             </div>
//                         </div>

//                         <div className="flex items-center justify-between mt-4">
//                             <button
//                                 type="button"
//                                 onClick={handleReset}
//                                 className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition duration-200"
//                                 disabled={isLoading}
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 type="submit"
//                                 className={`bg-blue-600 rounded-lg text-white duration-200 hover:bg-blue-700 px-6 py-2 transition ${isLoading ? 'opacity-50' : ''}`}
//                                 disabled={isLoading}
//                             >
//                                 {isLoading ?
//                                     <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                                     </svg> :
//                                     "Submit"}
//                             </button>
//                         </div>
//                     </form>
//                     </>
//                 ) : (
//                     <div>
//                         <div className="flex justify-between items-center mb-4">
//                             <h6 className='text-base font-bold'>List Of MRs</h6>
//                             <button
//                                 onClick={handleNewSearch}
//                                 className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
//                             >
//                                 New Search
//                             </button>
//                         </div>

//                         <div className="relative shadow-md sm:rounded-lg border max-h-[70vh] flex flex-col">
//                             <div className="flex-1 overflow-auto">
//                                 <table className="w-full">
//                                     <thead className="text-gray-700 uppercase bg-gray-200 border-b-2 sticky -top-0.5 z-10">
//                                         <tr>
//                                             {tableHeaders.map((header, index) => (
//                                                 <th
//                                                     key={index}
//                                                     className="px-6 py-3 border border-gray-300 whitespace-nowrap"
//                                                 >
//                                                     {header}
//                                                 </th>
//                                             ))}
//                                         </tr>
//                                     </thead>

//                                     <tbody>
//                                         {isLoading ? (
//                                             <tr>
//                                                 <td colSpan={tableHeaders.length} className="px-6 py-4 text-center">
//                                                     <div className="flex justify-center items-center">
//                                                         <svg
//                                                             className="animate-spin h-8 w-8 text-blue-500"
//                                                             xmlns="http://www.w3.org/2000/svg"
//                                                             fill="none"
//                                                             viewBox="0 0 24 24"
//                                                         >
//                                                             <circle
//                                                                 className="opacity-25"
//                                                                 cx="12"
//                                                                 cy="12"
//                                                                 r="10"
//                                                                 stroke="currentColor"
//                                                                 strokeWidth="4"
//                                                             ></circle>
//                                                             <path
//                                                                 className="opacity-75"
//                                                                 fill="currentColor"
//                                                                 d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                                                             ></path>
//                                                         </svg>
//                                                     </div>
//                                                 </td>
//                                             </tr>
//                                         ) : MRViewData.length > 0 ? (
//                                             MRViewData.map((mr, index) => (
//                                                 <tr
//                                                     key={index}
//                                                     className="odd:bg-white even:bg-gray-50 border-b border-gray-200"
//                                                 >
//                                                     {Object.values(formatRowData(mr, showAll ? index : offset + index)).map((value, i) => (
//                                                         <td key={i} className="px-6 py-4 border whitespace-nowrap">
//                                                             {value}
//                                                         </td>
//                                                     ))}
//                                                 </tr>
//                                             ))
//                                         ) : (
//                                             <tr>
//                                                 <td colSpan={tableHeaders.length} className="px-6 py-4 text-center">
//                                                     No Data Available
//                                                 </td>
//                                             </tr>
//                                         )}
//                                     </tbody>

//                                     <tfoot>
//                                         <tr className="bg-gray-200 font-semibold sticky -bottom-0.5 z-10">
//                                             <td className="px-6 py-4 border text-end" colSpan={4}>Total:</td>
//                                             <td className="px-6 py-4 border-x-2 font-bold">{totalOtherChrg.toFixed(2)}</td>
//                                             <td className="px-6 py-4 border font-bold">{totalMrAmt.toFixed(2)}</td>
//                                             <td className="px-6 py-4 border text-right font-bold" colSpan={3}></td>
//                                         </tr>
//                                     </tfoot>
//                                 </table>
//                             </div>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }

// export default MRView;



"use client"
import React, { useState, useEffect } from 'react';
import {
    faAlignLeft,
    faPrint,
    faDownload,
    faEye,
    faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAuth } from '../context/AuthContext';
import moment from 'moment';
import { fetchDropdownData, getMRView, getmrviewdetail } from '@/lib/masterService';
import { toast } from 'react-toastify';
import { PDFDownloadLink, pdf } from '@react-pdf/renderer';
import InvoicePDF from '../components/InvoicePDF';
import MRviewPDF from '../components/MRviewPDF';

function MRView() {
    const { setIsSidebarOpen, userDetail } = useAuth();
    const [dropdownData, setDropdownData] = useState({
        Customer: [],
        BillType: [],
        InvViewHdr: [],
    });
    const [errors, setErrors] = useState({
        Billno: '',
        Party_code: '',
        BillType: '',
        Fromdt: '',
        Todt: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [MRViewData, setMRViewData] = useState([]);
    const [showForm, setShowForm] = useState(false); // Hide form initially
    const [currentPage, setCurrentPage] = useState(0);
    const [showAll, setShowAll] = useState(false);
    const [selectedMR, setSelectedMR] = useState(null);
    const [isClient, setIsClient] = useState(false);
    const [isLoadingPDF, setIsLoadingPDF] = useState(false);
    const itemsPerPage = 10;

    const initialState = {
        Billno: "",
        Party_code: "",
        BillType: "",
        Fromdt: moment().format('YYYY-MM-DD'),
        Todt: moment().format('YYYY-MM-DD'),
        Brcd: userDetail?.LocationCode || "",
        CompanyCode: String(userDetail.CompanyCode) || "",
    };

    const [formData, setFormData] = useState(initialState);

    useEffect(() => {
        setIsClient(true);
        if (userDetail?.CompanyCode) {
            Object.keys(dropdownData).forEach((key) => {
                handleDropdownData(userDetail.CompanyCode, key);
            });
        }
        handleInitialFetch();
    }, [userDetail?.CompanyCode]);

    const handleInitialFetch = async () => {
        setIsLoading(true);
        const today = moment().format('DD MMM YYYY'); // Today's date (04 Jul 2025)
        const financialYear = userDetail?.FinancialYear
        const endYear = financialYear.split('-')[1]
        const payload = {
            Billno: "",
            Party_code: "",
            BillType: "1",
            Fromdt: `01 Apr ${financialYear.split('-')[0]}`, 
            Todt: `31 Mar ${endYear}`,
            Brcd: userDetail?.LocationCode || "394107",
            CompanyCode: String(userDetail?.CompanyCode) || "1",
        };

        try {
            const data = await getMRView(payload);

            if (data?.status) {
                if (data.data && data.data.length > 0) {
                    setMRViewData(data.data);
                    setShowForm(false);
                    setCurrentPage(0);
                    toast.success(data.message || "MR data fetched successfully!");
                } else {
                    toast.warning(data.message || "No MRs found for the specified criteria");
                    setMRViewData([]);
                    setShowForm(false);
                }
            }
        } catch (err) {
            let errorMessage = "An error occurred while fetching MR data";
            if (err.response) {
                if (err.response.status === 400) {
                    errorMessage = "Invalid request: " + (err.response.data?.message || "Missing required fields");
                } else if (err.response.status === 404) {
                    errorMessage = "No MRs found for the specified criteria";
                } else {
                    errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
                }
            } else if (err.request) {
                errorMessage = "Network error - Please check your connection";
            } else {
                errorMessage = err.message || "Request setup error";
            }
            toast.error(errorMessage);
            setMRViewData([]);
            setShowForm(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDropdownData = async (CompanyCode, MstCode) => {
        try {
            if (userDetail.CompanyCode) {
                const data = await fetchDropdownData(CompanyCode, MstCode);
                setDropdownData((prev) => ({
                    ...prev,
                    [MstCode]: data,
                }));

                setFormData(prev => {
                    const newData = { ...prev };
                    if (MstCode === "BillType" && data.length > 0) {
                        newData.BillType = data[0].DocCode;
                    }
                    return newData;
                });
            }
        } catch (error) {
            console.log(`Error fetching ${MstCode}:`, error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
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

    const validateForm = () => {
        const newErrors = {
            Billno: '',
            Party_code: '',
            BillType: '',
            Fromdt: '',
            Todt: ''
        };
        let isValid = true;
        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsLoading(true);
        const payload = {
            ...formData,
            Fromdt: formData.Fromdt ? formatDate(formData.Fromdt) : "",
            Todt: formData.Todt ? formatDate(formData.Todt) : "",
        };

        try {
            const data = await getMRView(payload);
            if (data?.status) {
                if (data.data && data.data.length > 0) {
                    setMRViewData(data.data);
                    setShowForm(false);
                    setCurrentPage(0);
                    toast.success(data.message || "MR data fetched successfully!");
                } else {
                    const errorMessage = data.message ||
                        (formData.Billno
                            ? `No MRs found for MR Number: ${formData.Billno}`
                            : `No MRs found between ${moment(formData.Fromdt).format('DD MMM YYYY')} and ${moment(formData.Todt).format('DD MMM YYYY')}`);
                    toast.warning(errorMessage);
                    setMRViewData([]);
                    setShowForm(true);
                }
            }
        } catch (err) {
            let errorMessage = "An error occurred while fetching MR data";
            if (err.response) {
                if (err.response.status === 400) {
                    errorMessage = "Invalid request: " + (err.response.data?.message || "Missing required fields");
                } else if (err.response.status === 404) {
                    errorMessage = formData.Billno
                        ? `No MRs found for MR Number: ${formData.Billno}`
                        : `No MRs found between ${moment(formData.Fromdt).format('DD MMM YYYY')} and ${moment(formData.Todt).format('DD MMM YYYY')}`;
                } else {
                    errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
                }
            } else if (err.request) {
                errorMessage = "Network error - Please check your connection";
            } else {
                errorMessage = err.message || "Request setup error";
            }
            toast.error(errorMessage);
            setMRViewData([]);
            setShowForm(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setFormData(initialState);
        setErrors({
            Billno: '',
            Party_code: '',
            BillType: '',
            Fromdt: '',
            Todt: ''
        });
        setMRViewData([]);
        setShowForm(true);
    };

    const handleNewSearch = () => {
        setShowForm(true);
        setMRViewData([]);
    };

    const totalMrAmt = MRViewData.reduce((sum, mr) => sum + (parseFloat(mr.MrAmt) || 0), 0);
    const totalOtherChrg = MRViewData.reduce((sum, mr) => sum + (parseFloat(mr.OtherChrg) || 0), 0);

    const pageCount = Math.ceil(MRViewData.length / itemsPerPage);
    const offset = currentPage * itemsPerPage;
    const paginatedData = MRViewData.slice(offset, offset + itemsPerPage);
    const displayData = showAll ? MRViewData : paginatedData;

    const handlePrintClick = async (mr) => {
        const billNo = mr.Mrsno;
        if (!billNo) {
            toast.error("No MR number provided");
            return;
        }
        try {
            setIsLoadingPDF(true);
            const invoiceResponse = await getmrviewdetail(billNo);
            if (invoiceResponse.status && invoiceResponse.data) {
                setSelectedMR({
                    ...mr,
                    details: invoiceResponse.data
                });
                toast.success("MR data loaded successfully!");
            } else {
                toast.warning(invoiceResponse?.message || `No details found for MR Number: ${billNo}`);
                setSelectedMR(null);
            }
        } catch (error) {
            let errorMessage = "An error occurred while fetching MR data";
            console.error(`Error fetching MR details for ${billNo}:`, error);
            toast.error(errorMessage);
            setSelectedMR(null);
        } finally {
            setIsLoadingPDF(false);
        }
    };

    const tableHeaders = [
        'SrNo.',
        'MR No',
        'Location',
        'Party Name',
        'Oth. Charges',
        'MR Amt.',
        'Pay. Mode',
        'Deduction',
        'Action'
    ];

    const formatRowData = (mr, index) => ({
        'SrNo.': index + 1,
        'MR No': mr.Mrsno || "-",
        'Location': mr.Location ? mr.Location.split(":")[1]?.trim() : "-",
        'Party Name': mr.ptmsstr || "-",
        'Oth. Charges': mr.OtherChrg || "0.00",
        'MR Amt.': mr.MrAmt || "0.00",
        'Pay. Mode': mr.Paymode || "-",
        'Deduction': mr.deduction || "-",
        'Action': (
            <button
                onClick={() => handlePrintClick(mr)}
                className="font-medium text-blue-600 hover:underline"
                title="Print MR"
            > 
                <FontAwesomeIcon icon={faPrint} />
            </button>
        ),
    });

    return (
        <div className="h-full">
            <button
                className="lg:hidden text-xl text-black p-3 flex justify-start"
                onClick={() => setIsSidebarOpen(true)}
            >
                <FontAwesomeIcon icon={faAlignLeft} />
            </button>
            {isClient && (selectedMR || isLoadingPDF) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        {isLoadingPDF ? (
                            <div className="flex flex-col items-center justify-center py-8">
                                <div className="relative">
                                    <FontAwesomeIcon
                                        icon={faSpinner}
                                        className="text-blue-500 text-4xl animate-spin"
                                    />
                                </div>
                                <p className="mt-4 text-gray-600 text-center">
                                    Preparing MR data<br />
                                    <span className="text-sm text-gray-400">This may take a few moments...</span>
                                </p>
                            </div>
                        ) : selectedMR ? (
                            <>
                                <h3 className="text-xl font-bold mb-4">MR Invoice Options</h3>
                                <p className="mb-4">Choose an option for MR No: <span className='font-bold'>{selectedMR.Mrsno}</span></p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <button
                                        onClick={async () => {
                                            try {
                                                setIsLoadingPDF(true);
                                                const pdfBlob = await pdf(<MRviewPDF data={selectedMR} companyDetails={dropdownData.InvViewHdr[0] || {}} />).toBlob();
                                                const pdfUrl = URL.createObjectURL(pdfBlob);
                                                const printWindow = window.open(pdfUrl);
                                                printWindow.onload = () => {
                                                    printWindow.print();
                                                    URL.revokeObjectURL(pdfUrl);
                                                    setIsLoadingPDF(false);
                                                };
                                            } catch (error) {
                                                console.error('Error generating PDF:', error);
                                                toast.error('Failed to generate PDF for printing');
                                            } finally {
                                                setIsLoadingPDF(false);
                                            }
                                        }}
                                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex flex-col items-center"
                                    >
                                        <FontAwesomeIcon icon={faPrint} className="mb-1" />
                                        <span>Print</span>
                                    </button>
                                    <PDFDownloadLink
                                        document={<MRviewPDF data={selectedMR} companyDetails={dropdownData.InvViewHdr[0] || {}} />}
                                        fileName={`MR-Invoice-${selectedMR.Mrsno}.pdf`}
                                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex flex-col items-center"
                                    >
                                        {({ loading }) => (
                                            <>
                                                <FontAwesomeIcon
                                                    icon={loading ? faSpinner : faDownload}
                                                    className={`mb-1 ${loading ? 'animate-spin' : ''}`}
                                                />
                                                <span>{loading ? 'Preparing...' : 'Download'}</span>
                                            </>
                                        )}
                                    </PDFDownloadLink>
                                    <button
                                        onClick={async () => {
                                            try {
                                                setIsLoadingPDF(true);
                                                const pdfBlob = await pdf(<MRviewPDF data={selectedMR} companyDetails={dropdownData.InvViewHdr[0] || {}} />).toBlob();
                                                const pdfUrl = URL.createObjectURL(pdfBlob);
                                                const previewWindow = window.open(pdfUrl, '_blank');
                                                previewWindow.onbeforeunload = () => {
                                                    URL.revokeObjectURL(pdfUrl);
                                                    setIsLoadingPDF(false);
                                                };
                                            } catch (error) {
                                                console.error('Error generating PDF:', error);
                                                toast.error('Failed to generate PDF preview');
                                            } finally {
                                                setIsLoadingPDF(false);
                                            }
                                        }}
                                        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 flex flex-col items-center"
                                    >
                                        <FontAwesomeIcon icon={faEye} className="mb-1" />
                                        <span>Preview</span>
                                    </button>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedMR(null);
                                        setIsLoadingPDF(false);
                                    }}
                                    className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                            </>
                        ) : null}
                    </div>
                </div>
            )}
            <div className="bg-white p-4 rounded-lg shadow-lg overflow-y-hidden">
                {showForm ? (
                    <>
                        <h4 className="text-xl font-bold text-center">MR View</h4>
                        <form onSubmit={handleSubmit} className="space-y-6 bg-white my-4 p-6 rounded-lg border-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col space-y-1">
                                    <label className="text-gray-700 font-medium">MR No</label>
                                    <input
                                        type="text"
                                        name="Billno"
                                        value={formData.Billno}
                                        onChange={handleInputChange}
                                        className="p-2 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                                        disabled={isLoading}
                                    />
                                    {errors.Billno && <span className="text-red-500 text-sm">{errors.Billno}</span>}
                                </div>
                            </div>
                            <h6 className="flex items-center justify-center my-4 text-xl">
                                <span className="border-t border-gray-300 flex-grow mr-2"></span>
                                <span className="text-gray-500">OR</span>
                                <span className="border-t border-gray-300 flex-grow ml-2"></span>
                            </h6>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="flex flex-col space-y-1">
                                    <label className="text-gray-700 font-medium">Party Code</label>
                                    <select
                                        name="Party_code"
                                        value={formData.Party_code}
                                        onChange={handleInputChange}
                                        className="p-2 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                                        disabled={isLoading}
                                    >
                                        <option value={""}>ALL</option>
                                        {dropdownData.Customer?.map((option, idx) => (
                                            <option key={idx} value={option.CustomerCode}>
                                                {option.CustomerName}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.Party_code && <span className="text-red-500 text-sm">{errors.Party_code}</span>}
                                </div>
                                <div className="flex flex-col space-y-1">
                                    <label className="text-gray-700 font-medium">Bill Collection Type</label>
                                    <select
                                        name="BillType"
                                        value={formData.BillType}
                                        onChange={handleInputChange}
                                        className="p-2 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                                        disabled={isLoading}
                                    >
                                        {dropdownData.BillType?.map((option, idx) => (
                                            <option key={idx} value={option.DocCode}>
                                                {option.CodeDesc}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.BillType && <span className="text-red-500 text-sm">{errors.BillType}</span>}
                                </div>
                                <div className="flex flex-col space-y-1">
                                    <label className="text-gray-700 font-medium">From Date</label>
                                    <input
                                        type="date"
                                        name="Fromdt"
                                        value={formData.Fromdt}
                                        onChange={handleInputChange}
                                        className="p-2 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                                        disabled={isLoading}
                                        max={formData.Todt}
                                    />
                                    {errors.Fromdt && <span className="text-red-500 text-sm">{errors.Fromdt}</span>}
                                </div>
                                <div className="flex flex-col space-y-1">
                                    <label className="text-gray-700 font-medium">To Date</label>
                                    <input
                                        type="date"
                                        name="Todt"
                                        value={formData.Todt}
                                        onChange={handleInputChange}
                                        className="p-2 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                                        disabled={isLoading}
                                        min={formData.Fromdt}
                                    />
                                    {errors.Todt && <span className="text-red-500 text-sm">{errors.Todt}</span>}
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-4">
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition duration-200"
                                    disabled={isLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`bg-blue-600 rounded-lg text-white duration-200 hover:bg-blue-700 px-6 py-2 transition ${isLoading ? 'opacity-50' : ''}`}
                                    disabled={isLoading}
                                >
                                    {isLoading ?
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg> :
                                        "Submit"}
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h6 className='text-base font-bold'>List Of MRs</h6>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleNewSearch}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                                >
                                    New Search
                                </button>
                            </div>
                        </div>
                        <div className="relative shadow-md sm:rounded-lg border max-h-[70vh] flex flex-col">
                            <div className="flex-1 overflow-auto">
                                <table className="w-full">
                                    <thead className="text-gray-700 uppercase bg-gray-200 border-b-2 sticky -top-0.5 z-10">
                                        <tr>
                                            {tableHeaders.map((header, index) => (
                                                <th
                                                    key={index}
                                                    className="px-6 py-3 border border-gray-300 whitespace-nowrap"
                                                >
                                                    {header}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan={tableHeaders.length} className="px-6 py-4 text-center">
                                                    <div className="flex justify-center items-center">
                                                        <svg
                                                            className="animate-spin h-8 w-8 text-blue-500"
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
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : MRViewData.length > 0 ? (
                                            MRViewData.map((mr, index) => (
                                                <tr
                                                    key={index}
                                                    className="odd:bg-white even:bg-gray-50 border-b border-gray-200"
                                                >
                                                    {Object.values(formatRowData(mr, showAll ? index : offset + index)).map((value, i) => (
                                                        <td key={i} className="px-6 py-4 border whitespace-nowrap">
                                                            {value}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={tableHeaders.length} className="px-6 py-4 text-center">
                                                    No Data Available
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-gray-200 font-semibold sticky -bottom-0.5 z-10">
                                            <td className="px-6 py-4 border text-end" colSpan={4}>Total:</td>
                                            <td className="px-6 py-4 border-x-2 font-bold">{totalOtherChrg.toFixed(2)}</td>
                                            <td className="px-6 py-4 border font-bold">{totalMrAmt.toFixed(2)}</td>
                                            <td className="px-6 py-4 border text-right font-bold" colSpan={3}></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MRView;