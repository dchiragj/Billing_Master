// "use client";
// import React, { useEffect, useState } from "react";
// import { useAuth } from "../context/AuthContext";
// import {
//   addInvoice,
//   fetchDropdownData,
//   USPInvoiceCustItemLocationChanged,
//   USPITEMWiseTaxDetails,
//   USPSearchInvoiceItem,
// } from "@/lib/masterService";
// import moment from "moment";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faAlignLeft, faChevronDown, faChevronUp, faTimes, faTrash } from "@fortawesome/free-solid-svg-icons";
// import { toast } from "react-toastify";
// import Swal from "sweetalert2";

// const InvoiceMaster = () => {
//   const { setIsSidebarOpen, userDetail } = useAuth();
//   const [dropdownVisibility, setDropdownVisibility] = useState({});
//   const [customerSearchTerm, setCustomerSearchTerm] = useState("");
//   const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
//   const [selectedCustomer, setSelectedCustomer] = useState({ name: "", code: "" });
//   const [isItemSelected, setIsItemSelected] = useState({});
//   const [originalCharges, setOriginalCharges] = useState({});
//   const initialState = {
//     InvMst: {
//       BGNDT: moment().format("YYYY-MM-DD"),
//       RefDt: moment().format("YYYY-MM-DD"),
//       DueDT: moment().format("YYYY-MM-DD"),
//       StockLoc: userDetail.LocationCode,
//       Collection: userDetail.LocationCode
//     },
//     Invdet: {
//       Invdet: [
//         {
//           ICode: "",
//           QTY: 0,
//           DelQty: 0,
//           OthAmt: 0,
//           NetPrice: 0,
//           CHG1: 0,
//           CHG2: 0,
//           CHG3: 0,
//           CHG4: 0,
//           CHG5: 0,
//           NetAmt: 0,
//         },
//       ],
//     },
//   };
//   const [formData, setFormData] = useState(initialState);
//   const [isBlacklisted, setIsBlacklisted] = useState(false);
//   const [disableFields, setDisableFields] = useState(false);
//   const [searchResults, setSearchResults] = useState([]);
//   const [dropdownData, setDropdownData] = useState({
//     Customer: [],
//     BillType: [],
//     TAX: [],
//     Price: [],
//     Location: [],
//     BillType2: []
//   });
//   // const [enabledCharges, setEnabledCharges] = useState([]);
//   const [itemNameMap, setItemNameMap] = useState({});
//   const [selectedItems, setSelectedItems] = useState(new Set());
//   const [submitting, setSubmitting] = useState(false);
//   const [gstOption, setGstOption] = useState("withoutGst");
//   const [enabledCharges, setEnabledCharges] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [isItemDropdownOpen, setIsItemDropdownOpen] = useState({});
//   // const Finyear = userDetail.FinancialYear;
//   const Finyear = userDetail.FinancialYear.replace(/-/g, '_');
//   const [itemDropdownState, setItemDropdownState] = useState({});
//   const [itemSearchResults, setItemSearchResults] = useState({});
//   const [itemSearchTerm, setItemSearchTerm] = useState({});

//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       // Check if click is inside any item dropdown
//       const isClickInsideAnyItemDropdown = Object.keys(itemDropdownState).some(index => {
//         const dropdownElement = document.getElementById(`item-dropdown-${index}`);
//         const inputElement = document.getElementById(`item-input-${index}`);
//         return (dropdownElement && dropdownElement.contains(e.target)) ||
//           (inputElement && inputElement.contains(e.target));
//       });

//       // Check if click is inside customer dropdown
//       const customerDropdownElement = document.getElementById('customer-dropdown');
//       const customerInputElement = document.getElementById('customer-input');
//       const isClickInsideCustomerDropdown =
//         (customerDropdownElement && customerDropdownElement.contains(e.target)) ||
//         (customerInputElement && customerInputElement.contains(e.target));

//       // Close all item dropdowns if click is outside
//       if (!isClickInsideAnyItemDropdown) {
//         setItemDropdownState({});
//       }

//       // Close customer dropdown if click is outside
//       if (isCustomerDropdownOpen && !isClickInsideCustomerDropdown) {
//         setIsCustomerDropdownOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [itemDropdownState, isCustomerDropdownOpen]);

//   useEffect(() => {
//     const fetchTaxDetailsForAllItems = async () => {
//       if (gstOption === "withGst") {
//         const updatedFormData = { ...formData };

//         for (let index = 0; index < formData.Invdet.Invdet.length; index++) {
//           const itemCode = formData.Invdet.Invdet[index].ICode;

//           if (itemCode) {
//             try {
//               // Call API to get tax details for each item
//               const taxDetails = await USPITEMWiseTaxDetails({
//                 itemCode,
//                 taxType: formData.InvMst.TaxType,
//                 priceType: formData.InvMst.PriceType,
//               });

//               if (taxDetails) {
//                 // Parse CHGCODE, CHGColumns, and priceColumns
//                 const chgCodes = taxDetails.CHGCODE.split("*/");
//                 const chgColumns = taxDetails.CHGColumns.split("*/");
//                 const priceColumns = taxDetails.priceColumns.split("*/");

//                 // Extract enabled charges and their values
//                 const enabledCharges = chgCodes
//                   .map((code, idx) => {
//                     const [chgKey, chgName, isEnabled, sign] = code.split("~");
//                     if (isEnabled === "Y") {
//                       return {
//                         key: `CHG${idx + 1}`,
//                         name: chgName,
//                         value: parseFloat(chgColumns[idx]),
//                         sign: sign,
//                       };
//                     }
//                     return null;
//                   })
//                   .filter(Boolean);

//                 // Set the updated charges in formData
//                 updatedFormData.Invdet.Invdet[index] = {
//                   ...updatedFormData.Invdet.Invdet[index],
//                   Price: parseFloat(priceColumns[0]),
//                   Discount: parseFloat(priceColumns[1]),
//                   ...enabledCharges.reduce((acc, charge) => {
//                     acc[charge.key] = charge.value;
//                     return acc;
//                   }, {}),
//                 };
//               }
//             } catch (error) {
//               console.log(`Error fetching tax details for item ${itemCode}:`, error);
//             }
//           }
//         }

//         // Update formData with the restored charges
//         setFormData(updatedFormData);
//       }
//     };

//     fetchTaxDetailsForAllItems();
//   }, [gstOption]);

//   useEffect(() => {
//     if (userDetail?.CompanyCode) {
//       Object.keys(dropdownData).forEach((key) => {
//         handleDropdownData(userDetail.CompanyCode, key);
//       });
//     }
//   }, [userDetail?.CompanyCode]);

//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       // Check if click is inside any item dropdown
//       const isClickInsideItemDropdown = Object.keys(isItemDropdownOpen).some(index => {
//         const dropdownElement = document.getElementById(`item-dropdown-${index}`);
//         return dropdownElement && dropdownElement.contains(e.target);
//       });

//       // Check if click is inside customer dropdown
//       const customerDropdownElement = document.getElementById('customer-dropdown');
//       const isClickInsideCustomerDropdown = customerDropdownElement &&
//         customerDropdownElement.contains(e.target);

//       // Check if click is on customer input
//       const customerInputElement = document.getElementById('customer-input');
//       const isClickOnCustomerInput = customerInputElement &&
//         customerInputElement.contains(e.target);

//       // Close all item dropdowns if click is outside
//       if (!isClickInsideItemDropdown) {
//         Object.keys(isItemDropdownOpen).forEach(index => {
//           if (isItemDropdownOpen[index]) {
//             toggleItemDropdown(index, false);
//           }
//         });
//       }

//       // Close customer dropdown if click is outside
//       if (isCustomerDropdownOpen && !isClickInsideCustomerDropdown && !isClickOnCustomerInput) {
//         setIsCustomerDropdownOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [isItemDropdownOpen, isCustomerDropdownOpen]);

//   const handleDropdownData = async (CompanyCode, MstCode) => {
//     try {
//       if (userDetail.CompanyCode) {
//         const data = await fetchDropdownData(CompanyCode, MstCode);
//         setDropdownData((prev) => ({
//           ...prev,
//           [MstCode]: data,
//         }));
//       }
//     } catch (error) {
//       console.log(`Error fetching ${MstCode}:`, error);
//     }
//   };

//   // const handleItemSearchChange = (e, index) => {
//   //   const value = e.target.value;
//   //   setItemSearchTerm(prev => ({ ...prev, [index]: value }));
//   //   fetchItemDetails(value, index);
//   // };

//   const handleItemSearchChange = async (e, index) => {
//     const value = e.target.value || "";
//     setItemSearchTerm(prev => ({ ...prev, [index]: value }));

//     try {
//       if (value) {
//         const itemDetails = await USPSearchInvoiceItem({ prefixText: value });
//         setItemSearchResults(prev => ({
//           ...prev,
//           [index]: itemDetails.data || []
//         }));
//       }
//     } catch (error) {
//       setItemSearchResults(prev => ({
//         ...prev,
//         [index]: []
//       }));
//     }
//   };

//   // const toggleItemDropdown = (index, isOpen) => {
//   //   // Close all other dropdowns first
//   //   Object.keys(isItemDropdownOpen).forEach(i => {
//   //     if (i !== index.toString() && isItemDropdownOpen[i]) {
//   //       setIsItemDropdownOpen(prev => ({ ...prev, [i]: false }));
//   //     }
//   //   });

//   //   // Toggle the current dropdown
//   //   setIsItemDropdownOpen(prev => ({ ...prev, [index]: isOpen }));
//   // };

