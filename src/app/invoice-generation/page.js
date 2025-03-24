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
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState({ name: "", code: "" });
  const [isItemSelected, setIsItemSelected] = useState({});

  const initialState = {
    InvMst: {
      BGNDT: moment().format("YYYY-MM-DD"), // Set today's date
      RefDt: moment().format("YYYY-MM-DD"),
      DueDT: moment().format("YYYY-MM-DD"),
      StockLoc: userDetail.LocationCode,
      Collection: userDetail.LocationCode
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
  const [isBlacklisted, setIsBlacklisted] = useState(false);
  const [disableFields, setDisableFields] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [dropdownData, setDropdownData] = useState({
    Customer: [],
    BillType: [],
    TAX: [],
    Price: [],
    Location: [],
    BillType2: []
  });
  // const [enabledCharges, setEnabledCharges] = useState([]);
  const [itemNameMap, setItemNameMap] = useState({});
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [gstOption, setGstOption] = useState("withGst"); // Default to "With GST"
  const [enabledCharges, setEnabledCharges] = useState([]);
  const [gstData, setGstData] = useState({}); // To store GST data when "Without GST" is selected

  useEffect(() => {
    const chargesString = gstOption === "withGst" ? "GST_CHARGES_STRING" : "WITHOUT_GST_CHARGES_STRING";
    const enabledCharges = parseChargesDetails(chargesString);
    setEnabledCharges(enabledCharges);

    if (gstOption === "withoutGst") {
      // Save GST data before resetting
      setGstData((prev) => {
        const newGstData = { ...prev };
        formData.Invdet.Invdet.forEach((detail, index) => {
          newGstData[index] = enabledCharges.reduce((acc, charge) => {
            acc[charge.key] = detail[charge.key];
            return acc;
          }, {});
        });
        return newGstData;
      });

      // Reset GST fields to 0
      setFormData((prev) => {
        const newData = { ...prev };
        newData.Invdet.Invdet = newData.Invdet.Invdet.map((detail) => {
          enabledCharges.forEach((charge) => {
            detail[charge.key] = 0;
          });
          return detail;
        });
        return newData;
      });
    } else if (gstOption === "withGst") {
      // Restore GST data
      setFormData((prev) => {
        const newData = { ...prev };
        newData.Invdet.Invdet = newData.Invdet.Invdet.map((detail, index) => {
          if (gstData[index]) {
            Object.keys(gstData[index]).forEach((key) => {
              detail[key] = gstData[index][key];
            });
          }
          return detail;
        });
        return newData;
      });
    }
  }, [gstOption]);
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

  // Filter customers based on search term
  const filteredCustomers = dropdownData.Customer.filter((customer) =>
    customer.CustomerName.toLowerCase().includes(customerSearchTerm.toLowerCase())
  );

  // Handle customer selection
  const handleCustomerSelect = (customerCode, customerName) => {
    setSelectedCustomer({ name: customerName, code: customerCode }); // Update selected customer
    setFormData((prev) => ({
      ...prev,
      InvMst: {
        ...prev.InvMst,
        CustCd: customerCode,
      },
    }));
    setIsCustomerDropdownOpen(false); // Close dropdown after selection
    fetchCustomerDetails(customerCode); // Fetch customer details
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
          setIsBlacklisted(false); // 🚫 Mark as blacklisted
          setFormData(initialState); // ❌ Clear form data
          setDisableFields(false);
          setSelectedCustomer({ name: "", code: "" });
          return; // Exit the function
        } else {
          setIsBlacklisted(true); // ✅ Not blacklisted
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


  // const handleItemSelect = async (itemCode, itemName, index) => {
  //   try {
  //     // Hide the dropdown for this row
  //     setDropdownVisibility((prev) => ({ ...prev, [index]: false }));

  //     // Update the item name map
  //     setItemNameMap((prev) => ({
  //       ...prev,
  //       [index]: itemName, // Store the item name for this row
  //     }));

  //     // Update formData with the selected item code
  //     setFormData((prev) => {
  //       const newData = { ...prev };
  //       newData.Invdet.Invdet[index].ICode = itemCode; // Store the item code in the payload
  //       return newData;
  //     });

  //     // Add the selected item to the selectedItems set
  //     setSelectedItems((prev) => new Set([...prev, itemCode]));

  //     // Fetch tax details and update the form (existing logic)
  //     const taxDetails = await USPITEMWiseTaxDetails({
  //       itemCode,
  //       taxType: formData.InvMst.TaxType,
  //       priceType: formData.InvMst.PriceType,
  //     });

  //     if (!taxDetails) {
  //       console.log("No tax details found for the selected item.");
  //       toast.error("No tax details found for the selected item.");
  //       return;
  //     }

  //     // Parse CHGCODE, CHGColumns, and priceColumns
  //     const chgCodes = taxDetails.CHGCODE.split("*/");
  //     const chgColumns = taxDetails.CHGColumns.split("*/");
  //     const priceColumns = taxDetails.priceColumns.split("*/");

  //     // Extract enabled charges and their values
  //     const enabledCharges = chgCodes
  //       .map((code, idx) => {
  //         const [chgKey, chgName, isEnabled, sign] = code.split("~");
  //         if (isEnabled === "Y") {
  //           return {
  //             key: `CHG${idx + 1}`,
  //             name: chgName,
  //             value: parseFloat(chgColumns[idx]),
  //             sign: sign,
  //           };
  //         }
  //         return null;
  //       })
  //       .filter(Boolean);

  //     // Set enabled charges in state
  //     setEnabledCharges(enabledCharges);

  //     // Update formData with tax details, price, and discount
  //     setFormData((prev) => {
  //       const newData = { ...prev };
  //       newData.Invdet.Invdet[index] = {
  //         ...newData.Invdet.Invdet[index],
  //         Price: parseFloat(priceColumns[0]),
  //         Discount: parseFloat(priceColumns[1]),
  //         ...enabledCharges.reduce((acc, charge) => {
  //           acc[charge.key] = charge.value;
  //           return acc;
  //         }, {}),
  //       };
  //       return newData;
  //     });
  //   } catch (error) {
  //     console.error("An error occurred while handling item selection:", error);
  //   }
  // };
  const handleItemSelect = async (itemCode, itemName, index) => {
    try {
      // Hide the dropdown for this row
      setDropdownVisibility((prev) => ({ ...prev, [index]: false }));

      // Update the item name map with both name and code for display
      setItemNameMap((prev) => ({
        ...prev,
        [index]: `${itemName} - ${itemCode}`, // Display both name and code
      }));

      setIsItemSelected((prev) => ({
        ...prev,
        [index]: true, // Mark this row as having a selected item
      }));

      // Update formData with the selected item code (only code in payload)
      setFormData((prev) => {
        const newData = { ...prev };
        newData.Invdet.Invdet[index].ICode = itemCode; // Only code in payload
        return newData;
      });

      // Add the selected item to the selectedItems set
      setSelectedItems((prev) => new Set([...prev, itemCode]));

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


  // const handleInputChange = (e, section = "InvMst", index = 0) => {
  //   const { name, value, type, checked } = e.target;
  //   const updatedValue = type === "checkbox" ? checked : value;

  //   setFormData((prev) => {
  //     const newData = { ...prev };
  //     if (section === "InvMst") {
  //       newData.InvMst[name] = updatedValue;

  //       // Call the API when CustCd changes
  //       if (name === "CustCd") {
  //         if (updatedValue) {
  //           fetchCustomerDetails(updatedValue);
  //         } else {
  //           setFormData(initialState);
  //           setDisableFields(false)
  //         }
  //       }
  //     } else if (section === "Invdet") {
  //       newData.Invdet.Invdet[index][name] = updatedValue;
  //       if (name === "ICode") {
  //         fetchItemDetails(updatedValue, index);
  //       }
  //     }
  //     return newData;
  //   });
  // };

  const handleInputChange = (e, section = "InvMst", index = 0) => {
    const { name, value, type, checked } = e.target;
    const updatedValue = type === "checkbox" ? checked : value;

    setFormData((prev) => {
      const newData = { ...prev };
      if (section === "InvMst") {
        newData.InvMst[name] = updatedValue;

        // Call the API when CustCd changes
        if (name === "CustCd") {
          if (updatedValue) {
            fetchCustomerDetails(updatedValue);
          } else {
            setFormData(initialState);
            setDisableFields(false);
          }
        }
      } else if (section === "Invdet") {
        newData.Invdet.Invdet[index][name] = updatedValue;
        if (name === "ICode") {
          // Update the itemNameMap when typing
          setItemNameMap((prev) => ({
            ...prev,
            [index]: value, // Update the displayed value
          }));

          // If the input is cleared, reset the row data
          if (updatedValue === "") {
            // Reset the row data to initial values
            newData.Invdet.Invdet[index] = {
              ...initialState.Invdet.Invdet[0], // Reset to initial values
            };

            // Remove the item from selectedItems
            setSelectedItems((prev) => {
              const newSet = new Set(prev);
              newSet.delete(formData.Invdet.Invdet[index].ICode);
              return newSet;
            });
          }

          // Fetch item details when typing
          fetchItemDetails(updatedValue, index);
          setIsItemSelected((prev) => ({
            ...prev,
            [index]: false, // Mark this row as not having a selected item
          }));
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

    // Add an empty entry to itemNameMap for the new row
    setItemNameMap((prev) => ({
      ...prev,
      [formData.Invdet.Invdet.length]: "", // Use the new row's index
    }));
  };

  const handleRemoveInvoiceDetail = (index) => {
    const removedItemCode = formData.Invdet.Invdet[index].ICode;

    setFormData((prev) => ({
      ...prev,
      Invdet: {
        Invdet: prev.Invdet.Invdet.filter((_, i) => i !== index),
      },
    }));

    // Remove the entry from itemNameMap and reindex
    setItemNameMap((prev) => {
      const newItemNameMap = { ...prev };
      delete newItemNameMap[index]; // Remove the entry for the deleted row

      // Reindex the remaining entries
      const updatedItemNameMap = {};
      Object.keys(newItemNameMap).forEach((key) => {
        const newKey = key > index ? key - 1 : key; // Adjust the key if it's after the deleted row
        updatedItemNameMap[newKey] = newItemNameMap[key];
      });

      return updatedItemNameMap;
    });

    // Remove the item from the selectedItems set
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(removedItemCode);
      return newSet;
    });

    // Reset dropdown visibility for the remaining rows
    setDropdownVisibility((prev) => {
      const newVisibility = { ...prev };
      delete newVisibility[index]; // Remove visibility for the deleted row

      // Reindex the visibility
      const updatedVisibility = {};
      Object.keys(newVisibility).forEach((key) => {
        const newKey = key > index ? key - 1 : key; // Adjust the key if it's after the deleted row
        updatedVisibility[newKey] = newVisibility[key];
      });

      return updatedVisibility;
    });
  };

  const filteredSearchResults = searchResults.filter(
    (item) => !selectedItems.has(item.code)
  );

  const calculateTotalNetAmt = () => {
    return formData.Invdet.Invdet.reduce((total, Bill) => {
      const qty = Number(Bill.QTY) || 0;
      const price = Number(Bill.Price) || 0;
      const discount = Number(Bill.Discount) || 0;
      const netPrice = (price - discount) * qty; // Consistent with tbody
      const othAmt = Number(Bill.OthAmt) || 0;
      const chgValues = gstOption === "withGst" ? enabledCharges.map((charge) => {
        const chargeValue = Number(Bill[charge.key]) || 0;
        const calculatedValue = netPrice * (chargeValue / 100); // Consistent with tbody
        return charge.sign === "+" ? calculatedValue : -calculatedValue;
      }) : [];
      return total + (netPrice + othAmt + chgValues.reduce((sum, chg) => sum + chg, 0));
    }, 0);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();

    // Check if all rows have a selected item
    const allItemsSelected = formData.Invdet.Invdet.every(
      (_, index) => isItemSelected[index] === true
    );

    if (!allItemsSelected) {
      toast.error("Please select an item from the dropdown for all rows.");
      return;
    }

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
      "CHG6",
      "CHG7",
      "CHG8",
      "CHG9",
      "CHG10",
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
    payload.InvMst.BillType2 = "1"
    payload.Brcd = "2";


    // Set BillAmt to the calculated Total NetAmt
    payload.InvMst.BillAmt = calculateTotalNetAmt();

    try {
      const response = await addInvoice(payload);

      if (response.status) {
        toast.success(response.message);
        setFormData(initialState);
        setItemNameMap({}); // Clear the item name map
        setSelectedCustomer({ name: "", code: "" });
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
        className="flex justify-start p-3 text-black lg:hidden"
        onClick={() => setIsSidebarOpen(true)}
      >
        <FontAwesomeIcon icon={faAlignLeft} />
      </button>
      <div className="bg-white p-8 rounded-lg shadow-lg space-y-8">
        <div className="flex justify-between items-center">
          <h4 className="text-2xl font-bold">Invoice Master</h4>
        </div>
        <form onSubmit={handleAddSubmit} className="bg-white border-2 p-6 rounded-lg space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className={`flex items-center `}>
              <label className={`text-gray-700 font-medium  w-1/3 text-left`}>Customer Name</label>
              <div className="relative w-2/3">

                <div
                  className="bg-gray-100 border border-gray-300 p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer"
                  onClick={() => setIsCustomerDropdownOpen(!isCustomerDropdownOpen)}
                >
                  {selectedCustomer.name || selectedCustomer.code
                    ? `${selectedCustomer.name} - ${selectedCustomer.code}`
                    : "Select Customer"}
                </div>

                {isCustomerDropdownOpen && (
                  <div className="absolute bg-gray-100 border border-gray-300 rounded-md shadow-2xl mt-1 w-full z-10">
                    <input
                      type="text"
                      placeholder="Search customer..."
                      value={customerSearchTerm}
                      onChange={(e) => setCustomerSearchTerm(e.target.value)}
                      className="p-2 border-b bg-gray-100 border-gray-300 w-full focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />

                    <div className="max-h-60 overflow-y-auto">
                      {filteredCustomers.map((customer) => (
                        <div
                          key={customer.CustomerCode}
                          onClick={() => handleCustomerSelect(customer.CustomerCode, customer.CustomerName)}
                          className="p-2 cursor-pointer hover:bg-gray-100"
                        >
                          {customer.CustomerName} - {customer.CustomerCode}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {[
              ["StockLoc", "Stock Location", "select", false, dropdownData.Location],
              // ["CustCd", "Customer Name", "select", false, dropdownData.Customer],
              ["BGNDT", "Bill Date", "date", false],
              ["BillType", "Bill Type", "select", false, dropdownData.BillType],
              // ["BillType2", "Bill Colleation Type", "select", false, dropdownData.BillType2],
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
                    className="bg-gray-100 border border-gray-300 p-2 rounded-md w-2/3 focus:outline-none focus:ring-2 focus:ring-gray-500"
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
                            ? option.CustomerCode  // For Customer dropdown
                            : (name === "StockLoc" || name === "Collection")
                              ? option.LocationCode // For Stock Location dropdown
                              : option.DocCode // Fallback for other dropdowns
                        }
                      >
                        {name === "CustCd"
                          ? `${option.CustomerName} - ${option.CustomerCode}`
                          : (name === "StockLoc" || name === "Collection")
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
                    className="bg-gray-100 border border-gray-300 p-2 rounded-md w-2/3 focus:outline-none focus:ring-2 focus:ring-gray-500 lg:w-5/6 resize-none"
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

          {isBlacklisted && (
            <>
              <div className="flex justify-between items-center">
                <h6 className="text-xl font-bold py-5">Invoice Details</h6>
                {/* Radio Buttons for GST and Without GST */}
                <div className=" mt-4">
                  <label className="inline-flex items-center mr-4">
                    <input
                      type="radio"
                      name="gstOption"
                      value="withGst"
                      checked={gstOption === "withGst"}
                      onChange={() => setGstOption("withGst")}
                      className="form-radio h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2">With GST</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="gstOption"
                      value="withoutGst"
                      checked={gstOption === "withoutGst"}
                      onChange={() => setGstOption("withoutGst")}
                      className="form-radio h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2">Without GST</span>
                  </label>
                </div>

              </div>
              <div className="border shadow-md overflow-x-auto relative sm:rounded-lg">
                <table className="border border-gray-300 text-center text-gray-700 text-sm w-full">
                  <thead className="bg-gray-200 text-gray-900 uppercase">
                    <tr>
                      {["SR No.", "ICode", "QTY", "Price", "Discount", "NetPrice"]
                        .concat(enabledCharges.map(charge => `${charge.name}(${charge.sign || "+"})`)) // Add enabled charge names
                        .concat(["NetAmt", "Action"])
                        .map((heading, index) => (
                          <th key={index} className="border border-gray-300 px-3 py-2">{heading}</th>
                        ))}
                    </tr>
                  </thead>

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
                          <td className="border border-gray-300 py-2">{index + 1}</td>

                          <td className="border border-gray-300 p-2 min-w-[400px]">
                            <input
                              type="text"
                              name="ICode"
                              autoComplete="off"
                              value={itemNameMap[index] || ""} // Display the item name and code
                              onChange={(e) => {
                                handleInputChange(e, "Invdet", index); // Handle typing
                                fetchItemDetails(e.target.value, index); // Fetch item details
                              }}
                              className="bg-gray-100 border border-gray-300 p-1 rounded-md text-center w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {dropdownVisibility[index] && ( // Only show dropdown for this row
                              <ul className="bg-white border border-gray-300 rounded-md shadow-lg absolute mt-1 z-10">
                                {Array.isArray(filteredSearchResults) &&
                                  filteredSearchResults.map((item) => (
                                    <li
                                      key={`${item.code}-${index}`}
                                      onClick={() => handleItemSelect(item.code, item.name, index)} // Pass both code and name
                                      className="p-2 cursor-pointer hover:bg-gray-100"
                                    >
                                      {item.name} - {item.code}
                                    </li>
                                  ))}
                              </ul>
                            )}
                          </td>

                          {/* QTY Input */}
                          <td className="border border-gray-300 p-2">
                            <input
                              type="number"
                              name="QTY"
                              value={qty}
                              onChange={(e) => handleInputChange(e, "Invdet", index)}
                              className="bg-gray-100 border border-gray-300 p-1 rounded-md text-center w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>

                          {/* Price Input */}
                          <td className="border border-gray-300 p-2">
                            <input
                              type="number"
                              name="Price"
                              value={price}
                              onChange={(e) => handleInputChange(e, "Invdet", index)}
                              className="bg-gray-100 border border-gray-300 p-1 rounded-md text-center w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>

                          {/* Discount Input */}
                          <td className="border border-gray-300 p-2">
                            <input
                              type="number"
                              name="Discount"
                              value={discount}
                              onChange={(e) => handleInputChange(e, "Invdet", index)}
                              className="bg-gray-100 border border-gray-300 p-1 rounded-md text-center w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>

                          {/* NetPrice Input (Auto-calculated) */}
                          <td className="border border-gray-300 p-2">
                            <input
                              type="number"
                              name="NetPrice"
                              value={netPrice}
                              readOnly
                              className="bg-gray-200 border border-gray-300 p-1 rounded-md text-center w-full"
                            />
                          </td>

                          {/* Enabled Charges Inputs */}
                          {/* Enabled Charges Inputs */}
                          {enabledCharges.map((charge) => {
                            const chargeValue = gstOption === "withGst" ? Number(Bill[charge.key]) || 0 : 0; // Charge value from input or 0 if without GST
                            const calculatedValue = netPrice * (chargeValue / 100); // Calculate percentage of NetPrice
                            const finalAns = charge.sign === "+" ? calculatedValue : -calculatedValue;

                            return (
                              <td key={charge.key} className="border border-gray-300 p-2">
                                {/* Input for Charge Value */}
                                <input
                                  type="number"
                                  name={charge.key}
                                  value={chargeValue}
                                  onChange={(e) => handleInputChange(e, "Invdet", index)}
                                  className="bg-gray-100 border border-gray-300 p-1 rounded-md text-center w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  disabled={gstOption === "withoutGst"} // Disable input if without GST
                                />

                                {/* Calculated Value Display */}
                                <input
                                  type="number"
                                  readOnly
                                  value={finalAns.toFixed(2)} // Display calculated value with 2 decimal places
                                  className="bg-gray-200 border border-gray-300 p-1 rounded-md text-center w-full focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                                />
                              </td>
                            );
                          })}

                          {/* NetAmt Input (Auto-calculated) */}
                          <td className="border border-gray-300 p-2">
                            <input
                              type="number"
                              name="NetAmt"
                              value={netAmt}
                              readOnly
                              className="bg-gray-200 border border-gray-300 p-1 rounded-md text-center w-full"
                            />
                          </td>

                          {/* Action Button (Remove Row) */}
                          <td className="border border-gray-300 py-2">
                            {formData.Invdet.Invdet.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveInvoiceDetail(index)}
                                className="bg-red-600 rounded-md text-white hover:bg-red-700 px-3 py-1 transition"
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
                      <td colSpan={6 + enabledCharges.length} className="border border-gray-300 text-right py-2">Total NetAmt:</td>
                      <td className="border border-gray-300 text-center py-2">
                        {calculateTotalNetAmt().toFixed(2)}
                      </td>
                      <td className="border border-gray-300 py-2"></td>
                    </tr>
                    <tr>
                      <td colSpan={10 + enabledCharges.length} className="text-center px-4 py-3">
                        <button
                          type="button"
                          onClick={handleAddInvoiceDetail}
                          className="bg-blue-600 rounded-md text-white hover:bg-blue-700 px-4 py-2 transition"
                        >
                          + Add New Row
                        </button>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <div className="flex justify-between items-center mt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-500 rounded-lg text-white duration-200 hover:bg-gray-600 px-6 py-2 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`bg-blue-600 rounded-lg text-white duration-200 hover:bg-blue-700 px-6 py-2 transition ${calculateTotalNetAmt() === 0 ? 'opacity-50' : ''} `}
                  disabled={calculateTotalNetAmt() === 0}
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