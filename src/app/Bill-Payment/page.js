"use client";

import React, { useState } from "react";

const BillPaymentForm = () => {
  const [formData, setFormData] = useState({
    billno: "",
    Party_code: "",
    Billtype: "",
    Fromdt: "",
    Todt: "",
    loccode: "",
    manualbillno: "",
    Type: "",
    CompanyCode: "",
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const queryParams = new URLSearchParams(formData).toString();
      const response = await fetch(`/api/bill-payment?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data.status) {
        setResults(data.data); // Assuming recordset is in data.data
      } else {
        setError(data.message || "Failed to fetch data");
      }
    } catch (err) {
      setError("An error occurred while fetching data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Define table headers based on expected API response
  const tableHeaders = [
    "Bill No",
    "Party Code",
    "Bill Type",
    "From Date",
    "To Date",
    "Location Code",
    "Manual Bill No",
    "Type",
    "Company Code",
  ];

  return (
    <div className="p-8 w-full max-w-6xl mx-auto text-black min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-lg space-y-8">
        <h4 className="text-2xl font-bold text-center">Bill Payment Search</h4>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "billno", label: "Bill No", type: "text" },
              { name: "Party_code", label: "Party Code", type: "text" },
              { name: "Billtype", label: "Bill Type", type: "text" },
              { name: "Fromdt", label: "From Date", type: "date" },
              { name: "Todt", label: "To Date", type: "date" },
              { name: "loccode", label: "Location Code", type: "text" },
              { name: "manualbillno", label: "Manual Bill No", type: "text" },
              { name: "Type", label: "Type", type: "text" },
              { name: "CompanyCode", label: "Company Code", type: "text" },
            ].map((field) => (
              <div key={field.name} className="flex items-center">
                <label className="w-1/3 text-gray-700 font-medium text-left">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleInputChange}
                  className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                    <td className="border border-gray-300 px-4 py-2">{row.BillType || "-"}</td>
                    <td className="border border-gray-300 px-4 py-2">{row.Fromdt || "-"}</td>
                    <td className="border border-gray-300 px-4 py-2">{row.Todt || "-"}</td>
                    <td className="border border-gray-300 px-4 py-2">{row.LocCode || "-"}</td>
                    <td className="border border-gray-300 px-4 py-2">{row.ManualBillNo || "-"}</td>
                    <td className="border border-gray-300 px-4 py-2">{row.Type || "-"}</td>
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