//   const toggleItemDropdown = (index, isOpen) => {
//     if (isOpen) {
//       const newState = {};
//       Object.keys(itemDropdownState).forEach(i => {
//         newState[i] = false;
//       });
//       newState[index] = true;
//       setItemDropdownState(newState);

//       // Load initial items if not already loaded
//       if (!itemSearchResults[index]) {
//         handleItemSearchChange({ target: { value: "" } }, index);
//       }
//     } else {
//       setItemDropdownState(prev => ({
//         ...prev,
//         [index]: false
//       }));
//     }
//   };

//   const handleClearItem = (index) => {
//     const currentItemCode = formData.Invdet.Invdet[index].ICode;

//     // Clear the selected item
//     setItemNameMap(prev => {
//       const newMap = { ...prev };
//       delete newMap[index];
//       return newMap;
//     });

//     setItemSearchTerm(prev => ({ ...prev, [index]: "" }));

//     setSelectedItems(prev => {
//       const newSet = new Set(prev);
//       newSet.delete(currentItemCode);
//       return newSet;
//     });

//     // Reset the row data
//     setFormData(prev => {
//       const newData = { ...prev };
//       newData.Invdet.Invdet[index] = {
//         ...initialState.Invdet.Invdet[0]
//       };
//       return newData;
//     });

//     // Re-fetch items to ensure cleared item appears in results
//     handleItemSearchChange({ target: { value: "" } }, index);

//     // Keep dropdown open after clearing
//     toggleItemDropdown(index, true);
//   };

//   const toggleCustomerDropdown = () => {
//     // Close all item dropdowns when opening customer dropdown
//     Object.keys(isItemDropdownOpen).forEach(index => {
//       if (isItemDropdownOpen[index]) {
//         toggleItemDropdown(index, false);
//       }
//     });

//     setIsCustomerDropdownOpen(prev => !prev);
//   };

//   const parseChargesDetails = (chargesString) => {
//     const chargesArray = chargesString.split("*/"); // Split by the main delimiter
//     const enabledCharges = [];

//     chargesArray.forEach((charge, index) => {
//       const parts = charge.split("~"); // Split by '~'
//       if (parts.length >= 3) {
//         // Ensure there are enough parts
//         const isEnabled = parts[2]; // Enabled status (Y or N)
//         if (isEnabled === "Y") {
//           enabledCharges.push({
//             key: `CHG${index + 1}`, // Create keys like CHG1, CHG2, etc.
//             name: parts[1], // Charge name (e.g., CGST(%), SGST(%), etc.)
//           });
//         }
//       }
//     });

//     return enabledCharges;
//   };

//   // Filter customers based on search term
//   const filteredCustomers = dropdownData.Customer.filter((customer) =>
//     customer.CustomerName.toLowerCase().includes(customerSearchTerm.toLowerCase()) || customer.CustomerCode.toLowerCase().includes(customerSearchTerm.toLowerCase())
//   );

//   // Handle customer selection
//   const handleCustomerSelect = (customerCode, customerName) => {
//     setSelectedCustomer({ name: customerName, code: customerCode }); // Update selected customer
//     setFormData((prev) => ({
//       ...prev,
//       InvMst: {
//         ...prev.InvMst,
//         CustCd: customerCode,
//       },
//     }));
//     setIsCustomerDropdownOpen(false); // Close dropdown after selection
//     fetchCustomerDetails(customerCode); // Fetch customer details
//   };


//   const fetchCustomerDetails = async (customerCode) => {
//     setLoading(true)
//     try {
//       const response = await USPInvoiceCustItemLocationChanged({
//         CustCd: customerCode,
//       });

//       if (response.status) {
//         const customerData = response.data;

//         // ✅ Check if blacklisted
//         if (customerData.IsBlackList === "1") {
//           Swal.fire({
//             icon: "error",
//             title: "Blacklisted Customer",
//             text: "The Same Customer has been declared as Black Listed",
//             confirmButtonText: "OK",
//             confirmButtonColor: "#d33",
//           });
//           setIsBlacklisted(false); // 🚫 Mark as blacklisted
//           setFormData(initialState); // ❌ Clear form data
//           setDisableFields(false);
//           setSelectedCustomer({ name: "", code: "" });
//           return; // Exit the function
//         } else {
//           setIsBlacklisted(true); // ✅ Not blacklisted
//           setDisableFields(true);
//         }

//         // Parse ChargesDetails and set enabled charges
//         const enabledCharges = parseChargesDetails(customerData.ChargesDetails);
//         setEnabledCharges(enabledCharges); // Store enabled charges in state

//         // ✅ Update formData for non-blacklisted customers
//         setFormData((prev) => ({
//           ...prev,
//           InvMst: {
//             ...prev.InvMst,
//             Dely_Address: customerData.Dely_Address || "",
//             OverDuePer: customerData.Overdue_Interest || "",
//             PriceType: customerData.PriceType || "",
//             BillType: customerData.CustCat || "",
//             TaxType: customerData.CodeID || "",
//             DueDays: customerData.CRDAYS || "",
//           },
//         }));

//       } else {
//         toast.error("Failed to fetch customer location data.");
//       }
//     } catch (error) {
//       console.log("Error fetching customer details:", error);
//     } finally {
//       setLoading(false)
//     }

//   };

//   const fetchItemDetails = async (prefixText, index) => {
//     try {
//       if (prefixText) {
//         const itemDetails = await USPSearchInvoiceItem({ prefixText });
//         setSearchResults(itemDetails.data); // Assuming itemDetails is an array of items
//         setDropdownVisibility((prev) => ({ ...prev, [index]: true }));
//       }
//     } catch (error) {
//       console.log("Error fetching item details:", error);
//     }
//   };


//   const handleItemSelect = async (itemCode, itemName, index) => {
//     try {
//       // Get the current item code in this row (if any)
//       const currentItemCode = formData.Invdet.Invdet[index]?.ICode;

//       setItemSearchTerm(prev => ({ ...prev, [index]: "" })); // Clear search term

//       // Update selectedItems
//       setSelectedItems(prev => {
//         const newSet = new Set(prev);

//         // Remove the current item from the set (if it exists)
//         if (currentItemCode) {
//           newSet.delete(currentItemCode);
//         }

//         // Add the new item to the set
//         newSet.add(itemCode);
//         return newSet;
//       });

//       // Update UI for selected item
//       setItemNameMap(prev => ({
//         ...prev,
//         [index]: `${itemName} - ${itemCode}`,
//       }));

//       setDropdownVisibility((prev) => ({ ...prev, [index]: false }));
//       setIsItemSelected((prev) => ({
//         ...prev,
//         [index]: true,
//       }));

//       // First update the formData with the new item code
//       setFormData((prev) => {
//         const newData = { ...prev };
//         newData.Invdet.Invdet[index].ICode = itemCode;
//         return newData;
//       });

//       // Then fetch and apply tax details (this is the part that fills other values)
//       const taxDetails = await USPITEMWiseTaxDetails({
//         itemCode,
//         taxType: formData.InvMst.TaxType,
//         priceType: formData.InvMst.PriceType,
//       });

//       if (!taxDetails) {
//         console.log("No tax details found for the selected item.");
//         toast.error("No tax details found for the selected item.");
//         return;
//       }

//       const chgCodes = taxDetails.CHGCODE.split("*/");
//       const chgColumns = taxDetails.CHGColumns.split("*/");
//       const priceColumns = taxDetails.priceColumns.split("*/");

//       const enabledCharges = chgCodes
//         .map((code, idx) => {
//           const [chgKey, chgName, isEnabled, sign] = code.split("~");
//           if (isEnabled === "Y") {
//             return {
//               key: `CHG${idx + 1}`,
//               name: chgName,
//               value: parseFloat(chgColumns[idx]),
//               sign: sign,
//             };
//           }
//           return null;
//         })
//         .filter(Boolean);

//       setEnabledCharges(enabledCharges);

//       // Update formData with all the fetched values
//       setFormData((prev) => {
//         const newData = { ...prev };
//         newData.Invdet.Invdet[index] = {
//           ...newData.Invdet.Invdet[index],
//           Price: parseFloat(priceColumns[0]),
//           Discount: parseFloat(priceColumns[1]),
//           ...enabledCharges.reduce((acc, charge) => {
//             acc[charge.key] = charge.value;
//             return acc;
//           }, {}),
//         };
//         return newData;
//       });

//     } catch (error) {
//       console.log("An error occurred while handling item selection:", error);
//     }
//   };
//   const handleInputChange = (e, section = "InvMst", index = 0) => {
//     const { name, value, type, checked } = e.target;
//     const updatedValue = type === "checkbox" ? checked : value;

//     setFormData((prev) => {
//       const newData = { ...prev };

//       if (section === "InvMst") {
//         newData.InvMst[name] = updatedValue;
//               if (name === "CustCd") {
//                 if (updatedValue) {
//                   fetchCustomerDetails(updatedValue);
//                 } else {
//                   setFormData(initialState);
//                   setDisableFields(false);
//                 }
//               }
//       } else if (section === "Invdet") {
//         // When ICode is being cleared
//         if (name === "ICode" && updatedValue === "") {
//           const currentItemCode = newData.Invdet.Invdet[index].ICode;

//           // Remove from selectedItems if there was an item
//           if (currentItemCode) {
//             setSelectedItems(prev => {
//               const newSet = new Set(prev);
//               newSet.delete(currentItemCode);
//               return newSet;
//             });
//           }

//           // Reset the row
//           newData.Invdet.Invdet[index] = {
//             ...initialState.Invdet.Invdet[0],
//           };

