"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchDropdownData, getBillPaymentData } from "@/lib/masterService";
import { useAuth } from "../context/AuthContext";
import moment from "moment";
import { toast } from "react-toastify";
import { faAlignLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const BillPaymentForm = () => {
  const router = useRouter();
  const { setIsSidebarOpen, userDetail } = useAuth();
  const [dropdownData, setDropdownData] = useState({
    Customer: [],
  });

  const getCurrentDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  const initialState = {
    billno: "",
    Party_code: "", 
    Fromdt: getCurrentDate(),
    Todt: getCurrentDate(),
    loccode: userDetail.LocationCode,
    manualbillno: "",
    CompanyCode: userDetail.CompanyCode,
  };

  const [formData, setFormData] = useState(initialState);
  const [billData, setBillData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBill, setSelectedBill] = useState([]);
  const [errors, setErrors] = useState({
    billno: "",
    manualbillno: "",
    Fromdt: "",
    Todt: "",
    Party_code: "",
  });

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

        // Set the default Party_code to the first customer in the dropdown
        if (MstCode === "Customer" && data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            Party_code: data[0].CustomerCode,
          }));
        }
      }
    } catch (error) {
      console.error(`Error fetching ${MstCode}:`, error);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setBillData([]);
    setSelectedBill([]);

    setErrors({
      billno: "",
      manualbillno: "",
      Fromdt: "",
      Todt: "",
      Party_code: "",
    });

    let hasErrors = false;
    const newErrors = { ...errors };

    if (formData.billno) {
      setFormData((prev) => ({
        ...prev,
        Party_code: "",
        Fromdt: getCurrentDate(),
        Todt: getCurrentDate(),
        manualbillno: "",
      }));
    } else if (formData.Fromdt || formData.Todt) {
      if (!formData.Party_code) {
        newErrors.Party_code = "Party Code is required when providing From Date and To Date.";
        hasErrors = true;
      }
    }

    if (hasErrors) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    const payload = {
      ...formData,
      Fromdt: formData.Fromdt ? formatDate(formData.Fromdt) : "",
      Todt: formData.Todt ? formatDate(formData.Todt) : "",
    };

    try {
      const data = await getBillPaymentData(payload);
      if (data && data.data && data.data.data.length > 0) {
        setBillData(data.data.data);
        toast.success("Data fetched successfully!");
      } else {
        if (formData.billno) {
          toast.error("No data found for the provided Bill Number.");
        } else if (formData.Fromdt || formData.Todt) {
          toast.error("No data found for the provided date range.");
        } else {
          toast.error("No data found for the provided search criteria.");
        }
      }
    } catch (err) {
      if (formData.billno) {
        toast.error("No Data Found for the provided Bill Number.");
      } else if (formData.Fromdt || formData.Todt) {
        toast.error("No Data Found for the Provided Date range or Party Code.");
      } else {
        toast.error("No data found for the provided search criteria.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (billno) => {
    setSelectedBill((prevSelected) => {
      if (prevSelected.includes(billno)) {
        return prevSelected.filter((item) => item !== billno);
      } else {
        return [...prevSelected, billno];
      }
    });
  };

  const handleSelectAll = (isChecked) => {
    if (isChecked) {
      const allBillNos = billData.map((bill) => bill.billno);
      setSelectedBill(allBillNos);
    } else {
      setSelectedBill([]);
    }
  };

  const handleSelectedBillsForms = () => {
    if (selectedBill.length === 0) {
      toast.warning("No bills selected.");
      return;
    }

    const queryParams = new URLSearchParams({ selectedBill, Fromdt: formData.Fromdt, Todt: formData.Todt });

    router.push(`/bill-payment-details?${queryParams}`);
  };

  return (
    <div className="p-8 w-full lg:w-[calc(100vw-288px)] ml-0 lg:ml-[288px] text-black min-h-screen">
      <button className="lg:hidden text-black p-3 flex justify-start" onClick={() => setIsSidebarOpen(true)}>
        <FontAwesomeIcon icon={faAlignLeft} />
      </button>
      <div className="bg-white p-8 rounded-lg shadow-lg space-y-8">
        <h4 className="text-2xl font-bold text-center">Bill Payment Search</h4>
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border-2">
          {/* Bill No and Manual Bill No Group */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col space-y-2">
              <label className="text-gray-700 font-medium">Bill No</label>
              <input
                type="text"
                name="billno"
                value={formData.billno || ""}
                onChange={handleInputChange}
                className="p-2 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
              />
              {errors.billno && <span className="text-red-500 text-sm">{errors.billno}</span>}
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-gray-700 font-medium">Manual Bill No</label>
              <input
                type="text"
                name="manualbillno"
                value={formData.manualbillno || ""}
                onChange={handleInputChange}
                className="p-2 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
              />
              {errors.manualbillno && <span className="text-red-500 text-sm">{errors.manualbillno}</span>}
            </div>
          </div>
          <h6 className="flex items-center justify-center my-4 text-xl">
            <span className="border-t border-gray-300 flex-grow mr-2"></span>
            <span className="text-gray-500">OR</span>
            <span className="border-t border-gray-300 flex-grow ml-2"></span>
          </h6>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col space-y-2">
              <label className="text-gray-700 font-medium">From Date</label>
              <input
                type="date"
                name="Fromdt"
                value={formData.Fromdt || ""}
                onChange={handleInputChange}
                className="p-2 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
              />
              {errors.Fromdt && <span className="text-red-500 text-sm">{errors.Fromdt}</span>}
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-gray-700 font-medium">To Date</label>
              <input
                type="date"
                name="Todt"
                value={formData.Todt || ""}
                onChange={handleInputChange}
                className="p-2 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
              />
              {errors.Todt && <span className="text-red-500 text-sm">{errors.Todt}</span>}
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-gray-700 font-medium">Party Code</label>
              <select
                name="Party_code"
                value={formData.Party_code || ""}
                onChange={handleInputChange}
                className="p-2 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
              >
                {dropdownData.Customer?.map((option, idx) => (
                  <option key={idx} value={option.CustomerCode}>
                    {option.CustomerName}
                  </option>
                ))}
              </select>
              {errors.Party_code && <span className="text-red-500 text-sm">{errors.Party_code}</span>}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between mt-4">
            <button type="button" onClick={() => setFormData(initialState)} className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition duration-200">
              Cancel
            </button>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200">
              Search
            </button>
          </div>
        </form>

        {/* Loading and Table Section */}
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : billData.length > 0 ? (
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg border">
            <table className="min-w-full text-sm text-center text-gray-500 border border-gray-300">
              <thead className="text-gray-700 uppercase bg-gray-200 border-b-2 border-gray-400">
                <tr>
                  <th className="border border-gray-300 px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selectedBill.length === billData.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 focus:ring-2"
                    />
                  </th>
                  {["Bill No", "Manual Bill No", "Bill Type", "Bill Amount", "Pending Amount", "Generation Date", "Due Date"].map((header) => (
                    <th key={header} className="border border-gray-300 px-4 py-2">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {billData.map((bill, index) => (
                  <tr key={index} className="border border-gray-300">
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="flex gap-2 justify-center">
                        <input
                          id={`checkbox-${index}`}
                          type="checkbox"
                          checked={selectedBill.includes(bill.billno)}
                          onChange={() => handleCheckboxChange(bill.billno)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 focus:ring-2"
                        />
                        {index + 1}
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{bill.billno || "-"}</td>
                    <td className="border border-gray-300 px-4 py-2">{bill.ManualBillNo || "-"}</td>
                    <td className="border border-gray-300 px-4 py-2">{bill.paybas || "-"}</td>
                    <td className="border border-gray-300 px-4 py-2">{bill.BILLAMT || "-"}</td>
                    <td className="border border-gray-300 px-4 py-2">{bill.pendamt || "-"}</td>
                    <td className="border border-gray-300 px-4 py-2">{moment(bill.bgndt).format('YYYY-MM-DD') || "-"}</td>
                    <td className="border border-gray-300 px-4 py-2">{moment(bill.DueDT).format('YYYY-MM-DD') || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-center my-4">
              <button
                onClick={handleSelectedBillsForms}
                disabled={selectedBill.length === 0}
                className={`px-6 py-2 rounded-lg transition duration-200 ${selectedBill.length > 0 ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
              >
                Click Here to Collect Bills
              </button>
            </div>
          </div>
        ) : ""}
      </div>
    </div>
  );
};

export default BillPaymentForm;