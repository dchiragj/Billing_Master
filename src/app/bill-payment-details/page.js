"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { billGenerate, fetchDropdownData, fetchDropdownDatacity, getBillEntryPayment } from "@/lib/masterService";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { faAlignLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";

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
  const [isCashSelected, setIsCashSelected] = useState(false);
  const [dropdownData, setDropdownData] = useState({
    CPTYP: [],
    Cash: [],
    Bank: [],
    Location:[],
  });
  const Finyear = userDetail.FinancialYear;
  const [formData, setFormData] = useState({
    ChqDet: {
      ClearDt: "",
      Cleared: "",
      Chqno: "",
      Chqdt: moment().format("YYYY-MM-DD"),
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
      MRSDT: moment().format("YYYY-MM-DD"),
      MRSTYPE: "",
      EMRS_type: "",
      MRSBR: userDetail.LocationCode,
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
      paymode: "190",
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

  // Fetch bill details when selectedBills changes
  useEffect(() => {
    if (selectedBills) {
      fetchBillDetails();
    } else {
      router.push(`/bill-payment`);
    }
  }, [selectedBills]);

  // Fetch dropdown data when userDetail.CompanyCode changes
  useEffect(() => {
    if (userDetail?.CompanyCode) {
      Object.keys(dropdownData).forEach((key) => {
        handleDropdownData(userDetail.CompanyCode, key);
      });
    }
  }, [userDetail?.CompanyCode]);

  // Reset fields when paymode changes
  useEffect(() => {
    const isCash = formData.MRHDR.paymode === "190";
    setIsCashSelected(isCash);

    setFormData(prev => {
      // Common fields that don't change between modes
      const baseUpdate = {
        ...prev,
        MRHDR: {
          ...prev.MRHDR,
          // Preserve NETAMT and other important fields
          NETAMT: prev.MRHDR.NETAMT,
        }
      };

      if (isCash) {
        // Cash mode - reset cheque fields and set default cash account
        return {
          ...baseUpdate,
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
            Acccode: dropdownData.Cash?.[0]?.Acccode || "", // Default first cash account
            Onaccount: "",
            Diposited: "",
          },
          MRHDR: {
            ...baseUpdate.MRHDR,
            MRSCHQ: "",
            MRSCHQNO: "",
            MRSCHQDT: "",
            MRSBANK: "",
            BankAcccode: "",
            MRSCASH: prev.MRHDR.NETAMT || "", // Set cash amount to NETAMT if available
          }
        };
      } else {
        // Cheque mode - reset cash fields and set default bank account
        return {
          ...baseUpdate,
          MRHDR: {
            ...baseUpdate.MRHDR,
            MRSCASH: "",
            // BankAcccode: dropdownData.Bank?.[0]?.Acccode || "", // Default first bank account
            MRSCHQ: prev.MRHDR.NETAMT || "", // Set cheque amount to NETAMT
          },
          ChqDet: {
            ...prev.ChqDet,
            Chqamt: prev.MRHDR.NETAMT || "", // Set cheque amount
            ColAmt: prev.MRHDR.NETAMT || "", // Set collection amount
            // Preserve other cheque details that might have been entered
            ClearDt: prev.ChqDet.ClearDt,
            Chqno: prev.ChqDet.Chqno,
            Chqdt: prev.ChqDet.Chqdt,
            Acccode: dropdownData.Bank?.[0]?.Acccode
            // ... other cheque fields you want to preserve
          }
        };
      }
    });
  }, [formData.MRHDR.paymode, formData.MRHDR.NETAMT, dropdownData.Cash, dropdownData.Bank]);
  // Calculate Net Amount and update Cash/Cheque Amount dynamically
  useEffect(() => {
    const calculateNetAmount = () => {
      // Calculate new values first without setting state
      const updatedBills = formData.BillMRDET.BillMRDET.map((bill) => {
        let netAmount = parseFloat(bill.PendAmt) || 0;

        bill.charges?.forEach((charge, index) => {
          const chargeValue = parseFloat(bill[`CHG${index + 1}`]) || 0;
          netAmount = charge.sign === "+" ?
            netAmount + chargeValue :
            netAmount - chargeValue;
        });

        const balanceAmount = parseFloat(bill.UNEXPDED) || 0;
        netAmount -= balanceAmount;

        return {
          ...bill,
          NETAMT: netAmount.toFixed(2),
        };
      });

      const totalNetAmount = updatedBills.reduce(
        (sum, bill) => sum + (parseFloat(bill.NETAMT) || 0),
        0
      ).toFixed(2);

      // Only update state if values have actually changed
      setFormData(prev => {
        // Check if any bill NETAMT has changed
        const billsChanged = updatedBills.some((bill, i) =>
          bill.NETAMT !== prev.BillMRDET.BillMRDET[i]?.NETAMT
        );

        // Check if total has changed
        const totalChanged = totalNetAmount !== prev.MRHDR.NETAMT;

        if (!billsChanged && !totalChanged) {
          return prev; // No changes needed
        }

        const newState = {
          ...prev,
          BillMRDET: {
            BillMRDET: updatedBills,
          },
          MRHDR: {
            ...prev.MRHDR,
            NETAMT: totalNetAmount,
          },
        };


        // Update payment-specific fields only if paymode is set
        if (prev.MRHDR.paymode === "190") { // Cash
          newState.MRHDR.MRSCASH = totalNetAmount;
          newState.MRHDR.MRSCHQ = "";
          newState.ChqDet = {
            ...prev.ChqDet,
            Chqamt: "",
            ColAmt: ""
          };
        } else if (prev.MRHDR.paymode === "191") { // Cheque
          newState.MRHDR.MRSCHQ = totalNetAmount;
          newState.MRHDR.MRSCASH = "";
          newState.ChqDet = {
            ...prev.ChqDet,
            ColAmt: totalNetAmount,
            Chqamt: totalNetAmount,
          };
        }

        return newState;
      });
    };

    // Only run calculation if we have bills to process
    if (formData.BillMRDET.BillMRDET.length > 0) {
      calculateNetAmount();
    }
  }, [
    // Be very specific about dependencies - only include what can trigger recalculation
    formData.BillMRDET.BillMRDET.map(bill => [
      bill.PendAmt,
      ...bill.charges?.map((_, i) => bill[`CHG${i + 1}`]),
      bill.UNEXPDED
    ].join('|')).join(','), // Creates a dependency string based on relevant bill fields
    formData.MRHDR.paymode
  ]);

  const handleDropdownData = async (CompanyCode, MstCode) => {
    try {
      if (userDetail.CompanyCode && isCashSelected) {
        const data = await fetchDropdownData(CompanyCode, MstCode);
        setDropdownData((prev) => ({
          ...prev,
          [MstCode]: data,
        }));
      } else if (userDetail.CompanyCode && !isCashSelected ) {
        const data = await fetchDropdownDatacity(CompanyCode, MstCode, userDetail.LocationCode);
        setDropdownData((prev) => ({
          ...prev,
          [MstCode]: data,
        }));
      }
    } catch (error) {
      console.log(`Error fetching ${MstCode}:`, error);
    }
  };

  const fetchBillDetails = async () => {
    setLoading(true);
    try {
      const data = await getBillEntryPayment(selectedBills);
      setBillDetails(data);

      const parsedBills = data.map((bill) => {
        // Parse charges from CHGCODE
        const charges = bill.CHGCODE.split("*/")
          .map((charge) => {
            const [code, description, isActive, sign] = charge.split("~");
            const calculatedSign = description.includes("(+)") ? "+" : "-";
            return { code, description, isActive, sign: calculatedSign };
          })
          .filter((charge) => charge.isActive === "Y");

        // Calculate Net Amount dynamically
        let netAmount = parseFloat(bill.BILLAMT) || 0;

        charges.forEach((charge, index) => {
          const chargeValue = parseFloat(bill[`CHG${index + 1}`]) || 0;
          if (charge.sign === "+") {
            netAmount += chargeValue;
          } else if (charge.sign === "-") {
            netAmount -= chargeValue;
          }
        });

        // Subtract the Balance Amount (UNEXPDED)
        const balanceAmount = parseFloat(bill.UNEXPDED) || 0;
        netAmount -= balanceAmount;

        bill.NETAMT = netAmount.toFixed(2); // Update Net Amount

        return {
          ...bill,
          charges,
          NetRecdAmount: netAmount.toFixed(2),
        };
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
            NETAMT: bill.NetRecdAmount || "",
            UNEXPDED: bill.UNEXPDED || "0.00", // Initialize UNEXPDED
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
    } catch (err) {
      setError(err.message || "Failed to fetch bill details");
      toast.error("Failed to fetch bill details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e, section) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: type === "checkbox" ? checked : value,
      },
    }));

    if (name === "paymode" && section === "MRHDR") {
      setIsCashSelected(value === "190");
    }
  };

  const handleBillInputChange = (e, index, name) => {
    const { value } = e.target;

    setFormData((prev) => {
      const updatedBills = [...prev.BillMRDET.BillMRDET];
      updatedBills[index][name] = value;

      // Recalculate Net Amount for the current bill
      const bill = updatedBills[index];
      let netAmount = parseFloat(bill.BILLAMT) || 0;

      // Subtract charges (with appropriate signs)
      bill.charges.forEach((charge, chargeIndex) => {
        const chargeValue = parseFloat(updatedBills[index][`CHG${chargeIndex + 1}`]) || 0;
        if (charge.sign === "-") {
          netAmount -= chargeValue;
        } else if (charge.sign === "+") {
          netAmount += chargeValue;
        }
      });

      // Subtract the Balance Amount (UNEXPDED)
      const balanceAmount = parseFloat(updatedBills[index].UNEXPDED) || 0;
      netAmount -= balanceAmount;

      updatedBills[index].NETAMT = netAmount.toFixed(2); // Update Net Amount

      return {
        ...prev,
        BillMRDET: {
          BillMRDET: updatedBills,
        },
      };
    });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const transformedBills = formData.BillMRDET.BillMRDET.map((bill) => ({
      TOTBILL: String(bill.TOTBILL) || "0.00",
      TDSDED: bill.TDSDED || "0.00",
      NETAMT: String(bill.NETAMT) || "0.00", // Use dynamically calculated Net Amount
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

    const filteredChqDet = Object.keys(formData.ChqDet).reduce((acc, key) => {
      if (formData.ChqDet[key] !== undefined && formData.ChqDet[key] !== "") {
        acc[key] = formData.ChqDet[key];
      }
      return acc;
    }, {});

    const filteredMRHDR = Object.keys(formData.MRHDR).reduce((acc, key) => {
      if (formData.MRHDR[key] !== undefined && formData.MRHDR[key] !== "") {
        acc[key] = formData.MRHDR[key];
      }
      return acc;
    }, {});

    const payload = {
      ChqDet: {
        ...filteredChqDet,
        ClearDt: formatDate(formData.ChqDet.ClearDt),
        Chqdt: formatDate(formData.ChqDet.Chqdt),
      },
      BillMRDET: {
        BillMRDET: transformedBills,
      },
      MRHDR: {
        ...filteredMRHDR,
        MRSDT: formatDate(formData.MRHDR.MRSDT),
        finclosedt: formatDate(formData.MRHDR.finclosedt),
        CompanyCode: String(userDetail.CompanyCode),
        MRSBR: userDetail.LocationCode,
        MRSTYPE: "1",
        EMRS_type: "MR",
        BankAcccode: formData.ChqDet.Acccode,
        MRSCHQNO: formData.ChqDet.Acccode,
        MRSCHQDT: formData.ChqDet.Chqdt,
        CustCd:billDetails[0]?.CustCd
      },
      MR_Location: formData.MR_Location || "1",
      FinYear: Finyear,
      EntryBy: userDetail.UserId,
      CompanyCode: String(userDetail.CompanyCode),
    };

    try {
      const response = await billGenerate(payload);

      if (response.status) {
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
    <div className="h-full">
      <button
        className="flex justify-start p-3 text-black lg:hidden text-xl"
        onClick={() => setIsSidebarOpen(true)}
      >
        <FontAwesomeIcon icon={faAlignLeft} />
      </button>
      <div className="bg-white p-8 rounded-lg shadow-lg space-y-6">
        <h4 className="text-xl text-center text-gray-800 font-bold">
          Bill Collection
        </h4>

        <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
          <h6 className="text-gray-700 text-xl font-semibold mb-6">
            You Selected
          </h6>
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex flex-col gap-4 md:flex-row md:gap-14">
                <div className="flex flex-col space-y-1">
                  <span className="text-gray-500 text-sm font-medium">
                    Customer Code and Name
                  </span>
                  <span className="text-base text-gray-800 font-semibold">
                  {`${billDetails[0]?.CustCd} - ${billDetails[0]?.CustName}`}
                  </span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-gray-500 text-sm font-medium">
                    Docket Booking Date Range
                  </span>
                  <span className="text-base text-gray-800 font-semibold">
                    {Fromdt} TO {Todt}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm space-y-6">
          <div className="border p-5 rounded-lg">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {[
                ["ManualMrsno", "MR Number", "text", true, "System Generated"],
                ["MRSBR", "MR branch", "select", true,"", dropdownData.Location],
                ["MRSDT", "MR Generation Date", "date", false],
                ["MRS_CLOSED", "Is Reconciled", "checkbox", false],
                ["Remarks", "Remarks", "textarea", false],
              ].map(([name, label, type, required, placeHolder, options], index) => (
                <div key={index} className={`flex items-center ${type === "textarea" ? "md:col-span-2" : ""}`}>
                  <label className={`text-gray-700 font-medium ${label.includes("Remarks") ? "lg:w-1/6" : ""} w-1/3 text-left`}>{label}</label>
                  {type === "select" ? (
                    <select
                      name={name}
                      value={formData.MRHDR[name] || ""}
                      onChange={(e) => handleInputChange(e, "MRHDR")}
                      className="bg-gray-100 border border-gray-300 p-2 rounded-md w-2/3 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      placeholder={placeHolder}
                    >
                      <option value="">Select {label}</option>
                      {options.map((option, idx) => (
                        <option key={idx} value={option.LocationCode}>
                          {option.LocationName}
                        </option>
                      ))}
                    </select>
                  ) : type === "textarea" ? (
                    <textarea
                      name={name}
                      value={formData.MRHDR[name] || ""}
                      onChange={(e) => handleInputChange(e, "MRHDR")}
                      className="bg-gray-100 border border-gray-300 p-2 rounded-md w-2/3 focus:outline-none focus:ring-2 focus:ring-gray-500 lg:w-5/6 resize-none"
                      rows="2"
                      placeholder={placeHolder}
                    />
                  ) : type === "checkbox" ? (
                    <input
                      type={type}
                      name={name}
                      checked={formData.MRHDR[name] || false}
                      onChange={(e) => handleInputChange(e, "MRHDR")}
                      className="border-gray-300 h-5 rounded text-blue-600 w-5 focus:ring-gray-500"
                    />
                  ) : (
                    <input
                      type={type}
                      name={name}
                      value={formData.MRHDR[name] || ""}
                      onChange={(e) => handleInputChange(e, "MRHDR")}
                      className="bg-gray-100 border border-gray-300 p-2 rounded-md w-2/3 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      placeholder={placeHolder}
                      disabled={name === "MRSBR" || name === "ManualMrsno"}
                      readOnly={name === "MRSBR" || name === "ManualMrsno"}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="border p-5 rounded-lg">
            <h5 className="flex justify-center text-lg font-semibold mb-2">List Of Bills:</h5>
            <div className="border shadow-md overflow-x-auto relative sm:rounded-lg">
              <table className="border border-gray-300 text-center text-gray-500 text-sm min-w-full rtl:text-right">
                <thead className="bg-gray-200 border-b-2 border-gray-400 text-gray-700 uppercase">
                  <tr className="border border-gray-300">
                    <th className="border border-gray-300 py-2">SR No</th>
                    {[
                      "Bill No",
                      "Bill Date",
                      "Bill Amt.",
                      "Pending Amt.",
                      // "Net Recd. Amount",
                    ].map((header, index) => (
                      <th key={index} className="border border-gray-300 px-2 py-2">
                        {header}
                      </th>
                    ))}
                    {formData.BillMRDET.BillMRDET[0]?.charges?.map((charge, index) => (
                      <th key={index} className="border border-gray-300 px-2 py-2">
                        {charge.description}
                      </th>
                    ))}
                    <th className="border border-gray-300 px-2 py-2">Balance Amount</th>
                    <th className="border border-gray-300 px-2 py-2">Net Recd. Amount</th>
                    <th className="border border-gray-300 px-2 py-2">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.BillMRDET.BillMRDET.map((bill, index) => (
                    <tr key={index} className="border border-gray-300">
                      <td className="border border-gray-300 px-1 py-2">{index + 1}</td>
                      <td className="border border-gray-300 px-1 py-2">{bill.BillNO}</td>
                      <td className="border border-gray-300 px-1 py-2">{bill.BGNDT}</td>
                      <td className="border border-gray-300 px-1 py-2">{bill.BILLAMT}</td>
                      <td className="border border-gray-300 px-1 py-2">{bill.PendAmt}</td>

                      {bill.charges?.map((charge, idx) => (
                        <td key={idx} className="border border-gray-300 px-1 py-2">
                          <input
                            type="number"
                            name={`CHG${idx + 1}`}
                            value={formData.BillMRDET.BillMRDET[index][`CHG${idx + 1}`] || ""}
                            onChange={(e) => handleBillInputChange(e, index, `CHG${idx + 1}`)}
                            className="bg-gray-100 border border-gray-300 p-1 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-gray-500"
                          />
                        </td>
                      ))}
                      <td className="border border-gray-300 px-1 py-2">
                        <input
                          type="number"
                          name="UNEXPDED"
                          value={formData.BillMRDET.BillMRDET[index].UNEXPDED || bill.UNEXPDED}
                          onChange={(e) => handleBillInputChange(e, index, "UNEXPDED")}
                          className="bg-gray-100 border border-gray-300 p-1 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-gray-500"
                        />
                      </td>
                      <td className="border border-gray-300 px-1 py-2">
                        <input
                          type="number"
                          name="NETAMT"
                          value={formData.BillMRDET.BillMRDET[index].NETAMT || bill.BILLAMT}
                          onChange={(e) => handleBillInputChange(e, index, "NETAMT")}
                          className="bg-gray-100 border border-gray-300 p-1 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-gray-500"
                        />
                      </td>
                      <td className="border border-gray-300 px-1 py-2">
                        <textarea
                          name="Remarks"
                          value={bill.Remarks || ""}
                          onChange={(e) => handleBillInputChange(e, index, "Remarks")}
                          className="bg-gray-100 border border-gray-300 p-1 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-gray-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="border p-5 rounded-lg">
            <h5 className="flex justify-center text-lg font-semibold mb-4">Collection Details</h5>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {[
                ["paymode", "Receipt Mode", "select", true, dropdownData.CPTYP],
                ["NETAMT", "Net Amount", "number", true],
                ["MRSCASH", "Cash Amount", "number", true],
                // ["BankAcccode", "Bank Account Code", "text", true],
              ].map(([name, label, type, isRequired, options], index) => (
                <div key={index} className="flex items-center">
                  <label className="text-gray-700 text-left w-1/3 font-medium">{label}</label>
                  {type === "select" ? (
                    <select
                      name={name}
                      value={formData.MRHDR[name] || ""}
                      onChange={(e) => handleInputChange(e, "MRHDR")}
                      className="bg-gray-100 border border-gray-300 p-2 rounded-md w-2/3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required={isRequired}
                    >
                      <option value="">Select {label}</option>
                      {options.map((option, idx) => (
                        <option key={idx} value={option.CodeId || option}>
                          {option.CodeDesc || option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={type}
                      name={name}
                      value={formData.MRHDR[name] || ""}
                      onChange={(e) => handleInputChange(e, "MRHDR")}
                      className={`p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none ${(name === "MRSCASH" && !isCashSelected) ||
                          (name !== "MRSCASH" && name !== "NETAMT" && isCashSelected)
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                        }`}
                      required={isRequired && ((name === "MRSCASH" && isCashSelected) || (name !== "MRSCASH" && !isCashSelected))}
                      disabled={
                        (name === "MRSCASH" && !isCashSelected) ||
                        (name !== "MRSCASH" && name !== "NETAMT" && isCashSelected)
                      }
                      readOnly={name === "NETAMT" || name === "MRSCASH"}
                    />
                  )}
                </div>
              ))}
              <div className="flex items-center">
                <label className="text-gray-700 text-left w-1/3 font-medium">Account</label>
                <select
                  name={"Acccode"}
                  value={formData.ChqDet.Acccode}
                  onChange={(e) => handleInputChange(e, "ChqDet")}
                  className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {(isCashSelected ? dropdownData.Cash : dropdownData.Bank)?.map((option, idx) => (
                    <option key={idx} value={option.Acccode}>
                      {option.Accdesc}
                    </option>
                  ))}
                </select>
              </div>
              {[
                // ["Acccode", "Account", "select", false, isCashSelected ? dropdownData.Cash : dropdownData.Bank],
                ["Chqno", "Cheque Number", "text", false],
                ["Chqdt", "Cheque Date", "date", false],
                // ["ClearDt", "Clear Date", "date", false],
                ["Chqamt", "Cheque Amount", "number", false],
                ["ColAmt", "Collection Amount", "number", false],
                // ["Banknm", "Bank Name", "text", false],
                // ["Diposited", "Deposited", "checkbox", false],
                // ["Onaccount", "On Account", "checkbox", false],
              ].map(([name, label, type, isRequired, options], index) => (
                <div key={index} className="flex items-center">
                  <label className="text-gray-700 text-left w-1/3 font-medium">{label}</label>
                  {type === "checkbox" ? (
                    <input
                      type={type}
                      name={name}
                      checked={formData.ChqDet[name] || false}
                      onChange={(e) => handleInputChange(e, "ChqDet")}
                      className={`h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-gray-500 ${isCashSelected ? "opacity-50 cursor-not-allowed" : ""} `}
                      required={isRequired && !isCashSelected}
                      disabled={isCashSelected}

                    />
                  ) : type === "date" ? (
                    <input
                      type="date"
                      name={name}
                      value={formData.ChqDet[name] || moment().format("YYYY-MM-DD")}
                      onChange={(e) => handleInputChange(e, "ChqDet")}
                      className={`p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none ${isCashSelected ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      required={isRequired && !isCashSelected}
                      disabled={isCashSelected}
                    />
                  ) : (
                    <input
                      type={type}
                      name={name}
                      value={formData.ChqDet[name] || ""}
                      onChange={(e) => handleInputChange(e, "ChqDet")}
                      className={`p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none ${isCashSelected ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      required={isRequired && !isCashSelected}
                      disabled={isCashSelected}
                      readOnly={name === "ColAmt" || name === "Chqamt"}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className={`bg-blue-600 rounded-lg text-white duration-200 hover:bg-blue-700 px-6 py-2 transition ${(loading || formData.MRHDR.NETAMT <= 0) ? 'opacity-50' : ''}`}
              disabled={loading || formData.MRHDR.NETAMT <= 0}
            >
              {loading ?
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg> :
                "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BillPaymentDetails;

// "use client";

// import { useRouter, useSearchParams } from "next/navigation";
// import { useEffect, useState } from "react";
// import { billGenerate, fetchDropdownData, fetchDropdownDatacity, getBillEntryPayment } from "@/lib/masterService";
// import { useAuth } from "../context/AuthContext";
// import { toast } from "react-toastify";
// import { faAlignLeft } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import moment from "moment";

// const BillPaymentDetails = () => {
//   const searchParams = useSearchParams();
//   const selectedBills = searchParams.get("selectedBill");
//   const Fromdt = searchParams.get("Fromdt");
//   const Todt = searchParams.get("Todt");
//   const router = useRouter();
//   const { setIsSidebarOpen, userDetail } = useAuth();

//   const [billDetails, setBillDetails] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [isCashSelected, setIsCashSelected] = useState(false);
//   const [dropdownData, setDropdownData] = useState({
//     CPTYP: [],
//     Cash: [],
//     Bank: [],
//     Location: [],
//   });
//   const Finyear = userDetail.FinancialYear;
//   const [formData, setFormData] = useState({
//     ChqDet: {
//       ClearDt: "",
//       Cleared: "",
//       Chqno: "",
//       Chqdt: moment().format("YYYY-MM-DD"),
//       Chqamt: "",
//       Banknm: "",
//       Bankbrn: "",
//       Ptmsptcd: "",
//       Ptmsptnm: "",
//       ColAmt: "",
//       brcd: "",
//       Acccode: "",
//       Onaccount: "",
//       Diposited: "",
//     },
//     BillMRDET: {
//       BillMRDET: [],
//     },
//     MRHDR: {
//       MRSDT: moment().format("YYYY-MM-DD"),
//       MRSTYPE: "",
//       EMRS_type: "",
//       MRSBR: userDetail.LocationCode,
//       PTCD: "",
//       PTMSNM: "",
//       MRSAMT: "",
//       NETAMT: "",
//       DEDUCTION: "",
//       MRSCASH: "",
//       MRSCHQ: "",
//       MRSCHQNO: "",
//       MRSCHQDT: "",
//       MRSBANK: "",
//       MRS_CLOSED: "",
//       DED_TDS: "",
//       MR_CANCEL: "",
//       BILLMR: "",
//       finclosedt: "",
//       paymode: "190",
//       BankAcccode: "",
//       BankAccdesc: "",
//       tdsacccode: "",
//       tdsaccdesc: "",
//       ManualMrsno: "",
//       CompanyCode: "",
//       extra_amount: "",
//       total_bill_amount: "",
//     },
//     MR_Location: "",
//     FinYear: "",
//     EntryBy: "",
//     CompanyCode: "",
//   });

//   // Fetch bill details when selectedBills changes
//   useEffect(() => {
//     if (selectedBills) {
//       fetchBillDetails();
//     } else {
//       router.push(`/bill-payment`);
//     }
//   }, [selectedBills]);

//   // Fetch dropdown data when userDetail.CompanyCode changes
//   useEffect(() => {
//     if (userDetail?.CompanyCode) {
//       Object.keys(dropdownData).forEach((key) => {
//         handleDropdownData(userDetail.CompanyCode, key);
//       });
//     }
//   }, [userDetail?.CompanyCode]);

//   // Reset fields when paymode changes
//   useEffect(() => {
//     const isCash = formData.MRHDR.paymode === "190";
//     setIsCashSelected(isCash);

//     setFormData((prev) => {
//       const baseUpdate = {
//         ...prev,
//         MRHDR: {
//           ...prev.MRHDR,
//           NETAMT: prev.MRHDR.NETAMT,
//           extra_amount: prev.MRHDR.extra_amount,
//           total_bill_amount: prev.MRHDR.total_bill_amount,
//         },
//       };

//       if (isCash) {
//         return {
//           ...baseUpdate,
//           ChqDet: {
//             ClearDt: "",
//             Cleared: "",
//             Chqno: "",
//             Chqdt: "",
//             Chqamt: "",
//             Banknm: "",
//             Bankbrn: "",
//             Ptmsptcd: "",
//             Ptmsptnm: "",
//             ColAmt: "",
//             brcd: "",
//             Acccode: dropdownData.Cash?.[0]?.Acccode || "",
//             Onaccount: "",
//             Diposited: "",
//           },
//           MRHDR: {
//             ...baseUpdate.MRHDR,
//             MRSCHQ: "",
//             MRSCHQNO: "",
//             MRSCHQDT: "",
//             MRSBANK: "",
//             BankAcccode: "",
//             MRSCASH: prev.MRHDR.NETAMT || "",
//           },
//         };
//       } else {
//         return {
//           ...baseUpdate,
//           MRHDR: {
//             ...baseUpdate.MRHDR,
//             MRSCASH: "",
//             MRSCHQ: prev.MRHDR.NETAMT || "",
//           },
//           ChqDet: {
//             ...prev.ChqDet,
//             Chqamt: prev.MRHDR.NETAMT || "",
//             ColAmt: prev.MRHDR.NETAMT || "",
//             ClearDt: prev.ChqDet.ClearDt,
//             Chqno: prev.ChqDet.Chqno,
//             Chqdt: prev.ChqDet.Chqdt,
//             Acccode: dropdownData.Bank?.[0]?.Acccode,
//           },
//         };
//       }
//     });
//   }, [formData.MRHDR.paymode, formData.MRHDR.NETAMT, dropdownData.Cash, dropdownData.Bank]);

//   // Calculate Net Amount, Total Bill Amount, and update Cash/Cheque Amount dynamically
//   useEffect(() => {
//     const calculateNetAmount = () => {
//       const updatedBills = formData.BillMRDET.BillMRDET.map((bill) => {
//         let netAmount = parseFloat(bill.PendAmt) || 0;

//         bill.charges?.forEach((charge, index) => {
//           const chargeValue = parseFloat(bill[`CHG${index + 1}`]) || 0;
//           netAmount = charge.sign === "+" ? netAmount + chargeValue : netAmount - chargeValue;
//         });

//         const balanceAmount = parseFloat(bill.UNEXPDED) || 0;
//         netAmount -= balanceAmount;

//         return {
//           ...bill,
//           NETAMT: netAmount.toFixed(2),
//         };
//       });

//       const totalBillAmount = updatedBills
//         .reduce((sum, bill) => sum + (parseFloat(bill.NETAMT) || 0), 0)
//         .toFixed(2);

//       setFormData((prev) => {
//         const billsChanged = updatedBills.some(
//           (bill, i) => bill.NETAMT !== prev.BillMRDET.BillMRDET[i]?.NETAMT
//         );
//         const totalChanged = totalBillAmount !== prev.MRHDR.total_bill_amount;

//         if (!billsChanged && !totalChanged) {
//           return prev;
//         }

//         const newState = {
//           ...prev,
//           BillMRDET: {
//             BillMRDET: updatedBills,
//           },
//           MRHDR: {
//             ...prev.MRHDR,
//             total_bill_amount: totalBillAmount,
//             NETAMT: prev.MRHDR.NETAMT || totalBillAmount,
//             extra_amount: prev.MRHDR.NETAMT
//               ? (parseFloat(prev.MRHDR.NETAMT) - parseFloat(totalBillAmount)).toFixed(2)
//               : "0.00",
//           },
//         };

//         if (prev.MRHDR.paymode === "190") {
//           newState.MRHDR.MRSCASH = prev.MRHDR.NETAMT || totalBillAmount;
//           newState.MRHDR.MRSCHQ = "";
//           newState.ChqDet = {
//             ...prev.ChqDet,
//             Chqamt: "",
//             ColAmt: "",
//           };
//         } else if (prev.MRHDR.paymode === "191") {
//           newState.MRHDR.MRSCHQ = prev.MRHDR.NETAMT || totalBillAmount;
//           newState.MRHDR.MRSCASH = "";
//           newState.ChqDet = {
//             ...prev.ChqDet,
//             ColAmt: prev.MRHDR.NETAMT || totalBillAmount,
//             Chqamt: prev.MRHDR.NETAMT || totalBillAmount,
//           };
//         }

//         return newState;
//       });
//     };

//     if (formData.BillMRDET.BillMRDET.length > 0) {
//       calculateNetAmount();
//     }
//   }, [
//     formData.BillMRDET.BillMRDET.map((bill) =>
//       [
//         bill.PendAmt,
//         ...bill.charges?.map((_, i) => bill[`CHG${i + 1}`]),
//         bill.UNEXPDED,
//       ].join("|")
//     ).join(","),
//     formData.MRHDR.paymode,
//     formData.MRHDR.NETAMT,
//   ]);

//   const handleDropdownData = async (CompanyCode, MstCode) => {
//     try {
//       if (userDetail.CompanyCode && isCashSelected) {
//         const data = await fetchDropdownData(CompanyCode, MstCode);
//         setDropdownData((prev) => ({
//           ...prev,
//           [MstCode]: data,
//         }));
//       } else if (userDetail.CompanyCode && !isCashSelected) {
//         const data = await fetchDropdownDatacity(CompanyCode, MstCode, userDetail.LocationCode);
//         setDropdownData((prev) => ({
//           ...prev,
//           [MstCode]: data,
//         }));
//       }
//     } catch (error) {
//       console.log(`Error fetching ${MstCode}:`, error);
//     }
//   };

//   const fetchBillDetails = async () => {
//     setLoading(true);
//     try {
//       const data = await getBillEntryPayment(selectedBills);
//       setBillDetails(data);

//       const parsedBills = data.map((bill) => {
//         const charges = bill.CHGCODE.split("*/")
//           .map((charge) => {
//             const [code, description, isActive, sign] = charge.split("~");
//             const calculatedSign = description.includes("(+)") ? "+" : "-";
//             return { code, description, isActive, sign: calculatedSign };
//           })
//           .filter((charge) => charge.isActive === "Y");

//         let netAmount = parseFloat(bill.BILLAMT) || 0;

//         charges.forEach((charge, index) => {
//           const chargeValue = parseFloat(bill[`CHG${index + 1}`]) || 0;
//           if (charge.sign === "+") {
//             netAmount += chargeValue;
//           } else if (charge.sign === "-") {
//             netAmount -= chargeValue;
//           }
//         });

//         const balanceAmount = parseFloat(bill.UNEXPDED) || 0;
//         netAmount -= balanceAmount;

//         bill.NETAMT = netAmount.toFixed(2);

//         return {
//           ...bill,
//           charges,
//           NetRecdAmount: netAmount.toFixed(2),
//         };
//       });

//       setFormData((prev) => ({
//         ...prev,
//         BillMRDET: {
//           BillMRDET: parsedBills.map((bill) => ({
//             BillNO: bill.BillNO || "",
//             CustCd: bill.CustCd || "",
//             BGNDT: bill.BGNDT || "",
//             BILLAMT: bill.BILLAMT || "",
//             PendAmt: bill.PendAmt || "",
//             TOTBILL: "",
//             TDSDED: "",
//             NETAMT: bill.NetRecdAmount || "",
//             UNEXPDED: bill.UNEXPDED || "0.00",
//             DOCNO: "",
//             CHG1: "",
//             CHG2: "",
//             CHG3: "",
//             CHG4: "",
//             CHG5: "",
//             CHG6: "",
//             CHG7: "",
//             CHG8: "",
//             CHG9: "",
//             CHG10: "",
//             Remarks: "",
//             charges: bill.charges,
//           })),
//         },
//       }));
//     } catch (err) {
//       setError(err.message || "Failed to fetch bill details");
//       toast.error("Failed to fetch bill details. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleInputChange = (e, section) => {
//     const { name, value, type } = e.target;

//     if (name === "NETAMT" && section === "MRHDR") {
//       // Normalize input value to avoid whitespace issues
//       const normalizedValue = value.trim();

//       // Validate input
//       if (normalizedValue !== "" && (isNaN(normalizedValue) || parseFloat(normalizedValue) < 0)) {
//         toast.error("Net Amount must be a positive number.");
//         return;
//       }

//       setFormData((prev) => {
//         const totalNetAmount = normalizedValue; // Store as string
//         const totalBillAmount = parseFloat(prev.MRHDR.total_bill_amount) || 0;
//         const extraAmount = normalizedValue ? (parseFloat(normalizedValue) - totalBillAmount).toFixed(2) : "0.00";

//         // If input is empty, reset NETAMT and related fields
//         if (normalizedValue === "") {
//           const updatedBills = prev.BillMRDET.BillMRDET.map((bill) => ({
//             ...bill,
//             NETAMT: "0.00",
//             UNEXPDED: bill.PendAmt || "0.00",
//           }));

//           return {
//             ...prev,
//             MRHDR: {
//               ...prev.MRHDR,
//               NETAMT: "",
//               extra_amount: "0.00",
//               MRSCASH: "",
//               MRSCHQ: "",
//             },
//             BillMRDET: {
//               BillMRDET: updatedBills,
//             },
//             ChqDet: {
//               ...prev.ChqDet,
//               Chqamt: "",
//               ColAmt: "",
//             },
//           };
//         }

//         // Parse for calculations
//         const parsedTotalNetAmount = parseFloat(normalizedValue) || 0;

//         // Distribute NETAMT across bills
//         let remainingAmount = parsedTotalNetAmount;
//         const updatedBills = prev.BillMRDET.BillMRDET.map((bill) => {
//           const pendAmt = parseFloat(bill.PendAmt) || 0;
//           let chargeTotal = 0;
//           bill.charges?.forEach((charge, index) => {
//             const chargeValue = parseFloat(bill[`CHG${index + 1}`]) || 0;
//             chargeTotal += charge.sign === "+" ? chargeValue : -chargeValue;
//           });
//           const effectivePendAmt = pendAmt + chargeTotal;

//           let netAmount = 0;
//           let unexpded = effectivePendAmt;

//           if (remainingAmount >= effectivePendAmt) {
//             netAmount = effectivePendAmt;
//             unexpded = 0;
//             remainingAmount -= effectivePendAmt;
//           } else {
//             netAmount = remainingAmount;
//             unexpded = effectivePendAmt - remainingAmount;
//             remainingAmount = 0;
//           }

//           return {
//             ...bill,
//             NETAMT: netAmount.toFixed(2),
//             UNEXPDED: unexpded.toFixed(2),
//           };
//         });

//         const newState = {
//           ...prev,
//           MRHDR: {
//             ...prev.MRHDR,
//             NETAMT: totalNetAmount,
//             extra_amount: extraAmount,
//             MRSCASH: prev.MRHDR.paymode === "190" ? totalNetAmount : "",
//             MRSCHQ: prev.MRHDR.paymode === "191" ? totalNetAmount : "",
//           },
//           BillMRDET: {
//             BillMRDET: updatedBills,
//           },
//           ChqDet: {
//             ...prev.ChqDet,
//             Chqamt: prev.MRHDR.paymode === "191" ? totalNetAmount : "",
//             ColAmt: prev.MRHDR.paymode === "191" ? totalNetAmount : "",
//           },
//         };

//         return newState;
//       });
//     } else {
//       setFormData((prev, type) => ({
//         ...prev,
//         [section]: {
//           ...prev[section],
//           [name]: type === "checkbox" ? checked : value,
//         },
//       }));
//       if (name === "paymode" && section === "MRHDR") {
//         setIsCashSelected(value === "190");
//       }
//     }
//   };

//   const handleBillInputChange = (e, index, name) => {
//     const { value } = e.target;

//     setFormData((prev) => {
//       const updatedBills = [...prev.BillMRDET.BillMRDET];
//       updatedBills[index][name] = value;

//       const bill = updatedBills[index];
//       let netAmount = parseFloat(bill.PendAmt) || 0;

//       bill.charges?.forEach((charge, chargeIndex) => {
//         const chargeValue = parseFloat(bill[`CHG${chargeIndex + 1}`]) || 0;
//         netAmount += charge.sign === "+" ? chargeValue : -chargeValue;
//       });

//       const balanceAmount = parseFloat(bill.UNEXPDED) || 0;
//       netAmount -= balanceAmount;

//       updatedBills[index].NETAMT = netAmount.toFixed(2);

//       const totalBillAmount = updatedBills
//         .reduce((sum, bill) => sum + (parseFloat(bill.NETAMT) || 0), 0)
//         .toFixed(2);

//       return {
//         ...prev,
//         BillMRDET: {
//           BillMRDET: updatedBills,
//         },
//         MRHDR: {
//           ...prev.MRHDR,
//           total_bill_amount: totalBillAmount,
//           extra_amount: prev.MRHDR.NETAMT
//             ? (parseFloat(prev.MRHDR.NETAMT) - parseFloat(totalBillAmount)).toFixed(2)
//             : "0.00",
//         },
//       };
//     });
//   };

//   const formatDate = (inputDate) => {
//     if (!inputDate) return "";
//     const date = new Date(inputDate);
//     return date.toLocaleDateString("en-GB", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     const netAmount = parseFloat(formData.MRHDR.NETAMT);
//     if (isNaN(netAmount) || netAmount <= 0) {
//       toast.error("Net Amount must be a valid positive number.");
//       setLoading(false);
//       return;
//     }

//     const transformedBills = formData.BillMRDET.BillMRDET.map((bill) => ({
//       TOTBILL: String(bill.TOTBILL) || "0.00",
//       TDSDED: bill.TDSDED || "0.00",
//       NETAMT: String(bill.NETAMT) || "0.00",
//       UNEXPDED: String(bill.UNEXPDED) || "0.00",
//       DOCNO: bill.BillNO || "",
//       CHG1: bill.CHG1 || "0.00",
//       CHG2: bill.CHG2 || "0.00",
//       CHG3: bill.CHG3 || "0.00",
//       CHG4: bill.CHG4 || "0.00",
//       CHG5: bill.CHG5 || "0.00",
//       CHG6: bill.CHG6 || "0.00",
//       CHG7: bill.CHG7 || "0.00",
//       CHG8: bill.CHG8 || "0.00",
//       CHG9: bill.CHG9 || "0.00",
//       CHG10: bill.CHG10 || "0.00",
//       Remarks: bill.Remarks || "",
//     }));

//     const filteredChqDet = Object.keys(formData.ChqDet).reduce((acc, key) => {
//       if (formData.ChqDet[key] !== undefined && formData.ChqDet[key] !== "") {
//         acc[key] = formData.ChqDet[key];
//       }
//       return acc;
//     }, {});

//     const filteredMRHDR = Object.keys(formData.MRHDR).reduce((acc, key) => {
//       if (formData.MRHDR[key] !== undefined && formData.MRHDR[key] !== "") {
//         acc[key] = formData.MRHDR[key];
//       }
//       return acc;
//     }, {});

//     const payload = {
//       ChqDet: {
//         ...filteredChqDet,
//         ClearDt: formatDate(formData.ChqDet.ClearDt),
//         Chqdt: formatDate(formData.ChqDet.Chqdt),
//       },
//       BillMRDET: {
//         BillMRDET: transformedBills,
//       },
//       MRHDR: {
//         ...filteredMRHDR,
//         MRSDT: formatDate(formData.MRHDR.MRSDT),
//         finclosedt: formatDate(formData.MRHDR.finclosedt),
//         CompanyCode: String(userDetail.CompanyCode),
//         MRSBR: userDetail.LocationCode,
//         MRSTYPE: "1",
//         EMRS_type: "MR",
//         BankAcccode: formData.ChqDet.Acccode,
//         MRSCHQNO: formData.ChqDet.Acccode,
//         MRSCHQDT: formData.ChqDet.Chqdt,
//         CustCd: billDetails[0]?.CustCd,
//         extra_amount: formData.MRHDR.extra_amount,
//         total_bill_amount: formData.MRHDR.total_bill_amount,
//       },
//       MR_Location: formData.MR_Location || "1",
//       FinYear: Finyear,
//       EntryBy: userDetail.UserId,
//       CompanyCode: String(userDetail.CompanyCode),
//     };
//     console.log(payload, " payload");

//     try {
//       const response = await billGenerate(payload);

//       if (response.status) {
//         toast.success("Bill generated successfully!");
//         router.push("/bill-payment");
//       } else {
//         toast.error("Failed to generate bill. Please try again.");
//       }
//     } catch (err) {
//       toast.error("An error occurred while generating the bill.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="h-full">
//       <button
//         className="flex justify-start p-3 text-black lg:hidden text-xl"
//         onClick={() => setIsSidebarOpen(true)}
//       >
//         <FontAwesomeIcon icon={faAlignLeft} />
//       </button>
//       <div className="bg-white p-8 rounded-lg shadow-lg space-y-6">
//         <h4 className="text-xl text-center text-gray-800 font-bold">
//           Bill Collection
//         </h4>

//         <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
//           <h6 className="text-gray-700 text-xl font-semibold mb-6">
//             You Selected
//           </h6>
//           <div className="space-y-6">
//             <div className="space-y-4">
//               <div className="flex flex-col gap-4 md:flex-row md:gap-14">
//                 <div className="flex flex-col space-y-1">
//                   <span className="text-gray-500 text-sm font-medium">
//                     Customer Code and Name
//                   </span>
//                   <span className="text-base text-gray-800 font-semibold">
//                     {`${billDetails[0]?.CustCd} - ${billDetails[0]?.CustName}`}
//                   </span>
//                 </div>
//                 <div className="flex flex-col space-y-1">
//                   <span className="text-gray-500 text-sm font-medium">
//                     Docket Booking Date Range
//                   </span>
//                   <span className="text-base text-gray-800 font-semibold">
//                     {Fromdt} TO {Todt}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <form onSubmit={handleSubmit} className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm space-y-6">
//           <div className="border p-5 rounded-lg">
//             <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//               {[
//                 ["ManualMrsno", "MR Number", "text", true, "System Generated"],
//                 ["MRSBR", "MR branch", "select", true, "", dropdownData.Location],
//                 ["MRSDT", "MR Generation Date", "date", false],
//                 ["MRS_CLOSED", "Is Reconciled", "checkbox", false],
//                 ["Remarks", "Remarks", "textarea", false],
//               ].map(([name, label, type, required, placeHolder, options], index) => (
//                 <div key={index} className={`flex items-center ${type === "textarea" ? "md:col-span-2" : ""}`}>
//                   <label className={`text-gray-700 font-medium ${label.includes("Remarks") ? "lg:w-1/6" : ""} w-1/3 text-left`}>{label}</label>
//                   {type === "select" ? (
//                     <select
//                       name={name}
//                       value={formData.MRHDR[name] || ""}
//                       onChange={(e) => handleInputChange(e, "MRHDR")}
//                       className="bg-gray-100 border border-gray-300 p-2 rounded-md w-2/3 focus:outline-none focus:ring-2 focus:ring-gray-500"
//                       placeholder={placeHolder}
//                     >
//                       <option value="">Select {label}</option>
//                       {options?.map((option, idx) => (
//                         <option key={idx} value={option.LocationCode}>
//                           {option.LocationName}
//                         </option>
//                       ))}
//                     </select>
//                   ) : type === "textarea" ? (
//                     <textarea
//                       name={name}
//                       value={formData.MRHDR[name] || ""}
//                       onChange={(e) => handleInputChange(e, "MRHDR")}
//                       className="bg-gray-100 border border-gray-300 p-2 rounded-md w-2/3 focus:outline-none focus:ring-2 focus:ring-gray-500 lg:w-5/6 resize-none"
//                       rows="2"
//                       placeholder={placeHolder}
//                     />
//                   ) : type === "checkbox" ? (
//                     <input
//                       type={type}
//                       name={name}
//                       checked={formData.MRHDR[name] || false}
//                       onChange={(e) => handleInputChange(e, "MRHDR")}
//                       className="border-gray-300 h-5 rounded text-blue-600 w-5 focus:ring-gray-500"
//                     />
//                   ) : (
//                     <input
//                       type={type}
//                       name={name}
//                       value={formData.MRHDR[name] || ""}
//                       onChange={(e) => handleInputChange(e, "MRHDR")}
//                       className="bg-gray-100 border border-gray-300 p-2 rounded-md w-2/3 focus:outline-none focus:ring-2 focus:ring-gray-500"
//                       placeholder={placeHolder}
//                       disabled={name === "MRSBR" || name === "ManualMrsno"}
//                       readOnly={name === "MRSBR" || name === "ManualMrsno"}
//                     />
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div className="border p-5 rounded-lg">
//             <h5 className="flex justify-center text-lg font-semibold mb-2">List Of Bills:</h5>
//             <div className="border shadow-md overflow-x-auto relative sm:rounded-lg">
//               <table className="border border-gray-300 text-center text-gray-500 text-sm min-w-full rtl:text-right">
//                 <thead className="bg-gray-200 border-b-2 border-gray-400 text-gray-700 uppercase">
//                   <tr className="border border-gray-300">
//                     <th className="border border-gray-300 py-2">SR No</th>
//                     {[
//                       "Bill No",
//                       "Bill Date",
//                       "Bill Amt.",
//                       "Pending Amt.",
//                     ].map((header, index) => (
//                       <th key={index} className="border border-gray-300 px-2 py-2">
//                         {header}
//                       </th>
//                     ))}
//                     {formData.BillMRDET.BillMRDET[0]?.charges?.map((charge, index) => (
//                       <th key={index} className="border border-gray-300 px-2 py-2">
//                         {charge.description}
//                       </th>
//                     ))}
//                     <th className="border border-gray-300 px-2 py-2">Balance Amount</th>
//                     <th className="border border-gray-300 px-2 py-2">Net Recd. Amount</th>
//                     <th className="border border-gray-300 px-2 py-2">Remarks</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {formData.BillMRDET.BillMRDET.map((bill, index) => (
//                     <tr key={index} className="border border-gray-300">
//                       <td className="border border-gray-300 px-1 py-2">{index + 1}</td>
//                       <td className="border border-gray-300 px-1 py-2">{bill.BillNO}</td>
//                       <td className="border border-gray-300 px-1 py-2">{bill.BGNDT}</td>
//                       <td className="border border-gray-300 px-1 py-2">{bill.BILLAMT}</td>
//                       <td className="border border-gray-300 px-1 py-2">{bill.PendAmt}</td>
//                       {bill.charges?.map((charge, idx) => (
//                         <td key={idx} className="border border-gray-300 px-1 py-2">
//                           <input
//                             type="number"
//                             name={`CHG${idx + 1}`}
//                             value={formData.BillMRDET.BillMRDET[index][`CHG${idx + 1}`] || ""}
//                             onChange={(e) => handleBillInputChange(e, index, `CHG${idx + 1}`)}
//                             className="bg-gray-100 border border-gray-300 p-1 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-gray-500"
//                           />
//                         </td>
//                       ))}
//                       <td className="border border-gray-300 px-1 py-2">
//                         <input
//                           type="number"
//                           name="UNEXPDED"
//                           value={formData.BillMRDET.BillMRDET[index].UNEXPDED || ""}
//                           onChange={(e) => handleBillInputChange(e, index, "UNEXPDED")}
//                           className="bg-gray-100 border border-gray-300 p-1 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-gray-500"
//                         />
//                       </td>
//                       <td className="border border-gray-300 px-1 py-2">
//                         <input
//                           type="number"
//                           name="NETAMT"
//                           value={formData.BillMRDET.BillMRDET[index].NETAMT || ""}
//                           onChange={(e) => handleBillInputChange(e, index, "NETAMT")}
//                           className="bg-gray-100 border border-gray-300 p-1 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-gray-500"
//                           readOnly
//                         />
//                       </td>
//                       <td className="border border-gray-300 px-1 py-2">
//                         <textarea
//                           name="Remarks"
//                           value={bill.Remarks || ""}
//                           onChange={(e) => handleBillInputChange(e, index, "Remarks")}
//                           className="bg-gray-100 border border-gray-300 p-1 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-gray-500"
//                         />
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//           <div className="border p-5 rounded-lg">
//             <h5 className="flex justify-center text-lg font-semibold mb-4">Collection Details</h5>
//             <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//               {[
//                 ["paymode", "Receipt Mode", "select", true, dropdownData.CPTYP],
//                 ["NETAMT", "Net Amount", "text", true],
//                 ["total_bill_amount", "Total Bill Amount", "number", true],
//                 ["extra_amount", "Extra Amount", "number", false],
//                 ["MRSCASH", "Cash Amount", "number", isCashSelected],
//               ].map(([name, label, type, isRequired, options], index) => (
//                 <div key={index} className="flex items-center">
//                   <label className="text-gray-700 text-left w-1/3 font-medium">{label}</label>
//                   {type === "select" ? (
//                     <select
//                       name={name}
//                       value={formData.MRHDR[name] || ""}
//                       onChange={(e) => handleInputChange(e, "MRHDR")}
//                       className="bg-gray-100 border border-gray-300 p-2 rounded-md w-2/3 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       required={isRequired}
//                     >
//                       <option value="">Select {label}</option>
//                       {options?.map((option, idx) => (
//                         <option key={idx} value={option.CodeId || option}>
//                           {option.CodeDesc || option}
//                         </option>
//                       ))}
//                     </select>
//                   ) : (
//                     <input
//                       type={type}
//                       name={name}
//                       value={formData.MRHDR[name] || ""}
//                       onChange={(e) => handleInputChange(e, "MRHDR")}
//                       className={`p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none ${(name === "MRSCASH" && !isCashSelected) ||
//                           (name === "total_bill_amount") ||
//                           (name === "extra_amount")
//                           ? "opacity-50 cursor-not-allowed"
//                           : ""
//                         }`}
//                       required={isRequired}
//                       disabled={
//                         (name === "MRSCASH" && !isCashSelected) ||
//                         name === "total_bill_amount" ||
//                         name === "extra_amount"
//                       }
//                       readOnly={name === "total_bill_amount" || name === "extra_amount"}
//                     />
//                   )}
//                 </div>
//               ))}
//               <div className="flex items-center">
//                 <label className="text-gray-700 text-left w-1/3 font-medium">Account</label>
//                 <select
//                   name="Acccode"
//                   value={formData.ChqDet.Acccode || ""}
//                   onChange={(e) => handleInputChange(e, "ChqDet")}
//                   className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                 >
//                   <option value="">Select Account</option>
//                   {(isCashSelected ? dropdownData.Cash : dropdownData.Bank)?.map((option, idx) => (
//                     <option key={idx} value={option.Acccode}>
//                       {option.Accdesc}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               {[
//                 ["Chqno", "Cheque Number", "text", false],
//                 ["Chqdt", "Cheque Date", "date", false],
//                 ["Chqamt", "Cheque Amount", "number", false],
//                 ["ColAmt", "Collection Amount", "number", false],
//               ].map(([name, label, type, isRequired], index) => (
//                 <div key={index} className="flex items-center">
//                   <label className="text-gray-700 text-left w-1/3 font-medium">{label}</label>
//                   <input
//                     type={type}
//                     name={name}
//                     value={formData.ChqDet[name] || ""}
//                     onChange={(e) => handleInputChange(e, "ChqDet")}
//                     className={`p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none ${isCashSelected ? "opacity-50 cursor-not-allowed" : ""
//                       }`}
//                     required={isRequired && !isCashSelected}
//                     disabled={isCashSelected}
//                     readOnly={name === "ColAmt" || name === "Chqamt"}
//                   />
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div className="flex justify-end">
//             <button
//               type="submit"
//               className={`bg-blue-600 rounded-lg text-white duration-200 hover:bg-blue-700 px-6 py-2 transition ${loading || !formData.MRHDR.NETAMT || parseFloat(formData.MRHDR.NETAMT) <= 0 ? "opacity-50" : ""
//                 }`}
//               disabled={loading || !formData.MRHDR.NETAMT || parseFloat(formData.MRHDR.NETAMT) <= 0}
//             >
//               {loading ? (
//                 <svg
//                   className="animate-spin h-5 w-5 text-white"
//                   xmlns="http://www.w3.org/2000/svg"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                 >
//                   <circle
//                     className="opacity-25"
//                     cx="12"
//                     cy="12"
//                     r="10"
//                     stroke="currentColor"
//                     strokeWidth="4"
//                   ></circle>
//                   <path
//                     className="opacity-75"
//                     fill="currentColor"
//                     d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                   ></path>
//                 </svg>
//               ) : (
//                 "Submit"
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default BillPaymentDetails;