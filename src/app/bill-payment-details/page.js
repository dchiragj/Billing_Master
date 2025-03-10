"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { billgenerate, Finyear, getBillEntryPayment } from "@/lib/masterService";
import { useAuth } from "../context/AuthContext";
import Table from "../components/Table";
import { toast } from "react-toastify";

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
      BillMRDET: [
        {
          TOTBILL: "",
          TDSDED: "",
          NETAMT: "",
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
        },
      ],
    },
    MRHDR: {
      MRSDT: "",
      MRSTYPE: "",
      EMRS_type: "",
      MRSBR: "",
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
      paymode: "",
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

  useEffect(() => {
    if (selectedBills) {
      fetchBillDetails();
    } else {
      router.push(`/bill-payment`);
    }
  }, [selectedBills]);

  const fetchBillDetails = async () => {
    setLoading(true);
    try {
      const data = await getBillEntryPayment(selectedBills);
      setBillDetails(data);
      toast.success("Bill details fetched successfully!");
    } catch (err) {
      setError(err.message || "Failed to fetch bill details");
      toast.error("Failed to fetch bill details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const tableHeaders = [
    "Srno.",
    "Bill No",
    "Customer Name",
    "Bill Date",
    "Bill Amt.",
    "VENDORBILLNO",
  ];

  const filteredData = billDetails.map((bill, index) => ({
    "Srno.": index + 1,
    "Bill No": bill.BillNO || "-",
    "Customer Name": bill.CustCd || "-",
    "Bill Date": bill.BGNDT || "-",
    "Bill Amt.": bill.BILLAMT || "-",
    "Pending Amt.": bill.PendAmt || "-",
    "VENDORBILLNO": bill.VENDORBILLNO || "-",
  }));

  const handleInputChange = (e, section) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: value,
      },
    }));
  };

  const handleBillInputChange = (e, index, name) => {
    const { value } = e.target;
    setFormData((prev) => {
      const updatedBills = [...prev.BillMRDET.BillMRDET];
      updatedBills[index][name] = value;
      return {
        ...prev,
        BillMRDET: {
          BillMRDET: updatedBills,
        },
      };
    });
  };

  const addBill = () => {
    setFormData((prev) => ({
      ...prev,
      BillMRDET: {
        BillMRDET: [
          ...prev.BillMRDET.BillMRDET,
          {
            TOTBILL: "",
            TDSDED: "",
            NETAMT: "",
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
          },
        ],
      },
    }));
    toast.info("New bill added to the list.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await billgenerate({
        ...formData,
        CompanyCode: "1",
        EntryBy: userDetail.UserId,
        FinYear: Finyear,
        MR_Location: "1",
      });

      if (response.success) {
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
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16m-7 6h7"
          />
        </svg>
      </button>
      <div className="bg-white p-8 rounded-lg shadow-lg space-y-6">
        <h4 className="text-2xl font-bold text-center text-gray-800">
          Bill Collection
        </h4>

        {/* You Selected Section */}
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

        {/* <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h6 className="text-xl font-semibold text-gray-700 mb-6">
            List of Bills
          </h6>
          <Table headers={tableHeaders} data={filteredData} />
        </div> */}

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border-2">
          {/* ChqDet Section */}
          {/* <div className="border-2 border-gray-300 p-4 rounded-lg">
            <h5 className="text-lg font-semibold mb-2">Cheque Details</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                ["ClearDt", "Clear Date", "date", true],
                ["Cleared", "Cleared", "select", true, ["Y", "N"]],
                ["Chqno", "Cheque Number", "text", true],
                ["Chqdt", "Cheque Date", "date", true],
                ["Chqamt", "Cheque Amount", "number", true],
                ["Banknm", "Bank Name", "text", false],
                ["Bankbrn", "Bank Branch", "text", false],
                ["Ptmsptcd", "Party Code", "text", true],
                ["Ptmsptnm", "Party Name", "text", true],
                ["ColAmt", "Collection Amount", "number", true],
                ["brcd", "Branch Code", "text", true],
                ["Acccode", "Account Code", "text", true],
                ["Onaccount", "On Account", "select", true, ["Y", "N"]],
                ["Diposited", "Deposited", "select", true, ["Y", "N"]],
              ].map(([name, label, type, isRequired, options], index) => (
                <div key={index} className="flex items-center">
                  <label className="text-gray-700 font-medium w-1/3 text-left">{label}</label>
                  {type === "select" ? (
                    <select
                      name={name}
                      value={formData.ChqDet[name] || ""}
                      onChange={(e) => handleInputChange(e, "ChqDet")}
                      className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required={isRequired}
                    >
                      <option value="">Select {label}</option>
                      {options.map((option, idx) => (
                        <option key={idx} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={type}
                      name={name}
                      value={formData.ChqDet[name] || ""}
                      onChange={(e) => handleInputChange(e, "ChqDet")}
                      className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required={isRequired}
                    />
                  )}
                </div>
              ))}
            </div>
          </div> */}

          <div className="">
            <h5 className="text-lg font-semibold mb-2">Bill Details</h5>
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg border">

              <table className="min-w-full text-sm text-center rtl:text-right text-gray-500 dark:text-gray-400 border border-gray-300">
                <thead className="text-gray-700 uppercase bg-gray-200 border-b-2 border-gray-400 dark:bg-gray-700 dark:text-gray-400">
                  <tr className="border border-gray-300">
                    <th className="border border-gray-300  py-2">SR No</th>
                    {[
                      "Srno.",
    "Bill No",
    "Customer Name",
    "Bill Date",
    "Bill Amt.",
    "VENDORBILLNO",
                      "TOTBILL",
                      "TDSDED",
                      "NETAMT",
                      "UNEXPDED",
                      "DOCNO",
                      // "CHG1",
                      // "CHG2",
                      // "CHG3",
                      // "CHG4",
                      // "CHG5",
                      // "CHG6",    
                      // "CHG7",    
                      // "CHG8",    
                      // "CHG9",    
                      // "CHG10", 
                      "Remarks",
                      "Action"
                    ].map((header, index) => (
                      <th key={index} className="border border-gray-300 px-2 py-2">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {formData.BillMRDET.BillMRDET.map((bill, index) => (
                    <tr key={index} className="border border-gray-300">
                      <td className="border border-gray-300 px-1 py-2">{index + 1}</td>
                      {[
                        ["TOTBILL", "Total Bill", "number", true],
                        ["TDSDED", "TDS Deduction", "number", true],
                        ["NETAMT", "Net Amount", "number", true],
                        ["UNEXPDED", "Unexpected Deduction", "number", true],
                        ["DOCNO", "Document Number", "text", true],
                        // ["CHG1", "Charge 1", "number", true],
                        // ["CHG2", "Charge 2", "number", true],
                        // ["CHG3", "Charge 3", "number", true],
                        // ["CHG4", "Charge 4", "number", true],
                        // ["CHG5", "Charge 5", "number", true],
                        // ["CHG6", "Charge 6", "number", true],
                        // ["CHG7", "Charge 7", "number", true],
                        // ["CHG8", "Charge 8", "number", true],
                        // ["CHG9", "Charge 9", "number", true],
                        // ["CHG10", "Charge 10", "number", true],
                        ["Remarks", "Remarks", "text", false],
                      ].map(([name, label, type, isRequired], idx) => (
                        <td key={idx} className="border border-gray-300 px-1 py-2">
                          <input
                            type={type}
                            name={name}
                            value={bill[name] || ""}
                            onChange={(e) => handleBillInputChange(e, index, name)}
                            className="p-1 w-full bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                            required={isRequired}
                          />
                        </td>
                      ))}
                      <td className="border border-gray-300 px-4 py-2">
                        {formData.BillMRDET.BillMRDET.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                BillMRDET: {
                                  BillMRDET: prev.BillMRDET.BillMRDET.filter((_, i) => i !== index),
                                },
                              }));
                            }}
                            className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700"
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={18} className="px-4 py-2">
                      <button
                        type="button"
                        onClick={addBill}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                      >
                        + Add New Bill
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>


          <div className="">
            <h5 className="text-lg font-semibold mb-2">MR Header Details</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                ["MRSDT", "MR Date", "date", true],
                ["MRSTYPE", "MR Type", "text", true],
                ["EMRS_type", "EMRS Type", "text", true],
                ["MRSBR", "MR Branch", "text", true],
                ["PTCD", "Party Code", "text", true],
                ["PTMSNM", "Party Name", "text", true],
                ["MRSAMT", "MR Amount", "number", true],
                ["NETAMT", "Net Amount", "number", true],
                ["DEDUCTION", "Deduction", "number", true],
                ["MRSCASH", "MR Cash", "number", true],
                ["MRSCHQ", "MR Cheque", "number", true],
                ["MRSCHQNO", "MR Cheque Number", "text", true],
                ["MRSCHQDT", "MR Cheque Date", "date", true],
                ["MRSBANK", "MR Bank", "text", false],
                ["MRS_CLOSED", "MR Closed", "select", true, ["Y", "N"]],
                ["DED_TDS", "Deduction TDS", "number", true],
                ["MR_CANCEL", "MR Cancel", "select", true, ["Y", "N"]],
                ["BILLMR", "Bill MR", "select", true, ["Y", "N"]],
                ["finclosedt", "Financial Close Date", "date", true],
                ["paymode", "Payment Mode", "select", true, ["Cash", "Cheque", "Bank"]],
                ["BankAcccode", "Bank Account Code", "text", true],
                ["BankAccdesc", "Bank Account Description", "text", false],
                ["tdsacccode", "TDS Account Code", "text", false],
                ["tdsaccdesc", "TDS Account Description", "text", false],
                ["ManualMrsno", "Manual MR Number", "text", false],
                ["CompanyCode", "Company Code", "text", true],
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
                        <option key={idx} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={type}
                      name={name}
                      value={formData.MRHDR[name] || ""}
                      onChange={(e) => handleInputChange(e, "MRHDR")}
                      className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required={isRequired}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Additional Fields */}
          <div className="border-2 border-gray-300 p-4 rounded-lg">
            <h5 className="text-lg font-semibold mb-2">Additional Details</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                ["MR_Location", "MR Location", "text", false],
                ["FinYear", "Financial Year", "text", false],
                ["EntryBy", "Entry By", "text", false],
                ["CompanyCode", "Company Code", "text", false],
              ].map(([name, label, type, isRequired], index) => (
                <div key={index} className="flex items-center">
                  <label className="text-gray-700 font-medium w-1/3 text-left">{label}</label>
                  <input
                    type={type}
                    name={name}
                    value={formData[name] || ""}
                    onChange={(e) => handleInputChange(e, "")}
                    className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required={isRequired}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BillPaymentDetails;