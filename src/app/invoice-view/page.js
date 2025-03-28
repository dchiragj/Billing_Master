"use client"

import React, { useState, useEffect } from 'react';
import { faAlignLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAuth } from '../context/AuthContext';
import moment from 'moment';
import { fetchDropdownData, getInvoiceView } from '@/lib/masterService';
import { toast } from 'react-toastify';
import ReactPaginate from 'react-paginate';

function InvoiceView() {
    const { setIsSidebarOpen, userDetail } = useAuth();
    const [dropdownData, setDropdownData] = useState({
        Customer: [],
        BillType: []
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
    const [showForm, setShowForm] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [showAll, setShowAll] = useState(false);
    const itemsPerPage = 10;

    const initialState = {
        Billno: "",
        Party_code: "",
        BillType: "",
        Fromdt: moment().format('YYYY-MM-DD'),
        Todt: moment().format('YYYY-MM-DD'),
        Brcd: userDetail?.LocationCode || "",
        CompanyCode: userDetail?.CompanyCode || "",
    };

    const [formData, setFormData] = useState(initialState);

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
                if (err.response.status === 400) {
                    errorMessage = "Invalid request: " + (err.response.data?.message || "Missing required fields");
                }
                else if (err.response.status === 404) {
                    errorMessage = formData.Billno
                        ? `No bills found for Bill Number: ${formData.Billno}`
                        : `No bills found between ${moment(formData.Fromdt).format('DD MMM YYYY')} and ${moment(formData.Todt).format('DD MMM YYYY')}`;
                }
                else {
                    errorMessage = err.response.data?.message ||
                        `Server error: ${err.response.status}`;
                }
            } else if (err.request) {
                errorMessage = "Network error - Please check your connection";
            } else {
                errorMessage = err.message || "Request setup error";
            }

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

    // Calculate totals
    const totalPenAmt = invoiceViewData.reduce((sum, invoice) => sum + (parseFloat(invoice.pendamt) || 0), 0);
    const totalBillAmt = invoiceViewData.reduce((sum, invoice) => sum + (parseFloat(invoice.BILLAMT) || 0), 0);

    const pageCount = Math.ceil(invoiceViewData.length / itemsPerPage);
    const offset = currentPage * itemsPerPage;
    const paginatedData = invoiceViewData.slice(offset, offset + itemsPerPage);
    const displayData = showAll ? invoiceViewData : paginatedData;

    const tableHeaders = [
        'SrNo.',
        'Bill No',
        'Location',
        'Party Name',
        'Bill Status',
        'Pen. Amt.',
        'Bill Amt.',
        'Bill Cancel',
        'Collection Type',
        'GEN. Date'
    ];

    const formatRowData = (invoice, index) => ({
        'SrNo.': index + 1,
        'Bill No': invoice.billno || "-",
        'Location': invoice.Location ? invoice.Location.split(":")[1]?.trim() : "-",
        'Party Name': invoice.ptmsstr || "-",
        'Bill Status': invoice.Billstatus || "-",
        'Pen. Amt.': invoice.pendamt || "0.00",
        'Bill Amt.': invoice.BILLAMT || "0.00",
        'Bill Cancel': invoice.bill_cancel ? 'Yes' : "No",
        'Collection Type': invoice.CollectionType || "-",
        'GEN. Date': invoice.bgndt || "-",
    });

    return (
        <div className="p-8 w-full lg:w-[calc(100vw-288px)] ml-0 lg:ml-[288px] text-black min-h-screen">
            <button
                className="lg:hidden text-xl text-black p-3 flex justify-start"
                onClick={() => setIsSidebarOpen(true)}
            >
                <FontAwesomeIcon icon={faAlignLeft} />
            </button>

            <div className="bg-white p-8 rounded-lg shadow-lg overflow-y-hidden">
                <h4 className="text-xl font-bold text-center">Invoice View</h4>

                {showForm ? (
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
                                    <option value={""} >ALL</option>
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

                ) : (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h6 className='text-base font-bold'>List Of Invoices</h6>
                            <div className="flex gap-2">
                                {/* {showAll ? (
                                    <button
                                        onClick={handleShowPaginated}
                                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-200"
                                    >
                                        Show Paginated
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleShowAll}
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200"
                                    >
                                        Show All with Totals
                                    </button>
                                )} */}
                                <button
                                    onClick={handleNewSearch}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                                >
                                    New Search
                                </button>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="relative shadow-md sm:rounded-lg border max-h-[70vh] flex flex-col">
                            {/* Single Table with sticky header and footer */}
                            <div className="flex-1 overflow-auto">
                                <table className="w-full">
                                    {/* Sticky Header */}
                                    <thead className="text-gray-700 uppercase bg-gray-200 border-b-2 sticky top-0 z-10">
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

                                    {/* Scrollable Body */}
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
                                            // ) : displayData.length > 0 ? (
                                            //     displayData.map((invoice, index) => (
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

                                    {/* {showAll && ( */}
                                    <tfoot>
                                        <tr className="bg-gray-200 font-semibold sticky bottom-0 z-10">
                                            <td className="px-6 py-4 border" colSpan={tableHeaders.length - 4}>Total</td>
                                            <td className="px-6 py-4 border text-right font-bold">Pen. Amt:</td>
                                            <td className="px-6 py-4 border font-bold">{totalPenAmt.toFixed(2)}</td>
                                            <td className="px-6 py-4 border text-right font-bold">Invoice Amt:</td>
                                            <td className="px-6 py-4 border font-bold">{totalBillAmt.toFixed(2)}</td>
                                        </tr>
                                    </tfoot>
                                    {/* )} */}
                                </table>
                            </div>
                        </div>

                        {/* Pagination - only shown when not in "show all" mode */}
                        {/* {!showAll && pageCount > 1 && (
                            <ReactPaginate
                                previousLabel={"Previous"}
                                nextLabel={"Next"}
                                breakLabel={"..."}
                                pageCount={pageCount}
                                marginPagesDisplayed={2}
                                pageRangeDisplayed={5}
                                onPageChange={({ selected }) => setCurrentPage(selected)}
                                containerClassName={"flex justify-center items-center mt-4 space-x-2"}
                                pageClassName={"px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-200"}
                                pageLinkClassName={"text-gray-700"}
                                activeClassName={"bg-blue-500 text-white"}
                                activeLinkClassName={"text-white"}
                                previousClassName={"px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-200"}
                                nextClassName={"px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-200"}
                                disabledClassName={"opacity-50 cursor-not-allowed"}
                                forcePage={currentPage}
                            />
                        )} */}
                    </div>
                )}
            </div>
        </div>
    );
}

export default InvoiceView;