//           // Clear item name
//           setItemNameMap(prev => {
//             const newMap = { ...prev };
//             delete newMap[index];
//             return newMap;
//           });

//           // Mark as not selected
//           setIsItemSelected(prev => ({
//             ...prev,
//             [index]: false,
//           }));
//         } else {
//           newData.Invdet.Invdet[index] = {
//             ...newData.Invdet.Invdet[index],
//             [name]: updatedValue
//           };
//         }

//         // Recalculate NetPrice if QTY, Price, or Discount changes
//         if (name === "QTY" || name === "Price" || name === "Discount") {
//           const qty = Number(newData.Invdet.Invdet[index].QTY) || 0;
//           const price = Number(newData.Invdet.Invdet[index].Price) || 0;
//           const discount = Number(newData.Invdet.Invdet[index].Discount) || 0;
//           newData.Invdet.Invdet[index].NetPrice = (price - discount) * qty;
//         }

//         // Recalculate NetAmt (with or without GST)
//         const netPrice = Number(newData.Invdet.Invdet[index].NetPrice) || 0;
//         const othAmt = Number(newData.Invdet.Invdet[index].OthAmt) || 0;

//         // ✅ Only calculate charges if GST is enabled
//         let totalCharges = 0;
//         if (gstOption === "withGst") {
//           totalCharges = enabledCharges.reduce((sum, charge) => {
//             const chargeValue = Number(newData.Invdet.Invdet[index][charge.key]) || 0;
//             const calculatedValue = netPrice * (chargeValue / 100);
//             return sum + (charge.sign === "+" ? calculatedValue : -calculatedValue);
//           }, 0);
//         } else {
//           // 🔄 Reset all charges to 0 if GST is disabled
//           enabledCharges.forEach(charge => {
//             newData.Invdet.Invdet[index][charge.key] = 0;
//           });
//         }

//         newData.Invdet.Invdet[index].NetAmt = netPrice + othAmt + totalCharges;
//       }

//       return newData;
//     });
//   };

//   const handleAddInvoiceDetail = () => {
//     setFormData((prev) => ({
//       ...prev,
//       Invdet: {
//         Invdet: [
//           ...prev.Invdet.Invdet,
//           initialState.Invdet.Invdet[0],
//         ],
//       },
//     }));
//     setItemNameMap((prev) => ({
//       ...prev,
//       [formData.Invdet.Invdet.length]: "", // Use the new row's index
//     }));
//   };

//   // const handleRemoveInvoiceDetail = (index) => {
//   //   const removedItemCode = formData.Invdet.Invdet[index].ICode;

//   //   setFormData((prev) => ({
//   //     ...prev,
//   //     Invdet: {
//   //       Invdet: prev.Invdet.Invdet.filter((_, i) => i !== index),
//   //     },
//   //   }));

//   //   setItemNameMap((prev) => {
//   //     const newItemNameMap = { ...prev };
//   //     delete newItemNameMap[index]; // Remove the entry for the deleted row

//   //     const updatedItemNameMap = {};
//   //     Object.keys(newItemNameMap).forEach((key) => {
//   //       const newKey = key > index ? key - 1 : key; // Adjust the key if it's after the deleted row
//   //       updatedItemNameMap[newKey] = newItemNameMap[key];
//   //     });

//   //     return updatedItemNameMap;
//   //   });
//   //   setSelectedItems((prev) => {
//   //     const newSet = new Set(prev);
//   //     newSet.delete(removedItemCode);
//   //     return newSet;
//   //   });

//   //   setDropdownVisibility((prev) => {
//   //     const newVisibility = { ...prev };
//   //     delete newVisibility[index]; // Remove visibility for the deleted row

//   //     // Reindex the visibility
//   //     const updatedVisibility = {};
//   //     Object.keys(newVisibility).forEach((key) => {
//   //       const newKey = key > index ? key - 1 : key; // Adjust the key if it's after the deleted row
//   //       updatedVisibility[newKey] = newVisibility[key];
//   //     });

//   //     return updatedVisibility;
//   //   });
//   // };


//   const handleRemoveInvoiceDetail = (index) => {
//     const removedItemCode = formData.Invdet.Invdet[index].ICode;

//     // Remove the item from selectedItems
//     setSelectedItems(prev => {
//       const newSet = new Set(prev);
//       newSet.delete(removedItemCode);
//       return newSet;
//     });

//     // Rest of your existing removal logic...
//     setFormData((prev) => ({
//       ...prev,
//       Invdet: {
//         Invdet: prev.Invdet.Invdet.filter((_, i) => i !== index),
//       },
//     }));

//     setItemNameMap((prev) => {
//       const newItemNameMap = { ...prev };
//       delete newItemNameMap[index];
//       const updatedItemNameMap = {};
//       Object.keys(newItemNameMap).forEach((key) => {
//         const newKey = key > index ? key - 1 : key;
//         updatedItemNameMap[newKey] = newItemNameMap[key];
//       });
//       return updatedItemNameMap;
//     });

//     setDropdownVisibility((prev) => {
//       const newVisibility = { ...prev };
//       delete newVisibility[index];
//       const updatedVisibility = {};
//       Object.keys(newVisibility).forEach((key) => {
//         const newKey = key > index ? key - 1 : key;
//         updatedVisibility[newKey] = newVisibility[key];
//       });
//       return updatedVisibility;
//     });
//   };

//   // const filteredSearchResults = searchResults.filter(
//   //   (item) => !selectedItems.has(item.code)
//   // );
//   const filteredSearchResults = searchResults.filter(
//     (item, index) => !selectedItems.has(item.code) ||
//       (formData.Invdet.Invdet.some((row, i) => i === index && row.ICode === item.code))
//   );
//   const calculateTotalNetAmt = () => {
//     return formData.Invdet.Invdet.reduce((total, Bill) => {
//       const qty = Number(Bill.QTY) || 0;
//       const price = Number(Bill.Price) || 0;
//       const discount = Number(Bill.Discount) || 0;
//       const netPrice = (price - discount) * qty; // Consistent with tbody
//       const othAmt = Number(Bill.OthAmt) || 0;
//       const chgValues = gstOption === "withGst" ? enabledCharges.map((charge) => {
//         const chargeValue = Number(Bill[charge.key]) || 0;
//         const calculatedValue = netPrice * (chargeValue / 100); // Consistent with tbody
//         return charge.sign === "+" ? calculatedValue : -calculatedValue;
//       }) : [];
//       return total + (netPrice + othAmt + chgValues.reduce((sum, chg) => sum + chg, 0));
//     }, 0);
//   };

//   const handleAddSubmit = async (e) => {
//     e.preventDefault();
//     // Check if all rows have a selected item
//     const allItemsSelected = formData.Invdet.Invdet.every(
//       (_, index) => isItemSelected[index] === true
//     );

//     if (!allItemsSelected) {
//       toast.error("Please select an ICode from the dropdown for all rows.");
//       return;
//     }

//     // Define which fields should be numbers
//     const numberFields = [
//       "DueDays",
//       "OverDuePer",
//       "BillAmt",
//       "QTY",
//       "DelQty",
//       "OthAmt",
//       "NetPrice",
//       "CHG1",
//       "CHG2",
//       "CHG3",
//       "CHG4",
//       "CHG5",
//       "CHG6",
//       "CHG7",
//       "CHG8",
//       "CHG9",
//       "CHG10",
//       "NetAmt",
//     ];

//     // Create a deep copy of the formData to avoid mutating the original state
//     const payload = JSON.parse(JSON.stringify(formData));

//     // Convert number fields to numbers
//     Object.keys(payload.InvMst).forEach((key) => {
//       if (numberFields.includes(key)) {
//         payload.InvMst[key] = Number(payload.InvMst[key]);
//       }
//     });

//     payload.Invdet.Invdet.forEach((detail) => {
//       Object.keys(detail).forEach((key) => {
//         if (numberFields.includes(key)) {
//           detail[key] = Number(detail[key]);
//         }
//       });

//       // Calculate DelQty dynamically as QTY
//       detail.DelQty = detail.QTY;
//     });

//     // Add additional fields to the payload
//     payload.CompanyCode = String(userDetail.CompanyCode);
//     payload.Finyear = Finyear;
//     payload.Billno = "";
//     payload.InvMst.BillType2 = "1"
//     payload.Brcd = "2";


//     // Set BillAmt to the calculated Total NetAmt
//     payload.InvMst.BillAmt = calculateTotalNetAmt();
//     // Add IsGstapply based on the selected GST option
//     // payload.InvMst.IsGstapply = gstOption === "withGst"; // true if "With GST" is selected, false  

//     try {
//       setSubmitting(true);
//       const response = await addInvoice(payload);

//       if (response.status) {
//         toast.success(response.message);
//         setFormData(initialState);
//         setItemNameMap({}); // Clear the item name map
//         setSelectedCustomer({ name: "", code: "" });
//       } else {
//         toast.error(response.data.message || "An error occurred while processing your request.");
//       }
//     } catch (error) {
//       toast.error("An unexpected error occurred. Please try again.");
//     } finally {
//       setSubmitting(false)
//       setIsBlacklisted(false)
//     }
//   };

//   // const handleGstToggle = (option) => {
//   //   setGstOption(option);

//   //   setFormData(prev => {
//   //     const newData = {...prev};

//   //     // Update all invoice items
//   //     newData.Invdet.Invdet = newData.Invdet.Invdet.map(item => {
//   //       const qty = Number(item.QTY) || 0;
//   //       const price = Number(item.Price) || 0;
//   //       const discount = Number(item.Discount) || 0;
//   //       const netPrice = (price - discount) * qty;
//   //       const othAmt = Number(item.OthAmt) || 0;

