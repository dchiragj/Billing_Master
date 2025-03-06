"use client";

import React, { useState, useEffect } from "react";
import { billpayment } from "@/lib/masterService";
import { useAuth } from "../context/AuthContext";

const BillPaymentForm = () => {
    const { setIsSidebarOpen, userDetail } = useAuth();
  
  const [formData, setFormData] = useState({
    billno: "",
    Party_code: "",
    Fromdt: "",
    Todt: "",
    loccode: userDetail.LocationCode,
    manualbillno: "",
    CompanyCode: userDetail.CompanyCode,
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const formatDate = (inputDate) => {
    const date = new Date(inputDate);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Convert date from YYYY-MM-DD (browser format) to DD-MM-YYYY if it's a date field
    let formattedValue = value;
    if (name === "Fromdt" || name === "Todt") {
      if (value) {
        const [year, month, day] = value.split("-");
        formattedValue = `${day}-${month}-${year}`; // Convert to DD-MM-YYYY  
      } else {
        formattedValue = ""; // Handle empty input
      }
    }
    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults([]);
    console.log(formData);
    

    try {
      const companyCode = formData.CompanyCode || "1"; // Use form value or fallback
      console.log("Submitting with CompanyCode:", companyCode);
      console.log("Form Data:", formData);

      const data = await billpayment(formData);

      if (data) {
        setResults(data); // Assuming the API returns the data directly
        console.log("API Response Data:", data);
      } else {
        setError("Failed to fetch data from the API");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "An error occurred while fetching data"
      );
      console.error("Error details:", err);
    } finally {
      setLoading(false);
    }
  };

  // Define table headers based on expected API response
  const tableHeaders = [
    "Bill No",
    "Party Code",
    "From Date",
    "To Date",
    "Location Code",
    "Manual Bill No",
    "Company Code",
  ];

  // Convert DD-MM-YYYY to YYYY-MM-DD for native date input
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return "";
    const [day, month, year] = dateStr.split("-");
    return `${year}-${month}-${day}`; // Returns YYYY-MM-DD for native date input
  };

  return (
    <div className="p-8 w-full lg:w-[calc(100vw-288px)] ml-0 lg:ml-[288px] text-black min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-lg space-y-8">
        <h4 className="text-2xl font-bold text-center">Bill Payment Search</h4>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "billno", label: "Bill No", type: "text" },
              { name: "Party_code", label: "Party Code", type: "text" },
              { name: "Fromdt", label: "From Date", type: "date" }, // Native date input
              { name: "Todt", label: "To Date", type: "date" },     // Native date input
              { name: "manualbillno", label: "Manual Bill No", type: "text" },
            ].map((field) => (
              <div key={field.name} className="flex items-center">
                <label className="w-1/3 text-gray-700 font-medium text-left">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  value={
                    field.type === "date"
                      ? formatDateForInput(formData[field.name]) // Convert DD-MM-YYYY to YYYY-MM-DD for native date input
                      : formData[field.name]
                  }
                  onChange={handleInputChange}
                  className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder={field.label === "From Date" || field.label === "To Date" ? "DD-MM-YYYY" : ""}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200 disabled:bg-gray-400"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-center">{error}</div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Results Table */}
        {results.length > 0 && (
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg border">
            <table className="min-w-full text-sm text-center text-gray-500 border border-gray-300">
              <thead className="text-gray-700 uppercase bg-gray-200 border-b-2 border-gray-400">
                <tr>
                  {tableHeaders.map((header) => (
                    <th key={header} className="border border-gray-300 px-4 py-2">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((row, index) => (
                  <tr key={index} className="border border-gray-300">
                    <td className="border border-gray-300 px-4 py-2">{row.BillNo || "-"}</td>
                    <td className="border border-gray-300 px-4 py-2">{row.PartyCode || "-"}</td>
                    <td className="border border-gray-300 px-4 py-2">{row.Fromdt || "-"}</td>
                    <td className="border border-gray-300 px-4 py-2">{row.Todt || "-"}</td>
                    <td className="border border-gray-300 px-4 py-2">{row.LocCode || "-"}</td>
                    <td className="border border-gray-300 px-4 py-2">{row.ManualBillNo || "-"}</td>
                    <td className="border border-gray-300 px-4 py-2">{row.CompanyCode || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillPaymentForm;