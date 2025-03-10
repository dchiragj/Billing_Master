"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { billgenerate, Finyear, getBillEntryPayment } from "@/lib/masterService";
import { useAuth } from "../context/AuthContext";
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
      BillMRDET: [],
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

      const parsedBills = data.map((bill) => {
        const charges = bill.CHGCODE.split('*/').map((charge) => {
          const [code, description, isActive, sign] = charge.split('~');
          return { code, description, isActive, sign };
        }).filter((charge) => charge.isActive === 'Y');
      
        return { ...bill, charges, NetRecdAmount: bill.BILLAMT };
      });

      setFormData((prev) => ({
        ...prev,
        BillMRDET: {
          BillMRDET: parsedBills.map((bill) => ({
            BillNO: bill.BillNO || "",
            CustCd: bill.CustCd || "",
            BGNDT: bill.BGNDT || "",
            BILLAMT: bill.BILLAMT || "",
            PendAmt: bill.PendAmt || "",
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
            charges: bill.charges,
          })),
        },
      }));

      toast.success("Bill details fetched successfully!");
    } catch (err) {
      setError(err.message || "Failed to fetch bill details");
      toast.error("Failed to fetch bill details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Transform the data to match the required payload structure
    const transformedBills = formData.BillMRDET.BillMRDET.map((bill) => ({
      TOTBILL: bill.TOTBILL || "0.00",
      TDSDED: bill.TDSDED || "0.00",
      NETAMT: bill.BILLAMT || "0.00",
      UNEXPDED: bill.UNEXPDED || "0.00",
      DOCNO: bill.BillNO || "",
      CHG1: bill.CHG1 || "0.00",
      CHG2: bill.CHG2 || "0.00",
      CHG3: bill.CHG3 || "0.00",
      CHG4: bill.CHG4 || "0.00",
      CHG5: bill.CHG5 || "0.00",
      CHG6: bill.CHG6 || "0.00",
      CHG7: bill.CHG7 || "0.00",
      CHG8: bill.CHG8 || "0.00",
      CHG9: bill.CHG9 || "0.00",
      CHG10: bill.CHG10 || "0.00",
      Remarks: bill.Remarks || "",
    }));

    const payload = {
      ...formData,
      BillMRDET: {
        BillMRDET: transformedBills,
      },
      CompanyCode: "1",
      EntryBy: userDetail.UserId,
      FinYear: Finyear,
      MR_Location: "1",
    };

    console.log(payload);

    const response = await billgenerate(payload);

    if (response.success) {
      toast.success("Bill generated successfully!");
      router.push("/bill-payment");
    } else {
      toast.error("Failed to generate bill. Please try again.");
    }
  };

  // Function to dynamically generate table headers based on charges
  const generateChargeHeaders = (bill) => {
    return bill.charges.map((charge, index) => (
      <th key={index} className="border border-gray-300 px-2 py-2">
        {charge.description}
      </th>
    ));
  };

  const generateChargeCells = (bill, index) => {
    return bill.charges.map((charge, idx) => (
      <td key={idx} className="border border-gray-300 px-1 py-2">
        <input
          type="number"
          name={`CHG${idx + 1}`}
          value={formData.BillMRDET.BillMRDET[index][`CHG${idx + 1}`] || ""}
          onChange={(e) => handleBillInputChange(e, index, `CHG${idx + 1}`)}
          className="p-1 w-full bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
        />
      </td>
    ));
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

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border-2">
          <div className="">
            <h5 className="text-lg font-semibold mb-2">Bill Details</h5>
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg border">
              <table className="min-w-full text-sm text-center rtl:text-right text-gray-500 dark:text-gray-400 border border-gray-300">
<thead className="text-gray-700 uppercase bg-gray-200 border-b-2 border-gray-400 dark:bg-gray-700 dark:text-gray-400">
  <tr className="border border-gray-300">
    <th className="border border-gray-300 py-2">SR No</th>
    {[
      "Bill No",
      "Customer Name",
      "Bill Date",
      "Bill Amt.",
      "Pending Amt.",
      "Net Recd. Amount",
    ].map((header, index) => (
      <th key={index} className="border border-gray-300 px-2 py-2">
        {header}
      </th>
    ))}
    {formData.BillMRDET.BillMRDET[0]?.charges && generateChargeHeaders(formData.BillMRDET.BillMRDET[0])}
    <th className="border border-gray-300 px-2 py-2">Remarks</th>
  </tr>
</thead>

<tbody>
  {formData.BillMRDET.BillMRDET.map((bill, index) => (
    <tr key={index} className="border border-gray-300">
      <td className="border border-gray-300 px-1 py-2">{index + 1}</td>
      <td className="border border-gray-300 px-1 py-2">{bill.BillNO}</td>
      <td className="border border-gray-300 px-1 py-2">{bill.CustCd}</td>
      <td className="border border-gray-300 px-1 py-2">{bill.BGNDT}</td>
      <td className="border border-gray-300 px-1 py-2">{bill.BILLAMT}</td>
      <td className="border border-gray-300 px-1 py-2">{bill.PendAmt}</td>
      <td className="border border-gray-300 px-1 py-2">
        <input
          type="number"
          name="NetRecdAmount"
          value={formData.BillMRDET.BillMRDET[index].NetRecdAmount || bill.BILLAMT}
          onChange={(e) => handleBillInputChange(e, index, "NetRecdAmount")}
          className="p-1 w-full bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
        />
      </td>
      {bill.charges && generateChargeCells(bill, index)}
      <td className="border border-gray-300 px-1 py-2">
        <textarea
          name="Remarks"
          value={bill.Remarks || ""}
          onChange={(e) => handleBillInputChange(e, index, "Remarks")}
          className="p-1 w-full bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
        />
      </td>
    </tr>
  ))}
</tbody>
              </table>
            </div>
          </div>
        <div>
        <h5 className="text-lg font-semibold mb-2">Cheque Details</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
                ["Chqno", "Cheque Number", "text", true],
                ["Chqdt", "Cheque Date", "date", true],
                ["Chqamt", "Cheque Amount", "number", true],
                ["Banknm", "Bank Name", "text", false],
                ["ColAmt", "Collection Amount", "number", true],
                ["Acccode", "Account Code", "text", true],
                ["Onaccount", "On Account Yes/No", "checkbox", false],
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
                  ): type === "checkbox" ? (
                    <input
                      type={type}
                      name={name}
                      checked={formData.ChqDet[name] || false}
                      onChange={(e) => handleInputChange(e, "ChqDet")}
                      className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-gray-500"
                    /> )
                  : (
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
          </div>

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