//   //       // Reset charges if switching to Without GST
//   //       if (option === "withoutGst") {
//   //         enabledCharges.forEach(charge => {
//   //           item[charge.key] = 0;
//   //         });
//   //       }

//   //       // Recalculate NetAmt
//   //       let totalCharges = 0;
//   //       if (option === "withGst") {
//   //         totalCharges = enabledCharges.reduce((sum, charge) => {
//   //           const chargeValue = Number(item[charge.key]) || 0;
//   //           return sum + (netPrice * (chargeValue / 100) * (charge.sign === "+" ? 1 : -1));
//   //         }, 0);
//   //       }

//   //       return {
//   //         ...item,
//   //         NetPrice: netPrice,
//   //         NetAmt: netPrice + othAmt + totalCharges
//   //       };
//   //     });

//   //     return newData;
//   //   });
//   // };

//   const handleGstToggle = (option) => {
//     setGstOption(option);

//     setFormData(prev => {
//       const newData = { ...prev };

//       newData.Invdet.Invdet = newData.Invdet.Invdet.map((item, index) => {
//         const qty = Number(item.QTY) || 0;
//         const price = Number(item.Price) || 0;
//         const discount = Number(item.Discount) || 0;
//         const netPrice = (price - discount) * qty;
//         const othAmt = Number(item.OthAmt) || 0;

//         // When switching to Without GST, save original charges
//         if (option === "withoutGst") {
//           const chargesSnapshot = {};
//           enabledCharges.forEach(charge => {
//             chargesSnapshot[charge.key] = item[charge.key];
//             item[charge.key] = 0; // Reset to 0
//           });
//           setOriginalCharges(prev => ({ ...prev, [index]: chargesSnapshot }));
//         }
//         // When switching back to With GST, restore original charges
//         else if (option === "withGst" && originalCharges[index]) {
//           Object.entries(originalCharges[index]).forEach(([key, value]) => {
//             item[key] = value;
//           });
//         }

//         // Calculate total charges based on current mode
//         let totalCharges = 0;
//         if (option === "withGst") {
//           totalCharges = enabledCharges.reduce((sum, charge) => {
//             const chargeValue = Number(item[charge.key]) || 0;
//             return sum + (netPrice * (chargeValue / 100) * (charge.sign === "+" ? 1 : -1));
//           }, 0);
//         }

//         return {
//           ...item,
//           NetPrice: netPrice,
//           NetAmt: netPrice + othAmt + totalCharges
//         };
//       });

//       return newData;
//     });
//   };
//   const handleCancel = () => {
//     setFormData(initialState);
//     setItemNameMap({});
//     setSelectedCustomer({ name: "", code: "" });
//     setIsBlacklisted(false);
//   };

//   return (
//     <div className="h-full">
//       <button
//         className="flex text-xl justify-start p-3 text-black lg:hidden"
//         onClick={() => setIsSidebarOpen(true)}
//       >
//         <FontAwesomeIcon icon={faAlignLeft} />
//       </button>
//       <div className="bg-white p-2 md:p-8 rounded-lg shadow-lg space-y-8">
//         <h4 className="text-xl font-bold text-center">Invoice Master</h4>
//         <form onSubmit={handleAddSubmit} className="bg-white border-2 p-6 rounded-lg space-y-6">
//           <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//             <div className={`flex items-center `}>
//               <label className={`text-gray-700 font-medium  w-1/3 text-left`}>Customer Name</label>
//               <div className="relative w-2/3">
//                 <div
//                   id="customer-input"
//                   className="bg-gray-100 border border-gray-300 p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer"
//                   onClick={() => setIsCustomerDropdownOpen(!isCustomerDropdownOpen)}
//                 >
//                   {selectedCustomer.name || selectedCustomer.code
//                     ? `${selectedCustomer.name} - ${selectedCustomer.code}`
//                     : "Select Customer"}
//                 </div>

//                 {isCustomerDropdownOpen && (
//                   <div id="customer-dropdown" className="absolute bg-gray-100 border border-gray-300 rounded-md shadow-2xl mt-1 w-full z-10">
//                     <input
//                       type="text"
//                       placeholder="Search customer..."
//                       value={customerSearchTerm}
//                       onChange={(e) => setCustomerSearchTerm(e.target.value)}
//                       className="p-2 border-b bg-gray-100 border-gray-300 w-full focus:outline-none focus:ring-2 focus:ring-gray-500"
//                     />

//                     <div className="max-h-60 overflow-y-auto">
//                       {filteredCustomers.map((customer) => (
//                         <div
//                           key={customer.CustomerCode}
//                           onClick={() => handleCustomerSelect(customer.CustomerCode, customer.CustomerName)}
//                           className="p-2 cursor-pointer hover:bg-gray-100"
//                         >
//                           {customer.CustomerName} - {customer.CustomerCode}
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//             {[
//               ["StockLoc", "Stock Location", "select", false, dropdownData.Location],
//               // ["CustCd", "Customer Name", "select", false, dropdownData.Customer],
//               ["BGNDT", "Bill Date", "date", false],
//               ["BillType", "Bill Type", "select", false, dropdownData.BillType],
//               // ["BillType2", "Bill Colleation Type", "select", false, dropdownData.BillType2],
//               ["PriceType", "Price Type", "select", false, dropdownData.Price],
//               ["TaxType", "Tax Type", "select", false, dropdownData.TAX],
//               ["RefDt", "Reference Date", "date", false],
//               ["DueDT", "Due Date", "date", false],
//               ["Collection", "Collection", "select", false, dropdownData.Location],
//               ["DueDays", "Bill Due Days", "number", false],
//               ["OverDuePer", "OverDue Percentage(%)", "number", false],
//               ["BillAmt", "Bill Amount", "number", false],
//               ["Dely_Address", "Delivery Address", "textarea", false],
//               ["Remarks", "Remarks", "textarea", false],
//             ].map(([name, label, type, isRequired, options], index) => (
//               <div key={index} className={`flex items-center ${type === "textarea" ? "md:col-span-2" : ""}`}>
//                 <label className={`text-gray-700 font-medium ${type === "textarea" ? "lg:w-1/6" : ""} w-1/3 text-left`}>{label}</label>
//                 {type === "select" ? (
//                   <select
//                     name={name}
//                     value={formData.InvMst[name] || ""}
//                     onChange={(e) => handleInputChange(e)}
//                     className="bg-gray-100 border border-gray-300 p-2 rounded-md w-2/3 focus:outline-none focus:ring-2 focus:ring-gray-500"
//                     required={isRequired}
//                     // disabled={
//                     //   (name === "BillType" || name === "PriceType" || name === "TaxType") && disableFields
//                     // }
//                   >
//                     <option value="">Select {label}</option>
//                     {options?.map((option, idx) => (
//                       <option
//                         key={idx}
//                         value={
//                           name === "CustCd"
//                             ? option.CustomerCode  // For Customer dropdown
//                             : (name === "StockLoc" || name === "Collection")
//                               ? option.LocationCode // For Stock Location dropdown
//                               : option.DocCode // Fallback for other dropdowns
//                         }
//                       >
//                         {name === "CustCd"
//                           ? `${option.CustomerName} - ${option.CustomerCode}`
//                           : (name === "StockLoc" || name === "Collection")
//                             ? option.LocationName // For Stock Location dropdown
//                             : option.CodeDesc // Fallback for other dropdowns
//                         }
//                       </option>
//                     ))}
//                   </select>
//                 ) : type === "textarea" ? (
//                   <textarea
//                     name={name}
//                     value={formData.InvMst[name] || ""}
//                     onChange={(e) => handleInputChange(e)}
//                     className="bg-gray-100 border border-gray-300 p-2 rounded-md w-2/3 focus:outline-none focus:ring-2 focus:ring-gray-500 lg:w-5/6 resize-none"
//                     rows="2"
//                     required={isRequired}
//                   />
//                 ) : (
//                   <input
//                     type={type}
//                     name={name}
//                     value={type === "date" ? (formData.InvMst[name] ? moment(formData.InvMst[name]).format("YYYY-MM-DD") : "") : name === "BillAmt" ? calculateTotalNetAmt() : formData.InvMst[name] || ""}
//                     onChange={(e) => handleInputChange(e)}
//                     className={`p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none ${name === "OverDuePer" || name === "DueDays" ? "bg-gray-50 text-gray-700 cursor-not-allowed" : ""}`}
//                     required={isRequired}
//                     disabled={name === "OverDuePer" || name === "DueDays"}
//                   />
//                 )}
//               </div>
//             ))}
//           </div>
//           {loading ? (
//             <div className="flex justify-center items-center">
//               <svg
//                 className="animate-spin h-8 w-8 text-blue-500"
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//               >
//                 <circle
//                   className="opacity-25"
//                   cx="12"
//                   cy="12"
//                   r="10"
//                   stroke="currentColor"
//                   strokeWidth="4"
//                 ></circle>
//                 <path
//                   className="opacity-75"
//                   fill="currentColor"
//                   d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                 ></path>
//               </svg>
//             </div>
//           ) :
//             isBlacklisted ? (
//               <>
//                 <div className="flex justify-between items-center">
//                   <h6 className="text-xl font-bold py-5">Invoice Details</h6>
//                   {/* Radio Buttons for GST and Without GST */}
//                   {/* <div className=" mt-4">
//                     <label className="inline-flex items-center mr-4">
//                       <input
//                         type="radio"
//                         name="gstOption"
//                         value="withGst"
//                         checked={gstOption === "withGst"}
//                         onChange={() => {setGstOption("withGst")}}
//                         className="form-radio h-4 w-4 text-blue-600"
//                       />
//                       <span className="ml-2">With GST</span>
//                     </label>
//                     <label className="inline-flex items-center">
//                       <input
//                         type="radio"
//                         name="gstOption"
//                         value="withoutGst"
//                         checked={gstOption === "withoutGst"}
//                         onChange={() => setGstOption("withoutGst")}
//                         className="form-radio h-4 w-4 text-blue-600"
//                       />
//                       <span className="ml-2">Without GST</span>
//                     </label>
//                   </div> */}
//                   <div className="mt-4">
//                     <label className="inline-flex items-center mr-4">
//                       <input
//                         type="radio"
//                         name="gstOption"
//                         value="withGst"
//                         checked={gstOption === "withGst"}
//                         onChange={() => handleGstToggle("withGst")}
//                         className="form-radio h-4 w-4 text-blue-600"
//                       />
//                       <span className="ml-2">With GST</span>
//                     </label>
//                     <label className="inline-flex items-center">
//                       <input
//                         type="radio"
//                         name="gstOption"
//                         value="withoutGst"
//                         checked={gstOption === "withoutGst"}
//                         onChange={() => handleGstToggle("withoutGst")}
//                         className="form-radio h-4 w-4 text-blue-600"
//                       />
//                       <span className="ml-2">Without GST</span>
//                     </label>
//                   </div>

