"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAlignLeft, faEye, faSearch, faSpinner } from '@fortawesome/free-solid-svg-icons';
import SalesReportPDF from '../components/SalesReportPDF';
import { pdf } from '@react-pdf/renderer';
import { toast } from 'react-toastify';
import moment from 'moment';
import { fetchDropdownData, getstockreport, USPSearchInvoiceItem } from '@/lib/masterService';

const SalesReport = () => {
    const { setIsSidebarOpen, userDetail } = useAuth();
    const [itemDropData, setItemDropData] = useState([]);
    const [isLoadingPDF, setIsLoadingPDF] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [stockReport, setStockReport] = useState([]);
    const tableHeaders = ["Item name", "Qty", "Avg. Sale rate(₹)", "Profit/Margin (₹)", "Amount (₹)"];
    const [dropdownData, setDropdownData] = useState({
        Company: [],
        Customer: [],
        InvViewHdr: [],
        FinYear: [],
        Location: [],
    });
    const initialState = {
        Party_code: "",
        Fromdt: moment().startOf("month").format("YYYY-MM-DD"),
        Todt: moment().format("YYYY-MM-DD"),
        CompanyCode: String(userDetail.CompanyCode) || "",
        brcd: userDetail.LocationCode || "",
        financialYear: userDetail.FinancialYear || "",
        ItemCode: "",
    };

    const [formData, setFormData] = useState(initialState);
    const [errors, setErrors] = useState({
        Party_code: "",
        Fromdt: "",
        Todt: "",
        CompanyCode: "",
        brcd: "",
        financialYear: "",
        ItemCode: "",
    });

    // Format numbers in Indian style (1,59,394.06)
    const formatIndianNumber = (num) => {
        if (isNaN(num)) return "0.00";
        const numStr = parseFloat(num).toFixed(2);
        const [whole, decimal] = numStr.split('.');
        const lastThree = whole.substring(whole.length - 3);
        const otherNumbers = whole.substring(0, whole.length - 3);
        const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
        return formatted + (decimal ? "." + decimal : ".00");
    };



const groupDataByItem = (data) => {
    const temp = [...data];
    const finalized = {};

    console.log("Input data:", temp); // Log input data for debugging

    temp.forEach((item) => {
        const [code, name] = item.ICode ? item.ICode.split("~") : ["", ""];
        if (!name) {
            console.warn("Invalid ICode format for item:", item);
            return; // Skip invalid items
        }

        if (!finalized[name]) {
            finalized[name] = {
                itemName: name,
                itemQty: 0,
                itemAvgSales: 0,
                itemProfitMargin: 0,
                itemAmount: 0,
                parties: {}
            };
        }

        const current = finalized[name];

        const qty = Number(item.Out_Qty) || 0;
        const amount = Number(item.Amount) || 0;
        const rate = Number(item.Rate) || 0;
        const partyName = item.PartyName || "Unknown";
        const partyAvgSales = qty > 0 ? Number((amount / qty).toFixed(2)) : 0.00;

        current.itemQty += qty;
        current.itemAmount += amount;
        current.itemProfitMargin += amount - (rate * qty);
        current.itemAvgSales = current.itemQty > 0 ? Number((current.itemAmount / current.itemQty).toFixed(2)) : 0;

        // Group parties by partyName and partyAvgSales
        const key = `${partyName}_${partyAvgSales}`;
        if (!current.parties[key]) {
            current.parties[key] = {
                ICode: item.ICode || "",
                partyName: partyName,
                partyQty: 0,
                partyAvgSales: partyAvgSales,
                partyProfitMargin: 0,
                partyAmount: 0
            };
        }

        const partyGroup = current.parties[key];
        partyGroup.partyQty += qty;
        partyGroup.partyProfitMargin += amount - (rate * qty);
        partyGroup.partyAmount += amount;
    });

    // Convert parties object to array and filter items with positive itemAmount
    const result = Object.values(finalized)
        .filter(item => item.itemAmount > 0)
        .map(item => ({
            ...item,
            parties: Object.values(item.parties).map(party => ({
                ICode: party.ICode,
                partyName: party.partyName,
                partyQty: party.partyQty,
                partyAvgSales: party.partyAvgSales,
                partyProfitMargin: party.partyProfitMargin,
                partyAmount: party.partyAmount
            }))
        }));

    console.log("Finalized data:", result); // Log final output for debugging
    return result;
};
   const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "Todt") {
        // When "To Date" changes, set "From Date" to the first day of the same month
        const selectedToDate = moment(value);
        const firstDayOfMonth = selectedToDate.startOf("month").format("YYYY-MM-DD");

        setFormData((prev) => ({
            ...prev,
            [name]: value,
            Fromdt: firstDayOfMonth, // Automatically set Fromdt to the first day of the month
        }));
    } else {
        // For other fields, update normally
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    // Clear errors for the changed field
    if (errors[name]) {
        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));
    }
};

    const validateForm = () => {
        const newErrors = {
            Party_code: "",
            Fromdt: "",
            Todt: "",
            CompanyCode: "",
            brcd: "",
            financialYear: "",
            ItemCode: "",
        };
        let isValid = true;

        if (!formData.Fromdt) {
            newErrors.Fromdt = "From date is required";
            isValid = false;
        }
        if (!formData.Todt) {
            newErrors.Todt = "To date is required";
            isValid = false;
        }
        if (!formData.CompanyCode) {
            newErrors.CompanyCode = "Company code is required";
            isValid = false;
        }
        if (!formData.brcd) {
            newErrors.brcd = "Location is required";
            isValid = false;
        }
        if (!formData.financialYear) {
            newErrors.financialYear = "Financial year is required";
            isValid = false;
        }

        setErrors(newErrors);
        if (!isValid) {
            toast.error("Please fill in all required fields");
        }

        return isValid;
    };

    const handleSearch = async () => {
        if (!validateForm()) return;
        try {
            setIsLoading(true);
            const fromDate = moment(formData.Fromdt).format("DD MMM YY");
            const toDate = moment(formData.Todt).format("DD MMM YY");
            const payload = {
                partyCode: formData.Party_code || "",
                fromdt: fromDate,
                todt: toDate,
                location: formData.brcd || "",
                year: formData.financialYear,
                icode: formData.ItemCode || "",
            };

            const response = await getstockreport(payload);
            if (response.status) {
                const groupedData = groupDataByItem(response.data);
                setStockReport(groupedData);
                toast.success("Sales report data fetched successfully!");
            } else {
                setIsLoading(false);
                toast.error(`API error: ${response.message}`);
            }
        } catch (error) {
            console.error("Error fetching sales report:", error.message);
            setIsLoading(false);
            toast.error(error.message || "Failed to fetch sales report data");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetForm = () => {
        setFormData(initialState);
        setStockReport([]);
        setErrors({
            Party_code: "",
            Fromdt: "",
            Todt: "",
            CompanyCode: "",
            brcd: "",
            financialYear: "",
            ItemCode: "",
        });
    };

const calculateTotals = () => {
    let totalQty = 0;
    let totalProfitMargin = 0;
    let totalAmount = 0;

    stockReport.forEach((item) => {
        totalQty += item.itemQty || 0;
        totalProfitMargin += item.itemProfitMargin || 0;
        totalAmount += item.itemAmount || 0;
    });

    return {
        totalQty: Math.round(totalQty), // Keep as integer, no formatting
        totalProfitMargin: Math.abs(totalProfitMargin),
        totalAmount: totalAmount,
        isProfitPositive: totalProfitMargin >= 0,
    };
};

    const totals = calculateTotals();

    useEffect(() => {
        if (userDetail.CompanyCode) {
            handleDropdownData(userDetail.CompanyCode, "InvViewHdr");
            handleDropdownData(userDetail.CompanyCode, "Customer");
            handleDropdownData(userDetail.CompanyCode, "Location");
            handleDropdownData(userDetail.CompanyCode, "FinYear");
            fetchItemDetails();
            handleSearch();
        }
    }, [userDetail.CompanyCode]);

    const handleDropdownData = async (CompanyCode, MstCode) => {
        try {
            if (userDetail.CompanyCode) {
                const data = await fetchDropdownData(CompanyCode, MstCode);
                setDropdownData((prev) => ({
                    ...prev,
                    [MstCode]: data,
                }));

                if (MstCode === "Customer" && data.length > 0) {
                    setFormData((prev) => ({
                        ...prev,
                        Party_code: data.CustomerCode,
                    }));
                }
                if (MstCode === "Location" && data.length > 0 && !formData.brcd) {
                    setFormData((prev) => ({
                        ...prev,
                        brcd: data[0].LocationCode,
                    }));
                }
                if (MstCode === "InvViewHdr" && data.length > 0 && !formData.CompanyCode) {
                    setFormData((prev) => ({
                        ...prev,
                        CompanyCode: data[0].CompanyCode,
                    }));
                }
                if (MstCode === "FinYear" && data.length > 0 && !formData.financialYear) {
                    setFormData((prev) => ({
                        ...prev,
                        financialYear: data[0].FinYear,
                    }));
                }
            }
        } catch (error) {
            console.log(`Error fetching ${MstCode}:`, error);
            toast.error(`Failed to fetch ${MstCode} data: ${error.message}`);
        }
    };

    const fetchItemDetails = async (prefixText, index) => {
        try {
            const itemDetails = await USPSearchInvoiceItem();
            setItemDropData(itemDetails.data || []);
            if (itemDetails.data?.length > 0 && !formData.ItemCode) {
                setFormData((prev) => ({
                    ...prev,
                    ItemCode: itemDetails.data.code,
                }));
            }
        } catch (error) {
            console.log("Error fetching item details:", error);
            setItemDropData([]);
        }
    };

    return (
        <div className="h-full">
            <button
                className="lg:hidden text-xl text-black p-3 flex justify-start"
                onClick={() => setIsSidebarOpen(true)}
            >
                <FontAwesomeIcon icon={faAlignLeft} />
            </button>
            <div className="bg-white p-4 rounded-lg shadow-lg overflow-y-hidden">
                <h4 className="text-xl font-bold text-center">Sales Report</h4>
                <div className="grid grid-cols-6 gap-6 mb-4">
                    <div className="col-span-3 flex flex-col space-y-2">
                        <label className="text-gray-700 font-medium">Location</label>
                        <select
                            name="brcd"
                            value={formData.brcd}
                            onChange={handleInputChange}
                            className="p-2 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                            disabled={isLoading}
                        >
                            <option value="">Select Location</option>
                            {dropdownData.Location?.map((option, idx) => (
                                <option key={idx} value={option.LocationCode}>
                                    {option.LocationName}
                                </option>
                            ))}
                        </select>
                        {errors.brcd && <span className="text-red-500 text-sm">{errors.brcd}</span>}
                    </div>
                    <div className="col-span-3 flex flex-col space-y-2">
                        <label className="text-gray-700 font-medium">Financial Year</label>
                        <select
                            name="financialYear"
                            value={formData.financialYear}
                            onChange={handleInputChange}
                            className="p-2 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                            disabled={isLoading}
                        >
                            <option value="">Select Financial Year</option>
                            {dropdownData.FinYear.map((year) => (
                                <option key={year.FinYear} value={year.FinYear}>
                                    {year.FinYear}
                                </option>
                            ))}
                        </select>
                        {errors.financialYear && <span className="text-red-500 text-sm">{errors.financialYear}</span>}
                    </div>
                </div>
                <div className="grid grid-cols-6 gap-6 mb-4">
                    <div className="col-span-3 flex flex-col space-y-2">
                        <label className="text-gray-700 font-medium">From Date</label>
                        <input
                            type="date"
                            name="Fromdt"
                            value={formData.Fromdt}
                            onChange={handleInputChange}
                            className="p-2 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                        />
                        {errors.Fromdt && <span className="text-red-500 text-sm">{errors.Fromdt}</span>}
                    </div>
                    <div className="col-span-3 flex flex-col space-y-2">
                        <label className="text-gray-700 font-medium">To Date</label>
                        <input
                            type="date"
                            name="Todt"
                            value={formData.Todt}
                            onChange={handleInputChange}
                            className="p-2 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                        />
                        {errors.Todt && <span className="text-red-500 text-sm">{errors.Todt}</span>}
                    </div>
                </div>
                <div className="grid grid-cols-6 gap-6 mb-4">
                    <div className="col-span-3 flex flex-col space-y-2">
                        <label className="text-gray-700 font-medium">Party Code</label>
                        <select
                            name="Party_code"
                            value={formData.Party_code}
                            onChange={handleInputChange}
                            className="p-2 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                            disabled={isLoading}
                        >
                            <option value="">Select Party</option>
                            {dropdownData.Customer?.map((option, idx) => (
                                <option key={idx} value={option.CustomerCode}>
                                    {option.CustomerName}
                                </option>
                            ))}
                        </select>
                        {errors.Party_code && <span className="text-red-500 text-sm">{errors.Party_code}</span>}
                    </div>
                    <div className="col-span-3 flex flex-col space-y-2">
                        <label className="text-gray-700 font-medium">Item Code</label>
                        <select
                            name="ItemCode"
                            value={formData.ItemCode}
                            onChange={handleInputChange}
                            className="p-2 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                            disabled={isLoading}
                        >
                            <option value="">Select Item</option>
                            {itemDropData.map((item, idx) => (
                                <option key={idx} value={item.code}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                        {errors.ItemCode && <span className="text-red-500 text-sm">{errors.ItemCode}</span>}
                    </div>
                </div>
                <div className="flex items-center justify-end mt-4">
                    <button
                        type="button"
                        className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition duration-200 mr-4"
                        onClick={handleResetForm}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        onClick={handleSearch}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center gap-2"
                        disabled={isLoading}
                    >
                        <FontAwesomeIcon icon={isLoading ? faSpinner : faSearch} className={isLoading ? "animate-spin" : ""} />
                        <span>{isLoading ? "Searching..." : "Search"}</span>
                    </button>
                </div>
                <div className="flex items-center justify-between mt-4">
                    <p className="text-gray-700"></p>
                    <div className="flex gap-2">
                        <button
                            onClick={async () => {
                                if (!validateForm()) return;
                                try {
                                    setIsLoadingPDF(true);
                                    const pdfBlob = await pdf(
                                        <SalesReportPDF
                                            data={stockReport}
                                            companyDetails={dropdownData.InvViewHdr[0] || {}}
                                            duration={`${moment(formData.Fromdt).format("DD MMM YYYY")} to ${moment(formData.Todt).format("DD MMM YYYY")}`}
                                            totals={{
                                                totalQty: totals.totalQty,
                                                totalProfitMargin: totals.totalProfitMargin,
                                                totalAmount: totals.totalAmount,
                                                isProfitPositive: totals.isProfitPositive
                                            }}
                                        />
                                    ).toBlob();
                                    const pdfUrl = URL.createObjectURL(pdfBlob);
                                    window.open(pdfUrl, "_blank");
                                    URL.revokeObjectURL(pdfUrl);
                                    toast.success("PDF preview sales-report successfully!");
                                } catch (error) {
                                    console.error("Error generating PDF:", error);
                                    toast.error("Failed to generate PDF preview");
                                } finally {
                                    setIsLoadingPDF(false);
                                }
                            }}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
                            disabled={isLoadingPDF}
                        >
                            <FontAwesomeIcon icon={isLoadingPDF ? faSpinner : faEye} className={isLoadingPDF ? "animate-spin" : ""} />
                            <span>{isLoadingPDF ? "Generating..." : "Preview PDF"}</span>
                        </button>
                    </div>
                </div>
                <div className="relative shadow-md sm:rounded-lg border max-h-[70vh] flex flex-col mt-6">
                    <div className="flex-1 overflow-auto">
                        <table className="w-full">
                            <thead className="text-gray-700 uppercase bg-gray-200 border-b-2 sticky -top-0.5 z-10">
                                <tr>
                                    {tableHeaders.map((header, index) => (
                                        <th key={index} className="px-6 py-3 border border-gray-300 whitespace-nowrap">
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
                                                <FontAwesomeIcon icon={faSpinner} className="animate-spin h-8 w-8 text-blue-500" />
                                            </div>
                                        </td>
                                    </tr>
                                ) : stockReport.length > 0 ? (
                                    stockReport.map((item, index) => (
                                        <React.Fragment key={index}>
                                            {/* Item Header Row */}
                                            <tr className="bg-gray-100 font-bold border-b-2 border-t-2 border-gray-300">
                                                {/* <td className="px-6 py-3 border" colSpan={5}>
                                                    {item.itemName}

                                                </td> */}
                                                <td className="px-6 py-3 border">{item.itemName}</td>
                                                <td className="px-6 py-3 border">{(item.itemQty)} Box</td>
                                                <td className="px-6 py-3 border">{item.itemAvgSales.toFixed(2)}</td>
                                                <td className={`px-6 py-3 border ${item.itemProfitMargin >= 0 ? "text-green-600" : "text-red-600"}`}>
                                                    {item.itemProfitMargin >= 0 ? "" : "-"}
                                                    {(Math.abs(item.itemProfitMargin.toFixed(2)))}
                                                </td>
                                                <td className="px-6 py-3 border">{(item.itemAmount)}</td>
                                            </tr>
                                            {/* Party Rows */}
                                            {item.parties.map((party, idx) => {
                                                const profitPercentage = party.partyAmount
                                                    ? ((party.partyProfitMargin / party.partyAmount) * 100).toFixed(1)
                                                    : "0.0";

                                                return (
                                                    <tr key={idx} className="odd:bg-white even:bg-gray-50 border-b border-gray-200">
                                                        <td className="px-6 py-2 border whitespace-nowrap">{party.partyName}</td>
                                                        <td className="px-6 py-2 border">{(party.partyQty)}</td>
                                                        <td className="px-6 py-2 border">{party.partyAvgSales.toFixed(2)}</td>
                                                        <td className={`px-6 py-2 border ${party.partyProfitMargin >= 0 ? "text-green-600" : "text-red-600"}`}>
                                                            {party.partyProfitMargin >= 0 ? "" : "-"}
                                                            {(Math.abs(party.partyProfitMargin))}
                                                            {party.partyProfitMargin >= 0 && ` (${profitPercentage}%)`}
                                                        </td>
                                                        <td className="px-6 py-2 border">{(party.partyAmount)}</td>
                                                    </tr>
                                                );
                                            })}
                                        </React.Fragment>
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
                                    <td className="px-6 py-4 border text-end" colSpan={1}>
                                        Total:
                                    </td>
                                    <td className="px-6 py-4 border font-bold">{stockReport.length > 0 ? `${totals.totalQty} Box` : "-"}</td>
                                    <td className="px-6 py-4 border font-bold">-</td>
                                    <td className={`px-6 py-4 border font-bold ${totals.isProfitPositive ? "text-green-600" : "text-red-600"}`}>
                                        {totals.isProfitPositive ? "" : "-"}{stockReport.length > 0 ? totals.totalProfitMargin.toFixed(2) : "-"}
                                    </td>
                                    <td className="px-6 py-4 border font-bold">{stockReport.length > 0 ? totals.totalAmount : "-"}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesReport;