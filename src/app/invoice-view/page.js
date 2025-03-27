"use client"

import React, { useState, useEffect } from 'react';
import { faAlignLeft, faPrint } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAuth } from '../context/AuthContext';
import moment from 'moment';
import { fetchDropdownData, getInvoiceView } from '@/lib/masterService';
import { toast } from 'react-toastify';
import Table from '../components/Table';

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

                // Set default values for both Customer and BillType
                setFormData(prev => {
                    const newData = { ...prev };

                    if (MstCode === "Customer" && data.length > 0) {
                        newData.Party_code = data[0].CustomerCode;
                    }

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

        // Clear error when user starts typing
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

        if (!formData.Billno.trim()) {
            if (!formData.Party_code) {
                newErrors.Party_code = 'Party Code is required';
                isValid = false;
            }
            if (!formData.BillType) {
                newErrors.BillType = 'Bill Type is required';
                isValid = false;
            }
            if (!formData.Fromdt) {
                newErrors.Fromdt = 'From Date is required';
                isValid = false;
            }
            if (!formData.Todt) {
                newErrors.Todt = 'To Date is required';
                isValid = false;
            }

            // Only validate date range if dates exist
            if (formData.Fromdt && formData.Todt && moment(formData.Todt).isBefore(formData.Fromdt)) {
                newErrors.Todt = 'To Date must be after From Date';
                isValid = false;
            }
        }

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
                    setInvoiceViewData(data.data)
                    toast.success(data.message || "Data fetched successfully!");
                } else {
                    const errorMessage = formData.Billno
                        ? `No bills found for Bill Number: ${formData.Billno}`
                        : formData.Fromdt || formData.Todt
                            ? `No bills found between ${moment(formData.Fromdt).format('DD MMM YYYY')} and ${moment(formData.Todt).format('DD MMM YYYY')}`
                            : "No bills found for the provided search criteria";

                    toast.warning(errorMessage);
                    setInvoiceViewData([]);
                }
            } else {
                toast.error(data?.message || "Failed to fetch invoice data");
                setInvoiceViewData([]);
            }
        } catch (err) {
            console.log('Error fetching invoice data:', err);
            let errorMessage = "An error occurred while fetching invoice data";
            if (err.response) {
                errorMessage = err.response.data?.message ||
                    `Server error: ${err.response.status}`;
            } else if (err.request) {
                errorMessage = "Network error - Please check your connection";
            } else {
                errorMessage = err.message || "Request setup error";
            }
            toast.error(errorMessage);
            setInvoiceViewData([]);
        } finally {
            setIsLoading(false);
        }
    };
    const tableHeaders = ['SrNo.', 'Bill No', 'Location', 'Party Name', 'Bill Status','Pen. Amt.', 'Bill Amt.','Bill Cancel', 'Collection Type','GEN. Date'];

    const filteredData = invoiceViewData.map((invoiceData, index) => ({
        "SrNo.": index + 1,
        'Bill No': invoiceData.billno || "-",
        'Location': invoiceData.Location ? invoiceData.Location.split(":")[1]?.trim() : "-",
        'Party Name': invoiceData.ptmsstr || "-",
        'Bill Status': invoiceData.Billstatus || "-",
        'Pen. Amt.': invoiceData.pendamt || "-",
        'Bill Amt.': invoiceData.BILLAMT || "-",
        'Bill Cancel': invoiceData.bill_cancel ? 'Yes' : "No",
        'Collection Type': invoiceData.CollectionType || "-",
        'GEN. Date': invoiceData.bgndt || "-",
        // "Action": (
        //     <button onClick={() => handleEditClick(invoiceData)} className="font-medium text-blue-600 hover:underline">
        //         <FontAwesomeIcon icon={faPrint} />
        //     </button>
        // ),
    }));

    const handleReset = () => {
        setFormData(initialState);
        setErrors({
            Billno: '',
            Party_code: '',
            BillType: '',
            Fromdt: '',
            Todt: ''
        });
    };

    return (
        <div className="p-8 w-full lg:w-[calc(100vw-288px)] ml-0 lg:ml-[288px] text-black min-h-screen">
            <button
                className="lg:hidden text-xl text-black p-3 flex justify-start"
                onClick={() => setIsSidebarOpen(true)}
            >
                <FontAwesomeIcon icon={faAlignLeft} />
            </button>

            <div className="bg-white p-8 rounded-lg shadow-lg space-y-8 overflow-y-hidden">
                <h4 className="text-xl font-bold text-center">Invoice View</h4>
                <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col space-y-2">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col space-y-2">
                            <label className="text-gray-700 font-medium">Party Code</label>
                            <select
                                name="Party_code"
                                value={formData.Party_code}
                                onChange={handleInputChange}
                                className="p-2 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                                disabled={isLoading}
                            >
                                {dropdownData.Customer?.map((option, idx) => (
                                    <option key={idx} value={option.CustomerCode}>
                                        {option.CustomerName}
                                    </option>
                                ))}
                            </select>
                            {errors.Party_code && <span className="text-red-500 text-sm">{errors.Party_code}</span>}
                        </div>
                        <div className="flex flex-col space-y-2">
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

                        <div className="flex flex-col space-y-2">
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

                        <div className="flex flex-col space-y-2">
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
                            className={`bg-blue-600 rounded-lg text-white duration-200 hover:bg-blue-700 px-6 py-2 transition ${(isLoading) ? 'opacity-50' : ''}`}
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
                {
                    isLoading ?
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
                        </div> : invoiceViewData.length > 0 ?
                            <div className='space-y-2 '>
                                <h6 className='text-base font-bold text-center'>List Of Invoices</h6>
                                <Table headers={tableHeaders} data={filteredData} />
                            </div> : ''

                }
            </div>
        </div>
    );
}

export default InvoiceView;