//                 </div>
//                 <div className="border shadow-md overflow-x-auto relative sm:rounded-lg">
//                   <table className="border border-gray-300 text-center text-gray-700 text-sm w-full">
//                     <thead className="bg-gray-200 text-gray-900 uppercase">
//                       <tr>
//                         {["SR No.", "Item", "QTY", "Price", "Discount", "NetPrice"]
//                           .concat(enabledCharges.map(charge => `${charge.name}(${charge.sign || "+"})`)) // Add enabled charge names
//                           .concat(["NetAmt", "Action"])
//                           .map((heading, index) => (
//                             <th key={index} className="border border-gray-300 px-3 py-2">{heading}</th>
//                           ))}
//                       </tr>
//                     </thead>

//                     <tbody>
//                       {formData.Invdet.Invdet.map((Bill, index) => {

//                         const qty = Number(Bill.QTY) || 0;
//                         const price = Number(Bill.Price) || 0;
//                         const discount = Number(Bill.Discount) || 0;
//                         const netPrice = (price - discount) * qty;   // Net price after discount
//                         const othAmt = Number(Bill.OthAmt) || 0;     // Additional charges
//                         // const othAmt = Number(Bill.OthAmt) || 0;     // Additional charges

//                         let totalCharges = 0;

//                         // ✅ Apply charges only if GST is selected
//                         if (gstOption === "withGst") {
//                           const chgValues = enabledCharges.map((charge) => {
//                             const chargeValue = Number(Bill[charge.key]) || 0; // Charge value
//                             const calculatedValue = netPrice * (chargeValue / 100); // Percentage of NetPrice
//                             return charge.sign === "+" ? calculatedValue : -calculatedValue;
//                           });
//                           // Sum up all the charge values
//                           totalCharges = chgValues.reduce((sum, chg) => sum + chg, 0);
//                         }

//                         // ✅ Final NetAmt calculation
//                         const netAmt = netPrice + othAmt + totalCharges;


//                         return (
//                           <tr key={index} className="border border-gray-300">
//                             <td className="border border-gray-300 py-2">{index + 1}</td>

//                             {/* <td className="border border-gray-300 p-2 min-w-[400px] relative">
//                               <input
//                                 type="text"
//                                 name="ICode"
//                                 autoComplete="off"
//                                 value={itemNameMap[index] || ""}
//                                 onChange={(e) => {
//                                   handleInputChange(e, "Invdet", index);
//                                   fetchItemDetails(e.target.value, index);
//                                 }}
//                                 className="bg-gray-100 border border-gray-300 p-1 rounded-md text-center w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
//                               />
//                               {dropdownVisibility[index] && (
//                                 <ul className="bg-white border border-gray-300 rounded-md shadow-lg absolute mt-1 z-10 w-full max-h-[calc(3*2rem)] overflow-y-auto">
//                                   {Array.isArray(filteredSearchResults) &&
//                                     filteredSearchResults.map((item) => (
//                                       <li
//                                         key={`${item.code}-${index}`}
//                                         onClick={() => handleItemSelect(item.code, item.name, index)}
//                                         className="p-2 cursor-pointer hover:bg-gray-100"
//                                       >
//                                         {item.name} - {item.code}
//                                       </li>
//                                     ))}
//                                 </ul>
//                               )}
//                             </td> */}
//                             <td className="border border-gray-300 p-2 min-w-[400px] relative">
//                               <div className="relative">
//                                 <input
//                                   id={`item-input-${index}`}
//                                   type="text"
//                                   placeholder="Select item..."
//                                   value={itemNameMap[index] || itemSearchTerm[index] || ""}
//                                   onChange={(e) => handleItemSearchChange(e, index)}
//                                   autoComplete="off"
//                                   onClick={() => {
//                                     // Open dropdown immediately on click if not already open
//                                     if (!itemDropdownState[index]) {
//                                       toggleItemDropdown(index, true);
//                                     }
//                                   }}
//                                   className="bg-gray-100 border border-gray-300 p-1 rounded-md text-center w-full focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
//                                   readOnly={!!itemNameMap[index]}
//                                 />
//                                 {itemNameMap[index] ? (
//                                   <button
//                                     type="button"
//                                     onClick={() => handleClearItem(index)}
//                                     className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-500"
//                                   >
//                                     <FontAwesomeIcon icon={faTimes} />
//                                   </button>
//                                 ) : (
//                                   <button
//                                     type="button"
//                                     onClick={() => toggleItemDropdown(index, !itemDropdownState[index])}
//                                     className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
//                                   >
//                                     <FontAwesomeIcon icon={itemDropdownState[index] ? faChevronUp : faChevronDown} />
//                                   </button>
//                                 )}
//                               </div>

//                               {itemDropdownState[index] && (
//                                 <div
//                                   id={`item-dropdown-${index}`}
//                                   className="absolute  bg-white border border-gray-300 rounded-md shadow-lg mt-1 w-full z-50 max-h-28 overflow-y-auto"
//                                 >
//                                   {itemSearchResults[index]?.length > 0 ? (
//                                     itemSearchResults[index]
//                                       .filter(item => {
//                                         return !selectedItems.has(item.code) ||
//                                           formData.Invdet.Invdet[index]?.ICode === item.code;
//                                       })
//                                       .filter(item => {
//                                         const searchTerm = (itemSearchTerm[index] || "").toLowerCase();
//                                         if (!searchTerm) return true;
//                                         return (
//                                           item.name.toLowerCase().includes(searchTerm) ||
//                                           item.code.toLowerCase().includes(searchTerm)
//                                         );
//                                       })
//                                       .map((item) => (
//                                         <div
//                                           key={`${item.code}-${index}`}
//                                           onClick={() => {
//                                             setItemNameMap(prev => ({
//                                               ...prev,
//                                               [index]: `${item.name} - ${item.code}`
//                                             }));
//                                             setItemSearchTerm(prev => ({ ...prev, [index]: "" }));
//                                             handleItemSelect(item.code, item.name, index);
//                                             toggleItemDropdown(index, false);
//                                           }}
//                                           className="p-2 cursor-pointer hover:bg-gray-100 flex justify-between"
//                                         >
//                                           <span>
//                                             {item.name} - {item.code}
//                                           </span>
//                                           {selectedItems.has(item.code) && formData.Invdet.Invdet[index]?.ICode !== item.code && (
//                                             <span className="text-green-500">
//                                               <FontAwesomeIcon icon={faCheck} />
//                                             </span>
//                                           )}
//                                         </div>
//                                       ))
//                                   ) : (
//                                     <div className="p-2 text-gray-500">No items found</div>
//                                   )}
//                                 </div>
//                               )}
//                             </td>
//                             {/* QTY Input */}
//                             <td className="border border-gray-300 p-2">
//                               <input
//                                 type="number"
//                                 name="QTY"
//                                 value={qty}
//                                 onChange={(e) => handleInputChange(e, "Invdet", index)}
//                                 className="bg-gray-100 border border-gray-300 p-1 rounded-md text-center w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
//                               />
//                             </td>

//                             {/* Price Input */}
//                             <td className="border border-gray-300 p-2">
//                               <input
//                                 type="number"
//                                 name="Price"
//                                 value={price}
//                                 onChange={(e) => handleInputChange(e, "Invdet", index)}
//                                 className="bg-gray-100 border border-gray-300 p-1 rounded-md text-center w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
//                               />
//                             </td>

//                             {/* Discount Input */}
//                             <td className="border border-gray-300 p-2">
//                               <input
//                                 type="number"
//                                 name="Discount"
//                                 value={discount}
//                                 onChange={(e) => handleInputChange(e, "Invdet", index)}
//                                 className="bg-gray-100 border border-gray-300 p-1 rounded-md text-center w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
//                               />
//                             </td>

//                             {/* NetPrice Input (Auto-calculated) */}
//                             <td className="border border-gray-300 p-2">
//                               <input
//                                 type="number"
//                                 name="NetPrice"
//                                 value={netPrice}
//                                 readOnly
//                                 className="bg-gray-200 border border-gray-300 p-1 rounded-md text-center w-full"
//                               />
//                             </td>

