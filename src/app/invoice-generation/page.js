"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  addInvoice,
  fetchDropdownData,
  Finyear,
  USPInvoiceCustItemLocationChanged,
  USPITEMWiseTaxDetails,
  USPSearchInvoiceItem,
} from "@/lib/masterService";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAlignLeft, faTrash } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const InvoiceMaster = () => {
  const { setIsSidebarOpen, userDetail } = useAuth();
  const [dropdownVisibility, setDropdownVisibility] = useState({});
  const initialState = {
    InvMst: {
      BGNDT: moment().format("YYYY-MM-DD"), // Set today's date
      RefDt: moment().format("YYYY-MM-DD"), // Set today's date
      DueDT: moment().format("YYYY-MM-DD"), // Set today's date
    },
    Invdet: {
      Invdet: [
        {
          ICode: "",
          QTY: 0,
          DelQty: 0,
          OthAmt: 0,
          NetPrice: 0,
          CHG1: 0,
          CHG2: 0,
          CHG3: 0,
          CHG4: 0,
          CHG5: 0,
          NetAmt: 0,
        },
      ],
    },
  };
  const [formData, setFormData] = useState(initialState);
  const [isBlacklisted, setIsBlacklisted] = useState(true);
  const [disableFields, setDisableFields] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [dropdownData, setDropdownData] = useState({
    Customer: [],
    BillType: [],
    TAX: [],
    Price: [],
    Location: [],
  });
  const [enabledCharges, setEnabledCharges] = useState([]);
  const [itemNameMap, setItemNameMap] = useState({});

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
      }
    } catch (error) {
      console.error(`Error fetching ${MstCode}:`, error);
    }
  };

  const parseChargesDetails = (chargesString) => {
    const chargesArray = chargesString.split("*/"); // Split by the main delimiter
    const enabledCharges = [];

    chargesArray.forEach((charge, index) => {
      const parts = charge.split("~"); // Split by '~'
      if (parts.length >= 3) {
        // Ensure there are enough parts
        const isEnabled = parts[2]; // Enabled status (Y or N)
        if (isEnabled === "Y") {
          enabledCharges.push({
            key: `CHG${index + 1}`, // Create keys like CHG1, CHG2, etc.
            name: parts[1], // Charge name (e.g., CGST(%), SGST(%), etc.)
          });
        }
      }
    });

    return enabledCharges;
  };

  const fetchCustomerDetails = async (customerCode) => {
    try {
      const response = await USPInvoiceCustItemLocationChanged({
        CustCd: customerCode,
      });

      if (response.status) {
        const customerData = response.data;

        // ✅ Check if blacklisted
        if (customerData.IsBlackList === "1") {
          Swal.fire({
            icon: "error",
            title: "Blacklisted Customer",
            text: "The Same Customer has been declared as Black Listed",
            confirmButtonText: "OK",
            confirmButtonColor: "#d33",
          });
          setIsBlacklisted(true); // 🚫 Mark as blacklisted
          setFormData(initialState); // ❌ Clear form data
          setDisableFields(false);
          return; // Exit the function
        } else {
          setIsBlacklisted(false); // ✅ Not blacklisted
          setDisableFields(true);
        }

        // Parse ChargesDetails and set enabled charges
        const enabledCharges = parseChargesDetails(customerData.ChargesDetails);
        setEnabledCharges(enabledCharges); // Store enabled charges in state

        // ✅ Update formData for non-blacklisted customers
        setFormData((prev) => ({
          ...prev,
          InvMst: {
            ...prev.InvMst,
            Dely_Address: customerData.Dely_Address || "",
            OverDuePer: customerData.Overdue_Interest || "",
            PriceType: customerData.PriceType || "",
            BillType: customerData.CustCat || "",
            TaxType: customerData.CodeID || "",
            DueDays: customerData.CRDAYS || "",
          },
        }));

      } else {
        toast.error("Failed to fetch customer location data.");
      }
    } catch (error) {
      console.error("Error fetching customer details:", error);
    }
  };

  const fetchItemDetails = async (prefixText, index) => {
    try {
      if (prefixText) {
        const itemDetails = await USPSearchInvoiceItem({ prefixText });
        setSearchResults(itemDetails.data); // Assuming itemDetails is an array of items
        setDropdownVisibility((prev) => ({ ...prev, [index]: true })); 
      }
    } catch (error) {
      console.error("Error fetching item details:", error);
    }
  };

  const handleItemSelect = async (itemCode, itemName, index) => {
    try {
      // Hide the dropdown for this row
      setDropdownVisibility((prev) => ({ ...prev, [index]: false }));
  
      // Update the item name map
      setItemNameMap((prev) => ({
        ...prev,
        [index]: itemName, // Store the item name for this row
      }));
  
      // Update formData with the selected item code
      setFormData((prev) => {
        const newData = { ...prev };
        newData.Invdet.Invdet[index].ICode = itemCode; // Store the item code in the payload
        return newData;
      });
  
      // Fetch tax details and update the form (existing logic)
      const taxDetails = await USPITEMWiseTaxDetails({
        itemCode,
        taxType: formData.InvMst.TaxType,
        priceType: formData.InvMst.PriceType,
      });
  
      if (!taxDetails) {
        console.log("No tax details found for the selected item.");
        toast.error("No tax details found for the selected item.");
        return;
      }
  
      // Parse CHGCODE, CHGColumns, and priceColumns
      const chgCodes = taxDetails.CHGCODE.split("*/");
      const chgColumns = taxDetails.CHGColumns.split("*/");
      const priceColumns = taxDetails.priceColumns.split("*/");
  
      // Extract enabled charges and their values
      const enabledCharges = chgCodes
        .map((code, idx) => {
          const [chgKey, chgName, isEnabled, sign] = code.split("~");
          if (isEnabled === "Y") {
            return {
              key: `CHG${idx + 1}`,
              name: chgName,
              value: parseFloat(chgColumns[idx]),
              sign: sign,
            };
          }
          return null;
        })
        .filter(Boolean);
  
      // Set enabled charges in state
      setEnabledCharges(enabledCharges);
  
      // Update formData with tax details, price, and discount
      setFormData((prev) => {
        const newData = { ...prev };
        newData.Invdet.Invdet[index] = {
          ...newData.Invdet.Invdet[index],
          Price: parseFloat(priceColumns[0]),
          Discount: parseFloat(priceColumns[1]),
          ...enabledCharges.reduce((acc, charge) => {
            acc[charge.key] = charge.value;
            return acc;
          }, {}),
        };
        return newData;
      });
    } catch (error) {
      console.error("An error occurred while handling item selection:", error);
    }
  };

  const handleInputChange = (e, section = "InvMst", index = 0) => {
    const { name, value, type, checked } = e.target;
    const updatedValue = type === "checkbox" ? checked : value;

    setFormData((prev) => {
      const newData = { ...prev };
      if (section === "InvMst") {
        newData.InvMst[name] = updatedValue;

        // Call the API when CustCd changes
        if (name === "CustCd") {
          if(updatedValue){
            fetchCustomerDetails(updatedValue);
          }else{
            setFormData(initialState);
            setDisableFields(false)
          }       
        }
      } else if (section === "Invdet") {
        newData.Invdet.Invdet[index][name] = updatedValue;
        if (name === "ICode") {
          fetchItemDetails(updatedValue, index);
        }
      }
      return newData;
    });
  };

  const handleAddInvoiceDetail = () => {
    setFormData((prev) => ({
      ...prev,
      Invdet: {
        Invdet: [
          ...prev.Invdet.Invdet,
          initialState.Invdet.Invdet[0],
        ],
      },
    }));
  };

  const handleRemoveInvoiceDetail = (index) => {
    setFormData((prev) => ({
      ...prev,
      Invdet: {
        Invdet: prev.Invdet.Invdet.filter((_, i) => i !== index),
      },
    }));
  };

  const calculateTotalNetAmt = () => {
    return formData.Invdet.Invdet.reduce((total, Bill) => {
      const qty = Number(Bill.QTY) || 0;
      const price = Number(Bill.Price) || 0;
      const discount = Number(Bill.Discount) || 0;
      const netPrice = (price - discount) * qty; // Consistent with tbody
      const othAmt = Number(Bill.OthAmt) || 0;
      const chgValues = enabledCharges.map((charge) => {
        const chargeValue = Number(Bill[charge.key]) || 0;
        const calculatedValue = netPrice * (chargeValue / 100); // Consistent with tbody
        return charge.sign === "+" ? calculatedValue : -calculatedValue;
      });
      return total + (netPrice + othAmt + chgValues.reduce((sum, chg) => sum + chg, 0));
    }, 0);
  };

  // const handleAddSubmit = async (e) => {
  //   e.preventDefault();
  
  //   // Define which fields should be numbers
  //   const numberFields = [
  //     "DueDays",
  //     "OverDuePer",
  //     "BillAmt",
  //     "QTY",
  //     "DelQty",
  //     "OthAmt",
  //     "NetPrice",
  //     "CHG1",
  //     "CHG2",
  //     "CHG3",
  //     "CHG4",
  //     "CHG5",
  //     "NetAmt",
  //   ];
  
  //   // Create a deep copy of the formData to avoid mutating the original state
  //   const payload = JSON.parse(JSON.stringify(formData));
  
  //   // Convert number fields to numbers
  //   Object.keys(payload.InvMst).forEach((key) => {
  //     if (numberFields.includes(key)) {
  //       payload.InvMst[key] = Number(payload.InvMst[key]);
  //     }
  //   });
  
  //   payload.Invdet.Invdet.forEach((detail) => {
  //     Object.keys(detail).forEach((key) => {
  //       if (numberFields.includes(key)) {
  //         detail[key] = Number(detail[key]);
  //       }
  //     });
  //   });
  
  //   // Add additional fields to the payload
  //   payload.CompanyCode = userDetail.CompanyCode;
  //   payload.Finyear = Finyear;
  //   payload.Billno = "";
  //   payload.Brcd = "2";
  
  //   // Set BillAmt to the calculated Total NetAmt
  //   payload.InvMst.BillAmt = calculateTotalNetAmt();
  
    
  //   try {
  //     const response = await addInvoice(payload);
  //     console.log("API Response:", response);
  
  //     if (response.status) {
  //       toast.success(response.message);
  //       setFormData(initialState);
  //     } else {
  //       toast.error(response.data.message || "An error occurred while processing your request.");
  //     }
  //   } catch (error) {
  //     toast.error("An unexpected error occurred. Please try again.");
  //   }
  // };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
  
    // Define which fields should be numbers
    const numberFields = [
      "DueDays",
      "OverDuePer",
      "BillAmt",
      "QTY",
      "DelQty",
      "OthAmt",
      "NetPrice",
      "CHG1",
      "CHG2",
      "CHG3",
      "CHG4",
      "CHG5",
      "NetAmt",
    ];
  
    // Create a deep copy of the formData to avoid mutating the original state
    const payload = JSON.parse(JSON.stringify(formData));
  
    // Convert number fields to numbers
    Object.keys(payload.InvMst).forEach((key) => {
      if (numberFields.includes(key)) {
        payload.InvMst[key] = Number(payload.InvMst[key]);
      }
    });
  
    payload.Invdet.Invdet.forEach((detail) => {
      Object.keys(detail).forEach((key) => {
        if (numberFields.includes(key)) {
          detail[key] = Number(detail[key]);
        }
      });
  
      // Calculate DelQty dynamically as QTY
      detail.DelQty = detail.QTY;
    });
  
    // Add additional fields to the payload
    payload.CompanyCode = userDetail.CompanyCode;
    payload.Finyear = Finyear;
    payload.Billno = "";
    payload.Brcd = "2";
  
    // Set BillAmt to the calculated Total NetAmt
    payload.InvMst.BillAmt = calculateTotalNetAmt();
  
    try {
      const response = await addInvoice(payload);
      console.log("API Response:", response);
  
      if (response.status) {
        toast.success(response.message);
        setFormData(initialState);
        setItemNameMap({}); // Clear the item name map
      } else {
        toast.error(response.data.message || "An error occurred while processing your request.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  const handleCancel = () => {
    setFormData(initialState);
  };

  return (
    <div className={`p-8 w-full lg:w-[calc(100vw-288px)] ml-0 lg:ml-[288px] text-black min-h-screen`}>
      <button
        className="lg:hidden text-black p-3 flex justify-start"
        onClick={() => setIsSidebarOpen(true)}
      >
        <FontAwesomeIcon icon={faAlignLeft} />
      </button>
      <div className="bg-white p-8 rounded-lg shadow-lg space-y-8">
        <div className="flex justify-between items-center">
          <h4 className="text-2xl font-bold">Invoice Master</h4>
        </div>
        <form onSubmit={handleAddSubmit} className="space-y-6 bg-white p-6 rounded-lg border-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              ["StockLoc", "Stock Location", "select", false, dropdownData.Location],
              ["CustCd", "Customer Name", "select", false, dropdownData.Customer],
              ["BGNDT", "Bill Date", "date", false],
              ["BillType", "Bill Type", "select", false, dropdownData.BillType],
              ["PriceType", "Price Type", "select", false, dropdownData.Price],
              ["TaxType", "Tax Type", "select", false, dropdownData.TAX],
              ["RefDt", "Reference Date", "date", false],
              ["DueDT", "Due Date", "date", false],
              ["Collection", "Collection", "select", false, dropdownData.Location],
              ["DueDays", "Bill Due Days", "number", false],
              ["OverDuePer", "OverDue Percentage(%)", "number", false],
              ["BillAmt", "Bill Amount", "number", false],
              ["Dely_Address", "Delivery Address", "textarea", false],
              ["Remarks", "Remarks", "textarea", false],
            ].map(([name, label, type, isRequired, options], index) => (
              <div key={index} className={`flex items-center ${type === "textarea" ? "md:col-span-2" : ""}`}>
                <label className={`text-gray-700 font-medium ${type === "textarea" ? "lg:w-1/6" : ""} w-1/3 text-left`}>{label}</label>
                {type === "select" ? (
                  <select
                    name={name}
                    value={formData.InvMst[name] || ""}
                    onChange={(e) => handleInputChange(e)}
                    className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                    required={isRequired}
                    disabled={
                      (name === "BillType" || name === "PriceType" || name === "TaxType") && disableFields
                    }
                  >
                    <option value="">Select {label}</option>
                    {options?.map((option, idx) => (
                      <option
                        key={idx}
                        value={
                          name === "CustCd"
                            ? option.CustomerCode // For Customer dropdown
                            : (name === "StockLoc" || name === "Collection")
                              ? option.LocationCode // For Stock Location dropdown
                              : option.DocCode // Fallback for other dropdowns
                        }
                      >
                        {name === "CustCd"
                          ? option.CustomerName // For Customer dropdown
                          : (name === "StockLoc"  || name === "Collection")
                            ? option.LocationName // For Stock Location dropdown
                            : option.CodeDesc // Fallback for other dropdowns
                        }
                      </option>
                    ))}
                  </select>
                ) : type === "textarea" ? (
                  <textarea
                    name={name}
                    value={formData.InvMst[name] || ""}
                    onChange={(e) => handleInputChange(e)}
                    className="p-2 w-2/3 lg:w-5/6 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none resize-none"
                    rows="2"
                    required={isRequired}
                  />
                ) : (
                  <input
                    type={type}
                    name={name}
                    value={type === "date" ? (formData.InvMst[name] ? moment(formData.InvMst[name]).format("YYYY-MM-DD") : "") : name === "BillAmt" ? calculateTotalNetAmt() : formData.InvMst[name] || ""}
                    onChange={(e) => handleInputChange(e)}
                    className={`p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none ${name === "OverDuePer" || name === "DueDays" || name === "BGNDT" ? "bg-gray-50 text-gray-700 cursor-not-allowed" : ""}`}
                    required={isRequired}
                    disabled={name === "OverDuePer" || name === "DueDays" || name === "BGNDT"}
                  />
                )}
              </div>
            ))}
          </div>

          {!isBlacklisted && (
            <>
              <h6 className="flex justify-center text-xl font-bold py-5">Invoice Details</h6>
              <div className="relative overflow-x-auto shadow-md sm:rounded-lg border">
  <table className="w-full text-sm text-center text-gray-700 border border-gray-300">
    {/* <thead className="bg-gray-200 text-gray-900 uppercase">
      <tr>
        {["SR No.", "ICode", "QTY", "DelQty", "Price", "Discount", "OthAmt", "NetPrice"]
          .concat(enabledCharges.map(charge => `${charge.name}(${charge.sign || "+"})`)) // Add enabled charge names
          .concat(["NetAmt", "Action"])
          .map((heading, index) => (
            <th key={index} className="px-3 py-2 border border-gray-300">{heading}</th>
          ))}
      </tr>
    </thead> */}
    <thead className="bg-gray-200 text-gray-900 uppercase">
  <tr>
    {["SR No.", "ICode", "QTY", "Price", "Discount", "NetPrice"]
      .concat(enabledCharges.map(charge => `${charge.name}(${charge.sign || "+"})`)) // Add enabled charge names
      .concat(["NetAmt", "Action"])
      .map((heading, index) => (
        <th key={index} className="px-3 py-2 border border-gray-300">{heading}</th>
      ))}
  </tr>
</thead>
    {/* <tbody>
      {formData.Invdet.Invdet.map((Bill, index) => {
        const qty = Number(Bill.QTY) || 0;
        const price = Number(Bill.Price) || 0;
        const discount = Number(Bill.Discount) || 0;
        const netPrice = (price - discount) * qty; // Calculate NetPrice
        const othAmt = Number(Bill.OthAmt) || 0;

        const chgValues = enabledCharges.map((charge) => {
          const chargeValue = Number(Bill[charge.key]) || 0; // Charge value from input
          const calculatedValue = netPrice * (chargeValue / 100); // Calculate percentage of NetPrice
          return charge.sign === "+" ? calculatedValue : -calculatedValue; // Apply sign
        });

        // Calculate NetAmt
        const netAmt = netPrice + othAmt + chgValues.reduce((sum, chg) => sum + chg, 0);

        return (
          <tr key={index} className="border border-gray-300">
            <td className="py-2 border border-gray-300">{index + 1}</td>

            <td className="border border-gray-300 p-2">
              <input
                type="text"
                name="ICode"
                autoComplete="off"
                value={Bill.ICode || ""}
                onChange={(e) => {
                  handleInputChange(e, "Invdet", index);
                  fetchItemDetails(e.target.value, index);
                }}
                className="bg-gray-100 border border-gray-300 p-1 rounded-md text-center w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {showDropdown && (
                <ul className="bg-white border border-gray-300 rounded-md shadow-lg absolute mt-1 z-10">
                  {Array.isArray(searchResults) && searchResults.map((item) => (
                    <li
                      key={`${item.code}-${index}`}
                      onClick={() => handleItemSelect(item.code, index)}
                      className="p-2 cursor-pointer hover:bg-gray-100"
                    >
                      {item.name}
                    </li>
                  ))}
                </ul>
              )}
            </td>

            <td className="p-2 border border-gray-300">
              <input
                type="number"
                name="QTY"
                value={qty}
                onChange={(e) => handleInputChange(e, "Invdet", index)}
                className="p-1 w-full bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-center"
              />
            </td>

            <td className="p-2 border border-gray-300">
              <input
                type="number"
                name="DelQty"
                value={qty} // Auto-calculated as QTY
                readOnly
                className="p-1 w-full bg-gray-200 rounded-md border border-gray-300 text-center"
              />
            </td>

            <td className="p-2 border border-gray-300">
              <input
                type="number"
                name="Price"
                value={price}
                onChange={(e) => handleInputChange(e, "Invdet", index)}
                className="p-1 w-full bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-center"
              />
            </td>

            <td className="p-2 border border-gray-300">
              <input
                type="number"
                name="Discount"
                value={discount}
                onChange={(e) => handleInputChange(e, "Invdet", index)}
                className="p-1 w-full bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-center"
              />
            </td>

            <td className="p-2 border border-gray-300">
              <input
                type="number"
                name="OthAmt"
                value={othAmt}
                onChange={(e) => handleInputChange(e, "Invdet", index)}
                className="p-1 w-full bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-center"
              />
            </td>

            <td className="p-2 border border-gray-300">
              <input
                type="number"
                name="NetPrice"
                value={netPrice}
                readOnly
                className="p-1 w-full bg-gray-200 rounded-md border border-gray-300 text-center"
              />
            </td>

            {enabledCharges.map((charge) => {
              const chargeValue = Number(Bill[charge.key]) || 0; // Charge value from input
              const calculatedValue = netPrice * (chargeValue / 100); // Calculate percentage of NetPrice
              const finalAns = charge.sign === "+" ? calculatedValue : -calculatedValue;

              return (
                <td key={charge.key} className="p-2 border border-gray-300">
                  <input
                    type="number"
                    name={charge.key}
                    value={chargeValue}
                    onChange={(e) => handleInputChange(e, "Invdet", index)}
                    className="p-1 w-full bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-center"
                  />

                  <input
                    type="number"
                    readOnly
                    value={finalAns.toFixed(2)} // Display calculated value with 2 decimal places
                    className="p-1 w-full bg-gray-200 mt-1 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-center"
                  />
                </td>
              );
            })}

            <td className="p-2 border border-gray-300">
              <input
                type="number"
                name="NetAmt"
                value={netAmt}
                readOnly
                className="p-1 w-full bg-gray-200 rounded-md border border-gray-300 text-center"
              />
            </td>

            <td className="py-2 border border-gray-300">
              {formData.Invdet.Invdet.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveInvoiceDetail(index)}
                  className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              )}
            </td>
          </tr>
        );
      })}
    </tbody> */}

<tbody>
  {formData.Invdet.Invdet.map((Bill, index) => {
    const qty = Number(Bill.QTY) || 0;
    const price = Number(Bill.Price) || 0;
    const discount = Number(Bill.Discount) || 0;
    const netPrice = (price - discount) * qty; // Calculate NetPrice
    const othAmt = Number(Bill.OthAmt) || 0;

    const chgValues = enabledCharges.map((charge) => {
      const chargeValue = Number(Bill[charge.key]) || 0; // Charge value from input
      const calculatedValue = netPrice * (chargeValue / 100); // Calculate percentage of NetPrice
      return charge.sign === "+" ? calculatedValue : -calculatedValue; // Apply sign
    });

    // Calculate NetAmt
    const netAmt = netPrice + othAmt + chgValues.reduce((sum, chg) => sum + chg, 0);

    return (
      <tr key={index} className="border border-gray-300">
        <td className="py-2 border border-gray-300">{index + 1}</td>

        {/* ICode Input */}
        <td className="border border-gray-300 p-2">
  <input
    type="text"
    name="ICode"
    autoComplete="off"
    value={itemNameMap[index] ||  ""} // Display the item name
    onChange={(e) => {
      handleInputChange(e, "Invdet", index);
      fetchItemDetails(e.target.value, index); // Pass the row index
    }}
    className="bg-gray-100 border border-gray-300 p-1 rounded-md text-center w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
  {console.log(itemNameMap[index] || "","itemNameMap[index]")}
  {dropdownVisibility[index] && ( // Only show dropdown for this row
    <ul className="bg-white border border-gray-300 rounded-md shadow-lg absolute mt-1 z-10">
      {Array.isArray(searchResults) &&
        searchResults.map((item) => (
          <li
            key={`${item.code}-${index}`}
            onClick={() => handleItemSelect(item.code, item.name, index)} // Pass both code and name
            className="p-2 cursor-pointer hover:bg-gray-100"
          >
            {item.name}
          </li>
        ))}
    </ul>
  )}
</td>
        {/* QTY Input */}
        <td className="p-2 border border-gray-300">
          <input
            type="number"
            name="QTY"
            value={qty}
            onChange={(e) => handleInputChange(e, "Invdet", index)}
            className="p-1 w-full bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-center"
          />
        </td>

        {/* Price Input */}
        <td className="p-2 border border-gray-300">
          <input
            type="number"
            name="Price"
            value={price}
            onChange={(e) => handleInputChange(e, "Invdet", index)}
            className="p-1 w-full bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-center"
          />
        </td>

        {/* Discount Input */}
        <td className="p-2 border border-gray-300">
          <input
            type="number"
            name="Discount"
            value={discount}
            onChange={(e) => handleInputChange(e, "Invdet", index)}
            className="p-1 w-full bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-center"
          />
        </td>

        {/* NetPrice Input (Auto-calculated) */}
        <td className="p-2 border border-gray-300">
          <input
            type="number"
            name="NetPrice"
            value={netPrice}
            readOnly
            className="p-1 w-full bg-gray-200 rounded-md border border-gray-300 text-center"
          />
        </td>

        {/* Enabled Charges Inputs */}
        {enabledCharges.map((charge) => {
          const chargeValue = Number(Bill[charge.key]) || 0; // Charge value from input
          const calculatedValue = netPrice * (chargeValue / 100); // Calculate percentage of NetPrice
          const finalAns = charge.sign === "+" ? calculatedValue : -calculatedValue;

          return (
            <td key={charge.key} className="p-2 border border-gray-300">
              {/* Input for Charge Value */}
              <input
                type="number"
                name={charge.key}
                value={chargeValue}
                onChange={(e) => handleInputChange(e, "Invdet", index)}
                className="p-1 w-full bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-center"
              />

              {/* Calculated Value Display */}
              <input
                type="number"
                readOnly
                value={finalAns.toFixed(2)} // Display calculated value with 2 decimal places
                className="p-1 w-full bg-gray-200 mt-1 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-center"
              />
            </td>
          );
        })}

        {/* NetAmt Input (Auto-calculated) */}
        <td className="p-2 border border-gray-300">
          <input
            type="number"
            name="NetAmt"
            value={netAmt}
            readOnly
            className="p-1 w-full bg-gray-200 rounded-md border border-gray-300 text-center"
          />
        </td>

        {/* Action Button (Remove Row) */}
        <td className="py-2 border border-gray-300">
          {formData.Invdet.Invdet.length > 1 && (
            <button
              type="button"
              onClick={() => handleRemoveInvoiceDetail(index)}
              className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          )}
        </td>
      </tr>
    );
  })}
</tbody>

    {/* Total NetAmt Row */}
    <tfoot>
      <tr className="bg-gray-200 font-bold">
        <td colSpan={6 + enabledCharges.length} className="py-2 border border-gray-300 text-right">Total NetAmt:</td>
        <td className="py-2 border border-gray-300 text-center">
        {calculateTotalNetAmt().toFixed(2)}
        </td>
        <td className="py-2 border border-gray-300"></td>
      </tr>
      <tr>
        <td colSpan={10 + enabledCharges.length} className="px-4 py-3 text-center">
          <button
            type="button"
            onClick={handleAddInvoiceDetail}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            + Add New Row
          </button>
        </td>
      </tr>
    </tfoot>
  </table>
</div>
              <div className="flex items-center justify-between mt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  Submit
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default InvoiceMaster;