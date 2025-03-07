"use client";

import React, { useState, useEffect } from "react";
import { billgenerate } from "@/lib/masterService";
import { useAuth } from "../context/AuthContext";

// Function to capitalize the first letter of each word
const capitalizeFirstLetter = (str) => {
  return str
    .split(/(?=[A-Z])/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const BillCollectionForm = () => {
  const { setIsSidebarOpen, userDetail } = useAuth();

  // Align initialFormData with MRHDR structure from BillMRGenerateForm
  const initialMRHDR = {
    Mrsdt: "", // MR Generation Date
    Mrstype: "1",
    EmrsType: "MR",
    Mrsbr: userDetail?.LocationCode || "HEAD QUARTER", // MR Branch
    Ptcd: "", // Party Code
    Ptmsnm: "", // Party Name
    Mrsamt: "", // Amount Applicable
    Netamt: "", // Net Received
    Deduction: "",
    Mrscash: "0.00", // Cash Amount
    Mrschq: "", // Cheque Amount
    Mrschqno: "", // Cheque No.
    Mrschqdt: "", // Cheque Date (optional, can be derived)
    Mrsbank: "", // Deposited Bank
    MrsClosed: "Y",
    DedTds: "0.00",
    MrCancel: "N",
    Billmr: "Y",
    Finclosedt: "",
    Paymode: "Bank", // Default to Bank, can be changed via Receipt Mode
    BankAcccode: "",
    BankAccdesc: "",
    Tdsacccode: "",
    Tdsaccdesc: "",
    ManualMrsno: "",
    CompanyCode: userDetail?.CompanyCode || "PSTARENTERPRISE",
  };

  // Align ChqDet with cheque-related fields
  const initialChqDet = {
    ClearDt: "",
    Cleared: "Y",
    Chqno: "",
    Chqdt: "",
    Chqamt: "", // Cheque Amount
    Banknm: "", // Deposited Bank
    Bankbrn: "",
    Ptmsptcd: "",
    Ptmsptnm: "",
    ColAmt: "", // Collection Amount
    Brcd: "2",
    Acccode: "",
    Onaccount: "N",
    Diposited: "Y",
  };

  // Align BillMRDET with List of Bills
  const initialBillMRDET = {
    Totbill: "", // Bill Amount
    Tdsded: "0.00",
    Netamt: "", // Net Received per bill
    Unexpded: "0.00",
    Docno: "", // BillNo
    Chg1: "0.00",
    Chg2: "0.00",
    Chg3: "0.00",
    Chg4: "0.00",
    Chg5: "0.00",
    Chg6: "0.00",
    Chg7: "0.00",
    Chg8: "0.00",
    Chg9: "0.00",
    Chg10: "0.00",
    Remarks: "", // Remarks
  };

  const [formData, setFormData] = useState({
    MRHDR: initialMRHDR,
    FinYear: "2024-2025",
    CompanyCode: userDetail?.CompanyCode || "PSTARENTERPRISE",
    EntryBy: userDetail?.UserId || "Administrator",
    MR_Location: userDetail?.LocationCode || "HEAD QUARTER",
    ChqDet: initialChqDet,
    BillMRDET: [initialBillMRDET],
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate fetching initial bill data or customer details
  }, [userDetail]);

  const handleInputChange = (e, section, index = null, field) => {
    const { value } = e.target;
    let formattedValue = value;

    const dateFields = ["Mrsdt", "Mrschqdt", "Finclosedt", "ClearDt", "Chqdt"];
    if (dateFields.includes(field)) {
      if (value) {
        const [year, month, day] = value.split("-");
        formattedValue = `${day}-${month}-${year}`; // Convert to DD-MM-YYYY
      } else {
        formattedValue = "";
      }
    }

    if (index !== null) {
      const updatedSection = [...formData[section]];
      updatedSection[index] = { ...updatedSection[index], [field]: formattedValue };
      setFormData((prev) => ({
        ...prev,
        [section]: updatedSection,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [section]: { ...prev[section], [field]: formattedValue },
      }));
    }
  };

  const handleSingleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addBillMRDET = () => {
    setFormData((prev) => ({
      ...prev,
      BillMRDET: [...prev.BillMRDET, { ...initialBillMRDET, srNo: prev.BillMRDET.length + 1 }],
    }));
  };

  const removeBillMRDET = (index) => {
    if (formData.BillMRDET.length > 1) {
      const updatedBillMRDET = formData.BillMRDET.filter((_, i) => i !== index);
      updatedBillMRDET.forEach((item, i) => (item.srNo = i + 1));
      setFormData((prev) => ({
        ...prev,
        BillMRDET: updatedBillMRDET,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const payload = {
        MRHDR: formData.MRHDR,
        FinYear: formData.FinYear,
        CompanyCode: formData.CompanyCode,
        EntryBy: formData.EntryBy,
        MR_Location: formData.MR_Location,
        ChqDet: formData.ChqDet,
        BillMRDET: formData.BillMRDET,
      };

      console.log("Submitting Payload:", payload);

      const data = await billgenerate(payload);

      if (data) {
        setResults(data);
        console.log("API Response Data:", data);
      } else {
        setError("Failed to generate bill collection");
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred while generating the bill collection");
      console.error("Error details:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return "";
    const [day, month, year] = dateStr.split("-");
    return `${year}-${month}-${day}`; // Returns YYYY-MM-DD for native date input
  };

  return (
    <div className="p-8 w-full lg:w-[calc(100vw-288px)] ml-0 lg:ml-[288px] text-black min-h-screen">
      <button
        className="lg:hidden text-black p-3 flex justify-start"
        onClick={() => setIsSidebarOpen(true)}
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      </button>

      <div className="bg-white p-8 rounded-lg shadow-lg space-y-8 border-2 border-gray-300">
        <h4 className="text-2xl font-bold text-center">Bill Collection</h4>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border-2 border-gray-300">
          {/* Customer Details */}
          <div className="border-2 border-gray-300 p-4 rounded-lg">
            <h5 className="text-lg font-semibold mb-2">Customer Details</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <label className="w-1/3 text-gray-700 font-medium text-left">Customer Code and Name</label>
                <input
                  type="text"
                  name="customerCodeName"
                  value={formData.MRHDR.Ptcd + " - " + formData.MRHDR.Ptmsnm}
                  onChange={(e) => handleInputChange(e, "MRHDR", null, "Ptcd")}
                  className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g., Zaddock@gmail.com - Zakir Shaikh"
                />
              </div>
              <div className="flex items-center">
                <label className="w-1/3 text-gray-700 font-medium text-left">Docket Booking Date Range</label>
                <input
                  type="date"
                  value={formatDateForInput(formData.MRHDR.Mrsdt)}
                  onChange={(e) => handleInputChange(e, "MRHDR", null, "Mrsdt")}
                  className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="DD-MM-YYYY"
                />
              </div>
            </div>
          </div>

          {/* MR Details */}
          <div className="border-2 border-gray-300 p-4 rounded-lg">
            <h5 className="text-lg font-semibold mb-2">MR Details</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <label className="w-1/3 text-gray-700 font-medium text-left">MR Number</label>
                <input
                  type="text"
                  value={formData.MRHDR.ManualMrsno}
                  readOnly
                  className="p-2 w-2/3 bg-gray-200 rounded-md border border-gray-300 cursor-not-allowed"
                  placeholder="System Generated"
                />
              </div>
              <div className="flex items-center">
                <label className="w-1/3 text-gray-700 font-medium text-left">MR Generation Date</label>
                <input
                  type="date"
                  value={formatDateForInput(formData.MRHDR.Mrsdt)}
                  onChange={(e) => handleInputChange(e, "MRHDR", null, "Mrsdt")}
                  className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center">
                <label className="w-1/3 text-gray-700 font-medium text-left">MR Branch</label>
                <input
                  type="text"
                  value={formData.MRHDR.Mrsbr}
                  readOnly
                  className="p-2 w-2/3 bg-gray-200 rounded-md border border-gray-300 cursor-not-allowed"
                />
              </div>
              <div className="flex items-center">
                <label className="w-1/3 text-gray-700 font-medium text-left">Party Code and Name</label>
                <input
                  type="text"
                  value={formData.MRHDR.Ptcd + " - " + formData.MRHDR.Ptmsnm}
                  onChange={(e) => handleInputChange(e, "MRHDR", null, "Ptcd")}
                  className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center">
                <label className="w-1/3 text-gray-700 font-medium text-left">Is Reconciled</label>
                <select
                  value={formData.MRHDR.MrsClosed}
                  onChange={(e) => handleInputChange(e, "MRHDR", null, "MrsClosed")}
                  className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Y">Yes</option>
                  <option value="N">No</option>
                </select>
              </div>
            </div>
          </div>

          {/* List of Bills */}
          <div className="border-2 border-gray-300 p-4 rounded-lg">
            <h5 className="text-lg font-semibold mb-2">List of Bills</h5>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-200 text-gray-700 font-medium">
                    <th className="border-2 border-gray-300 p-2 text-center">SrNo</th>
                    <th className="border-2 border-gray-300 p-2 text-center">BillNo</th>
                    <th className="border-2 border-gray-300 p-2 text-center">Bill Date</th>
                    <th className="border-2 border-gray-300 p-2 text-center">Bill Amount</th>
                    <th className="border-2 border-gray-300 p-2 text-center">Pending Amt</th>
                    <th className="border-2 border-gray-300 p-2 text-center">Payment Charges(-)</th>
                    <th className="border-2 border-gray-300 p-2 text-center">COD Charges(-)</th>
                    <th className="border-2 border-gray-300 p-2 text-center">Discount(-)</th>
                    <th className="border-2 border-gray-300 p-2 text-center">Balance Amount</th>
                    <th className="border-2 border-gray-300 p-2 text-center">Net Recd</th>
                    <th className="border-2 border-gray-300 p-2 text-center">Tracking No</th>
                    <th className="border-2 border-gray-300 p-2 text-center">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.BillMRDET.map((bill, index) => (
                    <tr key={index} className="border-2 border-gray-300">
                      <td className="border-2 border-gray-300 p-2">
                        <input
                          type="text"
                          name="srNo"
                          value={index + 1}
                          readOnly
                          className="p-1 w-full bg-gray-200 rounded-md border border-gray-300 cursor-not-allowed"
                        />
                      </td>
                      <td className="border-2 border-gray-300 p-2">
                        <input
                          type="text"
                          name="Docno"
                          value={bill.Docno}
                          onChange={(e) => handleInputChange(e, "BillMRDET", index, "Docno")}
                          className="p-1 w-full bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </td>
                      <td className="border-2 border-gray-300 p-2">
                        <input
                          type="date"
                          name="billDate"
                          value={formatDateForInput(bill.billDate || "")} // Placeholder, adjust if needed
                          onChange={(e) => handleInputChange(e, "BillMRDET", index, "billDate")}
                          className="p-1 w-full bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </td>
                      <td className="border-2 border-gray-300 p-2">
                        <input
                          type="text"
                          name="Totbill"
                          value={bill.Totbill}
                          onChange={(e) => handleInputChange(e, "BillMRDET", index, "Totbill")}
                          className="p-1 w-full bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </td>
                      <td className="border-2 border-gray-300 p-2">
                        <input
                          type="text"
                          name="pendingAmount"
                          value={bill.pendingAmount || ""} // Placeholder, adjust if needed
                          onChange={(e) => handleInputChange(e, "BillMRDET", index, "pendingAmount")}
                          className="p-1 w-full bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </td>
                      <td className="border-2 border-gray-300 p-2">
                        <input
                          type="text"
                          name="paymentCharges"
                          value={bill.paymentCharges || ""} // Placeholder, adjust if needed
                          onChange={(e) => handleInputChange(e, "BillMRDET", index, "paymentCharges")}
                          className="p-1 w-full bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </td>
                      <td className="border-2 border-gray-300 p-2">
                        <input
                          type="text"
                          name="codCharges"
                          value={bill.codCharges || ""} // Placeholder, adjust if needed
                          onChange={(e) => handleInputChange(e, "BillMRDET", index, "codCharges")}
                          className="p-1 w-full bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </td>
                      <td className="border-2 border-gray-300 p-2">
                        <input
                          type="text"
                          name="discount"
                          value={bill.discount || ""} // Placeholder, adjust if needed
                          onChange={(e) => handleInputChange(e, "BillMRDET", index, "discount")}
                          className="p-1 w-full bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </td>
                      <td className="border-2 border-gray-300 p-2">
                        <input
                          type="text"
                          name="balanceAmount"
                          value={bill.balanceAmount || ""} // Placeholder, adjust if needed
                          onChange={(e) => handleInputChange(e, "BillMRDET", index, "balanceAmount")}
                          className="p-1 w-full bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </td>
                      <td className="border-2 border-gray-300 p-2">
                        <input
                          type="text"
                          name="Netamt"
                          value={bill.Netamt}
                          onChange={(e) => handleInputChange(e, "BillMRDET", index, "Netamt")}
                          className="p-1 w-full bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </td>
                      <td className="border-2 border-gray-300 p-2">
                        <input
                          type="text"
                          name="trackingNo"
                          value={bill.trackingNo || ""} // Placeholder, adjust if needed
                          onChange={(e) => handleInputChange(e, "BillMRDET", index, "trackingNo")}
                          className="p-1 w-full bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </td>
                      <td className="border-2 border-gray-300 p-2">
                        <input
                          type="text"
                          name="Remarks"
                          value={bill.Remarks}
                          onChange={(e) => handleInputChange(e, "BillMRDET", index, "Remarks")}
                          className="p-1 w-full bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              onClick={addBillMRDET}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 mt-4"
            >
              Add Bill
            </button>
            {formData.BillMRDET.length > 1 && (
              <button
                type="button"
                onClick={() => removeBillMRDET(formData.BillMRDET.length - 1)}
                className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600 transition duration-200 mt-2 ml-2"
              >
                Remove Last
              </button>
            )}
          </div>

          {/* Collection Details */}
          <div className="border-2 border-gray-300 p-4 rounded-lg">
            <h5 className="text-lg font-semibold mb-2">Collection Details</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <label className="w-1/3 text-gray-700 font-medium text-left">Receipt Mode</label>
                <select
                  name="Paymode"
                  value={formData.MRHDR.Paymode}
                  onChange={(e) => handleInputChange(e, "MRHDR", null, "Paymode")}
                  className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Bank">Bank</option>
                </select>
              </div>
              <div className="flex items-center">
                <label className="w-1/3 text-gray-700 font-medium text-left">Amount Applicable</label>
                <input
                  type="text"
                  name="Mrsamt"
                  value={formData.MRHDR.Mrsamt}
                  onChange={(e) => handleInputChange(e, "MRHDR", null, "Mrsamt")}
                  className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center">
                <label className="w-1/3 text-gray-700 font-medium text-left">Cash Amount</label>
                <input
                  type="text"
                  name="Mrscash"
                  value={formData.MRHDR.Mrscash}
                  onChange={(e) => handleInputChange(e, "MRHDR", null, "Mrscash")}
                  className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center">
                <label className="w-1/3 text-gray-700 font-medium text-left">Account Type</label>
                <select
                  name="accountType"
                  value={formData.ChqDet.Acccode || ""}
                  onChange={(e) => handleInputChange(e, "ChqDet", null, "Acccode")}
                  className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">-Select-</option>
                  <option value="Savings">Savings</option>
                  <option value="Current">Current</option>
                </select>
              </div>
              <div className="flex items-center">
                <label className="w-1/3 text-gray-700 font-medium text-left">Cheque No.</label>
                <input
                  type="text"
                  name="Mrschqno"
                  value={formData.MRHDR.Mrschqno}
                  onChange={(e) => handleInputChange(e, "MRHDR", null, "Mrschqno")}
                  className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center">
                <label className="w-1/3 text-gray-700 font-medium text-left">On Account Balance</label>
                <input
                  type="text"
                  name="onAccountBalance"
                  value={formData.ChqDet.Onaccount === "Y" ? formData.MRHDR.Netamt : "0.00"}
                  readOnly
                  className="p-2 w-2/3 bg-gray-200 rounded-md border border-gray-300 cursor-not-allowed"
                />
              </div>
              <div className="flex items-center">
                <label className="w-1/3 text-gray-700 font-medium text-left">Cheque Amount</label>
                <input
                  type="text"
                  name="Mrschq"
                  value={formData.MRHDR.Mrschq}
                  onChange={(e) => handleInputChange(e, "MRHDR", null, "Mrschq")}
                  className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center">
                <label className="w-1/3 text-gray-700 font-medium text-left">TDS Type</label>
                <select
                  name="tdsType"
                  value={formData.ChqDet.Tdsacccode || ""}
                  onChange={(e) => handleInputChange(e, "ChqDet", null, "Tdsacccode")}
                  className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">-Select-</option>
                  <option value="TDS1">TDS1</option>
                  <option value="TDS2">TDS2</option>
                </select>
              </div>
              <div className="flex items-center">
                <label className="w-1/3 text-gray-700 font-medium text-left">Collection Amount, From Cheque</label>
                <input
                  type="text"
                  name="ColAmt"
                  value={formData.ChqDet.ColAmt}
                  onChange={(e) => handleInputChange(e, "ChqDet", null, "ColAmt")}
                  className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center">
                <label className="w-1/3 text-gray-700 font-medium text-left">Deposited Bank</label>
                <select
                  name="Mrsbank"
                  value={formData.MRHDR.Mrsbank}
                  onChange={(e) => handleInputChange(e, "MRHDR", null, "Mrsbank")}
                  className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">-Select-</option>
                  <option value="Bank1">Bank1</option>
                  <option value="Bank2">Bank2</option>
                </select>
              </div>
              <div className="flex items-center">
                <label className="w-1/3 text-gray-700 font-medium text-left">Direct Deposit In Bank</label>
                <select
                  name="Diposited"
                  value={formData.ChqDet.Diposited}
                  onChange={(e) => handleInputChange(e, "ChqDet", null, "Diposited")}
                  className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Y">Yes</option>
                  <option value="N">No</option>
                </select>
              </div>
              <div className="flex items-center">
                <label className="w-1/3 text-gray-700 font-medium text-left">On Account</label>
                <select
                  name="Onaccount"
                  value={formData.ChqDet.Onaccount}
                  onChange={(e) => handleInputChange(e, "ChqDet", null, "Onaccount")}
                  className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Y">Yes</option>
                  <option value="N">No</option>
                </select>
              </div>
              <div className="flex items-center">
                <label className="w-1/3 text-gray-700 font-medium text-left">Net Received</label>
                <input
                  type="text"
                  name="Netamt"
                  value={formData.MRHDR.Netamt}
                  onChange={(e) => handleInputChange(e, "MRHDR", null, "Netamt")}
                  className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200 disabled:bg-gray-400"
            >
              {loading ? "Processing..." : "Submit"}
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-center mt-4 border-2 border-red-300 p-2 rounded-lg">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center mt-4">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="mt-4 p-4 bg-green-100 border-2 border-green-400 rounded-lg">
            <h5 className="text-lg font-semibold">Submission Result</h5>
            <p>Message: {results.message || "Bill collection submitted successfully"}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillCollectionForm;