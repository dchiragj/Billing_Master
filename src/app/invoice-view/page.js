"use client"

import React, { useState, useEffect } from 'react';
import {
    faAlignLeft,
    faPrint,
    faDownload,
    faEye,
    faSpinner,
    faTrashCan,
    faEdit
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation'; // Import useRouter for navigation
import moment from 'moment';
import { deleteInvoice, fetchDropdownData, getInvoiceBillData, getInvoiceView } from '@/lib/masterService';
import { toast } from 'react-toastify';
import { pdf, PDFDownloadLink } from '@react-pdf/renderer';
import InvoicePDF from '../components/InvoicePDF';
import Swal from 'sweetalert2';

function InvoiceView() {
    const { setIsSidebarOpen, userDetail } = useAuth();
    const router = useRouter(); // Initialize router
    const [dropdownData, setDropdownData] = useState({
        Customer: [],
        BillType: [],
        INVTC: [],
        BANKD: [],
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
    const [invoiceViewData, setInvoiceViewData] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [showAll, setShowAll] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
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
        CompanyCode: String(userDetail?.CompanyCode) || ""
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
        const today = moment().format('DD MMM YYYY'); // 04 Jul 2025
        const financialYear = userDetail?.FinancialYear || "2025-2026";
        const endYear = financialYear.split('-')[1] || "2026";
        const payload = {
            Billno: "",
            Party_code: "",
            BillType: "1",
            Fromdt: `01 Apr ${financialYear.split('-')[0]}`,
            Todt: `31 Mar ${endYear}`,
            Brcd: userDetail?.LocationCode || "",
            CompanyCode: String(userDetail?.CompanyCode) || ""
        };

        try {
            const data = await getInvoiceView(payload);
            if (data?.status) {
                if (data.data && data.data.length > 0) {
                    setInvoiceViewData(data.data);
                    setShowForm(false);
                    setCurrentPage(0);
                    toast.success(data.message || "Invoice data fetched successfully!");
                } else {
                    toast.warning(data.message || "No bills found for the specified criteria");
                    setInvoiceViewData([]);
                    setShowForm(false);
                }
            }
        } catch (err) {
            let errorMessage = "An error occurred while fetching invoice data";
            if (err.response) {
                if (err.response.status === 404) {
                    errorMessage = "Invoice view endpoint not found. Please check the server configuration.";
                } else if (err.response.status === 400) {
                    errorMessage = "Invalid request: " + (err.response.data?.message || "Missing required fields");
                } else {
                    errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
                }
            } else if (err.request) {
                errorMessage = "Network error - Please check your connection";
            } else {
                errorMessage = err.message || "Request setup error";
            }
            console.error('Error fetching invoice view:', err);
            toast.error(errorMessage);
            setInvoiceViewData([]);
            setShowForm(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDropdownData = async (CompanyCode, MstCode) => {
        try {
            if (userDetail?.CompanyCode) {
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
            const data = await getInvoiceView(payload);
            if (data?.status) {
                if (data.data && data.data.length > 0) {
                    setInvoiceViewData(data.data);
                    setShowForm(false);
                    setCurrentPage(0);
                    toast.success(data.message || "Invoice data fetched successfully!");
                } else {
                    const errorMessage = data.message ||
                        (formData.Billno
                            ? `No bills found for Bill Number: ${formData.Billno}`
                            : `No bills found between ${moment(formData.Fromdt).format('DD MMM YYYY')} and ${moment(formData.Todt).format('DD MMM YYYY')}`);
                    toast.warning(errorMessage);
                    setInvoiceViewData([]);
                    setShowForm(true);
                }
            }
        } catch (err) {
            let errorMessage = "An error occurred while fetching invoice data";
            if (err.response) {
                if (err.response.status === 404) {
                    errorMessage = formData.Billno
                        ? `No bills found for Bill Number: ${formData.Billno}`
                        : `No bills found between ${moment(formData.Fromdt).format('DD MMM YYYY')} and ${moment(formData.Todt).format('DD MMM YYYY')}`;
                } else if (err.response.status === 400) {
                    errorMessage = "Invalid request: " + (err.response.data?.message || "Missing required fields");
                } else {
                    errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
                }
            } else if (err.request) {
                errorMessage = "Network error - Please check your connection";
            } else {
                errorMessage = err.message || "Request setup error";
            }
            console.error('Error submitting invoice view:', err);
            toast.error(errorMessage);
            setInvoiceViewData([]);
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
        setInvoiceViewData([]);
        setShowForm(true);
    };

    const handleNewSearch = () => {
        setShowForm(true);
        setInvoiceViewData([]);
    };

    const handleShowAll = () => {
        setShowAll(true);
    };

    const handleShowPaginated = () => {
        setShowAll(false);
        setCurrentPage(0);
    };

    const handleRemoveInvoice = async (billNo) => {
        if (!billNo) {
            toast.error("No bill number provided for deletion");
            return;
        }
        try {
            const entryBy = userDetail?.UserId || "default_user";
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: `You won't be able to revert this! Delete invoice ${billNo}?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
            });

            if (!result.isConfirmed) return;

            Swal.fire({
                title: 'Deleting...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const response = await deleteInvoice(billNo, entryBy);
            if (response.status) {
                await Swal.fire({
                    title: 'Deleted!',
                    text: response.message || `Invoice ${billNo} deleted successfully`,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
                handleInitialFetch(); // Refresh the invoice list
            } else {
                Swal.fire({
                    title: 'Error!',
                    text: response.message || `Failed to delete Invoice ${billNo}`,
                    icon: 'error',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        } catch (error) {
            let errorMessage = "Failed to delete invoice due to a server error";
            if (error.response) {
                if (error.response.status === 404) {
                    errorMessage = `Invoice ${billNo} not found. It may have already been deleted or does not exist.`;
                    await handleInitialFetch(); // Refresh in case invoice was deleted
                } else if (error.response.status === 400) {
                    errorMessage = `Invalid request: ${error.response.data?.message || "Check bill number and user details"}`;
                } else {
                    errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
                }
            } else if (error.request) {
                errorMessage = "Network error - Please check your connection";
            }
            console.error(`Error deleting invoice ${billNo}:`, error);
            Swal.fire({
                title: 'Error!',
                text: errorMessage,
                icon: 'error',
                timer: 2000,
                showConfirmButton: false
            });
        }
    };

    const totalPenAmt = invoiceViewData.reduce((sum, invoice) => sum + (parseFloat(invoice.pendamt) || 0), 0);
    const totalBillAmt = invoiceViewData.reduce((sum, invoice) => sum + (parseFloat(invoice.BILLAMT) || 0), 0);

    const pageCount = Math.ceil(invoiceViewData.length / itemsPerPage);
    const offset = currentPage * itemsPerPage;
    const paginatedData = invoiceViewData.slice(offset, offset + itemsPerPage);
    const displayData = showAll ? invoiceViewData : paginatedData;

    const handlePrintClick = async (billNo) => {       
        if (!billNo) {
            toast.error("No bill number provided");
            return;
        }
        try {
            setIsLoadingPDF(true);
            const invoiceResponse = await getInvoiceBillData(billNo);
            if (invoiceResponse.status) {
                const [bankData, companyData, termsData] = await Promise.all([
                    fetchDropdownData(userDetail?.CompanyCode, 'BANKD'),
                    fetchDropdownData(userDetail?.CompanyCode, 'InvViewHdr'),
                    fetchDropdownData(userDetail?.CompanyCode, 'INVTC')
                ]);
                const processedData = {
                    bankDetails: bankData.map(item => item.CodeDesc).join('\n'),
                    companyInfo: companyData[0],
                    termsConditions: termsData.map(item => item.CodeDesc)
                };
                setSelectedInvoice({
                    ...invoiceResponse.data,
                    dropdownData: processedData
                });
                toast.success("Invoice data loaded successfully!");
            } else {
                toast.error(invoiceResponse?.message || "Failed to load invoice data");
                setSelectedInvoice(null);
            }
        } catch (error) {
            let errorMessage = "An error occurred while fetching invoice data";
            if (error.response) {
                if (error.response.status === 404) {
                    errorMessage = `Invoice ${billNo} not found. Please check the bill number.`;
                } else if (error.response.status === 400) {
                    errorMessage = `Invalid request: ${error.response.data?.message || "Check bill number"}`;
                } else {
                    errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
                }
            } else if (error.request) {
                errorMessage = "Network error - Please check your connection";
            }
            console.error(`Error fetching invoice details for ${billNo}:`, error);
            toast.error(errorMessage);
            setSelectedInvoice(null);
        } finally {
            setIsLoadingPDF(false);
        }
    };

    // New function to handle Edit button click
    const handleEditClick = (billNo) => {
        if (!billNo) {
            toast.error("No bill number provided for editing");
            return;
        }
        // Redirect to InvoiceMaster with billNo as query parameter
        router.push(`/invoice-generation?billNo=${billNo}`);
    };

    const tableHeaders = [
        'SNo.',
        'GEN. Date',
        'Bill No',
        'Location',
        'Party Name',
        'Status',
        'Pen. Amt.',
        'Bill Amt.',
        'Bill Can.',
        'Coll. Type',
        'Action'
    ];

    const formatRowData = (invoice, index) => {
        const pendAmt = parseFloat(invoice.pendamt) || 0;
        const billAmt = parseFloat(invoice.BILLAMT) || 0;
        const isDeleteEnabled = pendAmt === billAmt; // Enable delete only if pendamt equals BILLAMT

        return {
            'SrNo.': index + 1,
            'GEN. Date': invoice.bgndt || "-",
            'Bill No': invoice.billno || "-",
            'Location': invoice.Location ? invoice.Location.split(":")[1]?.trim() : "-",
            'Party Name': invoice.ptmsstr || "-",
            'Bill Status': invoice.Billstatus || "-",
            'Pen. Amt.': pendAmt.toFixed(2),
            'Bill Amt.': billAmt.toFixed(2),
            'Bill Cancel': invoice.bill_cancel ? 'Yes' : "No",
            'Collection Type': invoice.CollectionType || "-",
            'Action': (
                <div className="flex gap-1">
                    <button
                        onClick={() => handlePrintClick(invoice.billno)}
                        className="rounded-md text-blue-600 hover:bg-gray-300 px-2 py-1 transition"
                        title="Print Invoice"
                    >
                        <FontAwesomeIcon icon={faPrint} />
                    </button>
                    <button
                        onClick={() => handleEditClick(invoice.billno)}
                        className="rounded-md text-green-600 hover:bg-gray-300 px-2 py-1 transition"
                        title="Edit Invoice"
                    >
                        <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                        onClick={() => handleRemoveInvoice(invoice.billno)}
                        className={`rounded-md px-2 py-1 transition ${
                            isDeleteEnabled
                                ? 'text-red-600 hover:bg-gray-500'
                                : 'text-gray-400 cursor-not-allowed'
                        }`}
                        title={isDeleteEnabled ? "Delete Invoice" : "Cannot delete: Pending amount does not equal bill amount"}
                        disabled={!isDeleteEnabled}
                    >
                        <FontAwesomeIcon icon={faTrashCan} />
                    </button>
                </div>
            ),
        };
    };

    return (
        <div className="h-full">
            <button
                className="lg:hidden text-xl text-black p-3 flex justify-start"
                onClick={() => setIsSidebarOpen(true)}
            >
                <FontAwesomeIcon icon={faAlignLeft} />
            </button>
            {isClient && (selectedInvoice || isLoadingPDF) && (
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
                                    Preparing invoice data<br />
                                    <span className="text-sm text-gray-400">This may take a few moments...</span>
                                </p>
                            </div>
                        ) : selectedInvoice ? (
                            <>
                                <h3 className="text-xl font-bold mb-4">Invoice Options</h3>
                                <p className="mb-4">Choose an option for No: <span className='font-bold'>{selectedInvoice.master?.BillNO || selectedInvoice.billno}</span></p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <button
                                        onClick={async () => {
                                            try {
                                                setIsLoadingPDF(true);
                                                const pdfBlob = await pdf(<InvoicePDF data={selectedInvoice} />).toBlob();
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
                                        document={<InvoicePDF data={selectedInvoice} />}
                                        fileName={`Invoice-${selectedInvoice.master?.BillNO || selectedInvoice.billno}.pdf`}
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
                                                const pdfBlob = await pdf(<InvoicePDF data={selectedInvoice} />).toBlob();
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
                                        setSelectedInvoice(null);
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
                        <h4 className="text-xl font-bold text-center">Invoice View</h4>
                        <form onSubmit={handleSubmit} className="space-y-6 bg-white my-4 p-6 rounded-lg border-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col space-y-1">
                                    <label className="text-gray-700 font-medium">Bill No</label>
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
                                        <option value="">ALL</option>
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
                            <h6 className='text-base font-bold'>List Of Invoices</h6>
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
                                        ) : invoiceViewData.length > 0 ? (
                                            invoiceViewData.map((invoice, index) => (
                                                <tr
                                                    key={index}
                                                    className="odd:bg-white even:bg-gray-50 border-b border-gray-200"
                                                >
                                                    {Object.values(formatRowData(invoice, showAll ? index : offset + index)).map((value, i) => (
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
                                            <td className="px-6 py-4 border text-end" colSpan={6}>Total:</td>
                                            <td className="px-6 py-4 border-x-2 font-bold">{totalPenAmt.toFixed(2)}</td>
                                            <td className="px-6 py-4 border font-bold">{totalBillAmt.toFixed(2)}</td>
                                            <td className="px-6 py-4 border text-right font-bold" colSpan={4}></td>
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

export default InvoiceView;