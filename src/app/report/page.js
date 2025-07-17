"use client";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faEye, faSearch, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { pdf, PDFDownloadLink } from "@react-pdf/renderer";
import StatementPDF from "../components/StatementPDF";
import { useAuth } from "../context/AuthContext";
import moment from "moment";
import { fetchDropdownData, getledgerreport } from "@/lib/masterService";
import { ToastContainer, toast } from "react-toastify";

const generalLedger = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { userDetail } = useAuth();
  const [showAll, setShowAll] = useState(false);
  const [offset, setOffset] = useState(0);
  const [GeneralLedger, setGeneralLedger] = useState([]);
  const itemsPerPage = 10;
  const [isLoadingPDF, setIsLoadingPDF] = useState(false);
  const [dropdownData, setDropdownData] = useState({
    Company: [],
    Customer: [],
    InvViewHdr: [],
  });
  const initialState = {
    Party_code: "",
    Fromdt: moment().format("YYYY-MM-DD"),
    Todt: moment().format("YYYY-MM-DD"),
    CompanyCode: String(userDetail.CompanyCode) || "",
    brcd: userDetail.LocationCode,
  };

  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({
    Party_code: "",
    Fromdt: "",
    Todt: "",
    CompanyCode: "",
  });

  useEffect(() => {
    if (userDetail.CompanyCode) {
      handleDropdownData(userDetail.CompanyCode, "InvViewHdr");
      handleDropdownData(userDetail.CompanyCode, "Customer");
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
            Party_code: data[0].CustomerCode,
          }));
        }
      }
    } catch (error) {
      console.log(`Error fetching ${MstCode}:`, error);
      toast.error(`Failed to fetch ${MstCode} data: ${error.message}`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

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
    };
    let isValid = true;

    if (!formData.Party_code) {
      newErrors.Party_code = "Party code is required";
      isValid = false;
    }
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

    setErrors(newErrors);
    if (!isValid) {
      toast.error("Please fill in all required fields");
    }

    return isValid;
  };

  const handleSearch = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const fromDate = moment(formData.Fromdt).format("DD MMM YY");
      const toDate = moment(formData.Todt).format("DD MMM YY");

      const payload = {
        fromDate,
        toDate,
        partyCode: formData.Party_code,
        companyCode: formData.CompanyCode,
        brcd: userDetail.LocationCode,
      };

      const response = await getledgerreport(payload);

      if (response.status) {
        setGeneralLedger(response.data);
        toast.success("Ledger data fetched successfully!");
      } else {
        console.error("API error:", response.message);
        setErrors((prev) => ({
          ...prev,
          Party_code: response.message,
        }));
        toast.error(`API error: ${response.message}`);
      }
    } catch (error) {
      console.error("Error fetching ledger report:", error.message);
      setErrors((prev) => ({
        ...prev,
        Party_code: error.message || "Failed to fetch ledger data",
      }));
      toast.error(error.message || "Failed to fetch ledger data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetForm = () => {
    setFormData(initialState);
    setErrors({
      Party_code: "",
      Fromdt: "",
      Todt: "",
      CompanyCode: "",
    });
    setGeneralLedger([]);
    setShowAll(false);
    setOffset(0);
    toast.success("Form cleared successfully!");
  };

  // Calculate totals for footer
  const totalCredit = GeneralLedger.reduce((sum, item) => sum + (parseFloat(item.Credit) || 0), 0);
  const totalDebit = GeneralLedger.reduce((sum, item) => sum + (parseFloat(item.Debit) || 0), 0);

  const paginatedData = GeneralLedger.slice(offset, offset + itemsPerPage);
  const displayData = showAll ? GeneralLedger : paginatedData;

  const tableHeaders = ["SrNo.", "Date", "Description", "Credit", "Debit", "Balance"];

  let runningBalance = 0;

  const formatRowData = (mr, index) => {
    const credit = parseFloat(mr.Credit) || 0;
    const debit = parseFloat(mr.Debit) || 0;

    runningBalance += debit - credit;

    return {
      "SrNo.": index + 1,
      Date: mr.transdate ? moment(mr.transdate).format("DD MMM YYYY") : "-",
      Description: mr.Narration === "NA" ? mr.DOCNO : mr.Narration || "-",
      Credit: credit.toFixed(2),
      Debit: debit.toFixed(2),
      Balance: runningBalance.toFixed(2),
    };
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg overflow-y-hidden">
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <h4 className="text-xl font-bold text-center">Ledger Report</h4>
      {/* Row 1 */}
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

      {/* Row 2 */}
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
            {dropdownData.Customer?.map((option, idx) => (
              <option key={idx} value={option.CustomerCode}>
                {option.CustomerName}
              </option>
            ))}
          </select>
          {errors.Party_code && <span className="text-red-500 text-sm">{errors.Party_code}</span>}
        </div>

        <div className="col-span-3 flex flex-col space-y-2">
          <label className="text-gray-700 font-medium">Company Code</label>
          <select
            name="CompanyCode"
            value={formData.CompanyCode}
            onChange={handleInputChange}
            className="p-2 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
            disabled={isLoading}
          >
            {dropdownData.InvViewHdr?.map((option, idx) => (
              <option key={idx} value={option.CompanyCode}>
                {option.CompanyName}
              </option>
            ))}
          </select>
          {errors.CompanyCode && <span className="text-red-500 text-sm">{errors.CompanyCode}</span>}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-between mt-4">
        <button
          type="button"
          className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition duration-200"
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

      {/* Table */}
      {GeneralLedger.length > 0 && (
        <>
          <div className="flex items-center justify-between mt-4">
            <h2 className="text-xl font-bold">Statement Report</h2>
            <div className="flex gap-2">
              <PDFDownloadLink
                document={
                  <StatementPDF
                    data={GeneralLedger}
                    companyDetails={dropdownData.InvViewHdr[0] || {}}
                    customerDetails={dropdownData.Customer.find((c) => c.CustomerCode === formData.Party_code)}
                    totals={{ credit: totalCredit, debit: totalDebit }}
                    duration={`${moment(formData.Fromdt).format("DD MMM YYYY")} to ${moment(formData.Todt).format("DD MMM YYYY")}`}
                  />
                }
                fileName={`Statement-${formData.Party_code}-${moment().format("YYYYMMDD")}.pdf`}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
              >
                {({ loading }) => (
                  <>
                    <FontAwesomeIcon icon={loading ? faSpinner : faDownload} className={loading ? "animate-spin" : ""} />
                    <span>{loading ? "Preparing..." : "Download PDF"}</span>
                  </>
                )}
              </PDFDownloadLink>

              <button
                onClick={async () => {
                  try {
                    setIsLoadingPDF(true);
                    const pdfBlob = await pdf(
                      <StatementPDF
                        data={GeneralLedger}
                        companyDetails={dropdownData.InvViewHdr[0] || {}}
                        customerDetails={dropdownData.Customer.find((c) => c.CustomerCode === formData.Party_code)}
                        totals={{ credit: totalCredit, debit: totalDebit }}
                        duration={`${moment(formData.Fromdt).format("DD MMM YYYY")} to ${moment(formData.Todt).format("DD MMM YYYY")}`}
                      />
                    ).toBlob();
                    const pdfUrl = URL.createObjectURL(pdfBlob);
                    window.open(pdfUrl, "_blank");
                    URL.revokeObjectURL(pdfUrl);
                    toast.success("PDF preview generated successfully!");
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
                  ) : displayData.length > 0 ? (
                    displayData.map((item, index) => (
                      <tr
                        key={index}
                        className="odd:bg-white even:bg-gray-50 border-b border-gray-200"
                      >
                        {Object.values(formatRowData(item, showAll ? index : offset + index)).map(
                          (value, i) => (
                            <td key={i} className="px-6 py-4 border whitespace-nowrap">
                              {value}
                            </td>
                          )
                        )}
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
                    <td className="px-6 py-4 border text-end" colSpan={3}>
                      Total:
                    </td>
                    <td className="px-6 py-4 border-x-2 font-bold">{totalCredit.toFixed(2)}</td>
                    <td className="px-6 py-4 border font-bold">{totalDebit.toFixed(2)}</td>
                    <td className="px-6 py-4 border text-right font-bold"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default generalLedger;