//                             {/* Enabled Charges Inputs */}
//                             {enabledCharges.map((charge) => {
//                               const chargeValue = gstOption === "withGst" ? Number(Bill[charge.key]) || 0 : 0; // Charge value from input or 0 if without GST
//                               const calculatedValue = netPrice * (chargeValue / 100); // Calculate percentage of NetPrice
//                               const finalAns = charge.sign === "+" ? calculatedValue : -calculatedValue;

//                               return (
//                                 <td key={charge.key} className="border border-gray-300 p-2">
//                                   {/* Input for Charge Value */}
//                                   <input
//                                     type="number"
//                                     name={charge.key}
//                                     value={chargeValue}
//                                     onChange={(e) => handleInputChange(e, "Invdet", index)}
//                                     className="bg-gray-100 border border-gray-300 p-1 rounded-md text-center w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                     disabled={gstOption === "withoutGst"} // Disable input if without GST
//                                   />

//                                   {/* Calculated Value Display */}
//                                   <input
//                                     type="number"
//                                     readOnly
//                                     value={finalAns.toFixed(2)} // Display calculated value with 2 decimal places
//                                     className="bg-gray-200 border border-gray-300 p-1 rounded-md text-center w-full focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
//                                   />
//                                 </td>
//                               );
//                             })}
//                             {/* NetAmt Input (Auto-calculated) */}
//                             <td className="border border-gray-300 p-2">
//                               <input
//                                 type="number"
//                                 name="NetAmt"
//                                 value={netAmt}
//                                 onChange={(e) => handleInputChange(e, "Invdet", index)}
//                                 readOnly
//                                 className="bg-gray-200 border border-gray-300 p-1 rounded-md text-center w-full"
//                               />
//                             </td>

//                             {/* Action Button (Remove Row) */}
//                             <td className="border border-gray-300 py-2">
//                               {formData.Invdet.Invdet.length > 1 && (
//                                 <button
//                                   type="button"
//                                   onClick={() => handleRemoveInvoiceDetail(index)}
//                                   className="bg-red-600 rounded-md text-white hover:bg-red-700 px-3 py-1 transition"
//                                 >
//                                   <FontAwesomeIcon icon={faTrash} />
//                                 </button>
//                               )}
//                             </td>
//                           </tr>
//                         );
//                       })}
//                     </tbody>
//                     {/* Total NetAmt Row */}
//                     <tfoot>
//                       <tr className="bg-gray-200 font-bold">
//                         <td colSpan={6 + enabledCharges.length} className="border border-gray-300 text-right py-2">Total NetAmt:</td>
//                         <td className="border border-gray-300 text-center py-2">
//                           {calculateTotalNetAmt().toFixed(2)}
//                         </td>
//                         <td className="border border-gray-300 py-2"></td>
//                       </tr>
//                       <tr>
//                         <td colSpan={10 + enabledCharges.length} className="text-center px-4 py-3">
//                           <button
//                             type="button"
//                             onClick={handleAddInvoiceDetail}
//                             className="bg-blue-600 rounded-md text-white hover:bg-blue-700 px-4 py-2 transition"
//                           >
//                             + Add New Row
//                           </button>
//                         </td>
//                       </tr>
//                     </tfoot>
//                   </table>
//                 </div>
//                 <div className="flex justify-between items-center mt-4">
//                   <button
//                     type="button"
//                     onClick={handleCancel}
//                     className="bg-gray-500 rounded-lg text-white duration-200 hover:bg-gray-600 px-6 py-2 transition"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     className={`bg-blue-600 rounded-lg text-white duration-200 hover:bg-blue-700 px-6 py-2 transition ${calculateTotalNetAmt() === 0 ? 'opacity-50' : ''} `}
//                     disabled={calculateTotalNetAmt() === 0 || submitting}
//                   >
//                     {submitting ?
//                       <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                       </svg> :
//                       "Submit"}
//                   </button>
//                 </div>
//               </>
//             ) : ""}
//         </form>
//       </div>
//     </div>
//   );
// };

// export default InvoiceMaster;


