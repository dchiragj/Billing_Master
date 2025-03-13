
"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Table from '../components/Table';
import { addItem, fetchDropdownData, Finyear, getItemLocation, getItemPrice, getItemTax, getProductData } from '@/lib/masterService';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { toast } from 'react-toastify';

const ProductMaster = () => {
  const fileInputRefs = useRef([]);
  const [productData, setProductData] = useState({});
  const { setIsSidebarOpen, userDetail } = useAuth();
  const [selectedFile, setSelectedFile] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    IMst: [{
      IName: "",
      IGroup: "",
      LocationId: 1,
      IDesc: "",
      TentativeDate: new Date().toISOString().split('T')[0] + "T00:00:00",
      HSNCode: "",
      Category: "",
      VendorCode: "",
      Size: "",
      Weight: "",
      Status: "",
      Price: 0,
      Unit: "",
      MinStock: 0,
      IsMinStockAlert: 1,
      Doc_Path: "",
      SDesc: "",
      PDesc: "",
      Finyear: Finyear,
      CompanyCode: userDetail.CompanyCode,
      Installation: 0,
      IsActive: 1,
      EntryBy: userDetail.UserId,

    }],
    ITaxDetail: {
      Taxdata: []
    },
    IPriceDetail: {
      PriceData: []
    },
    rackDetails: {
      LocData: []
    },
    IImageData: {
      Images: [
        {
          ImageName: "",
          ImageFile: null
        }
      ]
    },
    Finyear: Finyear,
    CompanyCode: userDetail.CompanyCode
  });
  const [dropdownData, setDropdownData] = useState({
    IUnit: [],
    IStatus: [],
    Location: [],
  });

  useEffect(() => {
    if (userDetail?.CompanyCode) {
      fetchData();
      Object.keys(dropdownData).forEach((key) => {
        handleDropdownData(userDetail.CompanyCode, key);
      });
    }
  }, [userDetail?.CompanyCode]);

  async function fetchData() {
    setLoading(true);
    try {
      const data = await getProductData(userDetail.CompanyCode);
      setProductData(data);
    } catch (error) {
      console.error("Failed to fetch product data:", error);
    } finally {
      setLoading(false);
    }
  }

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

  const handleInputChange = (e, section = "IMst", index = 0) => {
    const { name, value, type, checked, files } = e.target;
    let updatedValue = type === "checkbox" ? checked : value;

    // if (type === "file") {
    //   updatedValue = files[0];
    // }

    setFormData((prev) => {
      const newData = { ...prev };
      if (section === "IMst") {
        newData.IMst[0][name] = updatedValue;
      } else if (section === "ITaxDetail") {
        newData.ITaxDetail.Taxdata[index][name] = updatedValue;
      } else if (section === "rackDetails") {
        newData.rackDetails.LocData[index][name] = updatedValue;
      } else if (section === "IPriceDetail") {
        newData.IPriceDetail.PriceData[index][name] = updatedValue;
      } else if (section === "IImageData") {
        newData.IImageData.Images[index][name] = updatedValue;
      }
      return newData;
    });
  };

  const tableHeadersItemDetails = ['Product Name', 'Description', 'Category', 'ICode', 'Price', 'Weight', 'Action'];
  const filteredDataItemDetails = Object.keys(productData).length > 0 && productData.itemDetails.map((itemDetail) => ({
    'Product Name': itemDetail.IName || "-",
    'Description': itemDetail.IDesc || "-",
    'Category': itemDetail.Category || "-",
    'Product Code': itemDetail.ICode || "-",
    'Price': itemDetail.Price || "-",
    'Weight': itemDetail.Weight || "-",
    Action: (
      <button
        onClick={() => handleEditClick(itemDetail)}
        className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
      >
       <FontAwesomeIcon icon={faEdit} className="h-5 w-5" />
      </button>
    ),
  }));

  const handleEditClick = async (product) => {
    setIsEdit(true);
    setLoading(true);

    try {
      const data = await getProductData(userDetail.CompanyCode, product.ICode);

      setFormData({
        IMst: data.itemDetails,
        ITaxDetail: { Taxdata: data.taxData },
        rackDetails: { LocData: data.rackDetails },
        IPriceDetail: { PriceData: data.priceData },
        IImageData: {
          Images: data.itemImages.map(image => ({
            ImageName: image.ImageName,
            ImageFile: image.ImageFile
          }))
        },
        Finyear: Finyear,
        CompanyCode: userDetail.CompanyCode,
        ICode: data.itemDetails[0].ICode
      });
    } catch (error) {
      console.error("Failed to fetch item details:", error);
    } finally {
      setLoading(false);
      setModalOpen(true);
    }
  };

  const handleAddClick = async () => {
    setIsEdit(false);
    const productLocationData = await getItemLocation(userDetail.CompanyCode);
    const productPriceData = await getItemPrice(userDetail.CompanyCode);
    const productTaxData = await getItemTax(userDetail.CompanyCode);

    setFormData({
      IMst: [{
        IName: "",
        IGroup: "",
        LocationId: "",
        IDesc: "",
        TentativeDate: new Date().toISOString().split('T')[0] + "T00:00:00",
        HSNCode: "",
        Category: "",
        VendorCode: "",
        Size: "",
        Weight: "",
        Status: "",
        Price: 0,
        Unit: "",
        MinStock: 0,
        IsMinStockAlert: 0,
        Doc_Path: "",
        SDesc: "",
        PDesc: "",
        Finyear: Finyear,
        CompanyCode: userDetail.CompanyCode,
        Installation: 0,
        IsActive: 1,
        EntryBy: userDetail.UserId
      }],
      ITaxDetail: {
        Taxdata: productTaxData
      },
      IPriceDetail: {
        PriceData: productPriceData
      },
      rackDetails: {
        LocData: productLocationData
      },
      IImageData: {
        Images: [
          {
            ImageName: "",
            ImageFile: null
          }
        ]
      },
      Finyear: Finyear,
      CompanyCode: userDetail.CompanyCode
    });

    setModalOpen(true);
  };

  // const handleAddSubmit = async (e) => {
  //   e.preventDefault();
  //   try {
  //     let response;
  //     response = await addItem(formData); // Call the API to add an item
  
  //     if (response.status) {
  //       // Success case
  //       toast.success(response.message || "Item added successfully!"); // Show success toast
  //       fetchData(); // Refresh data
  //       setModalOpen(false); // Close modal
  //       setFormData({}); // Reset form data
  //     } else {
  //       // Failure case
  //       toast.error(response.data.message || "Failed to add item."); // Show error toast
  //     }
  //   } catch (error) {
  //     // Error case
  //     console.error(error.response?.data?.message || "Error submitting form");
  //     toast.error(error.response?.data?.message || "An error occurred. Please try again."); // Show error toast
  //   }
  // };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
  
    if (!formData || Object.keys(formData).length === 0) {
      toast.error("Please fill in the required fields.");
      return;
    }
  
    // Prepare the payload
    const payload = {
      ...formData, // Spread all existing formData fields
      IMst: Array.isArray(formData.IMst)
        ? formData.IMst.map((item, index) =>
            index === 0 ? { ...item, Doc_Path: selectedFile ? selectedFile.name : "" } : item
          )
        : [], // Ensure IMst remains an array and updates only the first item
    };
    
  
    try {
      const response = await addItem(payload); // Send the payload as JSON
  
      if (response.status) {
        toast.success(response.message || "Item added successfully!");
        fetchData();
        setModalOpen(false);
        setFormData({});
        setSelectedFile(null);
      } else {
        toast.error(response.data?.message || "Failed to add item.");
      }
    } catch (error) {
      console.error(error.response?.data?.message || "Error submitting form");
      toast.error(error.response?.data?.message || "An error occurred. Please try again.");
    }
  };
  
  return (
    <div className={`p-8 w-full lg:w-[calc(100vw-288px)] ml-0 lg:ml-[288px] text-black min-h-screen ${modalOpen ? "overflow-hidden h-screen" : "overflow-auto"}`}>
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
      <div className="bg-white p-8 rounded-lg shadow-lg space-y-8">
        <div className="flex justify-between items-center">
          <h4 className="text-2xl font-bold">Product Master</h4>
          <button
            onClick={handleAddClick}
            className="bg-blue-700 hover:bg-blue-800 hover:ring text-white rounded-md px-5 py-1 flex items-center"
          >
            <span className="text-2xl">+ </span> ADD
          </button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-[70vh]">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <Table headers={tableHeadersItemDetails} data={filteredDataItemDetails} />
        )}
      </div>
      {modalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50 ml-0 lg:ml-[288px] px-5">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-6xl overflow-auto max-h-[90vh] border-2 border-gray-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl">{isEdit ? "Edit Product Master" : "Add Product Master"}</h3>
              <button onClick={() => setModalOpen(false)} className="text-red-500 font-bold text-xl">X</button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-6 bg-white p-6 rounded-lg border-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  ["IName", "Item Name", "text", true],
                  ["IGroup", "Item Group", "text", true],
                  ["LocationId", "Location ID", "select", true, dropdownData.Location],
                  ["IDesc", "Item Description", "textarea", true],
                  ["TentativeDate", "Tentative Date", "date", false],
                  ["HSNCode", "HSN Code", "text", true],
                  ["Category", "Category", "text", true],
                  ["VendorCode", "Vendor Code", "text", true],
                  ["Size", "Size", "text", true],
                  ["Weight", "Weight", "number", true],
                  ["Status", "Status", "select", true, dropdownData.IStatus],
                  ["Price", "Price", "number", true],
                  ["Unit", "Unit", "select", true, dropdownData.IUnit],
                  ["MinStock", "Minimum Stock", "number", true],
                  ["IsMinStockAlert", "Minimum Stock Alert", "checkbox", false],
                  ["Doc_Path", "Document Path", "file", false],
                  ["SDesc", "Short Description", "textarea", false],
                  ["PDesc", "Product Description", "textarea", false],
                  ["Installation", "Installation", "number", false],
                  ["IsActive", "Is Active", "checkbox", false],
                ].map(([name, label, type, isRequired, options], index) => (
                  <div key={index} className={`flex items-center ${type === "textarea" ? "md:col-span-2" : ""}`}>
                    <label className={`text-gray-700 font-medium ${label === "Address" ? "lg:w-1/6" : ""} w-1/3 text-left`}>{label}</label>
                    {type === "select" ? (
                      <select
                        name={name}
                        value={formData.IMst[0][name] || ""}
                        onChange={(e) => handleInputChange(e)}
                        className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                        required={isRequired}
                      >
                        <option value="">Select {label}</option>
                        {options.map((option, idx) => (
                          <option key={idx} value={name === "LocationId" ? option.LocationCode : option.DocCode}>
                            {name === "LocationId" ? option.LocationName : option.CodeDesc}
                          </option>
                        ))}
                      </select>
                    ) : type === "textarea" ? (
                      <textarea
                        name={name}
                        value={formData.IMst[0][name] || ""}
                        onChange={(e) => handleInputChange(e)}
                        className="p-2 w-2/3 lg:w-5/6 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none resize-none"
                        rows="2"
                        required={isRequired}
                      />
                    ) : type === "checkbox" ? (
                      <input
                        type={type}
                        name={name}
                        checked={formData.IMst[0][name] || false}
                        onChange={(e) => handleInputChange(e)}
                        className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-gray-500"
                      />
                    ) : (
                      <input
                        type={type}
                        name={name}
                        value={type === "date" ? (formData.IMst[0][name] ? moment(formData.IMst[0][name]).format("YYYY-MM-DD") : "") : formData.IMst[0][name] || ""} // Replace null with empty string
                        onChange={(e) => type === "file" ? setSelectedFile(e.target.files[0]) : handleInputChange(e)}
                        className="p-2 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                        required={isRequired}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Location Details Table */}
              <h6 className='flex justify-center text-xl font-bold'>Location Details</h6>
              <div className="relative overflow-x-auto shadow-md sm:rounded-lg border">
                <table className="min-w-full text-sm text-center rtl:text-right text-gray-500 dark:text-gray-400 border border-gray-300">
                  <thead className="text-gray-700 uppercase bg-gray-200 border-b-2 border-gray-400 dark:bg-gray-700 dark:text-gray-400">
                    <tr className="border border-gray-300">
                      <th className="border border-gray-300 px-4 py-2">Location</th>
                      <th className="border border-gray-300 px-4 py-2">Rack</th>
                      <th className="border border-gray-300 px-4 py-2">MOQ_QTY</th>
                      <th className="border border-gray-300 px-4 py-2">OQ_QTY</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.rackDetails.LocData.map((loc, index) => (
                      <tr key={index} className="border border-gray-300">
                        <td className="border border-gray-300 px-4 py-2">{loc.LocationCode}</td>
                        <td className="border border-gray-300  py-2 text-end">
                          <input
                            name="Rack"
                            value={loc.Rack || ""}
                            onChange={(e) => handleInputChange(e, "rackDetails", index)}
                            className="mx-1 p-1 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none text-end"
                          />
                        </td>
                        <td className="border border-gray-300 text-end py-2">
                          <input
                            type='number'
                            name="Moq_Qty"
                            value={loc.Moq_Qty || ""}
                            onChange={(e) => handleInputChange(e, "rackDetails", index)}
                            className="mx-1 p-1 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none text-end"
                          />
                        </td>
                        <td className="border border-gray-300 text-end py-2">
                          <input
                            type='number'
                            name="Oq_Qty"
                            value={loc.Oq_Qty || ""}
                            onChange={(e) => handleInputChange(e, "rackDetails", index)}
                            className="mx-1 p-1 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none text-end"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Price Details Table */}
              <h6 className='flex justify-center text-xl font-bold'>Price Details</h6>
              <div className="relative overflow-x-auto shadow-md sm:rounded-lg border">
                <table className="min-w-full text-sm text-center rtl:text-right text-gray-500 dark:text-gray-400 border border-gray-300">
                  <thead className="text-gray-700 uppercase bg-gray-200 border-b-2 border-gray-400 dark:bg-gray-700 dark:text-gray-400">
                    <tr className="border border-gray-300">
                      <th className="border border-gray-300 px-4 py-2">SR No.</th>
                      <th className="border border-gray-300 px-4 py-2">Price Type</th>
                      <th className="border border-gray-300 px-4 py-2"><p>Price</p><p>Discount</p></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.IPriceDetail.PriceData.map((price, index) => (
                      <tr key={index} className="border border-gray-300 ">
                        <td className="border border-gray-300">
                          {index + 1}
                        </td>
                        <td className="border border-gray-300">
                          {`${price.DocCode}: ${price.CodeDesc}`}
                        </td>
                        <td className="border space-y-1 border-gray-300 text-end py-2">
                          <input
                            type='number'
                            name="Price"
                            value={price.Price || "0"}
                            onChange={(e) => handleInputChange(e, "IPriceDetail", index)}
                            className="p-1 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none text-end"
                          />
                          <input
                            type='number'
                            name="Discount"
                            value={price.Discount || "0"}
                            onChange={(e) => handleInputChange(e, "IPriceDetail", index)}
                            className="p-1 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none text-end"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tax Details Table */}
              <h6 className='flex justify-center text-xl font-bold'>Tax Details</h6>
              <div className="relative overflow-x-auto shadow-md sm:rounded-lg border">
                <table className="min-w-full text-sm text-center rtl:text-right text-gray-500 dark:text-gray-400 border border-gray-300">
                  <thead className="text-gray-700 uppercase bg-gray-200 border-b-2 border-gray-400 dark:bg-gray-700 dark:text-gray-400">
                    <tr className="border border-gray-300">
                      <th className="border border-gray-300 px-4 py-2">SR No.</th>
                      <th className="border border-gray-300 px-4 py-2">Tax Type</th>
                      <th className="border border-gray-300 px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.ITaxDetail.Taxdata.map((tax, index) => (
                      <tr key={index} className="border border-gray-300">
                        <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                        <td className="border border-gray-300 px-4 py-2">
                          {`${tax.DocCode}: ${tax.CodeDesc}`}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">

                          {tax.chgcode?.split("*/").map((item) => {
                            const parts = item.split("~");
                            const key = parts[0];
                            const label = parts[1];
                            const showInput = parts[2] === "Y";

                            return showInput && (
                              <div key={key} className='grid grid-cols-2'>
                                <input
                                  type='number'
                                  name={key}
                                  value={tax[key] || "0"}
                                  onChange={(e) => handleInputChange(e, "ITaxDetail", index)}
                                  className="p-1 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none text-end"
                                />
                                <span className="w-1/3 ps-2">{label}</span>
                              </div>
                            );
                          })}
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Image Details Table */}
              <h6 className='flex justify-center text-xl font-bold'>File Upload</h6>
              <div className="relative overflow-x-auto shadow-md sm:rounded-lg border">
                <table className="min-w-full text-sm text-center rtl:text-right text-gray-500 dark:text-gray-400 border border-gray-300">
                  <thead className="text-gray-700 uppercase bg-gray-200 border-b-2 border-gray-400 dark:bg-gray-700 dark:text-gray-400">
                    <tr className="border border-gray-300">
                      <th className="border border-gray-300 px-4 py-2">SR No</th>
                      <th className="border border-gray-300 px-4 py-2">File Upload</th>
                      <th className="border border-gray-300 px-4 py-2">Image</th>
                      <th className="border border-gray-300 px-4 py-2">Actions</th>
                    </tr>
                  </thead>


                  <tbody>
                    {(!formData.IImageData.Images || formData.IImageData.Images.length === 0) && (
                      <tr className="border border-gray-300">
                        <td className="border border-gray-300 px-4 py-2">1</td>
                        <td className="border border-gray-300 px-4 py-2">
                          <input
                            type="file"
                            name="ImageFile"
                            onChange={(e) => handleInputChange(e, "IImageData", 0)}
                            className="p-1 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <span>No image uploaded</span>
                        </td>
                      </tr>
                    )}

                    {formData.IImageData.Images?.map((image, index) => (
                      <tr key={index} className="border border-gray-300">
                        <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                        <td className="border border-gray-300 px-4 py-2">
                          <input
                            type="file"
                            name="ImageFile"
                            ref={(el) => (fileInputRefs.current[index] = el)}
                            onChange={(e) => handleInputChange(e, "IImageData", index)}
                            className="p-1 w-2/3 bg-gray-100 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {image.ImageFile ? (
                            <img
                              src={URL.createObjectURL(image.ImageFile)}
                              alt="Uploaded Image"
                              className="w-20 h-20 object-cover"
                            />
                          ) : (
                            <span>No image uploaded</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {formData.IImageData.Images.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  IImageData: {
                                    Images: prev.IImageData.Images.filter((_, i) => i !== index),
                                  },
                                }));
                                if (fileInputRefs.current[index]) {
                                  fileInputRefs.current[index].value = null;
                                }
                                toast.success("Image removed successfully!");
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
                      <td colSpan={4} className="px-4 py-2">
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              IImageData: {
                                Images: [
                                  ...(prev.IImageData.Images || []),
                                  { ImageName: "", ImageFile: null },
                                ],
                              },
                            }));
                             toast.success("New image row added successfully!");
                          }}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        >
                          + Add New
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between mt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
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
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductMaster;