"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  addInvoice,
  fetchDropdownData,
  USPInvoiceCustItemLocationChanged,
  USPITEMWiseTaxDetails,
  USPSearchInvoiceItem,
} from "@/lib/masterService";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAlignLeft, faChevronDown, faChevronUp, faTimes, faTrash } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const InvoiceMaster = () => {
  const { setIsSidebarOpen, userDetail } = useAuth();
  const [dropdownVisibility, setDropdownVisibility] = useState({});
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState({ name: "", code: "" });
  const [isItemSelected, setIsItemSelected] = useState({});
  const [originalCharges, setOriginalCharges] = useState({});
  const initialState = {
    InvMst: {
      BGNDT: moment().format("YYYY-MM-DD"),
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
  const [itemNameMap, setItemNameMap] = useState({});
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [gstOption, setGstOption] = useState("withoutGst");
  const [enabledCharges, setEnabledCharges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isItemDropdownOpen, setIsItemDropdownOpen] = useState({});
  const Finyear = userDetail.FinancialYear.replace(/-/g, '_');
  const [itemSearchTerm, setItemSearchTerm] = useState({});

  useEffect(() => {
    const handleClickOutside = (e) => {
      const isClickInsideAnyItemDropdown = Object.keys(isItemDropdownOpen).some(index => {
        const dropdownElement = document.getElementById(`item-dropdown-${index}`);
        const inputElement = document.getElementById(`item-input-${index}`);
        return (dropdownElement && dropdownElement.contains(e.target)) ||
          (inputElement && inputElement.contains(e.target));
      });

      const customerDropdownElement = document.getElementById('customer-dropdown');
      const customerInputElement = document.getElementById('customer-input');
      const isClickInsideCustomerDropdown =
        (customerDropdownElement && customerDropdownElement.contains(e.target)) ||
        (customerInputElement && customerInputElement.contains(e.target));

      if (!isClickInsideAnyItemDropdown) {
        setIsItemDropdownOpen({});
      }

      if (isCustomerDropdownOpen && !isClickInsideCustomerDropdown) {
        setIsCustomerDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isItemDropdownOpen, isCustomerDropdownOpen]);

  useEffect(() => {
    const fetchTaxDetailsForAllItems = async () => {
      if (gstOption === "withGst") {
        const updatedFormData = { ...formData };

        for (let index = 0; index < formData.Invdet.Invdet.length; index++) {
          const itemCode = formData.Invdet.Invdet[index].ICode;

          if (itemCode) {
            try {
              const taxDetails = await USPITEMWiseTaxDetails({
                itemCode,
                taxType: formData.InvMst.TaxType,
                priceType: formData.InvMst.PriceType,
              });

              if (taxDetails) {
                const chgCodes = taxDetails.CHGCODE.split("*/");
                const chgColumns = taxDetails.CHGColumns.split("*/");
                const priceColumns = taxDetails.priceColumns.split("*/");

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

                updatedFormData.Invdet.Invdet[index] = {
                  ...updatedFormData.Invdet.Invdet[index],
                  Price: parseFloat(priceColumns[0]),
                  Discount: parseFloat(priceColumns[1]),
                  ...enabledCharges.reduce((acc, charge) => {
                    acc[charge.key] = charge.value;
                    return acc;
                  }, {}),
                };
              }
            } catch (error) {
              console.log(`Error fetching tax details for item ${itemCode}:`, error);
            }
          }
        }

        setFormData(updatedFormData);
      }
    };

    fetchTaxDetailsForAllItems();
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
      console.log(`Error fetching ${MstCode}:`, error);
    }
  };

  const toggleItemDropdown = (index, isOpen) => {
    if (isOpen) {
      const newState = {};
      Object.keys(isItemDropdownOpen).forEach(i => {
        newState[i] = false;
      });
      newState[index] = true;
      setIsItemDropdownOpen(newState);

      fetchItemDetails("", index);
    } else {
      setIsItemDropdownOpen(prev => ({
        ...prev,
        [index]: false
      }));
    }
  };

  const handleClearItem = (index) => {
    const currentItemCode = formData.Invdet.Invdet[index].ICode;

    setItemNameMap(prev => {
      const newMap = { ...prev };
      delete newMap[index];
      return newMap;
    });

    setItemSearchTerm(prev => ({ ...prev, [index]: "" }));

    setSelectedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(currentItemCode);
      return newSet;
    });

    setFormData(prev => {
      const newData = { ...prev };
      newData.Invdet.Invdet[index] = {
        ...initialState.Invdet.Invdet[0]
      };
      return newData;
    });

    setIsItemSelected(prev => ({
      ...prev,
      [index]: false
    }));

    toggleItemDropdown(index, true);
  };

  const toggleCustomerDropdown = () => {
    Object.keys(isItemDropdownOpen).forEach(index => {
      if (isItemDropdownOpen[index]) {
        toggleItemDropdown(index, false);
      }
    });

    setIsCustomerDropdownOpen(prev => !prev);
  };

  const parseChargesDetails = (chargesString) => {
    const chargesArray = chargesString.split("*/");
    const enabledCharges = [];

    chargesArray.forEach((charge, index) => {
      const parts = charge.split("~");
      if (parts.length >= 3) {
        const isEnabled = parts[2];
        if (isEnabled === "Y") {
          enabledCharges.push({
            key: `CHG${index + 1}`,
            name: parts[1],
          });
        }
      }
    });

    return enabledCharges;
  };

  const filteredCustomers = dropdownData.Customer.filter((customer) =>
    customer.CustomerName.toLowerCase().includes(customerSearchTerm.toLowerCase()) || 
    customer.CustomerCode.toLowerCase().includes(customerSearchTerm.toLowerCase())
  );

  const handleCustomerSelect = (customerCode, customerName) => {
    setSelectedCustomer({ name: customerName, code: customerCode });
    setFormData((prev) => ({
      ...prev,
      InvMst: {
        ...prev.InvMst,
        CustCd: customerCode,
      },
    }));
    setIsCustomerDropdownOpen(false);
    fetchCustomerDetails(customerCode);
  };

  const fetchCustomerDetails = async (customerCode) => {
    setLoading(true);
    try {
      const response = await USPInvoiceCustItemLocationChanged({
        CustCd: customerCode,
      });

      if (response.status) {
        const customerData = response.data;

        if (customerData.IsBlackList === "1") {
          Swal.fire({
            icon: "error",
            title: "Blacklisted Customer",
            text: "The Same Customer has been declared as Black Listed",
            confirmButtonText: "OK",
            confirmButtonColor: "#d33",
          });
          setIsBlacklisted(false);
          setFormData(initialState);
          setDisableFields(false);
          setSelectedCustomer({ name: "", code: "" });
          return;
        } else {
          setIsBlacklisted(true);
          setDisableFields(true);
        }

        const enabledCharges = parseChargesDetails(customerData.ChargesDetails);
        setEnabledCharges(enabledCharges);

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
      console.log("Error fetching customer details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchItemDetails = async (prefixText, index) => {
    try {
      const itemDetails = await USPSearchInvoiceItem();
      setSearchResults(itemDetails.data || []);
      setDropdownVisibility((prev) => ({ ...prev, [index]: true }));
    } catch (error) {
      console.log("Error fetching item details:", error);
      setSearchResults([]);
    }
  };

  const handleItemSelect = async (itemCode, itemName, index) => {
    
    try {
      const currentItemCode = formData.Invdet.Invdet[index]?.ICode;

      setItemSearchTerm(prev => ({ ...prev, [index]: "" }));

      setSelectedItems(prev => {
        const newSet = new Set(prev);
        if (currentItemCode) {
          newSet.delete(currentItemCode);
        }
        newSet.add(itemCode);
        return newSet;
      });

      setItemNameMap(prev => ({
        ...prev,
        [index]: `${itemName} - ${itemCode}`,
      }));

      setDropdownVisibility((prev) => ({ ...prev, [index]: false }));
      setIsItemDropdownOpen(prev => ({ ...prev, [index]: false }));
      setIsItemSelected((prev) => ({
        ...prev,
        [index]: true,
      }));

      setFormData((prev) => {
        const newData = { ...prev };
        newData.Invdet.Invdet[index].ICode = itemCode;
        return newData;
      });

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

      const chgCodes = taxDetails.CHGCODE.split("*/");
      const chgColumns = taxDetails.CHGColumns.split("*/");
      const priceColumns = taxDetails.priceColumns.split("*/");

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

      setEnabledCharges(enabledCharges);

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
      console.log("An error occurred while handling item selection:", error);
    }
  };

  const handleInputChange = (e, section = "InvMst", index = 0) => {
    const { name, value, type, checked } = e.target;
    const updatedValue = type === "checkbox" ? checked : value;

    setFormData((prev) => {
      const newData = { ...prev };

      if (section === "InvMst") {
        newData.InvMst[name] = updatedValue;
        if (name === "CustCd") {
          if (updatedValue) {
            fetchCustomerDetails(updatedValue);
          } else {
            setFormData(initialState);
            setDisableFields(false);
          }
        }
      } else if (section === "Invdet") {
        if (name === "ICode" && updatedValue === "") {
          const currentItemCode = newData.Invdet.Invdet[index].ICode;

          if (currentItemCode) {
            setSelectedItems(prev => {
              const newSet = new Set(prev);
              newSet.delete(currentItemCode);
              return newSet;
            });
          }

          newData.Invdet.Invdet[index] = {
            ...initialState.Invdet.Invdet[0],
          };

          setItemNameMap(prev => {
            const newMap = { ...prev };
            delete newMap[index];
            return newMap;
          });

          setIsItemSelected(prev => ({
            ...prev,
            [index]: false,
          }));
        } else {
          newData.Invdet.Invdet[index] = {
            ...newData.Invdet.Invdet[index],
            [name]: updatedValue
          };
        }

        if (name === "QTY" || name === "Price" || name === "Discount") {
          const qty = Number(newData.Invdet.Invdet[index].QTY) || 0;
          const price = Number(newData.Invdet.Invdet[index].Price) || 0;
          const discount = Number(newData.Invdet.Invdet[index].Discount) || 0;
          newData.Invdet.Invdet[index].NetPrice = (price - discount) * qty;
        }

        const netPrice = Number(newData.Invdet.Invdet[index].NetPrice) || 0;
        const othAmt = Number(newData.Invdet.Invdet[index].OthAmt) || 0;

        let totalCharges = 0;
        if (gstOption === "withGst") {
          totalCharges = enabledCharges.reduce((sum, charge) => {
            const chargeValue = Number(newData.Invdet.Invdet[index][charge.key]) || 0;
            const calculatedValue = netPrice * (chargeValue / 100);
            return sum + (charge.sign === "+" ? calculatedValue : -calculatedValue);
          }, 0);
        } else {
          enabledCharges.forEach(charge => {
            newData.Invdet.Invdet[index][charge.key] = 0;
          });
        }

        newData.Invdet.Invdet[index].NetAmt = netPrice + othAmt + totalCharges;
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
    setItemNameMap((prev) => ({
      ...prev,
      [formData.Invdet.Invdet.length]: "",
    }));
  };

  const handleRemoveInvoiceDetail = (index) => {
    const removedItemCode = formData.Invdet.Invdet[index].ICode;

    setSelectedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(removedItemCode);
      return newSet;
    });

    setFormData((prev) => ({
      ...prev,
      Invdet: {
        Invdet: prev.Invdet.Invdet.filter((_, i) => i !== index),
      },
    }));

    setItemNameMap((prev) => {
      const newItemNameMap = { ...prev };
      delete newItemNameMap[index];
      const updatedItemNameMap = {};
      Object.keys(newItemNameMap).forEach((key) => {
        const newKey = key > index ? key - 1 : key;
        updatedItemNameMap[newKey] = newItemNameMap[key];
      });
      return updatedItemNameMap;
    });

    setDropdownVisibility((prev) => {
      const newVisibility = { ...prev };
      delete newVisibility[index];
      const updatedVisibility = {};
      Object.keys(newVisibility).forEach((key) => {
        const newKey = key > index ? key - 1 : key;
        updatedVisibility[newKey] = newVisibility[key];
      });
      return updatedVisibility;
    });

    setIsItemDropdownOpen((prev) => {
      const newDropdownOpen = { ...prev };
      delete newDropdownOpen[index];
      const updatedDropdownOpen = {};
      Object.keys(newDropdownOpen).forEach((key) => {
        const newKey = key > index ? key - 1 : key;
        updatedDropdownOpen[newKey] = newDropdownOpen[key];
      });
      return updatedDropdownOpen;
    });
  };

  // const filteredSearchResults = searchResults.filter(
  //   (item) => !selectedItems.has(item.code) || 
  //     formData.Invdet.Invdet.some((row, i) => i === index && row.ICode === item.code)
  // );

  const calculateTotalNetAmt = () => {
    return formData.Invdet.Invdet.reduce((total, Bill) => {
      const qty = Number(Bill.QTY) || 0;
      const price = Number(Bill.Price) || 0;
      const discount = Number(Bill.Discount) || 0;
      const netPrice = (price - discount) * qty;
      const othAmt = Number(Bill.OthAmt) || 0;
      const chgValues = gstOption === "withGst" ? enabledCharges.map((charge) => {
        const chargeValue = Number(Bill[charge.key]) || 0;
        const calculatedValue = netPrice * (chargeValue / 100);
        return charge.sign === "+" ? calculatedValue : -calculatedValue;
      }) : [];
      return total + (netPrice + othAmt + chgValues.reduce((sum, chg) => sum + chg, 0));
    }, 0);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setItemNameMap({});
    setSelectedItems(new Set());
    const allItemsSelected = formData.Invdet.Invdet.every(
      (_, index) => isItemSelected[index] === true
    );

    if (!allItemsSelected) {
      toast.error("Please select an ICode from the dropdown for all rows.");
      return;
    }

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

    const payload = JSON.parse(JSON.stringify(formData));

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
      detail.DelQty = detail.QTY;
    });

    payload.CompanyCode = String(userDetail.CompanyCode);
    payload.Finyear = Finyear;
    payload.Billno = "";
    payload.InvMst.BillType2 = "1";
    payload.Brcd = userDetail.LocationCode;
    payload.InvMst.BillAmt = calculateTotalNetAmt();

    try {
      setSubmitting(true);
      const response = await addInvoice(payload);

      if (response.status) {
        toast.success(response.message);
        setFormData(initialState);
        setItemNameMap({});
        setSelectedCustomer({ name: "", code: "" });
      } else {
        toast.error(response.data.message || "An error occurred while processing your request.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
      setIsBlacklisted(false);
    }
  };

  const handleGstToggle = (option) => {
    setGstOption(option);

    setFormData(prev => {
      const newData = { ...prev };

      newData.Invdet.Invdet = newData.Invdet.Invdet.map((item, index) => {
        const qty = Number(item.QTY) || 0;
        const price = Number(item.Price) || 0;
        const discount = Number(item.Discount) || 0;
        const netPrice = (price - discount) * qty;
        const othAmt = Number(item.OthAmt) || 0;

        if (option === "withoutGst") {
          const chargesSnapshot = {};
          enabledCharges.forEach(charge => {
            chargesSnapshot[charge.key] = item[charge.key];
            item[charge.key] = 0;
          });
          setOriginalCharges(prev => ({ ...prev, [index]: chargesSnapshot }));
        } else if (option === "withGst" && originalCharges[index]) {
          Object.entries(originalCharges[index]).forEach(([key, value]) => {
            item[key] = value;
          });
        }

        let totalCharges = 0;
        if (option === "withGst") {
          totalCharges = enabledCharges.reduce((sum, charge) => {
            const chargeValue = Number(item[charge.key]) || 0;
            return sum + (netPrice * (chargeValue / 100) * (charge.sign === "+" ? 1 : -1));
          }, 0);
        }

        return {
          ...item,
          NetPrice: netPrice,
          NetAmt: netPrice + othAmt + totalCharges
        };
      });

      return newData;
    });
  };

  const handleCancel = () => {
    setFormData(initialState);
    setItemNameMap({});
    setSelectedItems(new Set());
    setSelectedCustomer({ name: "", code: "" });
    setIsBlacklisted(false);
  };

  return (
    <div className="h-full">
      <button
        className="flex text-xl justify-start p-3 text-black lg:hidden"
        onClick={() => setIsSidebarOpen(true)}
      >
        <FontAwesomeIcon icon={faAlignLeft} />
      </button>
      <div className="bg-white p-2 md:p-8 rounded-lg shadow-lg space-y-8">
        <h4 className="text-xl font-bold text-center">Invoice Master</h4>
        <form onSubmit={handleAddSubmit} className="bg-white border-2 p-6 rounded-lg space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className={`flex items-center`}>
              <label className={`text-gray-700 font-medium w-1/3 text-left`}>Customer Name</label>
              <div className="relative w-2/3">
                <div
                  id="customer-input"
                  className="bg-gray-100 border border-gray-300 p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer"
                  onClick={() => setIsCustomerDropdownOpen(!isCustomerDropdownOpen)}
                >
                  {selectedCustomer.name || selectedCustomer.code
                    ? `${selectedCustomer.name} - ${selectedCustomer.code}`
                    : "Select Customer"}
                </div>

                {isCustomerDropdownOpen && (
                  <div id="customer-dropdown" className="absolute bg-gray-100 border border-gray-300 rounded-md shadow-2xl mt-1 w-full z-10">
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
                    className="bg-gray-100 border border-gray-300 p-2 rounded-md w-2/3 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    required={isRequired}
                  >
                    <option value="">Select {label}</option>
                    {options?.map((option, idx) => (
                      <option
                        key={idx}
                        value={
                          name === "StockLoc" || name === "Collection"
                            ? option.LocationCode
                            : option.DocCode
                        }
                      >
                        {name === "StockLoc" || name === "Collection"
                          ? option.LocationName
                          : option.CodeDesc
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
                    className={`p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none ${name === "OverDuePer" || name === "DueDays" ? "bg-gray-50 text-gray-700 cursor-not-allowed" : ""}`}
                    required={isRequired}
                    disabled={name === "OverDuePer" || name === "DueDays"}
                  />
                )}
              </div>
            ))}
          </div>
          {loading ? (
            <div className="flex justify-center items-center">
              <svg
                className="animate-spin h-8 w-8 text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          ) : isBlacklisted ? (
            <>
              <div className="flex justify-between items-center">
                <h6 className="text-xl font-bold py-5">Invoice Details</h6>
                <div className="mt-4">
                  <label className="inline-flex items-center mr-4">
                    <input
                      type="radio"
                      name="gstOption"
                      value="withGst"
                      checked={gstOption === "withGst"}
                      onChange={() => handleGstToggle("withGst")}
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
                      onChange={() => handleGstToggle("withoutGst")}
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
                      {["SR No.", "Item", "QTY", "Price", "Discount", "NetPrice"]
                        .concat(enabledCharges.map(charge => `${charge.name}(${charge.sign || "+"})`))
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
                      const netPrice = (price - discount) * qty;
                      const othAmt = Number(Bill.OthAmt) || 0;

                      let totalCharges = 0;
                      if (gstOption === "withGst") {
                        const chgValues = enabledCharges.map((charge) => {
                          const chargeValue = Number(Bill[charge.key]) || 0;
                          const calculatedValue = netPrice * (chargeValue / 100);
                          return charge.sign === "+" ? calculatedValue : -calculatedValue;
                        });
                        totalCharges = chgValues.reduce((sum, chg) => sum + chg, 0);
                      }

                      const netAmt = netPrice + othAmt + totalCharges;

                      return (
                        <tr key={index} className="border border-gray-300">
                          <td className="border border-gray-300 py-2">{index + 1}</td>
                          <td className="border border-gray-300 p-2 min-w-[400px] relative">
                            <div className="relative">
                              <div
                                id={`item-input-${index}`}
                                className="bg-gray-100 border border-gray-300 p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer"
                                onClick={() => toggleItemDropdown(index, !isItemDropdownOpen[index])}
                              >
                                {itemNameMap[index] || "Select Item"}
                              </div>
                              {itemNameMap[index] && (
                                <button
                                  type="button"
                                  onClick={() => handleClearItem(index)}
                                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-500"
                                >
                                  <FontAwesomeIcon icon={faTimes} />
                                </button>
                              )}
                              {isItemDropdownOpen[index] && (
                                <div
                                  id={`item-dropdown-${index}`}
                                  className="absolute bg-gray-100 h-[100px] overflow-auto border border-gray-300 rounded-md shadow-2xl mt-1 w-full z-10"
                                >
                                  <input
                                    type="text"
                                    placeholder="Search item..."
                                    value={itemSearchTerm[index] || ""}
                                    onChange={(e) => setItemSearchTerm(prev => ({ ...prev, [index]: e.target.value }))}
                                    className="p-2 border-b bg-gray-100 border-gray-300 w-full focus:outline-none focus:ring-2 focus:ring-gray-500"
                                  />
                                  <div className="max-h-60 overflow-y-auto">
                                    {searchResults
                                      .filter(item => {
                                        const searchTerm = (itemSearchTerm[index] || "").toLowerCase();
                                        return (
                                          !selectedItems.has(item.code) ||
                                          formData.Invdet.Invdet[index]?.ICode === item.code
                                        ) && (
                                          !searchTerm ||
                                          item.name.toLowerCase().includes(searchTerm) ||
                                          item.code.toLowerCase().includes(searchTerm)
                                        );
                                      })
                                      .map((item) => (
                                        <div
                                          key={`${item.code}-${index}`}
                                          onClick={() => handleItemSelect(item.code, item.name, index)}
                                          className="py-1 px-2 text-start cursor-pointer hover:bg-gray-100"
                                        >
                                          {item.name} - {item.code}
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="border border-gray-300 p-2">
                            <input
                              type="number"
                              name="QTY"
                              value={qty}
                              onChange={(e) => handleInputChange(e, "Invdet", index)}
                              className="bg-gray-100 border border-gray-300 p-1 rounded-md text-center w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="border border-gray-300 p-2">
                            <input
                              type="number"
                              name="Price"
                              value={price}
                              onChange={(e) => handleInputChange(e, "Invdet", index)}
                              className="bg-gray-100 border border-gray-300 p-1 rounded-md text-center w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="border border-gray-300 p-2">
                            <input
                              type="number"
                              name="Discount"
                              value={discount}
                              onChange={(e) => handleInputChange(e, "Invdet", index)}
                              className="bg-gray-100 border border-gray-300 p-1 rounded-md text-center w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="border border-gray-300 p-2">
                            <input
                              type="number"
                              name="NetPrice"
                              value={netPrice}
                              readOnly
                              className="bg-gray-200 border border-gray-300 p-1 rounded-md text-center w-full"
                            />
                          </td>
                          {enabledCharges.map((charge) => {
                            const chargeValue = gstOption === "withGst" ? Number(Bill[charge.key]) || 0 : 0;
                            const calculatedValue = netPrice * (chargeValue / 100);
                            const finalAns = charge.sign === "+" ? calculatedValue : -calculatedValue;

                            return (
                              <td key={charge.key} className="border border-gray-300 p-2">
                                <input
                                  type="number"
                                  name={charge.key}
                                  value={chargeValue}
                                  onChange={(e) => handleInputChange(e, "Invdet", index)}
                                  className="bg-gray-100 border border-gray-300 p-1 rounded-md text-center w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  disabled={gstOption === "withoutGst"}
                                />
                                <input
                                  type="number"
                                  readOnly
                                  value={finalAns.toFixed(2)}
                                  className="bg-gray-200 border border-gray-300 p-1 rounded-md text-center w-full focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                                />
                              </td>
                            );
                          })}
                          <td className="border border-gray-300 p-2">
                            <input
                              type="number"
                              name="NetAmt"
                              value={netAmt}
                              readOnly
                              className="bg-gray-200 border border-gray-300 p-1 rounded-md text-center w-full"
                            />
                          </td>
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
                  className={`bg-blue-600 rounded-lg text-white duration-200 hover:bg-blue-700 px-6 py-2 transition ${calculateTotalNetAmt() === 0 ? 'opacity-50' : ''}`}
                  disabled={calculateTotalNetAmt() === 0 || submitting}
                >
                  {submitting ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
            </>
          ) : ""}
        </form>
      </div>
    </div>
  );
};

export default InvoiceMaster;